# UPSERT V4 - Changelog e Correções

**Data:** 2025-10-26
**Versão:** V4 Optimized
**Arquivo:** `UPSERT-V4-OPTIMIZED.json`

---

## Problemas Corrigidos

### 1. **INSERT com timestamp do Google (CRÍTICO)**

**Antes (V3):**
```sql
VALUES (
  '{{ $json.resource_name }}',
  '{{ $json.nome_completo }}',
  '{{ $json.telefone_celular }}',
  '{{ $json.email_pessoal }}',
  NOW(),  -- ❌ ERRADO: Perde timestamp do Google
  NOW()
)
```

**Depois (V4):**
```sql
VALUES (
  '{{ $json.resource_name }}',
  '{{ $json.nome_completo }}',
  '{{ $json.telefone_celular }}',
  '{{ $json.email_pessoal }}',
  COALESCE('{{ $json.last_synced_at }}'::timestamptz, NOW()),  -- ✅ Preserva timestamp do Google
  NOW()
)
```

---

### 2. **UPDATE com timestamp do Google (CRÍTICO)**

**Antes (V3):**
```sql
last_synced_at = CASE
  WHEN '{{ $json.last_synced_at }}'::timestamptz > rica_contatos.last_synced_at
  THEN NOW()  -- ❌ ERRADO: Perde timestamp do Google
  ELSE rica_contatos.last_synced_at
END
```

**Depois (V4):**
```sql
last_synced_at = CASE
  WHEN COALESCE('{{ $json.last_synced_at }}'::timestamptz, NOW()) > COALESCE(rica_contatos.last_synced_at, '1970-01-01'::timestamptz)
  THEN COALESCE('{{ $json.last_synced_at }}'::timestamptz, NOW())  -- ✅ Preserva timestamp do Google
  ELSE rica_contatos.last_synced_at
END
```

---

### 3. **Lógica de seleção de embeddings (OTIMIZAÇÃO)**

**Antes (V3):**
```sql
WHERE e.id IS NULL OR u.last_synced_at > (NOW() - INTERVAL '1 minute');
```
- Assumia que contatos atualizados nos últimos 60 segundos precisavam de embedding
- Não comparava com `updated_at` da tabela embeddings

**Depois (V4):**
```sql
WHERE e.id IS NULL
   OR u.last_synced_at > COALESCE(e.updated_at, '1970-01-01'::timestamptz);
```
- Compara timestamp do contato com timestamp do embedding
- Regenera embedding SOMENTE se contato foi modificado depois do último embedding
- Mais eficiente e preciso

---

## Melhorias Adicionais

### 4. **Proteção contra NULL timestamps**

**V4 usa `COALESCE` em todos os lugares:**
- `COALESCE('{{ $json.last_synced_at }}'::timestamptz, NOW())` - fallback para NOW() se Google não retornar timestamp
- `COALESCE(rica_contatos.last_synced_at, '1970-01-01'::timestamptz)` - fallback para epoch se registro antigo não tem timestamp
- `COALESCE(e.updated_at, '1970-01-01'::timestamptz)` - fallback para epoch se embedding não tem timestamp

**Benefício:** Workflow nunca quebra por NULL, sempre tem fallback seguro

---

### 5. **Logs melhorados com prefixo [V4]**

**JavaScript Code Nodes:**
- Todos logs agora têm prefixo `[V4]` para facilitar debug
- Warnings específicos quando `updateTime` não vem do Google

**Exemplo:**
```javascript
console.log(`[V4] Formatando ${items.length} contatos`);
console.warn('[V4] Contato sem updateTime no metadata:', item.json.resourceName);
```

---

### 6. **Comentários SQL explicativos**

Todas as queries SQL agora têm comentários `-- V4:` explicando o objetivo:
- `-- V4: UPSERT com timestamp do Google preservado`
- `-- V4: UPSERT embeddings com triggers automáticos de updated_at`

---

## Impacto Esperado

### Antes (V3):
- ❌ Todos contatos com `last_synced_at` = hora da sincronização N8N
- ❌ Impossível rastrear quando contato foi modificado no Google
- ❌ Embeddings regenerados desnecessariamente (todos contatos nos últimos 60s)
- ❌ Perda de informação temporal

### Depois (V4):
- ✅ `last_synced_at` reflete timestamp real do Google Contacts
- ✅ Rastreabilidade completa de modificações
- ✅ Embeddings regenerados SOMENTE quando contato mudou
- ✅ Economia de chamadas à API OpenAI (custo $$)
- ✅ Performance melhorada (menos processamento)

---

## Migração de V3 para V4

### Opção 1: Substituir workflow completo
1. Desativar workflow UPSERT V3
2. Importar `UPSERT-V4-OPTIMIZED.json` no N8N
3. Configurar credenciais (Google Contacts, Postgres, OpenAI)
4. Ativar workflow V4

### Opção 2: Atualizar workflow existente
1. Abrir workflow UPSERT V3 no N8N
2. Editar nó "Formatar Dados" - substituir JavaScript (linha 82)
3. Editar nó "UPSERT Contatos" - substituir SQL (linha 96)
4. Salvar e testar com execução manual

---

## Validação Recomendada

### Antes de ativar em produção:

1. **Teste com 1 contato:**
```bash
# Via N8N: executar workflow manualmente
# Verificar logs para confirmar timestamp preservado
```

2. **Verificar timestamp no banco:**
```sql
SELECT
  apelido,
  nome_completo,
  last_synced_at,
  updated_at,
  EXTRACT(EPOCH FROM (updated_at - last_synced_at)) AS diff_seconds
FROM rica_contatos
ORDER BY updated_at DESC
LIMIT 10;
```
- `diff_seconds` deve ser ≈ 0 para novos contatos (ambos com NOW())
- `last_synced_at` deve ser diferente de `updated_at` para contatos existentes

3. **Verificar embeddings gerados corretamente:**
```sql
SELECT
  c.nome_completo,
  c.last_synced_at AS contato_synced,
  e.updated_at AS embedding_updated,
  e.id IS NOT NULL AS tem_embedding
FROM rica_contatos c
LEFT JOIN rica_contatos_embeddings e ON c.id = e.contato_id
WHERE c.updated_at > NOW() - INTERVAL '1 hour'
ORDER BY c.updated_at DESC;
```

4. **Verificar logs N8N:**
- Buscar por `[V4]` nos logs
- Confirmar ausência de erros
- Verificar quantidade de embeddings gerados (deve ser menor que V3)

---

## Rollback (se necessário)

Se V4 apresentar problemas:

1. **Desativar workflow V4**
2. **Reativar workflow V3** (backup em `UPSERT-V3-FIXED.json`)
3. **Reportar problema com logs completos**

---

## Próximos Passos (V5?)

Possíveis melhorias futuras:
- Batch processing de embeddings (reduzir chamadas OpenAI)
- Delta sync (pegar apenas contatos modificados via syncToken do Google)
- Retry automático em falhas de API OpenAI
- Métricas de execução (contatos novos vs atualizados)
- Notificação em caso de erro crítico

---

## Responsável

**Desenvolvido por:** Claude Code (Anthropic)
**Solicitado por:** Ricardo Nilton Borges
**Projeto:** Alfred Pennyworth - Assistente Pessoal N8N
