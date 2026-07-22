const BasePage = require('./base.page.js');

class ProductPage extends BasePage {
  get productNameText() { return '~ProductDetailName'; }
  get productPriceText() { return '~ProductDetailPrice'; }
  get productStockText() { return '~ProductDetailStock'; }
  get addToCartButton() { return '~AddToCartButton'; }

  get reviewInputField() { return '~ReviewInput'; }
  get ratingSelection() { return '~RatingStar_5'; }
  get submitReviewButton() { return '~SubmitReviewButton'; }

  getCartItemQty(id) { return `~CartItemQty_${id}`; }
  getCartItemRow(id) { return `~CartItemRow_${id}`; }
  getIncreaseQtyBtn(id) { return `~IncreaseQty_${id}`; }
  getDecreaseQtyBtn(id) { return `~DecreaseQty_${id}`; }
  getRemoveQtyBtn(id) { return `~RemoveQty_${id}`; }

  async openProduct(id) {
    await this.click(`~ProductItem_${id}`);
  }

  async addReview(comment) {
    await this.setValue(this.reviewInputField, comment);
    await this.click(this.ratingSelection);
    await this.click(this.submitReviewButton);
  }
}

module.exports = new ProductPage();
