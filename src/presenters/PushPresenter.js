export default class PushPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
  }

  async subscribe() {
    try {
      const token = this.model.getToken();
      if (!token) throw new Error('You must login first');
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      await this.model.subscribePush(token, subscription.toJSON());
      this.view.showToast('Berhasil subscribe notifikasi!', 'success');
    } catch (err) {
      this.view.showToast(err.message, 'error');
    }
  }

  async unsubscribe() {
    try {
      const token = this.model.getToken();
      if (!token) throw new Error('You must login first');
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) throw new Error('Belum subscribe notifikasi');
      await this.model.unsubscribePush(token, subscription.endpoint);
      await subscription.unsubscribe();
      this.view.showToast('Berhasil unsubscribe notifikasi!', 'success');
    } catch (err) {
      this.view.showToast(err.message, 'error');
    }
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}