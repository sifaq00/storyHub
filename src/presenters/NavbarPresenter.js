import NavbarModel from '../models/NavbarModel.js';

export default class NavbarPresenter {
  constructor(view, store, navigateTo, model = new NavbarModel()) {
    this.view = view;
    this.store = store;
    this.navigateTo = navigateTo;
    this.model = model;
  }

  onNavigate(path) {
    this.navigateTo(path);
  }

  onLogout() {
    this.model.logout();
    this.store.setState({ isLoggedIn: false, username: '', stories: [] });
    this.navigateTo('/login');
  }
}