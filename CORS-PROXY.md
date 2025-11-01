# Solução CORS para Desenvolvimento Local

## Problema

N8N bloqueia requisições de IPs locais por CORS:
```
Access to fetch at 'https://n8n-n8n.l1huim...' from origin 'http://192.168.1.112:8000'
has been blocked by CORS policy
```

---

## Solução 1: localhost (Mais Simples)

**Use localhost ao invés do IP:**

```bash
npm run dev

# Abra navegador em:
http://localhost:8000  ✅ (ao invés de http://192.168.1.112:8000)
```

**Vantagem:** Zero configuração, funciona imediatamente.

---

## Solução 2: Proxy Local (Recomendado para Desenvolvimento)

### Passo 1: Configure o proxy

Edite `config.js` para usar o proxy local:

```javascript
const CONFIG = {
  API_ENDPOINT: 'http://localhost:8001/webhook', // ← Proxy local
  // ... resto igual
};
```

Ou copie o arquivo de exemplo:

```bash
cp config-dev-proxy.js config.js
```

### Passo 2: Inicie o proxy

**Terminal 1 - Proxy:**
```bash
npm run dev:proxy
```

Saída esperada:
```
✅ Proxy rodando em http://localhost:8001
📡 Redirecionando para: https://n8n-n8n.l1huim.easypanel.host/webhook-test/...
```

**Terminal 2 - Servidor Web:**
```bash
npm run dev
```

### Passo 3: Acesse

```
http://localhost:8000
```

**Como funciona:**

```
Browser → localhost:8000 → fetch → localhost:8001 (proxy) → N8N
                                         ↑
                                    Sem CORS!
```

O proxy adiciona headers CORS automaticamente.

---

## Solução 3: Configurar CORS no N8N

Se você tem acesso ao N8N:

1. Abra o workflow no N8N
2. Webhook Node → Settings
3. Adicione header:
   ```
   Access-Control-Allow-Origin: http://192.168.1.112:8000
   ```

Ou permitir todas as origens (apenas dev):
   ```
   Access-Control-Allow-Origin: *
   ```

---

## Comparação

| Solução | Prós | Contras |
|---------|------|---------|
| **localhost** | ✅ Zero config<br>✅ Funciona instantaneamente | ⚠️ Não funciona se precisar testar em outros devices na rede |
| **Proxy** | ✅ Funciona com IP local<br>✅ Testa em qualquer device<br>✅ Simula produção | ⚠️ Precisa rodar 2 terminais |
| **CORS N8N** | ✅ Solução permanente | ⚠️ Requer acesso ao servidor<br>⚠️ Risco de segurança |

---

## Recomendação

**Para testes rápidos:** Use `localhost` (Solução 1)

**Para desenvolvimento ativo:** Use proxy (Solução 2)

**Para produção:** Deploy no Vercel (sem problemas CORS)

---

## Troubleshooting

### Proxy não inicia

```bash
# Verifique se porta 8001 está livre
lsof -i :8001

# Ou mude a porta em proxy-dev.js
const PROXY_PORT = 8002; // ← Mude aqui
```

### Ainda tem erro CORS

1. Verifique se proxy está rodando (`npm run dev:proxy`)
2. Confirme `config.js` aponta para `http://localhost:8001/webhook`
3. Force refresh no browser (Ctrl+Shift+R)
4. Limpe cache do Service Worker:
   ```
   DevTools → Application → Service Workers → Unregister
   ```

### Proxy funciona mas N8N retorna erro

Teste N8N diretamente:

```bash
curl -X POST https://n8n-n8n.l1huim.easypanel.host/webhook-test/0c689264-8178-477c-a366-66559b14cf16 \
  -H "Content-Type: application/json" \
  -d '{"message": "teste", "userId": "ricardo-dev"}'
```

Se retornar erro, o problema está no N8N, não no proxy.

---

## Arquivos Relacionados

- `proxy-dev.js` - Servidor proxy Node.js
- `config-dev-proxy.js` - Configuração exemplo para usar proxy
- `package.json` - Script `dev:proxy` disponível

---

**Última atualização:** Nov 01, 2025
