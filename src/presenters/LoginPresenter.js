export default class LoginPresenter {
  constructor(view, model, store, navigateTo) {
    this.view = view;
    this.model = model;
    this.store = store;
    this.navigateTo = navigateTo;
  }

  async onLogin(email, password) {
    this.view.showLoading();
    try {
      const data = await this.model.login(email, password);
      localStorage.setItem('token', data.loginResult.token);
      localStorage.setItem('name', data.loginResult.name);
      this.store.setState({
        isLoggedIn: true,
        username: data.loginResult.name,
        stories: []
      });
      this.view.showSuccessModal(
        'Login Successful',
        'You have successfully logged in!',
        '/'
      );
    } catch (error) {
      this.view.showError(error.message || 'An error occurred during login');
    } finally {
      this.view.hideLoading();
    }
  }
}