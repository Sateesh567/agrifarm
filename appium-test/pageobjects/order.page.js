const BasePage = require('./base.page.js');

class OrderPage extends BasePage {
  get checkoutAddress() { return '~CheckoutAddress'; }
  get checkoutNotes() { return '~CheckoutNotes'; }
  get paymentOptionCOD() { return '~PaymentOption_COD'; }
  get submitOrderButton() { return '~SubmitOrderButton'; }

  get orderListContainer() { return '~OrderListContainer'; }
  get orderTrackingStateText() { return '~OrderTrackingState'; }

  get updateStatusButton() { return '~UpdateStatusButton'; }
  get statusConfirmedOption() { return '~StatusOption_CONFIRMED'; }

  async placeOrder(address, notes) {
    await this.setValue(this.checkoutAddress, address);
    await this.setValue(this.checkoutNotes, notes);
    await this.click(this.paymentOptionCOD);
    await this.click(this.submitOrderButton);
  }

  async selectOrder(orderId) {
    await this.click(`~OrderItem_${orderId}`);
  }

  async updateSellerOrderStatus(orderId) {
    await this.click(`~SellerOrderItem_${orderId}`);
    await this.click(this.updateStatusButton);
    await this.click(this.statusConfirmedOption);
  }
}

module.exports = new OrderPage();
