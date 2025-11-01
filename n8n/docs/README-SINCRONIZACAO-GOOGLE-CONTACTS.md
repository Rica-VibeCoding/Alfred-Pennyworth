# Sincronização Google Contacts → Supabase

Workflow N8N que sincroniza automaticamente seus contatos do Google Contacts para tabela `rica_contatos` no Supabase.

## 📋 Características

- ✅ Sincronização automática diária às 3h AM
- ✅ Suporta 1700+ contatos (paginação automática)
- ✅ UPSERT inteligente (atualiza se existe, insere se novo)
- ✅ Zero duplicatas
- ✅ Atualiza apenas campos alterados

## 🏗️ Arquitetura

```
Schedule (3h AM)
  → HTTP Request Google (1000/página)
    → IF tem nextPageToken?
      → SIM: Loop próxima página
      → NÃO: Continua
    → Split Out (separa contatos)
      → Code (formata dados)
        → PostgreSQL UPSERT
```

## 📦 Pré-requisitos

### 1. Migration Supabase (JÁ APLICADA ✅)

A constraint UNIQUE no campo `apelido` já foi criada via migration:
- Nome: `add_unique_constraint_apelido_rica_contatos`
- Constraint: `rica_contatos_apelido_unique`

### 2. Credenciais N8N Necessárias

#### Google Contacts OAuth2
- Nome sugerido: `Google Contacts account`
- Tipo: `googleContactsOAuth2Api`
- Configuração:
  - Fazer OAuth2 com conta Google
  - Permissões: `contacts.readonly`

#### PostgreSQL (Supabase)
- Nome sugerido: `Supabase PostgreSQL`
- Tipo: `postgres`
- Configuração:
  - **Host:** Pegar em Supabase > Project Settings > Database > Host
  - **Database:** `postgres`
  - **User:** `postgres`
  - **Password:** Senha do banco (Project Settings > Database)
  - **Port:** `5432`
  - **SSL:** `require`

**Como pegar credenciais PostgreSQL no Supabase:**
1. Acesse seu projeto Supabase
2. Settings > Database
3. Connection String > Transaction pooler
4. Use os dados fornecidos

## 🚀 Importação

### Passo 1: Importar Workflow

1. Acesse N8N
2. Menu > Workflows > Import from File
3. Selecione: `n8n/fluxos/sincronizacao-google-contacts-supabase.json`
4. Clique em "Import"

### Passo 2: Configurar Credenciais

#### Nó: "Buscar Contatos Google"
1. Clique no nó
2. Credentials > Select Credential
3. Escolha sua credencial `Google Contacts OAuth2`
4. Se não tiver, crie uma nova:
   - New Credential > Google Contacts OAuth2 API
   - Fazer OAuth flow
   - Save

#### Nó: "UPSERT Supabase"
1. Clique no nó
2. Credentials > Select Credential
3. Escolha sua credencial `PostgreSQL`
4. Se não tiver, crie uma nova:
   - New Credential > Postgres
   - Host: `db.qxhmkenttvmkhgotkxzt.supabase.co`
   - Database: `postgres`
   - User: `postgres`
   - Password: [sua senha do Supabase]
   - Port: `5432`
   - SSL: `require`
   - Save

### Passo 3: Salvar e Ativar

1. Clique em "Save" (canto superior direito)
2. Toggle "Active" para ON
3. Workflow ativo! 🎉

## 🧪 Teste Manual

### Testar Agora (sem esperar 3h)

1. Clique no nó "Executar diariamente às 3h"
2. Botão "Execute Node" (canto superior)
3. Acompanhe a execução

### Verificar Resultados

#### No N8N:
- Cada nó mostra quantos items processou
- "UPSERT Supabase" mostra quantos registros afetou

#### No Supabase:
```sql
-- Ver total de contatos
SELECT COUNT(*) FROM rica_contatos;

-- Ver últimos sincronizados
SELECT nome_completo, telefone_celular, updated_at
FROM rica_contatos
ORDER BY updated_at DESC
LIMIT 10;
```

## 📊 Campos Sincronizados

| Google Contacts | Supabase `rica_contatos` |
|----------------|-------------------------|
| `resourceName` | `apelido` (chave única) |
| `displayName` | `nome_completo` |
| `canonicalForm` | `telefone_celular` |
| `email` | `email_pessoal` |
| - | `updated_at` (timestamp) |

## 🔧 Troubleshooting

### Erro: "duplicate key value violates unique constraint"

**Causa:** Tentando inserir contato com `apelido` duplicado

**Solução:**
- Não deveria acontecer (UPSERT previne isso)
- Se acontecer, verifique se migration foi aplicada:
```sql
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'rica_contatos'
AND constraint_type = 'UNIQUE';
```

### Erro: "connection timeout" no PostgreSQL

**Causa:** Credenciais incorretas ou IP bloqueado

**Solução:**
1. Verifique credenciais do PostgreSQL
2. Supabase > Settings > Database > Connection Pooling
3. Use "Transaction pooler" ao invés de "Direct connection"

### Erro: "invalid grant" no Google OAuth

**Causa:** Token expirado

**Solução:**
1. N8N > Credentials > Google Contacts
2. Click em "Reconnect"
3. Refazer OAuth flow

### Workflow não executa às 3h

**Causa:** Workflow não está ativo

**Solução:**
1. Abra o workflow
2. Toggle "Active" para ON
3. Verifique ícone verde ao lado do nome

### Paginação não funciona (só pega 1000 contatos)

**Causa:** Loop não está funcionando corretamente

**Verificar:**
1. Nó "Tem próxima página?" tem conexão para "Preparar Próxima Página"
2. "Preparar Próxima Página" conecta de volta para "Buscar Contatos Google"
3. Execute manualmente e veja se loop acontece

**Solução alternativa:**
Se loop não funcionar, execute workflow múltiplas vezes manualmente até processar todos.

## 📈 Performance

- **1000 contatos:** ~30 segundos
- **1700 contatos:** ~50 segundos (2 páginas)
- **5000 contatos:** ~2.5 minutos (5 páginas)

## 🔄 Frequência de Sincronização

**Atual:** Diária às 3h AM

**Mudar frequência:**
1. Clique no nó "Executar diariamente às 3h"
2. Parâmetro "Rule"
3. Ajuste hora/intervalo
4. Save

**Exemplos:**
- A cada 6 horas: `Interval Hours = 6`
- Toda segunda-feira: `Weekday = Monday`
- 2x por dia: Duplicate workflow com horários diferentes

## 🗑️ Limpeza de Contatos Antigos

O workflow **NÃO deleta** contatos que foram removidos do Google.

**Para deletar contatos que não existem mais no Google:**

```sql
-- Ver contatos não atualizados nos últimos 7 dias
SELECT nome_completo, updated_at
FROM rica_contatos
WHERE updated_at < NOW() - INTERVAL '7 days'
ORDER BY updated_at ASC;

-- Deletar (CUIDADO!)
DELETE FROM rica_contatos
WHERE updated_at < NOW() - INTERVAL '30 days';
```

**Ou crie workflow separado para limpeza.**

## 📝 Logs

**Ver execuções:**
1. N8N > Executions (menu lateral)
2. Filtre por workflow name
3. Clique em execução para ver detalhes

**Logs úteis:**
- Quantos contatos foram processados
- Tempo de execução
- Erros (se houver)

## 🎯 Próximos Passos

1. ✅ Importar workflow
2. ✅ Configurar credenciais
3. ✅ Testar manualmente
4. ✅ Ativar workflow
5. 🔜 Aguardar execução automática (3h AM)
6. 🔜 Verificar logs no dia seguinte

---

**Dúvidas?** Verifique logs de execução no N8N ou SQL no Supabase.

**Modificações?** Adapte o Code node "Formatar Dados" para adicionar/remover campos.
