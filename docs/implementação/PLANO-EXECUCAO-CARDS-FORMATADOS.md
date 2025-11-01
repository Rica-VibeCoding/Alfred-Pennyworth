# Plano de Execução - Sistema de Cards Formatados (V2)

> **Documento Autocontido**: Este plano pode ser executado sem contexto prévio
> **Criado em**: 2025-10-26
> **Última atualização**: 2025-10-26 23:45 (Fases 0-3 completas)
> **Status**: Em execução - Fase 4 pendente
> **Estimativa**: 16 horas (~2 dias de trabalho)
> **Progresso**: 62.5% (10h de 16h)

---

## 📍 ESTADO ATUAL DA IMPLEMENTAÇÃO

**Última atualização:** 2025-10-26 23:45

### ✅ Completo (10h de 16h - 62.5%)

**Fase 0: Preparação (30min)** ✅
- ✅ Verificações do ambiente
- ✅ Arquivos críticos confirmados
- ✅ Modo TESTE ativo

**Fase 1: Frontend CSS (4.5h)** ✅
- ✅ `css/cards.css` criado (283 linhas) - **FORMATO INLINE**
- ✅ `index.html` modificado (adicionado link para cards.css)
- ✅ `test-cards.html` criado (8 exemplos de cards)
- ✅ Hierarquia visual aplicada (labels cinza, valores preto, links teal)
- ✅ Responsivo mobile-first (375px)

**Fase 2: Frontend JS (3h)** ✅
- ✅ `js/cards.js` criado (299 linhas)
- ✅ `js/app.js` modificado (4 funções: addMessage, handleSendMessage, loadHistory, addMessageFromHistory)
- ✅ `index.html` atualizado (cards.js carrega antes de app.js - linha 167)
- ✅ `test-render-cards.html` criado
- ✅ Code review (vanilla-js-reviewer)
- ⚠️ **NOTA:** Vulnerabilidade XSS identificada (innerHTML) - aceita pelo usuário, não corrigida

**Fase 3: N8N Detecção (2h)** ✅
- ✅ Code Node "Detect Response Type" criado (workflow "Afrad" - ID: IDUyPeVInIY2MIJp)
- ✅ Code Node "Format Card Data" criado
- ✅ Conexões: Personal Assistant → Detect Response Type → Format Card Data → Edit Fields (Response)
- ✅ Workflow salvo e testado
- ✅ Código: detecção de 4 tipos (email, evento, financeiro, contato) + extração de dados via regex

### 🔜 Pendente (6h restantes)

**Fase 4: N8N Formatação (1h)** ← PRÓXIMA (5 minutos)
- ⏳ Modificar "Edit Fields (Response)" - 2 campos
  - Campo "type": trocar `"generic"` por `{{ $json.card_type || 'generic' }}`
  - Campo "metadata": trocar `{}` por `{{ { card_data: $json.card_data || {} } }}`

**Fase 5: Testes (3h)**
- ⏳ 8 cenários de teste end-to-end
- ⏳ Validar cards renderizam no app

**Fase 6: Deploy (2.5h)**
- ⏳ Commit e push
- ⏳ Ativar modo produção (trocar webhook)
- ⏳ Documentação final

### 📂 Arquivos Criados/Modificados

**✅ Criados:**
- `/css/cards.css` (283 linhas) - estilos inline, 4 tipos de cards
- `/test-cards.html` (196 linhas) - 8 cards estáticos para teste visual
- `/js/cards.js` (299 linhas) - módulo de renderização com API `Cards.renderCard()`
- `/test-render-cards.html` (71 linhas) - teste de renderização dinâmica JavaScript

**✅ Modificados:**
- `/index.html`
  - Linha 18: `<link rel="stylesheet" href="css/cards.css">`
  - Linha 167: `<script src="js/cards.js"></script>`
- `/js/app.js` (4 funções)
  - `addMessage()` - agora aceita `cardType` e `metadata`
  - `handleSendMessage()` - detecta tipo de card na resposta
  - `loadHistory()` - passa cardType ao carregar histórico
  - `addMessageFromHistory()` - renderiza cards salvos

**✅ Workflow N8N (Afrad - IDUyPeVInIY2MIJp):**
- ✅ Node "Detect Response Type" (Code) - detecta tipo de resposta
- ✅ Node "Format Card Data" (Code) - extrai dados estruturados
- ⏳ Node "Edit Fields (Response)" - **PENDENTE modificação Fase 4**

**Pendentes de modificação:**
- Workflow N8N "Edit Fields (Response)" (Fase 4 - 2 campos)

---

## 🎯 PRÓXIMO PASSO (FASE 4) - INSTRUÇÕES EXATAS

**Para novo chat continuar sem contexto:**

### Tarefa: Modificar "Edit Fields (Response)" no N8N

**Local:** Workflow "Afrad" (ID: `IDUyPeVInIY2MIJp`)
**URL:** `https://n8n-n8n-editor.neldoo.easypanel.host/`
**Tempo:** 5 minutos

**Passos:**

1. **Abrir workflow:**
   - N8N Editor → Workflows → "Afrad"
   - Localizar node "Edit Fields (Response)" (Set node)

2. **Modificar Campo 1 - "type":**
   - **ATUAL:** `"generic"` (string fixa)
   - **NOVO:** `={{ $json.card_type || 'generic' }}` (expressão dinâmica)
   - Modo: Expression (não Text)

3. **Modificar Campo 2 - "metadata":**
   - **ATUAL:** `{}` (objeto vazio)
   - **NOVO:** `={{ { card_data: $json.card_data || {} } }}` (objeto dinâmico)
   - Modo: Expression (não Text)

4. **Salvar:**
   - Clicar "Save" (Ctrl+S)
   - Workflow atualizado

**Validação:**
- ✅ Campo "type" recebe valor de `$json.card_type`
- ✅ Campo "metadata" recebe objeto `{ card_data: {...} }`
- ✅ Fallback para "generic" e `{}` se vazio

**Após Fase 4:**
- Seguir para **Fase 5: Testes** (8 cenários end-to-end)

---

## ⚠️ IMPORTANTE - ALTERAÇÕES DE DESIGN

**Decisão tomada em 2025-10-26:**

O design dos cards foi **modificado para formato INLINE** (label: valor na mesma linha) ao invés do formato vertical original (label acima, valor abaixo).

**Motivo:** Mobile-first (iPhone 11 - 375px). Formato inline é mais compacto e produtivo.

**Exemplo:**
```
✅ ATUAL (inline):
De: João Silva <joao@example.com>
Assunto: Proposta Móveis

❌ ORIGINAL (vertical - descartado):
DE
João Silva <joao@example.com>
ASSUNTO
Proposta Móveis
```

**Hierarquia visual aplicada:**
- Labels: Negrito, cinza médio (#6b7280)
- Valores: Normal, preto (#111827)
- Preview: Cinza claro (#6b7280)
- Links: Teal (#14b8a6), peso 500

---

## Sumário

1. [Contexto do Projeto](#contexto-do-projeto)
2. [Decisões Técnicas](#decisões-técnicas)
3. [Arquitetura da Solução](#arquitetura-da-solução)
4. [Fases de Implementação](#fases-de-implementação)
5. [Checklist de Validação](#checklist-de-validação)
6. [Rollback e Troubleshooting](#rollback-e-troubleshooting)

---

## Contexto do Projeto

### O que é Alfred?

**Alfred** é um assistente pessoal PWA que se comunica com N8N via webhook para:
- Consultar emails (Gmail)
- Verificar agenda (Google Calendar)
- Acessar dados do Supabase (contatos, faturamento)
- Gerenciar arquivos (Google Drive)

**Estado Atual (V1):**
- Interface: Chat simples com mensagens de texto
- N8N retorna: Texto puro
- Frontend renderiza: Bubbles de texto (`textContent`)

**Objetivo (V2):**
- N8N retorna: Dados estruturados + tipo de card
- Frontend renderiza: Cards visuais formatados (email, evento, financeiro, contato)

---

### Por que Cards Formatados?

**Antes (texto):**
```
"Você tem um email de João Silva com assunto 'Proposta Móveis'
recebido em 25/10/2025. O email diz: Segue proposta conforme..."
```

**Depois (card):**
```
┌─────────────────────────────┐
│ 📧 Email não lido           │
├─────────────────────────────┤
│ De: João Silva              │
│ Assunto: Proposta Móveis    │
│ 25/10/2025 - 14:30          │
│ "Segue proposta conforme..." │
└─────────────────────────────┘
```

**Benefícios:**
- ✅ Informação escaneável visualmente
- ✅ Densidade de informação maior
- ✅ Interface profissional
- ✅ Preparação para interatividade (V3)

---

## Decisões Técnicas

### ✅ Decisões Confirmadas

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| **Ícones** | Unicode Emoji (📧📅💰📞) | Zero bytes, nativo, funciona em todos OS |
| **Renderização** | Pure CSS + JavaScript | Zero dependências, total controle |
| **Tipos Iniciais** | 4 cards (email, evento, financeiro, contato) | Cobre 80% dos casos de uso |
| **Storage** | LocalStorage (Storage V2 existente) | Device-specific, offline-first, já implementado |
| **Fallback** | Sempre incluir campo `response` com texto | Backward compatibility, safety net |
| **Interatividade** | Apenas visualização (V2), ações depois (V3) | Iterativo, menor risco |

---

### Stack Tecnológico

**Frontend:**
- HTML5 semântico
- CSS3 (custom properties, flexbox)
- JavaScript ES6+ (vanilla, zero frameworks)
- LocalStorage API

**Backend:**
- N8N (workflow automation)
- Webhook trigger
- AI Agent (GPT-4o-mini)
- Code Nodes (JavaScript)
- Supabase (PostgreSQL - opcional V3)

**Integrations:**
- Gmail API
- Google Calendar API
- Google Drive API
- Supabase REST API

---

## Arquitetura da Solução

### Fluxo de Dados (End-to-End)

```
┌─────────────┐
│   Usuário   │ "Mostre meus emails"
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Alfred PWA (Frontend)              │
│  - Captura mensagem                 │
│  - POST para N8N webhook            │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  N8N Workflow "Alfred"              │
│  ┌───────────────────────────────┐  │
│  │ 1. Webhook Trigger            │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ 2. AI Agent + Gmail Tool      │  │
│  │    - Busca emails             │  │
│  │    - GPT-4 processa           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ 3. Code Node: Detect Type     │  │ ← NOVO
│  │    - Analisa resposta         │  │
│  │    - Identifica tipo de dado  │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ 4. Code Node: Format Card     │  │ ← NOVO
│  │    - Extrai campos            │  │
│  │    - Cria card_data           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ 5. Edit Fields (Response)     │  │ ← MODIFICADO
│  │    - Adiciona type            │  │
│  │    - Adiciona metadata        │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ 6. Respond to Webhook         │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       ▼ JSON Response
{
  "success": true,
  "response": "Você tem 3 emails...",
  "type": "card_email",
  "timestamp": "2025-10-26T...",
  "metadata": {
    "card_data": {
      "de": "João Silva",
      "assunto": "Proposta Móveis",
      ...
    }
  }
}
       │
       ▼
┌─────────────────────────────────────┐
│  Alfred PWA (Frontend)              │
│  ┌───────────────────────────────┐  │
│  │ api.js: Recebe resposta       │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ app.js: renderMessage()       │  │ ← NOVO
│  │  - Detecta type               │  │
│  │  - Chama renderCard()         │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ cards.js: renderCard()        │  │ ← NOVO
│  │  - Switch por tipo            │  │
│  │  - createEmailCard()          │  │
│  │  - createEventCard()          │  │
│  │  - createFinanceCard()        │  │
│  │  - createContactCard()        │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ DOM: Adiciona card ao chat    │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │ storage-v2.js: Salva          │  │ ← JÁ EXISTE
│  │  - LocalStorage               │  │
│  │  - Inclui type + metadata     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

### Estrutura de Arquivos (Antes vs Depois)

**ANTES (V1):**
```
/
├── js/
│   ├── app.js          # Lógica principal
│   ├── api.js          # Comunicação N8N
│   ├── storage-v2.js   # LocalStorage
│   ├── sidebar.js      # Histórico
│   └── speech.js       # Voz
├── css/
│   └── style.css       # Estilos
└── index.html
```

**DEPOIS (V2):**
```
/
├── js/
│   ├── app.js          # Lógica principal (MODIFICADO)
│   ├── api.js          # Comunicação N8N
│   ├── storage-v2.js   # LocalStorage
│   ├── sidebar.js      # Histórico (MODIFICADO)
│   ├── speech.js       # Voz
│   └── cards.js        # Renderização de cards (NOVO)
├── css/
│   ├── style.css       # Estilos base
│   └── cards.css       # Estilos dos cards (NOVO)
└── index.html          # (MODIFICADO - adiciona cards.css e cards.js)
```

---

### Formato de Dados

#### Tipos de Cards Implementados

**1. card_email**
```json
{
  "type": "card_email",
  "response": "Você tem um email de João Silva sobre Proposta Móveis",
  "metadata": {
    "card_data": {
      "de": "João Silva",
      "email_de": "joao@example.com",
      "assunto": "Proposta Móveis",
      "preview": "Segue proposta conforme conversamos...",
      "data": "2025-10-25T14:30:00Z",
      "lido": false,
      "message_id": "18c2f3a1b2d4e5f6"
    }
  }
}
```

**2. card_evento**
```json
{
  "type": "card_evento",
  "response": "Você tem reunião com Cliente X hoje às 08:30",
  "metadata": {
    "card_data": {
      "titulo": "Reunião Cliente X",
      "data": "2025-10-26",
      "horario_inicio": "08:30",
      "horario_fim": "09:30",
      "local": "Escritório",
      "participantes": ["João", "Maria"],
      "event_id": "abc123def456"
    }
  }
}
```

**3. card_financeiro**
```json
{
  "type": "card_financeiro",
  "response": "Faturamento de Outubro: R$ 325.000 liberado",
  "metadata": {
    "card_data": {
      "titulo": "Faturamento Movelmar Outubro",
      "periodo": "Outubro 2025",
      "liberado": 325000,
      "pendente": 98000,
      "bloqueado": 250000,
      "moeda": "BRL"
    }
  }
}
```

**4. card_contato**
```json
{
  "type": "card_contato",
  "response": "Contato encontrado: João Silva da Movelmar",
  "metadata": {
    "card_data": {
      "nome": "João Silva",
      "empresa": "Movelmar Indústria",
      "cargo": "Diretor Comercial",
      "telefone": "(11) 98765-4321",
      "email": "joao.silva@movelmar.com.br",
      "tags": ["cliente", "prioritário"]
    }
  }
}
```

---

## Fases de Implementação

### Visão Geral

| Fase | Descrição | Duração | Dependências |
|------|-----------|---------|--------------|
| **Fase 0** | Preparação e backup | 30min | Nenhuma |
| **Fase 1** | Frontend - CSS dos cards | 4h | Fase 0 |
| **Fase 2** | Frontend - Lógica de renderização | 3h | Fase 1 |
| **Fase 3** | N8N - Detecção de tipos | 2h | Fase 0 |
| **Fase 4** | N8N - Formatação de cards | 3h | Fase 3 |
| **Fase 5** | Integração e testes | 3h | Fases 2 + 4 |
| **Fase 6** | Deploy e validação | 30min | Fase 5 |

---

## FASE 0: Preparação e Backup

**Objetivo:** Garantir ponto de retorno seguro

### Tarefas

#### Tarefa 0.1: Backup de Arquivos
```bash
# Criar branch de backup
git checkout -b backup-pre-cards-v2
git add .
git commit -m "backup: Estado antes de implementar cards formatados V2"
git push origin backup-pre-cards-v2

# Voltar para main
git checkout main
git pull origin main
```

**Critério de aceite:** Branch `backup-pre-cards-v2` existe no repositório remoto

---

#### Tarefa 0.2: Backup do Workflow N8N

1. Acesse N8N: `https://n8n-n8n-editor.neldoo.easypanel.host/`
2. Abra workflow "Alfred" (ID: `IDUyPeVInIY2MIJp`)
3. Menu (⋯) → Download
4. Salve como: `n8n/fluxos/backup/Alfred-pre-cards-v2-2025-10-26.json`
5. Commit:
```bash
git add n8n/fluxos/backup/
git commit -m "backup: Workflow Alfred antes de cards V2"
git push
```

**Critério de aceite:** Arquivo de backup salvo e commitado

---

#### Tarefa 0.3: Verificar Estado Atual

```bash
# Confirmar que está em modo TESTE
cat config.js | grep WEBHOOK_URL
# Deve retornar: webhook-test/0c689264...

# Verificar arquivos críticos existem
ls -la js/app.js js/api.js js/storage-v2.js css/style.css index.html

# Testar PWA funciona
# Abrir http://127.0.0.1:5500 e enviar mensagem teste
```

**Critério de aceite:**
- ✅ Modo teste ativo
- ✅ Todos arquivos existem
- ✅ App funciona normalmente

---

## FASE 1: Frontend - CSS dos Cards

**Objetivo:** Criar estilos visuais para os 4 tipos de cards

**Duração:** 4 horas

---

### Tarefa 1.1: Criar arquivo `css/cards.css`

**Arquivo:** `/css/cards.css`

**Conteúdo:**
```css
/* ============================================
   CARDS FORMATADOS - ALFRED V2
   Criado: 2025-10-26
   Tipos: email, evento, financeiro, contato
   ============================================ */

/* ==================== BASE ==================== */

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  max-width: 400px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.card-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.card-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
}

.card-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-field-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-field-value {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
}

.card-field-value.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ==================== EMAIL ==================== */

.card-email .card-badge.unread {
  background: #fef2f2;
  color: #991b1b;
}

.card-email .card-badge.read {
  background: #f3f4f6;
  color: #6b7280;
}

.card-email .card-field-value.preview {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ==================== EVENTO ==================== */

.card-evento .card-header {
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  margin: -16px -16px 12px -16px;
  padding: 16px;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #d1fae5;
}

.card-evento .card-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
}

.card-evento .card-field-value.participants {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-evento .participant-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: #f3f4f6;
  color: var(--text-primary);
  border-radius: 12px;
  border: 1px solid var(--border);
}

/* ==================== FINANCEIRO ==================== */

.card-financeiro .card-header {
  background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
  margin: -16px -16px 12px -16px;
  padding: 16px;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #fde68a;
}

.card-financeiro .card-body {
  gap: 12px;
}

.card-financeiro .finance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--surface);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.card-financeiro .finance-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.card-financeiro .finance-value {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.card-financeiro .finance-value.positive {
  color: #059669;
}

.card-financeiro .finance-value.warning {
  color: #d97706;
}

.card-financeiro .finance-value.negative {
  color: #dc2626;
}

/* ==================== CONTATO ==================== */

.card-contato .card-header {
  background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
  margin: -16px -16px 12px -16px;
  padding: 16px;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #bfdbfe;
}

.card-contato .card-field-value a {
  color: var(--primary);
  text-decoration: none;
  transition: opacity 0.2s;
}

.card-contato .card-field-value a:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.card-contato .contact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.card-contato .tag {
  font-size: 11px;
  padding: 3px 8px;
  background: #f3f4f6;
  color: var(--text-secondary);
  border-radius: 10px;
  border: 1px solid var(--border);
}

/* ==================== RESPONSIVO ==================== */

@media (max-width: 480px) {
  .card {
    max-width: 100%;
    border-radius: 10px;
  }

  .card-icon {
    font-size: 20px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-financeiro .finance-value {
    font-size: 14px;
  }
}

/* ==================== DARK MODE (Futuro) ==================== */

@media (prefers-color-scheme: dark) {
  /* Preparado para dark mode futuro */
  .card {
    background: #1f2937;
    border-color: #374151;
  }

  .card-header {
    border-bottom-color: #374151;
  }

  .card-title {
    color: #f9fafb;
  }

  .card-field-value {
    color: #e5e7eb;
  }

  .card-field-label {
    color: #9ca3af;
  }
}
```

**Critério de aceite:**
- ✅ Arquivo criado em `/css/cards.css`
- ✅ Contém estilos para 4 tipos de cards
- ✅ Responsivo (mobile-first)
- ✅ Usa CSS variables do projeto

---

### Tarefa 1.2: Adicionar cards.css ao index.html

**Arquivo:** `/index.html`

**Modificação:**
```html
<!-- ANTES -->
<link rel="stylesheet" href="css/style.css">

<!-- DEPOIS -->
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/cards.css">
```

**Localização:** Dentro de `<head>`, após `style.css`

**Critério de aceite:**
- ✅ cards.css carrega no navegador (verificar DevTools > Network)
- ✅ Sem erros 404

---

### Tarefa 1.3: Testar CSS isoladamente

**✅ COMPLETO - Arquivo criado com formato INLINE**

**Arquivo:** `/test-cards.html`

**Contém:**
- 8 exemplos de cards (2 emails, 2 eventos, 1 financeiro, 2 contatos)
- Scroll vertical para visualizar todos
- Formato inline: `<span class="card-field-label">Label:</span> Valor`

**Exemplo de estrutura (formato inline):**

```html
<!-- Card Email (formato inline) -->
<div class="card card-email">
  <div class="card-header">
    <span class="card-icon">📧</span>
    <h3 class="card-title">Proposta Móveis</h3>
    <span class="card-badge unread">Não lido</span>
  </div>
  <div class="card-body">
    <div class="card-field">
      <span class="card-field-label">De:</span> João Silva &lt;joao@example.com&gt;
    </div>
    <div class="card-field">
      <span class="card-field-label">Assunto:</span> Proposta Móveis
    </div>
    <div class="card-field preview">
      <span class="card-field-label">Preview:</span>
      <span class="card-field-value">Segue proposta conforme conversamos...</span>
    </div>
  </div>
  <div class="card-footer">
    <span>Hoje, 14:30</span>
  </div>
</div>

    <!-- Card Evento -->
    <div class="card card-evento">
      <div class="card-header">
        <span class="card-icon">📅</span>
        <h3 class="card-title">Reunião Cliente X</h3>
      </div>
      <div class="card-body">
        <div class="card-time">
          <span>🕐</span>
          <span>Hoje, 08:30 - 09:30</span>
        </div>
        <div class="card-field">
          <span class="card-field-label">Local</span>
          <span class="card-field-value">Escritório</span>
        </div>
        <div class="card-field">
          <span class="card-field-label">Participantes</span>
          <div class="card-field-value participants">
            <span class="participant-tag">João</span>
            <span class="participant-tag">Maria</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Financeiro -->
    <div class="card card-financeiro">
      <div class="card-header">
        <span class="card-icon">💰</span>
        <h3 class="card-title">Faturamento Movelmar Outubro</h3>
      </div>
      <div class="card-body">
        <div class="finance-row">
          <span class="finance-label">Liberado</span>
          <span class="finance-value positive">R$ 325.000</span>
        </div>
        <div class="finance-row">
          <span class="finance-label">Pendente</span>
          <span class="finance-value warning">R$ 98.000</span>
        </div>
        <div class="finance-row">
          <span class="finance-label">Bloqueado</span>
          <span class="finance-value negative">R$ 250.000</span>
        </div>
      </div>
    </div>

    <!-- Card Contato -->
    <div class="card card-contato">
      <div class="card-header">
        <span class="card-icon">📞</span>
        <h3 class="card-title">João Silva</h3>
      </div>
      <div class="card-body">
        <div class="card-field">
          <span class="card-field-label">Empresa</span>
          <span class="card-field-value">Movelmar Indústria</span>
        </div>
        <div class="card-field">
          <span class="card-field-label">Cargo</span>
          <span class="card-field-value">Diretor Comercial</span>
        </div>
        <div class="card-field">
          <span class="card-field-label">Telefone</span>
          <span class="card-field-value"><a href="tel:+5511987654321">(11) 98765-4321</a></span>
        </div>
        <div class="card-field">
          <span class="card-field-label">Email</span>
          <span class="card-field-value"><a href="mailto:joao.silva@movelmar.com.br">joao.silva@movelmar.com.br</a></span>
        </div>
        <div class="contact-tags">
          <span class="tag">cliente</span>
          <span class="tag">prioritário</span>
        </div>
      </div>
    </div>

  </div>
</body>
</html>
```

**Testar:**
1. Abrir `http://127.0.0.1:5500/test-cards.html`
2. Verificar visualmente os 4 cards
3. Testar responsivo (DevTools > Toggle device toolbar)
4. Verificar hover effects

**Testar:**
1. Abrir `http://127.0.0.1:5500/test-cards.html`
2. Verificar scroll funciona
3. Testar responsivo (DevTools > Toggle device toolbar > iPhone 11)

**Critério de aceite:**
- ✅ 8 cards renderizam corretamente (COMPLETO)
- ✅ Formato inline (label: valor na mesma linha) (COMPLETO)
- ✅ Emojis visíveis (COMPLETO)
- ✅ Hierarquia visual clara (labels cinza, valores preto) (COMPLETO)
- ✅ Responsivo em mobile (375px) (COMPLETO)
- ✅ Scroll vertical funcional (COMPLETO)
- ✅ Hover effects funcionam (COMPLETO)

---

## FASE 2: Frontend - Lógica de Renderização

**Objetivo:** Criar JavaScript para renderizar cards dinamicamente

**Duração:** 3 horas

---

### Tarefa 2.1: Criar arquivo `js/cards.js`

**Arquivo:** `/js/cards.js`

**Conteúdo:**
```javascript
/**
 * ALFRED - CARDS RENDERING MODULE
 * Renderiza cards formatados para tipos específicos de mensagens
 * Criado: 2025-10-26
 * Tipos suportados: email, evento, financeiro, contato
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
   * Cria card de email
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
          <span class="card-field-label">De</span>
          <span class="card-field-value">${escapeHtml(data.de || 'Desconhecido')}</span>
        </div>
        ${data.preview ? `
          <div class="card-field">
            <span class="card-field-label">Prévia</span>
            <span class="card-field-value preview">${escapeHtml(data.preview)}</span>
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
   * Cria card de evento
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
            <span>${formatDate(data.data)} ${timeRange}</span>
          </div>
        ` : ''}
        ${data.local ? `
          <div class="card-field">
            <span class="card-field-label">Local</span>
            <span class="card-field-value">${escapeHtml(data.local)}</span>
          </div>
        ` : ''}
        ${participantsList ? `
          <div class="card-field">
            <span class="card-field-label">Participantes</span>
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
   * Cria card financeiro
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
   * Cria card de contato
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
            <span class="card-field-label">Empresa</span>
            <span class="card-field-value">${escapeHtml(data.empresa)}</span>
          </div>
        ` : ''}
        ${data.cargo ? `
          <div class="card-field">
            <span class="card-field-label">Cargo</span>
            <span class="card-field-value">${escapeHtml(data.cargo)}</span>
          </div>
        ` : ''}
        ${data.telefone ? `
          <div class="card-field">
            <span class="card-field-label">Telefone</span>
            <span class="card-field-value">
              <a href="tel:${escapeHtml(data.telefone.replace(/\D/g, ''))}">${escapeHtml(data.telefone)}</a>
            </span>
          </div>
        ` : ''}
        ${data.email ? `
          <div class="card-field">
            <span class="card-field-label">Email</span>
            <span class="card-field-value">
              <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
            </span>
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
```

**Critério de aceite:**
- ✅ Arquivo criado em `/js/cards.js`
- ✅ Função `Cards.renderCard()` exportada
- ✅ 4 funções de criação de cards (email, evento, financeiro, contato)
- ✅ Sanitização HTML (escapeHtml)
- ✅ Formatação de datas e moedas
- ✅ Tratamento de erros com fallback

---

### Tarefa 2.2: Modificar `app.js` - Integrar renderização de cards

**Arquivo:** `/js/app.js`

**Modificações:**

**1. Localizar função `addMessage()` (linha ~183)**

**ANTES:**
```javascript
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
```

**DEPOIS:**
```javascript
function addMessage(text, type, cardType = null, metadata = null) {
  updateEmptyState();

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // Renderizar card se tipo definido, senão texto
  if (cardType && typeof Cards !== 'undefined') {
    const cardData = metadata?.card_data || {};
    const cardElement = Cards.renderCard(cardType, cardData, text);
    bubble.appendChild(cardElement);
  } else {
    bubble.textContent = text || ''; // textContent is XSS-safe
  }

  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = getCurrentTime();

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(timestamp);
  messagesContainer.appendChild(messageDiv);

  scrollToBottom();
}
```

---

**2. Localizar função `handleSendMessage()` - Processar resposta com card (linha ~150-160)**

**ANTES:**
```javascript
if (result.success) {
  const responseText = result.data.response;
  const responseType = result.data.type || 'generic';
  const metadata = result.data.metadata || {};

  addMessage(responseText, 'received');
  Storage.saveMessage(responseText, 'assistant', responseType, metadata);
  lastFailedMessage = null;
```

**DEPOIS:**
```javascript
if (result.success) {
  const responseText = result.data.response;
  const responseType = result.data.type || 'generic';
  const metadata = result.data.metadata || {};

  // Passar tipo de card para renderização
  const cardType = responseType.startsWith('card_') ? responseType : null;
  addMessage(responseText, 'received', cardType, metadata);

  Storage.saveMessage(responseText, 'assistant', responseType, metadata);
  lastFailedMessage = null;
```

---

**3. Localizar função `loadHistory()` (linha ~320-350)**

**Modificar para carregar cards do histórico:**

**ANTES:**
```javascript
function loadHistory() {
  const currentSession = Storage.getCurrentSession();
  if (!currentSession || !currentSession.messages) {
    updateEmptyState();
    return;
  }

  currentSession.messages.forEach(msg => {
    const type = msg.role === 'user' ? 'sent' : 'received';
    addMessageFromHistory(msg.content, type, msg.timestamp);
  });

  updateEmptyState();
  scrollToBottom();
}
```

**DEPOIS:**
```javascript
function loadHistory() {
  const currentSession = Storage.getCurrentSession();
  if (!currentSession || !currentSession.messages) {
    updateEmptyState();
    return;
  }

  currentSession.messages.forEach(msg => {
    const type = msg.role === 'user' ? 'sent' : 'received';
    const cardType = msg.type?.startsWith('card_') ? msg.type : null;
    const metadata = msg.metadata || null;

    addMessageFromHistory(msg.content, type, msg.timestamp, cardType, metadata);
  });

  updateEmptyState();
  scrollToBottom();
}
```

---

**4. Localizar função `addMessageFromHistory()` (linha ~307)**

**ANTES:**
```javascript
function addMessageFromHistory(text, type, timestamp) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'message-timestamp';
  timestampDiv.textContent = formatTimestamp(timestamp);

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(timestampDiv);
  messagesContainer.appendChild(messageDiv);
}
```

**DEPOIS:**
```javascript
function addMessageFromHistory(text, type, timestamp, cardType = null, metadata = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // Renderizar card se tipo definido, senão texto
  if (cardType && typeof Cards !== 'undefined') {
    const cardData = metadata?.card_data || {};
    const cardElement = Cards.renderCard(cardType, cardData, text);
    bubble.appendChild(cardElement);
  } else {
    bubble.textContent = text;
  }

  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'message-timestamp';
  timestampDiv.textContent = formatTimestamp(timestamp);

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(timestampDiv);
  messagesContainer.appendChild(messageDiv);
}
```

**Critério de aceite:**
- ✅ 4 funções modificadas em `app.js`
- ✅ `addMessage()` aceita parâmetros `cardType` e `metadata`
- ✅ `handleSendMessage()` detecta tipo de card
- ✅ `loadHistory()` carrega cards do histórico
- ✅ `addMessageFromHistory()` renderiza cards salvos

---

### Tarefa 2.3: Adicionar cards.js ao index.html

**Arquivo:** `/index.html`

**Modificação (ordem de scripts é importante!):**

**ANTES:**
```html
<script src="config.js"></script>
<script src="js/storage-v2.js"></script>
<script src="js/api.js"></script>
<script src="js/speech.js"></script>
<script src="js/sidebar.js"></script>
<script src="js/app.js"></script>
```

**DEPOIS:**
```html
<script src="config.js"></script>
<script src="js/storage-v2.js"></script>
<script src="js/api.js"></script>
<script src="js/speech.js"></script>
<script src="js/sidebar.js"></script>
<script src="js/cards.js"></script>  <!-- NOVO - antes de app.js -->
<script src="js/app.js"></script>
```

**Critério de aceite:**
- ✅ `cards.js` carrega antes de `app.js`
- ✅ Sem erros 404 no console
- ✅ `Cards` objeto disponível globalmente

---

### Tarefa 2.4: Testar renderização manual

**Criar arquivo de teste:** `/test-render-cards.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teste Renderização Cards - Alfred</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/cards.css">
</head>
<body>
  <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
    <h1>Teste de Renderização Dinâmica</h1>
    <div id="container"></div>
  </div>

  <script src="js/cards.js"></script>
  <script>
    const container = document.getElementById('container');

    // Teste 1: Card Email
    const emailData = {
      de: "João Silva",
      email_de: "joao@example.com",
      assunto: "Proposta Móveis",
      preview: "Segue proposta conforme conversamos...",
      data: "2025-10-25T14:30:00Z",
      lido: false
    };
    const emailCard = Cards.renderCard('card_email', emailData, 'Fallback texto');
    container.appendChild(emailCard);

    // Teste 2: Card Evento
    const eventoData = {
      titulo: "Reunião Cliente X",
      data: "2025-10-26",
      horario_inicio: "08:30",
      horario_fim: "09:30",
      local: "Escritório",
      participantes: ["João", "Maria"]
    };
    const eventoCard = Cards.renderCard('card_evento', eventoData, 'Fallback texto');
    container.appendChild(eventoCard);

    // Teste 3: Card Financeiro
    const financeiroData = {
      titulo: "Faturamento Movelmar Outubro",
      periodo: "Outubro 2025",
      liberado: 325000,
      pendente: 98000,
      bloqueado: 250000,
      moeda: "BRL"
    };
    const financeiroCard = Cards.renderCard('card_financeiro', financeiroData, 'Fallback texto');
    container.appendChild(financeiroCard);

    // Teste 4: Card Contato
    const contatoData = {
      nome: "João Silva",
      empresa: "Movelmar Indústria",
      cargo: "Diretor Comercial",
      telefone: "(11) 98765-4321",
      email: "joao.silva@movelmar.com.br",
      tags: ["cliente", "prioritário"]
    };
    const contatoCard = Cards.renderCard('card_contato', contatoData, 'Fallback texto');
    container.appendChild(contatoCard);

    console.log('✅ Todos cards renderizados com sucesso!');
  </script>
</body>
</html>
```

**Testar:**
1. Abrir `http://127.0.0.1:5500/test-render-cards.html`
2. Verificar 4 cards renderizados dinamicamente
3. Abrir DevTools Console - verificar mensagem de sucesso
4. Sem erros no console

**Critério de aceite:**
- ✅ 4 cards aparecem na página
- ✅ Console mostra "✅ Todos cards renderizados com sucesso!"
- ✅ Sem erros JavaScript

---

## FASE 3: N8N - Detecção de Tipos

**Objetivo:** Criar Code Node que detecta tipo de resposta do AI Agent

**Duração:** 2 horas

---

### Tarefa 3.1: Adicionar Code Node "Detect Response Type"

**Workflow:** Alfred (`IDUyPeVInIY2MIJp`)

**Posição:** Entre "Personal Assistant" e "Edit Fields (Response)"

**Configuração do Node:**

**Nome:** `Detect Response Type`
**Tipo:** `Code` (JavaScript)
**Posição:** Após "Personal Assistant", antes "Edit Fields (Response)"

**Código:**

```javascript
// ============================================
// DETECT RESPONSE TYPE - Code Node
// Analisa resposta do AI Agent e identifica tipo de card
// ============================================

const items = $input.all();
const output = [];

for (const item of items) {
  const aiOutput = item.json.output || '';

  // Detecta tipo baseado em palavras-chave
  let detectedType = 'generic'; // padrão

  // TIPO 1: Email
  if (
    aiOutput.toLowerCase().includes('email') ||
    aiOutput.toLowerCase().includes('mensagem de') ||
    aiOutput.toLowerCase().includes('remetente') ||
    aiOutput.toLowerCase().includes('assunto:')
  ) {
    detectedType = 'email';
  }

  // TIPO 2: Evento/Agenda
  else if (
    aiOutput.toLowerCase().includes('reunião') ||
    aiOutput.toLowerCase().includes('evento') ||
    aiOutput.toLowerCase().includes('compromisso') ||
    aiOutput.toLowerCase().includes('agendado') ||
    /\d{2}:\d{2}/.test(aiOutput) // detecta horário 08:30
  ) {
    detectedType = 'evento';
  }

  // TIPO 3: Financeiro
  else if (
    aiOutput.toLowerCase().includes('faturamento') ||
    aiOutput.toLowerCase().includes('liberado') ||
    aiOutput.toLowerCase().includes('pendente') ||
    aiOutput.toLowerCase().includes('bloqueado') ||
    aiOutput.includes('R$')
  ) {
    detectedType = 'financeiro';
  }

  // TIPO 4: Contato
  else if (
    aiOutput.toLowerCase().includes('contato') ||
    aiOutput.toLowerCase().includes('telefone') ||
    aiOutput.toLowerCase().includes('empresa:') ||
    /\(\d{2}\)\s?\d{4,5}-?\d{4}/.test(aiOutput) // detecta telefone
  ) {
    detectedType = 'contato';
  }

  output.push({
    json: {
      ...item.json,
      detected_type: detectedType,
      original_output: aiOutput
    }
  });
}

return output;
```

**Conexões:**
- Input: `Personal Assistant` (main output)
- Output: `Format Card Data` (próximo node - Tarefa 3.2)

**Critério de aceite:**
- ✅ Node criado e conectado
- ✅ Detecta 4 tipos (email, evento, financeiro, contato)
- ✅ Fallback para 'generic'
- ✅ Preserva `output` original

---

### Tarefa 3.2: Adicionar Code Node "Format Card Data"

**Nome:** `Format Card Data`
**Tipo:** `Code` (JavaScript)
**Posição:** Após "Detect Response Type", antes "Edit Fields (Response)"

**Código:**

```javascript
// ============================================
// FORMAT CARD DATA - Code Node
// Formata dados estruturados para cada tipo de card
// ============================================

const items = $input.all();
const output = [];

for (const item of items) {
  const detectedType = item.json.detected_type || 'generic';
  const aiOutput = item.json.original_output || item.json.output || '';

  let cardType = 'generic';
  let cardData = {};

  try {
    switch (detectedType) {
      case 'email':
        cardType = 'card_email';
        cardData = extractEmailData(aiOutput);
        break;

      case 'evento':
        cardType = 'card_evento';
        cardData = extractEventData(aiOutput);
        break;

      case 'financeiro':
        cardType = 'card_financeiro';
        cardData = extractFinanceData(aiOutput);
        break;

      case 'contato':
        cardType = 'card_contato';
        cardData = extractContactData(aiOutput);
        break;

      default:
        cardType = 'generic';
        cardData = {};
    }
  } catch (error) {
    console.error('Erro ao formatar card:', error);
    cardType = 'generic';
    cardData = {};
  }

  output.push({
    json: {
      output: aiOutput, // texto fallback
      card_type: cardType,
      card_data: cardData
    }
  });
}

return output;

// ============================================
// FUNÇÕES DE EXTRAÇÃO
// ============================================

function extractEmailData(text) {
  // Regex patterns
  const deMatch = text.match(/(?:de|from):\s*(.+?)(?:\n|$)/i);
  const assuntoMatch = text.match(/(?:assunto|subject):\s*(.+?)(?:\n|$)/i);
  const previewMatch = text.match(/(?:preview|texto|mensagem):\s*(.+?)(?:\n|$)/i);
  const lidoMatch = text.toLowerCase().includes('não lido') || text.toLowerCase().includes('unread');

  return {
    de: deMatch ? deMatch[1].trim() : 'Desconhecido',
    assunto: assuntoMatch ? assuntoMatch[1].trim() : 'Sem assunto',
    preview: previewMatch ? previewMatch[1].trim().substring(0, 100) : '',
    data: new Date().toISOString(),
    lido: !lidoMatch
  };
}

function extractEventData(text) {
  const tituloMatch = text.match(/(?:reunião|evento|compromisso):\s*(.+?)(?:\n|$)/i);
  const horarioMatch = text.match(/(\d{2}:\d{2})/);
  const localMatch = text.match(/(?:local|onde):\s*(.+?)(?:\n|$)/i);

  return {
    titulo: tituloMatch ? tituloMatch[1].trim() : 'Evento',
    data: new Date().toISOString().split('T')[0],
    horario_inicio: horarioMatch ? horarioMatch[1] : '',
    horario_fim: '',
    local: localMatch ? localMatch[1].trim() : '',
    participantes: []
  };
}

function extractFinanceData(text) {
  const tituloMatch = text.match(/(?:faturamento|resumo):\s*(.+?)(?:\n|$)/i);
  const liberadoMatch = text.match(/liberado:\s*R\$\s*([\d.,]+)/i);
  const pendenteMatch = text.match(/pendente:\s*R\$\s*([\d.,]+)/i);
  const bloqueadoMatch = text.match(/bloqueado:\s*R\$\s*([\d.,]+)/i);

  return {
    titulo: tituloMatch ? tituloMatch[1].trim() : 'Resumo Financeiro',
    periodo: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    liberado: liberadoMatch ? parseFloat(liberadoMatch[1].replace(/\./g, '').replace(',', '.')) : 0,
    pendente: pendenteMatch ? parseFloat(pendenteMatch[1].replace(/\./g, '').replace(',', '.')) : 0,
    bloqueado: bloqueadoMatch ? parseFloat(bloqueadoMatch[1].replace(/\./g, '').replace(',', '.')) : 0,
    moeda: 'BRL'
  };
}

function extractContactData(text) {
  const nomeMatch = text.match(/(?:nome|contato):\s*(.+?)(?:\n|$)/i);
  const empresaMatch = text.match(/(?:empresa):\s*(.+?)(?:\n|$)/i);
  const cargoMatch = text.match(/(?:cargo):\s*(.+?)(?:\n|$)/i);
  const telefoneMatch = text.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);

  return {
    nome: nomeMatch ? nomeMatch[1].trim() : 'Desconhecido',
    empresa: empresaMatch ? empresaMatch[1].trim() : '',
    cargo: cargoMatch ? cargoMatch[1].trim() : '',
    telefone: telefoneMatch ? telefoneMatch[0] : '',
    email: emailMatch ? emailMatch[0] : '',
    tags: []
  };
}
```

**Conexões:**
- Input: `Detect Response Type` (main output)
- Output: `Edit Fields (Response)` (node existente)

**Critério de aceite:**
- ✅ Node criado e conectado
- ✅ 4 funções de extração implementadas
- ✅ Regex para parsear dados
- ✅ Fallback para valores vazios

---

## FASE 4: N8N - Modificar Edit Fields (Response)

**Objetivo:** Adicionar `type` e `metadata` na resposta do webhook

**Duração:** 1 hora

---

### Tarefa 4.1: Modificar node "Edit Fields (Response)"

**Workflow:** Alfred
**Node:** `Edit Fields (Response)` (ID: `313d5ab4-ad85-4d6e-9a66-2b9eaf62e206`)

**ANTES (assignments):**
```json
[
  {
    "id": "response-success",
    "name": "success",
    "value": true,
    "type": "boolean"
  },
  {
    "id": "response-text",
    "name": "response",
    "value": "={{ $json.output }}",
    "type": "string"
  },
  {
    "id": "response-type",
    "name": "type",
    "value": "generic",
    "type": "string"
  },
  {
    "id": "response-timestamp",
    "name": "timestamp",
    "value": "={{ $now.toISO() }}",
    "type": "string"
  },
  {
    "id": "response-metadata",
    "name": "metadata",
    "value": "={}",
    "type": "object"
  }
]
```

**DEPOIS (assignments):**
```json
[
  {
    "id": "response-success",
    "name": "success",
    "value": true,
    "type": "boolean"
  },
  {
    "id": "response-text",
    "name": "response",
    "value": "={{ $json.output }}",
    "type": "string"
  },
  {
    "id": "response-type",
    "name": "type",
    "value": "={{ $json.card_type || 'generic' }}",
    "type": "string"
  },
  {
    "id": "response-timestamp",
    "name": "timestamp",
    "value": "={{ $now.toISO() }}",
    "type": "string"
  },
  {
    "id": "response-metadata",
    "name": "metadata",
    "value": "={{ { card_data: $json.card_data || {} } }}",
    "type": "object"
  }
]
```

**Modificações:**
1. `type`: Era fixo `"generic"`, agora dinâmico `{{ $json.card_type || 'generic' }}`
2. `metadata`: Era objeto vazio `{}`, agora `{ card_data: $json.card_data || {} }`

**Como fazer:**
1. Abrir node "Edit Fields (Response)"
2. Clicar em cada assignment
3. Editar o campo "Value"
4. Salvar workflow

**Critério de aceite:**
- ✅ Assignment `type` usa expressão dinâmica
- ✅ Assignment `metadata` contém `card_data`
- ✅ Workflow salvo sem erros

---

### Tarefa 4.2: Reconectar fluxo

**Verificar conexões:**

```
Personal Assistant (main output)
  ↓
Detect Response Type (main input)
  ↓
Format Card Data (main input)
  ↓
Edit Fields (Response) (main input)
  ↓
Respond to Webhook (main input)
```

**Como fazer:**
1. Deletar conexão antiga: `Personal Assistant → Edit Fields (Response)`
2. Conectar: `Personal Assistant → Detect Response Type`
3. Conectar: `Detect Response Type → Format Card Data`
4. Conectar: `Format Card Data → Edit Fields (Response)`
5. Manter: `Edit Fields (Response) → Respond to Webhook`

**Critério de aceite:**
- ✅ Fluxo completo conectado
- ✅ Sem nodes órfãos
- ✅ Workflow salvo

---

## FASE 5: Integração e Testes

**Objetivo:** Testar sistema end-to-end

**Duração:** 3 horas

---

### Tarefa 5.1: Teste Manual - Email

**Pré-requisito:** Workflow ativado em modo TESTE

**Passos:**
1. Abrir Alfred PWA: `http://127.0.0.1:5500` (ou Vercel preview)
2. Enviar mensagem: `"Mostre meus últimos emails"`
3. Aguardar resposta (pode demorar ~10-15s)

**Resultado Esperado:**
- ✅ Card de email renderizado (não texto puro)
- ✅ Ícone 📧 visível
- ✅ Badge "Lido" ou "Não lido"
- ✅ Campos: De, Assunto, Preview
- ✅ Data formatada

**Se falhar:**
- Abrir DevTools > Network > Verificar resposta do webhook
- Verificar `type: "card_email"` no JSON
- Verificar `metadata.card_data` tem campos
- Abrir DevTools > Console > Verificar erros JavaScript

**Critério de aceite:**
- ✅ Card renderiza corretamente
- ✅ Dados preenchidos
- ✅ Sem erros no console

---

### Tarefa 5.2: Teste Manual - Evento

**Passos:**
1. Enviar mensagem: `"Quais minhas reuniões de hoje?"`
2. Aguardar resposta

**Resultado Esperado:**
- ✅ Card de evento renderizado
- ✅ Ícone 📅 visível
- ✅ Header com fundo verde claro
- ✅ Campos: Título, Data/Hora, Local
- ✅ Participantes (se houver)

**Critério de aceite:**
- ✅ Card renderiza corretamente
- ✅ Horário formatado (08:30 - 09:30)

---

### Tarefa 5.3: Teste Manual - Financeiro

**Passos:**
1. Enviar mensagem: `"Qual o faturamento de Outubro?"`
2. Aguardar resposta

**Resultado Esperado:**
- ✅ Card financeiro renderizado
- ✅ Ícone 💰 visível
- ✅ Header com fundo amarelo claro
- ✅ 3 linhas: Liberado (verde), Pendente (laranja), Bloqueado (vermelho)
- ✅ Valores em reais formatados (R$ 325.000,00)

**Critério de aceite:**
- ✅ Card renderiza corretamente
- ✅ Cores corretas por tipo

---

### Tarefa 5.4: Teste Manual - Contato

**Passos:**
1. Enviar mensagem: `"Encontre o contato João Silva"`
2. Aguardar resposta

**Resultado Esperado:**
- ✅ Card de contato renderizado
- ✅ Ícone 📞 visível
- ✅ Header com fundo azul claro
- ✅ Campos: Nome, Empresa, Cargo, Telefone (link), Email (link)
- ✅ Tags (se houver)

**Critério de aceite:**
- ✅ Card renderiza corretamente
- ✅ Links clicáveis (tel: e mailto:)

---

### Tarefa 5.5: Teste de Persistência (LocalStorage)

**Passos:**
1. Enviar 2 mensagens que gerem cards (email + evento)
2. Recarregar página (F5)
3. Verificar histórico na sidebar

**Resultado Esperado:**
- ✅ Cards aparecem no histórico
- ✅ Ícones corretos na sidebar (📧, 📅)
- ✅ Ao clicar na sessão, cards são renderizados novamente

**Critério de aceite:**
- ✅ Cards persistem após reload
- ✅ Sidebar mostra ícones contextuais

---

### Tarefa 5.6: Teste de Fallback

**Passos:**
1. Enviar mensagem genérica: `"Olá Alfred, como vai?"`
2. Aguardar resposta

**Resultado Esperado:**
- ✅ Resposta em texto simples (bubble normal)
- ✅ Sem card renderizado
- ✅ `type: "generic"` na resposta

**Critério de aceite:**
- ✅ Texto renderiza normalmente
- ✅ Sistema não quebra sem card

---

### Tarefa 5.7: Teste de Erro

**Passos:**
1. Desativar workflow N8N temporariamente
2. Enviar mensagem no Alfred
3. Verificar tratamento de erro

**Resultado Esperado:**
- ✅ Banner de erro aparece
- ✅ Mensagem de erro no chat
- ✅ Botão "Tentar novamente" funcional

**Critério de aceite:**
- ✅ App não quebra
- ✅ Erro tratado gracefully

---

### Tarefa 5.8: Teste Mobile (Responsivo)

**Passos:**
1. Abrir DevTools > Toggle device toolbar
2. Testar iPhone 11 (375x812)
3. Enviar mensagens que geram cards

**Resultado Esperado:**
- ✅ Cards responsivos (largura 100%)
- ✅ Texto legível
- ✅ Espaçamentos adequados
- ✅ Ícones visíveis

**Critério de aceite:**
- ✅ Cards funcionam em mobile (320px+)
- ✅ Sem scroll horizontal

---

## FASE 6: Deploy e Validação

**Objetivo:** Colocar em produção e validar

**Duração:** 30 minutos

---

### Tarefa 6.1: Commit e Push

```bash
# Adicionar arquivos novos
git add css/cards.css
git add js/cards.js

# Adicionar modificações
git add index.html
git add js/app.js

# Commit
git commit -m "feat: implementa sistema de cards formatados V2

- Adiciona 4 tipos de cards: email, evento, financeiro, contato
- CSS cards.css com estilos responsivos
- JavaScript cards.js com renderização dinâmica
- Modificações em app.js para suportar cards
- Integração com N8N (detecção e formatação de tipos)
- Persistência em LocalStorage
- Fallback para texto quando não for card

Closes #N (substituir por issue number se houver)
"

# Push
git push origin main
```

**Critério de aceite:**
- ✅ Commit criado
- ✅ Push bem-sucedido
- ✅ Vercel inicia deploy automático

---

### Tarefa 6.2: Ativar Workflow N8N em Produção

**Passos:**
1. Acesse N8N
2. Abra workflow "Alfred"
3. Toggle "Active" para ON
4. Verificar ícone verde ao lado do nome

**Critério de aceite:**
- ✅ Workflow ativo
- ✅ Webhook produção funcionando

---

### Tarefa 6.3: Trocar para Webhook de Produção (Frontend)

**Arquivo:** `/config.js`

**Comando:**
```bash
# Fazer backup do modo teste
cp config.js config-test.backup.js

# Restaurar produção
cp config-production.backup.js config.js

# Verificar
cat config.js | grep WEBHOOK_URL
# Deve mostrar: webhook/0c689264... (SEM -test)
```

**Ou editar manualmente:**

**ANTES:**
```javascript
const WEBHOOK_URL = 'https://n8n-n8n.l1huim.easypanel.host/webhook-test/0c689264-8178-477c-a366-66559b14cf16';
```

**DEPOIS:**
```javascript
const WEBHOOK_URL = 'https://n8n-n8n.l1huim.easypanel.host/webhook/0c689264-8178-477c-a366-66559b14cf16';
```

**Commit:**
```bash
git add config.js config-test.backup.js
git commit -m "chore: ativa modo produção (webhook sem -test)"
git push
```

**Critério de aceite:**
- ✅ `config.js` aponta para webhook de produção
- ✅ Backup do teste criado
- ✅ Pushed para Vercel

---

### Tarefa 6.4: Validação Final em Produção

**Testar em:** `https://alfred-pennyworth.vercel.app`

**Checklist:**
1. ✅ App carrega sem erros
2. ✅ Enviar mensagem → recebe resposta
3. ✅ Card renderiza (testar 1 tipo)
4. ✅ Reload → histórico mantém card
5. ✅ Mobile funciona (testar no iPhone real se possível)

**Critério de aceite:**
- ✅ Tudo funcionando em produção
- ✅ Performance OK (< 3s de resposta)

---

## Checklist de Validação

### Frontend

- [ ] **CSS**
  - [ ] `/css/cards.css` criado
  - [ ] 4 tipos de cards estilizados
  - [ ] Responsivo (mobile 320px+)
  - [ ] Emojis visíveis

- [ ] **JavaScript**
  - [ ] `/js/cards.js` criado
  - [ ] `Cards.renderCard()` funcional
  - [ ] Sanitização HTML (XSS-safe)
  - [ ] Formatação de datas/moedas
  - [ ] Tratamento de erros

- [ ] **Integração**
  - [ ] `app.js` modificado (4 funções)
  - [ ] `index.html` carrega scripts corretos
  - [ ] Ordem de scripts correta

### Backend (N8N)

- [ ] **Code Nodes**
  - [ ] "Detect Response Type" criado
  - [ ] "Format Card Data" criado
  - [ ] 4 funções de extração implementadas

- [ ] **Workflow**
  - [ ] Fluxo conectado corretamente
  - [ ] "Edit Fields (Response)" modificado
  - [ ] Workflow salvo e ativo

### Testes

- [ ] **Funcionalidade**
  - [ ] Card email renderiza
  - [ ] Card evento renderiza
  - [ ] Card financeiro renderiza
  - [ ] Card contato renderiza
  - [ ] Texto simples (fallback) funciona
  - [ ] Histórico persiste cards

- [ ] **Edge Cases**
  - [ ] Erro de rede tratado
  - [ ] Dados incompletos (fallback)
  - [ ] Reload mantém cards
  - [ ] Mobile responsivo

### Deploy

- [ ] **Produção**
  - [ ] Código commitado e pushed
  - [ ] Vercel deployed
  - [ ] Webhook produção ativo
  - [ ] Validação final OK

---

## Rollback e Troubleshooting

### Como Reverter (Se algo quebrar)

#### Opção 1: Rollback Frontend

```bash
# Voltar para branch de backup
git checkout backup-pre-cards-v2

# Ou reverter commit específico
git revert HEAD
git push
```

#### Opção 2: Rollback N8N

1. Acesse N8N
2. Workflows > Alfred > Menu (⋯) > Import
3. Selecione: `n8n/fluxos/backup/Alfred-pre-cards-v2-2025-10-26.json`
4. Confirmar substituição

#### Opção 3: Modo Emergência (Desativar Cards)

**Editar `app.js`:**

```javascript
// No topo do arquivo, adicionar:
const DISABLE_CARDS = true;

// Na função addMessage(), envolver renderização:
if (cardType && !DISABLE_CARDS && typeof Cards !== 'undefined') {
  // renderizar card
} else {
  // renderizar texto
}
```

Commit rápido e push.

---

### Problemas Comuns

#### Cards não renderizam

**Sintoma:** Só aparece texto, nunca cards

**Debug:**
1. Abrir DevTools > Network
2. Clicar na request do webhook
3. Ver resposta JSON
4. Verificar se `type` está correto (ex: `"card_email"`)
5. Verificar se `metadata.card_data` tem dados

**Soluções:**
- Se `type: "generic"`: N8N não detectou tipo → verificar Code Node "Detect Response Type"
- Se `card_data` vazio: Extração falhou → verificar Code Node "Format Card Data"
- Se JSON OK mas não renderiza: Problema no frontend → verificar `Cards.renderCard()` no console

---

#### Erros JavaScript no Console

**Sintoma:** Console mostra erros

**Debug:**
1. Ler mensagem de erro
2. Verificar linha/arquivo
3. Verificar se `cards.js` carregou antes de `app.js`

**Soluções:**
- `Cards is not defined`: `cards.js` não carregou ou carregou depois de `app.js`
- `Cannot read property 'card_data'`: metadata é undefined → adicionar fallback
- XSS/sanitização: verificar `escapeHtml()` funciona

---

#### Cards não aparecem no histórico

**Sintoma:** Após reload, volta para texto

**Debug:**
1. Abrir DevTools > Application > Local Storage
2. Verificar estrutura de `alfred_storage_v2`
3. Verificar se sessão tem `type` e `metadata`

**Soluções:**
- Se `type` ausente: `Storage.saveMessage()` não recebeu parâmetros → verificar chamada em `app.js`
- Se `metadata` ausente: Mesmo problema
- Se estrutura OK: `loadHistory()` não passou parâmetros → verificar modificação

---

#### Performance lenta

**Sintoma:** Cards demoram muito para renderizar

**Debug:**
1. DevTools > Performance > Record
2. Enviar mensagem
3. Analisar onde gasta tempo

**Soluções:**
- Se N8N demora: Aumentar timeout visual (já está em 2min)
- Se renderização demora: Otimizar `innerHTML` (pouco provável)
- Se muitas mensagens: Limpar histórico antigo

---

#### Mobile quebrado

**Sintoma:** Cards não cabem na tela

**Debug:**
1. DevTools > Device toolbar > iPhone 11
2. Inspecionar elementos
3. Verificar larguras

**Soluções:**
- Adicionar `max-width: 100%` em `.card`
- Verificar `@media (max-width: 480px)` em `cards.css`
- Ajustar font-sizes

---

## Próximos Passos (Pós-V2)

**V3 - Cards Interativos:**
- Botões de ação (Responder email, Aceitar evento)
- Swipe gestures (Mobile)
- Favoritar cards
- Compartilhar cards

**V3+ - Supabase Integration:**
- Salvar contextos em tabela `contextos`
- Query histórica: "Qual último email João enviou?"
- Cross-device sync

**V4 - Rich Formatting:**
- Markdown parser (Snarkdown 1kb)
- Code blocks com syntax highlight
- Imagens inline
- Attachments

---

## Conclusão

**Estimativa Total:** 16 horas (~2 dias)

**Progresso:**
- [x] Fase 0: Preparação (30min) - ✅ COMPLETA
- [x] Fase 1: Frontend CSS (4.5h) - ✅ COMPLETA (formato inline + cores)
- [x] Fase 2: Frontend JS (3h) - ✅ COMPLETA (XSS warning aceito)
- [x] Fase 3: N8N Detecção (2h) - ✅ COMPLETA (Code Nodes criados)
- [ ] Fase 4: N8N Formatação (1h) - ⏸️ PRÓXIMA (5 minutos - 2 campos)
- [ ] Fase 5: Testes (3h) - ⏸️ PENDENTE
- [ ] Fase 6: Deploy (2.5h) - ⏸️ PENDENTE

**Tempo gasto:** 10h de 16h (62.5%)
**Tempo restante:** 6h (37.5%)

**Ao completar todas fases:**
✅ Sistema de cards formatados 100% funcional
✅ 4 tipos de cards renderizando
✅ N8N integrado
✅ Produção deployada
✅ Documentação completa

---

**Boa implementação! 🚀**
