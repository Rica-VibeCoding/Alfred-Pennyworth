# Plano de Implementação - Suporte a Áudio TTS no Chat

## Contexto do Projeto
- **Aplicação:** PWA de chat (Alfred Assistant)
- **Stack:** HTML + CSS + JavaScript puro (zero frameworks)
- **Comunicação:** Webhook N8N retorna JSON
- **Novo Recurso:** N8N agora pode retornar áudio TTS (text-to-speech) em formato binary

## Cultura do Código Observada
1. **Modularização:** Arquivos separados por responsabilidade (api.js, app.js, storage.js, speech.js)
2. **Validação Rigorosa:** Todas as entradas são validadas antes de processar
3. **Tratamento de Erros:** Retry automático, timeouts, mensagens claras ao usuário
4. **Performance First:** Código otimizado, sem dependências externas
5. **Mobile-First:** Foco em iPhone 11/Safari
6. **Segurança:** textContent ao invés de innerHTML, sanitização de inputs
7. **Graceful Degradation:** Features desabilitam silenciosamente se não suportadas

---

## Fase 0: Análise e Preparação (30 min)

### Tarefas:
1. **Verificar estrutura atual do response N8N**
   - Localização: `api.js` linhas 136-161 (função `normalizeResponse`)
   - Entender formato atual: `{success, response, type, timestamp, metadata}`

2. **Mapear fluxo de dados atual**
   - N8N → api.js (`sendToN8N`) → app.js (`handleSendMessage`) → DOM (`addMessage`)
   - Storage: `storage.js` salva mensagens com tipo e metadata

3. **Identificar pontos de integração**
   - `api.js:145` - onde metadata é processada
   - `app.js:155-160` - onde resposta é renderizada
   - `style.css` - onde novo player será estilizado

---

## Fase 1: Backend N8N - Preparar Response (1h)

### Objetivo:
Modificar webhook N8N para incluir áudio no JSON response

### Opção A - Base64 (Recomendada para arquivos pequenos < 100KB):
```json
{
  "success": true,
  "response": "Texto da resposta aqui",
  "type": "audio",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "metadata": {
    "audio": {
      "data": "data:audio/mpeg;base64,{base64_string}",
      "mimeType": "audio/mpeg",
      "size": 11264,
      "duration": 3.2
    }
  }
}
```

### Opção B - URL Externa (Para arquivos maiores):
```json
{
  "success": true,
  "response": "Texto da resposta aqui",
  "type": "audio",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "metadata": {
    "audioUrl": "https://n8n-storage.com/temp/audio_123.mp3",
    "audioExpiry": "2025-10-24T15:30:00.000Z"
  }
}
```

### Tarefas N8N:
1. Adicionar nó "Code" após ElevenLabs para formatar response
2. Converter binary para base64 ou gerar URL temporária
3. Manter retrocompatibilidade (responses sem áudio continuam funcionando)
4. Testar response via Postman/cURL

---

## Fase 2: Frontend - Camada API (30 min)

### Arquivo: `api.js`

#### Tarefa 2.1: Atualizar `normalizeResponse()`
**Localização:** Linha ~136-161

```javascript
function normalizeResponse(rawData) {
  // Código existente...

  // Adicionar suporte para áudio na metadata
  if (rawData && typeof rawData === 'object' && rawData.response) {
    return {
      success: rawData.success !== false,
      response: rawData.response,
      type: rawData.type || 'generic',
      timestamp: rawData.timestamp || new Date().toISOString(),
      metadata: {
        ...rawData.metadata,
        // Preservar dados de áudio se existirem
        audio: rawData.metadata?.audio || null,
        audioUrl: rawData.metadata?.audioUrl || null,
        audioExpiry: rawData.metadata?.audioExpiry || null
      }
    };
  }
  // Resto do código...
}
```

#### Tarefa 2.2: Adicionar validação de áudio
**Nova função após `validateResponse()` (~linha 170)**

```javascript
function validateAudioData(metadata) {
  if (!metadata) return false;

  // Validar base64
  if (metadata.audio) {
    return metadata.audio.data &&
           metadata.audio.mimeType &&
           metadata.audio.data.startsWith('data:');
  }

  // Validar URL
  if (metadata.audioUrl) {
    return metadata.audioUrl.startsWith('https://');
  }

  return false;
}
```

---

## Fase 3: Frontend - Renderização de Áudio (1h)

### Arquivo: `app.js`

#### Tarefa 3.1: Detectar responses com áudio
**Localização:** Linha ~155-160

```javascript
// Modificar handleSendMessage()
if (result.success) {
  const responseText = result.data.response;
  const responseType = result.data.type || 'generic';
  const metadata = result.data.metadata || {};

  // Verificar se tem áudio
  const hasAudio = metadata.audio || metadata.audioUrl;

  if (hasAudio && responseType === 'audio') {
    addAudioMessage(responseText, metadata, 'received');
  } else {
    addMessage(responseText, 'received');
  }

  Storage.saveMessage(responseText, 'assistant', responseType, metadata);
  lastFailedMessage = null;
}
```

#### Tarefa 3.2: Criar função `addAudioMessage()`
**Adicionar após `addMessage()` (~linha 200)**

```javascript
function addAudioMessage(text, metadata, type) {
  updateEmptyState();

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // Texto da mensagem
  const textContent = document.createElement('div');
  textContent.className = 'message-text';
  textContent.textContent = text || '';
  bubble.appendChild(textContent);

  // Player de áudio
  const audioPlayer = createAudioPlayer(metadata);
  if (audioPlayer) {
    bubble.appendChild(audioPlayer);
  }

  // Timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = getCurrentTime();

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(timestamp);

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}
```

#### Tarefa 3.3: Criar função `createAudioPlayer()`
**Adicionar após `addAudioMessage()` (~linha 235)**

```javascript
function createAudioPlayer(metadata) {
  if (!metadata || (!metadata.audio && !metadata.audioUrl)) {
    return null;
  }

  const audioContainer = document.createElement('div');
  audioContainer.className = 'audio-player-container';

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.className = 'message-audio-player';
  audio.setAttribute('preload', 'metadata');

  // Configurar source
  if (metadata.audio && metadata.audio.data) {
    // Base64
    audio.src = metadata.audio.data;
  } else if (metadata.audioUrl) {
    // URL externa
    audio.src = metadata.audioUrl;
  }

  // Fallback para browsers que não suportam o formato
  audio.onerror = () => {
    const errorText = document.createElement('div');
    errorText.className = 'audio-error';
    errorText.textContent = 'Áudio não disponível';
    audioContainer.replaceChild(errorText, audio);
  };

  audioContainer.appendChild(audio);
  return audioContainer;
}
```

#### Tarefa 3.4: Atualizar `loadHistory()` para suportar áudio
**Localização:** Linha ~272-284

```javascript
function loadHistory() {
  const messages = Storage.getMessages();

  messages.forEach(msg => {
    if (!msg || !msg.content || !msg.role || !msg.timestamp) {
      return;
    }

    const messageType = msg.role === 'user' ? 'sent' : 'received';

    // Verificar se mensagem histórica tem áudio
    if (msg.metadata && (msg.metadata.audio || msg.metadata.audioUrl) && msg.type === 'audio') {
      addAudioMessageFromHistory(msg.content, messageType, msg.timestamp, msg.metadata);
    } else {
      addMessageFromHistory(msg.content, messageType, msg.timestamp);
    }
  });
}
```

#### Tarefa 3.5: Criar `addAudioMessageFromHistory()`
**Adicionar após `addMessageFromHistory()` (~linha 302)**

```javascript
function addAudioMessageFromHistory(text, type, timestamp, metadata) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  // Texto
  const textContent = document.createElement('div');
  textContent.className = 'message-text';
  textContent.textContent = text || '';
  bubble.appendChild(textContent);

  // Player (se ainda válido)
  const audioPlayer = createAudioPlayer(metadata);
  if (audioPlayer) {
    bubble.appendChild(audioPlayer);
  }

  // Timestamp
  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'message-timestamp';
  timestampDiv.textContent = formatTimestamp(timestamp);

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(timestampDiv);

  messagesContainer.appendChild(messageDiv);
}
```

---

## Fase 4: Estilização CSS (30 min)

### Arquivo: `style.css`

#### Adicionar após `.message-bubble` (~linha 250):

```css
/* Audio Player Styles */
.audio-player-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.message-audio-player {
  width: 100%;
  max-width: 280px;
  height: 36px;
  border-radius: 18px;
  background: transparent;
}

/* Custom audio controls para Safari iOS */
.message-audio-player::-webkit-media-controls-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 18px;
}

.sent .message-audio-player::-webkit-media-controls-panel {
  background: rgba(255, 255, 255, 0.15);
}

.audio-error {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
  padding: 8px 0;
}

/* Separar texto do player */
.message-text {
  margin-bottom: 0;
}

/* Responsivo */
@media (max-width: 480px) {
  .message-audio-player {
    max-width: 240px;
  }
}
```

---

## Fase 5: Testes e Validação (1h)

### Checklist de Testes:

#### 5.1 Testes Funcionais:
- [ ] Response com áudio base64 renderiza player
- [ ] Response com audioUrl renderiza player
- [ ] Response sem áudio continua funcionando (retrocompatibilidade)
- [ ] Player de áudio funciona no iPhone 11/Safari
- [ ] Player de áudio funciona no Chrome/Android
- [ ] Histórico salva e recupera mensagens com áudio

#### 5.2 Testes de Erro:
- [ ] Base64 corrompido mostra "Áudio não disponível"
- [ ] URL expirada mostra fallback
- [ ] Formato não suportado mostra mensagem de erro
- [ ] Timeout não quebra renderização de texto

#### 5.3 Testes de Performance:
- [ ] Base64 grande (>100KB) não trava UI
- [ ] Múltiplos áudios na tela não degradam performance
- [ ] LocalStorage não estoura com áudios base64

#### 5.4 Testes de UX:
- [ ] Player é visualmente coerente com design
- [ ] Controles são touch-friendly (44px mínimo)
- [ ] Áudio não autoplay (respeita preferências do usuário)
- [ ] Loading state enquanto áudio carrega

---

## Fase 6: Otimizações e Melhorias (Opcional)

### Possíveis melhorias futuras:
1. **Cache de áudios:** Salvar blobs no IndexedDB ao invés de base64 no localStorage
2. **Compressão:** Converter áudio para formato mais leve (opus/webm)
3. **Preload inteligente:** Só carregar áudio quando visível na tela
4. **Visualização:** Waveform ou progress bar customizado
5. **Download:** Botão para baixar áudio
6. **Transcrição:** Mostrar/ocultar texto da transcrição

---

## Ordem de Implementação Recomendada

1. **Primeiro:** Fase 1 (Backend N8N) - Testar response isoladamente
2. **Segundo:** Fases 2 e 3 (Frontend API + Renderização) - Implementar juntas
3. **Terceiro:** Fase 4 (CSS) - Ajustar visual
4. **Quarto:** Fase 5 (Testes) - Validar tudo
5. **Opcional:** Fase 6 (Otimizações) - Se houver tempo

---

## Tempo Estimado Total
- **Mínimo:** 3 horas (sem otimizações)
- **Recomendado:** 4 horas (com testes completos)
- **Máximo:** 6 horas (com otimizações)

---

## Notas Importantes

1. **Manter retrocompatibilidade:** Responses sem áudio devem continuar funcionando
2. **Mobile-first:** Testar primeiro no iPhone 11/Safari
3. **Segurança:** Validar todas as URLs externas (HTTPS obrigatório)
4. **Performance:** Base64 máximo 100KB para não degradar UX
5. **Acessibilidade:** Player nativo do browser já é acessível

---

## Comandos Úteis para Debug

```javascript
// Testar no console do browser
const mockResponse = {
  success: true,
  response: "Teste de áudio",
  type: "audio",
  metadata: {
    audio: {
      data: "data:audio/mpeg;base64,SUQzAwAAA...",
      mimeType: "audio/mpeg"
    }
  }
};

// Simular addAudioMessage
addAudioMessage(mockResponse.response, mockResponse.metadata, 'received');
```

---

**Última atualização:** 24 de Outubro de 2025
**Autor:** Sistema Alfred Assistant
**Versão:** 1.0