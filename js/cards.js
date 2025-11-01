/**
 * ALFRED - CARDS RENDERING MODULE
 * Renderiza cards formatados para tipos específicos de mensagens
 * Criado: 2025-10-26
 * Tipos suportados: email, evento, financeiro, contato
 * Formato: INLINE (label: valor na mesma linha)
 */

const Cards = (function() {
  'use strict';

  /**
   * Renderiza um card baseado no tipo e dados
   * @param {string} type - Tipo do card (ex: 'card_email')
   * @param {Object} data - Dados do card
   * @param {string} fallbackText - Texto fallback se card falhar
   * @returns {HTMLElement} Elemento DOM do card
   */
  function renderCard(type, data, fallbackText) {
    if (!type || !type.startsWith('card_')) {
      return renderTextMessage(fallbackText);
    }

    try {
      switch (type) {
        case 'card_email':
          return createEmailCard(data);
        case 'card_evento':
          return createEventCard(data);
        case 'card_financeiro':
          return createFinanceCard(data);
        case 'card_contato':
          return createContactCard(data);
        default:
          console.warn(`Tipo de card desconhecido: ${type}`);
          return renderTextMessage(fallbackText);
      }
    } catch (error) {
      console.error('Erro ao renderizar card:', error);
      return renderTextMessage(fallbackText);
    }
  }

  /**
   * Renderiza mensagem de texto simples (fallback)
   */
  function renderTextMessage(text) {
    const div = document.createElement('div');
    div.className = 'message-text';
    div.textContent = text || 'Erro ao carregar mensagem';
    return div;
  }

  /**
   * Cria card de email (FORMATO INLINE)
   */
  function createEmailCard(data) {
    const card = document.createElement('div');
    card.className = 'card card-email';

    const isUnread = data.lido === false;

    card.innerHTML = `
      <div class="card-header">
        <span class="card-icon">📧</span>
        <h3 class="card-title">${escapeHtml(data.assunto || 'Sem assunto')}</h3>
        <span class="card-badge ${isUnread ? 'unread' : 'read'}">
          ${isUnread ? 'Não lido' : 'Lido'}
        </span>
      </div>
      <div class="card-body">
        <div class="card-field">
          <span class="card-field-label">De:</span> ${escapeHtml(data.de || 'Desconhecido')}${data.email_de ? ` &lt;${escapeHtml(data.email_de)}&gt;` : ''}
        </div>
        ${data.assunto ? `
          <div class="card-field">
            <span class="card-field-label">Assunto:</span> ${escapeHtml(data.assunto)}
          </div>
        ` : ''}
        ${data.preview ? `
          <div class="card-field preview">
            <span class="card-field-label">Preview:</span>
            <span class="card-field-value">${escapeHtml(data.preview)}</span>
          </div>
        ` : ''}
      </div>
      <div class="card-footer">
        <span>${formatDate(data.data)}</span>
      </div>
    `;

    return card;
  }

  /**
   * Cria card de evento (FORMATO INLINE)
   */
  function createEventCard(data) {
    const card = document.createElement('div');
    card.className = 'card card-evento';

    const timeRange = `${data.horario_inicio || ''} - ${data.horario_fim || ''}`.trim();
    const participantsList = Array.isArray(data.participantes)
      ? data.participantes.map(p => `<span class="participant-tag">${escapeHtml(p)}</span>`).join('')
      : '';

    card.innerHTML = `
      <div class="card-header">
        <span class="card-icon">📅</span>
        <h3 class="card-title">${escapeHtml(data.titulo || 'Evento')}</h3>
      </div>
      <div class="card-body">
        ${timeRange ? `
          <div class="card-time">
            <span>🕐</span>
            <span>${formatDate(data.data)}${timeRange !== '-' ? ', ' + timeRange : ''}</span>
          </div>
        ` : ''}
        ${data.local ? `
          <div class="card-field">
            <span class="card-field-label">Local:</span> ${escapeHtml(data.local)}
          </div>
        ` : ''}
        ${participantsList ? `
          <div class="card-field">
            <span class="card-field-label">Participantes:</span>
            <div class="card-field-value participants">
              ${participantsList}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    return card;
  }

  /**
   * Cria card financeiro (FORMATO INLINE)
   */
  function createFinanceCard(data) {
    const card = document.createElement('div');
    card.className = 'card card-financeiro';

    const moeda = data.moeda || 'BRL';
    const liberado = formatCurrency(data.liberado, moeda);
    const pendente = formatCurrency(data.pendente, moeda);
    const bloqueado = formatCurrency(data.bloqueado, moeda);

    card.innerHTML = `
      <div class="card-header">
        <span class="card-icon">💰</span>
        <h3 class="card-title">${escapeHtml(data.titulo || data.periodo || 'Resumo Financeiro')}</h3>
      </div>
      <div class="card-body">
        ${data.liberado !== undefined ? `
          <div class="finance-row">
            <span class="finance-label">Liberado</span>
            <span class="finance-value positive">${liberado}</span>
          </div>
        ` : ''}
        ${data.pendente !== undefined ? `
          <div class="finance-row">
            <span class="finance-label">Pendente</span>
            <span class="finance-value warning">${pendente}</span>
          </div>
        ` : ''}
        ${data.bloqueado !== undefined ? `
          <div class="finance-row">
            <span class="finance-label">Bloqueado</span>
            <span class="finance-value negative">${bloqueado}</span>
          </div>
        ` : ''}
      </div>
    `;

    return card;
  }

  /**
   * Cria card de contato (FORMATO INLINE)
   */
  function createContactCard(data) {
    const card = document.createElement('div');
    card.className = 'card card-contato';

    const tags = Array.isArray(data.tags)
      ? data.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')
      : '';

    card.innerHTML = `
      <div class="card-header">
        <span class="card-icon">📞</span>
        <h3 class="card-title">${escapeHtml(data.nome || 'Contato')}</h3>
      </div>
      <div class="card-body">
        ${data.empresa ? `
          <div class="card-field">
            <span class="card-field-label">Empresa:</span> ${escapeHtml(data.empresa)}
          </div>
        ` : ''}
        ${data.cargo ? `
          <div class="card-field">
            <span class="card-field-label">Cargo:</span> ${escapeHtml(data.cargo)}
          </div>
        ` : ''}
        ${data.telefone ? `
          <div class="card-field">
            <span class="card-field-label">Telefone:</span>
            <a href="tel:${escapeHtml(data.telefone.replace(/\D/g, ''))}">${escapeHtml(data.telefone)}</a>
          </div>
        ` : ''}
        ${data.email ? `
          <div class="card-field">
            <span class="card-field-label">Email:</span>
            <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
          </div>
        ` : ''}
        ${tags ? `<div class="contact-tags">${tags}</div>` : ''}
      </div>
    `;

    return card;
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Formata data para exibição
   */
  function formatDate(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);

      const isHoje = date.toDateString() === hoje.toDateString();
      const isOntem = date.toDateString() === ontem.toDateString();

      if (isHoje) {
        return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (isOntem) {
        return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  }

  /**
   * Formata valores monetários
   */
  function formatCurrency(value, currency = 'BRL') {
    if (value === null || value === undefined) return '';

    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return value;

      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
      }).format(numValue);
    } catch (error) {
      console.error('Erro ao formatar moeda:', error);
      return value;
    }
  }

  // API Pública
  return {
    renderCard: renderCard
  };
})();
