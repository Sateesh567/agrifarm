import ExcelJS from 'exceljs';
import fs from 'fs';
import { config } from '../config/config.js';

export class ExcelReporter {
  constructor() {
    this.excelPath = config.excelPath;
    this.workbook = null;
    this.summarySheet = null;
    this.casesSheet = null;
    this.securitySheet = null;
    this.perfSheet = null;
    this.defectSheet = null;
    this.isLoaded = false;
  }

  async load() {
    if (this.isLoaded) return;
    this.workbook = new ExcelJS.Workbook();
    if (fs.existsSync(this.excelPath)) {
      await this.workbook.xlsx.readFile(this.excelPath);
      this.summarySheet = this.workbook.getWorksheet('Test Execution Summary');
      this.casesSheet = this.workbook.getWorksheet('Detailed Test Cases');
      this.securitySheet = this.workbook.getWorksheet('Security Test Results');
      this.perfSheet = this.workbook.getWorksheet('Performance Test Results');
      this.defectSheet = this.workbook.getWorksheet('Defect Tracking');
      this.isLoaded = true;
    } else {
      throw new Error(`Excel test case file not found at ${this.excelPath}. Run excelGenerator first.`);
    }
  }

  async updateTestCase(testCaseId, status, actualResult) {
    await this.load();
    let found = false;

    // Search and update across all three sheets
    const sheets = [this.casesSheet, this.securitySheet, this.perfSheet];
    for (const sheet of sheets) {
      if (!sheet) continue;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const idVal = row.getCell(1).value;
        if (idVal === testCaseId) {
          if (sheet === this.perfSheet) {
            row.getCell(6).value = actualResult; // Actual Response Time / Status (Col 6)
            row.getCell(7).value = status;       // Status (Col 7)
          } else {
            row.getCell(7).value = actualResult; // Actual Result / Behavior (Col 7)
            row.getCell(8).value = status;       // Status (Col 8)
          }
          found = true;
        }
      });
      if (found) break;
    }

    if (!found) {
      console.warn(`Test case ID ${testCaseId} not found in Excel spreadsheet.`);
    }
  }

  async addDefect(defectId, testCaseId, moduleName, description, severity) {
    await this.load();
    if (!this.defectSheet) return;

    // Check if defect already exists to avoid duplication
    let exists = false;
    this.defectSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (row.getCell(2).value === testCaseId) {
        exists = true;
      }
    });

    if (exists) return;

    const row = this.defectSheet.addRow({
      id: defectId,
      tcId: testCaseId,
      module: moduleName,
      desc: description,
      status: 'Open',
      severity: severity,
      createdDate: new Date().toLocaleDateString(),
      fixedDate: ''
    });
    row.font = { name: 'Segoe UI', size: 9 };
  }

  async save() {
    await this.load();

    let passedCount = 0;
    let failedCount = 0;
    let blockedCount = 0;
    let skippedCount = 0;
    let totalCount = 0;

    const sheets = [this.casesSheet, this.securitySheet, this.perfSheet];
    for (const sheet of sheets) {
      if (!sheet) continue;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        totalCount++;
        const statusVal = sheet === this.perfSheet ? row.getCell(7).value : row.getCell(8).value;
        if (statusVal === 'Passed') passedCount++;
        else if (statusVal === 'Failed') failedCount++;
        else if (statusVal === 'Blocked') blockedCount++;
        else if (statusVal === 'Skipped' || !statusVal) skippedCount++;
      });
    }

    // Write concrete values in Sheet 1 alongside the formula objects
    this.summarySheet.getCell('B2').value = totalCount;
    this.summarySheet.getCell('B3').value = passedCount;
    this.summarySheet.getCell('B4').value = failedCount;
    this.summarySheet.getCell('B5').value = blockedCount;
    this.summarySheet.getCell('B6').value = skippedCount;
    
    const passPercentage = totalCount > 0 ? (passedCount / totalCount) : 0;
    this.summarySheet.getCell('B7').value = passPercentage;

    await this.workbook.xlsx.writeFile(this.excelPath);
    console.log(`Excel report saved and updated. Summary: Total=${totalCount}, Passed=${passedCount}, Failed=${failedCount}, Blocked=${blockedCount}, Skipped=${skippedCount}`);
  }
}
