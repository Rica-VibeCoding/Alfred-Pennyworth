# Guia de Implementação Multi-usuário

Este documento detalha as mudanças necessárias no código para suportar múltiplos usuários independentes usando variáveis de ambiente.

## Arquitetura

**Conceito:** 1 repositório → múltiplos projetos Vercel → cada um com env vars diferentes

```
┌──────────────────────────────────────────────────┐
│         Repositório Git (main branch)             │
│              Código único                         │
└─────────────────┬────────────────────────────────┘
                  │
         ┌────────┼────────┬────────┐
         │        │        │        │
         ▼        ▼        ▼        ▼
    ┌────────┬────────┬────────┬────────┐
    │Ricardo │  Dani  │Letícia │Isabelle│
    │Vercel  │ Vercel │ Vercel │ Vercel │
    │Project │Project │Project │Project │
    └────────┴────────┴────────┴────────┘
         │        │        │        │
         ▼        ▼        ▼        ▼
    Env Vars diferentes para cada projeto
```

## Mudanças Necessárias

### 1. Modificar `config.example.js`

**Arquivo:** `/config.example.js`

**Status:** ⚠️ Manter para desenvolvimento local

```javascript
// config.example.js
// Este arquivo é usado apenas para desenvolvimento local
// Em produção, o Vercel injeta as variáveis via process.env

const CONFIG = {
  // Copie este arquivo para config.js e configure suas credenciais locais
  API_ENDPOINT: 'https://seu-n8n.com/webhook/seu-id',
  APP_NAME: 'Alfred',
  USER_ID: 'seu-nome',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 5000]
};

// Se estiver usando Vercel (produção), não precisa deste arquivo
// As variáveis de ambiente serão injetadas automaticamente
```

### 2. Criar Sistema de Config Híbrido

**Novo arquivo:** `/js/config.js`

Este arquivo será carregado ANTES de `app.js` e detectará automaticamente se está em produção (Vercel) ou desenvolvimento local.

```javascript
// js/config.js
// Sistema de configuração híbrido: Vercel env vars (produção) ou config.js (local)

(function() {
  'use strict';

  // Detectar ambiente
  const isProduction = window.location.hostname !== 'localhost' &&
                       window.location.hostname !== '127.0.0.1';

  let config;

  if (isProduction) {
    // PRODUÇÃO: Vercel injeta as variáveis via <meta> tags
    // Vercel build script gera estas tags automaticamente
    config = {
      API_ENDPOINT: document.querySelector('meta[name="api-endpoint"]')?.content || '',
      USER_ID: document.querySelector('meta[name="user-id"]')?.content || 'unknown',
      APP_NAME: document.querySelector('meta[name="app-name"]')?.content || 'Alfred',
      TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAYS: [1000, 3000, 5000]
    };
  } else {
    // DESENVOLVIMENTO: Usa config.js local
    config = window.CONFIG || {
      API_ENDPOINT: 'http://localhost:5678/webhook/test',
      USER_ID: 'dev-user',
      APP_NAME: 'Alfred (Dev)',
      TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3,
      RETRY_DELAYS: [1000, 3000, 5000]
    };
  }

  // Validação básica
  if (!config.API_ENDPOINT) {
    console.error('❌ API_ENDPOINT não configurado!');
  }

  // Exportar globalmente
  window.CONFIG = config;

  console.log('✅ Config carregado:', {
    ambiente: isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO',
    userId: config.USER_ID,
    appName: config.APP_NAME,
    hasEndpoint: !!config.API_ENDPOINT
  });
})();
```

### 3. Atualizar `index.html`

**Arquivo:** `/index.html`

Adicionar meta tags dinâmicas e carregar novo arquivo de config:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Meta tags de configuração (injetadas pelo Vercel) -->
  <meta name="api-endpoint" content="{{API_ENDPOINT}}">
  <meta name="user-id" content="{{USER_ID}}">
  <meta name="app-name" content="{{APP_NAME}}">

  <title>Alfred - Assistente Pessoal</title>
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- ... HTML existente ... -->

  <!-- Scripts -->
  <script src="config.js" onerror="console.log('config.js não encontrado, usando env vars')"></script>
  <script src="js/config.js"></script> <!-- NOVO: Config híbrido -->
  <script src="js/storage.js"></script>
  <script src="js/api.js"></script>
  <script src="js/speech.js"></script>
  <script src="js/app.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
  </script>
</body>
</html>
```

### 4. Criar Script de Build Vercel

**Novo arquivo:** `/scripts/inject-env.js`

Este script roda automaticamente no build da Vercel e substitui os placeholders `{{VAR}}` pelos valores reais.

```javascript
// scripts/inject-env.js
// Script de build que injeta env vars no HTML

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// Substituir placeholders por valores reais
html = html.replace('{{API_ENDPOINT}}', process.env.API_ENDPOINT || '');
html = html.replace('{{USER_ID}}', process.env.USER_ID || 'unknown');
html = html.replace('{{APP_NAME}}', process.env.APP_NAME || 'Alfred');

fs.writeFileSync(indexPath, html);

console.log('✅ Variáveis de ambiente injetadas no HTML');
console.log('   USER_ID:', process.env.USER_ID);
console.log('   APP_NAME:', process.env.APP_NAME);
```

### 5. Atualizar `vercel.json`

**Arquivo:** `/vercel.json`

```json
{
  "buildCommand": "node scripts/inject-env.js",
  "outputDirectory": ".",
  "framework": null,
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 6. Atualizar `.gitignore`

**Arquivo:** `/.gitignore`

```gitignore
# Config local (não commitar)
config.js

# Build artifacts
.vercel
.DS_Store
node_modules/

# Logs
*.log

# Env vars (apenas para referência, Vercel usa seu próprio sistema)
.env
.env.local
.env.production
```

## Processo de Deploy

### Setup Inicial (uma vez por usuário)

1. **Criar projeto Vercel:**
```bash
vercel --prod
# Nome do projeto: alfred-ricardo (ou alfred-dani, etc)
```

2. **Configurar variáveis de ambiente:**
```bash
# Ricardo
vercel env add API_ENDPOINT production
# Cole: https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-ricardo

vercel env add USER_ID production
# Digite: ricardo-nilton

vercel env add APP_NAME production
# Digite: Alfred
```

3. **Fazer redeploy para aplicar env vars:**
```bash
vercel --prod
```

### Deploy Contínuo (automático)

Após setup inicial:
1. Desenvolva mudanças localmente
2. Teste com `config.js` local
3. `git push origin main`
4. Vercel faz deploy automático nos 4 projetos
5. Cada projeto usa suas próprias env vars

## Desenvolvimento Local

### Setup Local

1. Copiar arquivo de exemplo:
```bash
cp config.example.js config.js
```

2. Editar `config.js` com webhook local ou de teste:
```javascript
const CONFIG = {
  API_ENDPOINT: 'https://n8n-n8n.l1huim.easypanel.host/webhook/test',
  USER_ID: 'ricardo-dev',
  APP_NAME: 'Alfred (Dev)',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 5000]
};
```

3. Rodar servidor local:
```bash
npx http-server -p 3000
```

## Validação

### Checklist de Implementação

- [ ] `js/config.js` criado (sistema híbrido)
- [ ] `index.html` atualizado (meta tags + script)
- [ ] `scripts/inject-env.js` criado
- [ ] `vercel.json` atualizado (buildCommand)
- [ ] `.gitignore` atualizado
- [ ] Testado localmente (com `config.js`)
- [ ] Testado em produção (com env vars)

### Como Testar

**Local:**
1. Abra console do navegador
2. Deve ver: `✅ Config carregado: { ambiente: 'DESENVOLVIMENTO', ... }`
3. Verifique se `window.CONFIG.API_ENDPOINT` está correto

**Produção:**
1. Deploy para Vercel
2. Abra console do navegador
3. Deve ver: `✅ Config carregado: { ambiente: 'PRODUÇÃO', ... }`
4. Verifique se `window.CONFIG.USER_ID` corresponde ao projeto

## N8N Webhooks

### Opção Recomendada: Workflows Separados

Crie 4 workflows independentes no N8N:

**1. Alfred - Ricardo**
- Webhook Path: `/webhook/alfred-ricardo`
- User Context: Profissional (emails de trabalho, clientes, agenda comercial)
- Permissões: Google Workspace empresarial, Supabase tabelas comerciais

**2. Alfred - Dani**
- Webhook Path: `/webhook/alfred-dani`
- User Context: Pessoal
- Permissões: Gmail pessoal, calendário pessoal

**3. Alfred - Letícia**
- Webhook Path: `/webhook/alfred-leticia`
- User Context: Pessoal
- Permissões: Gmail pessoal, calendário escolar

**4. Alfred - Isabelle**
- Webhook Path: `/webhook/alfred-isabelle`
- User Context: Pessoal
- Permissões: Gmail pessoal, calendário escolar

### Estrutura Base de Workflow

Cada workflow N8N deve ter esta estrutura mínima:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Webhook    │────▶│  Validação   │────▶│  Router     │
│  (Trigger)  │     │  (userId)    │     │  (Switch)   │
└─────────────┘     └──────────────┘     └─────────────┘
                                                 │
                    ┌────────────────────────────┼─────────────┐
                    ▼                            ▼             ▼
              ┌──────────┐               ┌──────────┐   ┌──────────┐
              │  Email   │               │  Agenda  │   │ Supabase │
              └──────────┘               └──────────┘   └──────────┘
                    │                            │             │
                    └────────────────────────────┴─────────────┘
                                       ▼
                                ┌──────────────┐
                                │   Response   │
                                │   (Format)   │
                                └──────────────┘
```

## URLs Finais

Após todo setup completo:

| Usuário | URL | Webhook N8N | User ID |
|---------|-----|-------------|---------|
| Ricardo | `alfred-ricardo.vercel.app` | `/webhook/alfred-ricardo` | `ricardo-nilton` |
| Dani | `alfred-dani.vercel.app` | `/webhook/alfred-dani` | `dani` |
| Letícia | `alfred-leticia.vercel.app` | `/webhook/alfred-leticia` | `leticia` |
| Isabelle | `alfred-isabelle.vercel.app` | `/webhook/alfred-isabelle` | `isabelle` |

## Manutenção

### Adicionar Novo Usuário

1. Criar novo projeto Vercel conectado ao mesmo repo
2. Configurar env vars específicas
3. Criar workflow N8N correspondente
4. Pronto! Código já está preparado

### Atualizar Código (todos os usuários)

1. `git push origin main`
2. Todos os projetos atualizam automaticamente
3. Zero esforço adicional

### Debug por Usuário

- Logs separados por projeto no painel Vercel
- Workflows N8N independentes (logs isolados)
- LocalStorage separado (cada URL tem seu próprio storage)

## Segurança

### Boas Práticas

- ✅ Cada usuário tem webhook único (não compartilhado)
- ✅ Variáveis de ambiente nunca commitadas
- ✅ Workflows N8N com permissões específicas por usuário
- ✅ LocalStorage isolado por domínio
- ✅ HTTPS obrigatório (Vercel automático)

### Não Fazer

- ❌ Hardcoded webhooks no código
- ❌ Compartilhar webhook entre usuários
- ❌ Commitar `config.js` com credenciais
- ❌ Dar permissões excessivas nos workflows N8N

---

**Próximos Passos:** Ver `docs/implementação/PLANO-EXECUCAO-MULTI-USER.md` para roteiro detalhado de implementação.
