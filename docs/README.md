# Alfred - Assistente Pessoal N8N

## Visão Geral

PWA moderno e minimalista para interação com N8N via webhook. Substitui WhatsApp/Telegram por solução proprietária com controle total, interface otimizada e suporte multi-usuário.

## Status Atual

**Versão:** 1.3.0
**Status:** ✅ **EM PRODUÇÃO**
**Deploy:** Vercel (multi-usuário)

## Stack Técnica

- **HTML5 + CSS3 + JavaScript ES6+** puro (zero frameworks)
- **PWA** completo (manifest + service worker)
- **LocalStorage V2** (sessões múltiplas com migração automática)
- **Speech Recognition API** (voz nativa)
- **Vercel** (deploy automático via Git)

## Características

- ✅ Zero dependências externas
- ✅ Bundle ~40KB (carregamento < 2s)
- ✅ Funciona offline (interface completa)
- ✅ Instalável na tela inicial (iOS/Android)
- ✅ Sistema de sessões múltiplas
- ✅ Sidebar com histórico organizado
- ✅ Timeout duplo (nunca trava)
- ✅ Multi-usuário (1 código → N sites)

## Estrutura Real

```
/
├── index.html              # Página principal
├── manifest.json           # Config PWA
├── sw.js                   # Service Worker (bypass N8N)
├── config.js               # Config webhook (gitignored)
├── css/
│   └── style.css          # Estilos completos
├── js/
│   ├── app.js             # Lógica principal e UI
│   ├── api.js             # Comunicação N8N
│   ├── speech.js          # Reconhecimento de voz
│   ├── storage-v2.js      # LocalStorage V2 (sessões)
│   └── sidebar.js         # Controle sidebar
└── assets/icons/          # Ícones PWA
```

## Funcionalidades Implementadas

**V1.3 (Produção):**
- ✅ Envio por texto e voz
- ✅ Sistema de sessões múltiplas (Storage V2)
- ✅ Sidebar com histórico (Hoje, Ontem, 7 dias, Antigas)
- ✅ Ícones contextuais automáticos
- ✅ Tratamento robusto de erros com retry
- ✅ Timeout visual de 2 minutos
- ✅ Botão "Tentar novamente"
- ✅ Limpeza automática de sessões antigas
- ✅ PWA completo e instalável
- ✅ Deploy multi-usuário

**Planejado (V2):**
- Atalhos rápidos customizáveis
- Respostas formatadas (cards, listas)
- Favoritos/pins de mensagens
- Sincronização multidevice (Supabase)
- Dark mode
- Push notifications (quando iOS suportar)

## Deploy

**Recomendado:** Vercel com variáveis de ambiente

```bash
vercel --prod
vercel env add API_ENDPOINT production
vercel env add USER_ID production
vercel env add APP_NAME production
```

Veja `README.md` principal para guia completo de deploy multi-usuário.

## Configuração

1. Copie `config.example.js` para `config.js`
2. Configure webhook N8N e USER_ID
3. Gere ícones PWA (veja `README.md`)
4. Deploy via Vercel

## Requisitos

- Webhook N8N configurado
- Navegador moderno (Chrome, Safari, Edge)
- HTTPS (obrigatório para PWA e Speech API)

## Documentação Completa

- **README.md** - Guia completo de instalação, deploy e uso
- **CLAUDE.md** - Contexto técnico e decisões de arquitetura
- **MULTI-USER-SETUP.md** - Guia de deploy multi-usuário

## Autor

**Ricardo Nilton Borges**
Desenvolvedor Full Stack | Representante Comercial
Projeto pessoal para produtividade empresarial
