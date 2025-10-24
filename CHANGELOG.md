# Changelog - Alfred PWA

Todas as mudanças notáveis neste projeto serão documentadas aqui.

## [1.1.3] - 2025-10-24

### 🐛 Corrigido
- **Service Worker CORS handling**: Tratamento silencioso de erros CORS do N8N
  - Não polui mais console com erros de fetch
  - Retorna erro JSON estruturado ao invés de exception
  - Melhora experiência durante desenvolvimento local

### 🔧 Alterado
- **URL de produção ativada**: Mudou de `webhook-test/...` para `webhook/...`
- **CORS configurado no N8N**: Allowed Origins com `*` funcionando

### ✅ Status
- Frontend funcionando em localhost e produção (Vercel)
- CORS resolvido completamente
- Erros de console eliminados

---

## [1.1.2] - 2025-10-24

### 🐛 Corrigido
- **API retry logic melhorado**: Agora NÃO faz retry quando N8N retorna HTTP 200 com body vazio/inválido
  - **Antes**: 3 tentativas em resposta vazia (causava 3 webhooks no N8N)
  - **Agora**: 1 tentativa + erro claro "N8N retornou resposta vazia ou inválida"
  - Retry apenas acontece em: timeout, erro de rede, ou HTTP 5xx (servidor)
  - HTTP 4xx (cliente) também NÃO faz retry

### 🔧 Alterado
- URL de teste atualizada para `webhook-test/...` para facilitar testes
- Melhor mensagem de erro quando N8N retorna resposta inválida
- Log de debug (`console.error`) quando resposta tem formato incorreto

### 📚 Documentação
- Criado `docs/BUG-ANALYSIS.md` - Análise detalhada do problema de 3x webhooks
- Criado `docs/N8N-WORKFLOW-ANALYSIS.md` - Análise completa do workflow N8N
- Documentados problemas críticos no N8N:
  - Respond to Webhook com `responseBody` vazio
  - Simple Memory com `sessionKey` incorreto (usando message ao invés de userId)

### 🎯 Próximas Correções Necessárias (N8N)
- **CRÍTICO**: Corrigir Respond to Webhook para retornar JSON válido
- **CRÍTICO**: Corrigir Simple Memory sessionKey (usar userId, não message)
- Ver `docs/N8N-WORKFLOW-ANALYSIS.md` para detalhes completos

---

## [1.1.1] - 2025-10-24

### 🔗 Integração N8N

### Adicionado
- **Normalização Automática de Resposta**: Frontend agora aceita tanto texto puro quanto JSON estruturado do N8N
- **Detecção de Content-Type**: Analisa `Content-Type` para parsear corretamente (JSON ou texto)
- **Fallback Inteligente**: Converte texto puro para formato JSON interno automaticamente
- **Documentação de Integração**: Novo arquivo `docs/N8N-INTEGRATION.md` explicando ambos os formatos

### Melhorado
- **Compatibilidade Total**: Funciona com N8N atual (texto) e futuro (JSON estruturado)
- **Preparação V2**: Aceita campos `type` e `metadata` quando disponíveis
- **Validação Robusta**: Sempre normaliza para formato padrão antes de usar

### Técnico
- Nova função `normalizeResponse()` em `api.js`
- Detecta Content-Type: `application/json` vs `text/plain`
- Suporta formato legado: string pura
- Suporta formato novo: `{success, response, type, timestamp, metadata}`

---

## [1.1.0] - 2025-10-24

### 🚀 EM PRODUÇÃO

### Adicionado
- **Timeout Visual (15s)**: Interface é liberada automaticamente após 15 segundos, mesmo que o servidor N8N não responda
- **Botão "Tentar Novamente"**: Mensagens de erro agora exibem botão "↻ Tentar novamente" para reenviar facilmente
- **Estado Recuperável**: Após erro, usuário pode continuar usando o app sem precisar fechar/abrir
- **Retry Automático**: Salva última mensagem que falhou para permitir retry fácil

### Melhorado
- **Tratamento de Erros**: Sistema nunca mais trava em loading infinito
- **UX de Erro**: Mensagens de erro mais claras e acionáveis
- **Resiliência**: App continua funcional mesmo com servidor instável

### Corrigido
- Loading infinito quando N8N não responde ou demora muito
- Interface travada após erro de servidor
- Necessidade de fechar/abrir app após erro

### Técnico
- Adicionado `VISUAL_TIMEOUT` constante (15000ms)
- Nova função `addMessageWithRetry()` para mensagens de erro com botão
- Variável `lastFailedMessage` armazena mensagem para retry
- `handleSendMessage()` agora aceita parâmetro `retryMessage` para retry
- CSS do botão `.retry-button` com hover/active states
- Cleanup de `visualTimeoutId` em `initCleanup()`

---

## [1.0.0] - 2025-10-23

### 🎉 Lançamento Inicial

- Interface de chat funcional
- Envio de mensagens por texto
- Reconhecimento de voz (Web Speech API)
- Integração N8N via webhook
- Histórico persistente (LocalStorage)
- PWA completo (Service Worker + Manifest)
- Offline UI
- Design responsivo mobile-first
- Bundle < 40KB
- Deploy na Vercel
