// src/App.js

import Navbar from './components/Navbar.js';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import PostStoryPage from './pages/PostStoryPage.js';
import DetailStoryPage from './pages/DetailStoryPage.js';
import NotFoundPage from './pages/NotFoundPage.js'; 
import { gsap } from 'gsap';

function getPageTransition(path) {
  if (path === '/login') {
    return { from: { opacity: 0, scale: 0.8 }, to: { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" } };
  } else if (path === '/register') {
    return { from: { opacity: 0, scale: 1.2 }, to: { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" } };
  } else if (path === '/post-story') {
    return { from: { opacity: 0, x: 80 }, to: { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" } };
  } else if (path.startsWith('/stories/')) {
    return { from: { opacity: 0, x: -80 }, to: { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" } };
  }
  return { from: { opacity: 0, y: 40 }, to: { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" } };
}

export function createApp() {
  const routes = {
    '/': HomePage,
    '/login': LoginPage,
    '/register': RegisterPage,
    '/post-story': PostStoryPage,
    '/stories/:id': DetailStoryPage,
  };

  let currentPage = null;
  let navbarInstance = null;

  const mount = (selector) => {
    const appContainer = document.querySelector(selector);
    if (!appContainer) {
      console.error(`No container found for selector: ${selector}`);
      return;
    }

    navbarInstance = Navbar();

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);

    function handleRouteChange() {
      const hash = window.location.hash.slice(1) || '/';
      const path = hash.split('?')[0];
      const oldPage = appContainer.querySelector('#main-content');

      // 1. Tentukan PageComponent dan params terlebih dahulu
      let PageComponent = NotFoundPage;
      let params = {};
      
      const matchedRoute = Object.keys(routes).find(route => {
        const routePattern = route.replace(/:\w+/g, '([^/]+)');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(path);
      });

      if (matchedRoute) {
        PageComponent = routes[matchedRoute];
        const routePattern = matchedRoute.replace(/:\w+/g, '([^/]+)');
        const regex = new RegExp(`^${routePattern}$`);
        const matches = path.match(regex);
        if (matches) {
            const paramNames = matchedRoute.match(/:(\w+)/g)?.map(param => param.slice(1));
            if (paramNames) {
                paramNames.forEach((param, index) => {
                    params[param] = matches[index + 1];
                });
            }
        }
      }

      // 2. Definisikan fungsi untuk merender halaman baru
      function renderNewPage() {
        appContainer.innerHTML = '';
        appContainer.appendChild(navbarInstance);

        try {
          if (currentPage && typeof currentPage.cleanup === 'function') {
            currentPage.cleanup();
          }
          currentPage = new PageComponent(params);
          const pageElement = currentPage.render();

          if (pageElement) {
            pageElement.id = 'main-content';
            pageElement.tabIndex = -1;

            const transition = getPageTransition(path);
            gsap.set(pageElement, transition.from); // Set state awal
            appContainer.appendChild(pageElement);
            gsap.to(pageElement, transition.to); // Animasikan ke state akhir
          }

          if (typeof currentPage.afterRender === 'function') {
            currentPage.afterRender();
          }
        } catch (error) {
          console.error('Error rendering page:', error);
          appContainer.innerHTML += '<div class="p-4 text-red-500">Error loading page</div>';
        }
      }

      // 3. Jalankan animasi dan render
      if (oldPage) {
        gsap.to(oldPage, {
          opacity: 0,
          y: -40,
          duration: 0.4,
          ease: "power2.in",
          onComplete: renderNewPage // Panggil render setelah animasi selesai
        });
      } else {
        renderNewPage(); // Jika tidak ada halaman lama, langsung render
      }
    }
  };

  return { mount };
}

export function navigateTo(path) {
  window.location.hash = path;
}

export const store = {
  state: {
    isLoggedIn: !!localStorage.getItem('token'),
    username: localStorage.getItem('name') || '',
    stories: [],
    currentStory: null,
  },
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  },
  subscribers: [],
  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.state);
  },
  notify() {
    this.subscribers.forEach(callback => callback(this.state));
  },
};

window.navigateTo = navigateTo;
window.store = store;
