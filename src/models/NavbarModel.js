export default class NavbarModel {
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
  }
}