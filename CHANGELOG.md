# Changelog - Alfred PWA

Todas as mudanças notáveis neste projeto serão documentadas aqui.

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
