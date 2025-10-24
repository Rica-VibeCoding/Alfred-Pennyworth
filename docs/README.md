# Assistente Pessoal N8N - Interface Web

## Visão Geral

Interface web minimalista para interação com assistente pessoal via N8N. Substitui WhatsApp/Telegram por solução proprietária, leve e focada em produtividade empresarial.

## Objetivo

Criar PWA (Progressive Web App) que permita consultas rápidas via texto ou voz ao fluxo N8N existente, com interface moderna, responsiva e focada em uso mobile.

## Stack Técnica

- **HTML5** puro (estrutura)
- **CSS3** puro (estilização moderna)
- **JavaScript ES6+** puro (lógica e interações)
- **PWA** (manifest + service worker)
- **LocalStorage** (persistência de histórico)
- **Speech Recognition API** (entrada por voz)

## Características

- Zero frameworks/bibliotecas pesadas
- Carregamento instantâneo
- Funciona offline (básico)
- Instalável na tela inicial
- Peso total < 100KB
- Interface estilo chat moderno

## Estrutura de Pastas

```
/
├── index.html          # Página principal
├── css/
│   ├── style.css       # Estilos principais
│   └── theme.css       # Variáveis de tema
├── js/
│   ├── app.js          # Lógica principal
│   ├── api.js          # Comunicação com N8N
│   ├── storage.js      # Gerenciamento LocalStorage
│   └── speech.js       # Reconhecimento de voz
├── manifest.json       # Configuração PWA
├── sw.js              # Service Worker
└── assets/
    └── icons/         # Ícones para PWA
```

## Funcionalidades V1

- Envio de mensagens por texto
- Envio de mensagens por voz
- Exibição de respostas formatadas
- Histórico de conversas (LocalStorage)
- Design responsivo mobile-first
- PWA instalável

## Funcionalidades V2 (Planejadas)

- Atalhos rápidos customizáveis
- Respostas formatadas por tipo (agenda, email, cliente)
- Favoritos/pins de respostas importantes
- Sincronização multidevice
- Modo offline inteligente com cache

## Como Rodar Local

1. Clone o repositório
2. Abra `index.html` no navegador
3. Para HTTPS local (necessário para PWA): use Live Server ou similar

## Deploy

**Vercel** (recomendado):
```bash
vercel deploy
```

Configuração automática, HTTPS incluído, deploy via Git.

## Requisitos

- Webhook N8N configurado e ativo
- Navegador moderno com suporte a:
  - LocalStorage
  - Fetch API
  - Speech Recognition (opcional, para voz)
  - Service Workers (para PWA)

## Autor

Ricardo Nilton Borges
Projeto pessoal para otimização de fluxo de trabalho empresarial.
