
import { GoogleGenAI, Type } from "@google/genai";
// Fix: ClientData does not exist in types.ts, replaced with LeadProfile
import { ROIResults, ROIInputs, ConfigSelection, LeadProfile } from "../types.ts";

export const generateSalesContent = async (
  roi: ROIResults, 
  inputs: ROIInputs, 
  config: ConfigSelection, 
  client: LeadProfile
) => {
  // Always use a named parameter for apiKey and fetch exclusively from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const moduleList = Object.entries(config.licenseQuantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, _]) => id.toUpperCase())
    .join(", ");

  const prompt = `
    Jesteś asystentem handlowca w firmie Optimakers (systemy MES/APS).
    Twoim zadaniem jest przygotowanie komunikacji sprzedażowej.

    DANE KLIENTA:
    - Firma: ${client.companyName}
    - Branża: ${client.industry}
    - Osoba: ${client.decisionMakerName} (${client.decisionMakerRole})

    KONFIGURACJA:
    - Wybrane Moduły: ${moduleList}
    - Model: ${config.subscriptionType} (${config.hostingModel})
    - Liczba pracowników: ${inputs.employees}

    ROI (PLN NETTO):
    - Roczna strata (czas): ${(roi.annualWasteCost / 100).toLocaleString()} PLN
    - Roczna korzyść całkowita: ${(roi.totalAnnualImpact / 100).toLocaleString()} PLN
    - Zwrot z inwestycji (ROI): ${roi.paybackMonths} miesięcy

    ZADANIE:
    1. Napisz maila ofertowego podsumowującego spotkanie. Ton profesjonalny, partnerski. Skup się na psychologii unikania straty.
    2. Napisz krótką notatkę techniczną do CRM (podsumowanie techniczne dla zespołu wdrożeń).

    FORMAT ODPOWIEDZI (JSON):
    {
      "emailSubject": "Temat maila",
      "emailBody": "Treść maila (używaj akapitów)",
      "crmNote": "Zwięzła notatka do CRM"
    }
  `;

  try {
    // Calling generateContent directly with model name and prompt/config
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Recommended method is to configure a responseSchema for structured JSON output
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emailSubject: {
              type: Type.STRING,
              description: 'Temat maila.',
            },
            emailBody: {
              type: Type.STRING,
              description: 'Treść maila.',
            },
            crmNote: {
              type: Type.STRING,
              description: 'Notatka techniczna do CRM.',
            },
          },
          required: ["emailSubject", "emailBody", "crmNote"],
        }
      }
    });

    // The .text property returns the string output; it is not a method.
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Gemini Error:", err);
    throw new Error("Błąd podczas generowania treści AI.");
  }
};

export const generateSalesPitch = async (roi: ROIResults, inputs: ROIInputs) => {
  // Creating a fresh instance to ensure correct API key usage before the call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Jesteś ekspertem ds. sprzedaży systemów IT dla przemysłu (MES/APS).
    Przygotuj krótki, przekonujący argument sprzedażowy dla klienta na podstawie danych:
    - Liczba pracowników: ${inputs.employees}
    - Roczna strata z tytułu marnotrawstwa czasu: ${(roi.annualWasteCost / 100).toLocaleString()} PLN
    - Roczna strata z tytułu błędów/braków: ${(roi.lostTurnoverValue / 100).toLocaleString()} PLN
    - Łączna strata: ${(roi.totalAnnualImpact / 100).toLocaleString()} PLN

    Skup się na konkretach i psychologii unikania straty. Język polski, ton profesjonalny, maksymalnie 3 akapity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Property .text directly returns the extracted string output.
    return response.text || "Nie udało się wygenerować argumentacji.";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Nie udało się wygenerować argumentacji. Skup się na rocznej stracie rzędu " + (roi.totalAnnualImpact / 100).toLocaleString() + " PLN.";
  }
};
