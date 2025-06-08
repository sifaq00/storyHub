import { navigateTo, store } from '../App.js';
import NavbarPresenter from '../presenters/NavbarPresenter.js';
import PushPresenter from '../presenters/PushPresenter.js';
import PushModel from '../models/PushModel.js';
import NavbarModel from '../models/NavbarModel.js';

export default function Navbar() {
  const header = document.createElement('header');
  header.className = 'w-full bg-white transition-all duration-300 sticky top-0 z-50'; // default: putih tanpa shadow/blur

  const skipLink = document.createElement('a');
  skipLink.href = "#main-content";
  skipLink.className = "skip-to-content absolute left-2 top-2 z-[9999] px-4 py-2 bg-blue-700 text-white rounded focus:translate-y-0 focus:opacity-100 opacity-0 -translate-y-4 transition-all duration-200";
  skipLink.textContent = "Skip to Content";
  skipLink.tabIndex = 0;
  header.appendChild(skipLink);

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  });

  const navbar = document.createElement('nav');
  navbar.className = 'w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3';

  let presenter = null;
  let pushPresenter = null;
  let mobileMenuOpen = false;

  const mobileMenu = document.createElement('div');
  mobileMenu.id = 'mobile-menu';
  mobileMenu.className = `md:hidden fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg border-l border-gray-100 z-40 transition-all duration-300 ease-in-out transform translate-x-full`;
  mobileMenu.style.pointerEvents = 'none';

  function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-5 right-5 z-50 space-y-3 w-80';
      document.body.appendChild(toastContainer);
    } else {
      document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-emerald-500',
      error: 'bg-rose-500',
      warning: 'bg-amber-500',
      info: 'bg-blue-500'
    };

    toast.className = `text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between transform transition-all duration-300 ${colors[type]}`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-3"></i>
        <span>${message}</span>
      </div>
      <button class="ml-4 text-white hover:text-white/80">
        <i class="fas fa-times"></i>
      </button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      toast.classList.add('opacity-0', 'scale-95');
      setTimeout(() => toast.remove(), 300);
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'scale-95');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  function showLogoutModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 mt-24 transform scale-95 opacity-0 transition-all duration-300" id="logout-modal-content">
        <div class="p-6 text-center">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Are you sure you want to logout?</h3>
          <div class="flex justify-center space-x-4 mt-6">
            <button id="cancel-logout" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button id="confirm-logout" class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition flex items-center justify-center gap-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.classList.remove('opacity-0');
      modal.classList.add('opacity-100');
      const content = modal.querySelector('#logout-modal-content');
      content.classList.remove('scale-95', 'opacity-0');
      content.classList.add('scale-100', 'opacity-100');
    }, 10);

    function closeModal() {
      modal.classList.remove('opacity-100');
      modal.classList.add('opacity-0');
      const content = modal.querySelector('#logout-modal-content');
      content.classList.remove('scale-100', 'opacity-100');
      content.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
      }, 300);
    }

    modal.querySelector('#cancel-logout').addEventListener('click', closeModal);

    modal.querySelector('#confirm-logout').addEventListener('click', () => {
      presenter.onLogout();
      closeModal();
    });

    modal.addEventListener('mousedown', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function renderMobileMenu(isLoggedIn, username) {
    mobileMenu.innerHTML = `
      <div class="h-full flex flex-col">
        <div class="flex-1 overflow-y-auto py-4 px-4">
          ${isLoggedIn ? `
            <div class="flex items-center space-x-3 mb-4 p-3 bg-blue-50 rounded-lg">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">
                  ${username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-500">Welcome back</p>
                <p class="font-medium text-gray-900">${username}</p>
              </div>
            </div>
          ` : ''}
          
          <nav class="space-y-1">
            <a href="#/" data-navigate class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 group transition-colors">
              <i class="fas fa-home text-lg w-8 text-gray-500 group-hover:text-blue-600 transition-colors"></i>
              <span class="ml-2 font-medium">Home</span>
            </a>
            
            ${isLoggedIn ? `
              <a href="#/post-story" data-navigate class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 group transition-colors">
                <i class="fas fa-plus-circle text-lg w-8 text-gray-500 group-hover:text-blue-600 transition-colors"></i>
                <span class="ml-2 font-medium">New Story</span>
              </a>
            ` : ''}
            
            ${isLoggedIn ? `
              <div class="pt-2 mt-2 border-t border-gray-100">
                <button id="subscribe-push-mobile" class="w-full flex items-center px-3 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <i class="fas fa-bell text-lg w-8"></i>
                  <span class="ml-2 font-medium">Enable Notifications</span>
                </button>
                <button id="unsubscribe-push-mobile" class="w-full flex items-center px-3 py-2.5 rounded-lg text-white bg-gray-500 hover:bg-gray-600 mt-1 transition-colors">
                  <i class="fas fa-bell-slash text-lg w-8"></i>
                  <span class="ml-2 font-medium">Disable Notifications</span>
                </button>
              </div>
            ` : `
              <a href="#/login" data-navigate class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 group transition-colors">
                <i class="fas fa-sign-in-alt text-lg w-8 text-gray-500 group-hover:text-blue-600 transition-colors"></i>
                <span class="ml-2 font-medium">Login</span>
              </a>
              <a href="#/register" data-navigate class="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 group transition-colors">
                <i class="fas fa-user-plus text-lg w-8 text-gray-500 group-hover:text-blue-600 transition-colors"></i>
                <span class="ml-2 font-medium">Register</span>
              </a>
            `}
          </nav>
        </div>
        
        ${isLoggedIn ? `
          <div class="p-3 border-t border-gray-100">
            <button id="logout-btn-mobile" class="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-colors">
              <i class="fas fa-sign-out-alt mr-2"></i>
              <span class="font-medium">Logout</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    mobileMenu.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('href').substring(1);
        presenter.onNavigate(path);
        closeMobileMenu();
      });
    });

    const logoutBtnMobile = mobileMenu.querySelector('#logout-btn-mobile');
    if (logoutBtnMobile) {
      logoutBtnMobile.addEventListener('click', () => {
        closeMobileMenu();
        showLogoutModal();
      });
    }

    if (isLoggedIn) {
      mobileMenu.querySelector('#subscribe-push-mobile')?.addEventListener('click', () => {
        pushPresenter.subscribe();
      });
      mobileMenu.querySelector('#unsubscribe-push-mobile')?.addEventListener('click', () => {
        pushPresenter.unsubscribe();
      });
    }
  }

  function render() {
    const { isLoggedIn, username } = store.state;

    navbar.innerHTML = `
      <div class="w-full flex justify-between h-10 items-center">
        <div class="flex items-center justify-between w-full md:w-auto">
          <a href="#/" data-navigate class="flex items-center space-x-2">
            <span class="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
              StoryHub
            </span>
          </a>
          <div class="md:hidden flex items-center">
            <button id="mobile-menu-button" aria-label="Open menu" class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none transition-all">
              <span class="sr-only">Open main menu</span>
              <span class="relative w-6 h-6 block ">
                <span class="absolute left-0 top-1 w-6 h-0.5 bg-current rounded transition-all duration-300 origin-left hamburger-line-1${mobileMenuOpen ? ' rotate-45 top-3' : ''}"></span>
                <span class="absolute left-0 top-3 w-6 h-0.5 bg-current rounded transition-all duration-300 hamburger-line-2${mobileMenuOpen ? ' opacity-0' : ''}"></span>
                <span class="absolute left-0 top-5 w-6 h-0.5 bg-current rounded transition-all duration-300 origin-left hamburger-line-3${mobileMenuOpen ? ' -rotate-45 top-3' : ''}"></span>
              </span>
            </button>
          </div>
        </div>

        <div class="hidden md:flex items-center space-x-8">
          <div class="flex items-center space-x-6">
            <a href="#/" data-navigate class="relative group px-3 py-2 rounded-md text-sm font-medium transition-all">
              <div class="flex items-center gap-2 text-gray-700 group-hover:text-blue-600">
                <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </div>
              <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            ${isLoggedIn ? `
              <a href="#/post-story" data-navigate class="relative group px-3 py-2 rounded-md text-sm font-medium transition-all">
                <div class="flex items-center gap-2 text-gray-700 group-hover:text-blue-600">
                  <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New Story</span>
                </div>
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ` : ''}
          </div>
          <div class="flex items-center space-x-4">
            ${isLoggedIn ? `
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-600">
                  Welcome, <span class="font-semibold text-blue-700">${username}</span>
                </span>
                <button id="subscribe-push" class="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                  <i class="fas fa-bell text-xs"></i>
                  <span>Enable</span>
                </button>
                <button id="unsubscribe-push" class="flex items-center gap-1 px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-xs">
                  <i class="fas fa-bell-slash text-xs"></i>
                  <span>Disable</span>
                </button>
                <button id="logout-btn" class="flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm">
                  <i class="fas fa-sign-out-alt text-sm"></i>
                  <span>Logout</span>
                </button>
              </div>
            ` : `
              <a href="#/login" data-navigate class="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md">
                <i class="fas fa-sign-in-alt text-sm"></i>
                <span>Login</span>
              </a>
              <a href="#/register" data-navigate class="hidden sm:flex items-center justify-center gap-2 border border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm">
                <i class="fas fa-user-plus text-sm"></i>
                <span>Register</span>
              </a>
            `}
          </div>
        </div>
      </div>
    `;

    navbar.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = link.getAttribute('href').substring(1);
        presenter.onNavigate(path);
        closeMobileMenu();
      });
    });

    const mobileMenuButton = navbar.querySelector('#mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.onclick = () => {
        if (mobileMenuOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      };
    }

    const logoutBtn = navbar.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', showLogoutModal);
    }

    if (isLoggedIn) {
      navbar.querySelector('#subscribe-push')?.addEventListener('click', () => {
        pushPresenter.subscribe();
      });
      navbar.querySelector('#unsubscribe-push')?.addEventListener('click', () => {
        pushPresenter.unsubscribe();
      });
    }

    renderMobileMenu(isLoggedIn, username);

    if (mobileMenuOpen) {
      mobileMenu.classList.remove('translate-x-full');
      mobileMenu.classList.add('translate-x-0');
      mobileMenu.style.pointerEvents = 'auto';
      if (!document.body.contains(mobileMenu)) {
        document.body.appendChild(mobileMenu);
      }
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutsideMobileMenu);
      }, 10);
    } else {
      mobileMenu.classList.add('translate-x-full');
      mobileMenu.classList.remove('translate-x-0');
      mobileMenu.style.pointerEvents = 'none';
      document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
    }

    header.innerHTML = '';
    header.appendChild(skipLink);
    header.appendChild(navbar);

    return header;
  }

  function openMobileMenu() {
    mobileMenuOpen = true;
    render();
  }

  function closeMobileMenu() {
    if (mobileMenuOpen) {
      mobileMenuOpen = false;
      render();
    }
  }

  function handleClickOutsideMobileMenu(e) {
    if (
      mobileMenuOpen &&
      !mobileMenu.contains(e.target) &&
      !navbar.contains(e.target)
    ) {
      closeMobileMenu();
    }
  }

  function handleScroll() {
    if (window.scrollY > 10) {
      header.className = 'w-full bg-white/80 backdrop-blur shadow-sm transition-all duration-300 sticky top-0 z-50';
    } else {
      header.className = 'w-full bg-white transition-all duration-300 sticky top-0 z-50';
    }
  }
  window.addEventListener('scroll', handleScroll);


  store.subscribe(() => {
    render();
  });

  presenter = new NavbarPresenter({ showLogoutModal }, store, navigateTo, new NavbarModel());
  pushPresenter = new PushPresenter({ showToast }, new PushModel());

  if (!document.body.contains(mobileMenu)) {
    document.body.appendChild(mobileMenu);
  }

  setTimeout(handleScroll, 0);

  return render();
}