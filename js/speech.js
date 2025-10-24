// Speech Recognition Module
const Speech = (() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const RECOGNITION_TIMEOUT = 60000; // 60 seconds max

  if (!SpeechRecognition) {
    return {
      isSupported: false,
      start: (onResult, onError) => {
        if (onError) onError('Reconhecimento de voz não suportado');
      },
      stop: () => {},
      getIsListening: () => false
    };
  }

  const recognition = new SpeechRecognition();
  let isListening = false;
  let onResultCallback = null;
  let onErrorCallback = null;
  let recognitionTimeout = null;

  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;

    // Safety timeout: stop after 60 seconds
    recognitionTimeout = setTimeout(() => {
      if (isListening) {
        stop();
        if (onErrorCallback) {
          onErrorCallback('Tempo limite de gravação excedido');
        }
      }
    }, RECOGNITION_TIMEOUT);
  };

  recognition.onresult = (event) => {
    // Validate result structure
    if (!event.results || !event.results[0] || !event.results[0][0]) {
      return;
    }

    const transcript = event.results[0][0].transcript;

    if (onResultCallback && transcript) {
      onResultCallback(transcript.trim());
    }
  };

  recognition.onerror = (event) => {
    const wasListening = isListening;
    isListening = false;

    if (onErrorCallback && wasListening) {
      let errorMessage = 'Erro ao reconhecer voz';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Nenhuma fala detectada';
          break;
        case 'audio-capture':
          errorMessage = 'Microfone não encontrado';
          break;
        case 'not-allowed':
          errorMessage = 'Permissão do microfone negada';
          break;
        case 'network':
          errorMessage = 'Erro de rede';
          break;
        case 'aborted':
          return;
      }

      onErrorCallback(errorMessage);
    }
  };

  recognition.onend = () => {
    // Clear timeout
    if (recognitionTimeout) {
      clearTimeout(recognitionTimeout);
      recognitionTimeout = null;
    }

    isListening = false;
    onResultCallback = null;
    onErrorCallback = null;
  };

  function start(onResult, onError) {
    if (isListening) {
      return;
    }

    onResultCallback = onResult;
    onErrorCallback = onError;

    try {
      recognition.start();
    } catch (error) {
      isListening = false;
      onResultCallback = null;
      onErrorCallback = null;

      if (onError) {
        // More specific error message
        const message = error.name === 'InvalidStateError'
          ? 'Reconhecimento de voz já está ativo'
          : 'Erro ao iniciar reconhecimento de voz';
        onError(message);
      }
    }
  }

  function stop() {
    if (isListening) {
      recognition.stop();
      isListening = false;

      // Clear timeout when manually stopping
      if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;
      }
    }
  }

  function getIsListening() {
    return isListening;
  }

  return {
    isSupported: true,
    start,
    stop,
    getIsListening
  };
})();
