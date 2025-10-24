# Quick Start - Importar Workflow Corrigido

## ⚡ 3 Passos Rápidos

### 1️⃣ Importar Workflow

1. Abra N8N: https://n8n-n8n.l1huim.easypanel.host
2. Menu **≡** → **Import workflow**
3. Selecione: `alfred-assistant-corrigido-v1.1.2.json`
4. Clique **Import**

---

### 2️⃣ Verificar Credenciais

1. Abra o workflow importado
2. Clique em **OpenAI Chat Model**
3. Verifique credencial: "OpenAi account"
4. Se não existir → Crie nova credencial OpenAI
5. Repita para **OpenAI Chat Model4**

---

### 3️⃣ Ativar Workflow

1. Toggle **Active** (canto superior direito)
2. ✅ Workflow ativo!

---

## 🧪 Teste Rápido

```bash
curl -X POST https://n8n-n8n.l1huim.easypanel.host/webhook/0c689264-8178-477c-a366-66559b14cf16 \
  -H "Content-Type: application/json" \
  -d '{"message":"teste","userId":"ricardo-nilton","timestamp":"2025-10-24T10:00:00Z","source":"web-assistant"}'
```

**Deve retornar:**
```json
{
  "success": true,
  "response": "Rica, ...",
  "type": "generic",
  "timestamp": "...",
  "metadata": {}
}
```

---

## ✅ Pronto!

Workflow corrigido e funcionando. Teste no frontend Alfred.

---

## 📚 Documentação Completa

- **README.md** - Instruções detalhadas
- **COMPARACAO.md** - O que mudou
- **../docs/N8N-WORKFLOW-ANALYSIS.md** - Análise técnica completa
