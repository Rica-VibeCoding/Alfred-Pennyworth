# Desenvolvimento Local - Alfred Pennyworth

## Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Rodar servidor local
npm run dev

# 3. Abrir navegador
http://127.0.0.1:5500

# ⚠️ IMPORTANTE: Use 127.0.0.1 (não localhost)
# Motivo: CORS do N8N aceita apenas 127.0.0.1
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor local (modo TESTE) |
| `npm run start` | Alias para `dev` |
| `npm run prod` | Servidor com config PRODUÇÃO |

---

## Diferenças: Local vs Produção

### Local (Desenvolvimento)

- URL: `http://localhost:5500`
- Config: `config.js` (webhook-test)
- Service Worker: Ativo e atualizado
- Hot reload: Manual (F5 ou Ctrl+Shift+R)

### Produção (Vercel)

- URL: `https://alfred-pennyworth.vercel.app`
- Config: `config-production.backup.js`
- Deploy: Automático via Git push
- CDN: Global (Vercel Edge Network)

---

## Problemas Comuns

### ❌ Erro: "Failed to load resource"

**Causa:** Tentou abrir `index.html` direto (protocolo `file://`)

**Solução:** Sempre use `npm run dev` para rodar servidor HTTP

---

### ❌ Erro: "CORS blocked"

**Causa:** Você está usando URL errada ou CORS não está configurado corretamente

**Soluções na ordem:**

1. **SEMPRE use 127.0.0.1 (NÃO localhost):**
   ```
   http://127.0.0.1:5500           ✅ CORRETO (CORS aceita)
   http://localhost:5500           ❌ ERRADO (CORS bloqueia)
   http://192.168.1.112:5500       ❌ ERRADO (CORS bloqueia)
   ```

   **Por quê:** CORS do N8N está configurado para `http://127.0.0.1:5500`

   **Detalhe técnico:** Navegador trata `localhost` e `127.0.0.1` como origens diferentes!

2. **Se preferir usar localhost:**
   - Atualize CORS do N8N para: `http://localhost:5500,http://127.0.0.1:5500`

3. **Banner de aviso:** Se você abrir via IP de rede errado, um banner amarelo aparece

4. **Proxy (última opção):**
   ```bash
   npm run dev:proxy
   ```

---

### ❌ Service Worker não atualiza

**Causa:** Cache antigo do navegador

**Solução:**
```bash
# Chrome/Edge: DevTools
Application → Service Workers → Unregister

# Safari iOS
Ajustes → Safari → Limpar Histórico

# Ou force refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

---

## Estrutura de Arquivos

```
/
├── index.html              # Página principal
├── manifest.json           # PWA config
├── sw.js                   # Service Worker (v1.3.0)
├── config.js               # Webhook TESTE
├── config-production.backup.js  # Webhook PRODUÇÃO
├── package.json            # Scripts e deps
│
├── css/
│   ├── style.css          # Estilos principais
│   └── cards.css          # Cards formatados
│
├── js/
│   ├── app.js             # Lógica principal
│   ├── api.js             # Comunicação N8N
│   ├── speech.js          # Reconhecimento voz
│   ├── storage-v2.js      # LocalStorage
│   ├── sidebar.js         # Histórico
│   └── cards.js           # Renderização cards
│
└── assets/icons/          # Ícones PWA
```

---

## Funcionalidades

### Banner Automático de URL Incorreta

Se você acessar via IP de rede (ex: `http://192.168.1.112:5500`), um **banner amarelo** aparece automaticamente:

```
⚠️ URL Incorreta
Use localhost para evitar erros CORS com N8N
[Ir para localhost] [×]
```

**Como funciona:**
- Detecta automaticamente se você está usando IP de rede
- Mostra aviso visual claro
- Botão direto para redirecionar para localhost
- Não interfere na produção (apenas ambiente local)

---

## Changelog

### v1.3.1 (2025-11-01)
- ✅ Detector automático de URL incorreta
- ✅ Banner de aviso CORS com redirecionamento
- ✅ Documentação atualizada sobre localhost vs IP

### v1.3.0 (2025-11-01)
- ✅ Adicionado `cards.css` e `cards.js` ao Service Worker
- ✅ Bump versão cache para forçar atualização
- ✅ Criado `package.json` com scripts dev
- ✅ Documentação desenvolvimento local

### v1.2.5
- Service Worker com bypass N8N (iOS fix)
- Storage V2 com sessões múltiplas
- Sidebar com ícones contextuais

---

## Teste de Funcionamento

**Checklist:**

1. ✅ Servidor roda sem erros
2. ✅ Console sem erros CORS
3. ✅ Service Worker registrado
4. ✅ PWA instalável
5. ✅ Envio de mensagem funciona
6. ✅ Histórico persiste
7. ✅ Voz funciona (HTTPS obrigatório)

---

## Dúvidas?

Consulte documentação completa em `docs/README.md`
