
import { GoogleGenAI } from "@google/genai";
import { AIProviderId, AIProviderConfig, LeadProfile, ChatMessage } from "../types.ts";
import { useSalesStore } from "../store.ts";

class AIService {
  private getProviderConfig(providerId: AIProviderId): AIProviderConfig | undefined {
    return useSalesStore.getState().aiProviders.find(p => p.id === providerId);
  }

  // --- CORE GENERATION ---
  async generateText(providerId: AIProviderId, prompt: string, modelOverride?: string): Promise<string> {
    const config = this.getProviderConfig(providerId);
    
    // NOTE: In a real environment, we would use different clients for Perplexity/OpenAI.
    // Here we simulate Perplexity/Others using Gemini if they are enabled but act as a proxy logic.
    // Ideally, this calls the respective API endpoints.
    
    const apiKey = config?.apiKey || process.env.API_KEY; // Fallback for dev
    const model = modelOverride || config?.model || 'gemini-3-flash-preview';

    if (providerId === 'google') {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        return response.text || '';
    } 
    
    if (providerId === 'perplexity') {
        // Simulate Perplexity via Gemini for this demo environment OR call real API if we had fetch logic
        // We will assume "Simulation Mode" where Gemini acts as Perplexity with a specific system instruction.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: "You are acting as Perplexity AI (Sonar). You have access to real-time internet data. Be precise and factual."
            }
        });
        return response.text || '';
    }

    // Default Fallback
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || '';
  }

  // --- 1. SERCE SYSTEMU: Prompt Wyszukiwawczy ---
  async runWebResearch(query: string, providerId: AIProviderId, mode: 'fast' | 'deep', modelOverride?: string): Promise<{raw: string, json: Partial<LeadProfile>, friendly: string, sources: any[]}> {
    
    const prompt = `
      Jesteś analitykiem biznesowym. Research: "${query}".
      Zwróć dane w formacie JSON (bez Markdown). 
      Struktura JSON:
      {
        "identyfikacja": { "nazwa": "", "nip": "", "krs": "", "regon": "" },
        "kontakt": { "adres": "", "www": "", "email": "", "telefon": "" },
        "biznes": { "branza": "", "pracownicy": "", "rokZalozenia": "", "opis": "", "produkty": "" },
        "ludzie": [{ "imieNazwisko": "", "stanowisko": "", "linkedin": "" }],
        "tech": { "stack": "", "linkedinFirmowy": "" },
        "powiazania": [{ "osoba": "", "firma": "", "rola": "", "rok": "" }]
      }
      Jeśli nie masz danych, zostaw puste stringi.
      W polu "powiazania" wymień inne spółki w których zasiada zarząd (jeśli znajdziesz).
    `;

    try {
      const raw = await this.generateText(providerId, prompt, modelOverride);
      
      let json: Partial<LeadProfile> = {};
      
      try {
        // Oczyszczanie odpowiedzi z ```json ... ```
        const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        
        // Mapowanie zagnieżdżonego JSON na płaską strukturę aplikacji
        json = {
            companyName: parsed.identyfikacja?.nazwa,
            nip: parsed.identyfikacja?.nip,
            krs: parsed.identyfikacja?.krs,
            regon: parsed.identyfikacja?.regon,
            address: parsed.kontakt?.adres,
            domain: parsed.kontakt?.www,
            email: parsed.kontakt?.email,
            phone: parsed.kontakt?.telefon,
            industry: parsed.biznes?.branza,
            employees: parsed.biznes?.pracownicy,
            foundationYear: parsed.biznes?.rokZalozenia,
            description: parsed.biznes?.opis,
            productsServices: parsed.biznes?.produkty,
            
            // Pobieranie pierwszej osoby z tablicy jako decydenta
            decisionMakerName: parsed.ludzie?.[0]?.imieNazwisko,
            decisionMakerRole: parsed.ludzie?.[0]?.stanowisko,
            decisionMakerLinkedin: parsed.ludzie?.[0]?.linkedin,
            
            techStack: parsed.tech?.stack,
            socialLinkedin: parsed.tech?.linkedinFirmowy,

            // Mapowanie zarządu i powiązań
            management: parsed.ludzie?.map((p: any) => ({
                name: p.imieNazwisko,
                role: p.stanowisko,
                linkedinUrl: p.linkedin,
                connections: parsed.powiazania
                    ?.filter((c: any) => c.osoba === p.imieNazwisko)
                    .map((c: any) => ({ company: c.firma, role: c.rola, year: c.rok, active: true }))
            })) || []
        };
      } catch (e) {
        console.warn("Failed to parse JSON", e);
      }

      // Proste generowanie friendly text jeśli brak (w prawdziwym Perplexity byłby w 'citation')
      const friendly = raw.length > 500 ? "Dane zostały pobrane i przetworzone z formatu JSON." : raw;

      return { raw, json, friendly, sources: [] };

    } catch (e: any) {
        console.error("Research Error", e);
        throw e;
    }
  }

  // --- 3. KONFIGURACJA WZBOGACANIA DANYCH ---
  async runEnrichment(profile: LeadProfile, providerId: AIProviderId): Promise<Partial<LeadProfile>> {
    
    // 1. Wykrycie brakujących pól
    const missingFields = [];
    if (!profile.nip) missingFields.push("NIP");
    if (!profile.krs) missingFields.push("KRS");
    if (!profile.decisionMakerName) missingFields.push("OSOBA DECYZYJNA (CEO/PREZES)");
    if (!profile.revenue) missingFields.push("PRZYCHÓD ZA OSTATNI ROK");
    if (!profile.email) missingFields.push("EMAIL KONTAKTOWY");

    if (missingFields.length === 0) return {};

    // 2. Przygotowanie kontekstu
    const profileData = JSON.stringify({
        nazwa: profile.companyName,
        www: profile.domain,
        adres: profile.address,
        opis: profile.description
    });

    const prompt = `
Jako Ekspert Handlowy, przygotowałem uzupełnienie profilu oraz analizę unikalnych cech spółki {COMPANY}, które mogą być kluczowe w procesie ofertowania lub budowania relacji biznesowej.

### ZADANIE 1 (PRIORYTET): Dane finansowe i braki
W profilu brakuje następujących danych: {MISSING}.
Postaraj się je znaleźć lub oszacować na podstawie dostępnych źródeł.
Format: [POLE]: Wartość

### ZADANIE 2: Unikalne wnioski
Przeanalizuj kontekst i znajdź "haczyki" sprzedażowe.

KONTEKST:
${profileData}
`.replace('{COMPANY}', profile.companyName || 'Firmy')
 .replace('{MISSING}', missingFields.join(', '));

    const result = await this.generateText(providerId, prompt);

    // 5. Parsowanie wyników (Regex szuka wzorca [POLE]: Wartość)
    const updates: Partial<LeadProfile> = {};
    const regex = /\[(.*?)\]:\s*(.*)/g;
    let match;
    
    while ((match = regex.exec(result)) !== null) {
        const key = match[1].trim().toUpperCase();
        const value = match[2].trim();
        
        if (key.includes("NIP")) updates.nip = value;
        if (key.includes("KRS")) updates.krs = value;
        if (key.includes("OSOBA") || key.includes("CEO")) updates.decisionMakerName = value;
        if (key.includes("PRZYCHÓD") || key.includes("REVENUE")) updates.revenue = value;
        if (key.includes("EMAIL")) updates.email = value;
    }

    return updates;
  }

  // --- NEW: CHAT MODULE ---
  async runChat(providerId: AIProviderId, history: ChatMessage[], message: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Simulate Personas for other providers using Gemini
    let systemInstruction = "You are a helpful AI assistant.";
    
    if (providerId === 'openai') {
        systemInstruction = "You are GPT-4, a large language model trained by OpenAI. Answer concisely and professionally.";
    } else if (providerId === 'anthropic') {
        systemInstruction = "You are Claude, an AI assistant created by Anthropic. You are helpful, harmless, and honest. Your answers are detailed and well-structured.";
    } else if (providerId === 'grok') {
        systemInstruction = "You are Grok, an AI modeled after the Hitchhiker's Guide to the Galaxy. You have a rebellious streak and a sense of humor.";
    } else if (providerId === 'perplexity') {
        systemInstruction = "You are Perplexity (Sonar). You provide accurate, up-to-date information with a focus on facts and research.";
    } else {
        systemInstruction = "You are Gemini, a multimodal AI model from Google.";
    }

    // Construct history for context (simplified for single-turn mostly, but passing history string)
    const context = history.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const prompt = `${systemInstruction}\n\nCHAT HISTORY:\n${context}\n\nUSER: ${message}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text || "No response generated.";
    } catch (e: any) {
        console.error("Chat Error", e);
        return `Error interacting with ${providerId}: ${e.message}`;
    }
  }
}

export const aiService = new AIService();
