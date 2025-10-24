# Arquitetura do Sistema

## Visão Geral

Sistema cliente-servidor onde o front-end é totalmente estático (HTML/CSS/JS) e se comunica com N8N via webhook HTTP. Sem backend próprio.

## Fluxo de Comunicação

```
[Usuário] → [Interface Web] → [Webhook N8N] → [Processamento N8N] → [Interface Web] → [Usuário]
```

### Detalhamento do Fluxo

1. **Entrada do usuário:**
   - Digita texto OU fala (Speech Recognition converte para texto)
   - Clica em "Enviar"

2. **Processamento no Front:**
   - Captura mensagem
   - Adiciona ao histórico local (LocalStorage)
   - Exibe mensagem do usuário na interface
   - Mostra indicador de carregamento

3. **Requisição ao N8N:**
   - POST para webhook N8N
   - Envia JSON com mensagem e metadata
   - Aguarda resposta

4. **Resposta do N8N:**
   - Recebe JSON com resposta e tipo
   - Adiciona resposta ao histórico local
   - Remove indicador de carregamento
   - Exibe resposta formatada

5. **Persistência:**
   - Todo histórico salvo em LocalStorage
   - Recuperado automaticamente ao abrir app

## Estrutura de Dados

### LocalStorage

**Chave:** `assistant_history`

**Formato:**
```json
{
  "conversations": [
    {
      "id": "uuid-v4",
      "timestamp": "2025-10-23T14:30:00.000Z",
      "messages": [
        {
          "role": "user",
          "content": "Qual minha agenda hoje?",
          "timestamp": "2025-10-23T14:30:00.000Z"
        },
        {
          "role": "assistant",
          "content": "Resposta do N8N aqui...",
          "type": "agenda",
          "timestamp": "2025-10-23T14:30:02.000Z"
        }
      ]
    }
  ],
  "settings": {
    "theme": "light",
    "voiceEnabled": true
  }
}
```

### Request para N8N

**Endpoint:** Configurável (variável de ambiente ou config.js)

**Método:** POST

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "message": "Texto da mensagem do usuário",
  "userId": "ricardo-nilton",
  "timestamp": "2025-10-23T14:30:00.000Z",
  "source": "web-assistant"
}
```

### Response do N8N

**Formato esperado:**
```json
{
  "success": true,
  "response": "Texto da resposta",
  "type": "generic",
  "timestamp": "2025-10-23T14:30:02.000Z",
  "metadata": {}
}
```

**Tipos possíveis:**
- `generic` - Resposta texto simples
- `agenda` - Dados de agenda (V2: formatação especial)
- `email` - Informações de email (V2: formatação especial)
- `cliente` - Dados de cliente (V2: formatação especial)
- `error` - Erro no processamento

## Componentes Principais

### 1. Interface (index.html + style.css)

**Responsabilidades:**
- Layout responsivo mobile-first
- Campo de entrada de texto
- Botão de microfone
- Área de exibição de mensagens (chat)
- Indicador de carregamento
- Tratamento de erros visuais

### 2. Gerenciador de API (api.js)

**Responsabilidades:**
- Enviar requisições ao webhook N8N
- Tratar timeouts e erros de rede
- Retry logic (3 tentativas com backoff)
- Validar respostas

**Principais funções:**
```javascript
async sendMessage(message)
async validateConnection()
handleError(error)
```

### 3. Gerenciador de Storage (storage.js)

**Responsabilidades:**
- Salvar histórico de conversas
- Recuperar histórico
- Limpar histórico antigo (manter últimos 30 dias)
- Gerenciar configurações do usuário

**Principais funções:**
```javascript
saveMessage(message, role, type)
getHistory()
clearOldHistory()
saveSettings(settings)
getSettings()
```

### 4. Reconhecimento de Voz (speech.js)

**Responsabilidades:**
- Iniciar/parar captura de voz
- Converter fala em texto
- Tratar erros de permissão
- Feedback visual durante captura

**Principais funções:**
```javascript
startListening()
stopListening()
onResult(callback)
onError(callback)
```

### 5. Aplicação Principal (app.js)

**Responsabilidades:**
- Inicialização do app
- Coordenação entre componentes
- Listeners de eventos (submit, microfone, etc)
- Renderização de mensagens
- Atualização da interface

## PWA (Progressive Web App)

### Service Worker (sw.js)

**Estratégia de Cache:**
- Cache-first para assets estáticos (CSS, JS, ícones)
- Network-first para requisições ao N8N
- Fallback offline: exibe mensagem amigável

**Cache incluído:**
- index.html
- style.css
- app.js, api.js, storage.js, speech.js
- Ícones PWA
- Fontes (se houver)

### Manifest (manifest.json)

**Configurações:**
- Nome, ícones, cores
- Display: standalone (parece app nativo)
- Orientação: any (portrait e landscape)
- Start URL: /

## Segurança

### Considerações

1. **Webhook URL:** Não hardcoded, usar variável de ambiente ou config externo
2. **HTTPS obrigatório:** Para PWA e Speech Recognition
3. **Sem dados sensíveis no LocalStorage:** Apenas histórico de conversas
4. **Rate limiting:** Implementar debounce em envios (500ms)
5. **Validação de input:** Sanitizar mensagens antes de enviar

## Performance

### Otimizações

1. **Lazy loading:** Service worker carrega em background
2. **Debounce:** Evita múltiplos envios acidentais
3. **LocalStorage eficiente:** Limpa dados antigos automaticamente
4. **CSS otimizado:** Sem bibliotecas, apenas necessário
5. **JavaScript modular:** Carrega apenas o necessário

### Métricas Alvo

- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 2s
- **Tamanho total:** < 100KB
- **Lighthouse Score:** > 90

## Escalabilidade V2

### Preparação para Futuro

**Estrutura de tipos de resposta:**
O campo `type` na resposta do N8N já prepara para V2. Frontend pode ignorar por enquanto, mas quando implementar formatação customizada, só precisa adicionar lógica de renderização por tipo.

**Sincronização multidevice:**
LocalStorage facilita migração futura para Supabase/Firebase. Estrutura de dados já é compatível, basta adicionar camada de sync.

**Atalhos rápidos:**
Interface já pode ter espaço reservado (comentado ou oculto) para botões de atalho. Implementação futura não quebra layout.

## Diagrama de Fluxo Simplificado

```
Início
  ↓
Usuário digita/fala
  ↓
Frontend captura input
  ↓
Salva em LocalStorage (user message)
  ↓
POST para N8N webhook
  ↓
N8N processa e responde
  ↓
Frontend recebe resposta
  ↓
Salva em LocalStorage (assistant message)
  ↓
Renderiza na interface
  ↓
Fim
```

## Tratamento de Erros

### Tipos de Erro

1. **Erro de rede:** Exibe "Sem conexão. Tente novamente"
2. **Timeout:** Exibe "Demorou muito. Tente novamente"
3. **Erro do N8N:** Exibe mensagem de erro retornada
4. **Erro de permissão (voz):** Exibe "Permita o microfone"
5. **LocalStorage cheio:** Limpa histórico antigo automaticamente

### Retry Logic

- 3 tentativas automáticas
- Intervalo: 1s, 3s, 5s
- Após 3 falhas: exibe erro definitivo
