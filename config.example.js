// EXEMPLO DE CONFIGURAÇÃO
// Copie este arquivo para config.js e configure suas credenciais
//
// Para desenvolvimento local:
//   cp config.example.js config.js
//   Depois edite config.js com suas credenciais

const CONFIG = {
  // Webhook N8N
  // PRODUÇÃO: 'https://seu-n8n.com/webhook/seu-id'
  // TESTE:    'https://seu-n8n.com/webhook-test/seu-id'
  API_ENDPOINT: 'https://seu-n8n.com/webhook-test/seu-id-aqui',

  APP_NAME: 'Alfred',

  // Identificador único do usuário
  USER_ID: 'seu-nome',

  // Timeout em milissegundos (120000 = 2 minutos)
  TIMEOUT: 120000,

  // Configuração de retry
  RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 5000]
};
