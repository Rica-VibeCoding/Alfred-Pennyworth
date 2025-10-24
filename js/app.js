// Service Worker Registration
let swUpdateIntervalId = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Check for updates every hour
        swUpdateIntervalId = setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        // Service Worker registration failed - silent fail for production
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_INPUT_HEIGHT = 120;
  const INPUT_FOCUS_DELAY = 100;
  const VOICE_LABEL_IDLE = 'Gravar áudio';
  const VOICE_LABEL_LISTENING = 'Gravando... Clique para parar';
  const VOICE_BUTTON_COOLDOWN = 300;
  const ERROR_AUTODISMISS_DELAY = 5000;
  const VISUAL_TIMEOUT = 120000; // 2 minutos - N8N pode levar tempo em workflows complexos

  const messagesContainer = document.getElementById('messages-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const voiceButton = document.getElementById('voice-button');
  const loadingIndicator = document.querySelector('.loading-indicator');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const errorClose = document.getElementById('error-close');
  const connectionStatus = document.getElementById('connection-status');
  const emptyState = document.getElementById('empty-state');

  if (!messagesContainer || !messageInput || !sendButton || !voiceButton || !loadingIndicator) {
    // Required DOM elements not found - fail silently
    return;
  }

  let isProcessing = false;
  let voiceButtonCooldown = false;
  let errorTimeout = null;
  let isConnectionListenerInitialized = false;
  let visualTimeoutId = null;
  let lastFailedMessage = null; // Para retry

  initAutoResize();
  initSendButton();
  initVoiceButton();
  initErrorHandling();
  initConnectionMonitor();
  initCleanup();
  loadHistory();
  updateEmptyState();
  scrollToBottom();

  function initAutoResize() {
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, MAX_INPUT_HEIGHT) + 'px';
      updateSendButtonState();
    });
  }

  function initSendButton() {
    sendButton.addEventListener('click', (e) => {
      handleSendMessage();
    });

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  async function handleSendMessage(retryMessage = null) {
    if (isProcessing) {
      return;
    }

    const message = retryMessage || messageInput.value.trim();

    if (!message || message.length === 0) {
      showError('Digite uma mensagem antes de enviar.', true);
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      showError(`Mensagem muito longa (${message.length} caracteres). Máximo: ${MAX_MESSAGE_LENGTH}.`, true);
      return;
    }

    if (!navigator.onLine) {
      showError('Você está offline. Verifique sua conexão.', false);
      return;
    }

    isProcessing = true;
    sendButton.disabled = true;
    lastFailedMessage = message; // Salva para retry

    // Só adiciona mensagem se não for retry
    if (!retryMessage) {
      addMessage(message, 'sent');
      Storage.saveMessage(message, 'user');

      messageInput.value = '';
      messageInput.blur(); // Fecha teclado iOS
      messageInput.style.height = 'auto';
      updateSendButtonState();

      // Update sidebar with new message
      if (typeof Sidebar !== 'undefined' && Sidebar.renderSessions) {
        Sidebar.renderSessions();
      }
    }

    showLoading();

    // Timeout visual de segurança: libera UI após 15s mesmo que API não responda
    visualTimeoutId = setTimeout(() => {
      if (isProcessing) {
        hideLoading();
        const errorText = 'Servidor demorou muito para responder.';
        addMessageWithRetry(errorText, 'error');
        Storage.saveMessage(errorText, 'assistant', 'error');
        showError(errorText, true);

        isProcessing = false;
        updateSendButtonState();
      }
    }, VISUAL_TIMEOUT);

    const result = await API.sendToN8N(message);

    // Cancela timeout visual se API respondeu antes
    if (visualTimeoutId) {
      clearTimeout(visualTimeoutId);
      visualTimeoutId = null;
    }

    // Só processa resposta se ainda estiver em processamento (não foi cancelado pelo timeout)
    if (isProcessing) {
      hideLoading();

      if (result.success) {
        const responseText = result.data.response;
        const responseType = result.data.type || 'generic';
        const metadata = result.data.metadata || {};

        addMessage(responseText, 'received');
        Storage.saveMessage(responseText, 'assistant', responseType, metadata);
        lastFailedMessage = null; // Limpa retry em caso de sucesso

        // Update sidebar with assistant response
        if (typeof Sidebar !== 'undefined' && Sidebar.renderSessions) {
          Sidebar.renderSessions();
        }
      } else {
        const errorText = `Erro: ${result.error}`;
        addMessageWithRetry(errorText, 'error');
        Storage.saveMessage(errorText, 'assistant', 'error');

        showError(result.error, true);
      }

      isProcessing = false;
      updateSendButtonState();

      setTimeout(() => {
        messageInput.focus({ preventScroll: true });
      }, INPUT_FOCUS_DELAY);
    }
  }

  function addMessage(text, type) {
    updateEmptyState();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text || ''; // textContent is XSS-safe

    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = getCurrentTime();

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestamp);

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  function addMessageWithRetry(text, type) {
    updateEmptyState();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} received`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text || '';

    const retryButton = document.createElement('button');
    retryButton.className = 'retry-button';
    retryButton.textContent = '↻ Tentar novamente';
    retryButton.setAttribute('aria-label', 'Tentar enviar novamente');
    retryButton.onclick = () => {
      if (lastFailedMessage && !isProcessing) {
        handleSendMessage(lastFailedMessage);
      }
    };

    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = getCurrentTime();

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(retryButton);
    messageDiv.appendChild(timestamp);

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  function updateSendButtonState() {
    const message = messageInput.value.trim();
    const isValid = message.length > 0 && message.length <= MAX_MESSAGE_LENGTH && !isProcessing;

    sendButton.disabled = !isValid;
    sendButton.setAttribute('aria-label',
      isValid ? 'Enviar mensagem' : 'Digite uma mensagem para enviar'
    );
  }

  function showLoading() {
    if (loadingIndicator) return;

    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.setAttribute('role', 'status');
    loadingIndicator.setAttribute('aria-live', 'polite');
    loadingIndicator.setAttribute('aria-label', 'Processando mensagem');

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'loading-dot';
      loadingIndicator.appendChild(dot);
    }

    messagesContainer.appendChild(loadingIndicator);
    scrollToBottom();
  }

  function hideLoading() {
    if (loadingIndicator) {
      loadingIndicator.remove();
      loadingIndicator = null;
    }
  }

  function formatTime(date) {
    return date.getHours().toString().padStart(2, '0') + ':' +
           date.getMinutes().toString().padStart(2, '0');
  }

  function getCurrentTime() {
    return formatTime(new Date());
  }

  function formatTimestamp(isoString) {
    return formatTime(new Date(isoString));
  }

  function scrollToBottom() {
    if (messagesContainer) {
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }
  }

  function loadHistory() {
    const messages = Storage.getMessages();

    messages.forEach(msg => {
      if (!msg || !msg.content || !msg.role || !msg.timestamp) {
        // Invalid message in history - skip
        return;
      }

      const messageType = msg.role === 'user' ? 'sent' : 'received';
      addMessageFromHistory(msg.content, messageType, msg.timestamp);
    });
  }

  function addMessageFromHistory(text, type, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text || ''; // textContent is XSS-safe

    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = formatTimestamp(timestamp);

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestampDiv);

    messagesContainer.appendChild(messageDiv);
  }

  function initVoiceButton() {
    if (!Speech.isSupported) {
      voiceButton.style.display = 'none';
      return;
    }

    voiceButton.addEventListener('click', handleVoiceInput);
  }

  function handleVoiceInput() {
    if (isProcessing || voiceButtonCooldown) {
      return;
    }

    voiceButtonCooldown = true;
    setTimeout(() => { voiceButtonCooldown = false; }, VOICE_BUTTON_COOLDOWN);

    if (Speech.getIsListening()) {
      Speech.stop();
      voiceButton.classList.remove('listening');
      voiceButton.setAttribute('aria-label', VOICE_LABEL_IDLE);
      return;
    }

    voiceButton.classList.add('listening');
    voiceButton.setAttribute('aria-label', VOICE_LABEL_LISTENING);

    Speech.start(
      (transcript) => {
        voiceButton.classList.remove('listening');
        voiceButton.setAttribute('aria-label', VOICE_LABEL_IDLE);

        if (transcript.length > MAX_MESSAGE_LENGTH) {
          const errorMsg = `Mensagem muito longa (${transcript.length} caracteres). Máximo: ${MAX_MESSAGE_LENGTH}.`;
          addMessage(errorMsg, 'received');
          Storage.saveMessage(errorMsg, 'assistant', 'error');
          return;
        }

        messageInput.value = transcript;
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, MAX_INPUT_HEIGHT) + 'px';
        updateSendButtonState();

        handleSendMessage();
      },
      (error) => {
        voiceButton.classList.remove('listening');
        voiceButton.setAttribute('aria-label', VOICE_LABEL_IDLE);

        addMessage(error, 'received');
        Storage.saveMessage(error, 'assistant', 'error');
      }
    );
  }

  function initErrorHandling() {
    if (!errorClose) return;

    errorClose.addEventListener('click', hideError);
  }

  function showError(message, autoDismiss = true) {
    if (!errorBanner || !errorMessage) return;

    errorMessage.textContent = message;
    errorBanner.style.display = 'flex';

    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }

    if (autoDismiss) {
      errorTimeout = setTimeout(hideError, ERROR_AUTODISMISS_DELAY);
    }
  }

  function hideError() {
    if (!errorBanner) return;

    errorBanner.style.display = 'none';

    if (errorTimeout) {
      clearTimeout(errorTimeout);
      errorTimeout = null;
    }
  }

  function initConnectionMonitor() {
    if (!connectionStatus) return;
    if (isConnectionListenerInitialized) return;

    const handleOnline = () => {
      updateConnectionStatus();
      hideError();
    };

    const handleOffline = () => {
      updateConnectionStatus();
      showError('Você está offline. Verifique sua conexão.', false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    isConnectionListenerInitialized = true;
    updateConnectionStatus();
  }

  function updateConnectionStatus() {
    if (!connectionStatus) return;

    if (navigator.onLine) {
      connectionStatus.style.display = 'none';
    } else {
      connectionStatus.style.display = 'flex';
    }
  }

  function updateEmptyState() {
    if (!emptyState) return;

    const hasMessages = messagesContainer.querySelectorAll('.message').length > 0;

    if (hasMessages) {
      emptyState.classList.add('hidden');
    } else {
      emptyState.classList.remove('hidden');
    }
  }

  function initCleanup() {
    window.addEventListener('beforeunload', () => {
      // Clear error timeout
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }

      // Clear visual timeout
      if (visualTimeoutId) {
        clearTimeout(visualTimeoutId);
      }

      // Clear Service Worker update interval
      if (swUpdateIntervalId) {
        clearInterval(swUpdateIntervalId);
      }

      // Stop speech recognition if active
      if (Speech.isSupported && Speech.getIsListening()) {
        Speech.stop();
      }
    });
  }
});
