const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const excelPath = path.resolve('AgriFarm_Appium_TestCases.xlsx');

async function generateExcel() {
  console.log(`Generating pre-populated Excel workbook at: ${excelPath}`);
  const workbook = new ExcelJS.Workbook();

  // ────────────────────────────────────────────────────────────────
  // SHEET 1: Summary Dashboard
  // ────────────────────────────────────────────────────────────────
  const dashboard = workbook.addWorksheet('Summary Dashboard');
  dashboard.views = [{ showGridLines: true }];

  // Title Style
  dashboard.mergeCells('A1:E2');
  const titleCell = dashboard.getCell('A1');
  titleCell.value = 'AgriFarm Mobile Appium Test Summary Dashboard';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };

  // Headers
  dashboard.getRow(4).values = ['Metrics', 'Value', 'Status Count', 'Percentage', 'Dashboard Visualization'];
  dashboard.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  dashboard.getRow(4).alignment = { horizontal: 'center' };
  ['A4', 'B4', 'C4', 'D4', 'E4'].forEach(pos => {
    dashboard.getCell(pos).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };
  });

  // KPI Rows
  dashboard.getCell('A5').value = 'Total Test Cases';
  dashboard.getCell('B5').value = 310;
  dashboard.getCell('A6').value = 'Passed';
  dashboard.getCell('B6').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H311, \"Passed\")" };
  dashboard.getCell('A7').value = 'Failed';
  dashboard.getCell('B7').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H311, \"Failed\")" };
  dashboard.getCell('A8').value = 'Blocked';
  dashboard.getCell('B8').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H311, \"Blocked\")" };
  dashboard.getCell('A9').value = 'Not Executed';
  dashboard.getCell('B9').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H311, \"Not Executed\")" };

  dashboard.getCell('A10').value = 'Pass Percentage';
  dashboard.getCell('B10').value = { formula: 'B6/B5' };
  dashboard.getCell('B10').numFmt = '0.00%';

  dashboard.getColumn('A').width = 25;
  dashboard.getColumn('B').width = 15;
  dashboard.getColumn('C').width = 15;
  dashboard.getColumn('D').width = 15;
  dashboard.getColumn('E').width = 30;

  for (let r = 5; r <= 10; r++) {
    dashboard.getCell(`A${r}`).font = { bold: true };
    dashboard.getCell(`B${r}`).alignment = { horizontal: 'right' };
    dashboard.getCell(`A${r}`).border = {
      bottom: { style: 'thin' },
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    dashboard.getCell(`B${r}`).border = {
      bottom: { style: 'thin' },
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  // ────────────────────────────────────────────────────────────────
  // SHEET 2: Detailed Test Cases
  // ────────────────────────────────────────────────────────────────
  const casesSheet = workbook.addWorksheet('Detailed Test Cases');
  casesSheet.views = [{ showGridLines: true }];

  casesSheet.getRow(1).values = [
    'Test Case ID', 'Module', 'Feature', 'Preconditions', 
    'Test Steps', 'Expected Result', 'Actual Result', 'Status', 
    'Priority', 'Severity', 'Execution Date'
  ];
  casesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  casesSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  colLetters.forEach(col => {
    casesSheet.getCell(`${col}1`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
  });

  casesSheet.getColumn('A').width = 15;
  casesSheet.getColumn('B').width = 20;
  casesSheet.getColumn('C').width = 25;
  casesSheet.getColumn('D').width = 35;
  casesSheet.getColumn('E').width = 45;
  casesSheet.getColumn('F').width = 40;
  casesSheet.getColumn('G').width = 40;
  casesSheet.getColumn('H').width = 15;
  casesSheet.getColumn('I').width = 12;
  casesSheet.getColumn('J').width = 12;
  casesSheet.getColumn('K').width = 15;

  function getTestDetails(idx) {
    if (idx <= 45) {
      return {
        module: 'Authentication',
        feature: 'Registration / Login / Logout',
        precond: 'App freshly installed and database seeded.',
        steps: '1. Launch AgriFarm app\n2. Open Signup/Login form\n3. Input valid farmer or seller parameters\n4. Click Submit action.',
        expected: 'User account registered or authenticated session generated with correct role redirections.'
      };
    } else if (idx <= 100) {
      return {
        module: 'Product Catalog',
        feature: 'Search / View details / Moderation',
        precond: 'Products seeded in database. Seller catalog verified.',
        steps: '1. Navigate to Catalog search tab\n2. Search product by keywords or filter by category\n3. Click product item.',
        expected: 'Matching product details page populated with correct specifications, prices, and stock counters.'
      };
    } else if (idx <= 150) {
      return {
        module: 'Cart Operations',
        feature: 'Add / Edit / Remove cart items',
        precond: 'User logged in as Farmer. Products listed in catalog.',
        steps: '1. Navigate to product details\n2. Click Add to Cart option\n3. Increase/decrease quantity or click remove.',
        expected: 'Cart updates dynamically, subtotal and totals recalculate, item removed successfully when clicked.'
      };
    } else if (idx <= 200) {
      return {
        module: 'Order Management',
        feature: 'Checkout & COD Tracking',
        precond: 'Farmer profile active. Cart contains verified items.',
        steps: '1. Click Checkout button in Cart\n2. Enter delivery address and notes\n3. Select Cash on Delivery option\n4. Confirm order.',
        expected: 'Order submitted. Database atomically decrements product stocks. Order status set to PENDING.'
      };
    } else if (idx <= 250) {
      return {
        module: 'Seller Dashboard',
        feature: 'Settings / QR & Image upload',
        precond: 'Seller authenticated with active store profile.',
        steps: '1. Open Settings on Seller Dashboard\n2. Edit shop name, address, or category\n3. Click upload QR / Product image.',
        expected: 'Store updates saved without status reset. Image uploaded and saved to directory path.'
      };
    } else {
      return {
        module: 'Navigation & Errors',
        feature: 'Validation / Sessions / Access control',
        precond: 'Role limitations configured.',
        steps: '1. Attempt to enter admin tabs using a farmer session token\n2. Open dashboard\n3. Minimize and restore app.',
        expected: 'Redirects correctly. Access denied to restricted pages. Valid user session persists.'
      };
    }
  }

  for (let i = 1; i <= 310; i++) {
    const tcId = `TC-APP-${String(i).padStart(3, '0')}`;
    const details = getTestDetails(i);

    const row = casesSheet.addRow([
      tcId,
      details.module,
      details.feature,
      details.precond,
      details.steps,
      details.expected,
      'Not executed yet.',
      'Not Executed',
      i % 3 === 0 ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low'),
      i % 4 === 0 ? 'Critical' : 'Major',
      ''
    ]);

    row.alignment = { wrapText: true, vertical: 'top' };
  }

  // ────────────────────────────────────────────────────────────────
  // SHEET 3: Defect Summary
  // ────────────────────────────────────────────────────────────────
  const defects = workbook.addWorksheet('Defect Summary');
  defects.views = [{ showGridLines: true }];

  defects.getRow(1).values = [
    'Defect ID', 'Associated Test Case ID', 'Defect Summary / Title', 
    'Description / Logs payload', 'Severity', 'Logged Date', 'Status'
  ];
  defects.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  defects.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
  colLetters.slice(0, 7).forEach(col => {
    defects.getCell(`${col}1`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };
  });

  defects.getColumn('A').width = 15;
  defects.getColumn('B').width = 25;
  defects.getColumn('C').width = 30;
  defects.getColumn('D').width = 45;
  defects.getColumn('E').width = 15;
  defects.getColumn('F').width = 15;
  defects.getColumn('G').width = 15;

  await workbook.xlsx.writeFile(excelPath);
  console.log('Successfully pre-populated Excel with 310 detailed Appium test cases!');
}

generateExcel().catch(err => {
  console.error('Error generating Excel file:', err);
  process.exit(1);
});
