const path = require('path');
const fs = require('fs');
const { ExcelReporter } = require('../helpers/excelReporter.js');

const reporter = new ExcelReporter();

exports.config = {
  runner: 'local',
  port: 4723,
  path: '/',
  specs: [
    '../tests/**/*.test.js'
  ],
  exclude: [],
  maxInstances: 1,
  capabilities: [{
    'platformName': 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'emulator-5554',
    'appium:app': path.resolve('../app/build/outputs/apk/debug/app-debug.apk'),
    'appium:appWaitActivity': 'com.example.agrifarm.MainActivity',
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
    'appium:fullReset': false
  }],
  logLevel: 'error',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  async beforeSession() {
    await reporter.load();
  },

  async afterTest(test, context, { error, result, duration, passed, retries }) {
    const tcId = test.title.split(':')[0].trim();
    const isTestCase = tcId.startsWith('TC-APP-');

    if (!passed) {
      const screenshotDir = path.resolve('./screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const screenshotName = `${tcId}_failed.png`;
      const screenshotPath = path.join(screenshotDir, screenshotName);
      try {
        await browser.saveScreenshot(screenshotPath);
      } catch (err) {
        console.error('Failed to capture screenshot:', err.message);
      }

      if (isTestCase) {
        const errorMsg = error ? error.message : 'Unknown assertion failure';
        await reporter.updateTestCase(tcId, 'Failed', `Assertion failed: ${errorMsg}`);
        await reporter.addDefect(`DF-${tcId}`, tcId, test.title, errorMsg, 'High');
      }
    } else {
      if (isTestCase) {
        await reporter.updateTestCase(tcId, 'Passed', 'Executed successfully without assertions failing.');
      }
    }
  },

  async afterSession() {
    await reporter.save();
  }
};
