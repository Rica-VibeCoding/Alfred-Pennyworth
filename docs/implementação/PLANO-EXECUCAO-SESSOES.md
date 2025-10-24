# Plano de Execução - Sistema de Sessões com Histórico

**Documento Autocontido - Versão 1.0**
**Data:** 2025-10-24

---

## Contexto do Projeto

### Projeto Alfred
- **O que é:** PWA de chat que conecta ao N8N via webhook
- **Stack atual:** HTML + CSS + JavaScript puro (zero dependências)
- **Tamanho:** ~36KB (target < 100KB)
- **Foco:** Mobile-first (iPhone 11 Safari)
- **URL:** Deploy na Vercel

### Problema Atual
- LocalStorage salva todas mensagens em array único por 30 dias
- Quando app reabre, mostra conversa infinita contínua
- Sem organização ou contexto separado

### Solução Proposta
- Sistema de sessões (múltiplas conversas)
- Sidebar com histórico de conversas
- Inspiração visual: Perplexity AI
- Agrupamento temporal (Hoje, Ontem, Últimos 7 dias)

---

## Arquivos do Projeto

```
/
├── index.html              # Página principal
├── css/
│   └── style.css          # Estilos
├── js/
│   ├── app.js             # Lógica principal
│   ├── api.js             # Comunicação N8N (não muda)
│   ├── storage.js         # LocalStorage (refatorar)
│   └── speech.js          # Voz (não muda)
├── manifest.json          # PWA (não muda)
├── sw.js                  # Service Worker (não muda)
└── config.js              # Configurações webhook
```

---

## FASE 1: Preparação e Análise (1-2 horas)

### Tarefa 1.1: Backup do Estado Atual
**Ação:** Criar branch nova e backup dos dados

```bash
# Criar branch de desenvolvimento
git checkout -b feature/session-system

# Backup LocalStorage (no console do navegador)
const backup = localStorage.getItem('alfred_data');
console.log(backup); // Copiar e salvar em arquivo
```

**Validação:**
- [ ] Branch criada
- [ ] Backup salvo
- [ ] App continua funcionando

### Tarefa 1.2: Análise do Código Atual
**Arquivos a estudar:**

1. **js/storage.js** - Como funciona hoje:
   - Estrutura: `{sessionId, messages[], lastCleaned}`
   - Funções: `saveMessage()`, `getMessages()`, `clearHistory()`

2. **js/app.js** - Pontos de integração:
   - Linha ~272: `loadHistory()`
   - Linha ~220: `sendMessage()`
   - Linha ~180: `addMessage()`

**Output esperado:** Mapa mental das mudanças necessárias

### Tarefa 1.3: Instalar Ferramentas
**Lucide Icons (para ícones):**

```html
<!-- Adicionar no index.html antes do </body> -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<script>
  lucide.createIcons();
</script>
```

**Validação:**
- [ ] Lucide carregando
- [ ] Nenhum erro no console

---

## FASE 2: Estrutura de Dados e Storage (2-3 horas)

### Tarefa 2.1: Nova Estrutura de Dados
**Criar arquivo:** `js/storage-v2.js` (temporário para testes)

```javascript
// Nova estrutura
const STORAGE_KEY_V2 = 'alfred_sessions';

const defaultStructure = {
  version: 2,
  currentSessionId: null,
  sessions: {}, // id: {title, messages[], createdAt, updatedAt}
  settings: {
    maxSessions: 20,
    maxAge: 7 // dias
  }
};
```

### Tarefa 2.2: Funções Core do Storage V2

```javascript
// Funções a implementar em storage-v2.js

class SessionStorage {
  // 1. Criar nova sessão
  createSession() {
    const id = this.generateUUID();
    const session = {
      id,
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Salvar e retornar id
    return id;
  }

  // 2. Adicionar mensagem à sessão
  addMessageToSession(sessionId, message) {
    // Adicionar mensagem
    // Atualizar updatedAt
    // Auto-gerar título se primeira mensagem
  }

  // 3. Trocar sessão ativa
  setCurrentSession(sessionId) {
    // Atualizar currentSessionId
  }

  // 4. Listar sessões ordenadas
  getSessions() {
    // Retornar array ordenado por updatedAt
    // Aplicar agrupamento temporal
  }

  // 5. Migração de dados antigos
  migrateFromV1() {
    // Detectar estrutura antiga
    // Converter para nova
    // Preservar mensagens
  }

  // 6. Limpeza automática
  cleanOldSessions() {
    // Remover > maxAge dias
    // Manter apenas maxSessions
  }

  // 7. Auto-título inteligente
  generateTitle(firstMessage) {
    // Pegar primeiros 40 chars
    // Limpar quebras/espaços
    // Fallback: "Conversa de [hora]"
  }
}
```

### Tarefa 2.3: Migração de Dados V1 → V2

```javascript
function migrateData() {
  const oldData = localStorage.getItem('alfred_data');
  if (!oldData) return;

  const parsed = JSON.parse(oldData);

  // Criar estrutura nova
  const newData = {
    version: 2,
    currentSessionId: generateUUID(),
    sessions: {},
    settings: { maxSessions: 20, maxAge: 7 }
  };

  // Criar sessão única com mensagens antigas
  newData.sessions[newData.currentSessionId] = {
    title: 'Conversas Anteriores',
    messages: parsed.messages || [],
    createdAt: parsed.messages[0]?.timestamp || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Salvar nova estrutura
  localStorage.setItem('alfred_sessions', JSON.stringify(newData));

  // Opcional: manter backup
  localStorage.setItem('alfred_data_v1_backup', oldData);
}
```

**Validação:**
- [ ] Storage V2 funcionando isolado
- [ ] Migração preserva mensagens
- [ ] Testes com dados reais

---

## FASE 3: Interface UI Mobile - Sidebar (3-4 horas)

### Tarefa 3.1: HTML - Estrutura da Sidebar

```html
<!-- Adicionar no index.html após <body> -->

<!-- Botão hamburger no header -->
<header class="chat-header">
  <button id="sidebar-toggle" class="hamburger-btn" aria-label="Menu">
    <i data-lucide="menu"></i>
  </button>
  <h1>Alfred</h1>
  <button id="new-session-btn" class="new-btn" aria-label="Nova conversa">
    <i data-lucide="plus"></i>
  </button>
</header>

<!-- Overlay Sidebar -->
<div id="sidebar-overlay" class="sidebar-overlay">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Conversas</h2>
      <button id="sidebar-close" class="close-btn" aria-label="Fechar">
        <i data-lucide="x"></i>
      </button>
    </div>

    <div class="sidebar-content">
      <!-- Lista de sessões será inserida aqui via JS -->
      <div id="sessions-list" class="sessions-list">
        <!-- Exemplo de estrutura -->
        <!--
        <div class="session-group">
          <h3 class="group-title">Hoje</h3>
          <div class="session-item active">
            <i data-lucide="message-circle"></i>
            <div class="session-info">
              <span class="session-title">Qual minha agenda...</span>
              <span class="session-time">14:30</span>
            </div>
          </div>
        </div>
        -->
      </div>
    </div>

    <div class="sidebar-footer">
      <button id="clear-old-btn" class="clear-btn">
        <i data-lucide="trash-2"></i>
        Limpar antigas
      </button>
    </div>
  </aside>
</div>
```

### Tarefa 3.2: CSS - Estilos da Sidebar

```css
/* Adicionar em style.css */

/* Variáveis de design - Paleta Perplexity */
:root {
  /* Sidebar */
  --sidebar-width: 280px;
  --sidebar-bg: #fafafa;
  --item-height: 52px;
  --item-height-mobile: 64px;
  --item-hover: #f3f4f6;
  --item-active: #e5e7eb;
  --group-title-color: #9ca3af;
  --icon-size: 20px;
  --gap-icon-text: 12px;
  --animation-speed: 200ms;

  /* Cores principais */
  --primary: #14b8a6;              /* Teal - botões e destaques */
  --background: #ffffff;           /* Fundo geral */
  --surface: #f9fafb;              /* Cards/elementos */

  /* Mensagens */
  --msg-user-bg: #f3f4f6;          /* Cinza claro - mensagem usuário */
  --msg-user-text: #111827;        /* Texto escuro */
  --msg-assistant-bg: #d1fae5;     /* Verde menta - resposta assistente */
  --msg-assistant-text: #065f46;   /* Verde escuro */

  /* Texto */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  /* Bordas */
  --border-color: #e5e7eb;
  --border-hover: #d1d5db;
}

/* Header com botões */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid #e5e7eb;
}

.hamburger-btn,
.new-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 150ms ease;
}

.hamburger-btn:hover,
.new-btn:hover {
  background: var(--item-hover);
}

/* Overlay (mobile) */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--animation-speed) ease;
  z-index: 1000;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  max-width: 320px;
  background: var(--sidebar-bg);
  transform: translateX(-100%);
  transition: transform var(--animation-speed) ease-out;
  display: flex;
  flex-direction: column;
}

.sidebar-overlay.active .sidebar {
  transform: translateX(0);
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Session Groups */
.session-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--group-title-color);
  margin-bottom: 8px;
  padding: 0 8px;
}

/* Session Items */
.session-item {
  display: flex;
  align-items: center;
  gap: var(--gap-icon-text);
  height: var(--item-height-mobile);
  padding: 0 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms ease;
}

.session-item:hover {
  background: var(--item-hover);
}

.session-item.active {
  background: var(--item-active);
  position: relative;
}

.session-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 24px;
  background: var(--primary);
  border-radius: 2px;
}

/* Session Icon */
.session-item i {
  width: var(--icon-size);
  height: var(--icon-size);
  color: var(--text-secondary);
}

/* Session Info */
.session-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item.active .session-title {
  font-weight: 600;
}

.session-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.clear-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  transition: background 150ms ease;
}

.clear-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Desktop (opcional) */
@media (min-width: 768px) {
  .sidebar-overlay {
    background: none;
  }

  .sidebar {
    position: static;
    transform: none;
    width: var(--sidebar-width);
  }

  .sidebar-header .close-btn {
    display: none;
  }

  .session-item {
    height: var(--item-height);
  }
}
```

### Tarefa 3.3: JavaScript - Controle da Sidebar

```javascript
// Adicionar em app.js ou criar sidebar.js

class SidebarController {
  constructor() {
    this.overlay = document.getElementById('sidebar-overlay');
    this.toggleBtn = document.getElementById('sidebar-toggle');
    this.closeBtn = document.getElementById('sidebar-close');
    this.newBtn = document.getElementById('new-session-btn');
    this.sessionsList = document.getElementById('sessions-list');

    this.initEventListeners();
  }

  initEventListeners() {
    // Abrir/fechar sidebar
    this.toggleBtn?.addEventListener('click', () => this.toggle());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Nova conversa
    this.newBtn?.addEventListener('click', () => this.createNewSession());

    // ESC fecha sidebar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  toggle() {
    this.overlay?.classList.toggle('active');
  }

  close() {
    this.overlay?.classList.remove('active');
  }

  open() {
    this.overlay?.classList.add('active');
  }

  createNewSession() {
    // Criar nova sessão
    const sessionId = Storage.createSession();
    Storage.setCurrentSession(sessionId);

    // Limpar chat
    this.clearChat();

    // Atualizar sidebar
    this.renderSessions();

    // Fechar sidebar
    this.close();
  }

  renderSessions() {
    const sessions = Storage.getSessions();
    const grouped = this.groupSessionsByTime(sessions);

    let html = '';

    for (const [groupName, groupSessions] of Object.entries(grouped)) {
      if (groupSessions.length === 0) continue;

      html += `<div class="session-group">`;
      html += `<h3 class="group-title">${groupName}</h3>`;

      for (const session of groupSessions) {
        const icon = this.getIconForSession(session);
        const isActive = session.id === Storage.getCurrentSessionId();
        const timeStr = this.formatTime(session.updatedAt);

        html += `
          <div class="session-item ${isActive ? 'active' : ''}"
               data-session-id="${session.id}">
            <i data-lucide="${icon}"></i>
            <div class="session-info">
              <span class="session-title">${session.title}</span>
              <span class="session-time">${timeStr}</span>
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    this.sessionsList.innerHTML = html;

    // Re-criar ícones Lucide
    lucide.createIcons();

    // Adicionar listeners aos items
    this.attachSessionListeners();
  }

  attachSessionListeners() {
    const items = this.sessionsList.querySelectorAll('.session-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const sessionId = item.dataset.sessionId;
        this.switchToSession(sessionId);
      });
    });
  }

  switchToSession(sessionId) {
    // Trocar sessão ativa
    Storage.setCurrentSession(sessionId);

    // Carregar mensagens
    this.loadSessionMessages(sessionId);

    // Atualizar UI
    this.renderSessions();

    // Fechar sidebar
    this.close();
  }

  groupSessionsByTime(sessions) {
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

  getIconForSession(session) {
    // Analisar primeira mensagem para escolher ícone
    const firstMsg = session.messages[0]?.content?.toLowerCase() || '';

    if (firstMsg.includes('email')) return 'mail';
    if (firstMsg.includes('agenda') || firstMsg.includes('calendário')) return 'calendar';
    if (firstMsg.includes('cliente')) return 'user';
    if (firstMsg.includes('relatório')) return 'bar-chart-2';

    return 'message-circle'; // default
  }

  formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Hoje - mostrar hora
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (daysDiff === 1) {
      // Ontem
      return 'Ontem';
    } else if (daysDiff < 7) {
      // Dias da semana
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      // Data completa
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      });
    }
  }

  clearChat() {
    const container = document.getElementById('messages-container');
    if (container) container.innerHTML = '';
  }

  loadSessionMessages(sessionId) {
    const session = Storage.getSession(sessionId);
    if (!session) return;

    this.clearChat();

    // Re-renderizar mensagens
    session.messages.forEach(msg => {
      // Usar função existente de adicionar mensagem
      addMessageFromHistory(msg);
    });
  }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  window.sidebarController = new SidebarController();
});
```

---

## FASE 4: Visual Perplexity - Ícones e Agrupamento (1-2 horas)

### Tarefa 4.1: Configurar Ícones Lucide
**Já feito na Fase 3, verificar:**
- [ ] Lucide carregando
- [ ] Ícones aparecendo
- [ ] Função `getIconForSession()` funcionando

### Tarefa 4.2: Atualizar Cores das Mensagens (Perplexity)

**Modificar CSS das mensagens do chat:**

```css
/* Mensagem do usuário - Cinza claro */
.message.sent {
  background: var(--msg-user-bg);      /* #f3f4f6 */
  color: var(--msg-user-text);         /* #111827 */
  align-self: flex-end;
  border-radius: 16px 16px 4px 16px;
}

/* Mensagem do assistente - Verde menta */
.message.received {
  background: var(--msg-assistant-bg); /* #d1fae5 */
  color: var(--msg-assistant-text);    /* #065f46 */
  align-self: flex-start;
  border-radius: 16px 16px 16px 4px;
}
```

**Validar:**
- [ ] Usuário: Cinza claro (#f3f4f6) em vez de azul
- [ ] Assistente: Verde menta (#d1fae5) em vez de cinza
- [ ] Contraste legível (WCAG AA)
- [ ] Visual Perplexity-like

### Tarefa 4.3: Ajustar Espaçamentos e Botões

**Atualizar cores dos botões:**

```css
/* Botão primário - Teal */
.new-btn,
.send-btn {
  background: var(--primary);          /* #14b8a6 */
  color: white;
}

.new-btn:hover,
.send-btn:hover {
  background: #0f9d8e;
}
```

**Validar:**
- [ ] Gaps corretos
- [ ] Altura dos itens
- [ ] Hover states suaves
- [ ] Item ativo com borda teal (#14b8a6)

### Tarefa 4.4: Auto-Título Inteligente

```javascript
// Melhorar função generateTitle em storage.js

function generateTitle(firstMessage) {
  if (!firstMessage) return `Conversa de ${new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;

  // Limpar e truncar
  let title = firstMessage
    .replace(/\n/g, ' ')           // Quebras → espaços
    .replace(/\s+/g, ' ')          // Múltiplos espaços → um
    .trim()                        // Remove espaços extras
    .substring(0, 40);             // Máximo 40 chars

  // Adicionar reticências se truncado
  if (firstMessage.length > 40) {
    title += '...';
  }

  return title || 'Nova conversa';
}
```

---

## FASE 5: Integração e Lógica de Sessões (2-3 horas)

### Tarefa 5.1: Integrar Storage V2 com App
**Substituir storage.js antigo:**

1. Renomear `storage.js` → `storage-v1.js` (backup)
2. Renomear `storage-v2.js` → `storage.js`
3. Atualizar imports em `index.html`

### Tarefa 5.2: Modificar app.js

```javascript
// Pontos de modificação em app.js

// 1. loadHistory() - linha ~272
function loadHistory() {
  const sessionId = Storage.getCurrentSessionId();
  if (!sessionId) {
    // Criar primeira sessão
    const newId = Storage.createSession();
    Storage.setCurrentSession(newId);
    return;
  }

  const session = Storage.getSession(sessionId);
  if (!session) return;

  session.messages.forEach(msg => {
    addMessageFromHistory(msg);
  });

  // Atualizar sidebar
  window.sidebarController?.renderSessions();
}

// 2. sendMessage() - linha ~220
async function sendMessage(text) {
  // ... código existente ...

  // Salvar na sessão atual
  const sessionId = Storage.getCurrentSessionId();
  Storage.addMessageToSession(sessionId, {
    role: 'user',
    content: text,
    timestamp: new Date().toISOString()
  });

  // ... resto do código ...
}

// 3. Adicionar resposta do assistente
function handleAssistantResponse(response) {
  const sessionId = Storage.getCurrentSessionId();
  Storage.addMessageToSession(sessionId, {
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString()
  });
}
```

### Tarefa 5.3: Teste de Migração
**Testar com dados reais:**

1. Abrir app com dados antigos
2. Verificar migração automática
3. Confirmar mensagens preservadas
4. Testar criar nova sessão
5. Testar trocar entre sessões

---

## FASE 6: Testes e Validação (2-3 horas)

### Tarefa 6.1: Checklist Mobile (iPhone 11)

- [ ] Sidebar abre/fecha suavemente
- [ ] Touch targets >= 44px
- [ ] Scroll funciona na lista
- [ ] Transições suaves
- [ ] Sem problemas de z-index
- [ ] Fechar com swipe (opcional V2)

### Tarefa 6.2: Checklist Funcional

- [ ] Criar nova sessão
- [ ] Trocar entre sessões
- [ ] Auto-título gerado
- [ ] Agrupamento temporal correto
- [ ] Limpeza automática (> 20 sessões ou > 7 dias)
- [ ] Ícones contextuais aparecem
- [ ] LocalStorage não estoura limite

### Tarefa 6.3: Checklist Performance

- [ ] Bundle < 100KB (target)
- [ ] Sidebar não trava com 20 sessões
- [ ] Animações 60fps
- [ ] Sem memory leaks
- [ ] Service Worker continua funcionando

### Tarefa 6.4: Teste de Regressão

- [ ] Envio de mensagem funciona
- [ ] Reconhecimento de voz funciona
- [ ] API N8N responde
- [ ] PWA instala corretamente
- [ ] Offline mode preservado

---

## FASE 7: Deploy e Documentação (1 hora)

### Tarefa 7.1: Preparar para Deploy

```bash
# Commit das mudanças
git add .
git commit -m "feat: Sistema de sessões com sidebar (Perplexity-inspired)"

# Merge na main
git checkout main
git merge feature/session-system

# Push para GitHub
git push origin main
```

### Tarefa 7.2: Deploy Vercel

```bash
# Deploy para produção
vercel --prod
```

### Tarefa 7.3: Atualizar README

Adicionar seção sobre sistema de sessões:
- Como funciona
- Limites (20 sessões, 7 dias)
- Como usar

---

## Paleta de Cores Perplexity

### Cores Principais

```css
/* Sistema */
--primary: #14b8a6          /* Teal - botões, links, destaques */
--background: #ffffff       /* Fundo geral branco */
--surface: #f9fafb         /* Superfícies, cards */

/* Mensagens */
--msg-user-bg: #f3f4f6      /* Cinza claro - usuário */
--msg-user-text: #111827    /* Texto escuro */
--msg-assistant-bg: #d1fae5 /* Verde menta - assistente */
--msg-assistant-text: #065f46 /* Verde escuro */

/* Sidebar */
--sidebar-bg: #fafafa       /* Fundo sidebar */
--item-hover: #f3f4f6       /* Hover item */
--item-active: #e5e7eb      /* Item selecionado */

/* Texto */
--text-primary: #111827     /* Títulos, texto principal */
--text-secondary: #6b7280   /* Subtítulos, metadata */
--text-tertiary: #9ca3af    /* Labels, placeholders */

/* Bordas */
--border-color: #e5e7eb     /* Bordas padrão */
--border-hover: #d1d5db     /* Bordas em hover */
```

### Visual Reference

**Mensagens:**
- **Usuário:** Cinza claro `#f3f4f6` (antes era azul `#2563eb`)
- **Assistente:** Verde menta `#d1fae5` (antes era cinza claro)

**Botões:**
- **Primário:** Teal `#14b8a6` (antes era azul `#2563eb`)
- **Hover:** Teal escuro `#0f9d8e`

**Sidebar:**
- **Background:** Cinza muito claro `#fafafa`
- **Item ativo:** Cinza médio `#e5e7eb` + borda teal 2px

---

## Especificações Técnicas

### Constantes e Configurações

```javascript
// config.js adicionar:
const SESSION_CONFIG = {
  MAX_SESSIONS: 20,
  MAX_AGE_DAYS: 7,
  AUTO_NEW_SESSION_HOURS: 24, // Não usado em V1
  TITLE_MAX_LENGTH: 40,
  ENABLE_DESKTOP_SIDEBAR: false // V2
};
```

### Estrutura de Dados Final

```javascript
// LocalStorage: 'alfred_sessions'
{
  version: 2,
  currentSessionId: "uuid-atual",
  sessions: {
    "uuid-1": {
      id: "uuid-1",
      title: "Qual minha agenda hoje?",
      messages: [
        {
          id: "msg-uuid",
          role: "user|assistant",
          content: "texto",
          timestamp: "ISO-8601",
          type: "generic|error",
          metadata: {}
        }
      ],
      createdAt: "ISO-8601",
      updatedAt: "ISO-8601"
    }
  },
  settings: {
    maxSessions: 20,
    maxAge: 7
  },
  lastCleaned: "ISO-8601"
}
```

### Pontos de Atenção

1. **Migração:** Sempre preservar dados antigos
2. **Performance:** Não carregar todas sessões na memória
3. **UX:** Transições devem ser < 200ms
4. **Acessibilidade:** Manter ARIA labels
5. **Mobile:** Touch targets >= 44px
6. **Limite:** LocalStorage ~5-10MB máximo

---

## Validação Final

### Critérios de Sucesso

- [ ] **Funcional:** Todas features funcionando
- [ ] **Performance:** Bundle < 100KB, carrega < 2s
- [ ] **UX:** Interface intuitiva e responsiva
- [ ] **Mobile:** Perfeito no iPhone 11
- [ ] **Código:** Limpo e manutenível
- [ ] **Backward Compatible:** Dados antigos migrados

### Rollback Plan

Se algo der errado:
1. `git checkout main` - voltar versão anterior
2. `localStorage.getItem('alfred_data_v1_backup')` - recuperar backup
3. Deploy rápido da versão anterior

---

## Tempo Total Estimado

| Fase | Tempo | Complexidade |
|------|-------|-------------|
| Fase 1 | 1-2h | Baixa |
| Fase 2 | 2-3h | Média |
| Fase 3 | 3-4h | Alta |
| Fase 4 | 1-2h | Baixa |
| Fase 5 | 2-3h | Média |
| Fase 6 | 2-3h | Média |
| Fase 7 | 1h | Baixa |
| **Total** | **12-18h** | **Média-Alta** |

---

## Notas Finais

- **Prioridade:** Mobile (iPhone 11)
- **Desktop:** Implementar apenas se sobrar tempo
- **Complexidade:** Adiciona ~470 linhas ao projeto
- **Dependência:** Apenas Lucide Icons (3KB)
- **Risk:** Médio (backup e rollback disponíveis)

**Este documento é autocontido.** Qualquer desenvolvedor pode seguir estas instruções sem contexto adicional do projeto.

---

**Última atualização:** 2025-10-24
**Versão do plano:** 1.0
**Status:** Pronto para execução