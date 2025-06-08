import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { navigateTo } from '../App.js';
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import '@fortawesome/fontawesome-free/css/all.min.css';
import PostStoryModel from '../models/PostStoryModel.js';
import PostStoryPresenter from '../presenters/PostStoryPresenter.js';

export default class PostStoryPage {
  constructor() {
    this.state = {
      description: '',
      imageFile: null,
      imageUrl: '',
      lat: null,
      lon: null,
    };

    this.cameraStream = null;
    this.videoElement = null;
    this.map = null;
    this.marker = null;
    this.currentFacingMode = 'environment';

    this.presenter = new PostStoryPresenter(this, new PostStoryModel(), navigateTo);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUseCamera = this.handleUseCamera.bind(this);
    this.handleUseLocation = this.handleUseLocation.bind(this);
    this.initMap = this.initMap.bind(this);
    this.stopCameraStream = this.stopCameraStream.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.showToast = this.showToast.bind(this);
    this.updateCoordinatesDisplay = this.updateCoordinatesDisplay.bind(this);
    this.removePreview = this.removePreview.bind(this);
    this.flipCamera = this.flipCamera.bind(this);
  }

  cleanup() {
    this.stopCameraStream();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  focusDescription() {
    const desc = document.getElementById('description');
    if (desc) desc.focus();
  }

  setSubmitLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Mengunggah...';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Kirim';
    }
  }

  stopCameraStream() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
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

  updateCoordinatesDisplay() {
    const coordinatesDisplay = document.getElementById('coordinatesDisplay');
    if (coordinatesDisplay) {
      coordinatesDisplay.textContent = this.state.lat && this.state.lon 
        ? `Lokasi dipilih: ${this.state.lat.toFixed(4)}, ${this.state.lon.toFixed(4)}` 
        : 'Belum ada lokasi dipilih';
    }
  }

  handleInputChange(e) {
    this.state.description = e.target.value;
    const counter = document.getElementById('char-counter');
    if (counter) {
      counter.textContent = `${e.target.value.length}/500`;
      if (e.target.value.length > 500) {
        counter.classList.add('text-rose-500');
      } else {
        counter.classList.remove('text-rose-500');
      }
    }
  }

  handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Ukuran file terlalu besar (maksimal 1MB)', 'error');
        return;
      }
      
      this.state.imageFile = file;
      this.state.imageUrl = '';
      const preview = document.getElementById('preview');
      const previewContainer = document.getElementById('previewContainer');
      const fileNameDisplay = document.getElementById('fileName');
      
      preview.src = URL.createObjectURL(file);
      previewContainer.classList.remove('hidden');
      if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
      }
      this.stopCameraStream();
    }
  }

  flipCamera() {
    this.stopCameraStream();
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    
    const container = document.getElementById('videoContainer');
    container.innerHTML = '<p class="text-gray-500 text-center py-8"><i class="fas fa-spinner fa-spin mr-2"></i>Menyiapkan kamera...</p>';
    
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: this.currentFacingMode 
      } 
    })
    .then((stream) => {
      this.cameraStream = stream;
      
      const video = document.createElement('video');
      video.className = 'w-full h-auto max-h-96 rounded-xl shadow-md';
      this.videoElement = video;
      video.srcObject = stream;
      video.play();
      
      container.innerHTML = '';
      container.appendChild(video);
      
      const controls = document.createElement('div');
      controls.className = 'flex justify-center gap-4 mt-4';
      
      const captureBtn = document.createElement('button');
      captureBtn.type = 'button';
      captureBtn.innerHTML = '<i class="fas fa-camera mr-2"></i> Capture';
      captureBtn.className = 'px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center';
      
      const flipBtn = document.createElement('button');
      flipBtn.type = 'button';
      flipBtn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i> Flip';
      flipBtn.className = 'px-6 py-3 bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center';
      
      flipBtn.addEventListener('click', this.flipCamera);
      
      captureBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        document.getElementById('preview').src = imageDataUrl;
        document.getElementById('previewContainer').classList.remove('hidden');
        this.state.imageUrl = imageDataUrl;
        this.state.imageFile = null;
        
        this.stopCameraStream();
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Klik tombol kamera untuk mengambil foto baru.</p>';
        this.showToast('Foto berhasil diambil', 'success');
      });

      controls.appendChild(captureBtn);
      controls.appendChild(flipBtn);
      container.appendChild(controls);
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
      container.innerHTML = '<p class="text-red-500 text-center py-8">Gagal mengakses kamera</p>';
      this.showToast('Tidak dapat mengakses kamera. Pastikan izin diberikan.', 'error');
    });
  }

  handleUseCamera() {
    this.stopCameraStream();
    this.currentFacingMode = 'environment';
    this.flipCamera();
  }

  handleUseLocation() {
    if (!navigator.geolocation) {
      this.showToast('Geolocation tidak didukung di browser Anda', 'error');
      return;
    }
    
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
      locationBtn.disabled = true;
      locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Mendeteksi...';
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.state.lat = latitude;
        this.state.lon = longitude;
        
        if (this.map) {
          this.map.flyTo([latitude, longitude], 15, {
            duration: 1,
            easeLinearity: 0.25
          });
          
          if (this.marker) this.map.removeLayer(this.marker);
          this.marker = L.marker([latitude, longitude], {
            icon: L.divIcon({
              className: 'location-marker',
              html: `<div class="relative">
                <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                <div class="relative inline-flex rounded-full h-10 w-10 bg-red-500 text-white items-center justify-center">
                  <i class="fas fa-location-arrow"></i>
                </div>
                <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-2 py-1 rounded-md shadow-md text-xs whitespace-nowrap">
                  Lokasi Anda
                </div>
              </div>`,
              iconSize: [40, 50],
              iconAnchor: [20, 50]
            }),
            riseOnHover: true
          })
          .addTo(this.map)
          .bindPopup('Lokasi Anda saat ini', {
            className: 'modern-popup',
            offset: [0, -20],
            closeButton: false
          })
          .openPopup();
        }
        
        if (locationBtn) {
          locationBtn.disabled = false;
          locationBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Lokasi Terdeteksi';
          setTimeout(() => {
            locationBtn.innerHTML = '<i class="fas fa-location-arrow mr-2"></i> Gunakan Lokasi Saat Ini';
          }, 3000);
        }
        
        this.updateCoordinatesDisplay();
        this.showToast('Lokasi berhasil dideteksi', 'success');
      },
      (error) => {
        console.error('Error getting location:', error);
        this.showToast(`Gagal mendapatkan lokasi: ${error.message}`, 'error');
        
        if (locationBtn) {
          locationBtn.disabled = false;
          locationBtn.innerHTML = '<i class="fas fa-location-arrow mr-2"></i> Gunakan Lokasi Saat Ini';
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  removePreview() {
    this.state.imageFile = null;
    this.state.imageUrl = '';
    document.getElementById('previewContainer').classList.add('hidden');
    document.getElementById('fileName').textContent = '';
    this.showToast('Gambar dihapus', 'info');
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.presenter.onSubmit({ ...this.state });
  }

  initMap() {
    const loadingTile = (color1, color2) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 256, 256);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading...', 128, 128);
      
      return canvas.toDataURL();
    };

    this.map = L.map('map', {
      center: [-6.2, 106.8],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      zoomAnimation: true,
      preferCanvas: true,
      renderer: L.canvas(),
      scrollWheelZoom: 'center',
      boxZoom: false,
      keyboard: false,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 1500,
      worldCopyJump: true
    }).setView([-6.2, 106.8], 13);

    L.control.zoom({
      position: 'topright',
      zoomInTitle: 'Zoom in',
      zoomOutTitle: 'Zoom out',
      zoomInText: '<i class="fas fa-plus"></i>',
      zoomOutText: '<i class="fas fa-minus"></i>'
    }).addTo(this.map);

    const baseLayers = {};
    const tileLayers = [
      {
        name: "<i class='fas fa-map text-blue-500 mr-1'></i> Street Map",
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          detectRetina: true,
          crossOrigin: true,
          loadingBgUrl: loadingTile('#3498db', '#2980b9')
        }
      },
      {
        name: "<i class='fas fa-satellite text-green-500 mr-1'></i> Satellite",
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        options: {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 19,
          detectRetina: true,
          loadingBgUrl: loadingTile('#2ecc71', '#27ae60')
        }
      },
      {
        name: "<i class='fas fa-compass text-yellow-950 mr-1'></i> Topographic",
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        options: {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17,
          subdomains: ['a', 'b', 'c'],
          detectRetina: true,
          loadingBgUrl: loadingTile('#A52A2A', '#800000')
        }
      },
      {
        name: "<i class='fas fa-moon text-gray-700 mr-1'></i> Dark Mode",
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: ['a', 'b', 'c', 'd'],
          maxZoom: 20,
          detectRetina: true,
          loadingBgUrl: loadingTile('#2c3e50', '#34495e')
        }
      },
      {
        name: "<i class='fas fa-bicycle text-purple-500 mr-1'></i> Cycle Map",
        url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        options: {
          attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases">CyclOSM</a>',
          maxZoom: 20,
          subdomains: ['a', 'b', 'c'],
          detectRetina: true,
          loadingBgUrl: loadingTile('#9b59b6', '#8e44ad')
        }
      }
    ];

    tileLayers.forEach((layer, i) => {
      const layerTile = L.tileLayer(layer.url, {
        ...layer.options,
        loading: layer.options.loadingBgUrl ? {
          getTileUrl: () => layer.options.loadingBgUrl,
          maxZoom: layer.options.maxZoom,
          minZoom: 0,
          opacity: 0.7,
          tileSize: 256
        } : undefined
      });
      
      if (i === 0) layerTile.addTo(this.map);
      baseLayers[layer.name] = layerTile;
    });

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      position: 'topleft',
      placeholder: 'Cari lokasi...',
      errorMessage: 'Lokasi tidak ditemukan',
      suggestTimeout: 300,
      keepOpen: false,
      collapsed: true,
      expand: 'click',
      geocoder: L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
          countrycodes: 'id',
          limit: 5,
          viewbox: ''
        }
      }),
      showResultIcons: true,
      suggestMinLength: 3,
      queryMinLength: 2,
      markers: {
        icon: L.divIcon({
          className: 'search-marker',
          html: '<div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div><div class="relative inline-flex rounded-full h-8 w-8 bg-blue-500 text-white items-center justify-center"><i class="fas fa-search-location"></i></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }
    })
    .on('markgeocode', (e) => {
      const center = e.geocode.center;
      const bbox = e.geocode.bbox;

      this.map.flyToBounds(bbox, {
        padding: [50, 50],
        duration: 1.5,
        easeLinearity: 0.25
      });

      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker(center, {
        icon: L.divIcon({
          className: 'search-marker',
          html: `<div class="relative">
            <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
            <div class="relative inline-flex rounded-full h-10 w-10 bg-blue-500 text-white items-center justify-center">
              <i class="fas fa-map-marker-alt text-lg"></i>
            </div>
            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-2 py-1 rounded-md shadow-md text-xs whitespace-nowrap">
              ${e.geocode.name.split(',')[0]}
            </div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        }),
        riseOnHover: true
      })
      .addTo(this.map)
      .bindPopup(e.geocode.name, {
        className: 'modern-popup',
        offset: [0, -20],
        closeButton: false
      })
      .openPopup();

      this.state.lat = center.lat;
      this.state.lon = center.lng;
      this.updateCoordinatesDisplay();
      this.showToast(`Lokasi ditemukan: ${e.geocode.name.split(',')[0]}`, 'success');
    })
    .addTo(this.map);

    const geocoderContainer = document.querySelector('.leaflet-control-geocoder');
    if (geocoderContainer) {
      geocoderContainer.style.borderRadius = '12px';
      geocoderContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
      geocoderContainer.style.overflow = 'hidden';
      geocoderContainer.style.transition = 'all 0.3s ease';

      const input = geocoderContainer.querySelector('input');
      if (input) {
        input.style.border = 'none';
        input.style.padding = '10px 15px';
        input.style.width = '250px';
        input.style.transition = 'all 0.3s ease';
        input.placeholder = '🔍 Cari alamat atau tempat...';
        
        input.addEventListener('focus', () => {
          input.style.width = '300px';
          geocoderContainer.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.2)';
        });
        
        input.addEventListener('blur', () => {
          input.style.width = '250px';
          geocoderContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        });
      }

      const results = geocoderContainer.querySelector('.leaflet-control-geocoder-form');
      if (results) {
        results.style.maxHeight = '400px';
        results.style.overflowY = 'auto';
      }
    }

    const layersControl = L.control.layers(baseLayers, null, {
      position: 'topright',
      collapsed: true,
      autoZIndex: true,
      hideSingleBase: false
    }).addTo(this.map);

    const layersContainer = document.querySelector('.leaflet-control-layers');
    if (layersContainer) {
      layersContainer.style.borderRadius = '12px';
      layersContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
      layersContainer.style.overflow = 'hidden';
 
      const expanded = layersContainer.querySelector('.leaflet-control-layers-expanded');
      if (expanded) {
        expanded.style.padding = '10px';
        expanded.style.background = 'rgba(255, 255, 255, 0.9)';
        expanded.style.backdropFilter = 'blur(5px)';
      }
    }

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.state.lat = lat;
      this.state.lon = lng;
      
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      
      this.marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'click-marker',
          html: `<div class="relative">
            <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></div>
            <div class="relative inline-flex rounded-full h-10 w-10 bg-purple-500 text-white items-center justify-center">
              <i class="fas fa-map-pin"></i>
            </div>
            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-2 py-1 rounded-md shadow-md text-xs whitespace-nowrap">
              ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 50]
        }),
        riseOnHover: true
      })
      .addTo(this.map)
      .bindPopup(`Lokasi dipilih:<br>${lat.toFixed(4)}, ${lng.toFixed(4)}`, {
        className: 'modern-popup',
        offset: [0, -20],
        closeButton: false
      })
      .openPopup();
      
      this.updateCoordinatesDisplay();
      this.showToast(`Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'info');
    });

    L.control.scale({
      position: 'bottomleft',
      maxWidth: 200,
      metric: true,
      imperial: false,
      updateWhenIdle: true
    }).addTo(this.map);

    const locateControl = L.control({
      position: 'bottomright'
    });

    locateControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `
        
      `;
      
      div.firstChild.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleUseLocation();
      });
      
      return div;
    };

    locateControl.addTo(this.map);

    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.style.borderRadius = '12px';
      mapElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
      mapElement.style.overflow = 'hidden';
      mapElement.style.transform = 'translateZ(0)';
    }

    const style = document.createElement('style');
    style.textContent = `
      .modern-popup {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(5px);
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        border: none;
        padding: 10px;
      }
      
      .modern-popup .leaflet-popup-content-wrapper {
        background: transparent;
        box-shadow: none;
      }
      
      .modern-popup .leaflet-popup-content {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .leaflet-control-geocoder-form input {
        border-radius: 20px !important;
        padding: 8px 15px !important;
        font-size: 14px !important;
      }
      
      .leaflet-control-geocoder-form ul {
        border-radius: 8px !important;
        margin-top: 5px !important;
      }
      
      .leaflet-control-geocoder-form li {
        padding: 8px 12px !important;
        border-bottom: 1px solid #eee !important;
      }
      
      .leaflet-control-geocoder-form li:last-child {
        border-bottom: none !important;
      }
      
      .leaflet-control-geocoder-form li a:hover {
        background-color: #f8f9fa !important;
      }
    `;
    document.head.appendChild(style);

    this.updateCoordinatesDisplay();
  }

  render() {
    const page = document.createElement('main');
    page.id = 'main-content'; 
    page.tabIndex = -1;
    page.className = 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8';

    page.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-4xl font-extrabold text-gray-900 mb-3">Bagikan Cerita Anda</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">Ceritakan momen spesial Anda dengan dunia melalui gambar dan kata-kata</p>
        </div>

        <!-- Toast Container -->
        <div id="toast-container" class="fixed top-5 right-5 z-50 space-y-3 w-80"></div>

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <!-- Form Progress -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2"></div>

          <div class="p-8">
            <form id="story-form" class="space-y-8">
              <!-- Description Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <label for="description" class="block text-lg font-semibold text-gray-800">
                    <i class="fas fa-align-left text-blue-500 mr-2"></i> Deskripsi Cerita
                  </label>
                  <span id="char-counter" class="text-sm text-gray-500">0/500</span>
                </div>
                <textarea 
                  id="description" 
                  rows="5" 
                  placeholder="Tulis cerita Anda di sini... Bagaimana pengalaman Anda? Apa yang membuat momen ini spesial?" 
                  class="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition duration-200 resize-none"
                ></textarea>
              </div>

              <!-- Media Section -->
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                  <i class="fas fa-camera-retro text-purple-500 mr-2"></i> Media
                </h3>
                
                <!-- Tabs -->
                <div class="border-b border-gray-200">
                  <nav class="flex -mb-px space-x-8">
                    <button id="tab-upload" type="button" class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600 flex items-center">
                      <i class="fas fa-cloud-upload-alt mr-2"></i> Unggah Gambar
                    </button>
                    <button id="tab-camera" type="button" class="tab-btn whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center">
                      <i class="fas fa-camera mr-2"></i> Ambil Foto
                    </button>
                  </nav>
                </div>

                <!-- Upload Section -->
                <div id="uploadSection" class="space-y-4">
                  <div class="flex items-center justify-center w-full">
                    <label for="imageInput" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div class="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                        <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas</p>
                        <p class="text-xs text-gray-500">PNG, JPG, atau JPEG (maks. 1MB)</p>
                      </div>
                      <input id="imageInput" type="file" accept="image/*" class="hidden" />
                    </label>
                  </div>
                  <div id="fileName" class="text-sm text-gray-500 text-center"></div>
                </div>

                <!-- Camera Section -->
                <div id="cameraSection" class="hidden space-y-4">
                  <div id="videoContainer" class="flex flex-col items-center justify-center bg-gray-100 rounded-2xl p-6">
                    <p class="text-gray-500 text-center py-8">Klik tombol kamera untuk memulai.</p>
                  </div>
                </div>

                <!-- Preview Section -->
                <div id="previewContainer" class="hidden rounded-2xl overflow-hidden shadow-md border border-gray-200">
                  <div class="relative group">
                    <img id="preview" class="w-full h-96 object-cover" alt="Preview" />
                    <button id="removePreview" type="button" class="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Location Section -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                  <i class="fas fa-map-marker-alt text-red-500 mr-2"></i> Lokasi
                </h3>
                <p class="text-sm text-gray-600">Tambahkan lokasi untuk memberi tahu orang lain di mana cerita ini terjadi</p>
                
                <div id="map" class="h-96 rounded-xl border border-gray-200 shadow-sm overflow-hidden"></div>
                
                <div class="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
                  <button type="button" id="locationBtn" class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow hover:shadow-lg transition flex items-center justify-center">
                    <i class="fas fa-location-arrow mr-2"></i> Gunakan Lokasi Saat Ini
                  </button>
                  
                  <div class="text-sm text-gray-500" id="coordinatesDisplay">
                    Belum ada lokasi dipilih
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-6">
                <button id="submitBtn" type="submit" class="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                  <i class="fas fa-paper-plane mr-3"></i> Publikasikan Cerita
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    return page;
  }

  afterRender() {
    document.getElementById('description').addEventListener('input', this.handleInputChange);
    document.getElementById('imageInput').addEventListener('change', this.handleFileChange);
    document.getElementById('story-form').addEventListener('submit', this.handleSubmit);

    document.getElementById('removePreview')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.removePreview();
    });

    const tabUpload = document.getElementById('tab-upload');
    const tabCamera = document.getElementById('tab-camera');
    const uploadSection = document.getElementById('uploadSection');
    const cameraSection = document.getElementById('cameraSection');

    tabUpload.addEventListener('click', (e) => {
      e.preventDefault();
      tabUpload.classList.add('border-blue-500', 'text-blue-600');
      tabUpload.classList.remove('border-transparent', 'text-gray-500');
      tabCamera.classList.add('border-transparent', 'text-gray-500');
      tabCamera.classList.remove('border-blue-500', 'text-blue-600');
      uploadSection.classList.remove('hidden');
      cameraSection.classList.add('hidden');
      this.stopCameraStream();
    });

    tabCamera.addEventListener('click', (e) => {
      e.preventDefault();
      tabCamera.classList.add('border-blue-500', 'text-blue-600');
      tabCamera.classList.remove('border-transparent', 'text-gray-500');
      tabUpload.classList.add('border-transparent', 'text-gray-500');
      tabUpload.classList.remove('border-blue-500', 'text-blue-600');
      uploadSection.classList.add('hidden');
      cameraSection.classList.remove('hidden');
      this.handleUseCamera();
    });

    setTimeout(() => {
      this.initMap();

      const locationBtn = document.getElementById('locationBtn');
      if (locationBtn) {
        locationBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleUseLocation();
        });
      }
    }, 300);
  }
}