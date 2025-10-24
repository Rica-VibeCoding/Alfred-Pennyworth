// LocalStorage management

const Storage = (() => {
  const STORAGE_KEY = 'alfred_data';
  const MAX_AGE_DAYS = 30;

  function generateUUID() {
    // Use native crypto.randomUUID if available (2025 standard)
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getStorageData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return initializeStorage();
      }

      const parsed = JSON.parse(data);

      // Validate structure
      if (!parsed.messages || !Array.isArray(parsed.messages) || !parsed.sessionId) {
        console.warn('Invalid storage structure, reinitializing');
        return initializeStorage();
      }

      return parsed;
    } catch (error) {
      console.error('Error reading from localStorage:', error);

      // If JSON parsing failed, data is corrupted
      if (error instanceof SyntaxError) {
        console.warn('Corrupted data, clearing storage');
        localStorage.removeItem(STORAGE_KEY);
      }

      return initializeStorage();
    }
  }

  function initializeStorage() {
    const initialData = {
      sessionId: generateUUID(),
      messages: [],
      lastCleaned: new Date().toISOString()
    };
    saveStorageData(initialData);
    return initialData;
  }

  function saveStorageData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);

      // If quota exceeded, try cleaning old messages and retry
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, cleaning old messages');

        // Clean messages older than 30 days
        const now = new Date();
        const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(now - maxAge);

        data.messages = data.messages.filter(msg =>
          new Date(msg.timestamp) > cutoffDate
        );
        data.lastCleaned = now.toISOString();

        // Retry after cleanup
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return true;
        } catch (retryError) {
          console.error('Still failed after cleanup:', retryError);
          return false;
        }
      }

      return false;
    }
  }

  function saveMessage(content, role, type = 'generic', metadata = {}) {
    const data = getStorageData();

    const message = {
      id: generateUUID(),
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
      type: type,
      metadata: metadata
    };

    data.messages.push(message);
    saveStorageData(data);

    return message;
  }

  function getMessages() {
    const data = getStorageData();

    // Clean old messages only once per day to improve performance
    const lastCleaned = new Date(data.lastCleaned || 0);
    const now = new Date();
    const hoursSinceClean = (now - lastCleaned) / (60 * 60 * 1000);

    if (hoursSinceClean >= 24) {
      cleanOldMessages();
      return getStorageData().messages; // Get fresh data after cleaning
    }

    return data.messages;
  }

  function cleanOldMessages() {
    const data = getStorageData();
    const now = new Date();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    // BUG FIX: Correct logic - clean if last cleaned was more than 1 day ago
    const lastCleanedDate = new Date(data.lastCleaned || 0);
    const daysSinceLastClean = (now - lastCleanedDate) / (24 * 60 * 60 * 1000);
    const shouldClean = daysSinceLastClean >= 1;

    if (shouldClean) {
      const cutoffDate = new Date(now - maxAge);
      data.messages = data.messages.filter(msg =>
        new Date(msg.timestamp) > cutoffDate
      );
      data.lastCleaned = now.toISOString();
      saveStorageData(data);
    }
  }

  function clearAllMessages() {
    const data = getStorageData();
    data.messages = [];
    saveStorageData(data);
  }

  function getSessionId() {
    const data = getStorageData();
    return data.sessionId;
  }

  return {
    saveMessage,
    getMessages,
    cleanOldMessages,
    clearAllMessages,
    getSessionId
  };
})();
