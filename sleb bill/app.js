/**
 * Sri Lakshmi e Bikes - Complete ERP & Service Center Suite
 * Pure Client-Side State Management (LocalStorage)
 */

window.isInitializing = true;

// --- Global App State Cache ---
let state = {
  dealership: {},
  inventory: [],
  purchases: [],
  transactions: [],
  spares: [],                      // Spares parts inventory stock
  services: [],                    // Odometer service registry
  warrantyAgreements: [],          // Persistent customer warranty contracts
  quotations: [],                  // Persistent customer vehicle quotations
  
  // Billing UI states
  currentBillingCategory: 'bike',  // 'bike' | 'spares'
  currentDocMode: 'invoice',       // 'invoice' | 'quotation'
  currentTaxMode: 'intrastate',    // 'intrastate' | 'interstate'
  overrideTotalEnabled: false,     // Toggle grand total custom override
  overrideTotalValue: 0,
  
  billingSparesList: [],           // Spares added to current bill
  serviceSparesList: [],           // Spares added to current service card
  quotationSparesList: [],         // Active draft quotation vehicle rows
  
  loadedTransaction: null,         // Active print document
  currentWarrantyTabMode: 'creator', // Active warranty tab workspace mode: 'creator' | 'history'
  currentQuotationTabMode: 'creator', // Active quotation tab workspace mode: 'creator' | 'history'
  quotationModels: []              // Persistent quotation models catalog
};

// --- Mock Seed Databases ---

const DEFAULT_DEALERSHIP = {
  brandName: 'ADMS e BIKES',
  legalName: 'SRI LAKSHMI e BIKES',
  address1: 'GROUND TS NO 2/ 2A1 ,',
  address2: 'TIRUPATHUR DISTRICT, TAMILNADU-635751',
  phone: '9944659264',
  gstin: '33AMGPV7681L2Z9',
  bankHolder: 'SRI LAKSHMI E BIKES',
  bankCustId: '8337045',
  bankName: 'CITY UNION BANK',
  bankBranch: 'VANIYAMBADI',
  bankAcc: '510909010379967',
  bankIfsc: 'CIUB0000489',
  tc1: 'Ours responsibility ceases onces the goods leave our showroom.',
  tc2: 'Goods once sold will not be accepted back under any circumstances.'
};

const SEED_PURCHASES = [
  {
    billNo: 'ADMS-PUR-2026-0081',
    date: '2026-04-01',
    supplier: 'ADMS Motors India Pvt Ltd',
    model: 'RIDER WHITE(60V 26AH)',
    chassis: 'R6VA0130OSL170009',
    motor: 'GEMLDM20251010066',
    battery: 'BOBF75835',
    charger: 'BOBF75835-CH',
    hsn: '871190',
    costPrice: 38000.00,
    sellingPrice: 44761.90
  },
  {
    billNo: 'ADMS-PUR-2026-0082',
    date: '2026-04-05',
    supplier: 'ADMS Motors India Pvt Ltd',
    model: 'RIDER RED(60V 30AH)',
    chassis: 'R6VA0130OSL170020',
    motor: 'GEMLDM20251010077',
    battery: 'BOBF75842',
    charger: 'BOBF75842-CH',
    hsn: '871190',
    costPrice: 40000.00,
    sellingPrice: 46990.00
  },
  {
    billNo: 'ADMS-PUR-2026-0083',
    date: '2026-04-10',
    supplier: 'ADMS Motors India Pvt Ltd',
    model: 'SPORT BLUE(72V 32AH)',
    chassis: 'R6VA0130OSL170055',
    motor: 'GEMLDM20251212099',
    battery: 'BOBF75910',
    charger: 'BOBF75910-CH',
    hsn: '871190',
    costPrice: 45000.00,
    sellingPrice: 52380.95
  }
];

const SEED_SPARES = [
  {
    sku: 'SL-BS-001',
    name: 'Brake Shoe Set',
    hsn: '871410',
    costPrice: 180.00,
    sellingPrice: 280.00,
    qty: 15,
    minLevel: 5
  },
  {
    sku: 'SL-TH-002',
    name: 'Throttle Assembly (Accelerator)',
    hsn: '871410',
    costPrice: 320.00,
    sellingPrice: 520.00,
    qty: 7,
    minLevel: 3
  },
  {
    sku: 'SL-CH-003',
    name: 'Lithium Smart Charger 60V 4A',
    hsn: '850440',
    costPrice: 1400.00,
    sellingPrice: 2200.00,
    qty: 4,
    minLevel: 2
  },
  {
    sku: 'SL-BT-004',
    name: 'LED Digital Speedometer Panel',
    hsn: '871410',
    costPrice: 450.00,
    sellingPrice: 750.00,
    qty: 1, // Will trigger a dynamic low-stock alert since 1 <= 3!
    minLevel: 3
  }
];

const SEED_SERVICES = [
  {
    id: 'SL-SER-1001',
    invoiceNo: '18',
    chassis: 'R6VA0130OSL170009',
    custName: 'PRABHU EBikes',
    date: '2026-05-10',
    serviceCount: '1st Service',
    odometer: 1050,
    spares: [{ sku: 'SL-BS-001', name: 'Brake Shoe Set', qty: 1, rate: 280.00, amount: 280.00 }],
    sparesCost: 280.00,
    laborCharges: 350.00,
    totalBill: 630.00
  }
];

// Seed exact photo transaction record
const SEED_TRANSACTIONS = [
  {
    id: '18',
    docType: 'invoice',
    taxMode: 'intrastate',
    date: '10-04-26',
    paymentType: 'CASH',
    refNo: 'NON REG',
    billCategory: 'bike',
    customer: {
      name: 'PRABHU EBikes',
      phone: '9441008620',
      address: '1A1-1025,VELKUR,\nVELKUR GRAM PANCHAYATH,\nGANGADHARA NELLORE,\nCHITTOOR, CHITTOOR DISTRICT,\nANDHRA PRADESH-517125',
      gstin: '37AGUPJ6908J1ZP'
    },
    vehicle: {
      model: 'RIDER WHITE(60V 26AH)',
      chassis: 'R6VA0130OSL170009',
      motor: 'GEMLDM20251010066',
      battery: 'BOBF75835',
      charger: 'BOBF75835-CH',
      hsn: '871190',
      basePrice: 44761.90,
      costPrice: 38000.00
    },
    financials: {
      base: 44761.90,
      cgst: 1119.05,
      sgst: 1119.05,
      igst: 0.00,
      total: 47000.00,
      paid: 47000.00,
      balance: 0.00
    }
  }
];

const SEED_QUOTATIONS = [
  {
    id: 'ADMS-QT-2026-0001',
    date: '2026-04-12',
    taxMode: 'intrastate',
    customer: {
      name: 'Venkatesh Prasad',
      phone: '9845012399',
      address: 'No 45, Gandhi Nagar, Tirupathur'
    },
    items: [
      {
        modelName: 'RIDER WHITE(60V 26AH)',
        qty: 1,
        rate: 44761.90,
        gstPct: 5,
        cgst: 1119.05,
        sgst: 1119.05,
        igst: 0,
        total: 47000.00
      }
    ],
    financials: {
      base: 44761.90,
      cgst: 1119.05,
      sgst: 1119.05,
      igst: 0,
      total: 47000.00
    }
  }
];

// --- Initialize App ---
window.onload = function() {
  initERPApp();
  // Server connectivity check & auto-redirect guide
  try { checkServerConnectionAndGuide(); } catch(e) {}
  // Sync from server backup (async - restores data if server has newer copy)
  // Do NOT push backup on startup before sync completes - that would overwrite real data
  try { syncWithServerBackup(); } catch(e) {}
};

// Add automatic background backup save hook when closing/leaving the website
window.addEventListener('beforeunload', function() {
  try { triggerBackgroundBackup(); } catch (e) {}
});

function initERPApp() {
  // 0. Load custom field definitions
  try { loadCustomFields(); } catch(e) { console.error('loadCustomFields failed', e); }

  // 1. Dealership Settings Load
  try {
    const storedDealership = localStorage.getItem('sleb_dealership');
    if (storedDealership) {
      state.dealership = JSON.parse(storedDealership) || { ...DEFAULT_DEALERSHIP };
    } else {
      state.dealership = { ...DEFAULT_DEALERSHIP };
      saveDealershipToStorage();
    }
  } catch (e) {
    console.error("Dealership load failed, healing...", e);
    state.dealership = { ...DEFAULT_DEALERSHIP };
    saveDealershipToStorage();
  }

  // 2. Purchases Load
  try {
    const storedPurchases = localStorage.getItem('sleb_purchases');
    if (storedPurchases) {
      state.purchases = JSON.parse(storedPurchases) || [];
    } else {
      state.purchases = [...SEED_PURCHASES];
      savePurchasesToStorage();
    }
  } catch (e) {
    console.error("Purchases load failed, healing...", e);
    state.purchases = [...SEED_PURCHASES];
    savePurchasesToStorage();
  }

  // 3. Inventory Stock Load
  try {
    const storedInventory = localStorage.getItem('sleb_inventory');
    if (storedInventory) {
      state.inventory = JSON.parse(storedInventory) || [];
    } else {
      state.inventory = [];
    }
  } catch (e) {
    console.error("Inventory load failed, healing...", e);
    state.inventory = [];
  }

  // 4. Sales Transactions Load
  try {
    const storedTransactions = localStorage.getItem('sleb_transactions');
    if (storedTransactions) {
      state.transactions = JSON.parse(storedTransactions) || [];
    } else {
      state.transactions = [...SEED_TRANSACTIONS];
      saveTransactionsToStorage();
    }
  } catch (e) {
    console.error("Transactions load failed, healing...", e);
    state.transactions = [...SEED_TRANSACTIONS];
    saveTransactionsToStorage();
  }

  // 5. Spares Load
  try {
    const storedSpares = localStorage.getItem('sleb_spares');
    if (storedSpares) {
      state.spares = JSON.parse(storedSpares) || [];
    } else {
      state.spares = [...SEED_SPARES];
      saveSparesToStorage();
    }
  } catch (e) {
    console.error("Spares load failed, healing...", e);
    state.spares = [...SEED_SPARES];
    saveSparesToStorage();
  }

  // 6. Services Load
  try {
    const storedServices = localStorage.getItem('sleb_services');
    if (storedServices) {
      state.services = JSON.parse(storedServices) || [];
    } else {
      state.services = [...SEED_SERVICES];
      saveServicesToStorage();
    }
  } catch (e) {
    console.error("Services load failed, healing...", e);
    state.services = [...SEED_SERVICES];
    saveServicesToStorage();
  }

  // 7. Warranty Agreements Load
  try {
    const storedWarranty = localStorage.getItem('sleb_warranty_agreements');
    if (storedWarranty) {
      state.warrantyAgreements = JSON.parse(storedWarranty) || [];
    } else {
      state.warrantyAgreements = [];
    }
  } catch (e) {
    console.error("Warranty load failed, healing...", e);
    state.warrantyAgreements = [];
  }

  // 8. Quotations Load
  try {
    const storedQuotations = localStorage.getItem('sleb_quotations');
    if (storedQuotations) {
      state.quotations = JSON.parse(storedQuotations) || [];
    } else {
      state.quotations = [...SEED_QUOTATIONS];
      saveQuotationsToStorage();
    }
  } catch (e) {
    console.error("Quotations load failed, healing...", e);
    state.quotations = [...SEED_QUOTATIONS];
    saveQuotationsToStorage();
  }

  // 8.5. Migrate old standalone quotations into central transactions database
  try {
    const hasQuotesInTxs = state.transactions.some(t => t && t.docType === 'quotation');
    if (!hasQuotesInTxs && state.quotations && state.quotations.length > 0) {
      console.log('Migrating historical quotations to central transactions database...');
      state.quotations.forEach(q => {
        const exists = state.transactions.some(t => t && t.id === q.id);
        if (!exists) {
          state.transactions.push({
            id: q.id,
            docType: 'quotation',
            taxMode: q.taxMode || 'intrastate',
            date: q.date || (typeof getCurrentDateString === 'function' ? getCurrentDateString() : new Date().toISOString().split('T')[0]),
            paymentType: 'CASH',
            refNo: 'NON REG',
            billCategory: 'bike',
            customer: q.customer || { name: 'Anonymous', phone: '0000000000', address: 'N/A' },
            vehicle: {
              model: q.items && q.items[0] ? q.items[0].modelName : 'ADMS RIDER',
              chassis: 'N/A',
              motor: 'N/A',
              battery: 'N/A',
              charger: 'N/A',
              hsn: '8711',
              basePrice: q.financials ? q.financials.base : (q.items && q.items[0] ? q.items[0].rate : 0),
              gstPct: q.items && q.items[0] ? q.items[0].gstPct : 5
            },
            spares: [],
            labor: 0,
            financials: q.financials || {
              base: q.items && q.items[0] ? q.items[0].rate : 0,
              cgst: q.items && q.items[0] ? q.items[0].cgst : 0,
              sgst: q.items && q.items[0] ? q.items[0].sgst : 0,
              igst: q.items && q.items[0] ? q.items[0].igst : 0,
              total: q.items && q.items[0] ? q.items[0].total : 0,
              paid: 0,
              balance: q.items && q.items[0] ? q.items[0].total : 0
            }
          });
        }
      });
      saveTransactionsToStorage();
    }
  } catch (err) {
    console.error("Migration of quotations to central transactions database failed:", err);
  }

  // 9. Quotation Models Catalog Load
  try {
    const storedModels = localStorage.getItem('sleb_quotation_models');
    let parsedModels = null;
    if (storedModels) {
      try {
        parsedModels = JSON.parse(storedModels);
      } catch (err) {
        console.error("Error parsing stored models:", err);
      }
    }
    if (Array.isArray(parsedModels)) {
      state.quotationModels = parsedModels;
    } else {
      state.quotationModels = [
        { id: 'qm-1', name: 'ADMS RIDER GREEN (60V 24AH)', basePrice: 54000, gstPct: 5, hsn: '8711' },
        { id: 'qm-2', name: 'ADMS BOXER WHITE (72V 30AH)', basePrice: 62000, gstPct: 5, hsn: '8711' },
        { id: 'qm-3', name: 'ADMS RIDER GLOSSY RED', basePrice: 55000, gstPct: 5, hsn: '8711' }
      ];
      saveQuotationModelsToStorage();
    }
  } catch (e) {
    console.error("Quotation models load failed, healing...", e);
    state.quotationModels = [];
  }

  // Run deep database self-healer and sync
  healStateDatabases();

  // Render Dynamic Purchase Form based on custom field defs
  try { renderDynamicPurchaseForm(); } catch(e) { console.error('renderDynamicPurchaseForm failed', e); }

  // Populate profiles
  try { populateSettingsForm(); } catch (e) { console.error("populateSettingsForm failed", e); }
  try { updateBrandHeaders(); } catch (e) { console.error("updateBrandHeaders failed", e); }

  // Render Screens defensively inside try-catches
  try { renderStockDetails(); } catch (e) { console.error("renderStockDetails failed", e); }
  try { renderPurchasesTable(); } catch (e) { console.error("renderPurchasesTable failed", e); }
  try { renderSalesHistoryTable(); } catch (e) { console.error("renderSalesHistoryTable failed", e); }
  try { renderSparesDetails(); } catch (e) { console.error("renderSparesDetails failed", e); }
  try { renderServicesLedger(); } catch (e) { console.error("renderServicesLedger failed", e); }
  try { renderSparesHistoryTable(); } catch (e) { console.error("renderSparesHistoryTable failed", e); }

  // Render Dynamic Select elements
  try { renderBillingDropdown(); } catch (e) { console.error("renderBillingDropdown failed", e); }
  try { populateSparesDropdowns(); } catch (e) { console.error("populateSparesDropdowns failed", e); }

  // Quotation models catalog rendering triggers
  try {
    renderQuotationModelsCatalogTable();
    renderQuotationHistoryTable();
    updateQModelFormPreview();
  } catch(e) {
    console.error("Quotation models catalog initializations failed", e);
  }

  // Render Dashboard (default tab) with data on load
  try { renderDashboard(); } catch (e) { console.error("renderDashboard failed", e); }

  try { setBillingCategory('bike'); } catch (e) { console.error(e); }
  try { setDocMode('invoice'); } catch (e) { console.error(e); }
  try { setTaxMode('intrastate'); } catch (e) { console.error(e); }

  // Load photo invoice on print station by default
  try {
    if (state.transactions.length > 0) {
      state.loadedTransaction = state.transactions[0];
      renderInvoicePrintSheet(state.loadedTransaction);
    }
  } catch (e) {
    console.error("Initial invoice print failed", e);
  }

  // Initialize warranty & delivery agreement fields and options
  try {
    initializeAgreementFields();
    updateAgreementDropdown();
    renderWarrantyHistoryTable();
  } catch (e) {
    console.error("Warranty agreement initializations failed", e);
  }

  // Initialize UI Theme mode
  try {
    const storedTheme = localStorage.getItem('sleb_theme_mode') || 'dark';
    const themeSel = document.getElementById('theme-selector');
    if (themeSel) themeSel.value = storedTheme;
    applyUITheme(storedTheme);
  } catch (e) {
    console.error("Theme initialization failed", e);
  }

  // Initialize Billing Invoice No and Date default inputs
  try {
    const invoiceInput = document.getElementById('bill-invoice-no');
    if (invoiceInput) invoiceInput.value = generateDocumentNumber(state.currentDocMode || 'invoice');
    const dateInput = document.getElementById('bill-date');
    if (dateInput) dateInput.value = getCurrentDateString();
  } catch (e) {
    console.error("Billing doc details initializations failed", e);
  }

  // Linked service invoice autocomplete
  try {
    const serInvoiceNoEl = document.getElementById('ser-invoice-no');
    if (serInvoiceNoEl) {
      const handleInvoiceAutocomplete = () => {
        const invNo = serInvoiceNoEl.value.trim();
        if (!invNo) return;
        const tx = state.transactions.find(t => String(t.id).trim() === invNo || (t.invoiceNo && String(t.invoiceNo).trim() === invNo));
        if (tx) {
          const custNameEl = document.getElementById('ser-cust-name');
          const chassisEl = document.getElementById('ser-chassis');
          if (custNameEl && tx.customer && tx.customer.name) {
            custNameEl.value = tx.customer.name;
          }
          if (chassisEl && tx.vehicle && tx.vehicle.chassis) {
            chassisEl.value = tx.vehicle.chassis;
            lookupServiceCounter(tx.vehicle.chassis);
          }
        }
      };
      serInvoiceNoEl.addEventListener('input', handleInvoiceAutocomplete);
      serInvoiceNoEl.addEventListener('change', handleInvoiceAutocomplete);
      serInvoiceNoEl.addEventListener('blur', handleInvoiceAutocomplete);
    }
  } catch (e) {
    console.error("Service autocomplete initialization failed", e);
  }

  // --- Real-time draft auto-saving event listeners & loader ---
  try {
    const billingInputIds = [
      'cust-name', 'cust-phone', 'cust-email', 'cust-address', 'cust-gstin', 'cust-ref-no',
      'bill-invoice-no', 'bill-date', 'vehicle-select', 'bill-payment-type', 'bill-payment-type-spares',
      'amount-paid', 'bill-override-base', 'bill-gst-rate', 'bill-id-no', 'bill-id-cost', 'bill-id-treatment'
    ];
    billingInputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', saveBillingDraftToStorage);
        el.addEventListener('change', saveBillingDraftToStorage);
      }
    });
    ['toggle-gstin', 'toggle-id-details', 'toggle-prev-outstanding'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', saveBillingDraftToStorage);
      }
    });

    const servicesInputIds = [
      'ser-invoice-no', 'ser-cust-name', 'ser-chassis', 'ser-date', 'ser-count-label',
      'ser-odometer', 'ser-spares-cost', 'ser-labor-cost'
    ];
    servicesInputIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', saveServicesDraftToStorage);
        el.addEventListener('change', saveServicesDraftToStorage);
      }
    });

    loadBillingDraftFromStorage();
    loadServicesDraftFromStorage();
  } catch (e) {
    console.error("Draft loader initialization failed", e);
  }
  window.isInitializing = false;
}

// --- Status Overrides Map for manual corrections ---
let statusOverrides = {};
try {
  const storedOverrides = localStorage.getItem('sleb_status_overrides');
  if (storedOverrides) {
    statusOverrides = JSON.parse(storedOverrides) || {};
  }
} catch (e) {
  console.error("Failed to load status overrides", e);
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM FIELD DEFINITIONS SYSTEM
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CUSTOM_FIELDS = {
  purchase: [
    { id: 'p_billno',     label: 'Bill / Invoice No',    key: 'billNo',        type: 'text',   required: true,  visible: true, builtin: true,  order: 0 },
    { id: 'p_supplier',   label: 'Supplier Name',        key: 'supplier',      type: 'text',   required: true,  visible: true, builtin: true,  order: 1 },
    { id: 'p_date',       label: 'Purchase Date',        key: 'date',          type: 'date',   required: true,  visible: true, builtin: true,  order: 2 },
    { id: 'p_model',      label: 'E-Bike Model Name',    key: 'model',         type: 'text',   required: true,  visible: true, builtin: true,  order: 3 },
    { id: 'p_chassis',    label: 'Chassis Number',       key: 'chassis',       type: 'text',   required: true,  visible: true, builtin: true,  order: 4 },
    { id: 'p_motor',      label: 'Motor Number',         key: 'motor',         type: 'text',   required: true,  visible: true, builtin: true,  order: 5 },
    { id: 'p_battery',    label: 'Battery Number',       key: 'battery',       type: 'text',   required: true,  visible: true, builtin: true,  order: 6 },
    { id: 'p_charger',    label: 'Charger Number',       key: 'charger',       type: 'text',   required: false, visible: true, builtin: true,  order: 7 },
    { id: 'p_hsn',        label: 'HSN Code',             key: 'hsn',           type: 'text',   required: false, visible: true, builtin: true,  order: 8 },
    { id: 'p_costprice',  label: 'Purchase Price (Cost)',key: 'costPrice',     type: 'number', required: true,  visible: true, builtin: true,  order: 9 },
    { id: 'p_sellprice',  label: 'Retail Base Rate (Selling)', key: 'sellingPrice', type: 'number', required: true, visible: true, builtin: true, order: 10 },
    { id: 'p_supplier_address', label: 'Supplier Address',   key: 'supplierAddress', type: 'textarea', required: false, visible: true, builtin: true, order: 11 },
    { id: 'p_supplier_gstin',   label: 'Supplier GSTIN',     key: 'supplierGstin',   type: 'text',     required: false, visible: true, builtin: true, order: 12 },
    { id: 'p_supplier_phone',   label: 'Supplier Mobile No',  key: 'supplierPhone',   type: 'text',     required: false, visible: true, builtin: true, order: 13 },
    { id: 'p_supplier_email',   label: 'Supplier Email ID',   key: 'supplierEmail',   type: 'text',     required: false, visible: true, builtin: true, order: 14 },
    { id: 'p_vehicle_gst', label: 'Vehicle GST %',        key: 'vehicleGst',    type: 'number', required: false, visible: true, builtin: true, order: 15 },
    { id: 'p_discount_pct', label: 'Discount %',           key: 'discountPct',   type: 'number', required: false, visible: true, builtin: true, order: 16 },
    { id: 'p_discount_amt', label: 'Discount Amount (₹)',  key: 'discountAmt',   type: 'number', required: false, visible: true, builtin: true, order: 17 }
  ],
  stock: [
    { id: 's_model',      label: 'Model Name',           key: 'model',         type: 'text',   required: true,  visible: true, builtin: true,  order: 0 },
    { id: 's_chassis',    label: 'Chassis No',           key: 'chassis',       type: 'text',   required: true,  visible: true, builtin: true,  order: 1 },
    { id: 's_motor',      label: 'Motor No',             key: 'motor',         type: 'text',   required: false, visible: true, builtin: true,  order: 2 },
    { id: 's_battery',    label: 'Battery No',           key: 'battery',       type: 'text',   required: false, visible: true, builtin: true,  order: 3 },
    { id: 's_charger',    label: 'Charger No',           key: 'charger',       type: 'text',   required: false, visible: true, builtin: true,  order: 4 },
    { id: 's_hsn',        label: 'HSN Code',             key: 'hsn',           type: 'text',   required: false, visible: true, builtin: true,  order: 5 }
  ],
  sales: [
    { id: 'sl_custname',  label: 'Buyer Name',           key: 'custName',      type: 'text',   required: true,  visible: true, builtin: true,  order: 0 },
    { id: 'sl_phone',     label: 'Mobile Number',        key: 'phone',         type: 'text',   required: true,  visible: true, builtin: true,  order: 1 },
    { id: 'sl_gstin',     label: 'GSTIN',                key: 'gstin',         type: 'text',   required: false, visible: true, builtin: true,  order: 2 },
    { id: 'sl_address',   label: 'Address',              key: 'address',       type: 'textarea',required: true, visible: true, builtin: true,  order: 3 },
    { id: 'sl_date',      label: 'Invoice Date',         key: 'date',          type: 'date',   required: true,  visible: true, builtin: true,  order: 4 },
    { id: 'sl_model',     label: 'Vehicle Model',        key: 'model',         type: 'text',   required: false, visible: true, builtin: true,  order: 5 },
    { id: 'sl_chassis',   label: 'Chassis No',           key: 'chassis',       type: 'text',   required: false, visible: true, builtin: true,  order: 6 },
    { id: 'sl_motor',     label: 'Motor No',             key: 'motor',         type: 'text',   required: false, visible: true, builtin: true,  order: 7 },
    { id: 'sl_battery',   label: 'Battery No',           key: 'battery',       type: 'text',   required: false, visible: true, builtin: true,  order: 8 },
    { id: 'sl_amount',    label: 'Sale Amount',          key: 'amount',        type: 'number', required: false, visible: true, builtin: true,  order: 9 }
  ]
};

let customFieldDefs = {};

function loadCustomFields() {
  try {
    const stored = localStorage.getItem('sleb_custom_fields');
    if (stored) {
      customFieldDefs = JSON.parse(stored);
      
      // Migrate stock to remove basePrice and status keys if present from previous sessions
      if (customFieldDefs.stock) {
        customFieldDefs.stock = customFieldDefs.stock.filter(f => f.key !== 'basePrice' && f.key !== 'status');
      }

      // Ensure Bill No is order 0 and Supplier Name is order 1 (swapped)
      if (customFieldDefs.purchase) {
        const billNoDef = customFieldDefs.purchase.find(f => f.key === 'billNo');
        const supplierDef = customFieldDefs.purchase.find(f => f.key === 'supplier');
        if (billNoDef && supplierDef) {
          billNoDef.order = 0;
          supplierDef.order = 1;
        }
      }

      // Merge: ensure all builtin fields exist
      ['purchase', 'stock', 'sales'].forEach(page => {
        if (!Array.isArray(customFieldDefs[page])) {
          customFieldDefs[page] = [...DEFAULT_CUSTOM_FIELDS[page]];
        } else {
          // Add any missing builtin fields
          DEFAULT_CUSTOM_FIELDS[page].forEach(def => {
            if (!customFieldDefs[page].find(f => f.id === def.id)) {
              customFieldDefs[page].push({ ...def });
            }
          });
        }
      });
      
      saveCustomFields(); // Save custom fields to localStorage to persist healing & merges!
    } else {
      customFieldDefs = {
        purchase: [...DEFAULT_CUSTOM_FIELDS.purchase],
        stock:    [...DEFAULT_CUSTOM_FIELDS.stock],
        sales:    [...DEFAULT_CUSTOM_FIELDS.sales]
      };
      saveCustomFields();
    }
  } catch(e) {
    customFieldDefs = {
      purchase: [...DEFAULT_CUSTOM_FIELDS.purchase],
      stock:    [...DEFAULT_CUSTOM_FIELDS.stock],
      sales:    [...DEFAULT_CUSTOM_FIELDS.sales]
    };
  }
}

function saveCustomFields() {
  localStorage.setItem('sleb_custom_fields', JSON.stringify(customFieldDefs));
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}

// ── Field Manager Modal ──────────────────────────────────────────
let _fmPage = 'purchase';

function openFieldManager(page) {
  _fmPage = page || 'purchase';
  const modal = document.getElementById('field-manager-modal');
  if (!modal) return;
  // Set active tab
  document.querySelectorAll('.fm-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === _fmPage);
  });
  renderFieldManagerList();
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('open'), 10);
}

function closeFieldManager() {
  const modal = document.getElementById('field-manager-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
  // Refresh the affected forms/tables
  if (_fmPage === 'purchase') {
    renderDynamicPurchaseForm();
    try { renderPurchasesTable(); } catch(e) {}
  } else if (_fmPage === 'stock') {
    try { renderStockDetails(); } catch(e) {}
  } else if (_fmPage === 'sales') {
    try { renderSalesHistoryTable(); } catch(e) {}
  }
}

function switchFieldManagerTab(page) {
  _fmPage = page;
  document.querySelectorAll('.fm-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });
  renderFieldManagerList();
}

function renderFieldManagerList() {
  const container = document.getElementById('fm-fields-list');
  if (!container) return;
  const fields = (customFieldDefs[_fmPage] || []).slice().sort((a, b) => a.order - b.order);
  const pageLabels = { purchase: 'Purchase', stock: 'Stock', sales: 'Sales' };
  container.innerHTML = '';

  if (fields.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:2rem;">No fields defined.</p>';
    return;
  }

  fields.forEach((field, idx) => {
    const row = document.createElement('div');
    row.className = 'fm-field-row';
    row.dataset.id = field.id;
    row.innerHTML = `
      <div class="fm-drag-handle" title="Move field">
        <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2">
          <path d="M4 8h16M4 16h16"/>
        </svg>
      </div>
      <div class="fm-field-info">
        <div class="fm-field-label" id="fm-label-${field.id}" onclick="startEditLabel('${field.id}')" title="Click to rename">${escHtml(field.label)}</div>
        <div class="fm-field-meta">
          <span class="fm-type-badge">${field.type}</span>
          ${field.builtin ? '<span class="fm-builtin-badge">Built-in</span>' : ''}
          ${field.required ? '<span class="fm-req-badge">Required</span>' : ''}
        </div>
      </div>
      <div class="fm-field-actions">
        <button class="fm-btn fm-btn-up" onclick="moveCustomField('${field.id}', -1)" ${idx === 0 ? 'disabled' : ''} title="Move Up">
          <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.5"><path d="M5 15l7-7 7 7"/></svg>
        </button>
        <button class="fm-btn fm-btn-down" onclick="moveCustomField('${field.id}', 1)" ${idx === fields.length - 1 ? 'disabled' : ''} title="Move Down">
          <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.5"><path d="M19 9l-7 7-7-7"/></svg>
        </button>
        <label class="fm-toggle" title="${field.visible ? 'Hide field' : 'Show field'}">
          <input type="checkbox" ${field.visible ? 'checked' : ''} onchange="toggleCustomFieldVisibility('${field.id}', this.checked)">
          <span class="fm-toggle-slider"></span>
        </label>
        ${!field.builtin ? `<button class="fm-btn fm-btn-delete" onclick="deleteCustomField('${field.id}')" title="Delete field">
          <svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>` : '<span style="width:26px;"></span>'}
      </div>
    `;
    container.appendChild(row);
  });
}

function startEditLabel(fieldId) {
  const el = document.getElementById('fm-label-' + fieldId);
  if (!el || el.querySelector('input')) return;
  const current = el.textContent.trim();
  el.innerHTML = `<input type="text" value="${escHtml(current)}" style="background:var(--bg-secondary);border:1px solid var(--color-primary);border-radius:6px;padding:2px 8px;font-size:0.85rem;color:var(--text-main);width:100%;" 
    onblur="saveFieldLabel('${fieldId}', this.value)" 
    onkeydown="if(event.key==='Enter'){this.blur();}if(event.key==='Escape'){renderFieldManagerList();}">`;
  el.querySelector('input').focus();
}

function saveFieldLabel(fieldId, newLabel) {
  const trimmed = newLabel.trim();
  if (!trimmed) { renderFieldManagerList(); return; }
  const fields = customFieldDefs[_fmPage];
  const field = fields.find(f => f.id === fieldId);
  if (field) {
    field.label = trimmed;
    saveCustomFields();
  }
  renderFieldManagerList();
}

function toggleCustomFieldVisibility(fieldId, visible) {
  const field = (customFieldDefs[_fmPage] || []).find(f => f.id === fieldId);
  if (field) {
    field.visible = visible;
    saveCustomFields();
  }
  renderFieldManagerList();
}

function moveCustomField(fieldId, direction) {
  const fields = customFieldDefs[_fmPage] || [];
  const sorted = fields.slice().sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex(f => f.id === fieldId);
  if (idx === -1) return;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= sorted.length) return;
  // Swap order values
  const tmpOrder = sorted[idx].order;
  sorted[idx].order = sorted[swapIdx].order;
  sorted[swapIdx].order = tmpOrder;
  saveCustomFields();
  renderFieldManagerList();
}

function deleteCustomField(fieldId) {
  const fields = customFieldDefs[_fmPage] || [];
  const idx = fields.findIndex(f => f.id === fieldId);
  if (idx !== -1 && !fields[idx].builtin) {
    fields.splice(idx, 1);
    saveCustomFields();
    renderFieldManagerList();
  }
}

function addCustomField() {
  const labelInput = document.getElementById('fm-new-label');
  const typeSelect = document.getElementById('fm-new-type');
  const reqCheck   = document.getElementById('fm-new-required');
  if (!labelInput || !typeSelect) return;

  const label = labelInput.value.trim();
  if (!label) { labelInput.focus(); return; }

  const fields = customFieldDefs[_fmPage] || [];
  const maxOrder = fields.reduce((m, f) => Math.max(m, f.order), 0);
  const newId = 'cf_' + _fmPage + '_' + Date.now();
  const newKey = label.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30) + '_' + Date.now().toString().slice(-4);

  fields.push({
    id: newId,
    label,
    key: newKey,
    type: typeSelect.value,
    required: reqCheck ? reqCheck.checked : false,
    visible: true,
    builtin: false,
    order: maxOrder + 1
  });

  customFieldDefs[_fmPage] = fields;
  saveCustomFields();
  labelInput.value = '';
  if (reqCheck) reqCheck.checked = false;
  renderFieldManagerList();
}

function resetFieldsToDefault() {
  customFieldDefs[_fmPage] = [...DEFAULT_CUSTOM_FIELDS[_fmPage]].map(f => ({ ...f }));
  saveCustomFields();
  renderFieldManagerList();
}

// ── Dynamic Purchase Form Renderer ───────────────────────────────
function renderDynamicPurchaseForm() {
  const grid = document.getElementById('purchase-form-grid');
  if (!grid) return;

  const submitBtnSpan = document.querySelector('#purchase-log-form button[type="submit"] span');
  if (submitBtnSpan) {
    submitBtnSpan.textContent = 'Save Purchase & Add Stock';
  }

  const fields = (customFieldDefs.purchase || DEFAULT_CUSTOM_FIELDS.purchase)
    .slice().sort((a, b) => a.order - b.order).filter(f => f.visible);

  grid.innerHTML = '';
  fields.forEach(field => {
    const div = document.createElement('div');
    div.className = 'form-group' + (field.type === 'textarea' ? ' full-width' : '');
    const reqAttr = field.required ? 'required' : '';
    const reqStar = field.required ? ' *' : '';
    let inputHtml = '';

    if (field.type === 'date') {
      inputHtml = `<input type="date" id="pur-field-${field.key}" ${reqAttr}>`;
    } else if (field.type === 'number') {
      inputHtml = `<input type="number" id="pur-field-${field.key}" step="0.01" min="0" ${reqAttr}>`;
    } else if (field.type === 'textarea') {
      inputHtml = `<textarea id="pur-field-${field.key}" rows="2" ${reqAttr}></textarea>`;
    } else {
      inputHtml = `<input type="text" id="pur-field-${field.key}" ${reqAttr}>`;
    }

    div.innerHTML = `<label for="pur-field-${field.key}">${escHtml(field.label)}${reqStar}</label>${inputHtml}`;
    grid.appendChild(div);
  });

  // Restore known field placeholders and default values
  const defaults = {
    'pur-field-supplier': ['e.g. ADMS Motors India', ''],
    'pur-field-billNo': ['e.g. ADMS-PUR-1049', ''],
    'pur-field-model': ['e.g. RIDER BLACK(60V 30AH)', ''],
    'pur-field-chassis': ['Unique Chassis Serial', ''],
    'pur-field-motor': ['Unique Motor Serial', ''],
    'pur-field-battery': ['Unique Battery Serial', ''],
    'pur-field-charger': ['Unique Charger Serial', ''],
    'pur-field-hsn': ['HSN Code', '871190'],
    'pur-field-costPrice': ['Dealer cost price', ''],
    'pur-field-sellingPrice': ['Base selling rate', '']
  };
  Object.entries(defaults).forEach(([id, [placeholder, defVal]]) => {
    const el = document.getElementById(id);
    if (el) {
      if (placeholder) el.placeholder = placeholder;
      if (defVal) el.value = defVal;
    }
  });

  // Automatically pre-fill Purchase Invoice No and Purchase Date if they are empty
  const billNoEl = document.getElementById('pur-field-billNo');
  if (billNoEl && !billNoEl.value.trim()) {
    const nextPurNo = (state.purchases || []).length + 1;
    billNoEl.value = 'PUR-' + String(1000 + nextPurNo);
  }
  const dateEl = document.getElementById('pur-field-date');
  if (dateEl && !dateEl.value.trim()) {
    dateEl.value = getCurrentDateString();
  }

  // Attach input listener to Supplier Name to auto-populate other details if already purchased
  const supplierEl = document.getElementById('pur-field-supplier');
  if (supplierEl) {
    const autoPopulateSupplierDetails = () => {
      const sName = supplierEl.value.trim().toLowerCase();
      if (sName.length < 2) return;
      
      // Find previous purchase with this supplier name (starts-with prefix match first, then substring match, then exact match fallback)
      const prevPur = (state.purchases || []).find(p => p.supplier && p.supplier.trim().toLowerCase().startsWith(sName))
                      || (state.purchases || []).find(p => p.supplier && p.supplier.trim().toLowerCase().includes(sName));
      if (prevPur) {
        // Auto fill other supplier fields if they exist and are currently empty
        const addrEl = document.getElementById('pur-field-supplierAddress');
        if (addrEl && !addrEl.value.trim()) addrEl.value = prevPur.supplierAddress || '';
        
        const gstEl = document.getElementById('pur-field-supplierGstin');
        if (gstEl && !gstEl.value.trim()) gstEl.value = prevPur.supplierGstin || '';
        
        const phoneEl = document.getElementById('pur-field-supplierPhone');
        if (phoneEl && !phoneEl.value.trim()) phoneEl.value = prevPur.supplierPhone || '';
        
        const emailEl = document.getElementById('pur-field-supplierEmail');
        if (emailEl && !emailEl.value.trim()) emailEl.value = prevPur.supplierEmail || '';
      }
    };
    supplierEl.addEventListener('input', autoPopulateSupplierDetails);
    supplierEl.addEventListener('change', autoPopulateSupplierDetails);
    supplierEl.addEventListener('blur', autoPopulateSupplierDetails);
  }

  // Reciprocal auto-calculations for Cost, Discount %, and Discount Amount
  const costEl = document.getElementById('pur-field-costPrice');
  const discPctEl = document.getElementById('pur-field-discountPct');
  const discAmtEl = document.getElementById('pur-field-discountAmt');

  if (costEl && discPctEl && discAmtEl) {
    discPctEl.addEventListener('input', () => {
      const cost = parseFloat(costEl.value) || 0;
      const pct = parseFloat(discPctEl.value) || 0;
      if (cost > 0) {
        discAmtEl.value = ((cost * pct) / 100).toFixed(2);
      }
    });

    discAmtEl.addEventListener('input', () => {
      const cost = parseFloat(costEl.value) || 0;
      const amt = parseFloat(discAmtEl.value) || 0;
      if (cost > 0) {
        discPctEl.value = ((amt / cost) * 100).toFixed(2);
      }
    });

    costEl.addEventListener('input', () => {
      const cost = parseFloat(costEl.value) || 0;
      const pct = parseFloat(discPctEl.value) || 0;
      if (cost > 0 && pct > 0) {
        discAmtEl.value = ((cost * pct) / 100).toFixed(2);
      }
    });
  }
}

function getCustomFieldValues() {
  // Returns object with both builtin and custom field values from purchase form
  const result = {};
  const fields = (customFieldDefs.purchase || DEFAULT_CUSTOM_FIELDS.purchase)
    .filter(f => f.visible);
  fields.forEach(field => {
    const el = document.getElementById('pur-field-' + field.key);
    if (el) result[field.key] = el.value.trim();
  });
  return result;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


// --- Derives Stock Inventory dynamically from Purchases Ledger and Sales Invoices ---
function syncInventoryFromPurchasesAndSales() {
  if (!Array.isArray(state.purchases)) state.purchases = [];
  if (!Array.isArray(state.transactions)) state.transactions = [];

  const inventoryMap = new Map();

  // 1. Load all purchases as STOCK (by default)
  state.purchases.forEach(p => {
    if (!p || !p.chassis) return;
    const key = String(p.chassis).trim().toLowerCase();
    const chassisShort = p.chassis.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase();
    inventoryMap.set(key, {
      model: p.model || 'Imported E-Bike',
      chassis: p.chassis,
      motor: p.motor || ('GEMLDM-' + chassisShort),
      battery: p.battery || ('BOBF-' + chassisShort),
      charger: p.charger || (p.battery ? p.battery + '-CH' : 'CH-' + chassisShort),
      hsn: p.hsn || '871190',
      basePrice: parseFloat(p.sellingPrice) || (parseFloat(p.costPrice) * 1.15) || 45000,
      costPrice: parseFloat(p.costPrice) || 38000,
      status: 'STOCK'
    });
  });

  // 2. Scan transactions. If an invoice sales transaction contains a bike, mark it as SOLD
  state.transactions.forEach(t => {
    if (t && t.billCategory === 'bike' && t.docType === 'invoice' && t.vehicle && t.vehicle.chassis) {
      const key = String(t.vehicle.chassis).trim().toLowerCase();
      const existing = inventoryMap.get(key);
      if (existing) {
        existing.status = 'SOLD';
      } else {
        // If this sold bike is NOT in purchases, seed it in inventory as SOLD anyway!
        const v = t.vehicle;
        const chassisShort = (v.chassis || 'SOLD').replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase();
        inventoryMap.set(key, {
          model: v.model || 'Imported E-Bike',
          chassis: v.chassis,
          motor: v.motor || ('GEMLDM-' + chassisShort),
          battery: v.battery || ('BOBF-' + chassisShort),
          charger: v.charger || (v.battery ? v.battery + '-CH' : 'CH-' + chassisShort),
          hsn: v.hsn || '871190',
          basePrice: parseFloat(v.basePrice) || 45000,
          costPrice: parseFloat(v.costPrice) || 38000,
          status: 'SOLD'
        });
      }
    }
  });

  // 3. Apply manual status overrides
  for (let key in statusOverrides) {
    const existing = inventoryMap.get(key);
    if (existing) {
      existing.status = statusOverrides[key];
    }
  }

  state.inventory = Array.from(inventoryMap.values());
  saveInventoryToStorage();
}

// --- Deep Database Diagnostician & Auto-Healer ---
function healStateDatabases() {
  // 1. Dealership
  if (!state.dealership || typeof state.dealership !== 'object' || !state.dealership.brandName) {
    state.dealership = { ...DEFAULT_DEALERSHIP };
    saveDealershipToStorage();
  }

  // 2. Purchases
  if (!Array.isArray(state.purchases)) {
    state.purchases = [...SEED_PURCHASES];
    savePurchasesToStorage();
  } else {
    state.purchases = state.purchases.filter(p => p && typeof p === 'object' && p.chassis);
  }

  // 3. Sales Transactions
  if (!Array.isArray(state.transactions)) {
    state.transactions = [...SEED_TRANSACTIONS];
    saveTransactionsToStorage();
  } else {
    state.transactions = state.transactions.filter(t => t && typeof t === 'object' && t.id);
  }

  // Synchronize stock inventory dynamically from purchases and sales
  syncInventoryFromPurchasesAndSales();

  // 4. Spares Catalog
  if (!Array.isArray(state.spares)) {
    state.spares = [...SEED_SPARES];
    saveSparesToStorage();
  } else {
    state.spares = state.spares.filter(s => s && typeof s === 'object' && s.sku);
  }

  // 5. Services Center Odometer Registry
  if (!Array.isArray(state.services)) {
    state.services = [...SEED_SERVICES];
    saveServicesToStorage();
  } else {
    state.services = state.services.filter(s => s && typeof s === 'object' && s.id);
  }

  // 6. Quotation Models Catalog
  if (!Array.isArray(state.quotationModels)) {
    state.quotationModels = [
      { id: 'qm-1', name: 'ADMS RIDER GREEN (60V 24AH)', basePrice: 54000, gstPct: 5, hsn: '8711' },
      { id: 'qm-2', name: 'ADMS BOXER WHITE (72V 30AH)', basePrice: 62000, gstPct: 5, hsn: '8711' },
      { id: 'qm-3', name: 'ADMS RIDER GLOSSY RED', basePrice: 55000, gstPct: 5, hsn: '8711' }
    ];
    saveQuotationModelsToStorage();
  } else {
    state.quotationModels = state.quotationModels.filter(m => m && typeof m === 'object' && m.id);
  }
}

// --- Dynamic manual status switcher (STOCK <-> SOLD) ---
function toggleBikeStatus(chassis, newStatus) {
  const key = String(chassis).trim().toLowerCase();
  statusOverrides[key] = newStatus;
  saveStatusOverridesToStorage();
  
  // Recalculate derived state
  syncInventoryFromPurchasesAndSales();
  
  try { renderStockDetails(); } catch(e) { console.error(e); }
  try { renderPurchasesTable(); } catch(e) { console.error(e); }
  try { renderBillingDropdown(); } catch(e) { console.error(e); }
  // Status updated silently (no alert)
}

// --- State Persisters ---
// --- Millisecond Unix Timestamp Management ---
function updateLastUpdatedTimestamp() {
  if (window.isInitializing) {
    return parseInt(localStorage.getItem('sleb_last_updated') || '0', 10) || Date.now();
  }
  const now = Date.now();
  localStorage.setItem('sleb_last_updated', now.toString());
  return now;
}

// --- Centralized Status Overrides Persister ---
function saveStatusOverridesToStorage() {
  localStorage.setItem('sleb_status_overrides', JSON.stringify(statusOverrides));
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}

function saveDealershipToStorage() { 
  localStorage.setItem('sleb_dealership', JSON.stringify(state.dealership)); 
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}
function savePurchasesToStorage() { 
  localStorage.setItem('sleb_purchases', JSON.stringify(state.purchases)); 
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}
function saveInventoryToStorage() { 
  localStorage.setItem('sleb_inventory', JSON.stringify(state.inventory)); 
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}
function saveTransactionsToStorage() { 
  localStorage.setItem('sleb_transactions', JSON.stringify(state.transactions)); 
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}
function saveSparesToStorage() { 
  localStorage.setItem('sleb_spares', JSON.stringify(state.spares)); 
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}
function saveServicesToStorage() { 
  localStorage.setItem('sleb_services', JSON.stringify(state.services)); 
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}

// --- Global UI Refresh: call after any data change to keep all tabs in sync ---
function refreshAllViews() {
  syncInventoryFromPurchasesAndSales();
  try { renderDynamicPurchaseForm(); } catch(e) { console.error('renderDynamicPurchaseForm', e); }
  try { renderStockDetails(); } catch(e) { console.error('renderStockDetails', e); }
  try { renderPurchasesTable(); } catch(e) { console.error('renderPurchasesTable', e); }
  try { renderSalesHistoryTable(); } catch(e) { console.error('renderSalesHistoryTable', e); }
  try { renderBillingDropdown(); } catch(e) { console.error('renderBillingDropdown', e); }
  try { renderSparesDetails(); } catch(e) { console.error('renderSparesDetails', e); }
  try { populateSparesDropdowns(); } catch(e) { console.error('populateSparesDropdowns', e); }
  try { renderServicesLedger(); } catch(e) { console.error('renderServicesLedger', e); }
  try { renderSparesHistoryTable(); } catch(e) { console.error('renderSparesHistoryTable', e); }
  try { renderDashboard(); } catch(e) { console.error('renderDashboard', e); }
  // Warranty & Quotation tabs - always re-render after any data restore
  try { updateAgreementDropdown(); renderWarrantyHistoryTable(); } catch(e) { console.error('renderWarrantyHistoryTable', e); }
  try { renderQuotationModelsCatalogTable(); renderQuotationHistoryTable(); } catch(e) { console.error('renderQuotationHistoryTable', e); }
  // Update print station to latest transaction if available
  try {
    if (state.transactions && state.transactions.length > 0) {
      // Update to latest transaction if none loaded yet
      if (!state.loadedTransaction) {
        state.loadedTransaction = state.transactions[0];
        renderInvoicePrintSheet(state.loadedTransaction);
      }
    }
  } catch(e) { console.error('refreshAllViews invoice print update', e); }
  // Update dealership settings form and brand headers
  try { populateSettingsForm(); } catch(e) { console.error('populateSettingsForm', e); }
  try { updateBrandHeaders(); } catch(e) { console.error('updateBrandHeaders', e); }
  try { triggerBackgroundBackup(); } catch(e) { console.error('refreshAllViews backup trigger failed', e); }
}

// --- Emergency Data Reset (wipes all localStorage and reloads seed data) ---
function resetAllData() {
  const keys = ['sleb_purchases', 'sleb_transactions', 'sleb_inventory', 'sleb_spares', 'sleb_services', 'sleb_status_overrides'];
  keys.forEach(k => localStorage.removeItem(k));
  statusOverrides = {};
  state.purchases = [...SEED_PURCHASES];
  state.transactions = [...SEED_TRANSACTIONS];
  state.spares = [...SEED_SPARES];
  state.services = [...SEED_SERVICES];
  state.inventory = [];
  savePurchasesToStorage();
  saveTransactionsToStorage();
  saveSparesToStorage();
  saveServicesToStorage();
  syncInventoryFromPurchasesAndSales();
  refreshAllViews();
  alert('All vehicle data has been reset to factory defaults.');
}

// --- Tab Swapper Routing ---
function switchTab(tabId) {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => {
    l.classList.remove('active');
    const onClickAttr = String(l.getAttribute('onclick') || '');
    if (onClickAttr.includes(tabId)) {
      l.classList.add('active');
    }
  });

  const sections = document.querySelectorAll('.tab-section');
  sections.forEach(s => s.classList.remove('active'));

  if (tabId === 'invoice-printer-tab') {
    updatePrinterTabDisplay();
  } else if (tabId === 'warranty-agreement-tab') {
    updateAgreementDropdown();
    renderWarrantyHistoryTable();
  } else if (tabId === 'dashboard-tab') {
    renderDashboard();
  } else if (tabId === 'spares-history-tab') {
    renderSparesHistoryTable();
  } else if (tabId === 'quotation-tab') {
    try { renderQuotationHistoryTable(); } catch(e) {}
    try { renderQuotationModelsCatalogTable(); } catch(e) {}
  }

  const activeSec = document.getElementById(tabId);
  if (activeSec) {
    activeSec.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Custom showroom profiles ---
function populateSettingsForm() {
  document.getElementById('set-brand-name').value = state.dealership.brandName;
  document.getElementById('set-legal-name').value = state.dealership.legalName;
  document.getElementById('set-gstin').value = state.dealership.gstin;
  document.getElementById('set-phone').value = state.dealership.phone;
  document.getElementById('set-address1').value = state.dealership.address1;
  document.getElementById('set-address2').value = state.dealership.address2;
  document.getElementById('set-bank-holder').value = state.dealership.bankHolder || '';
  document.getElementById('set-bank-cust-id').value = state.dealership.bankCustId || '';
  document.getElementById('set-bank-name').value = state.dealership.bankName;
  document.getElementById('set-bank-branch').value = state.dealership.bankBranch || '';
  document.getElementById('set-bank-acc').value = state.dealership.bankAcc;
  document.getElementById('set-bank-ifsc').value = state.dealership.bankIfsc;
  document.getElementById('set-tc1').value = state.dealership.tc1;
  document.getElementById('set-tc2').value = state.dealership.tc2;
}

function saveDealershipSettingsForm(event) {
  event.preventDefault();

  state.dealership.brandName = document.getElementById('set-brand-name').value.trim();
  state.dealership.legalName = document.getElementById('set-legal-name').value.trim();
  state.dealership.gstin = document.getElementById('set-gstin').value.trim();
  state.dealership.phone = document.getElementById('set-phone').value.trim();
  state.dealership.address1 = document.getElementById('set-address1').value.trim();
  state.dealership.address2 = document.getElementById('set-address2').value.trim();
  state.dealership.bankHolder = document.getElementById('set-bank-holder').value.trim();
  state.dealership.bankCustId = document.getElementById('set-bank-cust-id').value.trim();
  state.dealership.bankName = document.getElementById('set-bank-name').value.trim();
  state.dealership.bankBranch = document.getElementById('set-bank-branch').value.trim();
  state.dealership.bankAcc = document.getElementById('set-bank-acc').value.trim();
  state.dealership.bankIfsc = document.getElementById('set-bank-ifsc').value.trim();
  state.dealership.tc1 = document.getElementById('set-tc1').value.trim();
  state.dealership.tc2 = document.getElementById('set-tc2').value.trim();

  saveDealershipToStorage();
  updateBrandHeaders();

  if (state.loadedTransaction) {
    renderInvoicePrintSheet(state.loadedTransaction);
  }

  alert('Showroom profile settings successfully updated.');
}

function updateBrandHeaders() {
  document.getElementById('sidebar-brand-name').textContent = state.dealership.legalName;
  document.getElementById('sidebar-brand-sub').textContent = 'H BILLING SYSTEMS';
}

// --- E-Bike Purchase Journal ---
function renderPurchasesTableHeader() {
  const thead = document.querySelector('#purchases-history-table thead tr');
  if (!thead) return;
  const fields = (customFieldDefs.purchase || DEFAULT_CUSTOM_FIELDS.purchase)
    .slice().sort((a, b) => a.order - b.order).filter(f => f.visible);

  thead.innerHTML = '';
  fields.forEach(f => {
    const th = document.createElement('th');
    th.textContent = f.label;
    thead.appendChild(th);
  });
  // Non-field fixed columns at end
  ['Sale Status', 'Action'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    if (label === 'Action') th.style.textAlign = 'center';
    thead.appendChild(th);
  });
}

function renderPurchasesTable() {
  const tbody = document.getElementById('purchases-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Render dynamic header first
  renderPurchasesTableHeader();

  const visibleFields = (customFieldDefs.purchase || DEFAULT_CUSTOM_FIELDS.purchase)
    .slice().sort((a, b) => a.order - b.order).filter(f => f.visible);

  if (!state.purchases || state.purchases.length === 0) {
    const colspan = visibleFields.length + 2;
    tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; color:var(--text-muted);">No inbound purchase records logged.</td></tr>`;
    return;
  }

  state.purchases.forEach(p => {
    if (!p) return;
    
    // Check the current status of this chassis in inventory
    const invItem = state.inventory.find(b => b.chassis && p.chassis && b.chassis.toLowerCase() === p.chassis.toLowerCase());
    const status = invItem ? invItem.status : 'STOCK';
    const statusColor = status === 'SOLD' ? 'hsl(0, 85%, 65%)' : 'hsl(142, 76%, 45%)';
    const statusBg = status === 'SOLD' ? 'hsla(0, 85%, 65%, 0.15)' : 'hsla(142, 76%, 45%, 0.15)';
    
    const row = document.createElement('tr');
    let cellsHtml = '';

    visibleFields.forEach(f => {
      const val = p[f.key] !== undefined ? p[f.key] : '';
      if (f.key === 'billNo') {
        cellsHtml += `<td style="font-family:monospace; font-weight:700;">${escapeHtml(String(val || '-'))}</td>`;
      } else if (f.key === 'supplier') {
        cellsHtml += `<td style="font-weight:600;"><span style="cursor:pointer; color:var(--color-primary); text-decoration:underline;" onclick="openSupplierDetailsModal('${escapeHtml(String(val || ''))}')">${escapeHtml(String(val || '-'))}</span></td>`;
      } else if (['chassis', 'motor', 'battery', 'charger', 'hsn'].includes(f.key)) {
        cellsHtml += `<td style="font-family:monospace;">${escapeHtml(String(val || '-'))}</td>`;
      } else if (f.key === 'costPrice') {
        cellsHtml += `<td style="font-weight:700; color:hsl(0, 85%, 65%);">₹ ${Number(val || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>`;
      } else if (f.key === 'sellingPrice') {
        cellsHtml += `<td style="font-weight:700; color:var(--color-primary);">₹ ${Number(val || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>`;
      } else {
        cellsHtml += `<td>${escapeHtml(String(val || '-'))}</td>`;
      }
    });

    cellsHtml += `
      <td><span style="display:inline-block; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.72rem; font-weight:700; background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor};">${status}</span></td>
      <td>
        <div style="display:flex; gap:0.35rem; justify-content:center;">
          <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.75rem; width:auto; border-color:var(--color-primary);" onclick="editPurchaseRecord('${escapeHtml(p.chassis || '')}')">
            Edit
          </button>
          <button class="btn btn-danger" style="padding:0.4rem 0.8rem; font-size:0.75rem; width:auto;" onclick="deletePurchaseRecord('${escapeHtml(p.chassis || '')}')">
            Delete
          </button>
        </div>
      </td>
    `;
    
    row.innerHTML = cellsHtml;
    tbody.appendChild(row);
  });
}

function handleNewPurchaseForm(e) {
  e.preventDefault();

  // Read from dynamic field IDs (pur-field-KEY) with fallback to old static IDs
  const getVal = (key, oldId) => {
    const dynEl = document.getElementById('pur-field-' + key);
    if (dynEl && dynEl.value !== undefined) return dynEl.value.trim();
    const oldEl = oldId ? document.getElementById(oldId) : null;
    return oldEl ? oldEl.value.trim() : '';
  };
  const getNum = (key, oldId) => {
    const dynEl = document.getElementById('pur-field-' + key);
    if (dynEl && dynEl.value !== undefined) return parseFloat(dynEl.value) || 0;
    const oldEl = oldId ? document.getElementById(oldId) : null;
    return oldEl ? parseFloat(oldEl.value) || 0 : 0;
  };

  const supplier        = getVal('supplier',      'pur-supplier');
  const billNo          = getVal('billNo',         'pur-bill-no');
  const date            = getVal('date',           'pur-date');
  const model           = getVal('model',          'pur-model');
  const chassis         = getVal('chassis',        'pur-chassis');
  const motor           = getVal('motor',          'pur-motor');
  const battery         = getVal('battery',        'pur-battery');
  const charger         = getVal('charger',        'pur-charger');
  const hsn             = getVal('hsn',            'pur-hsn') || '871190';
  const costPrice       = getNum('costPrice',      'pur-cost-price');
  const sellingPrice    = getNum('sellingPrice',   'pur-selling-price');
  const supplierAddress = getVal('supplierAddress');
  const supplierGstin   = getVal('supplierGstin');
  const supplierPhone   = getVal('supplierPhone');
  const supplierEmail   = getVal('supplierEmail');

  if (!chassis) { alert('Chassis Number is required.'); return; }
  if (isNaN(costPrice) || costPrice <= 0 || isNaN(sellingPrice) || sellingPrice <= 0) {
    alert('Please enter valid purchase and retail selling rates.');
    return;
  }

  // Collect any extra custom field values
  const customData = {};
  (customFieldDefs.purchase || []).filter(f => !f.builtin && f.visible).forEach(field => {
    const el = document.getElementById('pur-field-' + field.key);
    if (el) customData[field.key] = el.value.trim();
  });

  const purchase = {
    billNo, date, supplier, supplierAddress, supplierGstin, supplierPhone, supplierEmail,
    model, chassis, motor, battery, charger, hsn,
    costPrice, sellingPrice,
    ...customData
  };

  // Check if chassis already exists - UPDATE instead of blocking
  const existingIdx = state.purchases.findIndex(p => p.chassis && p.chassis.toLowerCase() === chassis.toLowerCase());
  if (existingIdx !== -1) {
    state.purchases[existingIdx] = purchase;
  } else {
    state.purchases.push(purchase);
  }

  savePurchasesToStorage();
  syncInventoryFromPurchasesAndSales();
  renderPurchasesTable();
  renderStockDetails();
  renderBillingDropdown();

  // Reset form and re-generate next auto-incremented purchase bill number
  renderDynamicPurchaseForm();

  const action = existingIdx !== -1 ? 'updated' : 'logged';
  alert(`Supplier Bill "${billNo}" ${action}. E-Bike added/updated in inventory.`);
}

function deletePurchaseRecord(chassis) {
  // Delete without asking for confirmation
  state.purchases = state.purchases.filter(p => p.chassis.toLowerCase() !== chassis.toLowerCase());
  savePurchasesToStorage();

  // Automatically clean manual status override if it existed
  const key = chassis.toLowerCase();
  if (statusOverrides[key]) {
    delete statusOverrides[key];
    saveStatusOverridesToStorage();
  }

  // Recalculate stock
  syncInventoryFromPurchasesAndSales();

  renderPurchasesTable();
  renderStockDetails();
  renderBillingDropdown();
}

function editPurchaseRecord(chassis) {
  const p = state.purchases.find(p => p.chassis && p.chassis.toLowerCase() === chassis.toLowerCase());
  if (!p) {
    alert('Purchase record not found.');
    return;
  }

  // Populate dynamic form fields
  const fields = (customFieldDefs.purchase || DEFAULT_CUSTOM_FIELDS.purchase);
  fields.forEach(field => {
    const el = document.getElementById('pur-field-' + field.key);
    if (el) {
      el.value = p[field.key] !== undefined ? p[field.key] : '';
    }
  });

  // Change the submit button text to indicate update mode
  const submitBtnSpan = document.querySelector('#purchase-log-form button[type="submit"] span');
  if (submitBtnSpan) {
    submitBtnSpan.textContent = 'Update Purchase & Stock';
  }

  // Smooth scroll to the top of the form
  const formElement = document.getElementById('purchase-log-form');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// --- Dynamic stock table header from customFieldDefs ---
function renderStockTableHeader() {
  const thead = document.querySelector('#stock-valuation-table thead tr');
  if (!thead) return;
  const fields = (customFieldDefs.stock || DEFAULT_CUSTOM_FIELDS.stock)
    .slice().sort((a, b) => a.order - b.order).filter(f => f.visible);

  thead.innerHTML = '';
  fields.forEach(f => {
    const th = document.createElement('th');
    th.textContent = f.label;
    thead.appendChild(th);
  });
  // Always add fixed columns at end
  ['Cost Price', 'Retail Base', 'Margin (₹)', 'Margin (%)', 'Status', 'Actions'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    if (label === 'Actions') th.style.textAlign = 'center';
    thead.appendChild(th);
  });
}

// --- Dynamic sales table header from customFieldDefs ---
function renderSalesTableHeader() {
  const thead = document.querySelector('#sales-history-table thead tr');
  if (!thead) return;
  const fields = (customFieldDefs.sales || DEFAULT_CUSTOM_FIELDS.sales)
    .slice().sort((a, b) => a.order - b.order).filter(f => f.visible);

  thead.innerHTML = '';
  // Fixed first columns
  ['Doc Number', 'Type'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    thead.appendChild(th);
  });
  fields.forEach(f => {
    const th = document.createElement('th');
    th.textContent = f.label;
    thead.appendChild(th);
  });
  // Fixed end columns
  ['Grand Total', 'Amount Paid', 'Balance Due', 'Actions'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    if (label === 'Actions') th.style.textAlign = 'center';
    thead.appendChild(th);
  });
}

// --- Active Stock / Valuation Matrix UI ---
function renderStockDetails() {
  const tbody = document.getElementById('stock-details-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Render dynamic header first
  renderStockTableHeader();

  const visibleFields = (customFieldDefs.stock || DEFAULT_CUSTOM_FIELDS.stock)
    .slice().sort((a, b) => a.order - b.order).filter(f => f.visible);

  state.inventory.forEach(bike => {
    if (!bike) return;
    if (bike.status === 'SOLD') return; // Automatically remove/hide sold products from stock page view
    const row = document.createElement('tr');
    const cost = parseFloat(bike.costPrice) || 0;
    const retail = parseFloat(bike.basePrice) || 0;
    const marginAmt = retail - cost;
    const marginPct = cost > 0 ? (marginAmt / cost) * 100 : 0;

    // Build dynamic cells from visible fields
    let cellsHtml = '';
    visibleFields.forEach(f => {
      const val = bike[f.key] !== undefined ? bike[f.key] : (bike.customData ? bike.customData[f.key] : '');
      if (f.key === 'model') {
        cellsHtml += `<td style="font-weight:600; color:var(--text-main);">${escapeHtml(String(val || 'Imported E-Bike'))}</td>`;
      } else if (['chassis', 'motor', 'battery', 'charger', 'hsn'].includes(f.key)) {
        cellsHtml += `<td style="font-family:monospace;">${escapeHtml(String(val || '-'))}</td>`;
      } else {
        cellsHtml += `<td>${escapeHtml(String(val || '-'))}</td>`;
      }
    });

    row.innerHTML = cellsHtml + `
      <td style="font-weight:700; color:hsl(0, 85%, 65%);">₹ ${Number(cost).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="font-weight:700; color:var(--color-primary);">₹ ${Number(retail).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="font-weight:600; color:hsl(142, 76%, 45%);">₹ ${Number(marginAmt).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="font-weight:600; color:hsl(142, 76%, 40%);">${marginPct.toFixed(1)}%</td>
      <td>
        <select class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem; font-weight:600; width:auto; border-radius:4px; border:1px solid var(--border-glass); cursor:pointer;" onchange="toggleBikeStatus('${escapeHtml(bike.chassis)}', this.value)">
          <option value="STOCK" ${bike.status === 'STOCK' ? 'selected' : ''}>STOCK</option>
          <option value="SOLD" ${bike.status === 'SOLD' ? 'selected' : ''}>SOLD</option>
        </select>
      </td>
      <td style="text-align: center; white-space: nowrap;">
        <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem; width:auto; margin-right: 0.25rem; border-color: var(--color-secondary);" onclick="editBikeDetails('${escapeHtml(bike.chassis)}')">
          Edit
        </button>
        <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.75rem; width:auto;" onclick="deleteBikeDetails('${escapeHtml(bike.chassis)}')">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// --- E-Bike Specifications Direct Editors ---
function editBikeDetails(chassis) {
  const bike = state.inventory.find(b => b.chassis === chassis);
  if (!bike) {
    alert("Vehicle not found in active stock.");
    return;
  }
  
  // Populate edit fields
  document.getElementById('edit-bike-original-chassis').value = bike.chassis;
  document.getElementById('edit-bike-chassis-title').textContent = bike.chassis;
  
  document.getElementById('edit-bike-model').value = bike.model || '';
  document.getElementById('edit-bike-chassis').value = bike.chassis || '';
  document.getElementById('edit-bike-motor').value = bike.motor || '';
  document.getElementById('edit-bike-battery').value = bike.battery || '';
  document.getElementById('edit-bike-charger').value = bike.charger || '';
  document.getElementById('edit-bike-hsn').value = bike.hsn || '871190';
  document.getElementById('edit-bike-cost').value = bike.costPrice || 0;
  document.getElementById('edit-bike-selling').value = bike.basePrice || 0;
  
  // Display form panel
  const panel = document.getElementById('edit-bike-panel');
  if (panel) {
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
  }
}

function cancelEditBike() {
  const panel = document.getElementById('edit-bike-panel');
  if (panel) {
    panel.style.display = 'none';
  }
}

function saveEditedBike(e) {
  e.preventDefault();
  
  const originalChassis = document.getElementById('edit-bike-original-chassis').value;
  const newModel = document.getElementById('edit-bike-model').value.trim();
  const newChassis = document.getElementById('edit-bike-chassis').value.trim();
  const newMotor = document.getElementById('edit-bike-motor').value.trim();
  const newBattery = document.getElementById('edit-bike-battery').value.trim();
  const newCharger = document.getElementById('edit-bike-charger').value.trim();
  const newHsn = document.getElementById('edit-bike-hsn').value.trim();
  const newCost = parseFloat(document.getElementById('edit-bike-cost').value) || 0;
  const newSelling = parseFloat(document.getElementById('edit-bike-selling').value) || 0;
  
  if (!newModel || !newChassis || !newMotor || !newBattery || !newCharger || !newHsn) {
    alert("Please fill in all mandatory fields.");
    return;
  }
  
  if (newCost <= 0 || newSelling <= 0) {
    alert("Prices must be greater than zero.");
    return;
  }
  
  // Check duplicate chassis if chassis is changing
  if (originalChassis.toLowerCase() !== newChassis.toLowerCase()) {
    const chassisExists = state.purchases.some(p => p.chassis.toLowerCase() === newChassis.toLowerCase());
    if (chassisExists) {
      alert("A vehicle with this Chassis Number already exists in the database.");
      return;
    }
  }
  
  // 1. Update purchase ledger entry
  const purchaseIdx = state.purchases.findIndex(p => p.chassis.toLowerCase() === originalChassis.toLowerCase());
  if (purchaseIdx !== -1) {
    state.purchases[purchaseIdx].model = newModel;
    state.purchases[purchaseIdx].chassis = newChassis;
    state.purchases[purchaseIdx].motor = newMotor;
    state.purchases[purchaseIdx].battery = newBattery;
    state.purchases[purchaseIdx].charger = newCharger;
    state.purchases[purchaseIdx].hsn = newHsn;
    state.purchases[purchaseIdx].costPrice = newCost;
    state.purchases[purchaseIdx].sellingPrice = newSelling;
    
    savePurchasesToStorage();
  } else {
    // If not found in purchases, create a new record in purchases to preserve it
    const purchase = {
      billNo: 'MANUAL-EDIT',
      date: new Date().toISOString().split('T')[0],
      supplier: 'Sri Lakshmi e Bikes',
      model: newModel,
      chassis: newChassis,
      motor: newMotor,
      battery: newBattery,
      charger: newCharger,
      hsn: newHsn,
      costPrice: newCost,
      sellingPrice: newSelling
    };
    state.purchases.push(purchase);
    savePurchasesToStorage();
  }
  
  // 2. Update status override index if existed
  const oldKey = originalChassis.toLowerCase();
  const newKey = newChassis.toLowerCase();
  if (statusOverrides[oldKey]) {
    const status = statusOverrides[oldKey];
    delete statusOverrides[oldKey];
    statusOverrides[newKey] = status;
    saveStatusOverridesToStorage();
  }
  
  // 3. Update any matching billing sales history logs to keep data synced
  let transactionUpdated = false;
  state.transactions.forEach(t => {
    if (t && t.billCategory === 'bike' && t.vehicle && t.vehicle.chassis && t.vehicle.chassis.toLowerCase() === originalChassis.toLowerCase()) {
      t.vehicle.model = newModel;
      t.vehicle.chassis = newChassis;
      t.vehicle.motor = newMotor;
      t.vehicle.battery = newBattery;
      t.vehicle.charger = newCharger;
      t.vehicle.hsn = newHsn;
      t.vehicle.costPrice = newCost;
      t.vehicle.basePrice = newSelling;
      transactionUpdated = true;
    }
  });
  if (transactionUpdated) {
    saveTransactionsToStorage();
    renderSalesHistoryTable();
  }
  
  // 4. Update UI
  syncInventoryFromPurchasesAndSales();
  renderPurchasesTable();
  renderStockDetails();
  renderBillingDropdown();
  
  // Hide panel
  cancelEditBike();
  alert("Vehicle specifications successfully updated across all modules!");
}

function deleteBikeDetails(chassis) {
  // Delete without asking for confirmation
  
  // 1. Remove from state.purchases
  state.purchases = state.purchases.filter(p => p.chassis.toLowerCase() !== chassis.toLowerCase());
  savePurchasesToStorage();
  
  // 2. Remove manual status override if it existed
  const key = chassis.toLowerCase();
  if (statusOverrides[key]) {
    delete statusOverrides[key];
    saveStatusOverridesToStorage();
  }
  
  // 3. Update UI
  syncInventoryFromPurchasesAndSales();
  renderPurchasesTable();
  renderStockDetails();
  renderBillingDropdown();
}

function renderBillingDropdown() {
  const select = document.getElementById('vehicle-select');
  if (!select) return;

  select.innerHTML = '';
  
  if (state.currentDocMode === 'quotation') {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Select Vehicle Model for Quotation --';
    select.appendChild(defaultOpt);

    const models = state.quotationModels || [];
    models.forEach(model => {
      const opt = document.createElement('option');
      opt.value = model.id;
      opt.textContent = `${model.name} (Base: ₹ ${Number(model.basePrice).toFixed(2)})`;
      select.appendChild(opt);
    });
  } else {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Select E-Bike from Stock --';
    select.appendChild(defaultOpt);

    const stockBikes = state.inventory.filter(b => b && b.status === 'STOCK');
    stockBikes.forEach(bike => {
      const opt = document.createElement('option');
      opt.value = bike.chassis;
      opt.textContent = `${bike.model || 'Imported E-Bike'} (Chassis: ${bike.chassis || 'N/A'})`;
      select.appendChild(opt);
    });
  }
}

function onVehicleChange(val) {
  const specsBlock = document.getElementById('specs-block');
  if (!val) {
    if (specsBlock) specsBlock.style.display = 'none';
    clearBillingCalculations();
    return;
  }

  if (state.currentDocMode === 'quotation') {
    const model = (state.quotationModels || []).find(m => String(m.id) === String(val));
    if (!model) {
      if (specsBlock) specsBlock.style.display = 'none';
      clearBillingCalculations();
      return;
    }

    // Populate spec values
    document.getElementById('spec-model').textContent = model.name || '-';
    document.getElementById('spec-hsn').textContent = model.hsn || '8711';
    document.getElementById('spec-chassis').textContent = 'N/A';
    document.getElementById('spec-motor').textContent = 'N/A';
    document.getElementById('spec-battery').textContent = 'N/A';
    document.getElementById('spec-charger').textContent = 'N/A';

    if (specsBlock) specsBlock.style.display = 'grid';

    // Set rates and GST percentage
    const baseRateInput = document.getElementById('bill-override-base');
    if (baseRateInput) {
      baseRateInput.value = Number(model.basePrice).toFixed(2);
    }
    const gstSelect = document.getElementById('bill-gst-rate');
    if (gstSelect) {
      gstSelect.value = String(model.gstPct || 5);
    }

    recalculateInvoiceAmounts();
  } else {
    const bike = state.inventory.find(b => b.chassis === val);
    if (!bike) {
      if (specsBlock) specsBlock.style.display = 'none';
      clearBillingCalculations();
      return;
    }

    // Populate spec values
    document.getElementById('spec-model').textContent = bike.model || '-';
    document.getElementById('spec-hsn').textContent = bike.hsn || '871190';
    document.getElementById('spec-chassis').textContent = bike.chassis || '-';
    document.getElementById('spec-motor').textContent = bike.motor || '-';
    document.getElementById('spec-battery').textContent = bike.battery || '-';
    document.getElementById('spec-charger').textContent = bike.charger || '-';

    if (specsBlock) specsBlock.style.display = 'grid';

    updateOverrideInputToProductBasePrice();
    recalculateInvoiceAmounts();
  }
}

// --- Spares Inventory Operations ---
function populateSparesDropdowns() {
  const selectBill = document.getElementById('spares-item-select');
  const selectService = document.getElementById('ser-spare-select');
  if (!selectBill || !selectService) return;

  selectBill.innerHTML = '';
  selectService.innerHTML = '';

  const defaultBill = document.createElement('option');
  defaultBill.value = '';
  defaultBill.textContent = '-- Select Spare Part --';
  selectBill.appendChild(defaultBill);

  const defaultService = document.createElement('option');
  defaultService.value = '';
  defaultService.textContent = '-- Select Spare Part --';
  selectService.appendChild(defaultService);

  // Load only parts that are in stock defensively
  const inStockSpares = (state.spares || []).filter(s => s && s.qty > 0);

  inStockSpares.forEach(s => {
    const optB = document.createElement('option');
    optB.value = s.sku;
    optB.textContent = `${s.name || 'Spare'} (SKU: ${s.sku || '-'}) - Price: ₹${s.sellingPrice || 0}`;
    selectBill.appendChild(optB);

    const optS = document.createElement('option');
    optS.value = s.sku;
    optS.textContent = `${s.name || 'Spare'} (SKU: ${s.sku || '-'}) [Qty In Stock: ${s.qty || 0}]`;
    selectService.appendChild(optS);
  });
}

function renderSparesDetails() {
  const tbody = document.getElementById('spares-details-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  (state.spares || []).forEach((s, idx) => {
    if (!s) return;
    const row = document.createElement('tr');
    
    // Status Badge Reorder alerts
    const isLow = (s.qty || 0) <= (s.minLevel || 0);
    let badgeClass = isLow ? 'badge-reorder' : 'badge-stock';
    let badgeText = isLow ? 'Low Stock' : 'In Stock';

    row.innerHTML = `
      <td style="font-weight:600; color:var(--text-main);">${escapeHtml(s.name || 'Spare Part')}</td>
      <td style="font-family:monospace; font-weight:500;">${escapeHtml(s.sku || '-')}</td>
      <td style="font-family:monospace;">${escapeHtml(s.hsn || '-')}</td>
      <td style="font-weight:700; color:hsl(0, 85%, 65%);">₹ ${Number(s.costPrice || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="font-weight:700; color:var(--color-primary);">₹ ${Number(s.sellingPrice || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="font-weight:700; text-align:center;">${s.qty || 0}</td>
      <td style="text-align:center; color:var(--text-muted);">${s.minLevel || 0}</td>
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
      <td>
        <button class="btn btn-danger" style="padding:0.4rem 0.65rem; font-size:0.75rem; width:auto;" onclick="deleteSparePartRecord(${idx})">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function handleNewSpareForm(e) {
  e.preventDefault();

  const name = document.getElementById('spare-name').value.trim();
  const sku = document.getElementById('spare-sku').value.trim();
  const hsn = document.getElementById('spare-hsn').value.trim();
  const qty = parseInt(document.getElementById('spare-qty').value);
  const minLevel = parseInt(document.getElementById('spare-min-level').value);
  const costPrice = parseFloat(document.getElementById('spare-cost').value);
  const sellingPrice = parseFloat(document.getElementById('spare-retail').value);

  if (isNaN(qty) || qty < 0 || isNaN(minLevel) || minLevel < 0 || isNaN(costPrice) || isNaN(sellingPrice)) {
    alert('Please enter valid numeric parameters.');
    return;
  }

  // Duplicate Check
  const skuExists = state.spares.some(s => s.sku.toLowerCase() === sku.toLowerCase());
  if (skuExists) {
    alert('Database Violation: A spare part with this SKU number already exists.');
    return;
  }

  const spare = { sku, name, hsn, costPrice, sellingPrice, qty, minLevel };
  state.spares.push(spare);
  saveSparesToStorage();

  renderSparesDetails();
  populateSparesDropdowns();

  document.getElementById('spare-part-form').reset();
  document.getElementById('spare-hsn').value = '871410';

  alert(`Spare Part "${name}" successfully registered in catalog.`);
}

function deleteSparePartRecord(index) {
  // Delete without asking for confirmation
  state.spares.splice(index, 1);
  saveSparesToStorage();
  
  renderSparesDetails();
  populateSparesDropdowns();
}

// --- E-Bike Billing Page UI Switches ---
function setBillingCategory(category) {
  state.currentBillingCategory = category;

  const btnBike = document.getElementById('bill-cat-bike');
  const btnSpares = document.getElementById('bill-cat-spares');
  const panelBike = document.getElementById('billing-bike-panel');
  const panelSpares = document.getElementById('billing-spares-panel');

  const cgstLbl = document.getElementById('cgst-label-pct');
  const sgstLbl = document.getElementById('sgst-label-pct');
  const igstLbl = document.getElementById('igst-label-pct');

  if (category === 'bike') {
    btnBike.classList.add('active');
    btnSpares.classList.remove('active');
    panelBike.style.display = 'block';
    panelSpares.style.display = 'none';

    // 5% standard vehicle tax labels
    cgstLbl.textContent = 'CGST (2.5%)';
    sgstLbl.textContent = 'SGST (2.5%)';
    igstLbl.textContent = 'IGST (5%)';
  } else {
    btnBike.classList.remove('active');
    btnSpares.classList.add('active');
    panelBike.style.display = 'none';
    panelSpares.style.display = 'block';

    // 18% standard spare parts / labor services tax labels
    cgstLbl.textContent = 'CGST (9%)';
    sgstLbl.textContent = 'SGST (9%)';
    igstLbl.textContent = 'IGST (18%)';
  }

  // Relocate the single #id-details-container to the active panel placeholder
  const idContainer = document.getElementById('id-details-container');
  if (idContainer) {
    if (category === 'bike') {
      const placeholderBike = document.getElementById('id-details-placeholder-bike');
      if (placeholderBike) placeholderBike.appendChild(idContainer);
    } else {
      const placeholderSpares = document.getElementById('id-details-placeholder-spares');
      if (placeholderSpares) placeholderSpares.appendChild(idContainer);
    }
  }

  // Clear overrides when switching billing categories
  document.getElementById('override-toggle').checked = false;
  toggleOverrideTotal(false);

  recalculateInvoiceAmounts();
}

function setDocMode(mode) {
  state.currentDocMode = mode;

  const btnInvoice = document.getElementById('mode-invoice');
  const btnQuotation = document.getElementById('mode-quotation');
  
  const bikePanelHeader = document.querySelector('#billing-bike-panel .card-title');
  const selectLabel = document.querySelector('label[for="vehicle-select"]');

  if (mode === 'invoice') {
    btnInvoice.classList.add('active');
    if (btnQuotation) btnQuotation.classList.remove('active');
    
    if (bikePanelHeader) bikePanelHeader.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zm-2-4h-8.5l-1-2.5h10.5L17 13zm-8.5-2.5L7 5H3.5"/></svg>
      Select E-Bike
    `;
    if (selectLabel) selectLabel.textContent = 'Select E-Bike from STOCK *';
  } else {
    btnInvoice.classList.remove('active');
    if (btnQuotation) btnQuotation.classList.add('active');
    
    if (bikePanelHeader) bikePanelHeader.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M7 8h10M7 12h10M7 16h6M4 4h16v16H4z"/></svg>
      Select Vehicle Model for Quotation
    `;
    if (selectLabel) selectLabel.textContent = 'Select Quoted Vehicle Model *';
  }

  // Update the dropdown options to reflect the selected mode
  renderBillingDropdown();

  // If we change mode, update the invoice number prefix and fields
  const invoiceInput = document.getElementById('bill-invoice-no');
  if (invoiceInput) {
    invoiceInput.value = generateDocumentNumber(mode);
  }

  // Reset the active selected vehicle fields
  const specsBlock = document.getElementById('specs-block');
  if (specsBlock) specsBlock.style.display = 'none';
  clearBillingCalculations();
}

function setTaxMode(mode) {
  state.currentTaxMode = mode;

  const btnIntra = document.getElementById('tax-intra');
  const btnInter = document.getElementById('tax-inter');

  const sgstCgstBlock = document.getElementById('sgst-cgst-block');
  const igstBlock = document.getElementById('igst-block');

  if (mode === 'intrastate') {
    btnIntra.classList.add('active');
    btnInter.classList.remove('active');
    if (sgstCgstBlock) sgstCgstBlock.style.display = 'block';
    if (igstBlock) igstBlock.style.display = 'none';
  } else {
    btnIntra.classList.remove('active');
    btnInter.classList.add('active');
    if (sgstCgstBlock) sgstCgstBlock.style.display = 'none';
    if (igstBlock) igstBlock.style.display = 'block';
  }

  recalculateInvoiceAmounts();
}

// --- Spares Multi-item Bill Builder ---
function addSpareToBillList() {
  const sku = document.getElementById('spares-item-select').value;
  const qtyInput = document.getElementById('spares-item-qty');
  const qty = parseInt(qtyInput.value);

  if (!sku) {
    alert('Please select a spare part.');
    return;
  }

  if (isNaN(qty) || qty <= 0) {
    alert('Please enter a valid quantity.');
    return;
  }

  const spare = state.spares.find(s => s.sku === sku);
  if (!spare) return;

  // Stock check
  if (qty > spare.qty) {
    alert(`Insufficient Stock! Only ${spare.qty} unit(s) of "${spare.name}" available in inventory.`);
    return;
  }

  // Check if item already in current bill list
  const existing = state.billingSparesList.find(item => item.sku === sku);
  if (existing) {
    if (existing.qty + qty > spare.qty) {
      alert(`Insufficient Stock! Adding this quantity exceeds available stock (${spare.qty} total).`);
      return;
    }
    existing.qty += qty;
    existing.amount = existing.qty * existing.rate;
  } else {
    state.billingSparesList.push({
      sku: spare.sku,
      name: spare.name,
      hsn: spare.hsn,
      qty: qty,
      rate: spare.sellingPrice,
      amount: qty * spare.sellingPrice
    });
  }

  // Reset inputs & recalculate
  qtyInput.value = '1';
  document.getElementById('spares-item-select').value = '';
  renderBillingSparesTable();
  updateOverrideInputToProductBasePrice();
  recalculateInvoiceAmounts();
}

function removeSpareFromBillList(index) {
  state.billingSparesList.splice(index, 1);
  renderBillingSparesTable();
  updateOverrideInputToProductBasePrice();
  recalculateInvoiceAmounts();
}

function renderBillingSparesTable() {
  const tbody = document.getElementById('spares-bill-tbody');
  tbody.innerHTML = '';

  if (state.billingSparesList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No spares added to bill.</td></tr>`;
    return;
  }

  state.billingSparesList.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-weight:600;">${escapeHtml(item.name)}</td>
      <td style="text-align:center; font-weight:700;">${item.qty}</td>
      <td style="text-align:right;">₹ ${Number(item.rate).toFixed(2)}</td>
      <td style="text-align:right; font-weight:700; color:var(--color-primary);">₹ ${Number(item.amount).toFixed(2)}</td>
      <td style="text-align:center;">
        <button type="button" class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.75rem; width:auto;" onclick="removeSpareFromBillList(${idx})">
          Remove
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// --- Grand Total Custom Overrides ---
function updateOverrideInputToProductBasePrice() {
  if (!state.overrideTotalEnabled) return;
  const input = document.getElementById('override-total-input');
  if (!input) return;
  
  let baseVal = 0;
  if (state.currentBillingCategory === 'bike') {
    const selectedVal = document.getElementById('vehicle-select').value;
    if (selectedVal) {
      if (state.currentDocMode === 'quotation') {
        // In quotation mode the select value is a model ID, not a chassis
        const qModel = (state.quotationModels || []).find(m => String(m.id) === String(selectedVal));
        if (qModel) baseVal = Number(qModel.basePrice) || 0;
      } else {
        const bike = state.inventory.find(b => b.chassis === selectedVal);
        if (bike) baseVal = bike.basePrice;
      }
    }
  } else {
    const sparesSum = state.billingSparesList.reduce((sum, item) => sum + item.amount, 0);
    const labor = parseFloat(document.getElementById('bill-labor-charge').value) || 0;
    baseVal = sparesSum + labor;
  }
  
  input.value = baseVal > 0 ? baseVal.toFixed(2) : '';
  state.overrideTotalValue = baseVal;
}

function toggleOverrideTotal(checked) {
  state.overrideTotalEnabled = checked;
  const input = document.getElementById('override-total-input');
  
  if (checked) {
    input.style.display = 'block';
    updateOverrideInputToProductBasePrice();
    input.focus();
  } else {
    input.style.display = 'none';
    input.value = '';
    state.overrideTotalValue = 0;
  }
  recalculateInvoiceAmounts();
}

function onOverrideTotalChange() {
  const value = parseFloat(document.getElementById('override-total-input').value);
  if (isNaN(value) || value < 0) {
    state.overrideTotalValue = 0;
  } else {
    state.overrideTotalValue = value;
  }
  recalculateInvoiceAmounts();
}

function toggleGstinField(checked) {
  const wrapper = document.getElementById('gstin-input-wrapper');
  if (wrapper) {
    wrapper.style.display = checked ? 'block' : 'none';
  }
}

function toggleIdDetailsField(checked) {
  const wrapper = document.getElementById('id-details-fields');
  if (wrapper) {
    wrapper.style.display = checked ? 'flex' : 'none';
  }
  recalculateInvoiceAmounts();
}

// --- Complete Billing Auto-Calculator ---
function recalculateInvoiceAmounts() {
  const isBike = state.currentBillingCategory === 'bike';
  
  let baseRate = 0;
  let taxRate = isBike ? 0.05 : 0.18; // 5% GST on vehicles, 18% on spares/labor
  
  // Calculate raw subtotal based on category
  if (isBike) {
    const selectedVal = document.getElementById('vehicle-select').value;
    if (!selectedVal) {
      clearBillingCalculations();
      return;
    }

    if (state.currentDocMode === 'quotation') {
      // Quotation mode: look up from quotation models catalog by model ID
      const qModel = (state.quotationModels || []).find(m => String(m.id) === String(selectedVal));
      if (!qModel) { clearBillingCalculations(); return; }
      baseRate = Number(qModel.basePrice) || 0;
      taxRate = (Number(qModel.gstPct) || 5) / 100;
    } else {
      // Invoice mode: look up from inventory by chassis number
      const bike = state.inventory.find(b => b.chassis === selectedVal);
      if (!bike) return;
      baseRate = bike.basePrice;
    }

    // Override base price if manual override input is filled
    if (!state.overrideTotalEnabled) {
      const overrideInput = document.getElementById('bill-override-base');
      if (overrideInput && overrideInput.value) {
        const overrideBase = parseFloat(overrideInput.value);
        if (!isNaN(overrideBase) && overrideBase > 0) baseRate = overrideBase;
      }
    }

    // Also read GST rate from the dropdown selector if available
    const gstDropdown = document.getElementById('bill-gst-rate');
    if (gstDropdown && gstDropdown.value && !state.overrideTotalEnabled) {
      const selectedGst = parseFloat(gstDropdown.value);
      if (!isNaN(selectedGst)) taxRate = selectedGst / 100;
    }
  } else {
    // Spares cost sum + labor charge
    const sparesSum = state.billingSparesList.reduce((sum, item) => sum + item.amount, 0);
    const labor = parseFloat(document.getElementById('bill-labor-charge').value) || 0;
    baseRate = sparesSum + labor;
  }

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let grandTotal = 0;

  if (state.overrideTotalEnabled && state.overrideTotalValue > 0) {
    // 🔥 MATHEMATICAL BACK-CALCULATION FROM GRAND TOTAL OVERRIDE
    grandTotal = state.overrideTotalValue;
    
    // Base = Total / (1 + taxRate)
    baseRate = Math.round((grandTotal / (1 + taxRate)) * 100) / 100;
    
    const taxDiff = Math.round((grandTotal - baseRate) * 100) / 100;

    if (state.currentTaxMode === 'intrastate') {
      cgst = Math.round((taxDiff / 2) * 100) / 100;
      sgst = Math.round((taxDiff / 2) * 100) / 100;
    } else {
      igst = taxDiff;
    }
  } else {
    // STANDARD FORWARD CALCULATION
    if (state.currentTaxMode === 'intrastate') {
      cgst = Math.round(baseRate * (taxRate / 2) * 100) / 100;
      sgst = Math.round(baseRate * (taxRate / 2) * 100) / 100;
      grandTotal = baseRate + cgst + sgst;
    } else {
      igst = Math.round(baseRate * taxRate * 100) / 100;
      grandTotal = baseRate + igst;
    }
    grandTotal = Math.round(grandTotal * 100) / 100;
  }

  // ID Purchase Cost Adjustment
  const useId = document.getElementById('toggle-id-details').checked;
  const idCostVal = parseFloat(document.getElementById('bill-id-cost').value) || 0;
  const idTreatment = document.getElementById('bill-id-treatment').value;
  
  if (useId && idCostVal > 0) {
    document.getElementById('id-cost-summary-row').style.display = 'flex';
    document.getElementById('id-cost-summary-label').textContent = `ID Purchase Cost (${idTreatment === 'add' ? '+' : '-'})`;
    document.getElementById('calc-id-cost').textContent = (idTreatment === 'subtract' ? '- ' : '') + formatCurrency(idCostVal);
    if (idTreatment === 'add') {
      grandTotal += idCostVal;
    } else {
      grandTotal -= idCostVal;
    }
  } else {
    document.getElementById('id-cost-summary-row').style.display = 'none';
  }

  // Merge Previous Overdue (Post-Tax directly to Grand Total)
  const mergePrevOutstanding = document.getElementById('toggle-prev-outstanding')?.checked;
  if (mergePrevOutstanding && state.prevOutstandingVal > 0) {
    document.getElementById('prev-overdue-summary-row').style.display = 'flex';
    document.getElementById('calc-prev-overdue').textContent = formatCurrency(state.prevOutstandingVal);
    grandTotal += state.prevOutstandingVal;
  } else {
    document.getElementById('prev-overdue-summary-row').style.display = 'none';
  }
  grandTotal = Math.round(grandTotal * 100) / 100;

  const paidInput = document.getElementById('amount-paid');
  let paidAmount = parseFloat(paidInput.value);
  if (isNaN(paidAmount) || paidAmount < 0) {
    paidAmount = 0;
  }
  const balanceDue = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

  // Render on Billing tab
  document.getElementById('calc-base').textContent = formatCurrency(baseRate);
  document.getElementById('calc-cgst').textContent = formatCurrency(cgst);
  document.getElementById('calc-sgst').textContent = formatCurrency(sgst);
  document.getElementById('calc-igst').textContent = formatCurrency(igst);
  document.getElementById('calc-total').textContent = formatCurrency(grandTotal);
  
  const balanceElement = document.getElementById('calc-balance');
  balanceElement.textContent = formatCurrency(balanceDue);
  
  if (balanceDue > 0) balanceElement.className = 'row-value due';
  else balanceElement.className = 'row-value cleared';
}

function clearBillingCalculations() {
  document.getElementById('calc-base').textContent = formatCurrency(0);
  document.getElementById('calc-cgst').textContent = formatCurrency(0);
  document.getElementById('calc-sgst').textContent = formatCurrency(0);
  document.getElementById('calc-igst').textContent = formatCurrency(0);
  document.getElementById('calc-total').textContent = formatCurrency(0);
  document.getElementById('amount-paid').value = '';
  document.getElementById('calc-balance').textContent = formatCurrency(0);
}

// --- Submit sale checkout transactions ---
// --- Finalize transaction and write to database ---
function finalizeTransaction(transaction, isBike, sparesList) {
  // State Subtractions
  if (isBike) {
    if (transaction.docType === 'invoice') {
      // Note: Vehicle status is dynamically derived from state.transactions, so no manual manipulation is required here!
    }
  } else {
    // Deduct quantity from Spares inventory if final Tax Invoice
    if (transaction.docType === 'invoice') {
      sparesList.forEach(billedItem => {
        const spare = state.spares.find(s => s.sku === billedItem.sku);
        if (spare) {
          spare.qty = Math.max(0, spare.qty - billedItem.qty);
        }
      });
      saveSparesToStorage();
      renderSparesDetails();
      populateSparesDropdowns();
    }
  }

  // Handle previous overdues settlement!
  const mergePrevOutstanding = document.getElementById('toggle-prev-outstanding')?.checked;
  if (mergePrevOutstanding && state.prevOutstandingVal > 0) {
    state.transactions.forEach(t => {
      if (t && t.customer && t.customer.phone === transaction.customer.phone && t.docType === 'invoice') {
        if (t.financials && t.financials.balance > 0) {
          t.financials.paid = t.financials.total;
          t.financials.balance = 0;
        }
      }
    });
  }

  // Save transaction
  state.transactions.push(transaction);
  saveTransactionsToStorage();
  
  // Dynamically derive inventory stock from purchases and transactions!
  syncInventoryFromPurchasesAndSales();

  renderSalesHistoryTable();
  renderStockDetails();
  renderBillingDropdown();

  // Load to print preview
  state.loadedTransaction = transaction;
  renderInvoicePrintSheet(transaction);

  // Clean billing page
  resetBillingForm();
  state.billingSparesList = [];
  renderBillingSparesTable();

  // Reset outstanding values
  state.prevOutstandingVal = 0;
  const prevOutstandingBlock = document.getElementById('prev-outstanding-block');
  if (prevOutstandingBlock) prevOutstandingBlock.style.display = 'none';
  const togglePrevOutstanding = document.getElementById('toggle-prev-outstanding');
  if (togglePrevOutstanding) togglePrevOutstanding.checked = false;

  switchTab('invoice-printer-tab');

  // Automatically trigger system print for both invoices and quotations!
  setTimeout(() => {
    window.print();
  }, 350);
}

// --- Submit sale checkout transactions ---
function processTransaction() {
  const isBike = state.currentBillingCategory === 'bike';
  const custName = document.getElementById('cust-name').value.trim();
  const custPhone = document.getElementById('cust-phone').value.trim();
  const custEmail = document.getElementById('cust-email').value.trim();
  const custAddress = document.getElementById('cust-address').value.trim();
  
  const useGstin = document.getElementById('toggle-gstin').checked;
  const custGstin = useGstin ? document.getElementById('cust-gstin').value.trim() : '';
  
  const useIdDetails = document.getElementById('toggle-id-details').checked;
  const idNo = useIdDetails ? document.getElementById('bill-id-no').value.trim() : '';
  const idCost = useIdDetails ? (parseFloat(document.getElementById('bill-id-cost').value) || 0) : 0;
  const idTreatment = useIdDetails ? document.getElementById('bill-id-treatment').value : 'add';
  
  const refNo = document.getElementById('cust-ref-no').value.trim();
  
  const paymentType = isBike 
    ? document.getElementById('bill-payment-type').value 
    : document.getElementById('bill-payment-type-spares').value;
  
  const paidVal = document.getElementById('amount-paid').value;

  if (!custName || !custPhone || !custAddress) {
    alert('Please enter Buyer Name, Phone, and Address before processing.');
    return;
  }

  const phoneReg = /^[0-9]{10}$/;
  if (!phoneReg.test(custPhone)) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  // Mode validation
  let bikeChassis = '';
  if (isBike) {
    bikeChassis = document.getElementById('vehicle-select').value;
    if (!bikeChassis) {
      const alertMsg = state.currentDocMode === 'quotation' ? 'Please select a vehicle model.' : 'Please select an e-bike.';
      alert(alertMsg);
      return;
    }
  } else {
    const isOverride = state.overrideTotalEnabled && state.overrideTotalValue > 0;
    if (!isOverride && state.billingSparesList.length === 0 && (parseFloat(document.getElementById('bill-labor-charge').value) || 0) === 0) {
      alert('Please add spare parts or input service labor charges.');
      return;
    }
  }

  let bike = null;
  let sparesList = [];
  let laborCharges = 0;
  let baseRate = 0;
  let taxRate = isBike ? 0.05 : 0.18;

  if (isBike) {
    if (state.currentDocMode === 'quotation') {
      const model = (state.quotationModels || []).find(m => String(m.id) === String(bikeChassis));
      if (!model) {
        alert('Selected vehicle model not found.');
        return;
      }
      // Create mock vehicle object for printing and sales history purposes
      bike = {
        model: model.name,
        chassis: 'N/A',
        motor: 'N/A',
        battery: 'N/A',
        charger: 'N/A',
        hsn: model.hsn || '8711',
        basePrice: model.basePrice,
        gstPct: model.gstPct
      };
      baseRate = model.basePrice;
      taxRate = (model.gstPct || 5) / 100;
      // Respect manual base price override if the user typed a custom price
      const overrideBaseInput = document.getElementById('bill-override-base');
      if (overrideBaseInput && overrideBaseInput.value) {
        const overrideVal = parseFloat(overrideBaseInput.value);
        if (!isNaN(overrideVal) && overrideVal > 0) baseRate = overrideVal;
      }
      // Also read GST rate from dropdown if available
      const gstDd = document.getElementById('bill-gst-rate');
      if (gstDd && gstDd.value) {
        const gstDdVal = parseFloat(gstDd.value);
        if (!isNaN(gstDdVal)) taxRate = gstDdVal / 100;
      }
    } else {
      bike = state.inventory.find(b => b.chassis === bikeChassis);
      if (!bike) {
        alert('Selected E-Bike not found in inventory.');
        return;
      }
      baseRate = bike.basePrice;
    }
  } else {
    sparesList = [...state.billingSparesList];
    laborCharges = parseFloat(document.getElementById('bill-labor-charge').value) || 0;
    baseRate = sparesList.reduce((sum, item) => sum + item.amount, 0) + laborCharges;
  }

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let grandTotal = 0;

  if (state.overrideTotalEnabled && state.overrideTotalValue > 0) {
    grandTotal = state.overrideTotalValue;
    baseRate = Math.round((grandTotal / (1 + taxRate)) * 100) / 100;
    const taxDiff = Math.round((grandTotal - baseRate) * 100) / 100;
    if (state.currentTaxMode === 'intrastate') {
      cgst = Math.round((taxDiff / 2) * 100) / 100;
      sgst = Math.round((taxDiff / 2) * 100) / 100;
    } else {
      igst = taxDiff;
    }
  } else {
    if (state.currentTaxMode === 'intrastate') {
      cgst = Math.round(baseRate * (taxRate / 2) * 100) / 100;
      sgst = Math.round(baseRate * (taxRate / 2) * 100) / 100;
      grandTotal = baseRate + cgst + sgst;
    } else {
      igst = Math.round(baseRate * taxRate * 100) / 100;
      grandTotal = baseRate + igst;
    }
    grandTotal = Math.round(grandTotal * 100) / 100;
  }

  // ID Purchase Cost Adjustment inside processTransaction
  if (useIdDetails && idCost > 0) {
    if (idTreatment === 'add') {
      grandTotal += idCost;
    } else {
      grandTotal -= idCost;
    }
    grandTotal = Math.round(grandTotal * 100) / 100;
  }

  // Merge Previous Overdue directly in checkout totals!
  const mergePrevOutstanding = document.getElementById('toggle-prev-outstanding')?.checked;
  if (mergePrevOutstanding && state.prevOutstandingVal > 0) {
    grandTotal += state.prevOutstandingVal;
    grandTotal = Math.round(grandTotal * 100) / 100;
  }

  let paidAmount = parseFloat(paidVal);
  if (isNaN(paidAmount) || paidAmount < 0) {
    paidAmount = 0;
  }
  const balanceDue = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

  const docNo = document.getElementById('bill-invoice-no').value.trim() || generateDocumentNumber(state.currentDocMode);
  const dateStr = document.getElementById('bill-date').value.trim() || getCurrentDateString();

  const useNotes = document.getElementById('bill-print-notes-toggle')?.checked || false;
  const notesText = useNotes ? (document.getElementById('bill-notes-input')?.value.trim() || '') : '';

  const transaction = {
    id: docNo,
    docType: state.currentDocMode,
    taxMode: state.currentTaxMode,
    date: dateStr,
    paymentType: paymentType,
    refNo: refNo,
    billCategory: state.currentBillingCategory,
    notes: {
      active: useNotes,
      text: notesText
    },
    customer: {
      name: custName,
      phone: custPhone,
      address: custAddress,
      gstin: custGstin,
      email: custEmail
    },
    printOptions: {
      address: document.getElementById('toggle-print-address').checked,
      phone: document.getElementById('toggle-print-phone').checked,
      gstin: document.getElementById('toggle-print-gstin').checked,
      email: document.getElementById('toggle-print-email').checked,
    },
    idDetails: {
      active: useIdDetails,
      idNo: idNo,
      cost: idCost,
      treatment: idTreatment
    },
    vehicle: bike ? { ...bike } : null,
    items: bike ? [{ modelName: bike.model, qty: 1, rate: baseRate }] : [],
    spares: sparesList,
    labor: laborCharges,
    financials: {
      base: baseRate,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      total: grandTotal,
      paid: paidAmount,
      balance: balanceDue,
      mergedOverdue: (mergePrevOutstanding && state.prevOutstandingVal > 0) ? state.prevOutstandingVal : 0
    }
  };

  // Confirm before processing sale inside premium web-native modal
  const docClassTitle = state.currentDocMode === 'quotation' ? 'Quotation' : 'Tax Invoice';
  const confirmMsg = `Buyer: ${custName}\n` +
                      `Payment Type: ${paymentType}\n` +
                      `Grand Total: ₹ ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  showCustomConfirm(
    `Confirm Sale Checkout`,
    `Are you sure you want to process this ${docClassTitle}?\n\n` + confirmMsg,
    () => {
      finalizeTransaction(transaction, isBike, sparesList);
    }
  );
}

// --- Sales details history & serials expands drawers ---
function renderSalesHistoryTable() {
  const tbody = document.getElementById('sales-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Render dynamic header first
  renderSalesTableHeader();

  const visibleFields = (customFieldDefs.sales || DEFAULT_CUSTOM_FIELDS.sales)
    .slice().sort((a, b) => a.order - b.order).filter(f => f.visible);

  const salesInvoices = (state.transactions || []).filter(t => t && t.docType === 'invoice');

  if (salesInvoices.length === 0) {
    const colspan = 2 + visibleFields.length + 4;
    tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; color:var(--text-muted);">No sales invoices processed yet.</td></tr>`;
    return;
  }

  state.transactions.forEach((tx, idx) => {
    if (!tx) return;
    if (tx.docType === 'quotation') return; // Hide quotations in Sales Details History
    const row = document.createElement('tr');
    
    const docNo = tx.id || 'N/A';
    const docType = tx.docType || 'invoice';
    
    let cellsHtml = `
      <td style="font-family:monospace; font-weight:700;">${escapeHtml(docNo)}</td>
      <td><span class="badge ${docType === 'invoice' ? 'badge-sold' : 'badge-stock'}">${docType.toUpperCase()}</span></td>
    `;

    visibleFields.forEach(f => {
      let val = '';
      if (f.key === 'custName') {
        val = (tx.customer && tx.customer.name) ? tx.customer.name : '';
      } else if (f.key === 'phone') {
        val = (tx.customer && tx.customer.phone) ? tx.customer.phone : '';
      } else if (f.key === 'gstin') {
        val = (tx.customer && tx.customer.gstin) ? tx.customer.gstin : '';
      } else if (f.key === 'address') {
        val = (tx.customer && tx.customer.address) ? tx.customer.address : '';
      } else if (f.key === 'date') {
        val = tx.date || '';
      } else if (f.key === 'model') {
        val = (tx.vehicle && tx.vehicle.model) ? tx.vehicle.model : '';
        if (tx.billCategory !== 'bike') {
          // For spares, compile spares list as the description
          const sparesList = tx.spares || [];
          const partsText = sparesList.map(s => (s && s.name) ? s.name : 'Spare').join(', ');
          const labor = tx.labor || 0;
          let itemDesc = partsText ? `Spares: ${partsText}` : 'Servicing Charges';
          if (labor > 0 && partsText) itemDesc += ' & Labor';
          else if (labor > 0) itemDesc = 'Labor Servicing';
          val = itemDesc;
        }
      } else if (f.key === 'chassis') {
        val = (tx.vehicle && tx.vehicle.chassis) ? tx.vehicle.chassis : '-';
      } else if (f.key === 'motor') {
        val = (tx.vehicle && tx.vehicle.motor) ? tx.vehicle.motor : '-';
      } else if (f.key === 'battery') {
        val = (tx.vehicle && tx.vehicle.battery) ? tx.vehicle.battery : '-';
      } else if (f.key === 'amount') {
        val = (tx.financials && tx.financials.total) ? '₹ ' + Number(tx.financials.total).toLocaleString('en-IN', {minimumFractionDigits:2}) : '₹ 0.00';
      } else {
        // Custom fields
        val = tx[f.key] !== undefined ? tx[f.key] : (tx.customData ? tx.customData[f.key] : '-');
      }

      if (f.key === 'custName') {
        cellsHtml += `<td style="font-weight:600;"><span style="cursor:pointer; color:var(--color-primary); text-decoration:underline;" onclick="loadCustomerToBilling(${idx})">${escapeHtml(val)}</span><span style="cursor:pointer; margin-left: 0.5rem; opacity:0.7;" onclick="expandVehicleSerials(${idx})">🔍</span></td>`;
      } else if (['chassis', 'motor', 'battery'].includes(f.key)) {
        cellsHtml += `<td style="font-family:monospace;">${escapeHtml(val)}</td>`;
      } else if (f.key === 'amount') {
        cellsHtml += `<td style="font-weight:700;">${escapeHtml(val)}</td>`;
      } else {
        cellsHtml += `<td>${escapeHtml(val)}</td>`;
      }
    });

    const financials = tx.financials || { total: 0, paid: 0, balance: 0 };
    const total = financials.total || 0;
    const paid = financials.paid || 0;
    const balance = financials.balance || 0;

    const payDueBtn = balance > 0 
      ? `<button class="btn btn-primary" style="padding:0.4rem 0.6rem; font-size:0.75rem; width:auto; background:linear-gradient(135deg, var(--color-primary), var(--color-accent));" onclick="openCollectDueModal('${idx}')">Pay Due</button>`
      : '';

    const loadBillBtn = tx.docType === 'quotation'
      ? `<button class="btn btn-primary" style="padding:0.4rem 0.6rem; font-size:0.75rem; width:auto; background:linear-gradient(135deg, var(--color-secondary), var(--color-primary)); border-color:var(--color-primary); color:#fff;" onclick="loadCustomerToBilling(${idx})">Load/Bill</button>`
      : '';

    cellsHtml += `
      <td style="font-weight:700;">₹ ${Number(total).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="font-weight:700; color:hsl(142, 76%, 45%);">₹ ${Number(paid).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="font-weight:700; color:${balance > 0 ? 'hsl(0, 85%, 60%)' : 'var(--color-stock)'};">
        ₹ ${Number(balance).toLocaleString('en-IN', {minimumFractionDigits:2})}
      </td>
      <td>
        <div style="display:flex; gap:0.35rem; justify-content:center;">
          ${payDueBtn}
          ${loadBillBtn}
          <button class="btn btn-secondary" style="padding:0.4rem 0.6rem; font-size:0.75rem; width:auto;" onclick="loadAndPrintInvoice('${escapeHtml(docNo)}')">
            Print
          </button>
          <button class="btn btn-secondary" style="padding:0.4rem 0.6rem; font-size:0.75rem; width:auto; border-color:var(--color-secondary);" onclick="editTransactionDetails(${idx})">
            Edit
          </button>
          <button class="btn btn-danger" style="padding:0.4rem 0.6rem; font-size:0.75rem; width:auto;" onclick="deleteTransactionRecord(${idx})">
            Delete
          </button>
        </div>
      </td>
    `;

    row.innerHTML = cellsHtml;
    tbody.appendChild(row);
  });
}

// Expands row specs slider drawer
function expandVehicleSerials(index) {
  const tx = state.transactions[index];
  if (!tx) return;

  const panel = document.getElementById('sales-spec-details-panel');
  const grid = document.getElementById('sales-details-grid-specs');
  if (!panel || !grid) return;
  grid.innerHTML = '';

  if (tx.billCategory === 'bike') {
    const v = tx.vehicle || {};
    // Calculate margins
    const cost = v.costPrice || 0;
    const retail = v.basePrice || 0;
    const marginAmt = retail - cost;
    const marginPct = cost > 0 ? (marginAmt / cost) * 100 : 0;

    grid.innerHTML = `
      <div class="spec-item"><strong>Vehicle Model:</strong> <span>${escapeHtml(v.model || '-')}</span></div>
      <div class="spec-item"><strong>HSN Code:</strong> <span>${escapeHtml(v.hsn || '871190')}</span></div>
      <div class="spec-item"><strong>Chassis No:</strong> <span style="font-family:monospace;">${escapeHtml(v.chassis || '-')}</span></div>
      <div class="spec-item"><strong>Motor No:</strong> <span style="font-family:monospace;">${escapeHtml(v.motor || '-')}</span></div>
      <div class="spec-item"><strong>Battery No:</strong> <span style="font-family:monospace;">${escapeHtml(v.battery || '-')}</span></div>
      <div class="spec-item"><strong>Charger No:</strong> <span style="font-family:monospace;">${escapeHtml(v.charger || '-')}</span></div>
      <div class="spec-item"><strong>Dealer Cost:</strong> <span style="color:hsl(0, 85%, 65%); font-weight:700;">₹ ${Number(cost).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>
      <div class="spec-item"><strong>Retail Base Price:</strong> <span style="color:var(--color-primary); font-weight:700;">₹ ${Number(retail).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>
      <div class="spec-item"><strong>Showroom Margin:</strong> <span style="color:hsl(142, 76%, 45%); font-weight:700;">₹ ${Number(marginAmt).toLocaleString('en-IN', {minimumFractionDigits:2})} (${marginPct.toFixed(1)}%)</span></div>
      <div class="spec-item" style="grid-column: span 3; border-top:1px dashed var(--border-glass); padding-top:0.5rem; margin-top:0.5rem;">
        <strong>Reference No:</strong> <span>${escapeHtml(tx.refNo || 'NON REG')}</span> | 
        <strong>Payment Type:</strong> <span>${escapeHtml(tx.paymentType || 'CASH')}</span>
      </div>
    `;
  } else {
    // Spares specs expanded grid
    const sparesList = tx.spares || [];
    let sparesRows = sparesList.map(s => {
      if (!s) return '';
      return `• ${escapeHtml(s.name || 'Spare')} (SKU: ${escapeHtml(s.sku || '-')}) x${s.qty || 1} - Rate: ₹${(s.rate || 0).toFixed(2)}`;
    }).join('<br>');
    if (!sparesRows) sparesRows = 'No spares purchased.';
    const labor = tx.labor || 0;
    
    grid.innerHTML = `
      <div class="spec-item" style="grid-column: span 2;"><strong>Billed Spares List:</strong> <span style="line-height:1.4;">${sparesRows}</span></div>
      <div class="spec-item"><strong>Labor Service Fees:</strong> <span style="font-weight:700; color:var(--color-primary);">₹ ${Number(labor).toFixed(2)}</span></div>
      <div class="spec-item" style="grid-column: span 3; border-top:1px dashed var(--border-glass); padding-top:0.5rem; margin-top:0.5rem;">
        <strong>Reference No:</strong> <span>${escapeHtml(tx.refNo || 'NON REG')}</span> | 
        <strong>Payment Type:</strong> <span>${escapeHtml(tx.paymentType || 'CASH')}</span>
      </div>
    `;
  }

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
}

function closeSalesSpecPanel() {
  document.getElementById('sales-spec-details-panel').style.display = 'none';
}

// Load customer transaction details directly into Billing Page to reprocess or convert a Quotation into a Tax Invoice
function loadCustomerToBilling(index) {
  const tx = state.transactions[index];
  if (!tx) return;

  // Set the billing tab active
  switchTab('new-billing-tab');

  // Fill in customer details
  document.getElementById('cust-name').value = tx.customer.name || '';
  document.getElementById('cust-phone').value = tx.customer.phone || '';
  document.getElementById('cust-email').value = tx.customer.email || '';
  document.getElementById('cust-address').value = tx.customer.address || '';
  
  if (tx.customer.gstin) {
    document.getElementById('toggle-gstin').checked = true;
    const gstinBlock = document.getElementById('gstin-block');
    if (gstinBlock) gstinBlock.style.display = 'block';
    document.getElementById('cust-gstin').value = tx.customer.gstin;
  } else {
    document.getElementById('toggle-gstin').checked = false;
    const gstinBlock = document.getElementById('gstin-block');
    if (gstinBlock) gstinBlock.style.display = 'none';
    document.getElementById('cust-gstin').value = '';
  }

  // ID Details
  if (tx.idDetails && tx.idDetails.active) {
    document.getElementById('toggle-id-details').checked = true;
    const idBlock = document.getElementById('id-details-block');
    if (idBlock) idBlock.style.display = 'block';
    document.getElementById('bill-id-no').value = tx.idDetails.idNo || '';
    document.getElementById('bill-id-cost').value = tx.idDetails.cost || 0;
    document.getElementById('bill-id-treatment').value = tx.idDetails.treatment || 'add';
  } else {
    document.getElementById('toggle-id-details').checked = false;
    const idBlock = document.getElementById('id-details-block');
    if (idBlock) idBlock.style.display = 'none';
    document.getElementById('bill-id-no').value = '';
    document.getElementById('bill-id-cost').value = 0;
  }

  document.getElementById('cust-ref-no').value = tx.refNo || '';

  // Billing category & doc mode
  setBillingCategory(tx.billCategory || 'bike');
  
  // Set doc mode
  setDocMode(tx.docType || 'invoice');

  // If bike mode, select the vehicle model or chassis
  if (tx.billCategory === 'bike' && tx.vehicle) {
    // Populate select
    const select = document.getElementById('vehicle-select');
    if (select) {
      if (tx.docType === 'quotation') {
        // Find quotation model by name
        const qModel = (state.quotationModels || []).find(m => m.name === tx.vehicle.model);
        if (qModel) {
          select.value = qModel.id;
          onVehicleChange(qModel.id);
        }
      } else {
        // Invoice mode, select by chassis
        select.value = tx.vehicle.chassis;
        onVehicleChange(tx.vehicle.chassis);
      }
    }
  } else if (tx.billCategory === 'spares') {
    // Load spares
    state.billingSparesList = [...(tx.spares || [])];
    renderBillingSparesTable();
    const laborInput = document.getElementById('bill-labor-charge');
    if (laborInput) laborInput.value = tx.labor || 0;
  }

  // Financials override if active
  if (tx.financials) {
    const totalInput = document.getElementById('bill-override-base');
    if (totalInput && tx.billCategory === 'bike') {
      totalInput.value = tx.financials.base || 0;
    }
    document.getElementById('amount-paid').value = tx.financials.paid || 0;
  }

  // Force recalculation of invoice amounts
  recalculateInvoiceAmounts();
  
  alert(`Swapped ${tx.docType === 'quotation' ? 'Quotation' : 'Invoice'} details to Billing Page!`);
}

// Edit transaction card controller
function editTransactionDetails(index) {
  const tx = state.transactions[index];
  if (!tx) return;

  document.getElementById('edit-tx-index').value = index;
  document.getElementById('edit-tx-id').textContent = tx.id;
  document.getElementById('edit-cust-name').value = tx.customer.name;
  document.getElementById('edit-cust-phone').value = tx.customer.phone;
  document.getElementById('edit-cust-gstin').value = tx.customer.gstin || '';
  document.getElementById('edit-cust-email').value = tx.customer.email || '';
  document.getElementById('edit-cust-address').value = tx.customer.address;
  document.getElementById('edit-ref-no').value = tx.refNo || 'NON REG';
  document.getElementById('edit-payment-type').value = tx.paymentType || 'CASH';
  document.getElementById('edit-amount-paid').value = tx.financials.paid;

  const notesActive = !!(tx.notes && tx.notes.active);
  const notesText = tx.notes ? (tx.notes.text || '') : '';
  const editNotesToggle = document.getElementById('edit-notes-toggle');
  if (editNotesToggle) {
    editNotesToggle.checked = notesActive;
    toggleEditNotesDisplay(notesActive);
  }
  const editNotesInput = document.getElementById('edit-notes-input');
  if (editNotesInput) {
    editNotesInput.value = notesText;
  }

  // Clear edit overrides
  document.getElementById('edit-override-toggle').checked = false;
  toggleEditOverrideTotal(false);

  document.getElementById('edit-transaction-panel').style.display = 'block';
  document.getElementById('edit-transaction-panel').scrollIntoView({ behavior: 'smooth' });
}

function toggleEditOverrideTotal(checked) {
  const input = document.getElementById('edit-override-total-input');
  const index = parseInt(document.getElementById('edit-tx-index').value);
  const tx = state.transactions[index];
  
  if (checked) {
    input.style.display = 'block';
    let baseVal = 0;
    if (tx) {
      if (tx.billCategory === 'bike' && tx.vehicle) {
        baseVal = tx.vehicle.basePrice;
      } else {
        const sparesSum = (tx.spares || []).reduce((sum, item) => sum + item.amount, 0);
        baseVal = sparesSum + (tx.labor || 0);
      }
    }
    input.value = baseVal > 0 ? baseVal.toFixed(2) : '';
    input.focus();
  } else {
    input.style.display = 'none';
    input.value = '';
  }
}

function saveEditedTransaction(event) {
  event.preventDefault();

  const index = parseInt(document.getElementById('edit-tx-index').value);
  const tx = state.transactions[index];
  if (!tx) return;

  const newName = document.getElementById('edit-cust-name').value.trim();
  const newPhone = document.getElementById('edit-cust-phone').value.trim();
  const newGstin = document.getElementById('edit-cust-gstin').value.trim();
  const newEmail = document.getElementById('edit-cust-email').value.trim();
  const newAddress = document.getElementById('edit-cust-address').value.trim();
  const newRef = document.getElementById('edit-ref-no').value.trim();
  const newPayType = document.getElementById('edit-payment-type').value;
  const newPaid = parseFloat(document.getElementById('edit-amount-paid').value);

  if (!newName || !newPhone || !newAddress || isNaN(newPaid) || newPaid < 0) {
    alert('Please enter valid details.');
    return;
  }

  tx.customer.name = newName;
  tx.customer.phone = newPhone;
  tx.customer.gstin = newGstin;
  tx.customer.email = newEmail;
  tx.customer.address = newAddress;
  tx.refNo = newRef;
  tx.paymentType = newPayType;

  const newNotesActive = document.getElementById('edit-notes-toggle')?.checked || false;
  const newNotesText = newNotesActive ? (document.getElementById('edit-notes-input')?.value.trim() || '') : '';
  tx.notes = {
    active: newNotesActive,
    text: newNotesText
  };

  // If override enabled, update total, base, and tax splits!
  const overrideChecked = document.getElementById('edit-override-toggle').checked;
  const overrideVal = parseFloat(document.getElementById('edit-override-total-input').value);
  const taxRate = tx.billCategory === 'bike' ? 0.05 : 0.18;

  if (overrideChecked && !isNaN(overrideVal) && overrideVal > 0) {
    tx.financials.total = overrideVal;
    tx.financials.base = Math.round((overrideVal / (1 + taxRate)) * 100) / 100;
    const taxDiff = Math.round((overrideVal - tx.financials.base) * 100) / 100;

    if (tx.taxMode === 'intrastate') {
      tx.financials.cgst = Math.round((taxDiff / 2) * 100) / 100;
      tx.financials.sgst = Math.round((taxDiff / 2) * 100) / 100;
      tx.financials.igst = 0.00;
    } else {
      tx.financials.cgst = 0.00;
      tx.financials.sgst = 0.00;
      tx.financials.igst = taxDiff;
    }
  }

  tx.financials.paid = newPaid;
  tx.financials.balance = Math.max(0, Math.round((tx.financials.total - newPaid) * 100) / 100);

  saveTransactionsToStorage();
  
  // Dynamically derive inventory stock from purchases and transactions!
  syncInventoryFromPurchasesAndSales();

  renderSalesHistoryTable();
  renderStockDetails();
  renderBillingDropdown();

  if (state.loadedTransaction && state.loadedTransaction.id === tx.id) {
    renderInvoicePrintSheet(tx);
  }

  cancelEditTransaction();
  alert(`Transaction "${tx.id}" has been successfully updated.`);
}

function cancelEditTransaction() {
  document.getElementById('edit-transaction-panel').style.display = 'none';
}

function openCollectDueModal(index) {
  const tx = state.transactions[index];
  if (!tx) return;
  state.activeCollectDueIndex = index;
  
  document.getElementById('due-modal-inv-no').textContent = tx.id;
  document.getElementById('due-modal-cust-name').textContent = tx.customer ? tx.customer.name : 'Unknown';
  document.getElementById('due-modal-total-amt').textContent = '₹ ' + Number(tx.financials.total).toLocaleString('en-IN', {minimumFractionDigits:2});
  document.getElementById('due-modal-balance-due').textContent = '₹ ' + Number(tx.financials.balance).toLocaleString('en-IN', {minimumFractionDigits:2});
  
  const payInput = document.getElementById('due-pay-amount');
  if (payInput) {
    payInput.value = tx.financials.balance.toFixed(2);
    payInput.max = tx.financials.balance;
  }
  
  document.getElementById('collect-due-modal').style.display = 'flex';
}

function closeCollectDueModal() {
  document.getElementById('collect-due-modal').style.display = 'none';
}

function submitCollectedPayment() {
  const index = state.activeCollectDueIndex;
  const tx = state.transactions[index];
  if (!tx) return;
  
  const payAmt = parseFloat(document.getElementById('due-pay-amount').value);
  if (isNaN(payAmt) || payAmt <= 0) {
    alert("Please enter a valid payment amount.");
    return;
  }
  
  if (payAmt > tx.financials.balance) {
    alert(`⚠️ Payment exceeds remaining balance of ₹${tx.financials.balance.toFixed(2)}.`);
    return;
  }
  
  // Reupdate outstanding financial values
  tx.financials.paid = Math.round((tx.financials.paid + payAmt) * 100) / 100;
  tx.financials.balance = Math.max(0, Math.round((tx.financials.total - tx.financials.paid) * 100) / 100);
  
  saveTransactionsToStorage();
  
  // Update views
  renderSalesHistoryTable();
  
  if (state.loadedTransaction && state.loadedTransaction.id === tx.id) {
    renderInvoicePrintSheet(tx);
  }
  
  closeCollectDueModal();
  alert(`✅ Payment of ₹${payAmt.toFixed(2)} recorded successfully for Invoice #${tx.id}!`);
}

function deleteTransactionRecord(index) {
  // Delete without asking for confirmation
  const tx = state.transactions[index];
  if (!tx) return;
  
  if (tx.docType === 'invoice') {
    if (tx.billCategory !== 'bike') {
      // Return spare parts stock
      tx.spares.forEach(item => {
        const spare = state.spares.find(s => s.sku === item.sku);
        if (spare) {
          spare.qty += item.qty;
        }
      });
      saveSparesToStorage();
    }
  }

  state.transactions.splice(index, 1);
  saveTransactionsToStorage();

  // Dynamically derive inventory stock from purchases and transactions!
  syncInventoryFromPurchasesAndSales();

  if (state.loadedTransaction && state.loadedTransaction.id === tx.id) {
    state.loadedTransaction = null;
  }

  renderSalesHistoryTable();
  renderStockDetails();
  renderBillingDropdown();
  renderSparesDetails();
  populateSparesDropdowns();
  updatePrinterTabDisplay();
  cancelEditTransaction();
  closeSalesSpecPanel();
}

// --- Dynamic service counter odometer loggers ---
function lookupServiceCounter(chassis) {
  const countLabel = document.getElementById('ser-count-label');
  if (!chassis.trim()) {
    countLabel.value = '';
    return;
  }

  // Scan current service databases linked to this e-bike chassis
  const serviceCount = state.services.filter(s => s.chassis.toLowerCase() === chassis.toLowerCase().trim()).length;

  const mapping = ['1st Service', '2nd Service', '3rd Service', '4th Service', '5th Service', '6th Service'];
  countLabel.value = mapping[serviceCount] || `${serviceCount + 1}th Service`;

  // Autofill Customer Name and Linked Invoice No based on Chassis!
  const cleanChassis = chassis.trim().toLowerCase();
  const tx = state.transactions.find(t => t && t.vehicle && String(t.vehicle.chassis).trim().toLowerCase() === cleanChassis);
  if (tx) {
    const custNameEl = document.getElementById('ser-cust-name');
    const invoiceEl = document.getElementById('ser-invoice-no');
    if (custNameEl && !custNameEl.value.trim() && tx.customer && tx.customer.name) {
      custNameEl.value = tx.customer.name;
    }
    if (invoiceEl && !invoiceEl.value.trim() && tx.id) {
      invoiceEl.value = tx.id;
    }
  }
}

function addSpareToServiceBuilder() {
  const sku = document.getElementById('ser-spare-select').value;
  const qty = parseInt(document.getElementById('ser-spare-qty').value);

  if (!sku) {
    alert('Please select a spare part.');
    return;
  }

  if (isNaN(qty) || qty <= 0) {
    alert('Please enter a valid quantity.');
    return;
  }

  const spare = state.spares.find(s => s.sku === sku);
  if (!spare) return;

  if (qty > spare.qty) {
    alert(`Insufficient Stock! Only ${spare.qty} available.`);
    return;
  }

  const existing = state.serviceSparesList.find(item => item.sku === sku);
  if (existing) {
    if (existing.qty + qty > spare.qty) {
      alert(`Insufficient Stock! Adding exceeds available.`);
      return;
    }
    existing.qty += qty;
    existing.amount = existing.qty * existing.rate;
  } else {
    state.serviceSparesList.push({
      sku: spare.sku,
      name: spare.name,
      qty: qty,
      rate: spare.sellingPrice,
      amount: qty * spare.sellingPrice
    });
  }

  document.getElementById('ser-spare-select').value = '';
  document.getElementById('ser-spare-qty').value = '1';

  renderServiceSparesBuilderList();
  recalculateServiceGrandTotal();
}

function removeSpareFromServiceBuilder(index) {
  state.serviceSparesList.splice(index, 1);
  renderServiceSparesBuilderList();
  recalculateServiceGrandTotal();
}

function renderServiceSparesBuilderList() {
  const container = document.getElementById('ser-builder-spares-list');
  container.innerHTML = '';

  if (state.serviceSparesList.length === 0) {
    container.innerHTML = `<span style="color:var(--text-muted);">No spare parts added to job card.</span>`;
    document.getElementById('ser-spares-cost').value = '0';
    return;
  }

  const listUl = document.createElement('ul');
  listUl.style.paddingLeft = '1.25rem';
  listUl.style.marginBottom = '0.5rem';

  let totalCost = 0;

  state.serviceSparesList.forEach((item, idx) => {
    totalCost += item.amount;
    const li = document.createElement('li');
    li.style.marginBottom = '0.25rem';
    li.innerHTML = `
      ${item.name} (SKU: ${item.sku}) x${item.qty} - ₹${item.amount}
      <a href="javascript:void(0)" onclick="removeSpareFromServiceBuilder(${idx})" style="color:hsl(0,85%,65%); margin-left:0.5rem; text-decoration:none;">[Remove]</a>
    `;
    listUl.appendChild(li);
  });

  container.appendChild(listUl);
  document.getElementById('ser-spares-cost').value = totalCost;
}

function recalculateServiceGrandTotal() {
  const sparesCost = parseFloat(document.getElementById('ser-spares-cost').value) || 0;
  const labor = parseFloat(document.getElementById('ser-labor-cost').value) || 0;
  const grand = sparesCost + labor;

  document.getElementById('ser-calc-total').textContent = formatCurrency(grand);
}

function handleNewServiceForm(e) {
  e.preventDefault();

  const invoiceNo = document.getElementById('ser-invoice-no').value.trim();
  const custName = document.getElementById('ser-cust-name').value.trim();
  const chassis = document.getElementById('ser-chassis').value.trim();
  const date = document.getElementById('ser-date').value;
  const serviceCount = document.getElementById('ser-count-label').value.trim();
  const odometer = parseInt(document.getElementById('ser-odometer').value);
  const sparesCost = parseFloat(document.getElementById('ser-spares-cost').value) || 0;
  const laborCharges = parseFloat(document.getElementById('ser-labor-cost').value) || 0;

  if (!custName || !chassis || !date || isNaN(odometer) || odometer < 0) {
    alert('Please enter complete service card metrics.');
    return;
  }

  // Deduct spares stock
  state.serviceSparesList.forEach(item => {
    const spare = state.spares.find(s => s.sku === item.sku);
    if (spare) {
      spare.qty = Math.max(0, spare.qty - item.qty);
    }
  });
  saveSparesToStorage();

  const job = {
    id: `SL-SER-${Date.now().toString().substring(8)}`,
    invoiceNo, chassis, custName, date, serviceCount, odometer,
    spares: [...state.serviceSparesList],
    sparesCost: sparesCost,
    laborCharges: laborCharges,
    totalBill: sparesCost + laborCharges
  };

  state.services.push(job);
  saveServicesToStorage();

  // Re-render
  renderServicesLedger();
  renderSparesDetails();
  populateSparesDropdowns();

  // Reset service forms
  clearServicesDraft();
  document.getElementById('service-log-form').reset();
  state.serviceSparesList = [];
  renderServiceSparesBuilderList();
  recalculateServiceGrandTotal();

  // Show print/download prompt for Service Card
  showPrintDownloadPrompt(
    "Service Job Card",
    () => printServiceJobCard(job.id),
    () => downloadServiceCardPDFSafe(job.id)
  );
}

function deleteServiceRecord(id) {
  // Delete without asking for confirmation
  state.services = state.services.filter(s => s.id !== id);
  saveServicesToStorage();
  renderServicesLedger();
}

// Sortable history ledgers
function sortServicesLedger(criteria) {
  if (criteria === 'date-desc') {
    state.services.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (criteria === 'date-asc') {
    state.services.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (criteria === 'invoice-asc') {
    state.services.sort((a, b) => {
      const aNum = parseInt(a.invoiceNo) || 0;
      const bNum = parseInt(b.invoiceNo) || 0;
      return aNum - bNum;
    });
  } else if (criteria === 'invoice-desc') {
    state.services.sort((a, b) => {
      const aNum = parseInt(a.invoiceNo) || 0;
      const bNum = parseInt(b.invoiceNo) || 0;
      return bNum - aNum;
    });
  } else if (criteria === 'count') {
    state.services.sort((a, b) => a.serviceCount.localeCompare(b.serviceCount));
  }

  renderServicesLedger();
}

function renderServicesLedger() {
  const tbody = document.getElementById('services-details-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!state.services || state.services.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--text-muted);">No vehicle maintenance job cards logged.</td></tr>`;
    return;
  }

  state.services.forEach(s => {
    if (!s) return;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-family:monospace; font-weight:700;">${escapeHtml(s.id || '-')}</td>
      <td style="font-family:monospace;">${escapeHtml(s.invoiceNo || '-')}</td>
      <td style="font-family:monospace; font-weight:600;">${escapeHtml(s.chassis || '-')}</td>
      <td>${escapeHtml(s.custName || '-')}</td>
      <td>${escapeHtml(s.date || '-')}</td>
      <td><span class="badge badge-stock" style="background:hsla(190,95%,45%,0.15); color:var(--color-primary);">${escapeHtml(s.serviceCount || '-')}</span></td>
      <td style="font-weight:700; text-align:center;">${s.odometer || 0} KMs</td>
      <td style="text-align:right;">₹ ${Number(s.sparesCost || 0).toFixed(2)}</td>
      <td style="text-align:right;">₹ ${Number(s.laborCharges || 0).toFixed(2)}</td>
      <td style="font-weight:700; text-align:right; color:var(--color-primary);">₹ ${Number(s.totalBill || 0).toFixed(2)}</td>
      <td>
        <div style="display:flex; gap:0.35rem; justify-content:center;">
          <button class="btn btn-secondary" style="padding:0.4rem 0.65rem; font-size:0.75rem; width:auto; border-color:var(--color-primary);" onclick="printServiceBill('${s.id || ''}')">
            Print Bill
          </button>
          <button class="btn btn-danger" style="padding:0.4rem 0.65rem; font-size:0.75rem; width:auto;" onclick="deleteServiceRecord('${s.id || ''}')">
            Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// --- Excel & CSV Data Importer Core via SheetJS ---

function cleanFloat(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  // Strip commas, currency symbols, and extra spaces
  const cleaned = String(val).replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

function importSalesExcelOrCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert('Error: Excel sheet seems invalid.');
        return;
      }
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        alert('Error: Excel sheet is empty.');
        return;
      }
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rows.length <= 1) {
        alert('Error: Excel or CSV sheet seems empty or invalid.');
        return;
      }

      const isHeaderRow = (row) => {
        if (!row || row.length === 0) return false;
        const rowStrings = row.map(cell => String(cell || '').trim());
        const rowLower = rowStrings.map(s => s.toLowerCase());
        
        // Reject rows with long serial/chassis values in first 10 columns
        const hasSerialNumber = rowStrings.slice(0, 10).some(s => /^[A-Z0-9]{12,}$/i.test(s) && /[A-Z]/i.test(s) && /[0-9]/.test(s));
        if (hasSerialNumber) return false;
        
        // Check if row has key columns
        const hasChassisHeader = rowLower.some(s => s.includes('chasis') || s.includes('chassis') || s.includes('frame') || s.includes('vin'));
        const hasModelHeader = rowLower.some(s => s.includes('model') || s.includes('mod') || s.includes('particular') || s.includes('vehicle') || s.includes('item'));
        
        if (hasChassisHeader && hasModelHeader) return true;
        
        // Fallback to match count keyword list
        const headerKeywords = ['chassis', 'chasis', 'frame', 'serial', 'vin', 'model', 'vehicle', 'particular', 'item', 'product', 'name', 'invoice', 'bill', 'doc', 'buyer', 'customer', 'consignee', 'total', 'grand', 'amount', 'price', 'cost', 'rate', 'paid', 'motor', 'battery', 'charger', 'date', 'supplier', 'vendor', 'status', 'hsn', 'sac', 'qty', 'quantity', 'sl.no', 'sl no', 'phone', 'mobile', 'no.', 's.no', 'amou', 'addre'];
        const matchCount = rowLower.filter(s => headerKeywords.some(k => s === k || s.includes(k))).length;
        return matchCount >= 3;
      };

      const mapHeaders = (row) => {
        const headers = row.map(h => String(h || '').trim().toLowerCase());
        const getIndex = (keywords) => {
          // 1. Exact match
          let idx = headers.findIndex(h => keywords.some(key => h === key));
          if (idx !== -1) return idx;
          // 2. Prefix match
          idx = headers.findIndex(h => keywords.some(key => h.startsWith(key)));
          if (idx !== -1) return idx;
          // 3. Substring match
          idx = headers.findIndex(h => keywords.some(key => h.includes(key)));
          return idx;
        };

        return {
          idxId: getIndex(['invoice no', 'bill no', 'doc no', 'invoice number', 'id', 'number', 'ref.sn', 'ref', 'sno', 'sn', 'bill']),
          idxDate: getIndex(['date', 'sales date', 'billing date', 'purchase date', 'purchase', 'sales']),
          idxType: getIndex(['type', 'doc type', 'class', 'category']),
          idxName: getIndex(['buyer', 'customer', 'name', 'consignee', 'supplier', 'vendor']),
          idxPhone: getIndex(['phone', 'mobile', 'contact', 'ph', 'ph no']),
          idxAddress: getIndex(['address', 'addr', 'address1', 'address2', 'addre']),
          idxGstin: getIndex(['gstin', 'gst', 'tax id']),
          idxModel: getIndex(['model', 'vehicle', 'e-bike', 'particulars', 'particular', 'item', 'mode', 'product', 'mod']),
          idxChassis: getIndex(['chassis', 'frame', 'chasis', 'chasis no', 'chassis no', 'serial', 'vin']),
          idxMotor: getIndex(['motor', 'engine', 'moto', 'motor no', 'moto no']),
          idxBattery: getIndex(['battery', 'batt', 'bat', 'battery no', 'bat no']),
          idxCharger: getIndex(['charger', 'char', 'charger no', 'charger sl']),
          idxHsn: getIndex(['hsn', 'sac']),
          idxCost: getIndex(['cost', 'purchase price', 'dealer cost', 'cost price', 'purchase']),
          idxSelling: getIndex(['selling', 'retail', 'base rate', 'selling price', 'price', 'amount', 'rate', 'amou']),
          idxTotal: getIndex(['total', 'grand total', 'amount', 'rate', 'price', 'amou']),
          idxPaid: getIndex(['paid', 'amount paid', 'advance']),
          idxBalance: getIndex(['balance', 'due', 'balance due', 'bal'])
        };
      };

      let activeMapping = null;
      let importCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // If this row is a header row, map/re-map the column indices dynamically!
        if (isHeaderRow(row)) {
          activeMapping = mapHeaders(row);
          continue;
        }

        // Wait until we find the first header row in the sheet
        if (!activeMapping) continue;

        const {
          idxId, idxDate, idxType, idxName, idxPhone, idxAddress, idxGstin,
          idxModel, idxChassis, idxMotor, idxBattery, idxCharger, idxHsn,
          idxCost, idxSelling, idxTotal, idxPaid, idxBalance
        } = activeMapping;

        // Extract or fallback on Chassis column
        let chassis = 'GEN-CH-' + Math.floor(10000000 + Math.random() * 90000000);
        if (idxChassis !== -1 && row[idxChassis] && String(row[idxChassis]).trim() !== '') {
          chassis = String(row[idxChassis]).trim();
        }

        // Skip header duplicates, spacer cells, or summary rows
        const lowerChassis = chassis.toLowerCase();
        if (lowerChassis.includes('chassis') || lowerChassis.includes('chasis') || lowerChassis.includes('frame') || lowerChassis.includes('serial') || lowerChassis.includes('vin') || lowerChassis === '') continue;

        // Check if any cell in the row contains "TOTAL" or "GRAND TOTAL" to skip summary rows!
        const rowStrings = row.map(cell => String(cell || '').trim().toLowerCase());
        const isSummaryRow = rowStrings.some(s => s === 'total' || s === 'grand total' || s === 'subtotal' || s === 'summary');
        if (isSummaryRow) continue;

        const id = idxId !== -1 && row[idxId] ? String(row[idxId]).trim() : 'SL-INV-' + (1000 + i);
        
        // Parse dates safely (handle SheetJS numerical dates or text dates)
        let date = getCurrentDateString();
        if (idxDate !== -1 && row[idxDate]) {
          const rawDate = row[idxDate];
          if (typeof rawDate === 'number') {
            const dateObj = new Date((rawDate - 25569) * 86400 * 1000);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            date = `${year}-${month}-${day}`;
          } else {
            date = String(rawDate).trim();
          }
        }

        const docType = idxType !== -1 && row[idxType] && String(row[idxType]).toLowerCase().includes('quot') ? 'quotation' : 'invoice';
        const name = idxName !== -1 && row[idxName] ? String(row[idxName]).trim() : 'Walk-in Customer';
        const phone = idxPhone !== -1 && row[idxPhone] ? String(row[idxPhone]).trim() : '9944659264';
        const address = idxAddress !== -1 && row[idxAddress] ? String(row[idxAddress]).trim() : 'Imported from Excel spreadsheet';
        const gstin = idxGstin !== -1 && row[idxGstin] ? String(row[idxGstin]).trim() : 'NON REG';
        
        const model = idxModel !== -1 && row[idxModel] ? String(row[idxModel]).trim() : 'Imported E-Bike';
        const chassisShort = chassis.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase();
        const motor = idxMotor !== -1 && row[idxMotor] ? String(row[idxMotor]).trim() : ('GEMLDM-' + chassisShort);
        const battery = idxBattery !== -1 && row[idxBattery] ? String(row[idxBattery]).trim() : ('BOBF-' + chassisShort);
        const charger = idxCharger !== -1 && row[idxCharger] ? String(row[idxCharger]).trim() : battery + '-CH';
        const hsn = idxHsn !== -1 && row[idxHsn] ? String(row[idxHsn]).trim() : '871190';
        
        // Price parsing with robust fallback
        let total = 0;
        if (idxTotal !== -1 && row[idxTotal] !== undefined) {
          total = cleanFloat(row[idxTotal]);
        } else {
          // Fallback to searching the row for any price value
          for (let cellVal of row) {
            const num = cleanFloat(cellVal);
            if (!isNaN(num) && num > 1000) {
              total = num;
              break;
            }
          }
        }
        
        let costPrice = 0;
        if (idxCost !== -1 && row[idxCost] !== undefined) {
          costPrice = cleanFloat(row[idxCost]);
        } else {
          costPrice = Math.round(total * 0.85 / 1.05 * 100) / 100; // default 15% dealer discount
        }

        const paid = idxPaid !== -1 && row[idxPaid] !== undefined ? Math.round(cleanFloat(row[idxPaid]) * 100) / 100 : total;
        const balance = Math.max(0, Math.round((total - paid) * 100) / 100);

        // Skip duplicate transactions ONLY by ID - allow chassis duplicates so we can update records
        // But if same chassis exists, update it instead of creating new
        const existingTxByChassisIdx = state.transactions.findIndex(t => t.vehicle && t.vehicle.chassis && t.vehicle.chassis.toLowerCase() === chassis.toLowerCase());
        if (existingTxByChassisIdx !== -1) {
          // Update the existing transaction's data instead of skipping
          const existingTx = state.transactions[existingTxByChassisIdx];
          existingTx.vehicle.model = model;
          existingTx.vehicle.motor = motor;
          existingTx.vehicle.battery = battery;
          existingTx.vehicle.charger = charger;
          existingTx.vehicle.hsn = hsn;
          if (total > 0) {
            existingTx.vehicle.basePrice = total / 1.05;
            existingTx.financials.total = total;
            existingTx.financials.paid = paid;
            existingTx.financials.balance = balance;
          }
          importCount++;
          continue;
        }
        if (state.transactions.some(t => t.id === id)) continue;

        const tx = {
          id,
          docType,
          taxMode: 'intrastate',
          date,
          paymentType: 'CASH',
          refNo: 'NON REG',
          billCategory: 'bike',
          customer: {
            name, phone, gstin, address
          },
          vehicle: {
            model, chassis, motor, battery, charger, hsn,
            basePrice: total / 1.05,
            costPrice: costPrice
          },
          financials: {
            base: total / 1.05,
            cgst: (total - (total / 1.05)) / 2,
            sgst: (total - (total / 1.05)) / 2,
            igst: 0,
            total, paid, balance
          }
        };

        state.transactions.push(tx);
        
        // Seed vehicle in inventory as SOLD
        const existsInInventory = state.inventory.some(b => b.chassis.toLowerCase() === chassis.toLowerCase());
        if (!existsInInventory) {
          const stockItem = {
            model, chassis, motor, battery, charger, hsn,
            basePrice: total / 1.05,
            costPrice: costPrice,
            status: 'SOLD'
          };
          state.inventory.push(stockItem);
        } else {
          const invItem = state.inventory.find(b => b.chassis.toLowerCase() === chassis.toLowerCase());
          invItem.status = 'SOLD';
          invItem.motor = motor;
          invItem.battery = battery;
          invItem.charger = charger;
        }
        
        importCount++;
      }

      if (importCount > 0) {
        saveTransactionsToStorage();
        saveInventoryToStorage();
        refreshAllViews();
        alert(`Successfully imported/updated ${importCount} Sales records. All tabs refreshed!`);
      } else {
        alert('No new records were found in this file. Check if the sheet has header labels and data rows.');
      }
    } catch (err) {
      console.error(err);
      alert('Error reading Excel file: ' + err.message + '\n\nMake sure the file is a valid .xlsx or .csv');
    }
  };
  reader.readAsArrayBuffer(file);
  // Reset file input so the same file can be re-uploaded
  event.target.value = '';
}

function importPurchasesExcelOrCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: false });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });

      if (!rows || rows.length === 0) {
        alert('The Excel file appears to be empty.');
        return;
      }

      const isHeaderRow = (row) => {
        if (!row || row.length === 0) return false;
        const rowStrings = row.map(cell => String(cell || '').trim());
        const rowLower = rowStrings.map(s => s.toLowerCase());

        // Reject rows with long serial/chassis values in first 10 columns
        const hasSerial = rowStrings.slice(0, 10).some(s => /^[A-Z0-9]{12,}$/i.test(s) && /[A-Z]/i.test(s) && /[0-9]/.test(s));
        if (hasSerial) return false;

        // Check if row has key columns
        const hasChassisHeader = rowLower.some(s => s.includes('chasis') || s.includes('chassis') || s.includes('frame') || s.includes('vin'));
        const hasModelHeader = rowLower.some(s => s.includes('model') || s.includes('mod') || s.includes('particular') || s.includes('vehicle') || s.includes('item'));
        
        if (hasChassisHeader && hasModelHeader) return true;

        // Fallback to match count keyword list
        const kw = [
          'chassis', 'chasis', 'frame', 'serial', 'vin',
          'model', 'vehicle', 'particular', 'item', 'product', 'mod',
          'amount', 'price', 'cost', 'rate', 'paid', 'balance', 'bal',
          'motor', 'moto', 'battery', 'bat', 'charger',
          'date', 'purchase', 'purch',
          'status', 'stock', 'sold', 'rema', 'remarks',
          'hsn', 'sac', 'qty', 'quantity',
          'sl.no', 'sl no', 'sno', 'ref.sn', 'ref', 'phone', 'mobile', 'ph',
          'colour', 'color', 'col', 'amou', 'addre', 'addr', 'gst'
        ];
        const matchCount = rowLower.filter(s => kw.some(k => s === k || s.includes(k))).length;
        return matchCount >= 3;
      };

      const mapHeaders = (row) => {
        const headers = row.map(h => String(h || '').trim().toLowerCase());
        const getIndex = (keywords) => {
          let idx = headers.findIndex(h => keywords.some(k => h === k));
          if (idx !== -1) return idx;
          idx = headers.findIndex(h => keywords.some(k => h.startsWith(k) && h.length <= k.length + 4));
          if (idx !== -1) return idx;
          idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
          return idx;
        };

        return {
          idxBill:     getIndex(['ref.sn', 'refno', 'ref sn', 'sno', 's.no', 'sl.no', 'sl no', 'bill', 'invoice', 'po', 'receipt', 'ref']),
          idxDate:     getIndex(['purchase date', 'purchase', 'purch', 'pur', 'date']),
          idxSupplier: getIndex(['supplier', 'vendor', 'manufacturer', 'source', 'dealer']),
          idxName:     getIndex(['name', 'buyer', 'customer', 'cust name']),
          idxAddress:  getIndex(['addre', 'addr', 'address']),
          idxPhone:    getIndex(['ph no', 'phno', 'ph', 'phone', 'mobile', 'contact']),
          idxModel:    getIndex(['item name', 'item', 'model', 'vehicle', 'e-bike', 'particulars', 'particular', 'product', 'mod']),
          idxColor:    getIndex(['colour', 'color', 'col']),
          idxChassis:  getIndex(['chasis no', 'chassis no', 'chasis', 'chassis', 'frame', 'serial', 'vin']),
          idxMotor:    getIndex(['moto no', 'motor no', 'moto', 'motor', 'engine']),
          idxBattery:  getIndex(['bat no', 'battery no', 'bat', 'battery', 'batt']),
          idxCharger:  getIndex(['charger no', 'charger sl', 'charger', 'char']),
          idxHsn:      getIndex(['hsn', 'sac', 'hsn code']),
          idxQty:      getIndex(['qty', 'quantity', 'qnty']),
          idxPrice:    getIndex(['price', 'cost price', 'base price', 'dealer cost', 'cost']),
          idxGst:      getIndex(['gst', 'gst %', 'tax %', 'tax']),
          idxAmou:     getIndex(['amou', 'amount', 'total amount', 'grand total', 'total']),
          idxPaid:     getIndex(['paid', 'amount paid', 'received']),
          idxBalance:  getIndex(['bal', 'balance', 'balance due', 'due']),
          idxRema:     getIndex(['rema', 'remarks', 'remark', 'note', 'notes']),
          idxStock:    getIndex(['stock']),
          idxSold:     getIndex(['sold']),
          idxGstin:    getIndex(['gstin', 'gst no', 'tax id'])
        };
      };

      let activeMapping = null;
      let importCount = 0;

      // Carry-forward state for merged-cell rows (date/supplier spans multiple rows)
      let lastDate = getCurrentDateString();
      let lastSupplier = 'Supplier Import';
      let lastAddress = '';
      let lastPhone = '';

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Re-detect headers on every section (your Excel has multiple purchase groups)
        if (isHeaderRow(row)) {
          activeMapping = mapHeaders(row);
          continue;
        }

        if (!activeMapping) continue;

        const {
          idxBill, idxDate, idxSupplier, idxName, idxAddress, idxPhone,
          idxModel, idxColor, idxChassis, idxMotor, idxBattery, idxCharger, idxHsn,
          idxQty, idxPrice, idxGst, idxAmou, idxPaid, idxBalance, idxRema,
          idxStock, idxSold, idxGstin
        } = activeMapping;

        // Skip completely empty rows
        const nonEmpty = row.filter(c => String(c || '').trim() !== '');
        if (nonEmpty.length < 2) continue;

        // Skip TOTAL / GRAND TOTAL / RETURN summary rows
        const rowStrings = row.map(cell => String(cell || '').trim().toLowerCase());
        const isSummaryRow = rowStrings.some(s =>
          s === 'total' || s === 'grand total' || s === 'subtotal' ||
          s === 'summary' || s === 'return' || s === '5%' || s === 'gst'
        );
        if (isSummaryRow) continue;

        // ── Extract chassis ──
        let chassis = '';
        if (idxChassis !== -1 && row[idxChassis]) chassis = String(row[idxChassis]).trim();
        if (!chassis || chassis.toLowerCase().includes('chasis') || chassis.toLowerCase().includes('chassis')) continue;

        // Skip header-like values mistakenly in data
        if (/^(chasis|chassis|frame|serial|vin|sl\.?no?|ref|sno)$/i.test(chassis)) continue;

        // ── Extract date — carry forward if empty (merged cells) ──
        if (idxDate !== -1 && row[idxDate] && String(row[idxDate]).trim() !== '') {
          const rawDate = row[idxDate];
          if (typeof rawDate === 'number') {
            const d = new Date((rawDate - 25569) * 86400 * 1000);
            lastDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          } else {
            const ds = String(rawDate).trim();
            // Try to parse dd-mm-yyyy or dd/mm/yyyy formats
            const m = ds.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
            if (m) {
              const y = m[3].length === 2 ? '20' + m[3] : m[3];
              lastDate = `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
            } else {
              lastDate = ds;
            }
          }
        }
        const date = lastDate;

        // ── Extract supplier — carry forward if empty ──
        const supplierRaw = (idxSupplier !== -1 && row[idxSupplier]) ? String(row[idxSupplier]).trim() :
                            (idxName !== -1 && row[idxName]) ? String(row[idxName]).trim() : '';
        if (supplierRaw && supplierRaw.length > 1) lastSupplier = supplierRaw;
        const supplier = lastSupplier;

        // ── Carry-forward address and phone ──
        if (idxAddress !== -1 && row[idxAddress] && String(row[idxAddress]).trim()) lastAddress = String(row[idxAddress]).trim();
        if (idxPhone !== -1 && row[idxPhone] && String(row[idxPhone]).trim()) lastPhone = String(row[idxPhone]).trim();

        // ── Model + Color ──
        let model = (idxModel !== -1 && row[idxModel]) ? String(row[idxModel]).trim() : 'Imported E-Bike';
        if (idxColor !== -1 && row[idxColor] && String(row[idxColor]).trim()) {
          const colorVal = String(row[idxColor]).trim();
          // Only append color if it's not already in the model name
          if (!model.toLowerCase().includes(colorVal.toLowerCase())) {
            model = model + ' ' + colorVal;
          }
        }
        model = model.trim();

        // ── Bill Number ──
        const billNo = (idxBill !== -1 && row[idxBill] && String(row[idxBill]).trim() !== '')
          ? String(row[idxBill]).trim()
          : 'PUR-' + date.replace(/-/g,'') + '-' + (importCount + 1);

        // ── Motor / Battery / Charger ──
        const chassisShort = chassis.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase();
        const motor   = (idxMotor   !== -1 && row[idxMotor]   && String(row[idxMotor]).trim())   ? String(row[idxMotor]).trim()   : ('GEMLDM-' + chassisShort);
        const battery = (idxBattery !== -1 && row[idxBattery] && String(row[idxBattery]).trim()) ? String(row[idxBattery]).trim() : ('BOBF-' + chassisShort);
        const charger = (idxCharger !== -1 && row[idxCharger] && String(row[idxCharger]).trim()) ? String(row[idxCharger]).trim() : (battery + '-CH');
        const hsn     = (idxHsn !== -1 && row[idxHsn] && String(row[idxHsn]).trim())            ? String(row[idxHsn]).trim()     : '871190';

        // ── Prices ──
        let costPrice = 0;
        let sellingPrice = 0;

        if (idxPrice !== -1 && row[idxPrice] !== undefined) costPrice = Math.abs(cleanFloat(row[idxPrice]));
        if (idxAmou  !== -1 && row[idxAmou] !== undefined)  sellingPrice = Math.abs(cleanFloat(row[idxAmou]));

        // Fallback: if only one price found, derive the other
        if (costPrice > 0 && sellingPrice === 0) sellingPrice = Math.round(costPrice * 1.05 * 100) / 100;
        if (sellingPrice > 0 && costPrice === 0) costPrice = Math.round(sellingPrice / 1.05 * 100) / 100;

        // Final fallback: scan row for any large number as price
        if (costPrice === 0) {
          for (const cellVal of row) {
            const n = cleanFloat(cellVal);
            if (!isNaN(n) && n > 5000 && n < 10000000) { costPrice = n; break; }
          }
          if (sellingPrice === 0 && costPrice > 0) sellingPrice = Math.round(costPrice * 1.05 * 100) / 100;
        }

        costPrice    = Math.round(costPrice    * 100) / 100;
        sellingPrice = Math.round(sellingPrice * 100) / 100;

        // ── Status detection ──
        let status = 'STOCK'; // default
        if (idxSold !== -1 && row[idxSold] && String(row[idxSold]).trim().toUpperCase().includes('SOLD')) {
          status = 'SOLD';
        } else if (idxStock !== -1 && row[idxStock] && String(row[idxStock]).trim().toUpperCase().includes('STOCK')) {
          status = 'STOCK';
        } else if (idxRema !== -1 && row[idxRema] && String(row[idxRema]).trim().toUpperCase().includes('SOLD')) {
          status = 'SOLD';
        } else if (idxRema !== -1 && row[idxRema] && String(row[idxRema]).trim().toUpperCase().includes('RETURN')) {
          status = 'RETURN';
        }

        // ── Amount paid / balance (for sold bikes) ──
        const amountPaid    = (idxPaid    !== -1 && row[idxPaid] !== undefined)    ? Math.abs(cleanFloat(row[idxPaid])) : 0;
        const balanceDue    = (idxBalance !== -1 && row[idxBalance] !== undefined) ? Math.abs(cleanFloat(row[idxBalance])) : 0;
        const phone         = lastPhone || '9944659264';
        const address       = lastAddress || 'Imported from Purchase Record';
        const gstin         = (idxGstin !== -1 && row[idxGstin] && String(row[idxGstin]).trim()) ? String(row[idxGstin]).trim() : 'NON REG';

        const lowerChassis = chassis.toLowerCase();

        // ── Save to purchases ledger ──
        const purchase = { billNo, date, supplier, model, chassis, motor, battery, charger, hsn, costPrice, sellingPrice };
        const existingPurIdx = state.purchases.findIndex(p => p.chassis && p.chassis.toLowerCase() === lowerChassis);
        if (existingPurIdx !== -1) {
          state.purchases[existingPurIdx] = purchase;
        } else {
          state.purchases.push(purchase);
        }

        // ── Apply status override ──
        if (status === 'SOLD' || status === 'RETURN') {
          statusOverrides[lowerChassis] = status === 'RETURN' ? 'SOLD' : 'SOLD';
        } else {
          statusOverrides[lowerChassis] = 'STOCK';
        }
        saveStatusOverridesToStorage();

        // ── Update matching existing transactions ──
        state.transactions.forEach(t => {
          if (t && t.billCategory === 'bike' && t.vehicle && t.vehicle.chassis &&
              t.vehicle.chassis.toLowerCase() === lowerChassis) {
            t.vehicle.model     = model;
            t.vehicle.motor     = motor;
            t.vehicle.battery   = battery;
            t.vehicle.charger   = charger;
            t.vehicle.hsn       = hsn;
            t.vehicle.costPrice = costPrice;
            t.vehicle.basePrice = sellingPrice;
          }
        });

        // ── If SOLD, seed a Sales History entry so it shows in Sales tab ──
        if (status === 'SOLD') {
          const txExists = state.transactions.some(t => t.vehicle && t.vehicle.chassis &&
            t.vehicle.chassis.toLowerCase() === lowerChassis);
          if (!txExists) {
            const txTotal  = sellingPrice > 0 ? sellingPrice : costPrice * 1.05;
            const txPaid   = amountPaid > 0 ? amountPaid : txTotal;
            const txBal    = balanceDue > 0 ? balanceDue : Math.max(0, txTotal - txPaid);
            const txBase   = txTotal / 1.05;

            state.transactions.push({
              id: 'SLIMPT-' + lowerChassis.replace(/[^a-z0-9]/g, '').slice(0, 8) + '-' + (importCount + 1),
              docType: 'invoice',
              taxMode: 'intrastate',
              date,
              paymentType: 'CASH',
              refNo: 'NON REG',
              billCategory: 'bike',
              customer: { name: supplier, phone, gstin, address },
              vehicle: { model, chassis, motor, battery, charger, hsn, basePrice: txBase, costPrice },
              financials: {
                base: txBase,
                cgst: txBase * 0.025,
                sgst: txBase * 0.025,
                igst: 0,
                total: txTotal,
                paid: txPaid,
                balance: txBal
              }
            });
          }
        }

        importCount++;
      }

      if (importCount > 0) {
        savePurchasesToStorage();
        saveTransactionsToStorage();
        refreshAllViews();
        alert(`✅ Successfully imported/updated ${importCount} records!\n\nAll tabs (Stock, Purchases, Sales, Billing) have been refreshed.`);
      } else {
        alert('⚠️ No records could be imported.\n\nMake sure your Excel sheet has a header row (containing labels like "CHASIS NO", "MOD", "MOTO", "BAT", "PRICE", "AMOU") with data below it.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error reading Excel file: ' + err.message + '\n\nMake sure the file is a valid .xlsx or .csv');
    }
  };
  reader.readAsArrayBuffer(file);
  // Reset file input so the same file can be re-uploaded
  event.target.value = '';
}

// --- Visual Replica Print Sheet Controller ---
function updatePrinterTabDisplay() {
  const emptyState = document.getElementById('printer-empty-state');
  const printerView = document.getElementById('invoice-viewer');

  if (state.loadedTransaction) {
    emptyState.style.display = 'none';
    printerView.style.display = 'flex';
  } else {
    emptyState.style.display = 'flex';
    printerView.style.display = 'none';
  }
}

function renderInvoicePrintSheet(tx) {
  if (!tx) return;

  // Toggle visible print sheet elements in print station
  const invPaper = document.getElementById('invoice-paper-element');
  const serPaper = document.getElementById('service-card-paper-element');
  if (invPaper) invPaper.style.display = 'block';
  if (serPaper) serPaper.style.display = 'none';

  const isQuote = tx.docType === 'quotation';
  const isInter = tx.taxMode === 'interstate';
  const isBike = tx.billCategory === 'bike';

  const paper = document.getElementById('invoice-paper-element');
  if (isQuote) {
    // Hide chassis, motor, battery, charger, hsn columns
    ['toggle-col-chassis', 'toggle-col-motor', 'toggle-col-battery', 'toggle-col-charger', 'toggle-col-hsn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
    if (paper) {
      paper.className = 'invoice-paper hide-chassis hide-motor hide-battery hide-charger hide-hsn';
    }
  } else {
    // Reset print column checkboxes and clear hiding classes on fresh load
    ['toggle-col-chassis', 'toggle-col-motor', 'toggle-col-battery', 'toggle-col-charger', 'toggle-col-hsn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = true;
    });
    if (paper) {
      paper.className = 'invoice-paper';
    }
  }

  // Set optional display checkboxes based on transaction's saved parameters
  const hasBalance = tx.financials ? (parseFloat(tx.financials.balance) > 0) : false;
  const printBalCh = document.getElementById('toggle-print-balance');
  if (printBalCh) printBalCh.checked = isQuote ? false : hasBalance;

  const billBalCh = document.getElementById('bill-print-balance');
  if (billBalCh) billBalCh.checked = isQuote ? false : hasBalance;

  const hasNotesActive = tx.notes ? !!tx.notes.active : false;
  const printNotesCh = document.getElementById('toggle-print-notes');
  if (printNotesCh) printNotesCh.checked = hasNotesActive;

  const billNotesCh = document.getElementById('bill-print-notes-toggle');
  if (billNotesCh) billNotesCh.checked = hasNotesActive;

  const billNotesInput = document.getElementById('bill-notes-input');
  if (billNotesInput) {
    billNotesInput.style.display = hasNotesActive ? 'block' : 'none';
    billNotesInput.value = tx.notes ? (tx.notes.text || '') : '';
  }



  if (paper) {
    const titleEl = paper.querySelector('.photo-cell-header-title');
    if (titleEl) {
      titleEl.textContent = isQuote ? 'PRICE ESTIMATE / QUOTATION' : 'GST TAX INVOICE';
    }
  }
  const invNoLabelEl = document.getElementById('rep-inv-no')?.parentElement?.querySelector('.meta-label');
  if (invNoLabelEl) {
    invNoLabelEl.textContent = isQuote ? 'QUOTATION NO' : 'INVOICE NO';
  }

  // Showroom Profile
  document.getElementById('rep-brand-name').textContent = state.dealership.brandName;
  document.getElementById('rep-legal-name').textContent = state.dealership.legalName;
  document.getElementById('rep-address1').textContent = state.dealership.address1;
  document.getElementById('rep-address2').textContent = state.dealership.address2;
  document.getElementById('rep-phone').textContent = state.dealership.phone;
  document.getElementById('rep-gstin').textContent = state.dealership.gstin;
  document.getElementById('rep-sig-showroom-name').textContent = state.dealership.legalName;

  const b = state.dealership;
  if (b.bankHolder || b.bankCustId || b.bankBranch) {
    let bankHtml = `<strong>Name:</strong> ${escapeHtml(b.bankHolder || b.legalName)}<br>`;
    if (b.bankCustId) bankHtml += `<strong>Cust ID:</strong> ${escapeHtml(b.bankCustId)} | `;
    bankHtml += `<strong>Bank:</strong> ${escapeHtml(b.bankName)}`;
    if (b.bankBranch) bankHtml += ` (${escapeHtml(b.bankBranch)})`;
    bankHtml += `<br><strong>A/C:</strong> ${escapeHtml(b.bankAcc)} | <strong>IFSC:</strong> ${escapeHtml(b.bankIfsc)}`;
    document.getElementById('rep-bank-details').innerHTML = bankHtml;
  } else {
    document.getElementById('rep-bank-details').innerHTML = `${escapeHtml(b.bankName)} | A/C: ${escapeHtml(b.bankAcc)} | IFSC: ${escapeHtml(b.bankIfsc)}`;
  }
  document.getElementById('rep-tc1').textContent = state.dealership.tc1;
  document.getElementById('rep-tc2').textContent = state.dealership.tc2;

  // Metas
  document.getElementById('rep-inv-no').textContent = tx.id;
  document.getElementById('rep-inv-date').textContent = tx.date;
  document.getElementById('rep-inv-ref').textContent = tx.refNo || 'NON REG';
  document.getElementById('rep-inv-payment').textContent = tx.paymentType || 'CASH';

  // Buyer and Print display options mapping
  const printOpt = tx.printOptions || { address: true, phone: true, gstin: true, email: true };

  document.getElementById('rep-cust-name').textContent = tx.customer.name;
  
  const repAddress = document.getElementById('rep-cust-address');
  if (repAddress) {
    repAddress.style.display = 'none';
  }
  
  const repAddressBr = document.getElementById('rep-cust-address-br');
  if (repAddressBr) {
    repAddressBr.style.display = 'none';
  }
  
  const repPhoneRow = document.getElementById('rep-cust-phone-row');
  if (repPhoneRow) {
    repPhoneRow.style.display = printOpt.phone ? 'block' : 'none';
  }
  document.getElementById('rep-cust-phone').textContent = tx.customer.phone;

  // Toggle optional buyer details
  const repGstinRow = document.getElementById('rep-cust-gstin-row');
  if (tx.customer.gstin && printOpt.gstin) {
    repGstinRow.style.display = 'block';
    document.getElementById('rep-cust-gstin').textContent = tx.customer.gstin;
  } else {
    repGstinRow.style.display = 'none';
  }

  const repEmailRow = document.getElementById('rep-cust-email-row');
  if (tx.customer.email && printOpt.email) {
    repEmailRow.style.display = 'block';
    document.getElementById('rep-cust-email').textContent = tx.customer.email;
  } else {
    repEmailRow.style.display = 'none';
  }

  const repIdRow = document.getElementById('rep-cust-id-row');
  if (tx.idDetails && tx.idDetails.active && tx.idDetails.idNo) {
    repIdRow.style.display = 'flex'; // Relocated flex row below payment type
    document.getElementById('rep-cust-id').textContent = tx.idDetails.idNo;
  } else {
    repIdRow.style.display = 'none';
  }

  // Sync print bank switcher checkbox state to real-time receipt replica wrapper
  const showBank = document.getElementById('toggle-print-bank')?.checked !== false;
  const bankWrapper = document.getElementById('rep-bank-wrapper');
  if (bankWrapper) {
    bankWrapper.style.display = showBank ? 'block' : 'none';
  }

  // Sync print balance due switcher checkbox state to real-time receipt replica wrapper
  const showBalance = document.getElementById('toggle-print-balance')?.checked !== false;
  const repBalRow = document.getElementById('rep-balance-due-row');
  const balanceVal = tx.financials ? parseFloat(tx.financials.balance) : 0;
  if (repBalRow) {
    if (balanceVal > 0 && showBalance) {
      repBalRow.style.display = 'flex';
      const valEl = document.getElementById('rep-balance-due-val');
      if (valEl) valEl.textContent = '₹ ' + balanceVal.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    } else {
      repBalRow.style.display = 'none';
    }
  }

  // Render Table Body depending on E-Bike vs Spares mode!
  const tbody = document.getElementById('replica-print-tbody');
  tbody.innerHTML = '';

  if (isQuote) {
    // Quotation mode: render multiple rows from tx.items or build fallback from tx.vehicle
    let trHtml = '';
    let sno = 1;
    const quoteItems = tx.items || (tx.vehicle ? [{ modelName: tx.vehicle.model, qty: 1, rate: Number(tx.financials?.base || tx.vehicle.basePrice || 0) }] : []);
    
    quoteItems.forEach(item => {
      const rateVal = Number(item.rate || 0);
      trHtml += `
        <tr>
          <td class="cell-sno text-center">${sno++}</td>
          <td class="cell-particulars font-bold">${item.modelName}</td>
          <td class="cell-chassis monospace">-</td>
          <td class="cell-motor monospace">-</td>
          <td class="cell-battery monospace">-</td>
          <td class="cell-charger monospace">-</td>
          <td class="cell-hsn text-center">8711</td>
          <td class="cell-qty text-center">${item.qty}</td>
          <td class="cell-rate text-right">${rateVal.toFixed(2)}</td>
          <td class="cell-amount text-right">${(rateVal * item.qty).toFixed(2)}</td>
        </tr>
      `;
    });
    
    // Add remaining padding rows to maintain visual layout height (10 columns)
    const rem = Math.max(1, 6 - sno);
    for (let r = 0; r < rem; r++) {
      const isLast = (r === rem - 1);
      trHtml += `
        <tr${isLast ? ' class="last-item-row"' : ''}>
          <td class="cell-sno">&nbsp;</td>
          <td class="cell-particulars">&nbsp;</td>
          <td class="cell-chassis">&nbsp;</td>
          <td class="cell-motor">&nbsp;</td>
          <td class="cell-battery">&nbsp;</td>
          <td class="cell-charger">&nbsp;</td>
          <td class="cell-hsn">&nbsp;</td>
          <td class="cell-qty">&nbsp;</td>
          <td class="cell-rate">&nbsp;</td>
          <td class="cell-amount">&nbsp;</td>
        </tr>
      `;
    }
    tbody.innerHTML = trHtml;
  } else if (isBike) {
    // E-bike mode: 1 main row and 5 padding rows (replicating the image perfectly!)
    const v = tx.vehicle;
    const printedRate = tx.financials.base; // Customizes to back-calculated base price automatically!
    tbody.innerHTML = `
      <tr>
        <td class="cell-sno text-center">1</td>
        <td class="cell-particulars font-bold">${v.model}</td>
        <td class="cell-chassis monospace">${v.chassis}</td>
        <td class="cell-motor monospace">${v.motor}</td>
        <td class="cell-battery monospace">${v.battery}</td>
        <td class="cell-charger monospace">${v.charger || '-'}</td>
        <td class="cell-hsn text-center">${v.hsn}</td>
        <td class="cell-qty text-center">1</td>
        <td class="cell-rate text-right">${printedRate.toFixed(2)}</td>
        <td class="cell-amount text-right">${printedRate.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="cell-sno">&nbsp;</td>
        <td class="cell-particulars">&nbsp;</td>
        <td class="cell-chassis">&nbsp;</td>
        <td class="cell-motor">&nbsp;</td>
        <td class="cell-battery">&nbsp;</td>
        <td class="cell-charger">&nbsp;</td>
        <td class="cell-hsn">&nbsp;</td>
        <td class="cell-qty">&nbsp;</td>
        <td class="cell-rate">&nbsp;</td>
        <td class="cell-amount">&nbsp;</td>
      </tr>
      <tr>
        <td class="cell-sno">&nbsp;</td>
        <td class="cell-particulars">&nbsp;</td>
        <td class="cell-chassis">&nbsp;</td>
        <td class="cell-motor">&nbsp;</td>
        <td class="cell-battery">&nbsp;</td>
        <td class="cell-charger">&nbsp;</td>
        <td class="cell-hsn">&nbsp;</td>
        <td class="cell-qty">&nbsp;</td>
        <td class="cell-rate">&nbsp;</td>
        <td class="cell-amount">&nbsp;</td>
      </tr>
      <tr>
        <td class="cell-sno">&nbsp;</td>
        <td class="cell-particulars">&nbsp;</td>
        <td class="cell-chassis">&nbsp;</td>
        <td class="cell-motor">&nbsp;</td>
        <td class="cell-battery">&nbsp;</td>
        <td class="cell-charger">&nbsp;</td>
        <td class="cell-hsn">&nbsp;</td>
        <td class="cell-qty">&nbsp;</td>
        <td class="cell-rate">&nbsp;</td>
        <td class="cell-amount">&nbsp;</td>
      </tr>
      <tr>
        <td class="cell-sno">&nbsp;</td>
        <td class="cell-particulars">&nbsp;</td>
        <td class="cell-chassis">&nbsp;</td>
        <td class="cell-motor">&nbsp;</td>
        <td class="cell-battery">&nbsp;</td>
        <td class="cell-charger">&nbsp;</td>
        <td class="cell-hsn">&nbsp;</td>
        <td class="cell-qty">&nbsp;</td>
        <td class="cell-rate">&nbsp;</td>
        <td class="cell-amount">&nbsp;</td>
      </tr>
      <tr class="last-item-row">
        <td class="cell-sno">&nbsp;</td>
        <td class="cell-particulars">&nbsp;</td>
        <td class="cell-chassis">&nbsp;</td>
        <td class="cell-motor">&nbsp;</td>
        <td class="cell-battery">&nbsp;</td>
        <td class="cell-charger">&nbsp;</td>
        <td class="cell-hsn">&nbsp;</td>
        <td class="cell-qty">&nbsp;</td>
        <td class="cell-rate">&nbsp;</td>
        <td class="cell-amount">&nbsp;</td>
      </tr>
    `;
  } else {
    // Spares and service billing list
    let trHtml = '';
    let sno = 1;

    tx.spares.forEach(item => {
      trHtml += `
        <tr>
          <td class="cell-sno text-center">${sno++}</td>
          <td class="cell-particulars font-bold">${item.name}</td>
          <td class="cell-chassis monospace">-</td>
          <td class="cell-motor monospace">-</td>
          <td class="cell-battery monospace">-</td>
          <td class="cell-charger monospace">-</td>
          <td class="cell-hsn text-center">${item.hsn}</td>
          <td class="cell-qty text-center">${item.qty}</td>
          <td class="cell-rate text-right">${item.rate.toFixed(2)}</td>
          <td class="cell-amount text-right">${item.amount.toFixed(2)}</td>
        </tr>
      `;
    });

    if (tx.labor > 0) {
      trHtml += `
        <tr>
          <td class="cell-sno text-center">${sno++}</td>
          <td class="cell-particulars font-bold">Labor / Servicing Charges</td>
          <td class="cell-chassis monospace">-</td>
          <td class="cell-motor monospace">-</td>
          <td class="cell-battery monospace">-</td>
          <td class="cell-charger monospace">-</td>
          <td class="cell-hsn text-center">998729</td>
          <td class="cell-qty text-center">1</td>
          <td class="cell-rate text-right">${tx.labor.toFixed(2)}</td>
          <td class="cell-amount text-right">${tx.labor.toFixed(2)}</td>
        </tr>
      `;
    }

    // Add remaining padding rows to maintain visual layout height (10 columns)
    const rem = Math.max(1, 6 - sno);
    for (let r = 0; r < rem; r++) {
      const isLast = (r === rem - 1);
      trHtml += `
        <tr${isLast ? ' class="last-item-row"' : ''}>
          <td class="cell-sno">&nbsp;</td>
          <td class="cell-particulars">&nbsp;</td>
          <td class="cell-chassis">&nbsp;</td>
          <td class="cell-motor">&nbsp;</td>
          <td class="cell-battery">&nbsp;</td>
          <td class="cell-charger">&nbsp;</td>
          <td class="cell-hsn">&nbsp;</td>
          <td class="cell-qty">&nbsp;</td>
          <td class="cell-rate">&nbsp;</td>
          <td class="cell-amount">&nbsp;</td>
        </tr>
      `;
    }

    tbody.innerHTML = trHtml;
  }

  // Inject calculation sum rows onto tbody (updated to colspan 7 + colspan 2 to expand label space)
  const grandTotal = tx.financials.total;
  const sparesCostWords = numberToWords(Math.round(grandTotal));

  // Calculate dynamic rows for the invoice notes rowspan
  const taxRows = isInter ? 1 : 2;
  const idRow = (tx.idDetails && tx.idDetails.active && tx.idDetails.cost > 0) ? 1 : 0;
  const overdueRow = (tx.financials && tx.financials.mergedOverdue > 0) ? 1 : 0;
  const grandTotalRow = 1;
  const totalSummaryRows = taxRows + idRow + overdueRow + grandTotalRow;

  const notesText = (tx.notes && tx.notes.text) ? tx.notes.text.trim() : '';
  const showNotesCheckbox = document.getElementById('toggle-print-notes');
  const showNotes = showNotesCheckbox ? showNotesCheckbox.checked : (tx.notes ? tx.notes.active : false);
  const hasNotes = notesText !== '' && showNotes;

  const cellNotesHtml = `
    <td rowspan="${totalSummaryRows}" class="cell-invoice-notes" style="${hasNotes ? 'border: 1px solid black !important; border-top: none !important; border-right: 1px solid black !important;' : 'border: none !important; border-right: 1px solid black !important;'} vertical-align: top; padding: ${hasNotes ? '0.4rem' : '0rem'}; text-align: left; background-color: #fff;">
      ${hasNotes ? `
        <div style="font-size: 0.75rem; line-height: 1.25; color: #000;">
          <strong style="text-transform: uppercase; font-size: 0.7rem; display: block; margin-bottom: 0.2rem; border-bottom: 1px dashed #bbb; padding-bottom: 0.1rem;">Notes / Remarks:</strong>
          <div style="white-space: pre-wrap; font-weight: normal; font-family: monospace;">${escapeHtml(notesText)}</div>
        </div>
      ` : '&nbsp;'}
    </td>
  `;

  let isFirstRow = true;
  let taxSplitHtml = '';

  if (isInter) {
    taxSplitHtml += `
      <tr id="rep-tax-row-igst">
        ${isFirstRow ? cellNotesHtml : ''}
        <td colspan="2" class="bg-tax-lbl text-center" id="rep-igst-lbl">IGST ${isBike ? '5.00%' : '18.00%'}</td>
        <td class="bg-tax-val text-right" id="rep-igst">${tx.financials.igst.toFixed(2)}</td>
      </tr>
    `;
    isFirstRow = false;
  } else {
    taxSplitHtml += `
      <tr id="rep-tax-row-cgst">
        ${isFirstRow ? cellNotesHtml : ''}
        <td colspan="2" class="bg-tax-lbl text-center" id="rep-cgst-lbl">CGST ${isBike ? '2.50%' : '9.00%'}</td>
        <td class="bg-tax-val text-right" id="rep-cgst">${tx.financials.cgst.toFixed(2)}</td>
      </tr>
    `;
    isFirstRow = false;

    taxSplitHtml += `
      <tr id="rep-tax-row-sgst">
        ${isFirstRow ? cellNotesHtml : ''}
        <td colspan="2" class="bg-tax-lbl text-center" id="rep-sgst-lbl">SGST ${isBike ? '2.50%' : '9.00%'}</td>
        <td class="bg-tax-val text-right" id="rep-sgst">${tx.financials.sgst.toFixed(2)}</td>
      </tr>
    `;
  }

  // ID Cost adjustment row in printed sheet summary!
  if (tx.idDetails && tx.idDetails.active && tx.idDetails.cost > 0) {
    const signSymbol = tx.idDetails.treatment === 'subtract' ? '-' : '+';
    const displayVal = (tx.idDetails.treatment === 'subtract' ? '-' : '') + tx.idDetails.cost.toFixed(2);
    taxSplitHtml += `
      <tr id="rep-id-cost-row">
        ${isFirstRow ? cellNotesHtml : ''}
        <td colspan="2" class="bg-tax-lbl text-center font-bold" style="background-color:#fff2cc !important; color:#000 !important;">ID PURCHASE COST (${signSymbol})</td>
        <td class="bg-tax-val text-right font-bold" style="background-color:#fff2cc !important; color:#000 !important;">${displayVal}</td>
      </tr>
    `;
    isFirstRow = false;
  }

  // Merged previous overdue row in printed sheet summary!
  if (tx.financials && tx.financials.mergedOverdue > 0) {
    taxSplitHtml += `
      <tr id="rep-merged-overdue-row">
        ${isFirstRow ? cellNotesHtml : ''}
        <td colspan="2" class="bg-tax-lbl text-center font-bold" style="background-color:#fce5cd !important; color:#000 !important;">PREVIOUS OVERDUE</td>
        <td class="bg-tax-val text-right font-bold" style="background-color:#fce5cd !important; color:#000 !important;">+ ${tx.financials.mergedOverdue.toFixed(2)}</td>
      </tr>
    `;
    isFirstRow = false;
  }

  const tableBottomHtml = `
    <tr class="summary-border-top">
      <td colspan="7" class="cell-amount-words" style="border-top: 1px solid black !important; border-right: 1px solid black !important;">
        AMOUNT IN WORDS : <span id="rep-words" style="font-weight: 700; text-transform: uppercase;">${sparesCostWords} ONLY.</span>
      </td>
      <td colspan="2" class="bg-total-lbl text-center font-bold" style="border-top: 1px solid black !important; border-left: 1px solid black !important; border-right: 1px solid black !important;">TOTAL</td>
      <td class="bg-total-val text-right font-bold" id="rep-subtotal" style="border-top: 1px solid black !important; border-left: 1px solid black !important; border-right: 1px solid black !important;">${tx.financials.base.toFixed(2)}</td>
    </tr>
    ${taxSplitHtml}
    <tr>
      ${isFirstRow ? cellNotesHtml : ''}
      <td colspan="2" class="bg-grand-lbl text-center font-bold color-white">GRAND TOTAL</td>
      <td class="bg-grand-val text-right font-bold color-white" id="rep-total">${grandTotal.toFixed(2)}</td>
    </tr>
  `;

  tbody.innerHTML += tableBottomHtml;
  
  // Recalculate summary row colspans dynamically to prevent stretch
  updatePrintTableColspans();
}

// --- Dynamic high-resolution PDF download ---
function downloadInvoicePDF() {
  const tx = state.loadedTransaction;
  if (!tx) return;

  const element = document.getElementById('invoice-paper-element');
  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: `${tx.docType.toUpperCase()}_#${tx.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

// --- CSV Exporters ---

function exportSalesToCSV() {
  const headers = ['Invoice No', 'Date', 'Type', 'Buyer Name', 'Phone', 'GSTIN', 'Billed Particulars', 'Grand Total', 'Amount Paid', 'Balance Due'];
  const rows = state.transactions
    .filter(t => t && t.docType === 'invoice')
    .map(t => {
      let itemDesc = '';
      if (t.billCategory === 'bike') itemDesc = t.vehicle.model;
      else itemDesc = t.spares.map(s => s.name).join('; ');
      
      return [
        t.id, t.date, t.docType.toUpperCase(), t.customer.name, t.customer.phone, t.customer.gstin || '',
        itemDesc, t.financials.total, t.financials.paid, t.financials.balance
      ];
    });
  
  downloadCSVFile(headers, rows, 'Sri_Lakshmi_eBikes_SalesHistory.csv');
}

function exportPurchasesToCSV() {
  const headers = ['Purchase Bill No', 'Date', 'Supplier Name', 'Model Name', 'Chassis No', 'Motor No', 'Battery No', 'Charger No', 'HSN Code', 'Cost Price', 'Base Retail Rate'];
  const rows = state.purchases.map(p => [
    p.billNo, p.date, p.supplier, p.model, p.chassis, p.motor, p.battery, p.charger || '', p.hsn, p.costPrice, p.sellingPrice
  ]);
  
  downloadCSVFile(headers, rows, 'Sri_Lakshmi_eBikes_PurchasesLedger.csv');
}

function exportStockToCSV() {
  const headers = ['Model Description', 'Chassis No', 'Motor No', 'Battery No', 'Charger No', 'HSN Code', 'Purchase Cost', 'Retail Base Price', 'Status'];
  const rows = state.inventory.map(b => [
    b.model, b.chassis, b.motor, b.battery, b.charger || '', b.hsn, b.costPrice || 0, b.basePrice, b.status
  ]);
  
  downloadCSVFile(headers, rows, 'Sri_Lakshmi_eBikes_ActiveInventory.csv');
}

function exportSparesToCSV() {
  const headers = ['Spare Part Name', 'SKU Part No', 'HSN Code', 'Purchase Cost', 'Retail Selling Price', 'Quantity in Stock', 'Reorder Level'];
  const rows = state.spares.map(s => [
    s.name, s.sku, s.hsn, s.costPrice, s.sellingPrice, s.qty, s.minLevel
  ]);
  
  downloadCSVFile(headers, rows, 'Sri_Lakshmi_eBikes_SparesCatalog.csv');
}

function exportServicesToCSV() {
  const headers = ['Job ID', 'Linked Invoice', 'Chassis No', 'Customer Name', 'Date', 'Service No', 'Odometer Reading (KMs)', 'Spares Cost', 'Labor Cost', 'Total Bill'];
  const rows = state.services.map(s => [
    s.id, s.invoiceNo || '', s.chassis, s.custName, s.date, s.serviceCount, s.odometer, s.sparesCost, s.laborCharges, s.totalBill
  ]);
  
  downloadCSVFile(headers, rows, 'Sri_Lakshmi_eBikes_ServicesLedger.csv');
}

function downloadCSVFile(headers, dataRows, filename) {
  let csvContent = '\uFEFF'; 
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';
  
  dataRows.forEach(row => {
    csvContent += row.map(cell => {
      const stringCell = cell !== null && cell !== undefined ? String(cell) : '';
      return `"${stringCell.replace(/"/g, '""')}"`;
    }).join(',') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// --- Indian Currency Converter to English Words ---
function numberToWords(num) {
  if (num === 0) return 'ZERO';

  const singleDigits = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const doubleDigits = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  
  function convertLessThanThousand(n) {
    let str = '';
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + ' HUNDRED ';
      n %= 100;
    }
    if (n >= 20) {
      str += doubleDigits[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += singleDigits[n] + ' ';
    }
    return str.trim();
  }

  let words = '';
  if (num >= 10000000) {
    words += convertLessThanThousand(Math.floor(num / 10000000)) + ' CRORE ';
    num %= 10000000;
  }
  if (num >= 100000) {
    words += convertLessThanThousand(Math.floor(num / 100000)) + ' LAKH ';
    num %= 100000;
  }
  if (num >= 1000) {
    words += convertLessThanThousand(Math.floor(num / 1000)) + ' THOUSAND ';
    num %= 1000;
  }
  if (num > 0) {
    words += convertLessThanThousand(num);
  }
  
  return words.trim() + ' RUPEES';
}

// --- Formatter Utility (Indian Currency Format) ---
function formatCurrency(amount) {
  if (isNaN(amount) || amount === null) return '₹ 0.00';
  return '₹ ' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// --- HTML Escape Sanitizer ---
function escapeHtml(string) {
  const matchHtmlRegExp = /["'&<>]/;
  const str = '' + string;
  const match = matchHtmlRegExp.exec(str);

  if (!match) return str;

  let escape;
  let html = '';
  let index = 0;
  let lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: escape = '&quot;'; break;
      case 38: escape = '&amp;'; break;
      case 39: escape = '&#39;'; break;
      case 60: escape = '&lt;'; break;
      case 62: escape = '&gt;'; break;
      default: continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}

function resetBillingForm() {
  clearBillingDraft();
  document.getElementById('cust-name').value = '';
  document.getElementById('cust-phone').value = '';
  document.getElementById('cust-email').value = '';
  document.getElementById('cust-gstin').value = '';
  document.getElementById('cust-ref-no').value = 'NON REG';
  document.getElementById('cust-address').value = '';

  document.getElementById('toggle-gstin').checked = false;
  toggleGstinField(false);

  document.getElementById('toggle-id-details').checked = false;
  toggleIdDetailsField(false);
  document.getElementById('bill-id-no').value = '';
  document.getElementById('bill-id-cost').value = '0';
  document.getElementById('bill-id-treatment').value = 'add';

  const vehicleSelect = document.getElementById('vehicle-select');
  if (vehicleSelect) vehicleSelect.value = '';

  const specsBlock = document.getElementById('specs-block');
  if (specsBlock) specsBlock.style.display = 'none';

  document.getElementById('override-toggle').checked = false;
  toggleOverrideTotal(false);

  document.getElementById('amount-paid').value = '';

  const invoiceInput = document.getElementById('bill-invoice-no');
  if (invoiceInput) {
    invoiceInput.value = generateDocumentNumber(state.currentDocMode || 'invoice');
  }
  const dateInput = document.getElementById('bill-date');
  if (dateInput) {
    dateInput.value = getCurrentDateString();
  }

  clearBillingCalculations();
}

function generateDocumentNumber(docType) {
  if (docType === 'invoice') {
    // Look at existing invoices and increment the largest number
    let maxInvoice = 17; // mock starts at 18
    state.transactions.forEach(t => {
      if (t && t.docType === 'invoice') {
        const num = parseInt(t.id);
        if (!isNaN(num) && num > maxInvoice) {
          maxInvoice = num;
        }
      }
    });
    return String(maxInvoice + 1);
  } else {
    // Quotations numbering
    let maxQuote = 0;
    state.transactions.forEach(t => {
      if (t && t.docType === 'quotation') {
        const cleaned = t.id.replace('QT-', '');
        const num = parseInt(cleaned);
        if (!isNaN(num) && num > maxQuote) {
          maxQuote = num;
        }
      }
    });
    return 'QT-' + String(maxQuote + 1).padStart(4, '0');
  }
}

function getCurrentDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadAndPrintInvoice(txId) {
  const tx = state.transactions.find(t => String(t.id) === String(txId));
  if (!tx) {
    alert('Transaction record not found.');
    return;
  }
  state.loadedTransaction = tx;
  renderInvoicePrintSheet(tx);
  updatePrinterTabDisplay();
  switchTab('invoice-printer-tab');
  setTimeout(() => {
    window.print();
  }, 350);
}

// --- Dynamic Print Table Columns Controls ---
function togglePrintColumn(columnId, isChecked) {
  const paper = document.getElementById('invoice-paper-element');
  if (!paper) return;
  
  let className = '';
  if (columnId === 'col-chassis') className = 'hide-chassis';
  else if (columnId === 'col-motor') className = 'hide-motor';
  else if (columnId === 'col-battery') className = 'hide-battery';
  else if (columnId === 'col-charger') className = 'hide-charger';
  else if (columnId === 'col-hsn') className = 'hide-hsn';
  
  if (isChecked) {
    paper.classList.remove(className);
  } else {
    paper.classList.add(className);
  }
  
  // Recalculate summary row colspans dynamically to prevent stretch
  updatePrintTableColspans();
}

function updatePrintTableColspans() {
  const paper = document.getElementById('invoice-paper-element');
  if (!paper) return;
  
  const isHsnHidden = paper.classList.contains('hide-hsn');
  
  let hiddenCountExceptHsn = 0;
  if (paper.classList.contains('hide-chassis')) hiddenCountExceptHsn++;
  if (paper.classList.contains('hide-motor')) hiddenCountExceptHsn++;
  if (paper.classList.contains('hide-battery')) hiddenCountExceptHsn++;
  if (paper.classList.contains('hide-charger')) hiddenCountExceptHsn++;
  
  // SNO + PARTICULARS + visible optional columns (chassis, motor, battery, charger)
  const spacerColspan = 6 - hiddenCountExceptHsn;
  // If HSN is visible: spans HSN + QTY + RATE (3 columns). If HSN is hidden: QTY + RATE (2 columns).
  const labelColspan = isHsnHidden ? 2 : 3;
  
  // Set colspans on spacers
  const spacers = paper.querySelectorAll('td.cell-amount-words, td.border-none, td.border-none-no-bottom, td.cell-invoice-notes');
  spacers.forEach(td => {
    td.setAttribute('colspan', spacerColspan);
  });
  
  // Set colspans on label cells
  const labels = paper.querySelectorAll('td.bg-total-lbl, td.bg-tax-lbl, td.bg-grand-lbl');
  labels.forEach(td => {
    td.setAttribute('colspan', labelColspan);
  });
}

// ═══════════════════════════════════════════════════════════════
// VEHICLE WARRANTY & DELIVERY AGREEMENT CONTROLLERS
// ═══════════════════════════════════════════════════════════════

function setWarrantyTabMode(mode) {
  state.currentWarrantyTabMode = mode || 'creator';
  
  const creatorPanel = document.getElementById('warranty-creator-panel');
  const historyPanel = document.getElementById('warranty-history-panel');
  
  const creatorOpt = document.getElementById('war-cat-creator');
  const historyOpt = document.getElementById('war-cat-history');
  
  if (mode === 'history') {
    creatorPanel.style.display = 'none';
    historyPanel.style.display = 'block';
    creatorOpt.classList.remove('active');
    historyOpt.classList.add('active');
    renderWarrantyHistoryTable();
  } else {
    creatorPanel.style.display = 'block';
    historyPanel.style.display = 'none';
    creatorOpt.classList.add('active');
    historyOpt.classList.remove('active');
  }
}

function initializeAgreementFields() {
  const dateInput = document.getElementById('agr-date');
  if (dateInput) {
    dateInput.value = getCurrentDateString();
  }
  
  const odoInput = document.getElementById('agr-odometer');
  if (odoInput) {
    odoInput.value = '0';
  }

  // Restore Dealership Showroom details as starting defaults
  const defaults = {
    'agr-showroom-name': state.dealership.legalName || 'SRI LAKSHMI E-BIKES',
    'agr-showroom-manager': 'Proprietor',
    'agr-showroom-phone': state.dealership.phone || '9944659264',
    'agr-showroom-email': 'srilakshmiebikes@gmail.com',
    'agr-showroom-address': (state.dealership.address1 || '') + ' ' + (state.dealership.address2 || '')
  };

  Object.entries(defaults).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  syncAgreementFormToReplica();
}

function updateAgreementDropdown() {
  const loader = document.getElementById('agr-invoice-loader');
  if (!loader) return;

  loader.innerHTML = '<option value="">-- Load details from processed invoice (Optional) --</option>';

  // Get all unique processed bike invoices
  const bikeInvoices = state.transactions.filter(t => t && t.billCategory === 'bike' && t.docType === 'invoice');

  if (bikeInvoices.length === 0) {
    loader.innerHTML += '<option value="" disabled>No processed bike invoices found.</option>';
    return;
  }

  bikeInvoices.forEach(inv => {
    const custName = inv.customer ? inv.customer.name : 'Unknown Customer';
    const modelName = inv.vehicle ? inv.vehicle.model : 'E-Bike';
    const chassis = inv.vehicle ? inv.vehicle.chassis : '';
    const chassisShort = chassis ? ` (${chassis.slice(-6).toUpperCase()})` : '';
    
    loader.innerHTML += `
      <option value="${inv.id}">Invoice #${inv.id} - ${custName} - ${modelName}${chassisShort}</option>
    `;
  });
}

function loadInvoiceToAgreementFields(txId) {
  if (!txId) return;

  const inv = state.transactions.find(t => String(t.id) === String(txId));
  if (!inv) {
    alert('Invoice record not found.');
    return;
  }

  // Fill vehicle details
  const v = inv.vehicle || {};
  document.getElementById('agr-model-name').value = v.model || '';
  document.getElementById('agr-serial-no').value = v.chassis || '';
  document.getElementById('agr-date').value = inv.date || getCurrentDateString();
  
  // Look up odometer reading from services if exists, else 0
  const linkService = state.services.find(s => s && s.invoiceNo === String(inv.id));
  document.getElementById('agr-odometer').value = linkService ? linkService.odometer : '0';

  // Extract color if mentioned in model, or try to load color from stock
  let color = '';
  const modelLower = (v.model || '').toLowerCase();
  const colors = ['red', 'white', 'blue', 'black', 'grey', 'gray', 'green', 'yellow', 'silver', 'glossy', 'matte'];
  for (let c of colors) {
    if (modelLower.includes(c)) {
      color = c.toUpperCase();
      break;
    }
  }
  document.getElementById('agr-color').value = color || 'GLOSSY / STANDARD COLOR';

  // Fill customer details
  const c = inv.customer || {};
  document.getElementById('agr-cust-name').value = c.name || '';
  document.getElementById('agr-cust-phone').value = c.phone || '';
  document.getElementById('agr-cust-address').value = c.address || '';
  document.getElementById('agr-cust-email').value = c.email || '';
  document.getElementById('agr-cust-id-type').value = (inv.idDetails && inv.idDetails.active && inv.idDetails.idNo) ? 'ID Proof' : '';
  document.getElementById('agr-cust-id-val').value = (inv.idDetails && inv.idDetails.idNo) ? inv.idDetails.idNo : '';

  // Showroom details reset to defaults just in case
  document.getElementById('agr-showroom-name').value = state.dealership.legalName || 'SRI LAKSHMI E-BIKES';
  document.getElementById('agr-showroom-manager').value = 'Proprietor';
  document.getElementById('agr-showroom-phone').value = state.dealership.phone || '9944659264';
  document.getElementById('agr-showroom-email').value = 'srilakshmiebikes@gmail.com';
  document.getElementById('agr-showroom-address').value = (state.dealership.address1 || '') + ' ' + (state.dealership.address2 || '');

  syncAgreementFormToReplica();
  alert(`✅ Successfully loaded customer & vehicle details from Invoice #${inv.id}!`);
}

function toggleWarrantyGuaranteeInputs() {
  const covType = document.getElementById('agr-coverage-type')?.value || 'both';
  const warCont = document.getElementById('agr-warranty-dur-container');
  const guaCont = document.getElementById('agr-guarantee-dur-container');
  
  if (covType === 'both') {
    if (warCont) warCont.style.display = 'block';
    if (guaCont) guaCont.style.display = 'block';
  } else if (covType === 'warranty') {
    if (warCont) warCont.style.display = 'block';
    if (guaCont) guaCont.style.display = 'none';
  } else if (covType === 'guarantee') {
    if (warCont) warCont.style.display = 'none';
    if (guaCont) guaCont.style.display = 'block';
  }
}

function syncAgreementFormToReplica() {
  const getVal = (id, fallback) => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== '' ? el.value.trim() : fallback;
  };

  // Section 1
  const modelName = getVal('agr-model-name', '___________________________');
  const chassis = getVal('agr-serial-no', '___________________________');
  const delDate = getVal('agr-date', '___________________________');
  const odometer = getVal('agr-odometer', '___________________________');
  const color = getVal('agr-color', '___________________________');

  document.getElementById('rep-agr-model-name').textContent = modelName;
  document.getElementById('rep-agr-serial-no').textContent = chassis;
  
  // Format delivery date nicely if selected
  let formattedDate = delDate;
  if (delDate && delDate !== '___________________________') {
    const d = new Date(delDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      formattedDate = `${day}-${month}-${year}`;
    }
  }
  document.getElementById('rep-agr-delivery-date').textContent = formattedDate;
  document.getElementById('rep-agr-odometer').textContent = odometer;
  document.getElementById('rep-agr-color').textContent = color;

  // Section 2 Durations & Conditional Coverage
  const covType = getVal('agr-coverage-type', 'both');
  const warDur = getVal('agr-warranty-dur', '12');
  const guaDur = getVal('agr-guarantee-dur', '12');
  
  const repWarRow = document.getElementById('rep-agr-warranty-row');
  const repGuaRow = document.getElementById('rep-agr-guarantee-row');
  const repSubTitle = document.getElementById('rep-agr-sub-title');
  const repSec2Title = document.getElementById('rep-agr-sec2-title');

  if (covType === 'both') {
    if (repWarRow) repWarRow.style.display = 'table-row';
    if (repGuaRow) repGuaRow.style.display = 'table-row';
    if (repSubTitle) repSubTitle.innerHTML = 'WARRANTY, GUARANTEE &amp; SERVICE TERMS &amp; CONDITIONS';
    if (repSec2Title) repSec2Title.innerHTML = 'SECTION 2: WARRANTY &amp; GUARANTEE PERIOD';
  } else if (covType === 'warranty') {
    if (repWarRow) repWarRow.style.display = 'table-row';
    if (repGuaRow) repGuaRow.style.display = 'none';
    if (repSubTitle) repSubTitle.innerHTML = 'WARRANTY &amp; SERVICE TERMS &amp; CONDITIONS';
    if (repSec2Title) repSec2Title.innerHTML = 'SECTION 2: WARRANTY PERIOD';
  } else if (covType === 'guarantee') {
    if (repWarRow) repWarRow.style.display = 'none';
    if (repGuaRow) repGuaRow.style.display = 'table-row';
    if (repSubTitle) repSubTitle.innerHTML = 'GUARANTEE &amp; SERVICE TERMS &amp; CONDITIONS';
    if (repSec2Title) repSec2Title.innerHTML = 'SECTION 2: GUARANTEE PERIOD';
  }

  if (document.getElementById('rep-agr-warranty-dur')) {
    document.getElementById('rep-agr-warranty-dur').textContent = warDur;
  }
  if (document.getElementById('rep-agr-guarantee-dur')) {
    document.getElementById('rep-agr-guarantee-dur').textContent = guaDur;
  }

  // Seller details (Page 5)
  const showName = getVal('agr-showroom-name', '___________________________');
  const showAddr = getVal('agr-showroom-address', '___________________________');
  const showMgr = getVal('agr-showroom-manager', '___________________________');
  const showPhone = getVal('agr-showroom-phone', '___________________');
  const showEmail = document.getElementById('agr-showroom-email')?.value.trim() || '';

  document.getElementById('rep-agr-showroom-name').textContent = showName;
  document.getElementById('rep-agr-showroom-address').textContent = showAddr;
  document.getElementById('rep-agr-showroom-dealer').textContent = showMgr;
  document.getElementById('rep-agr-showroom-phone').textContent = showPhone;

  // Dynamic show/hide showroom email
  const repEmailRow = document.getElementById('rep-agr-showroom-email-row');
  if (showEmail) {
    if (repEmailRow) {
      repEmailRow.style.display = 'block';
      document.getElementById('rep-agr-showroom-email').textContent = showEmail;
    }
  } else {
    if (repEmailRow) {
      repEmailRow.style.display = 'none';
    }
  }

  // Buyer details (Page 5)
  const custName = getVal('agr-cust-name', '___________________________');
  const custAddr = getVal('agr-cust-address', '___________________________');
  const custPhone = getVal('agr-cust-phone', '___________________________');

  const elName = document.getElementById('rep-agr-cust-name');
  if (elName) elName.textContent = custName;
  const elAddr = document.getElementById('rep-agr-cust-address');
  if (elAddr) elAddr.textContent = custAddr;
  const elPhone = document.getElementById('rep-agr-cust-phone');
  if (elPhone) elPhone.textContent = custPhone;

  // Buyer details (Page 6)
  const custEmail = getVal('agr-cust-email', '_____________________________');
  const custIdType = getVal('agr-cust-id-type', '______________________');
  const custIdVal = getVal('agr-cust-id-val', '__________________________');

  document.getElementById('rep-agr-cust-name-p6').textContent = custName;
  document.getElementById('rep-agr-cust-address-p6').textContent = custAddr;
  document.getElementById('rep-agr-cust-phone-p6').textContent = custPhone;
  document.getElementById('rep-agr-cust-email-p6').textContent = custEmail;
  document.getElementById('rep-agr-cust-id-type-p6').textContent = custIdType;
  document.getElementById('rep-agr-cust-id-val-p6').textContent = custIdVal;
}

function saveNewWarrantyAgreement() {
  const modelName = document.getElementById('agr-model-name').value.trim();
  const chassis = document.getElementById('agr-serial-no').value.trim();
  const delDate = document.getElementById('agr-date').value.trim();
  const odometer = document.getElementById('agr-odometer').value.trim();
  const color = document.getElementById('agr-color').value.trim();
  
  const warDur = document.getElementById('agr-warranty-dur').value;
  const guaDur = document.getElementById('agr-guarantee-dur').value;
  
  const showName = document.getElementById('agr-showroom-name').value.trim();
  const showMgr = document.getElementById('agr-showroom-manager').value.trim();
  const showPhone = document.getElementById('agr-showroom-phone').value.trim();
  const showEmail = document.getElementById('agr-showroom-email').value.trim();
  const showAddr = document.getElementById('agr-showroom-address').value.trim();

  const custName = document.getElementById('agr-cust-name').value.trim();
  const custPhone = document.getElementById('agr-cust-phone').value.trim();
  const custAddr = document.getElementById('agr-cust-address').value.trim();
  const custEmail = document.getElementById('agr-cust-email').value.trim();
  const custIdType = document.getElementById('agr-cust-id-type').value.trim();
  const custIdVal = document.getElementById('agr-cust-id-val').value.trim();

  // Basic Validations
  if (!modelName || !chassis || !custName || !custPhone || !custAddr) {
    alert('⚠️ Please fill out all required fields (*):\n- Model Name\n- Chassis Number\n- Customer Name & Phone\n- Customer Address');
    return;
  }

  const id = 'SL-AGR-' + Math.floor(10000 + Math.random() * 90000);
  
  const agreement = {
    id,
    dateCreated: getCurrentDateString(),
    vehicle: { modelName, chassis, delDate, odometer, color },
    durations: { warDur, guaDur },
    showroom: { showName, showMgr, showPhone, showEmail, showAddr },
    customer: { custName, custPhone, custAddr, custEmail, custIdType, custIdVal }
  };

  // Persistent storage write
  if (!Array.isArray(state.warrantyAgreements)) {
    state.warrantyAgreements = [];
  }
  
  // Overwrite if same chassis is found to prevent duplication of history contracts
  const existingIdx = state.warrantyAgreements.findIndex(a => a && a.vehicle && a.vehicle.chassis.toLowerCase() === chassis.toLowerCase());
  if (existingIdx !== -1) {
    if (!confirm(`⚠️ An agreement for Chassis: ${chassis} already exists in history.\n\nDo you want to overwrite the existing record with this new configuration?`)) {
      return;
    }
    state.warrantyAgreements[existingIdx] = agreement;
  } else {
    state.warrantyAgreements.push(agreement);
  }

  localStorage.setItem('sleb_warranty_agreements', JSON.stringify(state.warrantyAgreements));
  try { triggerBackgroundBackup(); } catch (e) {}
  
  // Wipe forms and reset defaults
  resetAgreementFields();
  
  alert(`🎉 Agreement logged successfully!\n\nID: ${id}\nChassis: ${chassis}\nCustomer: ${custName}`);
  
  // Switch to history tab and render
  setWarrantyTabMode('history');
}

function resetAgreementFields() {
  const fields = ['agr-model-name', 'agr-serial-no', 'agr-color', 'agr-cust-name', 'agr-cust-phone', 'agr-cust-address', 'agr-cust-email', 'agr-cust-id-type', 'agr-cust-id-val'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const selectLoader = document.getElementById('agr-invoice-loader');
  if (selectLoader) selectLoader.value = '';

  initializeAgreementFields();
}

function renderWarrantyHistoryTable() {
  const tbody = document.getElementById('warranty-history-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!state.warrantyAgreements || state.warrantyAgreements.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:var(--text-muted); padding:2rem;">
          No warranty agreements generated yet.
        </td>
      </tr>
    `;
    return;
  }

  state.warrantyAgreements.forEach(agr => {
    if (!agr || !agr.vehicle || !agr.customer) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-family:monospace; font-weight:700; color:var(--color-primary);">${agr.id}</td>
      <td style="font-weight:600;">${escapeHtml(agr.customer.custName)}</td>
      <td style="font-family:monospace;">${escapeHtml(agr.vehicle.chassis)}</td>
      <td>${escapeHtml(agr.vehicle.modelName)}</td>
      <td>${escapeHtml(agr.vehicle.delDate)}</td>
      <td style="text-align:center; font-weight:700; color:var(--color-stock);">${agr.durations.warDur} months</td>
      <td style="text-align:center; font-weight:700; color:var(--color-stock);">${agr.durations.guaDur} months</td>
      <td style="text-align:center;">
        <div style="display:flex; gap:0.4rem; justify-content:center;">
          <button class="btn btn-secondary" onclick="loadWarrantyAgreement('${agr.id}')" style="padding:0.35rem 0.6rem; font-size:0.75rem; width:auto;">
            Load
          </button>
          <button class="btn btn-secondary" onclick="printWarrantyAgreement('${agr.id}')" style="padding:0.35rem 0.6rem; font-size:0.75rem; width:auto; border-color:var(--color-primary);">
            Print
          </button>
          <button class="btn btn-secondary" onclick="pdfWarrantyAgreement('${agr.id}')" style="padding:0.35rem 0.6rem; font-size:0.75rem; width:auto; border-color:var(--color-secondary);">
            PDF
          </button>
          <button class="btn btn-danger" onclick="deleteWarrantyAgreement('${agr.id}')" style="padding:0.35rem 0.6rem; font-size:0.75rem; width:auto;">
            Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterWarrantyHistoryTable() {
  const query = document.getElementById('warranty-search-input').value.trim().toLowerCase();
  const rows = document.querySelectorAll('#warranty-history-table tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function loadWarrantyAgreement(id) {
  const agr = state.warrantyAgreements.find(a => String(a.id) === String(id));
  if (!agr) return;

  // Load into creator form fields
  document.getElementById('agr-model-name').value = agr.vehicle.modelName;
  document.getElementById('agr-serial-no').value = agr.vehicle.chassis;
  document.getElementById('agr-date').value = agr.vehicle.delDate;
  document.getElementById('agr-odometer').value = agr.vehicle.odometer;
  document.getElementById('agr-color').value = agr.vehicle.color;
  
  document.getElementById('agr-warranty-dur').value = agr.durations.warDur;
  document.getElementById('agr-guarantee-dur').value = agr.durations.guaDur;

  document.getElementById('agr-showroom-name').value = agr.showroom.showName;
  document.getElementById('agr-showroom-manager').value = agr.showroom.showMgr;
  document.getElementById('agr-showroom-phone').value = agr.showroom.showPhone;
  document.getElementById('agr-showroom-email').value = agr.showroom.showEmail;
  document.getElementById('agr-showroom-address').value = agr.showroom.showAddr;

  document.getElementById('agr-cust-name').value = agr.customer.custName;
  document.getElementById('agr-cust-phone').value = agr.customer.custPhone;
  document.getElementById('agr-cust-address').value = agr.customer.custAddr;
  document.getElementById('agr-cust-email').value = agr.customer.custEmail || '';
  document.getElementById('agr-cust-id-type').value = agr.customer.custIdType || '';
  document.getElementById('agr-cust-id-val').value = agr.customer.custIdVal || '';

  syncAgreementFormToReplica();
  setWarrantyTabMode('creator');
  
  alert(`📂 Loaded Agreement ${agr.id} back into workspace draft!`);
}

function printWarrantyAgreement(id) {
  const agr = state.warrantyAgreements.find(a => String(a.id) === String(id));
  if (!agr) return;

  loadWarrantyAgreement(id);
  setTimeout(() => {
    window.print();
  }, 300);
}

function pdfWarrantyAgreement(id) {
  const agr = state.warrantyAgreements.find(a => String(a.id) === String(id));
  if (!agr) return;

  loadWarrantyAgreement(id);
  setTimeout(() => {
    downloadAgreementPDF();
  }, 350);
}

function deleteWarrantyAgreement(id) {
  if (!confirm(`🗑️ Are you sure you want to permanently delete Agreement: ${id} from your records?`)) {
    return;
  }

  state.warrantyAgreements = state.warrantyAgreements.filter(a => String(a.id) !== String(id));
  localStorage.setItem('sleb_warranty_agreements', JSON.stringify(state.warrantyAgreements));
  try { triggerBackgroundBackup(); } catch (e) {}
  renderWarrantyHistoryTable();
  updateAgreementDropdown();
}

function downloadAgreementPDF() {
  const chassis = document.getElementById('rep-agr-serial-no').textContent.trim();
  const custName = document.getElementById('rep-agr-cust-name').textContent.trim();
  const fileChassis = chassis && chassis !== '___________________________' ? `_${chassis.toUpperCase()}` : '';
  const fileCust = custName && custName !== '___________________________' ? `_${custName.replace(/\s+/g, '_')}` : '';

  const element = document.getElementById('agreement-paper-element');
  const opt = {
    margin: [0.25, 0.25, 0.25, 0.25],
    filename: `VEHICLE_WARRANTY_AGREEMENT${fileChassis}${fileCust}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

// Bind live changes for real-time preview sync inside initERPApp (hook listeners)
const dynamicAgrInputs = [
  'agr-model-name', 'agr-serial-no', 'agr-date', 'agr-odometer', 'agr-color',
  'agr-warranty-dur', 'agr-guarantee-dur', 'agr-showroom-name', 'agr-showroom-manager',
  'agr-showroom-phone', 'agr-showroom-email', 'agr-showroom-address',
  'agr-cust-name', 'agr-cust-phone', 'agr-cust-address',
  'agr-cust-email', 'agr-cust-id-type', 'agr-cust-id-val'
];

dynamicAgrInputs.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    ['keyup', 'change', 'input'].forEach(evt => {
      el.addEventListener(evt, syncAgreementFormToReplica);
    });
  }
});

// =========================================================================
// PREMIUM CUSTOM CONFIRM DIALOG SYSTEM
// =========================================================================
function showCustomConfirm(title, message, onApprove) {
  const modal = document.getElementById('custom-confirm-modal');
  const titleEl = document.getElementById('custom-confirm-title');
  const msgEl = document.getElementById('custom-confirm-message');
  const cancelBtn = document.getElementById('custom-confirm-cancel-btn');
  const approveBtn = document.getElementById('custom-confirm-approve-btn');

  if (!modal || !titleEl || !msgEl || !cancelBtn || !approveBtn) {
    // Fallback in case of missing DOM nodes
    if (confirm(message)) {
      onApprove();
    }
    return;
  }

  titleEl.textContent = title;
  msgEl.innerHTML = message.replace(/\n/g, '<br>');

  modal.style.display = 'flex';

  const cleanup = () => {
    modal.style.display = 'none';
    cancelBtn.removeEventListener('click', handleCancel);
    approveBtn.removeEventListener('click', handleApprove);
  };

  const handleCancel = () => {
    cleanup();
  };

  const handleApprove = () => {
    cleanup();
    onApprove();
  };

  cancelBtn.addEventListener('click', handleCancel);
  approveBtn.addEventListener('click', handleApprove);
}

// =========================================================================
// SUPPLIER PROFILE DETAILS VIEWER MODAL
// =========================================================================
function openSupplierDetailsModal(supplierName) {
  if (!supplierName) return;
  const p = (state.purchases || []).find(pur => pur.supplier && pur.supplier.trim().toLowerCase() === supplierName.trim().toLowerCase());
  
  document.getElementById('sup-modal-name').textContent = supplierName;
  document.getElementById('sup-modal-address').textContent = p ? (p.supplierAddress || 'N/A') : 'N/A';
  document.getElementById('sup-modal-gstin').textContent = p ? (p.supplierGstin || 'N/A') : 'N/A';
  document.getElementById('sup-modal-phone').textContent = p ? (p.supplierPhone || 'N/A') : 'N/A';
  document.getElementById('sup-modal-email').textContent = p ? (p.supplierEmail || 'N/A') : 'N/A';
  
  document.getElementById('supplier-details-modal').style.display = 'flex';
}

function closeSupplierDetailsModal() {
  document.getElementById('supplier-details-modal').style.display = 'none';
}

// =========================================================================
// LIGHT/DARK/SYSTEM DYNAMIC THEME MANAGER
// =========================================================================
function applyUITheme(themeMode) {
  state.themeMode = themeMode;
  localStorage.setItem('sleb_theme_mode', themeMode);

  const body = document.body;
  const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (themeMode === 'light') {
    body.classList.add('light-theme');
  } else if (themeMode === 'dark') {
    body.classList.remove('light-theme');
  } else {
    // system preference
    if (isDarkSystem) {
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
    }
  }
}

// Watch system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.themeMode === 'system') {
    applyUITheme('system');
  }
});

// =========================================================================
// SPARES LEDGER HISTORY LOGIC
// =========================================================================
function renderSparesHistoryTable() {
  const tbody = document.getElementById('spares-history-ledger-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const sparesTx = state.transactions.filter(t => t.billCategory === 'spares');
  if (sparesTx.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:var(--text-muted); padding:1rem;">No spares sales logged in ledger.</td></tr>`;
    return;
  }

  sparesTx.forEach(t => {
    const row = document.createElement('tr');
    const sparesDetails = (t.spares || []).map(s => `${s.name} x${s.qty}`).join(', ') || '-';
    
    // Find index in global transactions array
    const globalIdx = state.transactions.findIndex(item => item.id === t.id);

    row.innerHTML = `
      <td style="font-family:monospace; font-weight:700;">${escapeHtml(String(t.id))}</td>
      <td>${escapeHtml(t.date || '-')}</td>
      <td style="font-weight:600;">${escapeHtml(t.customer.name || '-')}</td>
      <td>${escapeHtml(t.customer.phone || '-')}</td>
      <td style="max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(sparesDetails)}">${escapeHtml(sparesDetails)}</td>
      <td style="text-align:right;">₹ ${(t.labor || 0).toFixed(2)}</td>
      <td style="text-align:right;">₹ ${(t.financials.cgst || 0).toFixed(2)}</td>
      <td style="text-align:right;">₹ ${(t.financials.sgst || 0).toFixed(2)}</td>
      <td style="font-weight:700; text-align:right; color:var(--color-primary);">₹ ${(t.financials.total || 0).toFixed(2)}</td>
      <td>
        <div style="display:flex; gap:0.35rem; justify-content:center;">
          <button class="btn btn-secondary" style="padding:0.4rem 0.65rem; font-size:0.75rem; width:auto; border-color:var(--color-primary);" onclick="loadAndPrintInvoice('${escapeHtml(String(t.id))}')">
            Print
          </button>
          <button class="btn btn-secondary" style="padding:0.4rem 0.65rem; font-size:0.75rem; width:auto; border-color:var(--color-secondary);" onclick="editTransactionDetails(${globalIdx})">
            Edit
          </button>
          <button class="btn btn-danger" style="padding:0.4rem 0.65rem; font-size:0.75rem; width:auto;" onclick="deleteTransactionRecord(${globalIdx})">
            Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// =========================================================================
// SERVICES BILL ROUTING TO INVOICE PRINTER VIEW
// =========================================================================
function printServiceBill(jobId) {
  printServiceJobCard(jobId);
}

// =========================================================================
// PREMIUM SHEETJS EXCEL & DYNAMIC LANDSCAPE PDF EXPORTERS
// =========================================================================
function downloadExcelFile(headers, dataRows, filename) {
  const workbookData = [headers, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(workbookData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
  // Set automatic column widths
  const wscols = headers.map((h, i) => {
    let maxLen = h.length;
    dataRows.forEach(row => {
      const cellVal = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
      if (cellVal.length > maxLen) maxLen = cellVal.length;
    });
    return { wch: Math.min(45, maxLen + 3) };
  });
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, filename);
}

function exportElementToPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // High-fidelity print-cloning defensive copy
  const cloned = element.cloneNode(true);
  cloned.style.background = 'white';
  cloned.style.color = 'black';
  cloned.style.padding = '20px';
  cloned.style.fontFamily = 'Inter, sans-serif';
  cloned.style.width = '100%';
  
  // Strip actions column and pagination items from report
  const actionTh = cloned.querySelector('thead th:last-child');
  if (actionTh && (actionTh.textContent.trim().toLowerCase() === 'action' || actionTh.textContent.trim().toLowerCase() === 'actions')) {
    actionTh.remove();
    cloned.querySelectorAll('tbody tr').forEach(tr => {
      const lastTd = tr.querySelector('td:last-child');
      if (lastTd) lastTd.remove();
    });
  }

  cloned.querySelectorAll('select, input, button').forEach(el => el.remove());

  const opt = {
    margin: [0.4, 0.4, 0.4, 0.4],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(cloned).save();
}

// Sales details history
function exportSalesToExcel() {
  const headers = ['Invoice No', 'Date', 'Type', 'Buyer Name', 'Phone', 'GSTIN', 'Billed Particulars', 'Grand Total', 'Amount Paid', 'Balance Due'];
  const rows = state.transactions
    .filter(t => t && t.docType === 'invoice')
    .map(t => {
      let itemDesc = '';
      if (t.billCategory === 'bike') itemDesc = t.vehicle.model;
      else itemDesc = (t.spares || []).map(s => s.name).join('; ');
      
      return [
        t.id, t.date, t.docType.toUpperCase(), t.customer.name, t.customer.phone, t.customer.gstin || '',
        itemDesc, t.financials.total, t.financials.paid, t.financials.balance
      ];
    });
  downloadExcelFile(headers, rows, 'Sri_Lakshmi_eBikes_SalesHistory.xlsx');
}

function exportSalesToPDF() {
  exportElementToPDF('sales-history-table', 'Sri_Lakshmi_eBikes_SalesHistory.pdf');
}

// Purchases history
function exportPurchasesToExcel() {
  const headers = ['Purchase Bill No', 'Date', 'Supplier Name', 'Model Name', 'Chassis No', 'Motor No', 'Battery No', 'Charger No', 'HSN Code', 'Cost Price', 'Discount %', 'Discount Amount (₹)', 'Vehicle GST %', 'Base Retail Rate'];
  const rows = state.purchases.map(p => [
    p.billNo, p.date, p.supplier, p.model, p.chassis, p.motor, p.battery, p.charger || '', p.hsn, p.costPrice, p.discountPct || 0, p.discountAmt || 0, p.vehicleGst || 0, p.sellingPrice
  ]);
  downloadExcelFile(headers, rows, 'Sri_Lakshmi_eBikes_PurchasesLedger.xlsx');
}

function exportPurchasesToPDF() {
  exportElementToPDF('purchases-history-table', 'Sri_Lakshmi_eBikes_PurchasesLedger.pdf');
}

// E-Bike stock valuation
function exportStockToExcel() {
  const headers = ['Model Description', 'Chassis No', 'Motor No', 'Battery No', 'Charger No', 'HSN Code', 'Purchase Cost', 'Retail Base Price', 'Status'];
  const rows = state.inventory.map(b => [
    b.model, b.chassis, b.motor, b.battery, b.charger || '', b.hsn, b.costPrice || 0, b.basePrice, b.status
  ]);
  downloadExcelFile(headers, rows, 'Sri_Lakshmi_eBikes_ActiveInventory.xlsx');
}

function exportStockToPDF() {
  exportElementToPDF('stock-valuation-table', 'Sri_Lakshmi_eBikes_ActiveInventory.pdf');
}

// Spares inventory catalog
function exportSparesToExcel() {
  const headers = ['Spare Part Name', 'SKU Part No', 'HSN Code', 'Purchase Cost', 'Retail Selling Price', 'Quantity in Stock', 'Reorder Level'];
  const rows = state.spares.map(s => [
    s.name, s.sku, s.hsn, s.costPrice, s.sellingPrice, s.qty, s.minLevel
  ]);
  downloadExcelFile(headers, rows, 'Sri_Lakshmi_eBikes_SparesCatalog.xlsx');
}

function exportSparesToPDF() {
  exportElementToPDF('spares-ledger-table', 'Sri_Lakshmi_eBikes_SparesCatalog.pdf');
}

// Spares sales ledger
function exportSparesHistoryToExcel() {
  const headers = ['Invoice No', 'Date', 'Customer Name', 'Phone', 'Sold Particulars', 'Labor Cost', 'CGST', 'SGST', 'Grand Total'];
  const sparesTx = state.transactions.filter(t => t.billCategory === 'spares');
  const rows = sparesTx.map(t => [
    t.id, t.date, t.customer.name, t.customer.phone, (t.spares || []).map(s => `${s.name} x${s.qty}`).join('; '), t.labor || 0, t.financials.cgst || 0, t.financials.sgst || 0, t.financials.total || 0
  ]);
  downloadExcelFile(headers, rows, 'Sri_Lakshmi_eBikes_SparesSalesHistory.xlsx');
}

function exportSparesHistoryToPDF() {
  exportElementToPDF('spares-history-ledger-table', 'Sri_Lakshmi_eBikes_SparesSalesHistory.pdf');
}

// Vehicle services logs
function exportServicesToExcel() {
  const headers = ['Job ID', 'Linked Invoice', 'Chassis No', 'Customer Name', 'Date', 'Service No', 'Odometer Reading (KMs)', 'Spares Cost', 'Labor Cost', 'Total Bill'];
  const rows = state.services.map(s => [
    s.id, s.invoiceNo || '', s.chassis, s.custName, s.date, s.serviceCount, s.odometer, s.sparesCost, s.laborCharges, s.totalBill
  ]);
  downloadExcelFile(headers, rows, 'Sri_Lakshmi_eBikes_ServicesLedger.xlsx');
}

function exportServicesToPDF() {
  exportElementToPDF('services-ledger-table', 'Sri_Lakshmi_eBikes_ServicesLedger.pdf');
}

// Dashboard reports
function exportDashboardToExcel() {
  const headers = ['Supplier Name', 'Invoice / Bill No', 'Vehicles Logged', 'Total Purchases Paid (₹)', 'GST Taxes Paid (₹)'];
  const supplierSummary = {};
  state.purchases.forEach(p => {
    const key = `${p.supplier || 'ADMS'}||${p.billNo || 'N/A'}`;
    if (!supplierSummary[key]) {
      supplierSummary[key] = { supplier: p.supplier || 'ADMS Motors', billNo: p.billNo || 'N/A', count: 0, totalCost: 0, totalGst: 0 };
    }
    supplierSummary[key].count++;
    supplierSummary[key].totalCost += parseFloat(p.costPrice) || 0;
    const gstPct = parseFloat(p.vehicleGst) || 0;
    supplierSummary[key].totalGst += gstPct > 0 ? (parseFloat(p.costPrice) || 0) * (gstPct / 100) : 0;
  });
  const rows = Object.values(supplierSummary).map(e => [
    e.supplier, e.billNo, e.count, e.totalCost, e.totalGst
  ]);
  downloadExcelFile(headers, rows, 'Sri_Lakshmi_eBikes_SupplierExpenditures.xlsx');
}

function exportDashboardToPDF() {
  exportElementToPDF('dashboard-supplier-expenses-table', 'Sri_Lakshmi_eBikes_SupplierExpenditures.pdf');
}

// =========================================================================
// TAX INVOICE PRINTER SHARING DIALOG CONTROLLER
// =========================================================================
function openShareModal(context) {
  state.shareContext = context || 'invoice';
  const modal = document.getElementById('share-modal');
  if (modal) modal.style.display = 'flex';
  
  // Dynamically change the share modal title and button styles
  const shareBtnCopy = document.querySelector('#share-modal button.btn-secondary');
  const shareSub = document.querySelector('#share-modal p');
  const sharePdfBtn = document.getElementById('share-pdf-btn');
  
  if (state.shareContext === 'agreement') {
    if (shareBtnCopy) {
      shareBtnCopy.innerHTML = `<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 4h10m-3-3l3 3-3 3"/></svg> Copy Agreement Details`;
    }
    if (shareSub) {
      shareSub.textContent = 'Select your preferred sharing channel below. This will pre-fill warranty agreement details dynamically.';
    }
    if (sharePdfBtn) {
      sharePdfBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Share Agreement PDF`;
    }
  } else {
    if (shareBtnCopy) {
      shareBtnCopy.innerHTML = `<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 4h10m-3-3l3 3-3 3"/></svg> Copy Invoice Summary`;
    }
    if (shareSub) {
      shareSub.textContent = 'Select your preferred sharing channel below. This will pre-fill invoice particulars dynamically.';
    }
    if (sharePdfBtn) {
      sharePdfBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> Share Invoice PDF`;
    }
  }
}

function closeShareModal() {
  const modal = document.getElementById('share-modal');
  if (modal) modal.style.display = 'none';
}

function getShareText() {
  if (state.shareContext === 'agreement') {
    // Collect manual agreement form values
    const model = document.getElementById('agr-model-name')?.value.trim() || '___________________________';
    const chassis = document.getElementById('agr-serial-no')?.value.trim() || '___________________________';
    const color = document.getElementById('agr-color')?.value.trim() || '___________________________';
    const delDate = document.getElementById('agr-date')?.value.trim() || '___________________________';
    const odometer = document.getElementById('agr-odometer')?.value.trim() || '0';
    
    const covType = document.getElementById('agr-coverage-type')?.value || 'both';
    const warDur = document.getElementById('agr-warranty-dur')?.value || '12';
    const guaDur = document.getElementById('agr-guarantee-dur')?.value || '12';
    
    const custName = document.getElementById('agr-cust-name')?.value.trim() || 'Customer';

    let coverageDetails = '';
    if (covType === 'both') {
      coverageDetails = `• Warranty Period: ${warDur} Months\n• Guarantee Period: ${guaDur} Months`;
    } else if (covType === 'warranty') {
      coverageDetails = `• Warranty Period: ${warDur} Months (Warranty Only)`;
    } else if (covType === 'guarantee') {
      coverageDetails = `• Guarantee Period: ${guaDur} Months (Guarantee Only)`;
    }

    const text = `*Sri Lakshmi e Bikes - Vehicle Delivery & Warranty Agreement Summary*\n\n` +
                 `Dear *${custName}*,\n` +
                 `Thank you for riding with us! Here are your delivery and warranty contract details:\n\n` +
                 `*Vehicle Parameters:*\n` +
                 `• Model Name: ${model}\n` +
                 `• Chassis / Serial No: ${chassis}\n` +
                 `• Color: ${color}\n` +
                 `• Odometer Reading: ${odometer} KM\n` +
                 `• Delivery Date: ${delDate}\n\n` +
                 `*Coverage Details:*\n` +
                 `${coverageDetails}\n\n` +
                 `We wish you safe rides and excellent experience! Please keep this copy safe for reference.`;
    return text;
  } else {
    const tx = state.loadedTransaction;
    if (!tx) return '';
    
    const isBike = tx.billCategory === 'bike';
    let details = '';
    if (isBike) {
      details = `Vehicle: ${tx.vehicle.model}\nChassis: ${tx.vehicle.chassis}\nMotor: ${tx.vehicle.motor}`;
    } else {
      details = `Spares Details: ` + (tx.spares || []).map(s => `${s.name} x${s.qty}`).join(', ');
    }
    
    const text = `*Sri Lakshmi e Bikes*\n` +
                 `Invoice No: ${tx.id}\n` +
                 `Date: ${tx.date}\n` +
                 `Customer: ${tx.customer.name}\n` +
                 `${details}\n` +
                 `*Grand Total: ₹ ${tx.financials.total.toFixed(2)}*\n` +
                 `Thank you for your business!`;
    return text;
  }
}

function shareOnWhatsApp() {
  const text = encodeURIComponent(getShareText());
  let phone = '';
  if (state.shareContext === 'agreement') {
    phone = (document.getElementById('agr-cust-phone')?.value || '').replace(/[^0-9]/g, '');
  } else {
    const tx = state.loadedTransaction;
    phone = tx && tx.customer && tx.customer.phone ? tx.customer.phone.replace(/[^0-9]/g, '') : '';
  }
  const url = phone ? `https://api.whatsapp.com/send?phone=91${phone}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
  window.open(url, '_blank');
  closeShareModal();
}

function shareViaEmail() {
  let email = '';
  let subject = '';
  if (state.shareContext === 'agreement') {
    email = document.getElementById('agr-cust-email')?.value || '';
    const model = document.getElementById('agr-model-name')?.value || '';
    subject = encodeURIComponent(`Warranty & Guarantee Agreement - ${model} - Sri Lakshmi e Bikes`);
  } else {
    const tx = state.loadedTransaction;
    email = tx && tx.customer && tx.customer.email ? tx.customer.email : '';
    subject = encodeURIComponent(`Invoice #${tx ? tx.id : ''} from Sri Lakshmi e Bikes`);
  }
  const body = encodeURIComponent(getShareText());
  const url = `mailto:${email}?subject=${subject}&body=${body}`;
  window.open(url, '_blank');
  closeShareModal();
}

function shareCopyLink() {
  const text = getShareText();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const label = state.shareContext === 'agreement' ? 'Agreement details' : 'Invoice summary';
    alert(`✅ ${label} copied to clipboard successfully!`);
  }).catch(err => {
    console.error('Clipboard copy failed', err);
    alert('Failed to copy to clipboard.');
  });
  closeShareModal();
}

function shareInvoicePDF() {
  const tx = state.loadedTransaction;
  const isAgreement = state.shareContext === 'agreement';
  const element = isAgreement ? document.getElementById('agreement-paper-element') : document.getElementById('invoice-paper-element');
  if (!element) return;
  
  const filename = isAgreement ? `AGREEMENT_${(document.getElementById('agr-serial-no')?.value.trim() || 'VEHICLE').toUpperCase()}.pdf` : `${tx ? tx.docType.toUpperCase() : 'INVOICE'}_#${tx ? tx.id : 'DOC'}.pdf`;
  
  const opt = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  const shareBtn = document.getElementById('share-pdf-btn');
  const originalHtml = shareBtn ? shareBtn.innerHTML : 'Share PDF Copy';
  if (shareBtn) {
    shareBtn.disabled = true;
    shareBtn.innerHTML = `<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spinRing 1s linear infinite; margin-right:4px; vertical-align:middle;"></span> Generating PDF...`;
  }

  html2pdf().set(opt).from(element).outputPdf('blob').then(function(pdfBlob) {
    if (shareBtn) {
      shareBtn.disabled = false;
      shareBtn.innerHTML = originalHtml;
    }
    
    const file = new File([pdfBlob], filename, { type: 'application/pdf' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: isAgreement ? 'Warranty Agreement' : 'Invoice Copy',
        text: getShareText()
      })
      .then(() => {
        closeShareModal();
      })
      .catch((error) => {
        console.error('Sharing PDF failed:', error);
        if (error.name !== 'AbortError') {
          alert('Could not share PDF: ' + error.message);
        }
      });
    } else {
      alert('Sharing files is not supported on this browser. The PDF will be downloaded to your device instead.');
      html2pdf().set(opt).from(element).save();
      closeShareModal();
    }
  }).catch(function(err) {
    if (shareBtn) {
      shareBtn.disabled = false;
      shareBtn.innerHTML = originalHtml;
    }
    console.error('PDF Generation failed:', err);
    alert('Error generating PDF: ' + err.message);
  });
}

// =========================================================================
// HIGH-FIDELITY BUSINESS DASHBOARD METRICS SYSTEM
// =========================================================================
function setDashboardFilter(filter) {
  state.dashboardFilter = filter || 'all';
  
  const options = ['all', 'bike', 'spares'];
  options.forEach(opt => {
    const el = document.getElementById(`dash-filt-${opt}`);
    if (el) {
      if (opt === filter) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });
  
  renderDashboard();
}

function renderDashboard() {
  const filter = state.dashboardFilter || 'all';

  // Conditional filters to datasets (Sales KPI includes invoices only)
  let filteredTx = (state.transactions || []).filter(t => t && t.docType === 'invoice');
  let filteredPur = state.purchases || [];
  let filteredInv = state.inventory || [];
  let filteredSvc = state.services || [];

  if (filter === 'bike') {
    filteredTx = filteredTx.filter(t => t.billCategory === 'bike');
    filteredSvc = []; // clear spares-specific labor services
  } else if (filter === 'spares') {
    filteredTx = filteredTx.filter(t => t.billCategory === 'spares');
    filteredPur = []; // no vehicle purchases in spares ledger
    filteredInv = []; // no bike stock in spares ledger
    filteredSvc = state.services || [];
  }

  // Sales KPI
  const salesTotal = filteredTx.reduce((acc, t) => acc + (t.financials?.total || 0), 0);
  const salesCount = filteredTx.length;
  const salesValEl = document.getElementById('dash-sales-total');
  if (salesValEl) salesValEl.textContent = `₹ ${salesTotal.toLocaleString('en-IN', {minimumFractionDigits:2})}`;
  const salesCountEl = document.getElementById('dash-sales-count');
  if (salesCountEl) salesCountEl.textContent = `${salesCount} Invoices Processed`;

  // Purchases KPI
  const purchasesTotal = filteredPur.reduce((acc, p) => acc + (parseFloat(p.costPrice) || 0), 0);
  const purchasesCount = filteredPur.length;
  const purValEl = document.getElementById('dash-purchases-total');
  if (purValEl) purValEl.textContent = `₹ ${purchasesTotal.toLocaleString('en-IN', {minimumFractionDigits:2})}`;
  const purCountEl = document.getElementById('dash-purchases-count');
  if (purCountEl) purCountEl.textContent = `${purchasesCount} Vehicles Logged`;

  // Inventory KPI
  const stockCount = filteredInv.filter(b => b.status === 'STOCK').length;
  const soldCount = filteredInv.filter(b => b.status === 'SOLD').length;
  const stockValEl = document.getElementById('dash-stock-total');
  if (stockValEl) stockValEl.textContent = `${stockCount} Units`;
  const stockStatusEl = document.getElementById('dash-stock-status');
  if (stockStatusEl) stockStatusEl.textContent = `${stockCount} STOCK | ${soldCount} SOLD`;

  // Spares & Services KPI
  let sparesRevenue = 0;
  let servicesRevenue = 0;
  let sparesOnly = 0;
  let laborOnly = 0;

  if (filter !== 'bike') {
    sparesRevenue = filteredTx.filter(t => t.billCategory === 'spares').reduce((acc, t) => acc + (t.financials?.total || 0), 0);
    servicesRevenue = filteredSvc.reduce((acc, s) => acc + (s.totalBill || 0), 0);
    
    sparesOnly = filteredTx.filter(t => t.billCategory === 'spares').reduce((acc, t) => acc + (t.financials?.total || 0) - (t.labor || 0), 0) + filteredSvc.reduce((acc, s) => acc + (s.sparesCost || 0), 0);
    laborOnly = filteredTx.filter(t => t.billCategory === 'spares').reduce((acc, t) => acc + (t.labor || 0), 0) + filteredSvc.reduce((acc, s) => acc + (s.laborCharges || 0), 0);
  }

  const sparesAndServicesTotal = sparesRevenue + servicesRevenue;

  const servicesValEl = document.getElementById('dash-services-total');
  if (servicesValEl) servicesValEl.textContent = `₹ ${sparesAndServicesTotal.toLocaleString('en-IN', {minimumFractionDigits:2})}`;
  const servicesBreakdownEl = document.getElementById('dash-services-breakdown');
  if (servicesBreakdownEl) {
    servicesBreakdownEl.textContent = `Spares: ₹${sparesOnly.toLocaleString('en-IN')} | Labor: ₹${laborOnly.toLocaleString('en-IN')}`;
  }

  // Cash Flow Ratio SVG Chart with Neon Cyan/Pink styling
  const maxVal = Math.max(salesTotal, purchasesTotal, 1);
  const salesPct = (salesTotal / maxVal) * 100;
  const purPct = (purchasesTotal / maxVal) * 100;
  const ratioContainer = document.getElementById('dash-ratio-container');
  if (ratioContainer) {
    ratioContainer.innerHTML = `
      <svg width="100%" height="160" viewBox="0 0 300 160" style="font-family:var(--font-heading), sans-serif;">
        <!-- Grid Lines -->
        <line x1="40" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
        <line x1="40" y1="70" x2="280" y2="70" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
        <line x1="40" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
        
        <!-- Bars -->
        <!-- Sales -->
        <rect class="chart-bar-rect" x="75" y="${120 - salesPct * 0.9}" width="40" height="${salesPct * 0.9}" rx="5" fill="var(--neon-cyan)" 
              style="filter: drop-shadow(0 0 5px var(--neon-cyan-glow));"
              title="Sales Revenue: ₹${salesTotal.toLocaleString('en-IN')}"/>
        <text x="95" y="${110 - salesPct * 0.9}" fill="var(--neon-cyan)" font-size="10" font-weight="bold" text-anchor="middle">₹${Math.round(salesTotal/1000)}k</text>
        <text x="95" y="140" fill="var(--text-main)" font-size="10.5" font-weight="700" text-anchor="middle">Sales In</text>

        <!-- Purchases -->
        <rect class="chart-bar-rect" x="185" y="${120 - purPct * 0.9}" width="40" height="${purPct * 0.9}" rx="5" fill="var(--neon-pink)" 
              style="filter: drop-shadow(0 0 5px var(--neon-pink-glow));"
              title="Purchases Outflow: ₹${purchasesTotal.toLocaleString('en-IN')}"/>
        <text x="205" y="${110 - purPct * 0.9}" fill="var(--neon-pink)" font-size="10" font-weight="bold" text-anchor="middle">₹${Math.round(purchasesTotal/1000)}k</text>
        <text x="205" y="140" fill="var(--text-main)" font-size="10.5" font-weight="700" text-anchor="middle">Purchases Out</text>
        
        <line x1="40" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
      </svg>
    `;
  }

  // Top E-Bike Models Distribution Horizontal List
  const stockMap = {};
  filteredInv.forEach(item => {
    const model = item.model || 'Other';
    if (!stockMap[model]) stockMap[model] = { stock: 0, sold: 0 };
    if (item.status === 'STOCK') stockMap[model].stock++;
    else stockMap[model].sold++;
  });

  const stockEntries = Object.entries(stockMap).slice(0, 4); // top 4 models
  const stockContainer = document.getElementById('dash-stock-container');
  if (stockContainer) {
    let modelDistHtml = '<div style="width:100%; display:flex; flex-direction:column; gap:0.75rem; justify-content:center; height:180px; padding:0.5rem 0.25rem;">';
    if (stockEntries.length === 0) {
      modelDistHtml += '<div style="text-align:center; color:var(--text-muted); font-size:0.85rem;">No inventory stock data logged.</div>';
    } else {
      stockEntries.forEach(([modelName, counts]) => {
        const totalCount = counts.stock + counts.sold;
        const stockPercent = totalCount > 0 ? (counts.stock / totalCount) * 100 : 0;
        const soldPercent = totalCount > 0 ? (counts.sold / totalCount) * 100 : 0;
        
        modelDistHtml += `
          <div style="font-size: 0.78rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem; font-weight:600;">
              <span style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-main);" title="${modelName}">${modelName}</span>
              <span style="color:var(--text-muted);">${counts.stock} Stock / ${counts.sold} Sold</span>
            </div>
            <div style="display:flex; height:8px; border-radius:4px; overflow:hidden; background:var(--border-glass);">
              <div style="width:${stockPercent}%; background:var(--color-stock);" title="Stock"></div>
              <div style="width:${soldPercent}%; background:var(--color-reorder);" title="Sold"></div>
            </div>
          </div>
        `;
      });
    }
    modelDistHtml += '</div>';
    stockContainer.innerHTML = modelDistHtml;
  }

  // Business Revenue Growth Trend (Dynamic SVG Area Chart)
  const trendContainer = document.getElementById('dash-trend-container');
  if (trendContainer) {
    const monthKeys = [];
    const monthLabels = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Last 6 months timeline generator
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      monthKeys.push(`${y}-${m}`);
      monthLabels.push(`${monthNames[d.getMonth()]} ${String(y).slice(-2)}`);
    }

    const salesTrendData = new Array(6).fill(0);
    const purchaseTrendData = new Array(6).fill(0);

    const getMonthKey = (dateStr) => {
      if (!dateStr) return null;
      // standard YYYY-MM-DD
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
        return dateStr.slice(0, 7);
      }
      // DD-MM-YYYY or DD-MM-YY
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        let year = parts[2].trim();
        if (year.length === 2) year = '20' + year;
        let month = parts[1].trim().padStart(2, '0');
        return `${year}-${month}`;
      }
      return null;
    };

    filteredTx.forEach(t => {
      const key = getMonthKey(t.date);
      const idx = monthKeys.indexOf(key);
      if (idx !== -1) {
        salesTrendData[idx] += (t.financials?.total || 0);
      }
    });

    filteredPur.forEach(p => {
      const key = getMonthKey(p.date);
      const idx = monthKeys.indexOf(key);
      if (idx !== -1) {
        purchaseTrendData[idx] += (parseFloat(p.costPrice) || 0);
      }
    });

    const maxTrendVal = Math.max(...salesTrendData, ...purchaseTrendData, 10000);

    // Build SVG points
    let salesPoints = '';
    let purchasePoints = '';
    let salesAreaPoints = '50,190 ';
    let purchaseAreaPoints = '50,190 ';
    let chartNodesHtml = '';

    for (let i = 0; i < 6; i++) {
      const x = 50 + (i / 5) * 380;
      const sy = 190 - (salesTrendData[i] / maxTrendVal) * 150;
      const py = 190 - (purchaseTrendData[i] / maxTrendVal) * 150;

      salesPoints += `${x},${sy} `;
      purchasePoints += `${x},${py} `;
      salesAreaPoints += `${x},${sy} `;
      purchaseAreaPoints += `${x},${py} `;

      if (i === 5) {
        salesAreaPoints += `${x},190`;
        purchaseAreaPoints += `${x},190`;
      }

      // X Axis labels
      chartNodesHtml += `
        <text x="${x}" y="212" fill="var(--text-muted)" font-size="9" font-weight="600" text-anchor="middle">${monthLabels[i]}</text>
      `;

      // Sales Node Circle
      chartNodesHtml += `
        <circle class="chart-bar-rect" cx="${x}" cy="${sy}" r="4.5" fill="#fff" stroke="var(--neon-cyan)" stroke-width="2.5"
                style="filter: drop-shadow(0 0 4px var(--neon-cyan-glow)); cursor:pointer;"
                title="Sales: ₹${salesTrendData[i].toLocaleString('en-IN')}"/>
        <text x="${x}" y="${sy - 8}" fill="var(--color-primary)" font-size="8.5" font-weight="bold" text-anchor="middle">₹${Math.round(salesTrendData[i]/1000)}k</text>
      `;

      // Purchase Node Circle
      chartNodesHtml += `
        <circle class="chart-bar-rect" cx="${x}" cy="${py}" r="4.5" fill="#fff" stroke="var(--neon-pink)" stroke-width="2.5"
                style="filter: drop-shadow(0 0 4px var(--neon-pink-glow)); cursor:pointer;"
                title="Purchases: ₹${purchaseTrendData[i].toLocaleString('en-IN')}"/>
        <text x="${x}" y="${py + 12}" fill="var(--color-accent)" font-size="8.5" font-weight="bold" text-anchor="middle">₹${Math.round(purchaseTrendData[i]/1000)}k</text>
      `;
    }

    trendContainer.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 450 230" style="overflow:visible;">
        <defs>
          <linearGradient id="salesTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--neon-cyan)" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="var(--neon-cyan)" stop-opacity="0.0"/>
          </linearGradient>
          <linearGradient id="purTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--neon-pink)" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="var(--neon-pink)" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="50" y1="40" x2="430" y2="40" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
        <text x="42" y="43" fill="var(--text-muted)" font-size="8.5" text-anchor="end">₹${Math.round(maxTrendVal/1000)}k</text>

        <line x1="50" y1="115" x2="430" y2="115" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
        <text x="42" y="118" fill="var(--text-muted)" font-size="8.5" text-anchor="end">₹${Math.round((maxTrendVal/2)/1000)}k</text>

        <line x1="50" y1="190" x2="430" y2="190" stroke="rgba(255,255,255,0.15)"/>
        <text x="42" y="193" fill="var(--text-muted)" font-size="8.5" text-anchor="end">₹0</text>

        <!-- Areas -->
        <polygon points="${salesAreaPoints}" fill="url(#salesTrendGrad)"/>
        <polygon points="${purchaseAreaPoints}" fill="url(#purTrendGrad)"/>

        <!-- Lines -->
        <polyline points="${salesPoints.trim()}" fill="none" stroke="var(--neon-cyan)" stroke-width="2.5" style="filter: drop-shadow(0 0 5px var(--neon-cyan-glow));"/>
        <polyline points="${purchasePoints.trim()}" fill="none" stroke="var(--neon-pink)" stroke-width="2.5" style="filter: drop-shadow(0 0 5px var(--neon-pink-glow));"/>

        <!-- Nodes and X Axis -->
        ${chartNodesHtml}
      </svg>
    `;
  }

  // Supplier Expenditures Report
  const supplierSummary = {};
  filteredPur.forEach(p => {
    const key = `${p.supplier || 'ADMS'}||${p.billNo || 'N/A'}`;
    if (!supplierSummary[key]) {
      supplierSummary[key] = { supplier: p.supplier || 'ADMS Motors', billNo: p.billNo || 'N/A', count: 0, totalCost: 0, totalGst: 0 };
    }
    supplierSummary[key].count++;
    supplierSummary[key].totalCost += parseFloat(p.costPrice) || 0;
    const gstPct = parseFloat(p.vehicleGst) || 0;
    supplierSummary[key].totalGst += gstPct > 0 ? (parseFloat(p.costPrice) || 0) * (gstPct / 100) : 0;
  });

  const supplierTbody = document.getElementById('dashboard-supplier-expenses-tbody');
  if (supplierTbody) {
    supplierTbody.innerHTML = '';
    const entries = Object.values(supplierSummary);
    if (entries.length === 0) {
      supplierTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1rem;">No supplier purchase bills registered.</td></tr>`;
    } else {
      entries.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight:600;">${escapeHtml(e.supplier)}</td>
          <td style="font-family:monospace; font-weight:700;">${escapeHtml(e.billNo)}</td>
          <td style="text-align:center; font-weight:700;">${e.count} Units</td>
          <td style="text-align:right; font-weight:700; color:var(--neon-pink);">₹ ${e.totalCost.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          <td style="text-align:right; font-weight:700; color:var(--neon-cyan);">₹ ${e.totalGst.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
        `;
        supplierTbody.appendChild(row);
      });
    }
  }
}

function openDashboardDetail(kpiType) {
  const modal = document.getElementById('dashboard-detail-modal');
  if (!modal) return;
  
  const titleEl = document.getElementById('dash-detail-title');
  const subEl = document.getElementById('dash-detail-subtitle');
  const iconEl = document.getElementById('dash-detail-icon');
  const tableCont = document.getElementById('dash-detail-table-container');
  
  if (!titleEl || !subEl || !iconEl || !tableCont) return;

  const filter = state.dashboardFilter || 'all';
  let filteredTx = state.transactions || [];
  let filteredPur = state.purchases || [];
  let filteredInv = state.inventory || [];
  let filteredSvc = state.services || [];

  if (filter === 'bike') {
    filteredTx = filteredTx.filter(t => t.billCategory === 'bike');
    filteredSvc = [];
  } else if (filter === 'spares') {
    filteredTx = filteredTx.filter(t => t.billCategory === 'spares');
    filteredPur = [];
    filteredInv = [];
  }
  
  let title = '';
  let subtitle = '';
  let iconHtml = '';
  let tableHtml = '';
  
  if (kpiType === 'sales') {
    title = 'Sales Revenue Statistics Explorer';
    const total = filteredTx.reduce((acc, t) => acc + (t.financials?.total || 0), 0);
    const avg = total / Math.max(filteredTx.length, 1);
    subtitle = `Detailed ledger showing top transactions. Total: ₹ ${total.toLocaleString('en-IN')} | Average Billing Ticket: ₹ ${avg.toLocaleString('en-IN', {maximumFractionDigits:2})}`;
    iconHtml = `<svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    
    const sortedTx = [...filteredTx].sort((a,b) => (b.financials?.total || 0) - (a.financials?.total || 0)).slice(0, 8);
    
    tableHtml = `
      <table class="table" style="width:100%;">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Category</th>
            <th>Vehicle / Items Description</th>
            <th style="text-align:right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    if (sortedTx.length === 0) {
      tableHtml += `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No matching sales transactions found.</td></tr>`;
    } else {
      sortedTx.forEach(t => {
        const isBike = t.billCategory === 'bike';
        const desc = isBike ? `ADMS ${t.vehicle?.model || 'E-Bike'}` : `${(t.spares || []).length} spares logged`;
        tableHtml += `
          <tr>
            <td style="font-family:monospace; font-weight:700; color:var(--neon-cyan);">${escapeHtml(t.id)}</td>
            <td>${t.date}</td>
            <td style="font-weight:600;">${escapeHtml(t.customer?.name || 'Walk-in')}</td>
            <td><span class="badge ${isBike ? 'badge-stock' : 'badge-sold'}">${isBike ? 'E-Bike' : 'Spares'}</span></td>
            <td>${escapeHtml(desc)}</td>
            <td style="text-align:right; font-weight:700; color:var(--neon-cyan);">₹ ${(t.financials?.total || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
        `;
      });
    }
    tableHtml += `</tbody></table>`;
    
  } else if (kpiType === 'purchases') {
    title = 'Purchases Outflow Statistics Explorer';
    const total = filteredPur.reduce((acc, p) => acc + (parseFloat(p.costPrice) || 0), 0);
    const avg = total / Math.max(filteredPur.length, 1);
    subtitle = `Detailed ledger logging vehicle stock inflows. Total Value: ₹ ${total.toLocaleString('en-IN')} | Avg Vehicle Cost: ₹ ${avg.toLocaleString('en-IN', {maximumFractionDigits:2})}`;
    iconHtml = `<svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
    
    tableHtml = `
      <table class="table" style="width:100%;">
        <thead>
          <tr>
            <th>Chassis / Serial No</th>
            <th>Supplier Name</th>
            <th>Purchase Bill No</th>
            <th>Vehicle Model</th>
            <th>GST (%)</th>
            <th style="text-align:right;">Cost Price (INR)</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    if (filteredPur.length === 0) {
      tableHtml += `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No purchase records logged.</td></tr>`;
    } else {
      filteredPur.forEach(p => {
        tableHtml += `
          <tr>
            <td style="font-family:monospace; font-weight:700; color:var(--neon-pink);">${escapeHtml(p.chassis || 'N/A')}</td>
            <td style="font-weight:600;">${escapeHtml(p.supplier || 'N/A')}</td>
            <td style="font-family:monospace;">${escapeHtml(p.billNo || 'N/A')}</td>
            <td>ADMS ${escapeHtml(p.model || 'E-Bike')}</td>
            <td>${p.vehicleGst || '18'}%</td>
            <td style="text-align:right; font-weight:700; color:var(--neon-pink);">₹ ${(parseFloat(p.costPrice) || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
        `;
      });
    }
    tableHtml += `</tbody></table>`;
    
  } else if (kpiType === 'stock') {
    title = 'E-Bike Inventory Valuation Explorer';
    iconHtml = `<svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
    
    const stockMap = {};
    filteredInv.forEach(item => {
      const model = item.model || 'Other';
      if (!stockMap[model]) stockMap[model] = { stock: 0, sold: 0, costSum: 0, costCount: 0 };
      if (item.status === 'STOCK') {
        stockMap[model].stock++;
      } else {
        stockMap[model].sold++;
      }
      
      const pur = state.purchases.find(p => p.chassis === item.chassis);
      if (pur && pur.costPrice) {
        stockMap[model].costSum += parseFloat(pur.costPrice);
        stockMap[model].costCount++;
      }
    });
    
    tableHtml = `
      <table class="table" style="width:100%;">
        <thead>
          <tr>
            <th>Model Name</th>
            <th style="text-align:center;">Stock Qty</th>
            <th style="text-align:center;">Sold Qty</th>
            <th style="text-align:right;">Avg Cost Price</th>
            <th style="text-align:right;">Potential Retail Price</th>
            <th style="text-align:right;">Valuation (Stock)</th>
            <th style="text-align:right;">Gross Margin</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    const entries = Object.entries(stockMap);
    let totalStockVal = 0;
    
    if (entries.length === 0) {
      tableHtml += `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No model-wise stock registers.</td></tr>`;
    } else {
      entries.forEach(([model, info]) => {
        const avgCost = info.costCount > 0 ? info.costSum / info.costCount : 55000;
        const potentialRetail = avgCost * 1.18;
        const valuation = info.stock * avgCost;
        totalStockVal += valuation;
        const grossMargin = ((potentialRetail - avgCost) / potentialRetail) * 100;
        
        tableHtml += `
          <tr>
            <td style="font-weight:700; color:var(--neon-lime);">ADMS ${escapeHtml(model)}</td>
            <td style="text-align:center; font-weight:700;">${info.stock} units</td>
            <td style="text-align:center;">${info.sold} sold</td>
            <td style="text-align:right;">₹ ${avgCost.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
            <td style="text-align:right;">₹ ${potentialRetail.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
            <td style="text-align:right; font-weight:700; color:var(--neon-lime);">₹ ${valuation.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
            <td style="text-align:right; font-weight:700; color:var(--neon-orange);">${grossMargin.toFixed(1)}%</td>
          </tr>
        `;
      });
    }
    
    tableHtml += `</tbody></table>`;
    subtitle = `Valuation of STOCK Assets: ₹ ${totalStockVal.toLocaleString('en-IN')} across ${entries.length} ADMS e-Bike variants.`;
    
  } else if (kpiType === 'services') {
    title = 'Spares Catalog & Service Labor Ledgers';
    iconHtml = `<svg viewBox="0 0 24 24" style="width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>`;
    
    const sparesRevenue = filteredTx.filter(t => t.billCategory === 'spares').reduce((acc, t) => acc + (t.financials?.total || 0), 0);
    const servicesRevenue = filteredSvc.reduce((acc, s) => acc + (s.totalBill || 0), 0);
    const total = sparesRevenue + servicesRevenue;
    
    subtitle = `Breakdown of spares catalog logs and labor bookings. Total: ₹ ${total.toLocaleString('en-IN')}`;
    
    tableHtml = `
      <table class="table" style="width:100%;">
        <thead>
          <tr>
            <th>Job Card / Doc No</th>
            <th>Service/Bill Date</th>
            <th>Customer / Vehicle</th>
            <th>Spares Cost (INR)</th>
            <th>Labor Charges (INR)</th>
            <th style="text-align:right;">Total Bill Amount</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    const sparesInvoices = filteredTx.filter(t => t.billCategory === 'spares');
    
    if (sparesInvoices.length === 0 && filteredSvc.length === 0) {
      tableHtml += `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No Spares invoice or Service jobs registered.</td></tr>`;
    } else {
      sparesInvoices.forEach(t => {
        tableHtml += `
          <tr>
            <td style="font-family:monospace; font-weight:700; color:var(--neon-purple);">${escapeHtml(t.id)}</td>
            <td>${t.date}</td>
            <td style="font-weight:600;">${escapeHtml(t.customer?.name || 'Walk-in Customer')}</td>
            <td>₹ ${(t.financials?.total - (t.labor || 0)).toLocaleString('en-IN')}</td>
            <td>₹ ${(t.labor || 0).toLocaleString('en-IN')}</td>
            <td style="text-align:right; font-weight:700; color:var(--neon-purple);">₹ ${(t.financials?.total || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
        `;
      });
      
      filteredSvc.forEach(s => {
        tableHtml += `
          <tr>
            <td style="font-family:monospace; font-weight:700; color:var(--neon-purple);">${escapeHtml(s.docNo || 'SRV-LOG')}</td>
            <td>${s.serviceDate || 'N/A'}</td>
            <td style="font-weight:600;">${escapeHtml(s.custName || 'Registered Odometer')} <span style="font-size:0.75rem; color:var(--text-muted);">(${escapeHtml(s.vehicleModel || '')})</span></td>
            <td>₹ ${(s.sparesCost || 0).toLocaleString('en-IN')}</td>
            <td>₹ ${(s.laborCharges || 0).toLocaleString('en-IN')}</td>
            <td style="text-align:right; font-weight:700; color:var(--neon-purple);">₹ ${(s.totalBill || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
          </tr>
        `;
      });
    }
    tableHtml += `</tbody></table>`;
  }
  
  titleEl.textContent = title;
  subEl.textContent = subtitle;
  iconEl.innerHTML = iconHtml;
  tableCont.innerHTML = tableHtml;
  
  const glowHex = kpiType === 'sales' ? 'var(--neon-cyan)' :
                  kpiType === 'purchases' ? 'var(--neon-pink)' :
                  kpiType === 'stock' ? 'var(--neon-lime)' :
                  'var(--neon-purple)';
  const glowColor = kpiType === 'sales' ? 'var(--neon-cyan-glow)' :
                    kpiType === 'purchases' ? 'var(--neon-pink-glow)' :
                    kpiType === 'stock' ? 'var(--neon-lime-glow)' :
                    'var(--neon-purple-glow)';
                    
  const modalPanel = modal.querySelector('.custom-confirm-panel');
  if (modalPanel) {
    modalPanel.style.borderColor = glowHex;
    modalPanel.style.boxShadow = `0 0 35px ${glowColor}`;
  }
  
  titleEl.style.color = glowHex;
  titleEl.style.textShadow = `0 0 8px ${glowColor}`;
  iconEl.style.color = glowHex;
  iconEl.style.borderColor = `rgba(255,255,255,0.15)`;
  
  modal.style.display = 'flex';
}

function closeDashboardDetailModal() {
  const modal = document.getElementById('dashboard-detail-modal');
  if (modal) modal.style.display = 'none';
}

// --- Dynamic synchronized bank details toggle ---
function togglePrintBankDetails(isChecked) {
  const bankWrapper = document.getElementById('rep-bank-wrapper');
  if (bankWrapper) {
    bankWrapper.style.display = isChecked ? 'block' : 'none';
  }

  // Sync Billing Page checkbox
  const billingCheckbox = document.getElementById('bill-print-bank');
  if (billingCheckbox) {
    billingCheckbox.checked = isChecked;
  }

  // Sync Print Station checkbox
  const printCheckbox = document.getElementById('toggle-print-bank');
  if (printCheckbox) {
    printCheckbox.checked = isChecked;
  }
}

// --- Dynamic synchronized balance due toggle ---
function togglePrintBalanceDue(isChecked) {
  const row = document.getElementById('rep-balance-due-row');
  if (row) {
    if (isChecked) {
      const tx = state.loadedTransaction;
      const balanceVal = tx && tx.financials ? parseFloat(tx.financials.balance) : 0;
      if (balanceVal > 0) {
        row.style.display = 'flex';
        const valEl = document.getElementById('rep-balance-due-val');
        if (valEl) valEl.textContent = '₹ ' + balanceVal.toLocaleString('en-IN', { minimumFractionDigits: 2 });
      } else {
        row.style.display = 'none';
      }
    } else {
      row.style.display = 'none';
    }
  }

  // Sync Billing Page checkbox
  const billingCheckbox = document.getElementById('bill-print-balance');
  if (billingCheckbox) {
    billingCheckbox.checked = isChecked;
  }

  // Sync Print Station checkbox
  const printCheckbox = document.getElementById('toggle-print-balance');
  if (printCheckbox) {
    printCheckbox.checked = isChecked;
  }
}

// --- Dynamic synchronized custom notes toggle ---
function togglePrintNotes(isChecked) {
  const noteContainer = document.getElementById('rep-invoice-notes-container');
  const tx = state.loadedTransaction;
  
  // Re-render table bottom to update rowspan cell notes output dynamically in print station
  if (tx) {
    // Save updated notes active state to transaction
    if (!tx.notes) tx.notes = { active: false, text: '' };
    tx.notes.active = isChecked;
    renderInvoicePrintSheet(tx);
  }

  // Sync Billing Page checkbox
  const billingCheckbox = document.getElementById('bill-print-notes-toggle');
  if (billingCheckbox) {
    billingCheckbox.checked = isChecked;
  }
  const billingInput = document.getElementById('bill-notes-input');
  if (billingInput) {
    billingInput.style.display = isChecked ? 'block' : 'none';
  }

  // Sync Print Station checkbox
  const printCheckbox = document.getElementById('toggle-print-notes');
  if (printCheckbox) {
    printCheckbox.checked = isChecked;
  }
}

// --- Edit transaction notes toggle helper ---
function toggleEditNotesDisplay(isChecked) {
  const input = document.getElementById('edit-notes-input');
  if (input) {
    input.style.display = isChecked ? 'block' : 'none';
  }
}

// --- Background auto emergency backup dispatcher ---
function triggerBackgroundBackup() {
  if (window.isInitializing) return;
  const txs = JSON.parse(localStorage.getItem('sleb_transactions') || '[]');
  const mappedQuotes = txs.filter(t => t && t.docType === 'quotation').map(t => {
    return {
      id: t.id,
      date: t.date,
      customer: t.customer,
      taxMode: t.taxMode,
      items: t.vehicle ? [{ modelName: t.vehicle.model, qty: 1 }] : [],
      financials: t.financials
    };
  });

  // Get or establish timestamp
  const lastUpdated = parseInt(localStorage.getItem('sleb_last_updated') || '0', 10) || updateLastUpdatedTimestamp();

  const backupData = {
    lastUpdated, // Sync key
    dealership: state.dealership || {},
    purchases: state.purchases || [],
    inventory: state.inventory || [],
    transactions: state.transactions || [],
    spares: state.spares || [],
    services: state.services || [],
    warrantyAgreements: state.warrantyAgreements || [],
    quotations: mappedQuotes,
    customFields: customFieldDefs || {},
    statusOverrides: statusOverrides || {},
    quotationModels: state.quotationModels || []
  };

  const serverUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? '' : 'http://localhost:3000';

  fetch(serverUrl + '/api/backup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backupData)
  })
  .then(res => {
    if (res.ok) {
      console.log('Background emergency backup saved to local file system.');
      const statusIndicator = document.getElementById('backup-status-indicator');
      if (statusIndicator) {
        statusIndicator.style.color = '#39ff14';
        statusIndicator.innerHTML = '✔ Connected';
      }
    }
  })
  .catch(err => {
    console.warn('Backup server offline. Running in Local Mode.');
    const statusIndicator = document.getElementById('backup-status-indicator');
    if (statusIndicator) {
      statusIndicator.style.color = '#ff007f';
      statusIndicator.innerHTML = '✘ Local Mode';
    }
  });
}

function syncWithServerBackup() {
  const serverUrl = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? '' : 'http://localhost:3000';
  
  fetch(serverUrl + '/backups/sleb_backup.json')
    .then(res => {
      if (res.ok) return res.json();
      throw new Error('No backup file found or server offline');
    })
    .then(data => {
      if (data && typeof data === 'object') {
        console.log('Found server-side backup. Checking timestamps...');
        
        const serverLastUpdated = parseInt(data.lastUpdated || '0', 10);
        const localLastUpdatedStr = localStorage.getItem('sleb_last_updated');
        
        // A fresh session has NO local last_updated key, so it contains only mock seed data!
        const isFreshSession = !localLastUpdatedStr;
        const localLastUpdated = parseInt(localLastUpdatedStr || '0', 10);
        
        if (isFreshSession || serverLastUpdated >= localLastUpdated) {
          console.log(`Server backup is newer or this is a fresh session (${serverLastUpdated} >= ${localLastUpdated}). Restoring disk backup...`);
          
          let loadedAny = false;
          
          if (data.dealership && typeof data.dealership === 'object' && Object.keys(data.dealership).length > 0) {
            state.dealership = data.dealership;
            localStorage.setItem('sleb_dealership', JSON.stringify(state.dealership));
            loadedAny = true;
          }
          if (Array.isArray(data.purchases)) {
            state.purchases = data.purchases;
            localStorage.setItem('sleb_purchases', JSON.stringify(state.purchases));
            loadedAny = true;
          }
          if (Array.isArray(data.inventory)) {
            state.inventory = data.inventory;
            localStorage.setItem('sleb_inventory', JSON.stringify(state.inventory));
            loadedAny = true;
          }
          if (Array.isArray(data.transactions)) {
            state.transactions = data.transactions;
            localStorage.setItem('sleb_transactions', JSON.stringify(state.transactions));
            loadedAny = true;
          }
          if (Array.isArray(data.spares)) {
            state.spares = data.spares;
            localStorage.setItem('sleb_spares', JSON.stringify(state.spares));
            loadedAny = true;
          }
          if (Array.isArray(data.services)) {
            state.services = data.services;
            localStorage.setItem('sleb_services', JSON.stringify(state.services));
            loadedAny = true;
          }
          if (Array.isArray(data.warrantyAgreements)) {
            state.warrantyAgreements = data.warrantyAgreements;
            localStorage.setItem('sleb_warranty_agreements', JSON.stringify(state.warrantyAgreements));
            loadedAny = true;
          }
          if (data.customFields && typeof data.customFields === 'object' && Object.keys(data.customFields).length > 0) {
            customFieldDefs = data.customFields;
            localStorage.setItem('sleb_custom_fields', JSON.stringify(customFieldDefs));
            loadedAny = true;
          }
          if (data.statusOverrides && typeof data.statusOverrides === 'object') {
            statusOverrides = data.statusOverrides;
            localStorage.setItem('sleb_status_overrides', JSON.stringify(statusOverrides));
            loadedAny = true;
          }
          if (Array.isArray(data.quotationModels)) {
            state.quotationModels = data.quotationModels;
            localStorage.setItem('sleb_quotation_models', JSON.stringify(state.quotationModels));
            loadedAny = true;
          }
          if (Array.isArray(data.quotations)) {
            state.quotations = data.quotations;
            localStorage.setItem('sleb_quotations', JSON.stringify(state.quotations));
            loadedAny = true;

            // Migrate restored historical quotations into central transactions database
            try {
              state.quotations.forEach(q => {
                const exists = state.transactions.some(t => t && t.id === q.id);
                if (!exists) {
                  state.transactions.push({
                    id: q.id,
                    docType: 'quotation',
                    taxMode: q.taxMode || 'intrastate',
                    date: q.date || (typeof getCurrentDateString === 'function' ? getCurrentDateString() : new Date().toISOString().split('T')[0]),
                    paymentType: 'CASH',
                    refNo: 'NON REG',
                    billCategory: 'bike',
                    customer: q.customer || { name: 'Anonymous', phone: '0000000000', address: 'N/A' },
                    vehicle: {
                      model: q.items && q.items[0] ? q.items[0].modelName : 'ADMS RIDER',
                      chassis: 'N/A',
                      motor: 'N/A',
                      battery: 'N/A',
                      charger: 'N/A',
                      hsn: '8711',
                      basePrice: q.financials ? q.financials.base : (q.items && q.items[0] ? q.items[0].rate : 0),
                      gstPct: q.items && q.items[0] ? q.items[0].gstPct : 5
                    },
                    spares: [],
                    labor: 0,
                    financials: q.financials || {
                      base: q.items && q.items[0] ? q.items[0].rate : 0,
                      cgst: q.items && q.items[0] ? q.items[0].cgst : 0,
                      sgst: q.items && q.items[0] ? q.items[0].sgst : 0,
                      igst: q.items && q.items[0] ? q.items[0].igst : 0,
                      total: q.items && q.items[0] ? q.items[0].total : 0,
                      paid: 0,
                      balance: q.items && q.items[0] ? q.items[0].total : 0
                    }
                  });
                }
              });
              localStorage.setItem('sleb_transactions', JSON.stringify(state.transactions));
            } catch (err) {
              console.error("Restored quotations migration failed:", err);
            }
          }
          
          if (loadedAny) {
            localStorage.setItem('sleb_last_updated', serverLastUpdated.toString());
            refreshAllViews();
            showSyncToast('Local system perfectly restored from disk database!', 'success');
            
            const statusIndicator = document.getElementById('backup-status-indicator');
            if (statusIndicator) {
              statusIndicator.style.color = '#39ff14';
              statusIndicator.innerHTML = '✔ Connected & Synced';
            }
          }
        } else {
          console.log(`Browser has newer local modifications (${localLastUpdated} > ${serverLastUpdated}). Pushing to server...`);
          try { triggerBackgroundBackup(); } catch (err) {}
          
          const statusIndicator = document.getElementById('backup-status-indicator');
          if (statusIndicator) {
            statusIndicator.style.color = '#39ff14';
            statusIndicator.innerHTML = '✔ Connected & Pushed';
          }
        }
      }
    })
    .catch(err => {
      console.log('Server-side backup sync skipped or offline:', err.message);
    });
}

function showSyncToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '2rem';
  toast.style.right = '2rem';
  toast.style.padding = '0.75rem 1.25rem';
  toast.style.background = 'rgba(10, 15, 30, 0.85)';
  toast.style.backdropFilter = 'blur(12px)';
  toast.style.border = '1px solid ' + (type === 'success' ? '#39ff14' : '#ff007f');
  toast.style.boxShadow = '0 0 15px ' + (type === 'success' ? 'rgba(57, 255, 20, 0.25)' : 'rgba(255, 0, 127, 0.25)');
  toast.style.color = '#ffffff';
  toast.style.borderRadius = '8px';
  toast.style.fontFamily = "'Inter', sans-serif";
  toast.style.fontSize = '0.82rem';
  toast.style.fontWeight = '600';
  toast.style.zIndex = '9999999';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '0.5rem';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

  const dot = document.createElement('span');
  dot.style.width = '8px';
  dot.style.height = '8px';
  dot.style.borderRadius = '50%';
  dot.style.background = type === 'success' ? '#39ff14' : '#ff007f';
  dot.style.boxShadow = '0 0 6px ' + (type === 'success' ? '#39ff14' : '#ff007f');

  toast.appendChild(dot);
  toast.appendChild(document.createTextNode(message));

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 100);

  // Remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}

// --- Cyberpunk Neon Splash Screen Launcher ---
function startAppWithAudio() {
  // Play Web Audio synthesized startup sound
  try {
    playStartupSound();
  } catch (e) {
    console.warn("Audio synthesis sweep failed:", e);
  }

  // Fade out splash overlay
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    splash.style.pointerEvents = 'none';
    setTimeout(() => {
      splash.style.display = 'none';
    }, 800);
  }
}

// --- Web Audio API Sci-Fi Synthesizer Sound ---
function playStartupSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const now = ctx.currentTime;

  // Oscillators
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc2.type = 'triangle';

  // Rising neon frequency sweep (perfect chord intervals)
  osc1.frequency.setValueAtTime(110, now); // A2
  osc1.frequency.exponentialRampToValueAtTime(440, now + 1.2); // A4

  osc2.frequency.setValueAtTime(165, now); // E3
  osc2.frequency.exponentialRampToValueAtTime(660, now + 1.5); // E5

  // lowpass filter sweep
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(150, now);
  filter.frequency.exponentialRampToValueAtTime(2500, now + 1.0);
  filter.Q.value = 10;

  // gain envelope
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5); // long futuristic echo decay

  // Audio Node connections
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Play oscillators
  osc1.start(now);
  osc2.start(now);

  // Safe release stops
  // Play oscillators
  osc1.start(now);
  osc2.start(now);

  // Safe release stops
  osc1.stop(now + 2.6);
  osc2.stop(now + 2.6);
}

// ==========================================================================
// 📄 QUOTATION BIKE MODELS CATALOG MANAGEMENT
// ==========================================================================

function saveQuotationModelsToStorage() {
  localStorage.setItem('sleb_quotation_models', JSON.stringify(state.quotationModels));
  updateLastUpdatedTimestamp();
  try { triggerBackgroundBackup(); } catch (e) {}
}

function updateQModelFormPreview() {
  const basePriceInput = document.getElementById('qmodel-base-price');
  const gstPctSelect = document.getElementById('qmodel-gst-pct');
  
  if (!basePriceInput || !gstPctSelect) return;
  
  const basePrice = parseFloat(basePriceInput.value) || 0;
  const gstPct = parseFloat(gstPctSelect.value) || 0;
  
  const gstTax = basePrice * (gstPct / 100);
  const totalVal = basePrice + gstTax;
  
  const lblBase = document.getElementById('lbl-qprev-base');
  const lblTax = document.getElementById('lbl-qprev-tax');
  const lblTotal = document.getElementById('lbl-qprev-total');
  
  if (lblBase) lblBase.textContent = `₹ ${Number(basePrice).toFixed(2)}`;
  if (lblTax) lblTax.textContent = `₹ ${Number(gstTax).toFixed(2)}`;
  if (lblTotal) lblTotal.textContent = `₹ ${Number(totalVal).toFixed(2)}`;
}

function renderQuotationModelsCatalogTable() {
  const tbody = document.getElementById('qmodels-catalog-tbody');
  if (!tbody) return;
  
  const query = (document.getElementById('qmodel-search-input')?.value || '').toLowerCase().trim();
  
  tbody.innerHTML = '';
  
  const list = (state.quotationModels || []).filter(m => {
    if (!query) return true;
    return (m.name || '').toLowerCase().includes(query) || (m.hsn || '').toLowerCase().includes(query);
  });
  
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No quotation models found in catalog.</td></tr>`;
    return;
  }
  
  list.forEach(m => {
    const base = Number(m.basePrice || 0);
    const gstPct = Number(m.gstPct || 0);
    const tax = base * (gstPct / 100);
    const total = base + tax;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-weight:700; color:var(--text-main);">${escapeHtml(m.name)}</td>
      <td style="text-align:right; font-weight:600;">₹ ${base.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="text-align:center;"><span class="badge badge-stock">${gstPct}%</span></td>
      <td style="text-align:center; font-family:monospace;">${escapeHtml(m.hsn || '8711')}</td>
      <td style="text-align:right; font-weight:700; color:var(--color-primary);">₹ ${total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td>
        <div style="display:flex; gap:0.35rem; justify-content:center;">
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.72rem; width:auto; border-color:var(--color-secondary);" onclick="editQuotationModel('${m.id}')">Edit</button>
          <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.72rem; width:auto;" onclick="deleteQuotationModel('${m.id}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function filterQuotationModelsCatalog() {
  renderQuotationModelsCatalogTable();
}

function resetQuotationModelForm() {
  document.getElementById('qmodel-id-edit').value = '';
  document.getElementById('qmodel-name').value = '';
  document.getElementById('qmodel-base-price').value = '';
  document.getElementById('qmodel-gst-pct').value = '5';
  document.getElementById('qmodel-hsn').value = '8711';
  
  document.getElementById('qmodel-form-title').innerHTML = `
    <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    Register New Quotation Model
  `;
  document.getElementById('qmodel-submit-btn').textContent = 'Register Model';
  
  updateQModelFormPreview();
}

function saveQuotationModel() {
  if (!Array.isArray(state.quotationModels)) {
    state.quotationModels = [];
  }

  const idEdit = document.getElementById('qmodel-id-edit').value.trim();
  const name = document.getElementById('qmodel-name').value.trim();
  const priceVal = document.getElementById('qmodel-base-price').value.trim();
  const gstPctVal = document.getElementById('qmodel-gst-pct').value;
  const hsn = document.getElementById('qmodel-hsn').value.trim();
  
  if (!name || !priceVal) {
    alert('Please enter E-Bike Model Name and Showroom Base Price.');
    return;
  }
  
  const basePrice = parseFloat(priceVal) || 0;
  const gstPct = parseFloat(gstPctVal) || 0;
  
  if (basePrice <= 0) {
    alert('Please enter a valid base price.');
    return;
  }
  
  const record = {
    id: idEdit || 'qm-' + Date.now(),
    name,
    basePrice,
    gstPct,
    hsn: hsn || '8711'
  };
  
  if (idEdit) {
    const idx = state.quotationModels.findIndex(m => String(m.id) === String(idEdit));
    if (idx !== -1) {
      state.quotationModels[idx] = record;
    }
  } else {
    state.quotationModels.push(record);
  }
  
  saveQuotationModelsToStorage();
  renderQuotationModelsCatalogTable();
  resetQuotationModelForm();
  
  // Refresh the billing dropdown options immediately!
  renderBillingDropdown();
  
  alert(idEdit ? 'Model configuration updated successfully!' : 'New E-Bike model registered in Quotation catalog!');
}

function editQuotationModel(id) {
  const model = state.quotationModels.find(m => String(m.id) === String(id));
  if (!model) return;
  
  document.getElementById('qmodel-id-edit').value = model.id;
  document.getElementById('qmodel-name').value = model.name;
  document.getElementById('qmodel-base-price').value = model.basePrice;
  document.getElementById('qmodel-gst-pct').value = String(model.gstPct || 5);
  document.getElementById('qmodel-hsn').value = model.hsn || '8711';
  
  document.getElementById('qmodel-form-title').innerHTML = `
    <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    Edit Quotation Model Configuration
  `;
  document.getElementById('qmodel-submit-btn').textContent = 'Update Configuration';
  
  updateQModelFormPreview();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteQuotationModel(id) {
  const idx = state.quotationModels.findIndex(m => String(m.id) === String(id));
  if (idx === -1) return;
  
  const consent = confirm('Are you sure you want to delete this vehicle model from the Quotation catalog? New quotations will no longer be able to select it.');
  if (!consent) return;
  
  state.quotationModels.splice(idx, 1);
  saveQuotationModelsToStorage();
  renderQuotationModelsCatalogTable();
  
  // Refresh the billing dropdown options immediately!
  renderBillingDropdown();
  
  alert('Purged model successfully.');
}

// --- SheetJS Catalog Exporters & Importers ---

function exportQuotationModelsExcel() {
  if (!state.quotationModels || state.quotationModels.length === 0) {
    alert('No quotation models available in catalog to export.');
    return;
  }
  
  const workbookData = [
    ['Model ID', 'Vehicle Model Name', 'Showroom Base Price (INR)', 'GST Rate %', 'HSN Code']
  ];
  
  state.quotationModels.forEach(m => {
    workbookData.push([
      m.id,
      m.name,
      m.basePrice || 0,
      m.gstPct || 5,
      m.hsn || '8711'
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(workbookData);
  const wscols = [
    { wch: 18 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 15 }
  ];
  worksheet['!cols'] = wscols;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quoted Models Catalog");
  XLSX.writeFile(workbook, "SRI_LAKSHMI_EBIKES_QUOTED_MODELS_REPORT.xlsx");
}

function importQuotationModelsExcel(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert('Error: Excel sheet seems invalid.');
        return;
      }
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });
      
      if (rows.length <= 1) {
        alert('Error: Excel sheet is empty or columns are mismatched.');
        return;
      }
      
      let importCount = 0;
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (row.length < 3) continue;
        
        const mId = String(row[0]).trim() || 'qm-' + (Date.now() + r);
        const name = String(row[1]).trim();
        const basePrice = parseFloat(row[2]) || 0;
        const gstPct = parseFloat(row[3]) || 5;
        const hsn = String(row[4] || '8711').trim();
        
        if (!name || basePrice <= 0) continue;
        
        const record = {
          id: mId,
          name,
          basePrice,
          gstPct,
          hsn
        };
        
        const oldIdx = state.quotationModels.findIndex(old => String(old.id) === String(mId));
        if (oldIdx !== -1) {
          state.quotationModels[oldIdx] = record;
        } else {
          state.quotationModels.push(record);
        }
        importCount++;
      }
      
      saveQuotationModelsToStorage();
      renderQuotationModelsCatalogTable();
      renderBillingDropdown();
      alert(`\u{1F4E5} Successfully imported and synchronized ${importCount} E-Bike Models inside catalog!`);
      
    } catch(err) {
      console.error(err);
      alert('Error parsing Excel data sheet. Make sure column styles match: [Model ID, Model Name, Base Price, GST %, HSN]');
    }
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

// ==========================================================================
// 📋 QUOTATION MANAGER - VIEW SWITCHER, HISTORY TABLE, ACTIONS
// ==========================================================================

// Toggle between Catalog and History sub-panels in Quotation Manager tab
function switchQuotationManagerView(view) {
  const catalogPanel = document.getElementById('quotation-catalog-panel');
  const historyPanel = document.getElementById('quotation-history-panel');
  const btnCatalog = document.getElementById('qmgr-tab-catalog');
  const btnHistory = document.getElementById('qmgr-tab-history');

  if (view === 'catalog') {
    if (catalogPanel) catalogPanel.style.display = '';
    if (historyPanel) historyPanel.style.display = 'none';
    if (btnCatalog) btnCatalog.classList.add('active');
    if (btnHistory) btnHistory.classList.remove('active');
  } else {
    if (catalogPanel) catalogPanel.style.display = 'none';
    if (historyPanel) historyPanel.style.display = '';
    if (btnCatalog) btnCatalog.classList.remove('active');
    if (btnHistory) btnHistory.classList.add('active');
    renderQuotationHistoryTable();
  }
}

// Render the Quotation History table from central transactions (docType === 'quotation')
function renderQuotationHistoryTable() {
  const tbody = document.getElementById('qhist-tbody');
  if (!tbody) return;

  const searchInput = document.getElementById('qhist-search-input');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const quotes = (state.transactions || []).filter(t => {
    if (!t || t.docType !== 'quotation') return false;
    if (!query) return true;
    const custName = (t.customer && t.customer.name) ? t.customer.name.toLowerCase() : '';
    const custPhone = (t.customer && t.customer.phone) ? t.customer.phone : '';
    const model = (t.vehicle && t.vehicle.model) ? t.vehicle.model.toLowerCase() : '';
    const id = (t.id || '').toLowerCase();
    return custName.includes(query) || custPhone.includes(query) || model.includes(query) || id.includes(query);
  });

  tbody.innerHTML = '';

  if (quotes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No quotations found. Create one from the <strong>New Billing</strong> tab in Quotation mode.</td></tr>`;
    return;
  }

  quotes.forEach((tx, qIdx) => {
    const realIdx = state.transactions.indexOf(tx);
    const fin = tx.financials || {};
    const base = Number(fin.base || 0);
    const gst = Number((fin.cgst || 0)) + Number((fin.sgst || 0)) + Number((fin.igst || 0));
    const total = Number(fin.total || 0);
    const model = (tx.vehicle && tx.vehicle.model) ? tx.vehicle.model : '-';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-family:monospace; font-weight:700; color:var(--color-primary);">${escapeHtml(tx.id || 'N/A')}</td>
      <td>${escapeHtml(tx.date || '-')}</td>
      <td style="font-weight:600;">${escapeHtml(tx.customer && tx.customer.name ? tx.customer.name : '-')}</td>
      <td style="font-family:monospace;">${escapeHtml(tx.customer && tx.customer.phone ? tx.customer.phone : '-')}</td>
      <td style="font-weight:600; color:var(--text-main);">${escapeHtml(model)}</td>
      <td style="text-align:right;">\u20b9 ${base.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="text-align:right; color:var(--color-secondary);">\u20b9 ${gst.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td style="text-align:right; font-weight:700; color:var(--color-primary);">\u20b9 ${total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
      <td>
        <div style="display:flex; gap:0.3rem; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-primary" style="padding:0.3rem 0.55rem; font-size:0.72rem; width:auto;" onclick="printQuotationById('${escapeHtml(tx.id || '')}')">Print</button>
          <button class="btn btn-primary" style="padding:0.3rem 0.55rem; font-size:0.72rem; width:auto; background:hsla(180, 100%, 50%, 0.15); border-color:hsl(180, 100%, 40%); color:hsl(180, 100%, 75%);" onclick="downloadQuotationById('${escapeHtml(tx.id || '')}')">Download</button>
          <button class="btn btn-secondary" style="padding:0.3rem 0.55rem; font-size:0.72rem; width:auto; border-color:var(--color-secondary);" onclick="loadCustomerToBilling(${realIdx})">Load/Bill</button>
          <button class="btn btn-danger" style="padding:0.3rem 0.55rem; font-size:0.72rem; width:auto;" onclick="deleteQuotationById('${escapeHtml(tx.id || '')}')">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Print a quotation by its ID - loads to print station and switches to it
function printQuotationById(qId) {
  const tx = state.transactions.find(t => t && t.id === qId && t.docType === 'quotation');
  if (!tx) { alert('Quotation not found.'); return; }
  state.loadedTransaction = tx;
  renderInvoicePrintSheet(tx);
  switchTab('invoice-printer-tab');
  setTimeout(() => {
    window.print();
  }, 350);
}

// Download a quotation as a PDF by its ID
function downloadQuotationById(qId) {
  const tx = state.transactions.find(t => t && t.id === qId && t.docType === 'quotation');
  if (!tx) { alert('Quotation not found.'); return; }
  state.loadedTransaction = tx;
  renderInvoicePrintSheet(tx);
  
  // Force displaying invoice paper and hiding service card paper
  const invPaper = document.getElementById('invoice-paper-element');
  const serPaper = document.getElementById('service-card-paper-element');
  if (invPaper) invPaper.style.display = 'block';
  if (serPaper) serPaper.style.display = 'none';
  
  downloadInvoicePDFSafe();
}

// Delete a quotation by its ID from central transactions
function deleteQuotationById(qId) {
  const idx = state.transactions.findIndex(t => t && t.id === qId && t.docType === 'quotation');
  if (idx === -1) { alert('Quotation not found.'); return; }
  const tx = state.transactions[idx];
  const custName = (tx.customer && tx.customer.name) ? tx.customer.name : 'Unknown';
  if (!confirm(`Delete quotation ${qId} for ${custName}? This cannot be undone.`)) return;
  state.transactions.splice(idx, 1);
  saveTransactionsToStorage();
  renderSalesHistoryTable();
  renderQuotationHistoryTable();
  try { triggerBackgroundBackup(); } catch(e) {}
}

// Export quotation history to Excel (SheetJS)
function exportQuotationHistoryExcel() {
  const quotes = (state.transactions || []).filter(t => t && t.docType === 'quotation');
  if (quotes.length === 0) { alert('No quotation history to export.'); return; }
  if (typeof XLSX === 'undefined') { alert('Excel library not loaded. Please open the app via http://localhost:3000 or with an internet connection.'); return; }

  const headers = ['Quotation No', 'Date', 'Customer Name', 'Mobile', 'Address', 'Vehicle Model', 'Base Price (INR)', 'GST (INR)', 'Grand Total (INR)', 'Payment Type'];
  const rows = quotes.map(t => {
    const fin = t.financials || {};
    const gst = Number((fin.cgst || 0)) + Number((fin.sgst || 0)) + Number((fin.igst || 0));
    return [
      t.id || '',
      t.date || '',
      (t.customer && t.customer.name) ? t.customer.name : '',
      (t.customer && t.customer.phone) ? t.customer.phone : '',
      (t.customer && t.customer.address) ? t.customer.address : '',
      (t.vehicle && t.vehicle.model) ? t.vehicle.model : '',
      Number(fin.base || 0),
      gst,
      Number(fin.total || 0),
      t.paymentType || 'CASH'
    ];
  });

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quotation History');
  XLSX.writeFile(wb, `SLEB_Quotation_History_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ==========================================================================
// 📄 OFFLINE-SAFE PDF DOWNLOAD (no server required, no CDN required)
// ==========================================================================

// Safe PDF download that works even when html2pdf CDN is unavailable (offline)
// Falls back to browser's built-in print dialog which can save as PDF
function downloadInvoicePDFSafe() {
  const serPaper = document.getElementById('service-card-paper-element');
  if (serPaper && serPaper.style.display === 'block') {
    const jobCardId = document.getElementById('rep-ser-job-id').textContent;
    if (jobCardId) {
      downloadServiceCardPDFSafe(jobCardId);
      return;
    }
  }

  const tx = state.loadedTransaction;
  if (!tx) { alert('No invoice loaded.'); return; }

  // Try html2pdf first if it was loaded from CDN
  if (typeof html2pdf !== 'undefined') {
    const element = document.getElementById('invoice-paper-element');
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `${(tx.docType || 'invoice').toUpperCase()}_#${tx.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    return;
  }

  // Offline fallback: open a print window with just the invoice paper content
  const paperEl = document.getElementById('invoice-paper-element');
  if (!paperEl) { window.print(); return; }

  const paperHTML = paperEl.outerHTML;

  // Collect all stylesheets from current page
  let styleContent = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
    if (el.tagName === 'STYLE') {
      styleContent += el.outerHTML;
    } else if (el.getAttribute && el.getAttribute('href')) {
      styleContent += el.outerHTML;
    }
  });

  const printWin = window.open('', '_blank', 'width=900,height=700');
  if (!printWin) {
    // If popup blocked, fall back to regular print
    window.print();
    return;
  }

  printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${(tx.docType === 'quotation' ? 'QUOTATION' : 'INVOICE')}_#${tx.id}</title>
  ${styleContent}
  <style>
    body { background: #fff !important; color: #000 !important; margin: 0; padding: 0; }
    .invoice-paper { box-shadow: none !important; margin: 0 auto; }
    @media print { @page { margin: 0; } body { margin: 0; } }
  </style>
</head>
<body>
  ${paperHTML}
  <script>window.onload = function() { window.print(); window.close(); }<\/script>
</body>
</html>`);
  printWin.document.close();
}

// =========================================================================
// PREMIUM SERVICE REGISTRY PRINTING & DIALOG PROMPTS
// =========================================================================

function showPrintDownloadPrompt(type, onPrint, onDownload) {
  // Remove existing prompt if any
  const existing = document.getElementById('print-download-overlay');
  if (existing) existing.remove();

  // Create modal container overlay
  const overlay = document.createElement('div');
  overlay.id = 'print-download-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(10, 15, 30, 0.7)';
  overlay.style.backdropFilter = 'blur(12px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '999999';
  overlay.style.animation = 'fadeIn 0.25s ease-out';

  // Inject keyframe animation inline if not present
  if (!document.getElementById('prompt-animations')) {
    const style = document.createElement('style');
    style.id = 'prompt-animations';
    style.innerHTML = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(style);
  }

  // Modal box
  const modal = document.createElement('div');
  modal.style.background = 'var(--bg-glass, rgba(17, 24, 39, 0.85))';
  modal.style.border = '1px solid var(--border-glass-hover, rgba(0, 242, 254, 0.25))';
  modal.style.borderRadius = 'var(--radius-lg, 12px)';
  modal.style.padding = '2.5rem';
  modal.style.maxWidth = '450px';
  modal.style.width = '90%';
  modal.style.textAlign = 'center';
  modal.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5)';
  modal.style.animation = 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Title icon & Header
  let icon = '📄';
  let titleColor = '#00f2fe';
  if (type === 'Quotation') {
    icon = '📝';
    titleColor = 'var(--color-primary, #00f2fe)';
  } else if (type === 'Service Job Card') {
    icon = '🛠️';
    titleColor = 'var(--color-stock, #2e7d32)';
  }

  modal.innerHTML = `
    <div style="font-size: 3.5rem; margin-bottom: 1rem; filter: drop-shadow(0 0 10px ${titleColor}30);">${icon}</div>
    <h2 style="color: ${titleColor}; font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: 0.5px;">${type} Processed!</h2>
    <p style="color: var(--text-main, #e5e7eb); font-size: 0.9rem; line-height: 1.5; margin-bottom: 2rem;">Your ${type.toLowerCase()} record is registered in the database. Choose an action below to proceed.</p>
    
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <button id="modal-btn-print" class="btn btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.75rem 1rem; font-weight: 700; border-radius: var(--radius-md, 8px);">
        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4"/></svg>
        Print ${type}
      </button>
      <button id="modal-btn-download" class="btn btn-secondary" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.75rem 1rem; font-weight: 700; border-radius: var(--radius-md, 8px); background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15);">
        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Download PDF
      </button>
      <button id="modal-btn-close" class="btn btn-danger" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.75rem 1rem; font-weight: 700; border-radius: var(--radius-md, 8px); background: transparent; border-color: transparent; color: var(--text-muted, #9ca3af);">
        Discard & Close
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Bind click handlers
  document.getElementById('modal-btn-print').addEventListener('click', () => {
    overlay.remove();
    onPrint();
  });

  document.getElementById('modal-btn-download').addEventListener('click', () => {
    overlay.remove();
    onDownload();
  });

  document.getElementById('modal-btn-close').addEventListener('click', () => {
    overlay.remove();
  });
}

function renderServiceCardPrintSheet(job) {
  if (!job) return;

  // Toggle visible print sheet frame elements in print station
  const invPaper = document.getElementById('invoice-paper-element');
  const serPaper = document.getElementById('service-card-paper-element');
  if (invPaper) invPaper.style.display = 'none';
  if (serPaper) serPaper.style.display = 'block';

  // Dealership info
  document.getElementById('rep-ser-brand-name').textContent = state.dealership.brandName;
  document.getElementById('rep-ser-legal-name').textContent = state.dealership.legalName;
  document.getElementById('rep-ser-address1').textContent = state.dealership.address1;
  document.getElementById('rep-ser-address2').textContent = state.dealership.address2;
  document.getElementById('rep-ser-phone').textContent = state.dealership.phone;
  document.getElementById('rep-ser-gstin').textContent = state.dealership.gstin;
  document.getElementById('rep-ser-sig-showroom-name').textContent = state.dealership.legalName;

  // Job metadata
  document.getElementById('rep-ser-cust-name').textContent = job.custName || 'Walk-in Customer';
  document.getElementById('rep-ser-chassis').textContent = job.chassis || '-';
  document.getElementById('rep-ser-count').textContent = job.serviceCount || 'Periodic Maintenance';
  document.getElementById('rep-ser-invoice-no').textContent = job.invoiceNo || 'WALK-IN';
  document.getElementById('rep-ser-job-id').textContent = job.id;
  document.getElementById('rep-ser-date').textContent = job.date;
  document.getElementById('rep-ser-odometer').textContent = `${job.odometer || 0} KMs`;

  // Spares & Labor table rendering
  const tbody = document.getElementById('replica-ser-print-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let trHtml = '';
  let sno = 1;

  if (job.spares && job.spares.length > 0) {
    job.spares.forEach(item => {
      trHtml += `
        <tr class="item-row">
          <td class="cell-sno text-center">${sno++}</td>
          <td class="cell-particulars font-bold" style="text-align: left !important; padding-left: 10px;">${item.name} (SKU: ${item.sku})</td>
          <td class="cell-hsn text-center">8714</td>
          <td class="cell-qty text-center">${item.qty}</td>
          <td class="cell-amount text-right">${item.amount.toFixed(2)}</td>
        </tr>
      `;
    });
  }

  if (job.laborCharges > 0) {
    trHtml += `
      <tr class="item-row">
        <td class="cell-sno text-center">${sno++}</td>
        <td class="cell-particulars font-bold" style="text-align: left !important; padding-left: 10px;">Labor & Servicing Charges</td>
        <td class="cell-hsn text-center">998729</td>
        <td class="cell-qty text-center">1</td>
        <td class="cell-amount text-right">${job.laborCharges.toFixed(2)}</td>
      </tr>
    `;
  }

  // Padding rows
  const rem = Math.max(1, 7 - sno);
  for (let r = 0; r < rem; r++) {
    const isLast = (r === rem - 1);
    trHtml += `
      <tr${isLast ? ' class="last-item-row"' : ''}>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
    `;
  }

  // Spares Cost calculation, words, and total bills
  const sparesCost = job.sparesCost || 0;
  const laborCharges = job.laborCharges || 0;
  const grandTotal = job.totalBill || (sparesCost + laborCharges);
  const words = numberToWords(Math.round(grandTotal));

  trHtml += `
    <tr class="summary-border-top">
      <td colspan="2" class="cell-amount-words" style="border-right: none !important; border-top: 1px solid black !important;">
        AMOUNT IN WORDS : <span style="font-weight: 700; text-transform: uppercase;">${words} ONLY.</span>
      </td>
      <td colspan="2" class="bg-total-lbl text-center font-bold" style="border-left: 1px solid black !important; border-right: 1px solid black !important; border-top: 1px solid black !important;">SPARES TOTAL</td>
      <td class="bg-total-val text-right font-bold" style="border-top: 1px solid black !important;">${sparesCost.toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="2" class="border-none-no-bottom"></td>
      <td colspan="2" class="bg-tax-lbl text-center font-bold" style="border-left: 1px solid black !important; border-right: 1px solid black !important; background-color: #fff2cc !important; color: #000 !important;">LABOR CHARGES</td>
      <td class="bg-tax-val text-right font-bold" style="background-color: #fff2cc !important; color: #000 !important;">${laborCharges.toFixed(2)}</td>
    </tr>
    <tr>
      <td colspan="2" class="border-none" style="border-bottom: 1px solid black !important;"></td>
      <td colspan="2" class="bg-grand-lbl text-center font-bold color-white" style="border-left: 1px solid black !important; border-right: 1px solid black !important; background-color: #2e7d32 !important; color: white !important;">GRAND TOTAL</td>
      <td class="bg-grand-val text-right font-bold color-white" style="background-color: #2e7d32 !important; color: white !important;">${grandTotal.toFixed(2)}</td>
    </tr>
  `;

  tbody.innerHTML = trHtml;
}

function printServiceJobCard(jobId) {
  const job = state.services.find(item => item.id === jobId);
  if (!job) {
    alert('Service record not found.');
    return;
  }

  // Load into print station layout
  state.loadedTransaction = null;
  renderServiceCardPrintSheet(job);

  // Switch to print station and toggle state
  const emptyState = document.getElementById('printer-empty-state');
  const viewer = document.getElementById('invoice-viewer');
  if (emptyState) emptyState.style.display = 'none';
  if (viewer) viewer.style.display = 'block';

  switchTab('invoice-printer-tab');

  // Trigger print popup after short timeout
  setTimeout(() => {
    let styleContent = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
      if (el.tagName === 'STYLE') styleContent += el.outerHTML;
      else if (el.getAttribute && el.getAttribute('href')) styleContent += el.outerHTML;
    });

    const paperEl = document.getElementById('service-card-paper-element');
    const paperHTML = paperEl.outerHTML;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JOBCARD_#${job.id}</title>
  ${styleContent}
  <style>
    body { background: #fff !important; color: #000 !important; margin: 0; padding: 0; }
    .invoice-paper { box-shadow: none !important; margin: 0 auto; display: block !important; }
    @media print { @page { margin: 0; } body { margin: 0; } }
  </style>
</head>
<body>
  ${paperHTML}
  <script>window.onload = function() { window.print(); window.close(); }<\/script>
</body>
</html>`);
    printWin.document.close();
  }, 350);
}

function downloadServiceCardPDFSafe(jobId) {
  const job = state.services.find(item => item.id === jobId);
  if (!job) return;

  renderServiceCardPrintSheet(job);

  const element = document.getElementById('service-card-paper-element');
  
  if (typeof html2pdf !== 'undefined') {
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `JOBCARD_${job.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    return;
  }

  // Fallback to print window
  printServiceJobCard(jobId);
}

// ==========================================================================
// PORTABLE DATABASE MANUAL BACKUP & RESTORE Fallback Controllers
// ==========================================================================

function downloadWholeDatabaseJSON() {
  const txs = JSON.parse(localStorage.getItem('sleb_transactions') || '[]');
  const mappedQuotes = txs.filter(t => t && t.docType === 'quotation').map(t => {
    return {
      id: t.id,
      date: t.date,
      customer: t.customer,
      taxMode: t.taxMode,
      items: t.vehicle ? [{ modelName: t.vehicle.model, qty: 1 }] : [],
      financials: t.financials
    };
  });

  const dbData = {
    dealership: state.dealership || {},
    purchases: state.purchases || [],
    inventory: state.inventory || [],
    transactions: state.transactions || [],
    spares: state.spares || [],
    services: state.services || [],
    warrantyAgreements: state.warrantyAgreements || [],
    quotations: mappedQuotes,
    customFields: customFieldDefs || {},
    statusOverrides: statusOverrides || {},
    quotationModels: state.quotationModels || []
  };

  const jsonStr = JSON.stringify(dbData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `sleb_database_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showSyncToast('Database backup downloaded successfully!', 'success');
}

function uploadWholeDatabaseJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') {
        alert('Invalid JSON file format.');
        return;
      }

      let restoredAny = false;

      if (data.dealership && typeof data.dealership === 'object' && Object.keys(data.dealership).length > 0) {
        state.dealership = data.dealership;
        localStorage.setItem('sleb_dealership', JSON.stringify(state.dealership));
        restoredAny = true;
      }
      if (Array.isArray(data.purchases)) {
        state.purchases = data.purchases;
        localStorage.setItem('sleb_purchases', JSON.stringify(state.purchases));
        restoredAny = true;
      }
      if (Array.isArray(data.inventory)) {
        state.inventory = data.inventory;
        localStorage.setItem('sleb_inventory', JSON.stringify(state.inventory));
        restoredAny = true;
      }
      if (Array.isArray(data.transactions)) {
        state.transactions = data.transactions;
        localStorage.setItem('sleb_transactions', JSON.stringify(state.transactions));
        restoredAny = true;
      }
      if (Array.isArray(data.spares)) {
        state.spares = data.spares;
        localStorage.setItem('sleb_spares', JSON.stringify(state.spares));
        restoredAny = true;
      }
      if (Array.isArray(data.services)) {
        state.services = data.services;
        localStorage.setItem('sleb_services', JSON.stringify(state.services));
        restoredAny = true;
      }
      if (Array.isArray(data.warrantyAgreements)) {
        state.warrantyAgreements = data.warrantyAgreements;
        localStorage.setItem('sleb_warranty_agreements', JSON.stringify(state.warrantyAgreements));
        restoredAny = true;
      }
      if (data.customFields && typeof data.customFields === 'object' && Object.keys(data.customFields).length > 0) {
        customFieldDefs = data.customFields;
        localStorage.setItem('sleb_custom_fields', JSON.stringify(customFieldDefs));
        restoredAny = true;
      }
      if (data.statusOverrides && typeof data.statusOverrides === 'object') {
        statusOverrides = data.statusOverrides;
        localStorage.setItem('sleb_status_overrides', JSON.stringify(statusOverrides));
        restoredAny = true;
      }
      if (Array.isArray(data.quotationModels)) {
        state.quotationModels = data.quotationModels;
        localStorage.setItem('sleb_quotation_models', JSON.stringify(state.quotationModels));
        restoredAny = true;
      }

      if (restoredAny) {
        refreshAllViews();
        try { triggerBackgroundBackup(); } catch (err) {}
        showSyncToast('Local database successfully loaded & synced!', 'success');
        alert('Database backup restored successfully! All views refreshed.');
      } else {
        alert('Could not find valid database records in the selected file.');
      }
    } catch (err) {
      alert('Error parsing JSON backup file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// --- REAL-TIME FORM DRAFT AUTOSAVE AND RESTORATION SYSTEM ---
// ==========================================================================

function saveBillingDraftToStorage() {
  try {
    const draft = {
      custName: document.getElementById('cust-name')?.value || '',
      custPhone: document.getElementById('cust-phone')?.value || '',
      custEmail: document.getElementById('cust-email')?.value || '',
      custAddress: document.getElementById('cust-address')?.value || '',
      custGstin: document.getElementById('cust-gstin')?.value || '',
      custRefNo: document.getElementById('cust-ref-no')?.value || '',
      billInvoiceNo: document.getElementById('bill-invoice-no')?.value || '',
      billDate: document.getElementById('bill-date')?.value || '',
      vehicleSelect: document.getElementById('vehicle-select')?.value || '',
      billPaymentType: document.getElementById('bill-payment-type')?.value || '',
      billPaymentTypeSpares: document.getElementById('bill-payment-type-spares')?.value || '',
      amountPaid: document.getElementById('amount-paid')?.value || '',
      billOverrideBase: document.getElementById('bill-override-base')?.value || '',
      billGstRate: document.getElementById('bill-gst-rate')?.value || '',
      toggleGstin: document.getElementById('toggle-gstin')?.checked || false,
      toggleIdDetails: document.getElementById('toggle-id-details')?.checked || false,
      billIdNo: document.getElementById('bill-id-no')?.value || '',
      billIdCost: document.getElementById('bill-id-cost')?.value || '',
      billIdTreatment: document.getElementById('bill-id-treatment')?.value || 'add',
      togglePrevOutstanding: document.getElementById('toggle-prev-outstanding')?.checked || false
    };
    localStorage.setItem('sleb_billing_form_draft', JSON.stringify(draft));
  } catch (e) {
    console.error("Failed to save billing draft", e);
  }
}

function loadBillingDraftFromStorage() {
  try {
    const draftStr = localStorage.getItem('sleb_billing_form_draft');
    if (!draftStr) return;
    const draft = JSON.parse(draftStr);
    if (draft) {
      if (document.getElementById('cust-name')) document.getElementById('cust-name').value = draft.custName || '';
      if (document.getElementById('cust-phone')) document.getElementById('cust-phone').value = draft.custPhone || '';
      if (document.getElementById('cust-email')) document.getElementById('cust-email').value = draft.custEmail || '';
      if (document.getElementById('cust-address')) document.getElementById('cust-address').value = draft.custAddress || '';
      if (document.getElementById('cust-gstin')) document.getElementById('cust-gstin').value = draft.custGstin || '';
      if (document.getElementById('cust-ref-no')) document.getElementById('cust-ref-no').value = draft.custRefNo || '';
      if (document.getElementById('bill-invoice-no') && draft.billInvoiceNo) document.getElementById('bill-invoice-no').value = draft.billInvoiceNo;
      if (document.getElementById('bill-date') && draft.billDate) document.getElementById('bill-date').value = draft.billDate;
      if (document.getElementById('vehicle-select')) document.getElementById('vehicle-select').value = draft.vehicleSelect || '';
      if (document.getElementById('bill-payment-type')) document.getElementById('bill-payment-type').value = draft.billPaymentType || 'CASH';
      if (document.getElementById('bill-payment-type-spares')) document.getElementById('bill-payment-type-spares').value = draft.billPaymentTypeSpares || 'CASH';
      if (document.getElementById('amount-paid')) document.getElementById('amount-paid').value = draft.amountPaid || '';
      if (document.getElementById('bill-override-base')) document.getElementById('bill-override-base').value = draft.billOverrideBase || '';
      if (document.getElementById('bill-gst-rate')) document.getElementById('bill-gst-rate').value = draft.billGstRate || '';
      
      const toggleGstin = document.getElementById('toggle-gstin');
      if (toggleGstin) {
        toggleGstin.checked = !!draft.toggleGstin;
        const formGroupGstin = toggleGstin.parentElement?.parentElement?.querySelector('.form-group-gstin-field') || document.getElementById('cust-gstin')?.parentElement;
        if (formGroupGstin) formGroupGstin.style.display = toggleGstin.checked ? 'block' : 'none';
      }
      
      const toggleIdDetails = document.getElementById('toggle-id-details');
      if (toggleIdDetails) {
        toggleIdDetails.checked = !!draft.toggleIdDetails;
        const block = document.getElementById('id-purchase-block');
        if (block) block.style.display = toggleIdDetails.checked ? 'block' : 'none';
      }
      
      if (document.getElementById('bill-id-no')) document.getElementById('bill-id-no').value = draft.billIdNo || '';
      if (document.getElementById('bill-id-cost')) document.getElementById('bill-id-cost').value = draft.billIdCost || '';
      if (document.getElementById('bill-id-treatment')) document.getElementById('bill-id-treatment').value = draft.billIdTreatment || 'add';
      
      const togglePrevOutstanding = document.getElementById('toggle-prev-outstanding');
      if (togglePrevOutstanding) {
        togglePrevOutstanding.checked = !!draft.togglePrevOutstanding;
      }
    }
  } catch (e) {
    console.error("Failed to load billing draft", e);
  }
}

function clearBillingDraft() {
  localStorage.removeItem('sleb_billing_form_draft');
}

function saveServicesDraftToStorage() {
  try {
    const draft = {
      invoiceNo: document.getElementById('ser-invoice-no')?.value || '',
      custName: document.getElementById('ser-cust-name')?.value || '',
      chassis: document.getElementById('ser-chassis')?.value || '',
      date: document.getElementById('ser-date')?.value || '',
      countLabel: document.getElementById('ser-count-label')?.value || '',
      odometer: document.getElementById('ser-odometer')?.value || '',
      sparesCost: document.getElementById('ser-spares-cost')?.value || '',
      laborCost: document.getElementById('ser-labor-cost')?.value || ''
    };
    localStorage.setItem('sleb_services_form_draft', JSON.stringify(draft));
  } catch (e) {
    console.error("Failed to save services draft", e);
  }
}

function loadServicesDraftFromStorage() {
  try {
    const draftStr = localStorage.getItem('sleb_services_form_draft');
    if (!draftStr) return;
    const draft = JSON.parse(draftStr);
    if (draft) {
      if (document.getElementById('ser-invoice-no')) document.getElementById('ser-invoice-no').value = draft.invoiceNo || '';
      if (document.getElementById('ser-cust-name')) document.getElementById('ser-cust-name').value = draft.custName || '';
      if (document.getElementById('ser-chassis')) document.getElementById('ser-chassis').value = draft.chassis || '';
      if (document.getElementById('ser-date')) document.getElementById('ser-date').value = draft.date || '';
      if (document.getElementById('ser-count-label')) document.getElementById('ser-count-label').value = draft.countLabel || '';
      if (document.getElementById('ser-odometer')) document.getElementById('ser-odometer').value = draft.odometer || '';
      if (document.getElementById('ser-spares-cost')) document.getElementById('ser-spares-cost').value = draft.sparesCost || '0';
      if (document.getElementById('ser-labor-cost')) document.getElementById('ser-labor-cost').value = draft.laborCost || '0';
    }
  } catch (e) {
    console.error("Failed to load services draft", e);
  }
}

function clearServicesDraft() {
  localStorage.removeItem('sleb_services_form_draft');
}

// --- Backup Server Connectivity Verification & Automatic Redirect Guide ---
function checkServerConnectionAndGuide() {
  const isFileProtocol = window.location.protocol === 'file:';
  const serverUrl = 'http://localhost:3000';

  // Perform a test fetch to check if the backup server is active
  fetch(serverUrl + '/backups/sleb_backup.json', { method: 'HEAD' })
    .then(res => {
      if (isFileProtocol) {
        console.log("Active backup server detected at http://localhost:3000. Redirecting from file:// to http://localhost:3000 for perfect persistence...");
        window.location.href = serverUrl + '/index.html' + window.location.search + window.location.hash;
      }
    })
    .catch(err => {
      if (isFileProtocol) {
        showServerOfflineOverlay();
      }
    });
}

function showServerOfflineOverlay() {
  if (document.getElementById('server-offline-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'server-offline-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(6, 8, 14, 0.96)';
  overlay.style.backdropFilter = 'blur(16px)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999999';
  overlay.style.fontFamily = "'Inter', sans-serif";
  overlay.style.color = '#ffffff';

  const card = document.createElement('div');
  card.style.background = 'linear-gradient(135deg, rgba(16, 20, 38, 0.95), rgba(10, 12, 22, 0.98))';
  card.style.border = '1px solid #ff007f';
  card.style.boxShadow = '0 0 40px rgba(255, 0, 127, 0.25)';
  card.style.padding = '2.5rem';
  card.style.borderRadius = '16px';
  card.style.maxWidth = '550px';
  card.style.width = '90%';
  card.style.textAlign = 'center';

  card.innerHTML = `
    <div style="font-size: 3.5rem; margin-bottom: 1.5rem; animation: pulse 2s infinite;">⚠️</div>
    <h2 style="font-size: 1.4rem; font-weight: 700; color: #ff007f; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px;">Auto-Backup Server Offline</h2>
    <p style="color: #a0aec0; font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">
      You opened the website directly using the file browser. Under this offline mode, the browser's security policies prevent reliable data storage and loading.
    </p>
    <div style="background: rgba(255, 0, 127, 0.08); border-left: 4px solid #ff007f; padding: 1rem; border-radius: 8px; text-align: left; margin-bottom: 1.8rem;">
      <h4 style="font-size: 0.88rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; text-transform: uppercase;">How to launch perfectly:</h4>
      <ol style="color: #cbd5e0; font-size: 0.85rem; line-height: 1.5; padding-left: 1.2rem; margin: 0;">
        <li style="margin-bottom: 0.5rem;">Close this browser tab.</li>
        <li style="margin-bottom: 0.5rem;">Go to your <strong>Desktop</strong>.</li>
        <li style="margin-bottom: 0.5rem;">Double-click the <strong>Sri Lakshmi e-Bikes Portal</strong> shortcut (has the blue logo).</li>
      </ol>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center;">
      <button onclick="document.getElementById('server-offline-overlay').remove();" class="btn btn-secondary" style="padding: 0.6rem 1.5rem; font-size: 0.85rem; border-color: rgba(255,255,255,0.2); color: #a0aec0; background: transparent; cursor: pointer;">
        Continue in Offline Mode
      </button>
    </div>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  if (!document.getElementById('offline-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'offline-pulse-style';
    style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.08); opacity: 1; text-shadow: 0 0 15px rgba(255,0,127,0.6); }
        100% { transform: scale(1); opacity: 0.9; }
      }
    `;
    document.head.appendChild(style);
  }
}

