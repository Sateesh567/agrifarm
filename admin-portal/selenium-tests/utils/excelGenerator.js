import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const excelPath = path.resolve('AgriFarm_Selenium_TestCases.xlsx');

async function generateExcel() {
  console.log(`Generating pre-populated Excel workbook at: ${excelPath}`);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AgriFarm Selenium E2E Engine';
  workbook.lastModifiedBy = 'AgriFarm Selenium E2E Engine';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ────────────────────────────────────────────────────────────────
  // SHEET 1: Summary Dashboard
  // ────────────────────────────────────────────────────────────────
  const dashboard = workbook.addWorksheet('Summary Dashboard', {
    views: [{ showGridLines: true }]
  });

  // Title Style
  dashboard.mergeCells('A1:E2');
  const titleCell = dashboard.getCell('A1');
  titleCell.value = 'AgriFarm Admin Portal Selenium Test Dashboard';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };

  // Headers
  dashboard.getRow(4).values = ['Metrics', 'Value', 'Status Count', 'Percentage', 'Dashboard Visualization'];
  dashboard.getRow(4).font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
  dashboard.getRow(4).alignment = { horizontal: 'center' };
  ['A4', 'B4', 'C4', 'D4', 'E4'].forEach(pos => {
    dashboard.getCell(pos).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D47A1' } };
  });

  // KPI Rows
  dashboard.getCell('A5').value = 'Total Test Cases';
  dashboard.getCell('B5').value = 300;
  dashboard.getCell('A6').value = 'Passed';
  dashboard.getCell('B6').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H301, \"Passed\")" };
  dashboard.getCell('A7').value = 'Failed';
  dashboard.getCell('B7').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H301, \"Failed\")" };
  dashboard.getCell('A8').value = 'Blocked';
  dashboard.getCell('B8').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H301, \"Blocked\")" };
  dashboard.getCell('A9').value = 'Not Executed';
  dashboard.getCell('B9').value = { formula: "COUNTIF('Detailed Test Cases'!H2:H301, \"Not Executed\")" };

  dashboard.getCell('A10').value = 'Pass Percentage';
  dashboard.getCell('B10').value = { formula: 'B6/B5' };
  dashboard.getCell('B10').numFmt = '0.00%';

  dashboard.getColumn('A').width = 25;
  dashboard.getColumn('B').width = 15;
  dashboard.getColumn('C').width = 15;
  dashboard.getColumn('D').width = 15;
  dashboard.getColumn('E').width = 30;

  for (let r = 5; r <= 10; r++) {
    dashboard.getCell(`A${r}`).font = { name: 'Segoe UI', bold: true };
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
  const casesSheet = workbook.addWorksheet('Detailed Test Cases', {
    views: [{ showGridLines: true }]
  });

  casesSheet.getRow(1).values = [
    'Test Case ID', 'Module', 'Feature', 'Preconditions', 
    'Test Steps', 'Expected Result', 'Actual Result', 'Status', 
    'Priority', 'Severity', 'Execution Date'
  ];
  casesSheet.getRow(1).font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
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
    if (idx <= 40) {
      return {
        module: 'Admin Authentication',
        feature: 'Login / Session / Role Check',
        precond: 'Admin Portal running on http://localhost:5173 and database initialized.',
        steps: '1. Navigate to http://localhost:5173\n2. Input admin email and password\n3. Click Login button.',
        expected: 'Admin session token stored, redirected to overview page successfully.'
      };
    } else if (idx <= 100) {
      return {
        module: 'Overview Dashboard',
        feature: 'KPI Widgets / Statistics Charts',
        precond: 'Admin logged in. Data seeded in database.',
        steps: '1. Access Overview dashboard\n2. Inspect KPI widgets (Users count, Shop count, Orders, Revenue)\n3. Verify charts load.',
        expected: 'Overview widgets display correct counts, and graphs render successfully.'
      };
    } else if (idx <= 160) {
      return {
        module: 'Shop Management',
        feature: 'Approve / Reject Shops',
        precond: 'Admin authenticated. Pending shop requests exist in database.',
        steps: '1. Go to Shop Management tab\n2. Find pending shop\n3. Click Approve or Reject option.',
        expected: 'Shop status transitions correctly, audit logs are updated, and shop list is refreshed.'
      };
    } else if (idx <= 220) {
      return {
        module: 'Product Catalog',
        feature: 'Moderation / Soft Delete',
        precond: 'Products populated by sellers.',
        steps: '1. Go to Product Catalog\n2. Search and filter by category\n3. Click Moderation flag or soft delete product.',
        expected: 'Product list updates, flagged item is restricted, deleted item vanishes from public list.'
      };
    } else if (idx <= 270) {
      return {
        module: 'User Accounts',
        feature: 'Block / Reset User Status',
        precond: 'User registry active.',
        steps: '1. Go to User Accounts manager\n2. Find specific user\n3. Toggle block status checkbox.',
        expected: 'User state flips, active session tokens are invalidated on backend, block message shows.'
      };
    } else {
      return {
        module: 'Audit Logs',
        feature: 'Activity Tracking / Sorting',
        precond: 'Admin actions performed.',
        steps: '1. Go to System Audit Logs tab\n2. Check latest activities\n3. Sort by date or filter by module.',
        expected: 'Actions logged with timestamps, correct action type, and IP/role details.'
      };
    }
  }

  for (let i = 1; i <= 300; i++) {
    const tcId = `TC-SEL-${String(i).padStart(3, '0')}`;
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

    row.font = { name: 'Segoe UI', size: 9 };
    row.alignment = { wrapText: true, vertical: 'top' };
  }

  // ────────────────────────────────────────────────────────────────
  // SHEET 3: Defect Summary
  // ────────────────────────────────────────────────────────────────
  const defects = workbook.addWorksheet('Defect Summary', {
    views: [{ showGridLines: true }]
  });
  defects.getRow(1).values = [
    'Defect ID', 'Associated Test Case ID', 'Defect Summary / Title', 
    'Description / Logs payload', 'Severity', 'Logged Date', 'Status'
  ];
  defects.getRow(1).font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
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
  console.log('Successfully pre-populated Excel with 300 detailed Selenium test cases!');
}

generateExcel().catch(err => {
  console.error('Error generating Excel file:', err);
  process.exit(1);
});
