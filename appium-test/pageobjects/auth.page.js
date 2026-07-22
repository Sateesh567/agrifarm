const BasePage = require('./base.page.js');

class AuthPage extends BasePage {
  get emailInput() { return '~EmailInput'; }
  get passwordInput() { return '~PasswordInput'; }
  get roleFarmerRadio() { return '~RoleFarmerRadio'; }
  get roleSellerRadio() { return '~RoleSellerRadio'; }
  get loginButton() { return '~LoginSubmit'; }
  get goToSignUpLink() { return '~GoToSignUp'; }

  get nameInput() { return '~NameInput'; }
  get phoneInput() { return '~PhoneInput'; }
  get addressInput() { return '~AddressInput'; }
  get signUpButton() { return '~SignUpSubmit'; }

  get logoutButton() { return '~LogoutButton'; }
  get profileEmailText() { return '~ProfileEmailText'; }

  async login(email, password) {
    await this.setValue(this.emailInput, email);
    await this.setValue(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async register(name, email, phone, address, password, role) {
    await this.click(this.goToSignUpLink);
    await this.setValue(this.nameInput, name);
    await this.setValue(this.emailInput, email);
    await this.setValue(this.phoneInput, phone);
    await this.setValue(this.addressInput, address);
    await this.setValue(this.passwordInput, password);
    if (role === 'SHOP_OWNER') {
      await this.click(this.roleSellerRadio);
    } else {
      await this.click(this.roleFarmerRadio);
    }
    await this.click(this.signUpButton);
  }

  async logout() {
    await this.click(this.logoutButton);
  }
}

module.exports = new AuthPage();
