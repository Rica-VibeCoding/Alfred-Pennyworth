# Instruções - Workflow com Embeddings

## ✅ O que foi criado:

**Workflow:** `sincronizacao-google-contacts-com-embeddings.json`

**Adiciona 4 novos nós ao workflow original:**

```
UPSERT Contatos
  ↓
Preparar Embedding (Code)
  ↓
OpenAI Embeddings API (HTTP Request)
  ↓
Formatar Embedding (Code)
  ↓
UPSERT Embeddings (PostgreSQL)
```

---

## 📋 Importar Workflow

### 1. Backup do workflow atual

**Antes de importar:**
```
N8N > Workflows > "Atualiza dados"
Menu ⋮ > Download
Guarde como backup
```

### 2. Importar novo workflow

```
N8N > Workflows > Import from File
Selecione: n8n/fluxos/sincronizacao-google-contacts-com-embeddings.json
Import
```

### 3. Configurar credenciais

**Nós que precisam credencial:**

✅ **Buscar Contatos Google** - Já configurado
✅ **UPSERT Contatos** - Já configurado
✅ **OpenAI Embeddings API** - Precisa configurar
✅ **UPSERT Embeddings** - Já configurado

**Configurar OpenAI:**
1. Nó "OpenAI Embeddings API"
2. Credentials > Select
3. Escolha: "OpenAi account" (mesma do workflow "teste")
4. Save

---

## 🧪 Testar Workflow

### Teste 1: Execução Manual (1 contato)

1. Abra o workflow
2. Clique no nó "Executar diariamente às 3h"
3. "Execute Node"
4. Aguarde processar

**Verificar:**
```sql
-- Ver se embedding foi criado
SELECT COUNT(*) FROM rica_contatos_embeddings;
-- Deve ter 1+ registros

-- Ver exemplo
SELECT
  contato_id,
  content,
  metadata,
  created_at
FROM rica_contatos_embeddings
LIMIT 1;
```

### Teste 2: Verificar embedding

```sql
-- Ver dimensão do vetor (deve ser 1536)
SELECT array_length(embedding::float[], 1) as dimensao
FROM rica_contatos_embeddings
LIMIT 1;
```

---

## 🔍 Detalhes dos Nós Novos

### Nó 1: Preparar Embedding (Code)

**O que faz:**
- Recebe dados do UPSERT Contatos (id, nome, telefone, email)
- Monta texto formatado: `"Nome: X | Telefone: Y | Email: Z"`
- Prepara metadata (JSON com dados originais)

**Output:**
```json
{
  "contato_id": "uuid",
  "apelido": "people/...",
  "content": "Nome: Gustavo | Telefone: +55...",
  "metadata": {"id": "...", "nome_completo": "..."}
}
```

---

### Nó 2: OpenAI Embeddings API (HTTP Request)

**O que faz:**
- Chama API OpenAI: `POST /v1/embeddings`
- Modelo: `text-embedding-3-small`
- Input: texto do `content`

**Output:**
```json
{
  "data": [{
    "embedding": [0.234, 0.891, ..., 1536 números],
    "index": 0
  }],
  "model": "text-embedding-3-small",
  "usage": {"prompt_tokens": 12, "total_tokens": 12}
}
```

**Custo:** ~$0.00001 por contato

---

### Nó 3: Formatar Embedding (Code)

**O que faz:**
- Extrai array de embedding da resposta OpenAI
- Formata como string PostgreSQL: `[0.234,0.891,...]`
- Combina com dados originais do "Preparar Embedding"

**Output:**
```json
{
  "contato_id": "uuid",
  "apelido": "people/...",
  "content": "Nome: Gustavo...",
  "embedding": "[0.234,0.891,...]",
  "metadata": "{\"id\":\"...\",\"nome_completo\":\"...\"}"
}
```

---

### Nó 4: UPSERT Embeddings (PostgreSQL)

**O que faz:**
- Insere embedding na tabela `rica_contatos_embeddings`
- Se já existe (conflict no contato_id): atualiza
- Se não existe: cria novo registro

**Query:**
```sql
INSERT INTO public.rica_contatos_embeddings (
  contato_id,
  content,
  embedding,
  metadata
)
SELECT
  'uuid'::uuid,
  'content text',
  '[...]'::vector,
  '{...}'::jsonb
ON CONFLICT (contato_id)
DO UPDATE SET
  content = EXCLUDED.content,
  embedding = EXCLUDED.embedding,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
```

---

## ⚠️ Possíveis Erros

### Erro: "API key invalid"

**Causa:** Credencial OpenAI não configurada

**Solução:**
1. Nó "OpenAI Embeddings API"
2. Credentials > Create New
3. API Key: cole sua chave OpenAI
4. Save

---

### Erro: "vector type does not exist"

**Causa:** Extensão pgvector não instalada

**Solução:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### Erro: "embedding dimension mismatch"

**Causa:** Embedding não tem 1536 dimensões

**Verificar:**
- Model na API: `text-embedding-3-small` (correto)
- Embedding array tem 1536 elementos

**Debug:**
```javascript
// No nó "Formatar Embedding", adicione console.log:
const embedding = item.json.data[0].embedding;
console.log('Embedding length:', embedding.length); // Deve ser 1536
```

---

### Erro: "rate limit exceeded"

**Causa:** Muitas chamadas OpenAI simultâneas

**Solução:** Adicionar "Split in Batches" antes de "Preparar Embedding"

```
UPSERT Contatos
  ↓
Split in Batches (100 por lote)
  ↓
Preparar Embedding
  ...
```

---

## 💰 Custos por Execução

**Cenário:** 1748 contatos sincronizados

### Primeira execução (população inicial):
- 1748 contatos × $0.00001 = **$0.01748**

### Execuções seguintes (apenas novos/modificados):
- Exemplo: 10 contatos novos × $0.00001 = **$0.0001**

### Mensal (estimativa):
- ~50 contatos novos/modificados × $0.00001 = **$0.0005/mês**

**Anual:** ~$0.006 (praticamente grátis!)

---

## 📊 Performance

| Métrica | Tempo estimado |
|---------|----------------|
| 1 contato | ~1s |
| 100 contatos | ~30s |
| 1748 contatos | ~8min |

**Gargalo:** Chamadas sequenciais à API OpenAI

---

## 🚀 Próximos Passos

### 1. Executar workflow manual (testar)
### 2. Verificar embeddings criados
### 3. Ativar workflow (sync automática 3h AM)
### 4. Modificar workflow "teste" (usar Vector Store)

---

## 📝 Notas Importantes

- **Sync automática:** Embeddings criados junto com contatos
- **Paginação:** Funciona com 1000+ contatos
- **Idempotente:** Executar 2x não duplica embeddings (UPSERT)
- **Cascade delete:** Deletar contato deleta embedding automaticamente

---

**Workflow pronto para usar!** 🎉

Importe, configure OpenAI credential, e execute!
