
import { IntegrationItem, ImplementationFeature, SLADefinition } from './types.ts';

export const CURRENCY = 'PLN';

export const SUPPORT_PRICES: Record<string, Record<string, number>> = {
  ELASTYCZNY: { MONTHLY: 50000, ANNUAL: 600000 },
  START_PLUS: { MONTHLY: 99900, ANNUAL: 1199800 },
  ROZSZERZONY: { MONTHLY: 246500, ANNUAL: 2958000 },
  PREMIUM: { MONTHLY: 739500, ANNUAL: 8874000 }
};

// HubSpot Product IDs Mapping Database
export const HS_PRODUCT_MAP = {
  modules: {
    crm: { monthly: "261059750115", yearly: "261066323176", perpetual: "261071363293" },
    aps: { monthly: "261059030236", yearly: "261067043057", perpetual: "261067043058" },
    mes_prod: { monthly: "261067043062", yearly: "261061189880", perpetual: "261068483788" },
    mes_real: { monthly: "261068483785", yearly: "261072083174", perpetual: "261072083176" },
    wms: { monthly: "261072083177", yearly: "261059750119", perpetual: "261059750120" },
    cmms: { monthly: "261067043059", yearly: "261058310356", perpetual: "261061190846" },
    admin: { monthly: "261059030234", yearly: "261058310355", perpetual: "261064070361" },
    integrator: { monthly: "261068483783", yearly: "261068483784", perpetual: "261060469998" },
  },
  implementation: { BASIC: "261061190849", PRO: "260831037668", PRO_MAX: "260831037669", extras: "261061910719" },
  care: { ELASTYCZNY: "261061189873", START_PLUS: "261061189881", ROZSZERZONY: "261064070362", PREMIUM: "261064070364", maintenance: "261059750121" }
};

export const INTEGRATION_CATALOG: IntegrationItem[] = [
  { id: 'rest_api', name: 'Dostęp REST API (możliwość połączenia z dowolnym systemem)', category: 'Inne', hasQuantity: false },
  { id: 'acc_wapro', name: 'Asseco Wapro', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_optima', name: 'Comarch ERP Optima', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_xl', name: 'Comarch ERP XL', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_enova', name: 'Enova', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_fakt', name: 'Fakturownia', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_bc', name: 'Microsoft Business Central', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_nav', name: 'Microsoft Navision / Dynamics', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_navireo', name: 'Navireo', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_raks', name: 'RAKS', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_sap', name: 'SAP BO', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_sub_gt', name: 'Subiekt GT', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_sub_nexo', name: 'Subiekt Nexo', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_sub_rew', name: 'Subiekt Nexo Rewizor', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_symfonia', name: 'Symfonia', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_wfirma', name: 'wFirma', category: 'Programy księgowe', hasQuantity: false },
  { id: 'acc_custom', name: 'Dedykowany system księgowy', category: 'Programy księgowe', hasQuantity: false },
  { id: 'ec_allegro', name: 'Allegro', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_apilo', name: 'Apilo', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_baselinker', name: 'Baselinker', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_custom_shop', name: 'Dedykowany sklep', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_hubspot', name: 'HubSpot', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_idosell', name: 'IAI IdoSell', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_livespace', name: 'LiveSpace', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_magento', name: 'Magento', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_prestashop', name: 'PrestaShop', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_salesforce', name: 'Salesforce', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_shoper', name: 'Shoper', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_shopify', name: 'Shopify', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_woocommerce', name: 'WooCommerce', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_zapier', name: 'Zapier', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'ec_custom_crm', name: 'Dedykowany CRM', category: 'E-commerce i CRM', hasQuantity: false },
  { id: 'm_arburg', name: 'Arburg', category: 'Maszyny', hasQuantity: true },
  { id: 'm_battenfeld', name: 'Battenfeld', category: 'Maszyny', hasQuantity: true },
  { id: 'm_brother', name: 'Brother', category: 'Maszyny', hasQuantity: true },
  { id: 'm_carlosalvi', name: 'Carlo Salvi', category: 'Maszyny', hasQuantity: true },
  { id: 'm_china', name: 'China', category: 'Maszyny', hasQuantity: true },
  { id: 'm_dmg', name: 'DMG', category: 'Maszyny', hasQuantity: true },
  { id: 'm_dn_solutions', name: 'DN Solutions', category: 'Maszyny', hasQuantity: true },
  { id: 'm_doosan', name: 'Doosan', category: 'Maszyny', hasQuantity: true },
  { id: 'm_emag', name: 'EMAG', category: 'Maszyny', hasQuantity: true },
  { id: 'm_engel', name: 'Engel', category: 'Maszyny', hasQuantity: true },
  { id: 'm_fanuc', name: 'Fanuc', category: 'Maszyny', hasQuantity: true },
  { id: 'm_haas', name: 'Haas', category: 'Maszyny', hasQuantity: true },
  { id: 'm_hanwha', name: 'Hanwha', category: 'Maszyny', hasQuantity: true },
  { id: 'm_heidenheim', name: 'Heidenhain', category: 'Maszyny', hasQuantity: true },
  { id: 'm_hermle', name: 'Hermle', category: 'Maszyny', hasQuantity: true },
  { id: 'm_hyundai', name: 'Hyundai', category: 'Maszyny', hasQuantity: true },
  { id: 'm_kia_hyundai', name: 'KIA – Hyundai', category: 'Maszyny', hasQuantity: true },
  { id: 'm_makino', name: 'MAKINO', category: 'Maszyny', hasQuantity: true },
  { id: 'm_mazak', name: 'Mazak', category: 'Maszyny', hasQuantity: true },
  { id: 'm_mitsubishi', name: 'Mitsubishi Electric', category: 'Maszyny', hasQuantity: true },
  { id: 'm_muratec', name: 'Muratec', category: 'Maszyny', hasQuantity: true },
  { id: 'm_okuma', name: 'Okuma', category: 'Maszyny', hasQuantity: true },
  { id: 'm_pazm', name: 'PAZM', category: 'Maszyny', hasQuantity: true },
  { id: 'm_sacma', name: 'SACMA', category: 'Maszyny', hasQuantity: true },
  { id: 'm_safan', name: 'Safan', category: 'Maszyny', hasQuantity: true },
  { id: 'm_siemens', name: 'Siemens', category: 'Maszyny', hasQuantity: true },
  { id: 'm_smec', name: 'Smec', category: 'Maszyny', hasQuantity: true },
  { id: 'm_tsugami', name: 'Tsugami', category: 'Maszyny', hasQuantity: true },
  { id: 'm_custom', name: 'Dedykowana maszyna', category: 'Maszyny', hasQuantity: true },
  { id: 'd_brother', name: 'Drukarki Brother', category: 'Urządzenia', hasQuantity: true },
  { id: 'd_zebra', name: 'Drukarki Zebra', category: 'Urządzenia', hasQuantity: true },
  { id: 'd_axis', name: 'Wagi Axis', category: 'Urządzenia', hasQuantity: true },
  { id: 'd_other_scale', name: 'Wagi Inne', category: 'Urządzenia', hasQuantity: true },
  { id: 'd_radwag', name: 'Wagi RadWag', category: 'Urządzenia', hasQuantity: true },
  { id: 'd_custom', name: 'Dedykowane urządzenia', category: 'Urządzenia', hasQuantity: true },
  { id: 'o_access_other', name: 'Budynkowy system wej/wyj Inny', category: 'Inne', hasQuantity: false },
  { id: 'o_access_roger', name: 'Budynkowy system wej/wyj Roger', category: 'Inne', hasQuantity: false },
  { id: 'o_access_satel', name: 'Budynkowy system wej/wyj Satel', category: 'Inne', hasQuantity: false },
  { id: 'o_looker', name: 'Google Looker', category: 'Inne', hasQuantity: false },
  { id: 'o_powerbi', name: 'Microsoft PowerBI', category: 'Inne', hasQuantity: false },
  { id: 'o_scada_other', name: 'SCADA Inna', category: 'Inne', hasQuantity: false },
  { id: 'o_scada_wonderware', name: 'SCADA Wonderware', category: 'Inne', hasQuantity: false },
  { id: 'o_custom', name: 'Dedykowany inny system', category: 'Inne', hasQuantity: false },
  { id: 'o_bi_other', name: 'BI Inny', category: 'Inne', hasQuantity: false },
];

export const LICENSE_BASE_SRP: Record<string, Record<string, number>> = {
  'CLOUD_MONTHLY': { crm: 4700, aps: 59200, mes_prod: 18900, mes_real: 4900, wms: 19700, cmms: 5700, admin: 79900, integrator: 29700 },
  'CLOUD_ANNUAL': { crm: 56400, aps: 710400, mes_prod: 226800, mes_real: 58800, wms: 236400, cmms: 68400, admin: 958800, integrator: 356400 },
  'PERPETUAL': { crm: 282000, aps: 3552000, mes_prod: 1134000, mes_real: 294000, wms: 1182000, cmms: 342000, admin: 4794000, integrator: 1782000 }
};

export const IMPLEMENTATION_FEATURES: ImplementationFeature[] = [
  {
    category: "Analiza i Strategia",
    features: [
      { id: "pre_analysis", label: "Analiza Przedwdrożeniowa", values: { BASIC: "Online (2h)", PRO: "U klienta (1 dzień)", PRO_MAX: "U klienta (3 dni)" } },
      { id: "documentation", label: "Dokumentacja Procesowa SOW", values: { BASIC: false, PRO: true, PRO_MAX: true } }
    ]
  },
  {
    category: "Konfiguracja i Dane",
    features: [
      { id: "db_import", label: "Import Bazy Danych", values: { BASIC: "Szablony Excel", PRO: "Asysta przy imporcie", PRO_MAX: "Pełna migracja SQL" } },
      { id: "integration_setup", label: "Konfiguracja Integracji", values: { BASIC: "Standard (1 system)", PRO: "Zaawansowana (do 3)", PRO_MAX: "Nielimitowana" } }
    ]
  }
];

export const SLA_DEFINITIONS: Record<string, SLADefinition> = {
  NONE: { id: "NONE", label: "BRAK", hours: "0", reactionTime: "N/A", manager: false, channels: [] },
  ELASTYCZNY: { id: "ELASTYCZNY", label: "Elastyczny", hours: "2h / m-c", reactionTime: "48h", manager: false, channels: ["E-mail", "Ticket System"] },
  START_PLUS: { id: "START_PLUS", label: "Start Plus", hours: "5h / m-c", reactionTime: "24h", manager: false, channels: ["E-mail", "Ticket System", "Telefon"] },
  ROZSZERZONY: { id: "ROZSZERZONY", label: "Rozszerzony", hours: "15h / m-c", reactionTime: "8h", manager: true, channels: ["E-mail", "Ticket System", "Telefon", "Jira Share"] },
  PREMIUM: { id: "PREMIUM", label: "Premium", hours: "Nielimitowane", reactionTime: "2h (Krytyczne)", manager: true, channels: ["E-mail", "Ticket System", "Telefon", "Jira Share", "Slack/Teams"] }
};
