export default class RegisterPresenter {
  constructor(view, model, navigateTo) {
    this.view = view;
    this.model = model;
    this.navigateTo = navigateTo;
  }

  async onRegister({ name, email, password, confirmPassword }) {
    this.view.showLoading();
    if (password !== confirmPassword) {
      this.view.showError('Passwords do not match');
      return;
    }
    this.view.showLoading();
    try {
      await this.model.register(name, email, password);
      this.view.showSuccessModal(
        'Registration Successful',
        'Your account has been created successfully!',
        '/login'
      );
    } catch (error) {
      this.view.showError(error.message || 'An error occurred during registration');
    } finally {
      this.view.hideLoading();
    }
  }
}