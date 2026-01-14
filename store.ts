
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ROIInputs, ROIResults, ConfigSelection, AppTab, User, 
  ResearchState, LeadProfile, AIContent,
  Dictionaries, AuditLog, AIPrompt, AIProviderConfig, MultiAiChatSession
} from './types.ts';
import { INTEGRATION_CATALOG, SLA_DEFINITIONS } from './constants.ts';

interface SalesState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;

  // ROI & Config
  roiInputs: ROIInputs;
  roiResults: ROIResults;
  setRoiInputs: (inputs: Partial<ROIInputs>) => void;
  resetROI: () => void;
  config: ConfigSelection;
  setConfig: (config: Partial<ConfigSelection>) => void;
  resetConfig: () => void;

  // AI INTEGRATIONS (NEW)
  aiProviders: AIProviderConfig[];
  updateAiProvider: (id: string, data: Partial<AIProviderConfig>) => void;
  chatSession: MultiAiChatSession;
  setChatSession: (data: Partial<MultiAiChatSession>) => void;

  // RESEARCH MODULE & COMPATIBILITY
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
  techStack: '', socialLinkedin: '', googleSheetLink: '', enrichment: {} 
};

const INITIAL_AI_PROVIDERS: AIProviderConfig[] = [
  { id: 'google', name: 'Google Gemini', enabled: true, apiKey: '', model: 'gemini-3-flash-preview', status: 'IDLE' },
  { id: 'openai', name: 'OpenAI GPT-4', enabled: false, apiKey: '', model: 'gpt-4o', status: 'IDLE' },
  { id: 'perplexity', name: 'Perplexity AI', enabled: false, apiKey: '', model: 'sonar-reasoning', status: 'IDLE' },
  { id: 'anthropic', name: 'Anthropic Claude', enabled: false, apiKey: '', model: 'claude-3-5-sonnet', status: 'IDLE' },
  { id: 'grok', name: 'xAI Grok', enabled: false, apiKey: '', model: 'grok-beta', status: 'IDLE' },
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

      // AI INTEGRATIONS
      aiProviders: INITIAL_AI_PROVIDERS,
      updateAiProvider: (id, data) => set(state => ({ aiProviders: state.aiProviders.map(p => p.id === id ? { ...p, ...data } : p) })),
      chatSession: { query: '', responses: {}, isStreaming: false },
      setChatSession: (data) => set(state => ({ chatSession: { ...state.chatSession, ...data } })),

      // ROI
      roiInputs: {
        employees: 20, hourlyRate: 5000, minutesPerEmployee: 15, workdaysInMonth: 22,
        inventoryValue: 0, inventoryOptPercent: 10, annualTurnover: 0, lostTurnoverPercent: 5,
        providerCriteria: 'analiza', buyingCommittee: [], schedule: [], additionalNotes: ''
      },
      roiResults: { dailyMinutesTotal: 0, dailyWasteCost: 0, monthlyWasteCost: 0, quarterlyWasteCost: 0, annualWasteCost: 0, inventorySaving: 0, lostTurnoverValue: 0, totalAnnualImpact: 0, paybackMonths: 0 },
      setRoiInputs: (inputs) => { set(state => ({ roiInputs: { ...state.roiInputs, ...inputs } })); get().calculateROI(); },
      resetROI: () => set({ roiInputs: { employees: 20, hourlyRate: 5000, minutesPerEmployee: 15, workdaysInMonth: 22, inventoryValue: 0, inventoryOptPercent: 10, annualTurnover: 0, lostTurnoverPercent: 5, providerCriteria: 'analiza', buyingCommittee: [], schedule: [], additionalNotes: '' } }),

      // CONFIG
      config: { 
        selectedIntegrations: [], integrationQuantities: {}, hostingModel: 'CLOUD', 
        subscriptionType: 'ANNUAL', licenseMultiplier: 1.0, licenseQuantities: {}, 
        implementationPackage: 'PRO', implementationMultiplier: 1.0, implementationNotes: '', 
        implementationExtrasAmount: 0, supportPackage: 'ELASTYCZNY', supportPeriod: 'MONTHLY', subscriptionYears: 1
      },
      setConfig: (config) => set(state => ({ config: { ...state.config, ...config } })),
      resetConfig: () => set({ config: { selectedIntegrations: [], integrationQuantities: {}, hostingModel: 'CLOUD', subscriptionType: 'ANNUAL', licenseMultiplier: 1.0, licenseQuantities: {}, implementationPackage: 'PRO', implementationMultiplier: 1.0, implementationNotes: '', implementationExtrasAmount: 0, supportPackage: 'ELASTYCZNY', supportPeriod: 'MONTHLY', subscriptionYears: 1 } }),

      // RESEARCH & CLIENT DATA (SYNCED)
      clientData: { ...INITIAL_PROFILE },
      setClientData: (data) => set(state => {
        const newProfile = { ...state.clientData, ...data };
        return { 
          clientData: newProfile,
          research: { ...state.research, profile: newProfile }
        };
      }),
      research: {
        searchQuery: '',
        searchStatus: 'IDLE',
        profile: { ...INITIAL_PROFILE },
        rejestrData: null,
        summaryResult: ''
      },
      setResearch: (data) => set(state => ({ research: { ...state.research, ...data } })),
      updateProfile: (data) => set(state => {
        const newProfile = { ...(state.research?.profile || INITIAL_PROFILE), ...data };
        return { 
          research: { ...state.research, profile: newProfile },
          clientData: newProfile
        };
      }),

      // DICTIONARIES
      dictionaries: {
        statuses: [{ id: 'optimakers_spelnia', label: 'Spełnia', value: 'green', is_active: true, sort_order: 1 }, { id: 'analiza', label: 'W trakcie analizy', value: 'orange', is_active: true, sort_order: 2 }, { id: 'nie_spelnia', label: 'Nie spełnia', value: 'red', is_active: true, sort_order: 3 }],
        scheduleStatuses: [{ id: 'done', label: 'Zakończone', value: 'green', is_active: true, sort_order: 1 }, { id: 'in_progress', label: 'W trakcie', value: 'orange', is_active: true, sort_order: 2 }, { id: 'ahead', label: 'Planowane', value: 'gray', is_active: true, sort_order: 3 }],
        integrations: INTEGRATION_CATALOG.map(i => ({ id: i.id, label: i.name, value: i.id, is_active: true, sort_order: 1, meta: { category: i.category } })),
        modules: [{ id: 'crm', label: 'CRM & Kalkulacje', value: 'crm', is_active: true, sort_order: 1 }, { id: 'aps', label: 'APS (Planowanie)', value: 'aps', is_active: true, sort_order: 2 }, { id: 'mes_prod', label: 'MES Produkcja', value: 'mes_prod', is_active: true, sort_order: 3 }, { id: 'mes_real', label: 'MES Realizacja', value: 'mes_real', is_active: true, sort_order: 4 }, { id: 'wms', label: 'WMS Magazyn', value: 'wms', is_active: true, sort_order: 5 }, { id: 'cmms', label: 'CMMS Utrzymanie', value: 'cmms', is_active: true, sort_order: 6 }, { id: 'admin', label: 'Admin Panel', value: 'admin', is_active: true, sort_order: 7 }, { id: 'integrator', label: 'Integrator API', value: 'integrator', is_active: true, sort_order: 8 }],
        implementationPackages: [{ id: 'BASIC', label: 'Szybki Plus', value: 'BASIC', is_active: true, sort_order: 1 }, { id: 'PRO', label: 'Pro (Standard)', value: 'PRO', is_active: true, sort_order: 2 }, { id: 'PRO_MAX', label: 'Pro Max (Enterprise)', value: 'PRO_MAX', is_active: true, sort_order: 3 }],
        supportPackages: Object.values(SLA_DEFINITIONS).map(s => ({ id: s.id, label: s.label, value: s.id, is_active: true, sort_order: 1 })),
        globalParams: { workdays: 22, impl_day_price: 250000, srp_multiplier: 1.0, basePrices: {} }
      },
      updateDictionary: (key, data) => set(state => ({ dictionaries: { ...state.dictionaries, [key]: data } })),
      updateGlobalParam: (key, value) => set(state => ({ dictionaries: { ...state.dictionaries, globalParams: { ...state.dictionaries.globalParams, [key]: value } } })),

      // USERS
      users: [],
      addUser: (user) => set(state => ({ users: [...state.users, { ...user, id: Math.random().toString() }] })),
      updateUser: (id, data) => set(state => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
      updateCurrentUserPreferences: (data) => set(state => ({ currentUser: state.currentUser ? { ...state.currentUser, settings: { ...state.currentUser.settings, ...data } } as User : null })),

      calculateROI: () => {
        const { roiInputs } = get();
        const dailyMinutesTotal = (roiInputs.employees || 0) * (roiInputs.minutesPerEmployee || 0);
        const dailyWasteCost = Math.round((dailyMinutesTotal / 60) * (roiInputs.hourlyRate || 0));
        const monthlyWasteCost = dailyWasteCost * (roiInputs.workdaysInMonth || 22);
        const annualWasteCost = monthlyWasteCost * 12;
        const inventorySaving = Math.round((roiInputs.inventoryValue || 0) * ((roiInputs.inventoryOptPercent || 0) / 100));
        const lostTurnoverValue = Math.round((roiInputs.annualTurnover || 0) * ((roiInputs.lostTurnoverPercent || 0) / 100));
        const totalAnnualImpact = annualWasteCost + inventorySaving + lostTurnoverValue;
        set({ roiResults: { dailyMinutesTotal, dailyWasteCost, monthlyWasteCost, quarterlyWasteCost: monthlyWasteCost * 3, annualWasteCost, inventorySaving, lostTurnoverValue, totalAnnualImpact, paybackMonths: 6 }});
      },

      getLicenseTotals: () => ({ subtotal: 0, beforeDiscount: 0, discountValue: 0, afterDiscount: 0, maintenance: 0 }),
      getImplementationTotal: () => 0,
      getSupportPrice: () => 0,
      getProjectCostTotal: () => 0,
      getHubSpotLineItems: () => [],
      getDealName: () => `OFERTA_${get().research?.profile?.companyName || 'NOWY_KLIENT'}`,
      getValidationStatus: () => ({ isReady: true, errors: [] })
    }),
    { name: 'optimakers-sales-suite-v6' } // Zmieniono wersję na v6
  )
);
