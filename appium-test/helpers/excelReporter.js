const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const excelPath = path.resolve('AgriFarm_Appium_TestCases.xlsx');

class ExcelReporter {
  constructor() {
    this.excelPath = excelPath;
    this.workbook = null;
    this.isLoaded = false;
  }

  async load() {
    if (this.isLoaded) return;
    this.workbook = new ExcelJS.Workbook();
    if (fs.existsSync(this.excelPath)) {
      await this.workbook.xlsx.readFile(this.excelPath);
      this.isLoaded = true;
    } else {
      throw new Error(`Excel test case file not found at ${this.excelPath}. Run excelGenerator first.`);
    }
  }

  async updateTestCase(tcId, status, actualResult) {
    await this.load();
    const sheet = this.workbook.getWorksheet('Detailed Test Cases');
    if (!sheet) {
      throw new Error('Detailed Test Cases worksheet not found in the workbook.');
    }

    let found = false;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const idVal = row.getCell(1).value;
      if (idVal === tcId) {
        row.getCell(7).value = actualResult;
        row.getCell(8).value = status;
        row.getCell(11).value = new Date().toISOString().split('T')[0];
        found = true;
      }
    });

    if (!found) {
      console.warn(`Test Case ID ${tcId} was not found in the spreadsheet to update.`);
    }
  }

  async addDefect(defectId, tcId, title, desc, severity) {
    await this.load();
    const sheet = this.workbook.getWorksheet('Defect Summary');
    if (!sheet) {
      throw new Error('Defect Summary worksheet not found in the workbook.');
    }

    let duplicate = false;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (row.getCell(1).value === defectId) {
        duplicate = true;
      }
    });

    if (!duplicate) {
      sheet.addRow([
        defectId,
        tcId,
        title,
        desc,
        severity,
        new Date().toISOString().split('T')[0],
        'Open'
      ]);
    }
  }

  async save() {
    if (!this.isLoaded) return;

    const sheet2 = this.workbook.getWorksheet('Detailed Test Cases');
    const sheet1 = this.workbook.getWorksheet('Summary Dashboard');

    if (sheet2 && sheet1) {
      let passed = 0;
      let failed = 0;
      let blocked = 0;
      let notExecuted = 0;

      sheet2.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const status = row.getCell(8).value;
        if (status === 'Passed') passed++;
        else if (status === 'Failed') failed++;
        else if (status === 'Blocked') blocked++;
        else notExecuted++;
      });

      const total = passed + failed + blocked + notExecuted;
      const passRate = total > 0 ? passed / total : 0;

      sheet1.getCell('B5').value = total;
      sheet1.getCell('B6').value = passed;
      sheet1.getCell('B7').value = failed;
      sheet1.getCell('B8').value = blocked;
      sheet1.getCell('B9').value = notExecuted;
      sheet1.getCell('B10').value = passRate;
    }

    await this.workbook.xlsx.writeFile(this.excelPath);
    console.log(`Excel report saved and updated. Path: ${this.excelPath}`);
  }
}

module.exports = { ExcelReporter };
