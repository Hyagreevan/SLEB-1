const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const BACKUP_DIR = path.join(__dirname, 'backups');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create server
const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;

  // Set CORS headers to support file:/// and separate browser links perfectly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${url}`);

  // Handle backup API endpoint
  if (method === 'POST' && url === '/api/backup') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Ensure backups folder exists
        if (!fs.existsSync(BACKUP_DIR)) {
          fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        // 1. Save main JSON database file
        fs.writeFileSync(
          path.join(BACKUP_DIR, 'sleb_backup.json'), 
          JSON.stringify(data, null, 2), 
          'utf8'
        );

        // 2. Generate Excel-compatible CSV files for each model
        generateSalesCSV(data.transactions || []);
        generatePurchasesCSV(data.purchases || []);
        generateStockCSV(data.inventory || []);
        generateSparesCSV(data.spares || []);
        generateServicesCSV(data.services || []);
        generateAgreementsCSV(data.warrantyAgreements || []);
        generateQuotationsCSV(data.quotations || []);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'All emergency backups successfully logged to file system.' }));
      } catch (err) {
        console.error('Backup write failed:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: err.message }));
      }
    });
    return;
  }

  // Handle Static Files Serving
  let filePath = path.join(PUBLIC_DIR, url === '/' ? 'index.html' : url);
  
  // Clean query strings/hashes from filepath
  const questionMarkIdx = filePath.indexOf('?');
  if (questionMarkIdx !== -1) {
    filePath = filePath.substring(0, questionMarkIdx);
  }
  const hashIdx = filePath.indexOf('#');
  if (hashIdx !== -1) {
    filePath = filePath.substring(0, hashIdx);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found - Sri Lakshmi e Bikes Backup Server');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

// Helper: escape values for CSV
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Write standard CSV structure with UTF-8 BOM for automatic Excel load
function writeCSVFile(fileName, headers, rows) {
  let content = '\uFEFF'; // UTF-8 BOM
  content += headers.map(h => escapeCSV(h)).join(',') + '\r\n';
  
  rows.forEach(row => {
    content += row.map(cell => escapeCSV(cell)).join(',') + '\r\n';
  });

  fs.writeFileSync(path.join(BACKUP_DIR, fileName), content, 'utf8');
}

// Exporters
function generateSalesCSV(txs) {
  const headers = ['Invoice No', 'Date', 'Type', 'Buyer Name', 'Phone', 'GSTIN', 'Billed Particulars', 'Grand Total', 'Amount Paid', 'Balance Due'];
  const rows = txs.map(t => {
    let itemDesc = '';
    if (t.billCategory === 'bike') itemDesc = t.vehicle?.model || 'E-Bike';
    else itemDesc = (t.spares || []).map(s => s.name).join('; ');
    
    return [
      t.id, t.date, (t.docType || '').toUpperCase(), t.customer?.name || '', t.customer?.phone || '', t.customer?.gstin || '',
      itemDesc, t.financials?.total || 0, t.financials?.paid || 0, t.financials?.balance || 0
    ];
  });
  writeCSVFile('emergency_backup_sales.csv', headers, rows);
}

function generatePurchasesCSV(purchases) {
  const headers = ['Purchase Bill No', 'Date', 'Supplier Name', 'Model Name', 'Chassis No', 'Motor No', 'Battery No', 'Charger No', 'HSN Code', 'Cost Price', 'Base Retail Rate'];
  const rows = purchases.map(p => [
    p.billNo, p.date, p.supplier, p.model, p.chassis, p.motor, p.battery, p.charger || '', p.hsn, p.costPrice, p.sellingPrice
  ]);
  writeCSVFile('emergency_backup_purchases.csv', headers, rows);
}

function generateStockCSV(inventory) {
  const headers = ['Model Description', 'Chassis No', 'Motor No', 'Battery No', 'Charger No', 'HSN Code', 'Purchase Cost', 'Retail Base Price', 'Status'];
  const rows = inventory.map(b => [
    b.model, b.chassis, b.motor, b.battery, b.charger || '', b.hsn, b.costPrice || 0, b.basePrice || 0, b.status
  ]);
  writeCSVFile('emergency_backup_stock.csv', headers, rows);
}

function generateSparesCSV(spares) {
  const headers = ['Spare Part Name', 'SKU Part No', 'HSN Code', 'Purchase Cost', 'Retail Selling Price', 'Quantity in Stock', 'Reorder Level'];
  const rows = spares.map(s => [
    s.name, s.sku, s.hsn, s.costPrice, s.sellingPrice, s.qty, s.minLevel
  ]);
  writeCSVFile('emergency_backup_spares.csv', headers, rows);
}

function generateServicesCSV(services) {
  const headers = ['Job ID', 'Linked Invoice', 'Chassis No', 'Customer Name', 'Date', 'Service No', 'Odometer Reading (KMs)', 'Spares Cost', 'Labor Cost', 'Total Bill'];
  const rows = services.map(s => [
    s.id, s.invoiceNo || '', s.chassis, s.custName, s.date, s.serviceCount, s.odometer, s.sparesCost, s.laborCharges, s.totalBill
  ]);
  writeCSVFile('emergency_backup_services.csv', headers, rows);
}

function generateAgreementsCSV(agreements) {
  const headers = ['Agreement ID', 'Date', 'Customer Name', 'Phone', 'Vehicle Model', 'Chassis Serial', 'Odometer Reading', 'Warranty Months', 'Guarantee Months'];
  const rows = agreements.map(a => [
    a.id || '', a.deliveryDate || '', a.customer?.custName || '', a.customer?.custPhone || '', a.vehicle?.modelName || '', a.vehicle?.chassis || '', a.vehicle?.odometer || '', a.durations?.warDur || '0', a.durations?.guaDur || '0'
  ]);
  writeCSVFile('emergency_backup_warranty_agreements.csv', headers, rows);
}

function generateQuotationsCSV(quotations) {
  const headers = ['Quotation ID', 'Date', 'Customer Name', 'Customer Phone', 'Customer Address', 'Tax Mode', 'Quoted Model particulars', 'Total Qty', 'Sub Total Base (INR)', 'Total CGST (INR)', 'Total SGST (INR)', 'Total IGST (INR)', 'Grand Total (INR)'];
  const rows = quotations.map(q => {
    const modelsList = (q.items || []).map(i => `${i.modelName} (x${i.qty})`).join('; ');
    const totalQty = (q.items || []).reduce((acc, i) => acc + i.qty, 0);
    return [
      q.id || '',
      q.date || '',
      q.customer?.name || '',
      q.customer?.phone || '',
      q.customer?.address || '',
      q.taxMode || 'intrastate',
      modelsList,
      totalQty,
      q.financials?.base || 0,
      q.financials?.cgst || 0,
      q.financials?.sgst || 0,
      q.financials?.igst || 0,
      q.financials?.total || 0
    ];
  });
  writeCSVFile('emergency_backup_quotations.csv', headers, rows);
  writeCSVFile('sleb_quotations_backup.csv', headers, rows);
}

// Start
server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 SRI LAKSHMI E BIKES - ERP BACKGROUND BACKUP SERVER RUNNING`);
  console.log(`🌐 Local Portal URL: http://localhost:${PORT}`);
  console.log(`💾 Emergency Excel/JSON Backups Path: ${BACKUP_DIR}`);
  console.log(`================================================================`);
});
