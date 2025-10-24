# Integração Frontend ↔ N8N

## 📋 Visão Geral

Este documento explica como o frontend Alfred se comunica com o N8N e as opções de configuração.

---

## 🔄 Fluxo Atual

### Frontend → N8N

**Request (POST):**
```json
{
  "message": "Qual minha agenda hoje?",
  "userId": "ricardo-nilton",
  "timestamp": "2025-10-24T09:00:00.000Z",
  "source": "web-assistant"
}
```

### N8N → Frontend

**O frontend aceita DOIS formatos de resposta:**

#### **Formato 1: Texto Puro (Atual)**
```
Rica, boa tarde. Você tem 3 reuniões agendadas para hoje...
```

Content-Type: `text/plain`

#### **Formato 2: JSON Estruturado (Recomendado)**
```json
{
  "success": true,
  "response": "Rica, boa tarde. Você tem 3 reuniões...",
  "type": "generic",
  "timestamp": "2025-10-24T09:00:02.000Z",
  "metadata": {}
}
```

Content-Type: `application/json`

---

## ✅ Sistema de Normalização (v1.1.1)

O frontend implementa **normalização automática** que aceita ambos os formatos:

### Como Funciona

```javascript
// 1. Detecta Content-Type da resposta
if (contentType.includes('application/json')) {
  rawData = await response.json();  // JSON
} else {
  rawData = await response.text();  // Texto puro
}

// 2. Normaliza para formato padrão
normalizeResponse(rawData) → {
  success: true,
  response: "texto",
  type: "generic",
  timestamp: "ISO",
  metadata: {}
}
```

### Vantagens

✅ **Compatibilidade total:** Funciona com N8N atual (texto puro)
✅ **Preparado para V2:** Aceita JSON estruturado quando disponível
✅ **Sem quebra:** Transição suave entre formatos
✅ **Validação robusta:** Sempre retorna formato esperado

---

## 🛠️ Configuração N8N

### Opção A: Texto Puro (Atual - Funciona)

**Nó "Respond to Webhook":**
```
Respond With: Text
Response Body: ={{ $json.text }}
```

**Prós:**
- ✅ Simples
- ✅ Já funciona

**Contras:**
- ❌ Não permite metadados
- ❌ Não permite type (para formatação V2)

---

### Opção B: JSON Estruturado (Recomendado)

**Adicione nó "Edit Fields" ANTES de "Respond to Webhook":**

**Configuração "Edit Fields":**
```
Campos:
├─ success = true (Boolean)
├─ response = {{ $json.text }} (String)
├─ type = "generic" (String)
├─ timestamp = {{ $now.toISO() }} (String)
└─ metadata = {} (Object)
```

**Configuração "Respond to Webhook":**
```
Respond With: JSON
Response Body: ={{ $json }}
```

**Fluxo completo:**
```
Basic LLM Chain (gera texto)
   ↓
Edit Fields (constrói JSON)
   ↓
Respond to Webhook (retorna JSON)
```

**Prós:**
- ✅ Permite type e metadata (para V2)
- ✅ Validação mais robusta
- ✅ Padrão REST API
- ✅ Timestamp preciso do servidor

**Contras:**
- ❌ Precisa adicionar um nó

---

## 📊 Campo "type" (Planejado para V2)

O campo `type` permite formatação específica no futuro:

### Tipos Planejados

```javascript
// Genérico (padrão)
{ type: "generic", response: "Rica, boa tarde..." }

// Agenda formatada
{
  type: "calendar",
  response: "Você tem 3 reuniões:",
  metadata: {
    events: [
      { time: "09:00", title: "Reunião com cliente X" },
      { time: "14:00", title: "Apresentação projeto Y" }
    ]
  }
}

// Emails
{
  type: "email",
  response: "Você tem 5 emails não lidos:",
  metadata: {
    emails: [
      { from: "cliente@empresa.com", subject: "Proposta..." }
    ]
  }
}

// Cálculo
{
  type: "calculation",
  response: "O resultado é R$ 15.750,00",
  metadata: {
    calculation: "5000 * 3.15"
  }
}
```

**Frontend V2** renderizará cada tipo com UI específica (cards, listas, etc).

---

## 🐛 Troubleshooting

### Erro: "Invalid JSON in Response Body"

**Causa:** Tentou usar expressões `={{ }}` diretamente no JSON.

**Solução:** Use nó "Edit Fields" para construir o JSON (ver Opção B).

---

### Erro: "Invalid response format from N8N"

**Causa:** Resposta vazia ou formato não reconhecido.

**Verificar:**
1. N8N está retornando algo? (teste com Postman)
2. Content-Type está correto?
3. Se JSON, tem campo `response`?
4. Se texto, não está vazio?

---

### Frontend não exibe resposta

**Debug:**
```javascript
// Abra DevTools → Console
// Veja logs de api.js

// Se aparecer "Invalid response format":
console.log(normalizedData); // Ver o que está sendo normalizado
```

---

## 🔒 Validação de Segurança

### Frontend valida:

✅ Response não é vazio
✅ Se JSON, tem estrutura válida
✅ Campo `response` é string
✅ Content-Type é respeitado

### N8N deve validar:

⚠️ `userId` corresponde ao usuário autorizado
⚠️ `message` não está vazio
⚠️ Rate limiting (evitar spam)

---

## 📈 Evolução Futura

### V1.1 (Atual)
- ✅ Aceita texto puro
- ✅ Aceita JSON estruturado
- ✅ Normalização automática

### V2 (Planejado)
- [ ] Renderização por `type` (calendar, email, etc)
- [ ] UI rica com cards e listas
- [ ] Ações rápidas em metadata
- [ ] Formatação Markdown em responses

---

## 🧪 Testes

### Teste 1: Texto Puro
```bash
curl -X POST https://n8n.../webhook/... \
  -H "Content-Type: application/json" \
  -d '{"message": "teste", "userId": "ricardo-nilton", "timestamp": "2025-10-24T12:00:00Z", "source": "web-assistant"}'
```

**Resposta esperada:**
```
Rica, recebi sua mensagem de teste.
```

**Frontend deve:**
- ✅ Exibir texto na interface
- ✅ Salvar no histórico
- ✅ Não mostrar erro

---

### Teste 2: JSON Estruturado
```bash
curl -X POST https://n8n.../webhook/... \
  -H "Content-Type: application/json" \
  -d '{"message": "agenda", "userId": "ricardo-nilton", "timestamp": "2025-10-24T12:00:00Z", "source": "web-assistant"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "response": "Rica, você tem 2 compromissos hoje...",
  "type": "calendar",
  "timestamp": "2025-10-24T12:00:05.000Z",
  "metadata": {}
}
```

**Frontend deve:**
- ✅ Exibir texto na interface
- ✅ Salvar type e metadata
- ✅ Não mostrar erro

---

## 📞 Suporte

**Problema de integração?**

1. Teste webhook com cURL primeiro
2. Verifique logs do N8N
3. Abra DevTools → Console no frontend
4. Procure por erros em `api.js`

---

**Última atualização:** Outubro 24, 2025
**Versão Frontend:** 1.1.1
**Compatibilidade N8N:** v1.114.4+
