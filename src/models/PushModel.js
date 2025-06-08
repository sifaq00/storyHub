export default class PushModel {
  getToken() {
    return localStorage.getItem('token');
  }

  async subscribePush(token, subscription) {
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to subscribe push notification");
    return data;
  }

  async unsubscribePush(token, endpoint) {
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to unsubscribe push notification");
    return data;
  }
}