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
      return {
        success: false,
        error: 'Mensagem inválida'
      };
    }

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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!validateResponse(data)) {
        throw new Error('Invalid response format from N8N');
      }

      return {
        success: true,
        data: data
      };

    } catch (error) {
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
