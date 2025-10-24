// Sidebar controller

const Sidebar = (() => {
  let overlay = null;
  let toggleBtn = null;
  let closeBtn = null;
  let newBtn = null;
  let sessionsList = null;
  let clearBtn = null;
  let messagesContainer = null;

  function init() {
    overlay = document.getElementById('sidebar-overlay');
    toggleBtn = document.getElementById('sidebar-toggle');
    closeBtn = document.getElementById('sidebar-close');
    newBtn = document.getElementById('new-session-btn');
    sessionsList = document.getElementById('sessions-list');
    clearBtn = document.getElementById('clear-old-btn');
    messagesContainer = document.getElementById('messages-container');

    if (!overlay || !toggleBtn || !sessionsList) {
      console.warn('Sidebar elements not found');
      return;
    }

    initEventListeners();
    renderSessions();
  }

  function initEventListeners() {
    toggleBtn?.addEventListener('click', toggle);
    closeBtn?.addEventListener('click', close);
    newBtn?.addEventListener('click', createNewSession);
    clearBtn?.addEventListener('click', clearOldSessions);

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay?.classList.contains('active')) {
        close();
      }
    });
  }

  function toggle() {
    overlay?.classList.toggle('active');
  }

  function open() {
    overlay?.classList.add('active');
  }

  function close() {
    overlay?.classList.remove('active');
  }

  function createNewSession() {
    const sessionId = Storage.createSession();
    Storage.setCurrentSession(sessionId);

    clearChat();
    renderSessions();
    close();

    const input = document.getElementById('message-input');
    if (input) {
      setTimeout(() => {
        input.focus({ preventScroll: true });
      }, 100);
    }
  }

  function renderSessions() {
    if (!sessionsList) return;

    const sessions = Storage.getSessions();
    const grouped = groupSessionsByTime(sessions);

    let html = '';

    for (const [groupName, groupSessions] of Object.entries(grouped)) {
      if (groupSessions.length === 0) continue;

      html += '<div class="session-group">';
      html += `<h3 class="group-title">${groupName}</h3>`;

      for (const session of groupSessions) {
        const icon = getIconForSession(session);
        const isActive = session.id === Storage.getCurrentSessionId();
        const timeStr = formatTime(session.updatedAt);

        html += `
          <div class="session-item ${isActive ? 'active' : ''}" data-session-id="${session.id}">
            <svg width="20" height="20"><use href="#icon-${icon}"></use></svg>
            <div class="session-info">
              <span class="session-title">${escapeHtml(session.title)}</span>
              <span class="session-time">${timeStr}</span>
            </div>
          </div>
        `;
      }

      html += '</div>';
    }

    if (html === '') {
      html = '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">Nenhuma conversa ainda</div>';
    }

    sessionsList.innerHTML = html;
    attachSessionListeners();
  }

  function attachSessionListeners() {
    if (!sessionsList) return;

    const items = sessionsList.querySelectorAll('.session-item[data-session-id]');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const sessionId = item.dataset.sessionId;
        if (sessionId) {
          switchToSession(sessionId);
        }
      });
    });
  }

  function switchToSession(sessionId) {
    Storage.setCurrentSession(sessionId);
    loadSessionMessages(sessionId);
    renderSessions();
    close();
  }

  function loadSessionMessages(sessionId) {
    const session = Storage.getSession(sessionId);
    if (!session) return;

    clearChat();

    session.messages.forEach(msg => {
      const messageType = msg.role === 'user' ? 'sent' : 'received';
      addMessageFromHistory(msg.content, messageType, msg.timestamp);
    });

    scrollToBottom();
  }

  function clearChat() {
    if (!messagesContainer) return;

    const messages = messagesContainer.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());

    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.classList.remove('hidden');
    }
  }

  function groupSessionsByTime(sessions) {
    const now = new Date();
    const groups = {
      'Hoje': [],
      'Ontem': [],
      'Últimos 7 dias': [],
      'Mais antigas': []
    };

    sessions.forEach(session => {
      const date = new Date(session.updatedAt);
      const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        groups['Hoje'].push(session);
      } else if (daysDiff === 1) {
        groups['Ontem'].push(session);
      } else if (daysDiff <= 7) {
        groups['Últimos 7 dias'].push(session);
      } else {
        groups['Mais antigas'].push(session);
      }
    });

    return groups;
  }

  function getIconForSession(session) {
    if (!session.messages || session.messages.length === 0) {
      return 'message-circle';
    }

    const firstMsg = session.messages[0]?.content?.toLowerCase() || '';

    if (firstMsg.includes('email') || firstMsg.includes('e-mail')) {
      return 'mail';
    }
    if (firstMsg.includes('agenda') || firstMsg.includes('calendário') || firstMsg.includes('reunião')) {
      return 'calendar';
    }
    if (firstMsg.includes('cliente') || firstMsg.includes('contato')) {
      return 'user';
    }
    if (firstMsg.includes('relatório') || firstMsg.includes('análise') || firstMsg.includes('dados')) {
      return 'bar-chart';
    }

    return 'message-circle';
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (daysDiff === 1) {
      return 'Ontem';
    } else if (daysDiff < 7) {
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return weekdays[date.getDay()];
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    }
  }

  function clearOldSessions() {
    if (!confirm('Deseja limpar conversas antigas (> 7 dias)?')) {
      return;
    }

    Storage.cleanOldMessages();
    renderSessions();

    const currentSession = Storage.getSession(Storage.getCurrentSessionId());
    if (!currentSession || currentSession.messages.length === 0) {
      clearChat();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function addMessageFromHistory(text, type, timestamp) {
    if (!messagesContainer) return;

    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text || '';

    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = formatTimestamp(timestamp);

    messageDiv.appendChild(bubble);
    messageDiv.appendChild(timestampDiv);

    messagesContainer.appendChild(messageDiv);
  }

  function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function scrollToBottom() {
    if (messagesContainer) {
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }
  }

  return {
    init,
    renderSessions,
    close
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Sidebar.init();
});
