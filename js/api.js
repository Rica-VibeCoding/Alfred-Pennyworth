// N8N API communication

const API = (() => {
  // Validate CONFIG on module initialization
  if (typeof CONFIG === 'undefined') {
    throw new Error('CONFIG is not defined. Please include config.js before api.js');
  }

  if (!CONFIG.API_ENDPOINT || !CONFIG.USER_ID) {
    throw new Error('CONFIG.API_ENDPOINT and CONFIG.USER_ID are required');
  }

  // Fallbacks for retry configuration
  const MAX_RETRIES = CONFIG.RETRY_ATTEMPTS || 3;
  const RETRY_DELAYS = CONFIG.RETRY_DELAYS || [1000, 3000, 5000];
  const TIMEOUT = CONFIG.TIMEOUT || 30000;

  async function sendToN8N(message) {
    // Validate message input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('API: Mensagem inválida recebida:', {
        message,
        type: typeof message,
        length: message ? message.length : 0
      });
      return {
        success: false,
        error: 'Mensagem vazia. Digite algo antes de enviar.'
      };
    }

    // Sanitize message (remove caracteres invisíveis comuns do mobile)
    message = message.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    const payload = {
      message: message,
      userId: CONFIG.USER_ID,
      timestamp: new Date().toISOString(),
      source: 'web-assistant'
    };

    return await fetchWithRetry(payload);
  }

  async function fetchWithRetry(payload, attempt = 0) {
    try {
      const response = await fetchWithTimeout(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }, TIMEOUT);

      // Erros HTTP: apenas 5xx devem fazer retry
      if (!response.ok) {
        const shouldRetry = response.status >= 500;

        if (!shouldRetry) {
          // 4xx = erro cliente (bad request, not found, etc) - NÃO retry
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }

        // 5xx = erro servidor - faz retry
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Response OK (200-299)
      // Tenta parsear resposta (pode ser JSON ou texto puro)
      const contentType = response.headers.get('content-type');
      let rawData;

      if (contentType && contentType.includes('application/json')) {
        rawData = await response.json();
      } else {
        // Se não for JSON, trata como texto puro
        rawData = await response.text();
      }

      // Normaliza resposta para formato padrão
      const normalizedData = normalizeResponse(rawData);

      // Resposta OK mas formato inválido = erro de configuração (NÃO retry)
      if (!validateResponse(normalizedData)) {
        console.error('N8N returned invalid response format:', rawData);

        return {
          success: false,
          error: 'N8N retornou resposta vazia ou inválida. Verifique configuração do webhook.'
        };
      }

      return {
        success: true,
        data: normalizedData
      };

    } catch (error) {
      // Retry apenas para: timeout, erro de rede, ou HTTP 5xx
      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAYS[attempt] || 5000;
        await sleep(delay);
        return await fetchWithRetry(payload, attempt + 1);
      }

      return {
        success: false,
        error: error.message || 'Erro de comunicação com o servidor. Tente novamente.'
      };
    }
  }

  async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  function normalizeResponse(rawData) {
    // Se já está no formato esperado (objeto com success, response, etc)
    if (rawData && typeof rawData === 'object' && rawData.response) {
      return {
        success: rawData.success !== false, // Default true se não especificado
        response: rawData.response,
        type: rawData.type || 'generic',
        timestamp: rawData.timestamp || new Date().toISOString(),
        metadata: rawData.metadata || {}
      };
    }

    // Se é texto puro (resposta antiga do N8N)
    if (typeof rawData === 'string' && rawData.trim().length > 0) {
      return {
        success: true,
        response: rawData.trim(),
        type: 'generic',
        timestamp: new Date().toISOString(),
        metadata: {}
      };
    }

    // Formato inválido
    return null;
  }

  function validateResponse(data) {
    return data &&
           typeof data === 'object' &&
           typeof data.success === 'boolean' &&
           typeof data.response === 'string' &&
           data.response.length > 0;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return {
    sendToN8N
  };
})();
