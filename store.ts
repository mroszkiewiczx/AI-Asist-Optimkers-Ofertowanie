
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ROIInputs, ROIResults, ConfigSelection, AppTab, User, 
  ResearchState, LeadProfile, AIContent,
  Dictionaries, AuditLog, AIPrompt, AIProviderConfig, MultiAiChatSession, ExtraArrangement, GlobalSettings, SMTPConfig
} from './types.ts';
import { INTEGRATION_CATALOG, SLA_DEFINITIONS, LICENSE_BASE_SRP, SUPPORT_PRICES, HS_PRODUCT_MAP } from './constants.ts';
import { auditService } from './services/auditService.ts';

interface SalesState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;

  // Global Settings & Audit
  settings: GlobalSettings;
  updateSettings: (data: Partial<GlobalSettings>) => void;
  
  // SMTP Actions
  addSmtpIdentity: () => void;
  updateSmtpIdentity: (id: string, data: Partial<SMTPConfig>) => void;
  removeSmtpIdentity: (id: string) => void;
  setSmtpDefault: (id: string) => void;

  updateSystemConfig: (data: Partial<GlobalSettings['systemConfig']>) => void;
  updateRejestrIo: (data: Partial<GlobalSettings['rejestrIo']>) => void;
  auditLogs: AuditLog[];
  refreshAuditLogs: () => void;

  // ROI & Config
  roiInputs: ROIInputs;
  roiResults: ROIResults;
  setRoiInputs: (inputs: Partial<ROIInputs>) => void;
  addCommitteeMember: () => void;
  updateCommitteeMember: (id: string, data: any) => void;
  removeCommitteeMember: (id: string) => void;
  updateScheduleStep: (id: string, data: any) => void;
  resetROI: () => void;

  config: ConfigSelection;
  setConfig: (config: Partial<ConfigSelection>) => void;
  addExtraArrangement: () => void;
  updateExtraArrangement: (id: string, data: Partial<ExtraArrangement>) => void;
  removeExtraArrangement: (id: string) => void;
  resetConfig: () => void;

  // AI INTEGRATIONS
  aiProviders: AIProviderConfig[];
  updateAiProvider: (id: string, data: Partial<AIProviderConfig>) => void;
  chatSession: MultiAiChatSession;
  setChatSession: (data: Partial<MultiAiChatSession>) => void;
  aiPrompts: AIPrompt[];
  saveAIPrompt: (prompt: AIPrompt) => void;

  // RESEARCH MODULE
  clientData: LeadProfile; 
  setClientData: (data: Partial<LeadProfile>) => void;
  research: ResearchState;
  setResearch: (data: Partial<ResearchState>) => void;
  updateProfile: (data: Partial<LeadProfile>) => void;
  
  // DICTIONARIES
  dictionaries: Dictionaries;
  updateDictionary: (key: keyof Dictionaries, data: any) => void;
  updateGlobalParam: (key: string, value: any) => void;

  // USERS & ADMIN
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  removeUser: (id: string) => void;
  updateCurrentUserPreferences: (data: any) => void;

  // Calculations
  calculateROI: () => void;
  getLicenseTotals: () => any;
  getImplementationTotal: () => number;
  getSupportPrice: () => number;
  getProjectCostTotal: () => number;
  getHubSpotLineItems: () => any[];
  getDealName: () => string;
  getValidationStatus: () => { isReady: boolean; errors: string[] };
}

const INITIAL_PROFILE: LeadProfile = { 
  companyName: '', nip: '', krs: '', regon: '', address: '', domain: '', 
  industry: '', employees: '', revenue: '', foundationYear: '', 
  description: '', productsServices: '', decisionMakerName: '', 
  decisionMakerRole: '', decisionMakerLinkedin: '', email: '', phone: '', 
  techStack: '', socialLinkedin: '', googleSheetLink: '', enrichment: {},
  management: [], otherEmployees: []
};

const DEFAULT_SCHEDULE = [
  { id: '1', label: 'Kick-off Projektu', description: 'Ustalenie zakresu odpowiedzialności, harmonogramu i kamieni milowych (RASCI).', status: 'ahead', date: '' },
  { id: '2', label: 'Analiza Przedwdrożeniowa', description: 'Mapowanie procesów AS-IS oraz projektowanie procesów TO-BE w systemie.', status: 'ahead', date: '' },
  { id: '3', label: 'Konfiguracja i Importy', description: 'Konfiguracja bazy danych, integracji oraz import danych z systemów zewnętrznych.', status: 'ahead', date: '' },
  { id: '4', label: 'Szkolenia OptiKurs', description: 'Certyfikowane szkolenia e-learningowe oraz warsztaty stacjonarne dla kluczowych użytkowników.', status: 'ahead', date: '' },
  { id: '5', label: 'Go-Live (Uruchomienie)', description: 'Start produkcyjny z asystą konsultanta na miejscu oraz stabilizacja pracy systemu.', status: 'ahead', date: '' },
];

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      activeTab: AppTab.ROI,
      setActiveTab: (tab) => set({ activeTab: tab }),
      currentUser: null,
      isAuthenticated: false,
      login: (user) => set({ currentUser: user, isAuthenticated: true }),
      logout: () => set({ currentUser: null, isAuthenticated: false }),

      settings: {
        version: '1.0.42',
        lastUpdated: new Date().toISOString(),
        smtpIdentities: [
          {
            id: 'default_smtp',
            label: 'Domyślna (Centrala)',
            isDefault: true,
            host: 'smtp.gmail.com',
            port: 587,
            username: 'sales@optimakers.pl',
            password_secret: '********',
            encryption: 'STARTTLS',
            footerHtml: '<p><b>Optimakers Sales Team</b></p>'
          }
        ],
        hubspot: {
          portalId: '1234567',
          token_secret: '',
          isConnected: true
        },
        rejestrIo: {
          apiKey: '',
          baseUrl: 'https://rejestr.io/api/v2',
          useBearer: true,
          isConnected: true
        },
        zapier: {
          webhookUrl: 'https://hooks.zapier.com/...',
          isConnected: false
        },
        systemConfig: {
          schemaVersion: '2.1.0',
          allowManualOverrides: false,
          requireManagerApproval: true,
          globalSearchEnabled: true
        }
      },
      updateSettings: (data) => set(state => ({ settings: { ...state.settings, ...data } })),
      
      addSmtpIdentity: () => set(state => ({
        settings: {
          ...state.settings,
          smtpIdentities: [...state.settings.smtpIdentities, {
            id: Math.random().toString(36).substr(2, 9),
            label: 'Nowa Skrzynka',
            isDefault: false,
            host: 'smtp.example.com',
            port: 587,
            username: '',
            password_secret: '',
            encryption: 'STARTTLS',
            footerHtml: '<p>Stopka...</p>'
          }]
        }
      })),
      updateSmtpIdentity: (id, data) => set(state => ({
        settings: {
          ...state.settings,
          smtpIdentities: state.settings.smtpIdentities.map(i => i.id === id ? { ...i, ...data } : i)
        }
      })),
      removeSmtpIdentity: (id) => set(state => ({
        settings: {
          ...state.settings,
          smtpIdentities: state.settings.smtpIdentities.filter(i => i.id !== id)
        }
      })),
      setSmtpDefault: (id) => set(state => ({
        settings: {
          ...state.settings,
          smtpIdentities: state.settings.smtpIdentities.map(i => ({ ...i, isDefault: i.id === id }))
        }
      })),

      updateSystemConfig: (data) => set(state => ({ settings: { ...state.settings, systemConfig: { ...state.settings.systemConfig, ...data } } })),
      updateRejestrIo: (data) => set(state => ({ settings: { ...state.settings, rejestrIo: { ...state.settings.rejestrIo, ...data } } })),
      auditLogs: [],
      refreshAuditLogs: () => set({ auditLogs: auditService.getLogs() }),

      aiProviders: [
        { id: 'perplexity', name: 'Perplexity', enabled: true, apiKey: 'pplx-xxxxxxxxxxxxxxxx', model: 'sonar', status: 'CONNECTED', responseLanguage: 'Polski (pl)', isActiveInResearch: true, isConductor: true, sortOrder: 0 },
        { id: 'google', name: 'Google Gemini', enabled: true, apiKey: '', model: 'gemini-3-flash-preview', status: 'CONNECTED', isActiveInResearch: true, isConductor: false, sortOrder: 1 },
        { id: 'openai', name: 'OpenAI (GPT)', enabled: true, apiKey: 'sk-proj-xxxxxxxxxxxxxxxx', model: 'gpt-5.2', status: 'CONNECTED', isActiveInResearch: true, isConductor: false, sortOrder: 2 },
        { id: 'anthropic', name: 'Anthropic (Claude)', enabled: true, apiKey: 'xkeys-xxxxxxxxxxxxxxxx', model: 'claude-3-5-sonnet-20240620', status: 'CONNECTED', isActiveInResearch: true, isConductor: false, sortOrder: 3 },
        { id: 'grok', name: 'Grok (xAI)', enabled: true, apiKey: '', model: 'grok-beta', status: 'CONNECTED', isActiveInResearch: false, isConductor: false, sortOrder: 4 },
      ],
      updateAiProvider: (id, data) => set(state => ({ aiProviders: state.aiProviders.map(p => p.id === id ? { ...p, ...data } : p) })),
      chatSession: { query: '', responses: {}, isStreaming: false, history: [], activeProviderId: 'google' },
      setChatSession: (data) => set(state => ({ chatSession: { ...state.chatSession, ...data } })),
      aiPrompts: [
        { provider: 'gemini', promptText: 'Jesteś analitykiem biznesowym...', version: 1, isActive: true, lastUpdated: new Date().toISOString() }
      ],
      saveAIPrompt: (prompt) => set(state => ({ 
        aiPrompts: state.aiPrompts.find(p => p.provider === prompt.provider) 
          ? state.aiPrompts.map(p => p.provider === prompt.provider ? { ...prompt, lastUpdated: new Date().toISOString() } : p)
          : [...state.aiPrompts, { ...prompt, lastUpdated: new Date().toISOString() }]
      })),

      roiInputs: {
        employees: 20, hourlyRate: 5000, minutesPerEmployee: 15, workdaysInMonth: 22,
        inventoryValue: 100000000, inventoryOptPercent: 10, annualTurnover: 1000000000, lostTurnoverPercent: 5,
        providerCriteria: 'analiza', buyingCommittee: [], schedule: [...DEFAULT_SCHEDULE], additionalNotes: ''
      },
      roiResults: { dailyMinutesTotal: 0, dailyWasteCost: 0, monthlyWasteCost: 0, quarterlyWasteCost: 0, annualWasteCost: 0, inventorySaving: 0, lostTurnoverValue: 0, totalAnnualImpact: 0, paybackMonths: 0 },
      setRoiInputs: (inputs) => { set(state => ({ roiInputs: { ...state.roiInputs, ...inputs } })); get().calculateROI(); },
      addCommitteeMember: () => set(state => ({ roiInputs: { ...state.roiInputs, buyingCommittee: [...state.roiInputs.buyingCommittee, { id: Math.random().toString(), name: '', position: '', status: 'orange' }] } })),
      updateCommitteeMember: (id, data) => set(state => ({ roiInputs: { ...state.roiInputs, buyingCommittee: state.roiInputs.buyingCommittee.map(m => m.id === id ? { ...m, ...data } : m) } })),
      removeCommitteeMember: (id) => set(state => ({ roiInputs: { ...state.roiInputs, buyingCommittee: state.roiInputs.buyingCommittee.filter(m => m.id !== id) } })),
      updateScheduleStep: (id, data) => set(state => ({ roiInputs: { ...state.roiInputs, schedule: state.roiInputs.schedule.map(s => s.id === id ? { ...s, ...data } : s) } })),
      resetROI: () => set({ roiInputs: { employees: 20, hourlyRate: 5000, minutesPerEmployee: 15, workdaysInMonth: 22, inventoryValue: 100000000, inventoryOptPercent: 10, annualTurnover: 1000000000, lostTurnoverPercent: 5, providerCriteria: 'analiza', buyingCommittee: [], schedule: [...DEFAULT_SCHEDULE], additionalNotes: '' } }),

      config: { 
        selectedIntegrations: [], integrationQuantities: {}, hostingModel: 'CLOUD', 
        subscriptionType: 'ANNUAL', licenseMultiplier: 1.0, licenseQuantities: {}, 
        implementationPackage: 'PRO', implementationMultiplier: 1.0, implementationNotes: '', 
        implementationExtrasAmount: 0, extraArrangements: [],
        supportPackage: 'ELASTYCZNY', supportPeriod: 'MONTHLY', subscriptionYears: 1
      },
      setConfig: (config) => set(state => ({ config: { ...state.config, ...config } })),
      addExtraArrangement: () => set(state => {
        if (state.config.extraArrangements.length >= 8) return state;
        return { config: { ...state.config, extraArrangements: [...state.config.extraArrangements, { id: Math.random().toString(), text: '', amountGrosz: 0 }] } };
      }),
      updateExtraArrangement: (id, data) => set(state => ({ config: { ...state.config, extraArrangements: state.config.extraArrangements.map(a => a.id === id ? { ...a, ...data } : a) } })),
      removeExtraArrangement: (id) => set(state => ({ config: { ...state.config, extraArrangements: state.config.extraArrangements.filter(a => a.id !== id) } })),
      resetConfig: () => set({ config: { selectedIntegrations: [], integrationQuantities: {}, hostingModel: 'CLOUD', subscriptionType: 'ANNUAL', licenseMultiplier: 1.0, licenseQuantities: {}, implementationPackage: 'PRO', implementationMultiplier: 1.0, implementationNotes: '', implementationExtrasAmount: 0, extraArrangements: [], supportPackage: 'ELASTYCZNY', supportPeriod: 'MONTHLY', subscriptionYears: 1 } }),

      clientData: { ...INITIAL_PROFILE },
      setClientData: (data) => set(state => ({ clientData: { ...state.clientData, ...data } })),
      research: {
        searchQuery: '', 
        searchStatus: 'IDLE', 
        profile: { ...INITIAL_PROFILE }, 
        rejestrData: null, 
        summaryResult: '',
        isOrchestrationEnabled: true,
        selectedManualProvider: 'google',
        providerResults: {}
      },
      setResearch: (data) => set(state => ({ research: { ...state.research, ...data } })),
      updateProfile: (data) => set(state => ({ research: { ...state.research, profile: { ...state.research.profile, ...data } } })),

      dictionaries: {
        statuses: [
          { id: 'optimakers_spelnia', label: 'Spełnia', value: 'green', is_active: true, sort_order: 1 },
          { id: 'analiza', label: 'W trakcie analizy', value: 'orange', is_active: true, sort_order: 2 },
          { id: 'nie_spelnia', label: 'Nie spełnia', value: 'red', is_active: true, sort_order: 3 }
        ],
        scheduleStatuses: [
          { id: 'done', label: 'Zakończone', value: 'green', is_active: true, sort_order: 1 },
          { id: 'in_progress', label: 'W trakcie', value: 'orange', is_active: true, sort_order: 2 },
          { id: 'ahead', label: 'Planowane', value: 'gray', is_active: true, sort_order: 3 }
        ],
        integrations: INTEGRATION_CATALOG.map(i => ({ id: i.id, label: i.name, value: i.id, is_active: true, sort_order: 1, meta: { category: i.category } })),
        modules: [
          { id: 'crm', label: 'CRM – Oferty, Zamówienia, Kalkulacje', value: 'crm', is_active: true, sort_order: 1 },
          { id: 'aps', label: 'APS - Planowanie produkcji', value: 'aps', is_active: true, sort_order: 2 },
          { id: 'mes_prod', label: 'MES Produkcja - Mistrz zmiany, Lider. Kierownik, brygadzista, technologowie, kontrola jakości. Projektowanie, raporty, rozliczenia', value: 'mes_prod', is_active: true, sort_order: 3 },
          { id: 'mes_real', label: 'MES - Realizacja produkcji (panel meldunkowy), KJ - Kontrola Jakości, RCP | Subskrypcja wieczysta', value: 'mes_real', is_active: true, sort_order: 4 },
          { id: 'wms', label: 'WMS - Zakupy, zaopatrzenie, magazyn, logistyka, spedycja, załadunki', value: 'wms', is_active: true, sort_order: 5 },
          { id: 'cmms', label: 'CMMS - Utrzymanie ruchu', value: 'cmms', is_active: true, sort_order: 6 },
          { id: 'admin', label: 'Administrator', value: 'admin', is_active: true, sort_order: 7 },
          { id: 'integrator', label: 'Integrator', value: 'integrator', is_active: true, sort_order: 8 }
        ],
        implementationPackages: [
          { id: 'BASIC', label: 'Szybki Plus', value: 'BASIC', is_active: true, sort_order: 1 },
          { id: 'PRO', label: 'Pro', value: 'PRO', is_active: true, sort_order: 2 },
          { id: 'PRO_MAX', label: 'Pro Max', value: 'PRO_MAX', is_active: true, sort_order: 3 }
        ],
        supportPackages: Object.values(SLA_DEFINITIONS).map(s => ({ id: s.id, label: s.label, value: s.id, is_active: true, sort_order: 1 })),
        globalParams: { workdays: 22, impl_day_price: 250000, srp_multiplier: 1.0, basePrices: {} }
      },
      updateDictionary: (key, data) => set(state => ({ dictionaries: { ...state.dictionaries, [key]: data } })),
      updateGlobalParam: (key, value) => set(state => ({ dictionaries: { ...state.dictionaries, globalParams: { ...state.dictionaries.globalParams, [key]: value } } })),

      calculateROI: () => {
        const { roiInputs } = get();
        const dailyMinutesTotal = (Number(roiInputs.employees) || 0) * (Number(roiInputs.minutesPerEmployee) || 0);
        const dailyWasteCost = Math.round((dailyMinutesTotal / 60) * (Number(roiInputs.hourlyRate) || 0));
        const monthlyWasteCost = dailyWasteCost * (Number(roiInputs.workdaysInMonth) || 22);
        const annualWasteCost = monthlyWasteCost * 12;
        const inventorySaving = Math.round((Number(roiInputs.inventoryValue) || 0) * ((Number(roiInputs.inventoryOptPercent) || 0) / 100));
        const lostTurnoverValue = Math.round((Number(roiInputs.annualTurnover) || 0) * ((Number(roiInputs.lostTurnoverPercent) || 0) / 100));
        const totalAnnualImpact = annualWasteCost + inventorySaving + lostTurnoverValue;
        set({ roiResults: { dailyMinutesTotal, dailyWasteCost, monthlyWasteCost, quarterlyWasteCost: monthlyWasteCost * 3, annualWasteCost, inventorySaving, lostTurnoverValue, totalAnnualImpact, paybackMonths: 6 }});
      },

      getLicenseTotals: () => {
        const { config } = get();
        const matrixKey = config.subscriptionType === 'PERPETUAL' ? 'PERPETUAL' : (config.subscriptionType === 'ANNUAL' ? 'CLOUD_ANNUAL' : 'CLOUD_MONTHLY');
        const matrix = LICENSE_BASE_SRP[matrixKey];
        
        let subtotal = 0;
        Object.entries(config.licenseQuantities).forEach(([id, qty]) => {
          const unitPrice = Number(matrix[id]) || 0;
          subtotal += Math.round(unitPrice * (Number(config.licenseMultiplier) || 1)) * (Number(qty) || 0);
        });
        const integratorUnitPrice = Number(matrix['integrator']) || 0;
        subtotal += Math.round(integratorUnitPrice * (Number(config.licenseMultiplier) || 1)) * (config.selectedIntegrations?.length || 0);

        const beforeDiscount = subtotal * (Number(config.subscriptionYears) || 1);
        let discountValue = 0;
        if (config.subscriptionType === 'ANNUAL') {
          discountValue = Math.round(beforeDiscount * 0.1666);
        }
        
        const afterDiscount = beforeDiscount - discountValue;
        const maintenance = config.subscriptionType === 'PERPETUAL' ? Math.round(afterDiscount * 0.18) : 0;

        return { subtotal, beforeDiscount, discountValue, afterDiscount, maintenance };
      },

      getImplementationTotal: () => {
        const { config } = get();
        const pkgPrices: Record<string, number> = { BASIC: 2499000, PRO: 6247500, PRO_MAX: 12495000 };
        const basePrice = pkgPrices[config.implementationPackage] || 0;
        // Apply implementation multiplier
        return Math.round(basePrice * (Number(config.implementationMultiplier) || 1.0));
      },

      getSupportPrice: () => {
        const { config } = get();
        const pkg = config.supportPackage;
        const period = config.supportPeriod;
        return SUPPORT_PRICES[pkg]?.[period] || 0;
      },

      getProjectCostTotal: () => {
        const lic = get().getLicenseTotals().afterDiscount;
        const impl = get().getImplementationTotal();
        const extraArrangements = get().config.extraArrangements.reduce((sum, item) => sum + (Number(item.amountGrosz) || 0), 0);
        return lic + impl + extraArrangements;
      },

      getHubSpotLineItems: () => {
        const { config, dictionaries, getLicenseTotals } = get();
        const licTotals = getLicenseTotals();
        const subKey = config.subscriptionType.toLowerCase() as any;
        const matrixKey = config.subscriptionType === 'PERPETUAL' ? 'PERPETUAL' : (config.subscriptionType === 'ANNUAL' ? 'CLOUD_ANNUAL' : 'CLOUD_MONTHLY');
        const matrix = LICENSE_BASE_SRP[matrixKey];

        const lineItems = [];

        // 1. Licenses
        Object.entries(config.licenseQuantities).forEach(([id, qty]) => {
          if (Number(qty) <= 0) return;
          const module = dictionaries.modules.find(m => m.id === id);
          lineItems.push({
            id: `lic_${id}`,
            productId: (HS_PRODUCT_MAP.modules as any)[id]?.[subKey] || 'TBD',
            name: module?.label || id,
            category: 'Licencja',
            quantity: Number(qty),
            unitPrice: Math.round((matrix[id] || 0) * config.licenseMultiplier),
            source: 'system'
          });
        });

        // 2. Integrator
        if (config.selectedIntegrations.length > 0) {
          lineItems.push({
            id: 'lic_integrator',
            productId: (HS_PRODUCT_MAP.modules as any).integrator?.[subKey] || 'TBD',
            name: 'Licencja Integrator',
            category: 'Licencja',
            quantity: config.selectedIntegrations.length,
            unitPrice: Math.round((matrix.integrator || 0) * config.licenseMultiplier),
            source: 'system'
          });
        }

        // 3. Implementation
        const implPkg = dictionaries.implementationPackages.find(p => p.id === config.implementationPackage);
        lineItems.push({
          id: 'impl_package',
          productId: (HS_PRODUCT_MAP.implementation as any)[config.implementationPackage] || 'TBD',
          name: `Wdrożenie: ${implPkg?.label || config.implementationPackage}`,
          category: 'Wdrożenie',
          quantity: 1,
          unitPrice: get().getImplementationTotal(),
          source: 'system'
        });

        // 4. Care / Support
        const supportPkg = dictionaries.supportPackages.find(p => p.id === config.supportPackage);
        lineItems.push({
          id: 'support_package',
          productId: (HS_PRODUCT_MAP.care as any)[config.supportPackage] || 'TBD',
          name: `Opieka: ${supportPkg?.label || config.supportPackage}`,
          category: 'Opieka',
          quantity: 1,
          unitPrice: get().getSupportPrice(),
          source: 'system'
        });

        // 5. Extra Arrangements
        config.extraArrangements.forEach(arr => {
          if (arr.amountGrosz > 0) {
            lineItems.push({
              id: arr.id,
              productId: HS_PRODUCT_MAP.implementation.extras,
              name: `Ustalenie: ${arr.text}`,
              category: 'Inne',
              quantity: 1,
              unitPrice: arr.amountGrosz,
              source: 'manual'
            });
          }
        });

        return lineItems;
      },
      getDealName: () => `OFERTA_${get().research?.profile?.companyName || 'NOWY_KLIENT'}`,
      getValidationStatus: () => ({ isReady: true, errors: [] }),

      users: [
        {
          id: 'u1', login: 'm.roszkiewicz', firstName: 'Mateusz', lastName: 'Roszkiewicz',
          email: 'mateusz.roszkiewicz@optimakers.pl', role: 'ADMIN', position: 'New Business Manager',
          status: 'active', permissions: ['ROI_ACCESS', 'CONFIG_ACCESS', 'SYNC_ACCESS', 'SYSTEM_LOGS_VIEW', 'USER_MANAGEMENT', 'ADMIN_SETTINGS', 'DICTIONARY_MANAGEMENT', 'PROMPT_EDITOR', 'EXPORT_DATA', 'RESEARCH_ACCESS'],
          createdAt: new Date().toISOString()
        }
      ],
      addUser: (user) => set(state => ({ users: [...state.users, { ...user, id: Math.random().toString() }] })),
      updateUser: (id, data) => set(state => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
      removeUser: (id) => set(state => ({ users: state.users.filter(u => u.id !== id) })),
      updateCurrentUserPreferences: (data) => set(state => ({ currentUser: state.currentUser ? { ...state.currentUser, ...data, settings: { ...state.currentUser.settings, ...data } } as User : null })),
    }),
    { name: 'optimakers-sales-suite-v8' }
  )
);
