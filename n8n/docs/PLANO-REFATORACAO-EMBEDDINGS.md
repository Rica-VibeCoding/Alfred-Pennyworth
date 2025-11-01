# Plano de Execução: Refatoração Sistema de Embeddings

## Contexto

**Sistema:** N8N workflow "UPSERT - GPT" sincroniza Google Contacts → Supabase → OpenAI Embeddings
**Problema:** Arquitetura atual não suporta busca otimizada por apelidos curtos ("Dani", "Lu", etc)
**Solução:** Implementar embeddings duplos (name + full) + busca híbrida (texto + vetor)

### Estado Atual

**Workflow N8N:** `IxyhrhwK7pI4Q4Cc` (UPSERT - GPT)
- ✅ Gera 2 embeddings por contato (código correto em "Preparar Embedding")
- ❌ Node "Formatar Embedding" quebrado (espera 2 inputs, recebe 1)
- ❌ Salva apenas 1 embedding genérico

**Supabase:**
- Tabela: `rica_contatos` (1808 registros)
- Tabela: `rica_contatos_embeddings` (1807 registros)
- ❌ Schema não suporta 2 embeddings
- ❌ Sem índices vetoriais ou trigram

### Estado Desejado

**Workflow N8N:**
- ✅ Pipeline completo funcional (Google → Postgres → OpenAI → Upsert)
- ✅ 2 embeddings salvos: `embedding_name` (recall) + `embedding_full` (contexto)
- ✅ SQL parametrizado (seguro contra injection)

**Supabase:**
- ✅ Colunas: `embedding_name`, `embedding_full`, `nome_normalized`, `apelido_normalized`
- ✅ Índices: HNSW (vetorial) + GIN trigram (textual)
- ✅ Trigger de normalização automática

---

## Arquitetura Escolhida: Opção B (Colunas Diretas)

**Justificativa:**
- Melhor performance (sem JOIN)
- Menos complexidade
- Segue recomendação OpenAI + pgvector best practices

**Trade-off:** Migração mais disruptiva, mas benefício de longo prazo.

---

## FASE 1: Preparação e Backup

### Tarefa 1.1: Backup Completo
**Objetivo:** Garantir rollback seguro

```bash
# Via Supabase Dashboard ou CLI
# 1. Settings → Database → Backups → Create Backup
# 2. Anotar backup ID/timestamp
```

**Validação:**
```sql
-- Confirmar contagem de registros
SELECT
  'rica_contatos' as tabela, COUNT(*) as total FROM rica_contatos
UNION ALL
SELECT
  'rica_contatos_embeddings', COUNT(*) FROM rica_contatos_embeddings;
```

**Resultado Esperado:** 1808 contatos + 1807 embeddings

---

### Tarefa 1.2: Backup do Workflow Local
**Objetivo:** Backup do arquivo JSON antes de modificar

```bash
# Copiar arquivo atual
cp "n8n/fluxos/UPSERT - GPT.json" "n8n/fluxos/backup/UPSERT-GPT-V4-backup-$(date +%Y%m%d).json"
```

**Validação:** Confirmar que arquivo de backup existe e tem ~370 linhas

---

### Tarefa 1.3: Criar Extensões Postgres
**Objetivo:** Habilitar pgvector + unaccent + trigram

```sql
-- Executar via Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Validação:**
```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('vector', 'unaccent', 'pg_trgm');
```

**Resultado Esperado:** 3 linhas retornadas

---

## FASE 2: Migração de Schema

### Tarefa 2.1: Adicionar Novas Colunas
**Objetivo:** Preparar `rica_contatos` para embeddings duplos

```sql
-- Migration: add_embeddings_columns
ALTER TABLE rica_contatos
  ADD COLUMN IF NOT EXISTS embedding_name vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_full vector(1536),
  ADD COLUMN IF NOT EXISTS nome_normalized text,
  ADD COLUMN IF NOT EXISTS apelido_normalized text;

-- Comentários para documentação
COMMENT ON COLUMN rica_contatos.embedding_name IS
  'Embedding curto (nome+apelido) - otimizado para recall por apelidos';
COMMENT ON COLUMN rica_contatos.embedding_full IS
  'Embedding completo (todos campos) - contexto para reranking';
COMMENT ON COLUMN rica_contatos.nome_normalized IS
  'Nome normalizado (lowercase + sem acentos) para busca textual';
COMMENT ON COLUMN rica_contatos.apelido_normalized IS
  'Apelido normalizado para busca textual';
```

**Validação:**
```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'rica_contatos'
  AND column_name IN ('embedding_name', 'embedding_full', 'nome_normalized', 'apelido_normalized');
```

**Resultado Esperado:** 4 colunas retornadas

---

### Tarefa 2.2: Migrar Dados Existentes
**Objetivo:** Copiar embeddings da tabela antiga para nova estrutura

```sql
-- Migration: migrate_existing_embeddings
-- NOTA: Como só existe 1 embedding, vamos duplicá-lo em ambas colunas
-- O workflow regenerará embeddings corretos na próxima sync

UPDATE rica_contatos rc
SET
  embedding_name = rce.embedding,
  embedding_full = rce.embedding,
  nome_normalized = lower(unaccent(COALESCE(rc.nome_completo, ''))),
  apelido_normalized = lower(unaccent(COALESCE(rc.apelido, '')))
FROM rica_contatos_embeddings rce
WHERE rc.id = rce.contato_id;
```

**Validação:**
```sql
-- Verificar quantos registros foram atualizados
SELECT
  COUNT(*) FILTER (WHERE embedding_name IS NOT NULL) as com_embedding_name,
  COUNT(*) FILTER (WHERE embedding_full IS NOT NULL) as com_embedding_full,
  COUNT(*) FILTER (WHERE nome_normalized IS NOT NULL) as com_nome_norm,
  COUNT(*) as total
FROM rica_contatos;
```

**Resultado Esperado:** ~1807 registros com embeddings (1 pode estar sem por ser órfão)

---

### Tarefa 2.3: Criar Trigger de Normalização
**Objetivo:** Manter colunas normalizadas automaticamente

```sql
-- Migration: create_normalization_trigger
CREATE OR REPLACE FUNCTION rica_contatos_normalize_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.nome_normalized := lower(unaccent(COALESCE(NEW.nome_completo, '')));
  NEW.apelido_normalized := lower(unaccent(COALESCE(NEW.apelido, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rica_contatos_normalize
BEFORE INSERT OR UPDATE ON rica_contatos
FOR EACH ROW
EXECUTE FUNCTION rica_contatos_normalize_trigger();
```

**Validação:**
```sql
-- Testar trigger com INSERT dummy
INSERT INTO rica_contatos (nome_completo, apelido)
VALUES ('José da Silva', 'Zé')
RETURNING nome_normalized, apelido_normalized;

-- Limpar teste
DELETE FROM rica_contatos
WHERE nome_completo = 'José da Silva' AND apelido = 'Zé';
```

**Resultado Esperado:** `nome_normalized = 'jose da silva'`, `apelido_normalized = 'ze'`

---

## FASE 3: Criar Índices

### Tarefa 3.1: Índices Trigram (Busca Textual)
**Objetivo:** Busca fuzzy por substring ("dani" acha "Danielle")

```sql
-- Migration: create_trigram_indexes
-- GIN = índice invertido, ótimo para busca textual
CREATE INDEX IF NOT EXISTS idx_rica_nome_trgm
  ON rica_contatos USING gin(nome_normalized gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_rica_apelido_trgm
  ON rica_contatos USING gin(apelido_normalized gin_trgm_ops);
```

**Tempo estimado:** ~10-30 segundos (1808 registros)

**Validação:**
```sql
-- Listar índices criados
SELECT
  schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'rica_contatos'
  AND indexname LIKE '%trgm%';
```

**Resultado Esperado:** 2 índices retornados

---

### Tarefa 3.2: Índices Vetoriais HNSW
**Objetivo:** Busca semântica por similaridade

```sql
-- Migration: create_vector_indexes
-- HNSW = melhor recall para datasets < 100k
-- m=16, ef_construction=64 = valores padrão recomendados

CREATE INDEX IF NOT EXISTS idx_rica_embedding_name_hnsw
  ON rica_contatos
  USING hnsw(embedding_name vector_l2_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_rica_embedding_full_hnsw
  ON rica_contatos
  USING hnsw(embedding_full vector_l2_ops)
  WITH (m = 16, ef_construction = 64);
```

**Tempo estimado:** ~1-3 minutos (1807 vetores × 1536 dimensões)

**Validação:**
```sql
-- Listar índices vetoriais
SELECT
  schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'rica_contatos'
  AND indexname LIKE '%hnsw%';
```

**Resultado Esperado:** 2 índices retornados

---

### Tarefa 3.3: Testar Performance dos Índices
**Objetivo:** Confirmar que índices estão sendo usados

```sql
-- Teste 1: Busca textual (deve usar idx_rica_nome_trgm)
EXPLAIN ANALYZE
SELECT id, nome_completo, apelido
FROM rica_contatos
WHERE nome_normalized ILIKE '%dani%'
LIMIT 10;

-- Teste 2: Busca vetorial (deve usar idx_rica_embedding_name_hnsw)
-- NOTA: Precisa de um vetor real, use um embedding existente
EXPLAIN ANALYZE
SELECT id, nome_completo, apelido,
       embedding_name <-> (SELECT embedding_name FROM rica_contatos LIMIT 1) AS distance
FROM rica_contatos
ORDER BY distance
LIMIT 10;
```

**Resultado Esperado:**
- `EXPLAIN ANALYZE` deve mostrar "Index Scan using idx_rica_nome_trgm"
- Query vetorial deve mostrar "Index Scan using idx_rica_embedding_name_hnsw"

---

## FASE 4: Refatorar Workflow N8N (Edição Local)

**Arquivo:** `n8n/fluxos/UPSERT - GPT.json`

### Tarefa 4.1: Atualizar Node "Preparar Embedding"
**Objetivo:** Confirmar que código está correto (já implementado)

**Node ID:** `3493c08e-4269-4683-a8fc-13c90f83142c` (linha 98)

**Ação:** ✅ Nenhuma mudança necessária - código já gera embeddings duplos corretamente.

**Validação:** Verificar que `jsCode` contém:
```js
// short embedding only nome + apelido
const short = `Nome: ${nome}${apelido ? ` | Apelido: ${apelido}` : ''}`;

// full embedding com mais metadados
const parts = [...]
const full = parts.join(' | ');
```

---

### Tarefa 4.2: Fixar Node "Formatar Embedding"
**Objetivo:** Corrigir bug de inputs desconectados

**Node ID:** `b089a927-d2b3-4bd6-9e37-e4e2e5664b5c` (linha 59)

**Problema:** Código espera 2 inputs, mas só recebe 1 (OpenAI).

**Solução:** Substituir todo o `jsCode` do node por:

```js
// Formatar Embedding V5 - Fix input único
// Acessa output do node "Preparar Embedding" via referência
const openaiResponse = $input.first().json;
const prepareNode = $('Preparar Embedding').first().json;

const mapping = prepareNode.mapping;
const embeddingsData = openaiResponse.data;

const outputs = [];

for (const m of mapping) {
  const embName = embeddingsData[m.idxName].embedding;
  const embFull = embeddingsData[m.idxFull].embedding;

  // Normalização para busca textual
  const nome_normalized = (m.nome || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
  const apelido_normalized = (m.apelido || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');

  outputs.push({
    json: {
      contato_id: m.contactId,
      nome: m.nome,
      apelido: m.apelido,
      nome_normalized,
      apelido_normalized,
      embedding_name: embName,
      embedding_full: embFull
    }
  });
}

return outputs;
```

**Edição no JSON:**
1. Abrir `n8n/fluxos/UPSERT - GPT.json`
2. Localizar node com `"id": "b089a927-d2b3-4bd6-9e37-e4e2e5664b5c"`
3. Substituir todo conteúdo de `parameters.jsCode` pelo código acima
4. Salvar arquivo

**Validação:** Verificar que JSON continua válido:
```bash
# Validar sintaxe JSON
jq empty "n8n/fluxos/UPSERT - GPT.json" && echo "JSON válido" || echo "JSON INVÁLIDO"
```

---

### Tarefa 4.3: Atualizar Node "UPSERT Embeddings"
**Objetivo:** Usar schema novo + SQL parametrizado (segurança)

**Node ID:** `b514390c-84ff-4cb6-a319-5b9366591e08` (linha 38)

**Substituir a query atual por:**

```sql
-- V5: UPSERT embeddings duplos em rica_contatos
INSERT INTO rica_contatos (
  id,
  embedding_name,
  embedding_full,
  updated_at
)
VALUES (
  $1::uuid,
  $2::vector,
  $3::vector,
  NOW()
)
ON CONFLICT (id)
DO UPDATE SET
  embedding_name = EXCLUDED.embedding_name,
  embedding_full = EXCLUDED.embedding_full,
  updated_at = NOW()
RETURNING id, nome_completo, apelido;
```

**Adicionar Query Parameters:**

No mesmo node, adicionar em `parameters.options`:

```json
"options": {
  "queryReplacement": "={{ [$json.contato_id, JSON.stringify($json.embedding_name), JSON.stringify($json.embedding_full)] }}"
}
```

**Edição no JSON:**
1. Localizar node `"name": "UPSERT Embeddings"`
2. Substituir `parameters.query` pela SQL acima
3. Adicionar/atualizar `parameters.options.queryReplacement`
4. Salvar

**IMPORTANTE:** Arrays de embeddings precisam ser stringificados antes de passar como parâmetro.

---

### Tarefa 4.4: Atualizar Node "UPSERT Contatos"
**Objetivo:** Retornar ID correto para próximo node

**Node ID:** `9737bf56-829f-43c7-b530-4d1b3a071349` (linha 111)

**Modificação:** Na query, adicionar `u.id` no SELECT final (linha ~135 do JSON):

```sql
SELECT
  u.id,
  u.apelido,
  u.nome_completo,
  u.telefone_celular,
  u.email_pessoal,
  u.last_synced_at
FROM upserted u
LEFT JOIN rica_contatos_embeddings e ON u.id = e.contato_id
WHERE e.id IS NULL
   OR u.last_synced_at > COALESCE(e.updated_at, '1970-01-01'::timestamptz);
```

**NOTA:** Como vamos deprecar `rica_contatos_embeddings`, o LEFT JOIN pode ser simplificado para sempre retornar todos os registros upserted. Versão simplificada:

```sql
SELECT
  u.id,
  u.apelido,
  u.nome_completo,
  u.telefone_celular,
  u.email_pessoal,
  u.last_synced_at
FROM upserted u;
```

**Edição no JSON:**
1. Localizar node `"name": "UPSERT Contatos"`
2. Substituir `parameters.query` adicionando `u.id,` na linha do SELECT
3. Salvar

---

### Tarefa 4.5: Atualizar Metadados do Workflow
**Objetivo:** Versionar e documentar mudanças

**Edições no JSON (root level):**

1. Atualizar nome (linha 2):
```json
"name": "UPSERT - GPT V5 (Embeddings Duplos)",
```

2. Atualizar tags (linha 350):
```json
"tags": [
  {
    "createdAt": "2025-01-27T00:00:00.000Z",
    "updatedAt": "2025-01-27T00:00:00.000Z",
    "id": "newTagId",
    "name": "Sincronização V5 - Embeddings Duplos"
  }
]
```

3. Adicionar comentário no workflow settings (linha 341):
```json
"settings": {
  "executionOrder": "v1"
},
"meta": {
  "templateCredsSetupCompleted": true,
  "instanceId": "4740ab58cf433b05199fb4547fa224edfed4153137d3ec2dbea712e59a93bfde",
  "notes": "V5: Embeddings duplos (name+full) + busca híbrida. Migração schema para colunas diretas em rica_contatos."
}
```

---

### Tarefa 4.6: Validar JSON Final
**Objetivo:** Garantir que arquivo está sintaticamente correto

```bash
# Validação de sintaxe
jq empty "n8n/fluxos/UPSERT - GPT.json"

# Validar estrutura de nodes
jq '.nodes | length' "n8n/fluxos/UPSERT - GPT.json"
# Esperado: 10

# Validar conexões
jq '.connections | keys | length' "n8n/fluxos/UPSERT - GPT.json"
# Esperado: 8

# Listar nodes modificados
jq -r '.nodes[] | select(.id == "b089a927-d2b3-4bd6-9e37-e4e2e5664b5c" or .id == "b514390c-84ff-4cb6-a319-5b9366591e08" or .id == "9737bf56-829f-43c7-b530-4d1b3a071349") | .name' "n8n/fluxos/UPSERT - GPT.json"
# Esperado:
# Formatar Embedding
# UPSERT Embeddings
# UPSERT Contatos
```

---

### Tarefa 4.7: Importar Workflow no N8N
**Objetivo:** Substituir workflow antigo pela versão refatorada

**Opção A - Via Interface N8N:**
1. Abrir N8N: `https://n8n-n8n-editor.neldoo.easypanel.host/`
2. Workflows → Abrir "UPSERT - GPT" (ID: `IxyhrhwK7pI4Q4Cc`)
3. Settings → Download/Export → Confirmar
4. Fechar workflow
5. Workflows → Import → Selecionar `n8n/fluxos/UPSERT - GPT.json` (versão editada)
6. Escolher "Replace" (substituir workflow existente)
7. Confirmar credenciais (Postgres, OpenAI, Google Contacts)

**Opção B - Via MCP (Recomendado):**
```bash
# Ler JSON local
json_content=$(cat "n8n/fluxos/UPSERT - GPT.json")

# Atualizar workflow via MCP
mcp__n8n-mcp__n8n_update_full_workflow({
  "id": "IxyhrhwK7pI4Q4Cc",
  "name": "UPSERT - GPT V5 (Embeddings Duplos)",
  "nodes": [/* copiar do JSON */],
  "connections": {/* copiar do JSON */},
  "settings": {/* copiar do JSON */}
})
```

**Validação:**
1. Abrir workflow no N8N
2. Verificar que nodes foram atualizados (ver código JS)
3. Verificar credenciais conectadas
4. NÃO ativar ainda (testar primeiro manualmente)

---

## FASE 5: Testes e Validação

### Tarefa 5.1: Teste Unitário - Workflow Completo
**Objetivo:** Executar workflow do início ao fim

**Steps:**
1. N8N → Ativar workflow `IxyhrhwK7pI4Q4Cc`
2. Executar manualmente (botão "Execute Workflow")
3. Verificar cada node:
   - ✅ "Buscar Contatos Google" retorna registros
   - ✅ "Preparar Embedding" gera `batchInputs` correto
   - ✅ "OpenAI Embeddings API" retorna 200 OK
   - ✅ "Formatar Embedding" não falha (fix do bug)
   - ✅ "UPSERT Embeddings" insere/atualiza sem erro

**Validação:**
```sql
-- Verificar se embeddings foram atualizados
SELECT
  COUNT(*) FILTER (WHERE embedding_name IS NOT NULL) as com_name,
  COUNT(*) FILTER (WHERE embedding_full IS NOT NULL) as com_full,
  MAX(updated_at) as ultima_atualizacao
FROM rica_contatos;
```

**Resultado Esperado:** Timestamp recente em `ultima_atualizacao`.

---

### Tarefa 5.2: Teste de Busca Híbrida
**Objetivo:** Validar que busca funciona corretamente

**Query Teste 1 - Busca Textual:**
```sql
-- Deve retornar "Dani", "Daniela", "Danielle", etc
SELECT id, nome_completo, apelido
FROM rica_contatos
WHERE nome_normalized ILIKE '%dani%'
   OR apelido_normalized ILIKE '%dani%'
LIMIT 10;
```

**Query Teste 2 - Busca Vetorial:**
```sql
-- Gerar embedding para "Dani" via OpenAI primeiro
-- Depois usar este embedding na query:

WITH q AS (
  SELECT '[0.1, 0.2, ...]'::vector AS q_embedding  -- substituir por embedding real
)
SELECT
  id,
  nome_completo,
  apelido,
  embedding_name <-> (SELECT q_embedding FROM q) AS distance
FROM rica_contatos
ORDER BY distance
LIMIT 10;
```

**Query Teste 3 - Busca Híbrida (Prioriza Texto):**
```sql
WITH q AS (
  SELECT
    '[0.1, 0.2, ...]'::vector AS q_embedding,  -- embedding de "Dani"
    'dani' AS q_text
),

text_matches AS (
  SELECT id, nome_completo, apelido, 0.0 AS distance, 1 AS priority
  FROM rica_contatos
  WHERE nome_normalized ILIKE '%' || (SELECT q_text FROM q) || '%'
     OR apelido_normalized ILIKE '%' || (SELECT q_text FROM q) || '%'
),

vector_matches AS (
  SELECT
    id, nome_completo, apelido,
    embedding_name <-> (SELECT q_embedding FROM q) AS distance,
    0 AS priority
  FROM rica_contatos
  ORDER BY embedding_name <-> (SELECT q_embedding FROM q)
  LIMIT 50
)

SELECT id, nome_completo, apelido, distance, priority
FROM (
  SELECT * FROM text_matches
  UNION ALL
  SELECT * FROM vector_matches
) combined
ORDER BY priority DESC, distance ASC
LIMIT 20;
```

**Resultado Esperado:** Matches textuais aparecem primeiro (priority=1), seguidos de matches semânticos.

---

### Tarefa 5.3: Teste de Regressão
**Objetivo:** Garantir que funcionalidades antigas ainda funcionam

**Checklist:**
- [ ] Workflow roda em schedule (12h) sem falhar
- [ ] Paginação do Google Contacts funciona (pageToken)
- [ ] Timestamps do Google são preservados (`last_synced_at`)
- [ ] Contatos sem alteração não geram embeddings duplicados
- [ ] Trigger de `updated_at` funciona

**Validação:**
```sql
-- Verificar última sync
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE last_synced_at IS NOT NULL) as com_sync,
  MAX(last_synced_at) as ultima_sync
FROM rica_contatos;
```

---

## FASE 6: Limpeza e Documentação

### Tarefa 6.1: Deprecar Tabela Antiga (Opcional)
**Objetivo:** Remover `rica_contatos_embeddings` após confirmação

**ATENÇÃO:** Só executar após 7 dias de validação em produção.

```sql
-- BACKUP antes de dropar
CREATE TABLE rica_contatos_embeddings_backup AS
SELECT * FROM rica_contatos_embeddings;

-- Dropar tabela
DROP TABLE rica_contatos_embeddings CASCADE;
```

**Alternativa (Conservadora):** Apenas renomear para `_legacy`:
```sql
ALTER TABLE rica_contatos_embeddings
RENAME TO rica_contatos_embeddings_legacy;
```

---

### Tarefa 6.2: Atualizar Tags do Workflow
**Objetivo:** Versionar workflow corretamente

Via N8N:
1. Abrir workflow `IxyhrhwK7pI4Q4Cc`
2. Settings → Tags → Remover "Sincronização V3 - Fixed"
3. Adicionar tag "Sincronização V5 - Embeddings Duplos"
4. Salvar

---

### Tarefa 6.3: Documentar Mudanças
**Objetivo:** Criar changelog para referência futura

Criar arquivo: `n8n/docs/CHANGELOG-EMBEDDINGS-V5.md`

```markdown
# Changelog: Refatoração Sistema de Embeddings

## V5 (2025-01-XX)

### Mudanças Estruturais
- Migração de `rica_contatos_embeddings` (tabela separada) → colunas diretas em `rica_contatos`
- Embeddings duplos: `embedding_name` (recall) + `embedding_full` (contexto)
- Normalização automática via trigger

### Performance
- Índices HNSW (vetorial): ~50ms para busca semântica
- Índices GIN trigram (textual): ~10ms para busca fuzzy
- Busca híbrida: texto prioritário + vetor complementar

### Segurança
- SQL parametrizado (query parameters) em vez de template strings
- Validação de tipos (::uuid, ::vector)

### Breaking Changes
- Query de busca antiga não funciona mais (usar query híbrida)
- Endpoints que acessavam `rica_contatos_embeddings` devem ser atualizados
```

---

## FASE 7: Monitoramento Pós-Deploy

### Tarefa 7.1: Monitorar Custos OpenAI
**Objetivo:** Validar que batching está economizando tokens

**Cálculo:**
- Antes: 1808 contatos × 2 chamadas = 3616 requests
- Depois: ~18 batches (100 contatos/batch) × 2 embeddings = 36 requests
- Economia: **99% de chamadas**

**Validação:** Verificar dashboard OpenAI após 1 semana.

---

### Tarefa 7.2: Monitorar Performance de Queries
**Objetivo:** Confirmar que índices melhoraram latência

```sql
-- Query slow log (se habilitado)
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query ILIKE '%rica_contatos%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Meta:** Busca vetorial < 100ms, busca textual < 20ms.

---

### Tarefa 7.3: Alertas de Falha
**Objetivo:** N8N notificar se workflow falhar

**Configuração:**
1. N8N → Workflow Settings
2. Error Workflow → Selecionar workflow de notificação (Slack/Email)
3. Configurar mensagem com detalhes do erro

---

## Rollback Plan

### Se FASE 2 Falhar (Schema)
```sql
-- Reverter colunas
ALTER TABLE rica_contatos
  DROP COLUMN IF EXISTS embedding_name,
  DROP COLUMN IF EXISTS embedding_full,
  DROP COLUMN IF EXISTS nome_normalized,
  DROP COLUMN IF EXISTS apelido_normalized;
```

### Se FASE 3 Falhar (Índices)
```sql
-- Dropar índices
DROP INDEX IF EXISTS idx_rica_nome_trgm;
DROP INDEX IF EXISTS idx_rica_apelido_trgm;
DROP INDEX IF EXISTS idx_rica_embedding_name_hnsw;
DROP INDEX IF EXISTS idx_rica_embedding_full_hnsw;
```

### Se FASE 4 Falhar (Workflow)
1. Restaurar arquivo JSON do backup:
   ```bash
   cp "n8n/fluxos/backup/UPSERT-GPT-V4-backup-*.json" "n8n/fluxos/UPSERT - GPT.json"
   ```
2. N8N → Reimportar workflow do backup (Tarefa 1.2)
3. Restaurar credenciais se necessário
4. Reativar workflow antigo

### Se Tudo Falhar
1. Supabase Dashboard → Settings → Database → Backups
2. Restore backup da Tarefa 1.1
3. N8N → Import workflow backup
4. Investigar logs de erro

---

## Checklist Final

**Pré-Deploy:**
- [ ] Backup Supabase criado (Tarefa 1.1)
- [ ] Backup workflow N8N criado (Tarefa 1.2)
- [ ] Extensões instaladas (Tarefa 1.3)

**Deploy:**
- [ ] Schema migrado (Fase 2)
- [ ] Índices criados (Fase 3)
- [ ] Workflow refatorado (Fase 4)

**Pós-Deploy:**
- [ ] Testes unitários passaram (Tarefa 5.1)
- [ ] Busca híbrida funciona (Tarefa 5.2)
- [ ] Testes de regressão OK (Tarefa 5.3)
- [ ] Documentação atualizada (Tarefa 6.3)
- [ ] Monitoramento configurado (Fase 7)

**7 Dias Após:**
- [ ] Performance validada (< 100ms busca vetorial)
- [ ] Custos OpenAI reduzidos (99% menos requests)
- [ ] Zero erros em execuções do workflow
- [ ] Deprecar tabela antiga (Tarefa 6.1)

---

## Estimativa de Tempo

| Fase | Tempo Estimado | Complexidade |
|------|----------------|--------------|
| FASE 1 | 15 min | Baixa |
| FASE 2 | 30 min | Média |
| FASE 3 | 10 min | Baixa |
| FASE 4 | 60 min | Alta |
| FASE 5 | 60 min | Média |
| FASE 6 | 20 min | Baixa |
| FASE 7 | Contínuo | Baixa |
| **TOTAL** | **~3h 15min** | - |

---

## Contatos e Recursos

**Workflow ID:** `IxyhrhwK7pI4Q4Cc`
**N8N URL:** `https://n8n-n8n-editor.neldoo.easypanel.host/`
**Supabase Project:** `qxhmkenttvmkhgotkxzt`

**Referências:**
- [OpenAI Embeddings Docs](https://platform.openai.com/docs/guides/embeddings)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Supabase Vector Docs](https://supabase.com/docs/guides/ai/vector-indexes)
- [N8N Postgres Node Docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/)

**Arquivo Original:** `n8n/fluxos/UPSERT - GPT.json`
**Instruções GPT:** `n8n/UPSERT - GPT.txt`
