# Contrato de API - N8N Webhook

## Visão Geral

Comunicação via HTTP POST com webhook N8N. Frontend envia mensagem do usuário, N8N processa e retorna resposta estruturada.

## Endpoint

**URL:** Configurável via variável de ambiente ou arquivo de configuração

**Método:** POST

**Protocolo:** HTTPS (obrigatório)

**Timeout:** 30 segundos

**Retry:** 3 tentativas com backoff exponencial (1s, 3s, 5s)

## Autenticação

**Método:** Sem autenticação por enquanto (webhook público)

**Nota:** Se necessário adicionar autenticação no futuro:
- Bearer Token no header `Authorization`
- API Key no header `X-API-Key`
- Básica via query parameter `?token=xxx`

## Request

### Headers

```
Content-Type: application/json
Accept: application/json
User-Agent: AssistenteWeb/1.0
```

### Body Structure

```json
{
  "message": "string",
  "userId": "string",
  "timestamp": "string (ISO 8601)",
  "source": "string",
  "sessionId": "string (opcional)"
}
```

### Campos Detalhados

**message** (obrigatório)
- Tipo: string
- Descrição: Mensagem do usuário (texto ou transcrição de voz)
- Validação: 1-2000 caracteres
- Exemplo: `"Qual minha agenda hoje?"`

**userId** (obrigatório)
- Tipo: string
- Descrição: Identificador único do usuário
- Valor fixo: `"ricardo-nilton"`
- Exemplo: `"ricardo-nilton"`

**timestamp** (obrigatório)
- Tipo: string (ISO 8601 com timezone)
- Descrição: Data/hora do envio da mensagem
- Formato: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Exemplo: `"2025-10-23T14:30:00.000Z"`

**source** (obrigatório)
- Tipo: string
- Descrição: Origem da requisição
- Valor fixo: `"web-assistant"`
- Exemplo: `"web-assistant"`

**sessionId** (opcional)
- Tipo: string
- Descrição: ID da sessão para contexto de conversa
- Geração: UUID v4 ao iniciar app, persiste em LocalStorage
- Exemplo: `"550e8400-e29b-41d4-a716-446655440000"`

### Exemplos de Request

**Mensagem simples:**
```json
{
  "message": "Quais os últimos emails importantes?",
  "userId": "ricardo-nilton",
  "timestamp": "2025-10-23T14:30:00.000Z",
  "source": "web-assistant",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Mensagem de voz transcrita:**
```json
{
  "message": "Qual minha agenda de amanhã",
  "userId": "ricardo-nilton",
  "timestamp": "2025-10-23T09:15:30.000Z",
  "source": "web-assistant",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Response

### Status Codes

**200 OK** - Sucesso, resposta válida
**400 Bad Request** - Erro de validação (mensagem vazia, formato inválido)
**408 Request Timeout** - N8N demorou muito para processar
**500 Internal Server Error** - Erro no processamento N8N
**503 Service Unavailable** - N8N indisponível

### Success Response (200)

**Headers:**
```
Content-Type: application/json
```

**Body Structure:**
```json
{
  "success": true,
  "response": "string",
  "type": "string",
  "timestamp": "string (ISO 8601)",
  "metadata": {}
}
```

### Campos Detalhados

**success** (obrigatório)
- Tipo: boolean
- Descrição: Indica se processamento foi bem-sucedido
- Valor: `true` para sucesso
- Exemplo: `true`

**response** (obrigatório)
- Tipo: string
- Descrição: Resposta textual para o usuário
- Formato: Texto livre, pode conter markdown (V2)
- Exemplo: `"Sua agenda hoje tem 3 compromissos: reunião às 10h, almoço com cliente às 12h30, apresentação às 15h."`

**type** (obrigatório)
- Tipo: string (enum)
- Descrição: Tipo de resposta para formatação futura
- Valores possíveis:
  - `"generic"` - Resposta textual padrão
  - `"agenda"` - Dados de agenda/calendário
  - `"email"` - Informações de emails
  - `"cliente"` - Dados de clientes
  - `"tabela"` - Dados tabulares (V2)
  - `"grafico"` - Dados para gráfico (V2)
- Padrão (V1): `"generic"` para todas as respostas
- Exemplo: `"agenda"`

**timestamp** (obrigatório)
- Tipo: string (ISO 8601 com timezone)
- Descrição: Data/hora de processamento da resposta
- Formato: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Exemplo: `"2025-10-23T14:30:02.500Z"`

**metadata** (opcional)
- Tipo: object
- Descrição: Dados estruturados adicionais (uso futuro V2)
- Uso V1: Pode ser objeto vazio `{}`
- Uso V2: Dados para formatação customizada
- Exemplo V2:
```json
{
  "eventos": [
    {
      "hora": "10:00",
      "titulo": "Reunião de vendas",
      "duracao": "1h"
    }
  ]
}
```

### Exemplos de Response

**Resposta genérica (V1 - padrão):**
```json
{
  "success": true,
  "response": "Encontrei 5 emails não lidos. Os mais importantes são: proposta do cliente ABC (hoje 9h), fatura pendente (ontem), follow-up do projeto XYZ (segunda-feira).",
  "type": "generic",
  "timestamp": "2025-10-23T14:30:02.500Z",
  "metadata": {}
}
```

**Resposta com tipo específico (preparado para V2):**
```json
{
  "success": true,
  "response": "Você tem 3 compromissos hoje: Reunião às 10h, Almoço com cliente às 12h30, Apresentação às 15h.",
  "type": "agenda",
  "timestamp": "2025-10-23T09:15:32.000Z",
  "metadata": {
    "date": "2025-10-24",
    "eventos": [
      {
        "hora": "10:00",
        "titulo": "Reunião de vendas",
        "duracao": "60"
      },
      {
        "hora": "12:30",
        "titulo": "Almoço com cliente",
        "duracao": "90"
      },
      {
        "hora": "15:00",
        "titulo": "Apresentação trimestral",
        "duracao": "45"
      }
    ]
  }
}
```

### Error Response (400, 500, 503)

**Body Structure:**
```json
{
  "success": false,
  "error": "string",
  "errorCode": "string",
  "timestamp": "string (ISO 8601)"
}
```

### Campos de Erro

**success** (obrigatório)
- Tipo: boolean
- Valor: `false`

**error** (obrigatório)
- Tipo: string
- Descrição: Mensagem de erro amigável para o usuário
- Exemplo: `"Não consegui processar sua mensagem. Tente novamente."`

**errorCode** (obrigatório)
- Tipo: string
- Descrição: Código técnico do erro para debug
- Valores possíveis:
  - `"INVALID_MESSAGE"` - Mensagem vazia ou inválida
  - `"PROCESSING_ERROR"` - Erro no processamento N8N
  - `"TIMEOUT"` - Tempo de resposta excedido
  - `"SERVICE_UNAVAILABLE"` - N8N indisponível
  - `"UNKNOWN_ERROR"` - Erro não classificado
- Exemplo: `"PROCESSING_ERROR"`

**timestamp** (obrigatório)
- Tipo: string (ISO 8601)
- Descrição: Data/hora do erro
- Exemplo: `"2025-10-23T14:30:02.500Z"`

### Exemplos de Error Response

**Erro de validação (400):**
```json
{
  "success": false,
  "error": "Mensagem não pode estar vazia.",
  "errorCode": "INVALID_MESSAGE",
  "timestamp": "2025-10-23T14:30:02.500Z"
}
```

**Erro de processamento (500):**
```json
{
  "success": false,
  "error": "Erro ao processar sua solicitação. Tente novamente em instantes.",
  "errorCode": "PROCESSING_ERROR",
  "timestamp": "2025-10-23T14:30:02.500Z"
}
```

**Serviço indisponível (503):**
```json
{
  "success": false,
  "error": "Serviço temporariamente indisponível. Tente novamente.",
  "errorCode": "SERVICE_UNAVAILABLE",
  "timestamp": "2025-10-23T14:30:02.500Z"
}
```

## Configuração do Webhook

### Arquivo de Config (Recomendado)

**config.js** na raiz do projeto:

```javascript
const CONFIG = {
  API_ENDPOINT: 'https://seu-webhook.n8n.cloud/webhook/xxxxx',
  API_TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 5000], // ms
  USER_ID: 'ricardo-nilton'
};
```

**Não commitar para Git** - adicionar em `.gitignore`:
```
config.js
```

**Template (config.example.js) para versionamento:**
```javascript
const CONFIG = {
  API_ENDPOINT: 'SEU_WEBHOOK_AQUI',
  API_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 5000],
  USER_ID: 'SEU_USER_ID'
};
```

## Validações Frontend

### Antes de Enviar

1. **Mensagem não vazia:** Trim() e verificar length > 0
2. **Tamanho máximo:** Limitar a 2000 caracteres
3. **Debounce:** Evitar múltiplos envios (500ms)
4. **Conexão:** Verificar `navigator.onLine` antes de enviar

### Após Receber

1. **Validar JSON:** Try/catch no parse
2. **Verificar campo `success`:** Existe e é boolean
3. **Verificar campo `response`:** Existe e é string não vazia
4. **Timeout:** Abortar após 30s se não responder

## Rate Limiting

**Frontend:**
- Debounce de 500ms entre envios
- Máximo 1 requisição por vez (desabilitar envio durante processamento)

**Backend (N8N - futuro):**
- Considerar implementar limite de 60 requisições/minuto
- Retornar 429 Too Many Requests se exceder

## Logs e Debug

### Request Log (desenvolvimento)
```javascript
console.log('[API] Enviando:', {
  message: mensagem,
  userId: CONFIG.USER_ID,
  timestamp: new Date().toISOString()
});
```

### Response Log (desenvolvimento)
```javascript
console.log('[API] Recebido:', {
  success: response.success,
  type: response.type,
  responseLength: response.response.length
});
```

### Error Log (sempre)
```javascript
console.error('[API] Erro:', {
  errorCode: error.errorCode,
  message: error.error,
  timestamp: error.timestamp
});
```

## Evolução V2

### Novos Tipos Planejados

- `"tabela"` - Dados tabulares com colunas/linhas
- `"grafico"` - Dados para renderizar gráfico
- `"lista_tarefas"` - Lista de tarefas com checkbox
- `"cliente_detalhes"` - Ficha completa de cliente

### Metadata Expandido

Cada tipo terá estrutura específica em `metadata`:

**Exemplo tipo "tabela":**
```json
{
  "metadata": {
    "colunas": ["Nome", "Valor", "Status"],
    "linhas": [
      ["Cliente A", "R$ 5.000", "Ativo"],
      ["Cliente B", "R$ 3.200", "Pendente"]
    ]
  }
}
```

**Exemplo tipo "grafico":**
```json
{
  "metadata": {
    "tipo": "linha",
    "labels": ["Jan", "Fev", "Mar"],
    "valores": [1000, 1500, 1200]
  }
}
```

## Testes Recomendados

### Casos de Teste

1. **Sucesso padrão:** Mensagem simples, resposta genérica
2. **Mensagem longa:** 2000 caracteres, deve aceitar
3. **Mensagem vazia:** Deve rejeitar no frontend
4. **Timeout:** Simular demora > 30s
5. **Erro 500:** Simular erro de processamento
6. **Offline:** Sem conexão, deve informar usuário
7. **Retry:** Falha 2x, sucesso na 3ª tentativa

### Mock para Desenvolvimento

Criar `mock-api.js` para testar sem N8N:

```javascript
function mockApiCall(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        response: `Mock: Você disse "${message}"`,
        type: 'generic',
        timestamp: new Date().toISOString(),
        metadata: {}
      });
    }, 1000);
  });
}
```

## Checklist de Implementação

- [ ] Criar config.js com endpoint do webhook
- [ ] Implementar função sendMessage com fetch
- [ ] Adicionar retry logic com backoff
- [ ] Validar mensagem antes de enviar
- [ ] Tratar todos status codes (200, 400, 500, 503)
- [ ] Implementar timeout de 30s
- [ ] Adicionar logs para debug
- [ ] Testar cenários de sucesso e erro
- [ ] Criar mock para desenvolvimento
- [ ] Documentar endpoint real do N8N no README
