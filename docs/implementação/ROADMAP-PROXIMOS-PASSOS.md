# 🗺️ Roadmap - Próximos Passos do Alfred

## 📋 Índice

1. [Contexto do Projeto](#contexto-do-projeto)
2. [Estado Atual](#estado-atual)
3. [Fase 1: Ajustes Finais (Curto Prazo)](#fase-1-ajustes-finais-curto-prazo)
4. [Fase 2: Robustez e Confiabilidade (Médio Prazo)](#fase-2-robustez-e-confiabilidade-médio-prazo)
5. [Fase 3: Funcionalidades V2 (Longo Prazo)](#fase-3-funcionalidades-v2-longo-prazo)
6. [Checklist de Validação](#checklist-de-validação)

---

## 📌 Contexto do Projeto

### **O Que é Alfred**

Assistente pessoal AI para Ricardo Borges (Rica), conectando interface PWA web com workflows N8N via webhook.

**Stack Tecnológico:**
- **Frontend:** HTML + CSS + JavaScript puro (PWA)
- **Backend:** N8N (workflows AI)
- **LLM:** GPT-4.1-mini (OpenAI)
- **TTS:** Elevenlabs
- **Hosting:** Vercel (frontend) + Easypanel (N8N)

---

## ✅ Estado Atual (Versão 1.1.3)

### **Já Implementado:**

**Frontend:**
- ✅ Interface de chat responsiva (mobile-first)
- ✅ Input por texto e voz (Web Speech API)
- ✅ Histórico persistente (LocalStorage)
- ✅ PWA completo instalável
- ✅ Tratamento robusto de erros
- ✅ Offline-first

**Backend (N8N):**
- ✅ Workflow "Alfred Final" otimizado
- ✅ Personal Assistant com personalidade integrada
- ✅ 11 ferramentas diretas (Gmail, Calendar, Drive)
- ✅ Simple Memory (Context Window 20)
- ✅ Text-to-Speech (Elevenlabs)
- ✅ Session key corrigido (`userId`)
- ✅ Arquitetura simplificada (sem sub-agents)

**Performance:**
- ✅ Bundle: 36KB
- ✅ Latência: 2-3s
- ✅ Custo: ~$0.73-$1.23/mês

---

## 🎯 Fase 1: Ajustes Finais (Curto Prazo)

**Objetivo:** Refinar configurações finais antes de uso intensivo.

**Prazo:** 1-2 horas
**Prioridade:** 🟡 Média
**Complexidade:** ⭐ Baixa

---

### **Tarefa 1.1: Atualizar System Prompt do Personal Assistant**

**Por quê:**
System prompt ainda menciona "Email Agent" e "Calendar Agent" que foram removidos na otimização. Atualizar deixa mais preciso e pode melhorar decisões do LLM.

**Onde:**
N8N → Workflow "Alfred Final" → Node "Personal Assistant" → System Message

**Arquivo de referência:** `/mnt/c/Users/ricar/Downloads/Alfred Final.json` (linha 9)

#### **Subtarefas:**

**1.1.1 - Abrir N8N e localizar node**
```
1. Acessar: https://n8n-n8n.l1huim.easypanel.host/
2. Login
3. Abrir workflow "Alfred Final"
4. Clicar no node "Personal Assistant"
5. Expandir "Options" → "System Message"
```

**1.1.2 - Substituir texto do System Prompt**

**TROCAR:**
```
Tools Available:
- Email Agent → Handles all email-related tasks
- Calendar Agent → Manages calendar events
- Calculator → Performs mathematical calculations
- Company Knowledge → Retrieves AI Workshop/Skool information
- Personal Expenses → Tracks personal expenses
- Google Drive Agent → Handles all Drive operations
```

**POR:**
```
Tools Available (use directly):

EMAIL TOOLS:
- Send Email → Compose and send messages
- Reply to Email → Respond to emails (requires message ID)
- Get Received Emails → Retrieve received messages
- Get Single Email → Retrieve specific email (requires message ID)

CALENDAR TOOLS:
- Create Event → Create calendar events
- Update Event → Modify event (requires event ID)
- Delete Event → Remove event (requires event ID)
- Find Multiple Events → Retrieve multiple events
- Find Single Event → Retrieve specific event (requires event ID)

DRIVE TOOLS:
- Search Files and Folders → Search Drive
- Download File → Download from Drive (requires file ID)
- Share File → Share with others (requires file ID)

OTHER TOOLS:
- Calculator → Mathematical calculations
- Company Knowledge → AI Workshop/Skool information
- Personal Expenses → Track expenses
```

**1.1.3 - Salvar e validar**
```
1. Clicar "Save" no node
2. Clicar "Save" no workflow (canto superior direito)
3. Testar: "Quais meus últimos 3 emails?"
4. Verificar: resposta funciona normalmente
```

**Validação:**
- [ ] System prompt atualizado
- [ ] Workflow salvo
- [ ] Teste funcional passou

---

### **Tarefa 1.2: Testar Workflow no iPhone 11**

**Por quê:**
Dispositivo principal de uso. Validar performance, UX e funcionalidades.

#### **Subtarefas:**

**1.2.1 - Teste de Funcionalidades Básicas**

```
Local: iPhone 11 Safari
URL: https://alfred-pennyworth.vercel.app/

Testes:
1. [ ] Abrir PWA (instalar se não instalado)
2. [ ] Enviar mensagem texto: "Qual é meu nome?"
3. [ ] Validar: resposta em ~2-3s
4. [ ] Enviar mensagem voz: "Quais meus próximos compromissos?"
5. [ ] Validar: transcrição + resposta
6. [ ] Verificar: histórico persiste (recarregar página)
```

**1.2.2 - Teste de Memória**

```
Sequência:
1. Mensagem: "Meu nome é Ricardo Borges"
2. Aguardar resposta
3. Mensagem: "Trabalho com móveis personalizados"
4. Aguardar resposta
5. Mensagem: "Qual é meu nome e onde trabalho?"
6. Validar: Alfred lembra ambas informações
```

**Resultado esperado:**
```
"Rica, seu nome é Ricardo Borges e você trabalha com móveis personalizados."
```

**1.2.3 - Teste de Ferramentas**

```
Email:
1. [ ] "Quais meus últimos emails?"
2. [ ] Validar: lista de emails

Calendar:
1. [ ] "Quais meus compromissos hoje?"
2. [ ] Validar: lista de eventos

Drive:
1. [ ] "Busque arquivos com 'proposta' no Drive"
2. [ ] Validar: lista de arquivos
```

**1.2.4 - Teste de TTS (Text-to-Speech)**

```
1. Enviar qualquer mensagem
2. Aguardar resposta
3. Verificar: áudio é retornado?
4. Verificar: áudio reproduz corretamente?
```

**Nota:** Se TTS não estiver funcionando no frontend, é esperado (frontend não implementa ainda). Validar apenas que backend gera áudio.

**Validação Completa:**
- [ ] Funcionalidades básicas OK
- [ ] Memória funciona (20 mensagens)
- [ ] Ferramentas funcionam
- [ ] Performance satisfatória (< 4s)

---

### **Tarefa 1.3: Documentar Custos Reais**

**Por quê:**
Validar estimativas teóricas vs uso real.

#### **Subtarefas:**

**1.3.1 - Configurar monitoramento OpenAI**

```
1. Acessar: https://platform.openai.com/usage
2. Login
3. Anotar uso atual (baseline)
4. Configurar alerta:
   - Settings → Billing → Usage Limits
   - Hard limit: $5/mês
   - Email alert: $1/mês
```

**1.3.2 - Usar Alfred normalmente por 1 semana**

```
Objetivo: Coletar dados reais de uso

Registro diário:
- Quantas mensagens enviadas?
- Quais ferramentas mais usadas?
- Algum erro ou problema?
```

**1.3.3 - Analisar custos após 1 semana**

```
1. Acessar: https://platform.openai.com/usage
2. Verificar:
   - Total de tokens usados
   - Custo em USD
   - Modelo mais usado

Calcular:
- Custo/mensagem
- Projeção mensal (x30 dias)
```

**1.3.4 - Ajustar Context Window se necessário**

**Se custo > $2/mês:**
```
1. Reduzir Context Window de 20 para 15
2. Testar: memória ainda adequada?
```

**Se custo < $0.50/mês:**
```
1. Pode aumentar Context Window para 30 (mais contexto)
```

**Validação:**
- [ ] Custos documentados
- [ ] Dentro do orçamento esperado (< $2/mês)
- [ ] Context Window ajustado se necessário

---

## 🛡️ Fase 2: Robustez e Confiabilidade (Médio Prazo)

**Objetivo:** Garantir estabilidade para uso em produção real.

**Prazo:** 2-4 horas
**Prioridade:** 🟠 Alta
**Complexidade:** ⭐⭐ Média

---

### **Tarefa 2.1: Migrar Simple Memory para Postgres Chat Memory**

**Por quê:**
Simple Memory perde histórico quando N8N reinicia. Postgres garante persistência permanente.

**Quando executar:**
Quando você experimentar N8N reiniciar (update, manutenção, crash) e perder histórico de conversas.

**Benefícios:**
- ✅ Histórico permanente (sobrevive restart)
- ✅ Funciona em queue mode (escalabilidade futura)
- ✅ Permite analytics/queries SQL
- ✅ Backup automático

#### **Subtarefas:**

**2.1.1 - Verificar acesso ao Postgres**

```
N8N Cloud/Easypanel:
1. N8N tem Postgres built-in → usar credentials n8n
2. Não precisa instalar nada

Self-hosted:
1. Verificar se Postgres está instalado
2. Se não: instalar Postgres
3. Criar database: alfred_db
```

**2.1.2 - Adicionar Postgres Chat Memory node**

```
1. Abrir workflow "Alfred Final"
2. Deletar node "Simple Memory"
3. Adicionar node: "Postgres Chat Memory"
   - Buscar: "postgres chat memory"
   - Drag & drop para canvas
```

**2.1.3 - Configurar Postgres Chat Memory**

```
Credentials:
- Type: Postgres
- Host: (usar built-in n8n postgres)
- Database: n8n (ou default)
- User: (credentials n8n)
- Password: (credentials n8n)

Node Configuration:
- Table Name: alfred_chat_history
- Session Key: ={{ $json.body.userId }}
- Context Window Length: 20
```

**2.1.4 - Conectar ao Personal Assistant**

```
1. Conectar output "ai_memory" do Postgres Chat Memory
2. Para input "ai_memory" do Personal Assistant
3. Salvar workflow
```

**2.1.5 - Testar persistência**

```
Teste 1 - Salvar informação:
1. "Meu nome é Ricardo Borges"
2. Aguardar resposta
3. Verificar tabela criada no Postgres:
   SELECT * FROM alfred_chat_history;

Teste 2 - Reiniciar N8N:
1. Restart N8N (via Easypanel)
2. Aguardar N8N voltar online

Teste 3 - Validar memória persistiu:
1. "Qual é meu nome?"
2. Validar: "Rica, seu nome é Ricardo Borges" ✅
```

**Rollback (se der problema):**
```
1. Deletar Postgres Chat Memory node
2. Re-adicionar Simple Memory node
3. Configurar:
   - Session Key: ={{ $json.body.userId }}
   - Context Window: 20
4. Reconectar ao Personal Assistant
```

**Validação:**
- [ ] Postgres Chat Memory configurado
- [ ] Conectado ao Personal Assistant
- [ ] Teste de persistência passou
- [ ] Memória sobrevive restart

---

### **Tarefa 2.2: Monitorar Custo Elevenlabs TTS**

**Por quê:**
TTS pode ser caro dependendo do uso. Validar se vale a pena manter.

**Quando executar:**
Após 1 mês de uso real.

#### **Subtarefas:**

**2.2.1 - Verificar uso Elevenlabs**

```
1. Acessar: https://elevenlabs.io/
2. Login
3. Dashboard → Usage
4. Verificar:
   - Characters used
   - Custo em USD
   - Limite do plano
```

**2.2.2 - Calcular custo real**

```
Exemplo:
- 30 mensagens/dia x 30 dias = 900 mensagens/mês
- Média 100 caracteres/resposta
- Total: 90.000 caracteres/mês

Plano Free Elevenlabs:
- 10.000 caracteres/mês grátis
- Acima: $1/10k chars

Custo estimado:
- 90k chars = $9/mês (se passar do free tier)
```

**2.2.3 - Decidir manter ou remover TTS**

**Se custo Elevenlabs > $5/mês:**

**Opção A - Desabilitar TTS temporariamente:**
```
1. Abrir workflow "Alfred Final"
2. Desconectar node "Elevenlabs"
3. Conectar "Edit Fields (Response)" direto em "Respond to Webhook1"
4. Salvar workflow
```

**Opção B - Usar TTS alternativo:**
```
Alternativas gratuitas/baratas:
- Google Cloud TTS ($4/1M chars)
- AWS Polly ($4/1M chars)
- Azure TTS ($4/1M chars)

Implementar via HTTP Request node similar ao Elevenlabs
```

**Se custo Elevenlabs < $5/mês:**
```
Manter como está. Custo justificado pela qualidade.
```

**Validação:**
- [ ] Custo TTS documentado
- [ ] Decisão tomada (manter/desabilitar/trocar)
- [ ] Implementado se necessário

---

### **Tarefa 2.3: Adicionar Logging e Debug**

**Por quê:**
Facilita troubleshooting quando algo der errado.

#### **Subtarefas:**

**2.3.1 - Adicionar logging no workflow**

```
1. Abrir workflow "Alfred Final"
2. Adicionar node "Set" após Personal Assistant:
   - Name: "Log Debug"
   - Assignments:
     - userId: ={{ $json.body.userId }}
     - message: ={{ $json.body.message }}
     - output: ={{ $json.output }}
     - timestamp: ={{ $now.toISO() }}
3. Conectar em paralelo (não bloquear fluxo principal)
```

**2.3.2 - Criar tabela de logs (opcional)**

```
Se tiver Postgres:
CREATE TABLE alfred_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  message TEXT,
  output TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

Adicionar node "Postgres" após "Log Debug"
Inserir dados na tabela
```

**2.3.3 - Configurar alertas N8N**

```
1. N8N Settings → Workflows
2. Error workflow: criar workflow de erro
3. Configurar:
   - On error: send email to ricardo.incasa@gmail.com
   - Include: workflow name, error message, timestamp
```

**Validação:**
- [ ] Logging implementado
- [ ] Logs acessíveis
- [ ] Alertas configurados

---

## 🚀 Fase 3: Funcionalidades V2 (Longo Prazo)

**Objetivo:** Adicionar features avançadas após uso estável.

**Prazo:** 4-8 horas por feature
**Prioridade:** 🟢 Baixa
**Complexidade:** ⭐⭐⭐ Alta

---

### **Feature 3.1: Respostas Formatadas por Tipo**

**Descrição:**
Alfred retorna JSON com `type` específico (email, calendar, drive) e frontend renderiza formatação rica.

**Benefícios:**
- Emails em cards com from/subject/preview
- Eventos de calendário em timeline
- Arquivos Drive com preview

#### **Subtarefas:**

**3.1.1 - Backend: Atualizar Edit Fields (Response)**

```
Atual:
{
  "type": "generic"
}

Novo:
{
  "type": "email|calendar|drive|generic",
  "metadata": {
    // Dados estruturados específicos
  }
}

Exemplo para email:
{
  "type": "email",
  "response": "Rica, você tem 3 emails não lidos.",
  "metadata": {
    "emails": [
      {
        "from": "joao@exemplo.com",
        "subject": "Proposta comercial",
        "preview": "Gostaria de discutir..."
      }
    ]
  }
}
```

**Implementação:**
1. Adicionar node "Code" após Personal Assistant
2. Detectar tipo de resposta (via keywords)
3. Estruturar metadata apropriado

**3.1.2 - Frontend: Adicionar renderizadores por tipo**

```javascript
// js/app.js

function renderMessage(message) {
  switch(message.type) {
    case 'email':
      return renderEmailCard(message);
    case 'calendar':
      return renderCalendarTimeline(message);
    case 'drive':
      return renderDriveList(message);
    default:
      return renderGenericMessage(message);
  }
}

function renderEmailCard(message) {
  // Criar card HTML com email data
}
```

**3.1.3 - CSS: Estilos para tipos**

```css
/* css/style.css */

.message-email {
  /* Card de email */
}

.message-calendar {
  /* Timeline de eventos */
}

.message-drive {
  /* Lista de arquivos */
}
```

**Estimativa:** 6-8 horas
**Dificuldade:** ⭐⭐⭐

**Validação:**
- [ ] Backend retorna type correto
- [ ] Frontend renderiza formatação rica
- [ ] CSS aplicado corretamente
- [ ] Testado em mobile

---

### **Feature 3.2: Atalhos Rápidos**

**Descrição:**
Botões na interface para perguntas frequentes.

**Exemplos:**
- "📧 Últimos emails"
- "📅 Agenda hoje"
- "📁 Arquivos recentes"

#### **Subtarefas:**

**3.2.1 - Frontend: Adicionar botões de atalho**

```html
<!-- index.html -->

<div id="shortcuts" class="shortcuts-container">
  <button class="shortcut-button" data-message="Quais meus últimos 3 emails?">
    📧 Últimos emails
  </button>
  <button class="shortcut-button" data-message="Qual minha agenda hoje?">
    📅 Agenda hoje
  </button>
  <button class="shortcut-button" data-message="Busque arquivos recentes no Drive">
    📁 Arquivos recentes
  </button>
</div>
```

**3.2.2 - JavaScript: Implementar funcionalidade**

```javascript
// js/app.js

function initShortcuts() {
  const shortcuts = document.querySelectorAll('.shortcut-button');

  shortcuts.forEach(button => {
    button.addEventListener('click', () => {
      const message = button.dataset.message;
      messageInput.value = message;
      handleSendMessage();
    });
  });
}
```

**3.2.3 - CSS: Estilizar atalhos**

```css
/* css/style.css */

.shortcuts-container {
  display: flex;
  gap: 8px;
  padding: 12px;
  overflow-x: auto;
}

.shortcut-button {
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--surface);
  white-space: nowrap;
}
```

**Estimativa:** 2-3 horas
**Dificuldade:** ⭐⭐

**Validação:**
- [ ] Atalhos visíveis na interface
- [ ] Clique envia mensagem automaticamente
- [ ] Responsivo em mobile

---

### **Feature 3.3: Dark Mode**

**Descrição:**
Modo escuro para uso noturno.

#### **Subtarefas:**

**3.3.1 - CSS: Variáveis de tema**

```css
/* css/style.css */

:root {
  /* Light theme (default) */
  --background: #ffffff;
  --surface: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary: #2563eb;
}

[data-theme="dark"] {
  /* Dark theme */
  --background: #111827;
  --surface: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --primary: #3b82f6;
}
```

**3.3.2 - JavaScript: Toggle tema**

```javascript
// js/app.js

function initThemeToggle() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleButton = document.getElementById('theme-toggle');
  toggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}
```

**3.3.3 - HTML: Botão de toggle**

```html
<!-- index.html -->

<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
  🌙 <!-- Ícone lua -->
</button>
```

**Estimativa:** 3-4 horas
**Dificuldade:** ⭐⭐

**Validação:**
- [ ] Toggle funciona
- [ ] Tema persiste (localStorage)
- [ ] Todos elementos adaptam cores
- [ ] Testado em mobile

---

### **Feature 3.4: Sincronização Multi-Device (Avançado)**

**Descrição:**
Histórico sincronizado entre devices (iPhone + Desktop).

**Requisitos:**
- Backend para armazenar histórico
- Supabase ou Firebase

**Complexidade:** ⭐⭐⭐⭐ Muito Alta
**Estimativa:** 12-16 horas

**Decisão:** Implementar apenas se realmente necessário (uso multi-device intenso).

---

## ✅ Checklist de Validação

### **Após Fase 1:**
- [ ] System prompt atualizado
- [ ] Testes no iPhone 11 passaram
- [ ] Custos documentados (< $2/mês)

### **Após Fase 2:**
- [ ] Postgres Chat Memory funcionando
- [ ] Memória persiste após restart
- [ ] Custo TTS documentado e decisão tomada
- [ ] Logging implementado

### **Após Fase 3 (Features):**
- [ ] Feature implementada e testada
- [ ] Performance mantida (< 4s)
- [ ] Mobile funciona corretamente
- [ ] Documentação atualizada

---

## 📚 Referências

**Documentação do Projeto:**
- `/CLAUDE.md` - Contexto completo do projeto
- `/README.md` - Visão geral e status
- `/docs/PLANO-EXECUCAO.md` - Histórico de fases
- `/CHANGELOG.md` - Log de mudanças

**Arquivos Importantes:**
- `/index.html` - Frontend principal
- `/js/app.js` - Lógica principal
- `/js/api.js` - Comunicação N8N
- `/n8n/arquivos/Alfred Final.json` - Workflow N8N

**URLs:**
- Frontend: https://alfred-pennyworth.vercel.app/
- N8N: https://n8n-n8n.l1huim.easypanel.host/
- Webhook: https://n8n-n8n.l1huim.easypanel.host/webhook/0c689264-8178-477c-a366-66559b14cf16

---

## 🎯 Resumo Executivo

**Fase 1 (Curto Prazo) - 1-2h:**
- Refinar configurações finais
- Testar no iPhone 11
- Documentar custos reais

**Fase 2 (Médio Prazo) - 2-4h:**
- Migrar para Postgres (histórico permanente)
- Monitorar custo TTS
- Adicionar logging

**Fase 3 (Longo Prazo) - 4-8h cada:**
- Respostas formatadas (cards, timeline)
- Atalhos rápidos
- Dark mode
- Multi-device (opcional)

**Priorização Sugerida:**
1. 🔴 Fase 1 → Executar em 1 semana
2. 🟠 Fase 2 → Executar após 1 mês de uso
3. 🟢 Fase 3 → Executar quando sentir necessidade

---

**Última atualização:** 2025-10-24
**Versão:** 1.0
**Status:** Pronto para execução

---

**Nota:** Este documento é auto-contido. Um novo chat sem contexto pode seguir este roadmap do zero para implementar próximas features do Alfred.
