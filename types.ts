
export enum AppTab {
  ROI = 'ROI',
  CONFIG = 'CONFIG',
  SCOPE = 'SCOPE',
  RESEARCH = 'RESEARCH', 
  LINE_ITEMS = 'LINE_ITEMS',
  SYNC = 'SYNC',
  SUMMARY = 'SUMMARY',
  DICTIONARIES = 'DICTIONARIES',
  SETTINGS = 'SETTINGS',
  LOGS = 'LOGS',
  PROFILE = 'PROFILE',
  AI_INTEGRATION = 'AI_INTEGRATION',
  CHAT = 'CHAT'
}

export type PermissionCode = 
  | 'ROI_ACCESS' | 'CONFIG_ACCESS' | 'SYNC_ACCESS' 
  | 'SYSTEM_LOGS_VIEW' | 'USER_MANAGEMENT' 
  | 'DICTIONARY_MANAGEMENT' | 'ADMIN_SETTINGS'
  | 'PROMPT_EDITOR' | 'EXPORT_DATA'
  | 'RESEARCH_ACCESS';

// --- RESEARCH & AI MODULE TYPES ---

export type AIProviderId = 'google' | 'openai' | 'perplexity' | 'anthropic' | 'grok';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  enabled: boolean;
  apiKey: string;
  model: string;
  status: 'IDLE' | 'TESTING' | 'CONNECTED' | 'ERROR';
  responseLanguage?: string;
  isActiveInResearch: boolean;
  isConductor: boolean;
  sortOrder: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  providerId?: AIProviderId;
  timestamp: number;
}

export interface MultiAiChatSession {
  query: string;
  responses: Record<string, { text: string; latency: number; status: 'loading' | 'success' | 'error' }>;
  history: ChatMessage[]; // Added history for linear chat
  activeProviderId: AIProviderId; // Currently selected provider for chat
  isStreaming: boolean;
}

export interface ConnectionNode {
  company: string;
  role: string;
  year?: string;
  active: boolean;
}

export interface PersonEntry {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  source?: string; // Skąd pochodzi informacja (np. LinkedIn, KRS, www)
  linkedinUrl?: string;
  bio?: string; // Krótka notatka/podsumowanie o osobie
  connections?: ConnectionNode[]; // Tablica powiązań kapitałowych/osobowych
}

export interface LeadProfile {
  companyName: string;
  nip: string;
  krs: string;
  regon: string;
  address: string;
  domain: string;
  industry: string;
  employees: string;
  revenue: string;
  foundationYear: string;
  description: string;
  productsServices: string;
  decisionMakerName: string;
  decisionMakerRole: string;
  decisionMakerLinkedin: string;
  email: string;
  phone: string;
  techStack: string;
  socialLinkedin: string;
  googleSheetLink: string;
  // New OSINT fields
  management: PersonEntry[];
  otherEmployees: PersonEntry[];
  enrichment: {
    gemini?: string;
    openai?: string;
    claude?: string;
    grok?: string;
    perplexity?: string;
  };
}

export interface RejestrReport {
  orgId: string;
  basic: {
    name: string;
    krs: string;
    nip: string;
    regon: string;
    address: string;
    website: string;
  };
  representation: { name: string; role: string }[];
  finances: { year: string; revenue: number; profit: number }[];
  condition: {
    rating: 'DOBRA' | 'ŚREDNIA' | 'RYZYKOWNA' | 'BRAK DANYCH';
    reasons: string[];
  };
}

export interface ResearchProviderResult {
  providerId: AIProviderId;
  timestamp: number;
  raw: string;
  json: Partial<LeadProfile>;
  friendly: string;
  sources: any[];
}

export interface ResearchState {
  searchQuery: string;
  searchStatus: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  agentStatus?: string; // New field to show which AI is working (e.g., "Perplexity Searching...", "Gemini Analyzing")
  profile: LeadProfile;
  rejestrData: RejestrReport | null;
  summaryResult: string;
  isOrchestrationEnabled: boolean;
  selectedManualProvider: AIProviderId;
  providerResults: Record<string, ResearchProviderResult>;
}

// --- CONFIGURATION & UI SHARED TYPES ---

export type HostingModel = 'CLOUD' | 'OWN_SERVER';
export type SubscriptionType = 'MONTHLY' | 'ANNUAL' | 'PERPETUAL';

export interface ExtraArrangement {
  id: string;
  text: string;
  amountGrosz: number;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  hasQuantity: boolean;
  meta?: any;
}

export interface ImplementationFeature {
  category: string;
  features: {
    id: string;
    label: string;
    values: Record<string, any>;
  }[];
}

export interface SLADefinition {
  id: string;
  label: string;
  hours: string;
  reactionTime: string;
  manager: boolean;
  channels: string[];
}

export interface DictionaryEntry {
  id: string;
  label: string;
  value: string;
  is_active: boolean;
  sort_order: number;
  meta?: any;
}

export interface Dictionaries {
  statuses: DictionaryEntry[];
  scheduleStatuses: DictionaryEntry[];
  integrations: DictionaryEntry[];
  modules: DictionaryEntry[];
  implementationPackages: DictionaryEntry[];
  supportPackages: DictionaryEntry[];
  globalParams: any;
}

export interface AuditLog {
  id: string;
  created_at: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  channel: string;
  login: string;
  user_id?: string;
  message: string;
  meta: any;
  ip: string;
  userAgent: string;
}

export interface AIPrompt {
  provider: 'gemini' | 'perplexity' | 'openai' | 'claude' | 'grok';
  promptText: string;
  version: number;
  isActive: boolean;
  lastUpdated?: string;
}

export interface SMTPConfig {
  id?: string; // Added ID for multiple identities
  label?: string; // Label for the identity (e.g. "Zarząd")
  isDefault?: boolean;
  host: string;
  port: number;
  username: string;
  password_secret: string;
  encryption: 'SSL_TLS' | 'STARTTLS' | 'NONE';
  footerHtml: string;
}

export interface IntegrationSettingsState {
  portalId?: string;
  token_secret?: string;
  webhookUrl?: string;
  isConnected: boolean;
  zapierToken?: string; // Added for user-specific zapier auth
}

export interface RejestrIoConfig {
  apiKey: string;
  baseUrl: string;
  useBearer: boolean;
  isConnected: boolean;
}

export interface SystemConfig {
  schemaVersion: string;
  allowManualOverrides: boolean;
  requireManagerApproval: boolean;
  globalSearchEnabled: boolean;
}

export interface GlobalSettings {
  version: string;
  lastUpdated: string;
  smtpIdentities: SMTPConfig[]; // Changed from single smtp object to array
  hubspot: IntegrationSettingsState;
  rejestrIo: RejestrIoConfig;
  zapier: IntegrationSettingsState;
  systemConfig: SystemConfig;
}

export interface UserSettings {
  employeesDefault: number;
  hourlyRateDefault: number;
  wastedMinutesDefault: number;
  inventoryOptPercentDefault: number;
  lostTurnoverPercentDefault: number;
  dayRateDefault: number;
  hourRateDefault: number;
  locale: 'PL' | 'EN';
  timezone: string;
  currency: 'PLN' | 'EUR' | 'USD';
}

export interface User {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP';
  status: 'active' | 'blocked' | 'invited';
  permissions: PermissionCode[];
  settings?: UserSettings;
  createdAt: string;
  lastLoginAt?: string;
  mustChangePassword?: boolean;
  avatar?: string; // New field for user avatar
  smtpConfig?: SMTPConfig; // New field for user-specific email config
}

export interface ROIInputs {
  employees: number;
  hourlyRate: number;
  minutesPerEmployee: number;
  workdaysInMonth: number;
  inventoryValue: number;
  inventoryOptPercent: number;
  annualTurnover: number;
  lostTurnoverPercent: number;
  providerCriteria: 'optimakers_spelnia' | 'analiza' | 'nie_spelnia';
  buyingCommittee: { id: string; name: string; position: string; status: 'green' | 'orange' | 'red' }[];
  schedule: { id: string; label: string; description: string; status: 'done' | 'in_progress' | 'ahead'; date: string }[];
  additionalNotes: string;
}

export interface ROIResults {
  dailyMinutesTotal: number;
  dailyWasteCost: number;
  monthlyWasteCost: number;
  quarterlyWasteCost: number;
  annualWasteCost: number;
  inventorySaving: number;
  lostTurnoverValue: number;
  totalAnnualImpact: number;
  paybackMonths: number;
}

export interface ConfigSelection { 
  selectedIntegrations: string[]; 
  integrationQuantities: Record<string, number>; 
  hostingModel: HostingModel; 
  subscriptionType: SubscriptionType; 
  licenseMultiplier: number; 
  licenseQuantities: Record<string, number>; 
  implementationPackage: string; 
  implementationMultiplier: number; 
  implementationNotes: string; 
  implementationExtrasAmount: number; 
  extraArrangements: ExtraArrangement[];
  supportPackage: string; 
  supportPeriod: 'MONTHLY' | 'ANNUAL'; 
  subscriptionYears: number;
}

export interface AIContent {
  emailSubject: string;
  emailBody: string;
  crmNote: string;
}
