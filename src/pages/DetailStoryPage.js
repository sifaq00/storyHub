import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";
import { navigateTo } from "../App.js";
import DetailStoryModel from '../models/DetailStoryModel.js';
import DetailStoryPresenter from '../presenters/DetailStoryPresenter.js';
  import LoadingSpinner from "../components/LoadingSpinner.js";

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

export default class DetailStoryPage {
  constructor(params) {
    this.storyId = params.id;
    this.story = null;
    this.locationDetails = {
      address: "Loading address...",
      coordinates: ""
    };
    this.map = null;
    this.tileLayers = {};
    this.isLoading = true; 
    this.error = null; 
    this.dataFromCache = false;

    this.presenter = new DetailStoryPresenter(this, new DetailStoryModel());
  }

  showLoading() {
        this.isLoading = true;
        this.error = null;
        this.updateView();
      }
    
      hideLoading() {
        this.isLoading = false;
        this.updateView();
      }
    
      showError(errorMessage) {
        this.isLoading = false;
        this.error = errorMessage;
        this.dataFromCache = errorMessage.toLowerCase().includes('offline');
        this.updateView();
      }

  updateView() {
        const oldMain = document.getElementById('main-content');
        const newMain = this.render();
        if (oldMain && newMain) {
          oldMain.parentNode.replaceChild(newMain, oldMain);
          this.afterRenderLogic(); 
        } else if (newMain && !oldMain) {
            const appContainer = document.getElementById('app');
            if (appContainer) {
                const currentMain = appContainer.querySelector('#main-content');
                if (currentMain) currentMain.remove();
                appContainer.appendChild(newMain);
                this.afterRenderLogic();
            }
        }
      }

  showStory(story, locationDetails, fromCache = false) {
        this.story = story;
        this.locationDetails = locationDetails;
        this.isLoading = false;
        this.error = null;
        this.dataFromCache = fromCache;
        this.updateView();
      }

  showToast(message, type = "info") { 
        let toastContainer = document.getElementById('toast-container-detail'); 
        if (!toastContainer) {
          toastContainer = document.createElement('div');
          toastContainer.id = 'toast-container-detail';
          toastContainer.className = 'fixed bottom-5 right-5 z-[9999] space-y-3 w-auto max-w-md';
          document.body.appendChild(toastContainer);
        }
    
        const toast = document.createElement('div');
        const colors = {
          success: 'bg-emerald-600', error: 'bg-rose-600', warning: 'bg-amber-500', info: 'bg-blue-600'
        };
        const icons = {
          success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle'
        }
    
        toast.className = `text-white px-4 py-3 rounded-lg shadow-xl flex items-center justify-between transform transition-all duration-300 ${colors[type]} animate-fadeInUp`;
        toast.innerHTML = `
          <div class="flex items-center">
            <i class="fas ${icons[type]} mr-3 text-lg"></i>
            <span class="text-sm">${message}</span>
          </div>
          <button class="ml-4 text-white/80 hover:text-white text-lg"><i class="fas fa-times"></i></button>
        `;
        toast.querySelector('button').addEventListener('click', () => {
          toast.classList.remove('animate-fadeInUp');
          toast.classList.add('opacity-0', 'scale-95');
          setTimeout(() => toast.remove(), 300);
        });
        toastContainer.appendChild(toast);
        setTimeout(() => {
          toast.classList.remove('animate-fadeInUp');
          toast.classList.add('opacity-0', 'scale-95');
          setTimeout(() => {
            if (toast.parentNode === toastContainer) toast.remove();
            if (toastContainer.children.length === 0) toastContainer.remove();
          }, 300);
        }, 5000);
      }

  initMap(lat, lon) {
        if (this.map) { 
            this.map.remove();
            this.map = null;
        }

        const mapElement = document.getElementById("story-map");
        if (!mapElement) {
            return; 
        }
        
      
        if (mapElement.offsetParent === null) {
            
            return;
        }


        this.map = L.map("story-map", {
          zoomControl: true, scrollWheelZoom: true, doubleClickZoom: true,
          touchZoom: true, zoomSnap: 0.5, zoomDelta: 0.5,
          fadeAnimation: true, markerZoomAnimation: true
        }).setView([lat, lon], 15);

        const layers = [
          { name: '<i class="fas fa-map-marked-alt mr-1"></i> Street', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', options: { attribution: '&copy; OSM', maxZoom: 19, subdomains: ['a', 'b', 'c']}},
          { name: '<i class="fas fa-satellite-dish mr-1"></i> Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', options: { attribution: '&copy; Esri', maxZoom: 19 }},
          { name: '<i class="fas fa-moon mr-1"></i> Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', options: { attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }}
        ];

        this.tileLayers = {};
        layers.forEach(layer => {
          this.tileLayers[layer.name] = L.tileLayer(layer.url, layer.options);
        });

        this.tileLayers[layers[0].name].addTo(this.map);
        L.control.layers(this.tileLayers, null, { collapsed: true, position: 'topright' }).addTo(this.map);

        L.marker([lat, lon], { icon: customIcon })
          .addTo(this.map)
          .bindPopup(`<div class="popup-content p-1"><p class="text-xs flex items-start"><i class="fas fa-map-marker-alt text-blue-500 mr-1 mt-0.5"></i>${this.locationDetails.address || 'Lokasi cerita'}</p></div>`)
          .openPopup();
        L.control.scale({ position: 'bottomleft' }).addTo(this.map);
        
        setTimeout(() => {
            if (this.map) this.map.invalidateSize();
        }, 100);
      }

  render() {
    const container = document.createElement("main");
    container.id = "main-content";
    container.tabIndex = -1;
    container.className = "max-w-5xl mx-auto p-4 md:p-6 lg:p-8";

    if (this.isLoading) {
            container.innerHTML = `<div class="min-h-[calc(100vh-200px)] flex items-center justify-center">${LoadingSpinner({size: 'lg'}).outerHTML}</div>`;
            return container;
        }
    
    if (this.error) {
            container.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center p-6 min-h-[calc(100vh-200px)]">
              <div class="bg-red-50 text-red-700 p-6 rounded-xl shadow-md border border-red-200 max-w-lg w-full">
                <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                <h2 class="text-xl font-semibold mb-2">Gagal Memuat Detail Cerita</h2>
                <p class="mb-4">${this.error}</p>
                <a href="#/" data-navigate class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Kembali ke Beranda</a>
              </div>
            </div>`;
            return container;
        }

    if (!this.story) { 
            container.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center p-6 min-h-[calc(100vh-200px)]">
              <div class="bg-yellow-50 text-yellow-700 p-6 rounded-xl shadow-md border border-yellow-200 max-w-lg w-full">
                <i class="fas fa-question-circle text-3xl mb-3"></i>
                <h2 class="text-xl font-semibold mb-2">Cerita Tidak Ditemukan</h2>
                <p class="mb-4">Detail untuk cerita ini tidak dapat ditemukan.</p>
                <a href="#/" data-navigate class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Kembali ke Beranda</a>
              </div>
            </div>`;
            return container;
        }

    const imageOnErrorScript = `this.onerror=null; this.src='https://placehold.co/800x600/e2e8f0/94a3b8?text=Gambar+Rusak'; this.classList.add('object-contain');`;

    container.innerHTML = `
      <style>
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-fade-out {
          animation: fade-out 0.3s ease-out forwards;
        }
        .popup-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        #story-map {
          z-index: 0;
        }
        .leaflet-control-layers-toggle {
          background-image: none !important;
          width: 40px !important;
          height: 40px !important;
        }
        .leaflet-control-layers-toggle:after {
          content: "\\f0c9";
          font-family: "Font Awesome 5 Free";
          font-weight: 900;
          font-size: 18px;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      </style>

      <div class="mb-6 sm:mb-8">
            <a href="#/" data-navigate class="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-blue-600 hover:text-blue-800 border border-gray-200 hover:border-blue-300 group" id="back-to-stories-btn">
              <i class="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
              Back to Stories
            </a>
      </div>

      ${this.dataFromCache ? `
          <div class="mb-6 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-lg shadow-sm" role="alert">
            <div class="flex items-center">
              <i class="fas fa-info-circle mr-2"></i>
              <p class="text-sm">Anda sedang melihat data detail cerita yang disimpan secara offline.</p>
            </div>
          </div>
          ` : ''}

      <div class="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-100">
        <div class="relative group aspect-video sm:aspect-[2/1] lg:aspect-[2.5/1] bg-gray-200">
          <img 
                src="${this.story?.photoUrl || 'https://placehold.co/800x600/e2e8f0/94a3b8?text=Tidak+Ada+Gambar'}" 
                alt="Foto untuk cerita ${this.story?.name || 'Tanpa Judul'}" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onerror="${imageOnErrorScript}"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div class="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <span class="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-gray-800 shadow-md flex items-center">
                  <i class="far fa-calendar-alt text-blue-500 mr-2"></i>
                  ${new Date(this.story?.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div class="p-5 sm:p-6 md:p-8 lg:p-10">
              <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4 sm:mb-6 gap-3">
                <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  ${this.story?.name || 'Cerita Tanpa Judul'}
                </h1>
                <div class="flex-shrink-0 mt-1 md:mt-0">
                  <span class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium flex items-center shadow-sm">
                    <i class="fas fa-user-circle mr-2"></i>
                    ${this.story?.name ? this.story.name.split(' ')[0] : 'Anonim'}
                  </span>
                </div>
              </div>
          
          <div class="prose prose-lg max-w-none text-gray-700 mb-6 sm:mb-8 leading-relaxed">
              <p>${this.story?.description || 'Deskripsi tidak tersedia.'}</p>
          </div>
          
          ${this.story?.lat && this.story?.lon ? `
                <section class="mt-8 sm:mt-10 pt-6 border-t border-gray-200">
                  <div class="flex items-center mb-4 sm:mb-6">
                    <i class="fas fa-map-marked-alt text-2xl text-blue-500 mr-3"></i>
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Detail Lokasi</h2>
                  </div>
                  
                  <div id="story-map" class="h-72 sm:h-80 md:h-96 w-full mb-4 sm:mb-6"></div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div class="flex items-center mb-2 text-gray-700">
                        <i class="fas fa-globe-americas text-blue-500 mr-2 text-base"></i>
                        <h3 class="font-semibold">Koordinat</h3>
                      </div>
                      <p class="bg-white p-3 rounded-lg border border-gray-200 font-mono text-gray-600">
                        ${this.locationDetails.coordinates || 'Tidak tersedia'}
                      </p>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div class="flex items-center mb-2 text-gray-700">
                        <i class="fas fa-map-pin text-green-500 mr-2 text-base"></i>
                        <h3 class="font-semibold">Alamat Perkiraan</h3>
                      </div>
                      <p class="bg-white p-3 rounded-lg border border-gray-200 text-gray-600 leading-normal">
                        ${this.locationDetails.address || 'Tidak tersedia'}
                      </p>
                    </div>
                  </div>
                </section>
              ` : `
            <div class="mt-8 sm:mt-10 pt-6 border-t border-gray-200">
                  <div class="p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-600">
                    <div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full text-blue-500 mb-3 sm:mb-4">
                      <i class="fas fa-map-marker-slash text-xl sm:text-2xl"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-semibold text-gray-700 mb-1">Tidak Ada Data Lokasi</h3>
                    <p class="text-sm">Cerita ini tidak menyertakan informasi lokasi.</p>
                  </div>
                </div>
          `}
        </div>
      </div>
    `;

    return container;
  }

  afterRenderLogic() { 
        if (this.story && this.story.lat && this.story.lon) {
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => { 
                    this.initMap(this.story.lat, this.story.lon);
                });
            });
        }

        const backBtn = document.getElementById('back-to-stories-btn');
        if (backBtn) {
          backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
              gsap.to(mainContent, {
                opacity: 0,
                x: 80, 
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                  navigateTo('/');
                }
              });
            } else {
              navigateTo('/');
            }
          });
        }
         document.querySelectorAll('[data-navigate]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = link.getAttribute('href').substring(1);
                navigateTo(path);
            });
        });
      }

      async afterRender() { 
        this.showLoading(); 
        await this.presenter.loadStory(this.storyId);
      }
    }