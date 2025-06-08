import { createApp } from './App.js';
import './style.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const app = createApp();
app.mount('#app');

AOS.init();

//if ('serviceWorker' in navigator && 'PushManager' in window) {
//  window.addEventListener('load', () => {
    //navigator.serviceWorker
     // .register('/sw.js')
     // .then(() => console.log('✅ Service Worker registered!'))
     // .catch((err) => console.error('❌ SW registration failed:', err));
  //});
//}
