export default class PostStoryPresenter {
  constructor(view, model, navigateTo) {
    this.view = view;
    this.model = model;
    this.navigateTo = navigateTo;
  }

  async onSubmit(state) {
    if (!state.description) {
      this.view.showToast('Deskripsi tidak boleh kosong', 'error');
      this.view.focusDescription();
      return;
    }
    if (!state.imageFile && !state.imageUrl) {
      this.view.showToast('Harap unggah foto atau ambil foto terlebih dahulu', 'error');
      return;
    }

    this.view.setSubmitLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.view.showToast('Anda harus login terlebih dahulu', 'error');
        this.navigateTo('/login');
        return;
      }
      await this.model.postStory({
        description: state.description,
        imageFile: state.imageFile,
        imageUrl: state.imageUrl,
        lat: state.lat,
        lon: state.lon,
        token
      });
      this.view.showToast('Story berhasil dikirim!', 'success');
      this.view.cleanup();
      setTimeout(() => {
        this.navigateTo('/');
      }, 1500);
    } catch (error) {
      this.view.showToast(error.message || 'Terjadi kesalahan saat mengunggah story', 'error');
    } finally {
      this.view.setSubmitLoading(false);
    }
  }
}