const BasePage = require('./base.page.js');

class MainPage extends BasePage {
  get tabHome() { return '~TabHome'; }
  get tabCart() { return '~TabCart'; }
  get tabOrders() { return '~TabOrders'; }
  get tabSettings() { return '~TabSettings'; }
  get tabDashboard() { return '~TabDashboard'; }

  get searchInput() { return '~SearchInput'; }
  get clearSearchButton() { return '~ClearSearch'; }
  get seedCategoryChip() { return '~CategoryChip_Seeds'; }
  get toolCategoryChip() { return '~CategoryChip_Tools'; }

  get salesCountText() { return '~DashboardSalesCount'; }
  get revenueText() { return '~DashboardRevenue'; }

  async navigateTo(tab) {
    if (tab === 'Home') await this.click(this.tabHome);
    else if (tab === 'Cart') await this.click(this.tabCart);
    else if (tab === 'Orders') await this.click(this.tabOrders);
    else if (tab === 'Settings') await this.click(this.tabSettings);
    else if (tab === 'Dashboard') await this.click(this.tabDashboard);
  }

  async search(keyword) {
    await this.setValue(this.searchInput, keyword);
  }
}

module.exports = new MainPage();
