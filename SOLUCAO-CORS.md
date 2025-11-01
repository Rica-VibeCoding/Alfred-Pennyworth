# Solução CORS - localhost vs 127.0.0.1

## ❌ Problema

**Erro:**
```
Access to fetch at 'https://n8n-n8n.l1huim.easypanel.host/webhook/...'
from origin 'http://localhost:5500' has been blocked by CORS policy
```

---

## ✅ Solução (TESTADA E FUNCIONANDO)

**Use sempre:**
```
http://127.0.0.1:5500
```

**NÃO use:**
```
http://localhost:5500  ❌
```

---

## 🤔 Por Quê?

**CORS do N8N está configurado como:**
```
http://127.0.0.1:5500,https://alfred-pennyworth.vercel.app
```

**Detalhe técnico:**
- Navegadores tratam `localhost` e `127.0.0.1` como **origens diferentes**
- Mesmo sendo tecnicamente o mesmo IP
- CORS bloqueia qualquer origem não autorizada
- Como CORS só aceita `127.0.0.1:5500`, usar `localhost:5500` falha

---

## 🚀 Passo a Passo

### 1. Configure ambiente dev
```bash
cp config.development.js config.js
```

### 2. Inicie servidor
```bash
npm run dev
```

### 3. Abra navegador em:
```
http://127.0.0.1:5500
```

### 4. Teste enviando mensagem

**Deve funcionar sem erros CORS!**

---

## 🔧 Alternativas

### Opção 1: Atualizar CORS N8N (se preferir localhost)

No webhook N8N, mude CORS para:
```
http://localhost:5500,http://127.0.0.1:5500,https://alfred-pennyworth.vercel.app
```

Agora ambos funcionam!

---

### Opção 2: Usar Proxy (se CORS não resolver)

```bash
# Terminal 1
npm run dev:proxy

# Terminal 2
cp config-dev-proxy.js config.js
npm run dev
```

Proxy adiciona headers CORS automaticamente.

---

## 📋 Checklist de Troubleshooting

Se ainda tiver erro CORS:

1. ✅ Você está usando `http://127.0.0.1:5500` (não localhost)?
2. ✅ Servidor está rodando na porta 5500?
3. ✅ `config.js` aponta para N8N correto?
4. ✅ N8N está online e respondendo?
5. ✅ CORS do webhook N8N aceita `http://127.0.0.1:5500`?
6. ✅ Hard refresh (Ctrl+Shift+R) após mudanças?

---

## 📊 Diferenças localhost vs 127.0.0.1

| URL | IP Real | CORS trata como |
|-----|---------|-----------------|
| `http://localhost:5500` | 127.0.0.1 | Origem: `localhost:5500` |
| `http://127.0.0.1:5500` | 127.0.0.1 | Origem: `127.0.0.1:5500` |

**Conclusão:** Mesmo IP, mas CORS vê como origens diferentes!

---

## ✅ Status

- **Data:** 2025-11-01
- **Status:** ✅ RESOLVIDO
- **Solução:** Usar `http://127.0.0.1:5500`
- **Testado:** Sim, funcionando

---

**Última atualização:** Nov 01, 2025
