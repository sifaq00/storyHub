import LoginModel from '../models/LoginModel.js';
import LoginPresenter from '../presenters/LoginPresenter.js';
import { store, navigateTo } from '../App.js';

export default class LoginPage {
  constructor() {
    this.state = {
      email: '',
      password: '',
      loading: false,
      error: null
    };

    this.presenter = new LoginPresenter(this, new LoginModel(), store, navigateTo);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    this.state[e.target.name] = e.target.value;
  }

  handleSubmit(e) {
    e.preventDefault();
    this.presenter.onLogin(this.state.email, this.state.password);
  }

  showLoading() {
    this.state.loading = true;
    this.state.error = null;
    this.updateView();
  }

  hideLoading() {
    this.state.loading = false;
    this.updateView();
  }

  showError(msg) {
    this.state.error = msg;
    this.state.loading = false;
    this.updateView();
  }

  showSuccessModal(title, message, redirectPath) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
        <div class="p-8 text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-6">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">${title}</h3>
          <p class="text-gray-600 mb-8">${message}</p>
          <div class="flex justify-center">
            <button id="modal-continue" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Continue
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#modal-continue').addEventListener('click', () => {
      document.body.removeChild(modal);
      navigateTo(redirectPath);
    });
  }

  updateView() {
  const oldMain = document.getElementById('main-content');
  const newMain = this.render();
  if (oldMain && newMain) {
    oldMain.replaceWith(newMain);
  }
}

  render() {
    const { email, password, loading, error } = this.state;

    const page = document.createElement('main');
    page.id = 'main-content';
    page.tabIndex = -1;
    page.className = 'flex flex-col min-h-screen bg-gray-50';

    page.innerHTML = `
      <div class="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div class="w-full max-w-md space-y-8">
          <div class="text-center">
            <div class="mx-auto h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center shadow-lg mb-4">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p class="mt-2 text-gray-500">
              Sign in to access your StoryHub account
            </p>
          </div>
          ${error ? `
            <div class="rounded-lg bg-red-50 p-4 border border-red-100 animate-shake">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">${error}</h3>
                </div>
              </div>
            </div>
          ` : ''}
          <div class="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-100/50 backdrop-blur-sm bg-white/70">
            <form class="space-y-6" id="login-form">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    value="${email}"
                    class="py-3 pl-10 block w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label for="password" class="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div class="text-sm">
                    <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                    value="${password}"
                    class="py-3 pl-10 block w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div class="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div>
                <button
                  type="submit"
                  class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden"
                  ${loading ? 'disabled' : ''}
                >
                  <span class="${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200">
                    Sign in
                  </span>
                  ${loading ? `
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="flex space-x-2">
                        <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                        <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                        <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                      </div>
                    </div>
                  ` : ''}
                </button>
              </div>
            </form>
            <div class="mt-8">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>
              <div class="mt-6">
                <a
                  href="#/register"
                  data-navigate
                  class="w-full flex justify-center py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Create new account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const form = page.querySelector('#login-form');
    form.addEventListener('submit', this.handleSubmit);

    const inputs = page.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('change', this.handleInputChange);
      input.addEventListener('input', this.handleInputChange);
    });

    page.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('href').substring(1);
        navigateTo(path);
      });
    });

    return page;
  }
}