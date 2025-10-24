const CONFIG = {
  API_ENDPOINT: 'https://n8n-n8n.l1huim.easypanel.host/webhook/0c689264-8178-477c-a366-66559b14cf16',
  APP_NAME: 'Alfred',
  USER_ID: 'ricardo-nilton',
  TIMEOUT: 120000, // 2 minutos - N8N processa ~30 nós + APIs externas (Gmail, etc)
  RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 5000]
};
