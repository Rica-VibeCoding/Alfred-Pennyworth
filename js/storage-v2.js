// LocalStorage management V2 - Multiple sessions support

const Storage = (() => {
  const STORAGE_KEY = 'alfred_sessions';
  const STORAGE_KEY_V1 = 'alfred_data';
  const MAX_SESSIONS = 20;
  const MAX_AGE_DAYS = 7;
  const TITLE_MAX_LENGTH = 40;

  function generateUUID() {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

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
        return migrateFromV1OrInitialize();
      }

      const parsed = JSON.parse(data);

      if (!parsed.version || parsed.version !== 2 || !parsed.sessions) {
        console.warn('Invalid V2 structure, migrating');
        return migrateFromV1OrInitialize();
      }

      return parsed;
    } catch (error) {
      console.error('Error reading storage:', error);

      if (error instanceof SyntaxError) {
        console.warn('Corrupted data, trying migration');
        return migrateFromV1OrInitialize();
      }

      return initializeStorage();
    }
  }

  function initializeStorage() {
    const firstSessionId = generateUUID();

    const data = {
      version: 2,
      currentSessionId: firstSessionId,
      sessions: {
        [firstSessionId]: {
          id: firstSessionId,
          title: 'Nova conversa',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      settings: {
        maxSessions: MAX_SESSIONS,
        maxAge: MAX_AGE_DAYS
      },
      lastCleaned: new Date().toISOString()
    };

    saveStorageData(data);
    return data;
  }

  function migrateFromV1OrInitialize() {
    try {
      const oldData = localStorage.getItem(STORAGE_KEY_V1);

      if (!oldData) {
        return initializeStorage();
      }

      const parsed = JSON.parse(oldData);

      if (!parsed.messages || !Array.isArray(parsed.messages)) {
        return initializeStorage();
      }

      const migrationSessionId = generateUUID();
      const firstMessage = parsed.messages[0];

      const newData = {
        version: 2,
        currentSessionId: migrationSessionId,
        sessions: {
          [migrationSessionId]: {
            id: migrationSessionId,
            title: 'Conversas Anteriores',
            messages: parsed.messages,
            createdAt: firstMessage?.timestamp || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        settings: {
          maxSessions: MAX_SESSIONS,
          maxAge: MAX_AGE_DAYS
        },
        lastCleaned: new Date().toISOString()
      };

      saveStorageData(newData);

      localStorage.setItem(STORAGE_KEY_V1 + '_backup', oldData);

      console.log('Migration V1→V2 successful');
      return newData;
    } catch (error) {
      console.error('Migration failed:', error);
      return initializeStorage();
    }
  }

  function saveStorageData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving storage:', error);

      if (error.name === 'QuotaExceededError') {
        console.warn('Quota exceeded, cleaning old sessions');
        cleanOldSessions(data);

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

  function createSession() {
    const data = getStorageData();
    const sessionId = generateUUID();

    const session = {
      id: sessionId,
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.sessions[sessionId] = session;
    data.currentSessionId = sessionId;

    cleanOldSessions(data);
    saveStorageData(data);

    return sessionId;
  }

  function setCurrentSession(sessionId) {
    const data = getStorageData();

    if (!data.sessions[sessionId]) {
      console.warn('Session not found:', sessionId);
      return false;
    }

    data.currentSessionId = sessionId;
    saveStorageData(data);
    return true;
  }

  function getCurrentSessionId() {
    const data = getStorageData();
    return data.currentSessionId;
  }

  function getSession(sessionId) {
    const data = getStorageData();
    return data.sessions[sessionId] || null;
  }

  function addMessageToSession(sessionId, message) {
    const data = getStorageData();
    const session = data.sessions[sessionId];

    if (!session) {
      console.warn('Session not found:', sessionId);
      return false;
    }

    const fullMessage = {
      id: generateUUID(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp || new Date().toISOString(),
      type: message.type || 'generic',
      metadata: message.metadata || {}
    };

    session.messages.push(fullMessage);
    session.updatedAt = new Date().toISOString();

    if (session.messages.length === 1 && message.role === 'user') {
      session.title = generateTitle(message.content);
    }

    saveStorageData(data);
    return fullMessage;
  }

  function getSessions() {
    const data = getStorageData();
    const sessions = Object.values(data.sessions);

    sessions.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    return sessions;
  }

  function deleteSession(sessionId) {
    const data = getStorageData();

    if (!data.sessions[sessionId]) {
      return false;
    }

    delete data.sessions[sessionId];

    if (data.currentSessionId === sessionId) {
      const remainingSessions = Object.keys(data.sessions);

      if (remainingSessions.length > 0) {
        data.currentSessionId = remainingSessions[0];
      } else {
        const newSessionId = createSession();
        data.currentSessionId = newSessionId;
      }
    }

    saveStorageData(data);
    return true;
  }

  function cleanOldSessions(data) {
    const sessions = Object.values(data.sessions);
    const now = new Date();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    sessions.forEach(session => {
      const age = now - new Date(session.updatedAt);
      if (age > maxAge) {
        delete data.sessions[session.id];
      }
    });

    const remainingSessions = Object.values(data.sessions);

    if (remainingSessions.length > MAX_SESSIONS) {
      remainingSessions.sort((a, b) => {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      });

      const toRemove = remainingSessions.slice(0, remainingSessions.length - MAX_SESSIONS);
      toRemove.forEach(session => {
        if (session.id !== data.currentSessionId) {
          delete data.sessions[session.id];
        }
      });
    }

    data.lastCleaned = now.toISOString();
  }

  function generateTitle(firstMessage) {
    if (!firstMessage || firstMessage.trim().length === 0) {
      return `Conversa de ${new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }

    let title = firstMessage
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, TITLE_MAX_LENGTH);

    if (firstMessage.length > TITLE_MAX_LENGTH) {
      title += '...';
    }

    return title || 'Nova conversa';
  }

  function clearAllSessions() {
    const data = getStorageData();
    const currentId = data.currentSessionId;

    data.sessions = {
      [currentId]: {
        id: currentId,
        title: 'Nova conversa',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    saveStorageData(data);
  }

  // Legacy API compatibility
  function saveMessage(content, role, type = 'generic', metadata = {}) {
    const sessionId = getCurrentSessionId();
    return addMessageToSession(sessionId, {
      role,
      content,
      type,
      metadata
    });
  }

  function getMessages() {
    const sessionId = getCurrentSessionId();
    const session = getSession(sessionId);
    return session ? session.messages : [];
  }

  // Legacy compatibility - wrapper for cleanOldSessions
  function cleanOldMessages() {
    const data = getStorageData();
    cleanOldSessions(data);
    saveStorageData(data);
  }

  function clearAllMessages() {
    const sessionId = getCurrentSessionId();
    const data = getStorageData();
    const session = data.sessions[sessionId];

    if (session) {
      session.messages = [];
      session.title = 'Nova conversa';
      session.updatedAt = new Date().toISOString();
      saveStorageData(data);
    }
  }

  // Legacy compatibility - wrapper for getCurrentSessionId
  function getSessionId() {
    return getCurrentSessionId();
  }

  return {
    // V2 API
    createSession,
    setCurrentSession,
    getCurrentSessionId,
    getSession,
    getSessions,
    addMessageToSession,
    deleteSession,
    clearAllSessions,

    // Legacy API (V1 compatibility)
    saveMessage,
    getMessages,
    cleanOldMessages,
    clearAllMessages,
    getSessionId
  };
})();
