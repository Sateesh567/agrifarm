class BasePage {
  async getElement(selector) {
    return $(selector);
  }

  async waitForDisplayed(selector, timeout = 10000) {
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout });
    return el;
  }

  async click(selector) {
    const el = await this.waitForDisplayed(selector);
    await el.click();
  }

  async setValue(selector, value) {
    const el = await this.waitForDisplayed(selector);
    await el.setValue(value);
  }

  async getText(selector) {
    const el = await this.waitForDisplayed(selector);
    return el.getText();
  }

  async isDisplayed(selector) {
    try {
      const el = await $(selector);
      return await el.isDisplayed();
    } catch (err) {
      return false;
    }
  }

  async swipeVertical(fromY, toY, x = 500) {
    await browser.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: fromY },
        { type: 'pointerDown', button: 0 },
        { type: 'pointerMove', duration: 1000, x, y: toY },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
  }
}

module.exports = BasePage;
