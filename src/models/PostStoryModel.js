export default class PostStoryModel {
  async postStory({ description, imageFile, imageUrl, lat, lon, token }) {
    const formData = new FormData();
    formData.append('description', description);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    if (imageFile) {
      formData.append('photo', imageFile);
    } else if (imageUrl) {
      const blob = await (await fetch(imageUrl)).blob();
      formData.append('photo', blob, 'captured.jpg');
    }

    const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengunggah story');
    return data;
  }
}