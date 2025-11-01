# Supabase - Documentação Centralizada

> **Índice central** de toda documentação relacionada ao Supabase no projeto Alfred Pennyworth
> **Última atualização**: 2025-10-25

---

## 📋 Documento Principal

**[PLANO_TABELAS_SUPABASE.md](./PLANO_TABELAS_SUPABASE.md)**
- Planejamento completo das tabelas
- Estruturas SQL detalhadas
- Exemplos de uso
- Decisões arquiteturais
- Changelog de implementações

---

## 🗄️ Tabelas Implementadas

### Contatos Familiares (4 tabelas)

**Status:** ✅ Implementado

- `rica_contatos` - Contatos de Ricardo
- `dani_contatos` - Contatos de Dani
- `bele_contatos` - Contatos de Bele
- `ti_contatos` - Contatos de Ti

**Campos:** 31 campos (nome, telefones, emails, endereço completo, dados profissionais, tags, etc)
**Índices:** 7 por tabela
**Documentação:** [PLANO_TABELAS_SUPABASE.md#contatos-familiares](./PLANO_TABELAS_SUPABASE.md#📞-contatos-familiares-implementado)

---

### Outputs Estruturados

**Status:** ✅ Implementado

**Tabela:** `contextos`

**Propósito:** Armazenar dados com templates de formatação para respostas consistentes

**Formatos disponíveis:**
1. Email (único e lista)
2. Evento/Agenda
3. Tarefas/Pendências
4. Faturamento
5. Contato
6. Resumo Diário
7. Localização/Endereço
8. Documento

**Documentação:** [PLANO_TABELAS_SUPABASE.md#outputs-estruturados](./PLANO_TABELAS_SUPABASE.md#🎨-outputs-estruturados-implementado)

---

## 📝 Tabelas Planejadas

### Dados Pessoais

**Status:** 📋 Planejado

1. **`preferencias_usuario`** - Configurações pessoais (horários, preferências, timezone)
2. **`senhas`** - Credenciais com Supabase Vault (encriptação máxima)
3. **`documentos`** - Metadata de documentos (CPF, CNH, contratos - arquivos no Drive)
4. **`comandos_rapidos`** - Atalhos customizados para N8N

**Documentação:** [PLANO_TABELAS_SUPABASE.md#dados-pessoais](./PLANO_TABELAS_SUPABASE.md#📋-dados-pessoais-planejado)

---

## 🔐 Segurança

### Supabase Vault (para senhas)

**Status:** 📚 Pesquisado, pronto para implementar

**Características:**
- Encriptação AEAD (Authenticated Encryption)
- Chaves gerenciadas pelo Supabase (separadas do banco)
- Descriptografia sob demanda
- Integração com N8N

**Documentação:** [PLANO_TABELAS_SUPABASE.md#vault](./PLANO_TABELAS_SUPABASE.md#segurança-vault-para-senhas)

---

### Row Level Security (RLS)

**Status:** ⚠️ Não aplicado (sistema familiar)

**Decisão:** Não usar RLS nas tabelas atuais porque:
- Sistema familiar sem autenticação individual
- Workflows N8N separados por pessoa
- Isolamento por tabelas separadas

**Futuro:** Implementar se migrar para modelo com autenticação

---

## 🔗 Integrações

### N8N

**Acesso:** Nó Supabase com queries SQL diretas

**Exemplos de uso:**
- Buscar contato por nome
- Listar emails não lidos
- Verificar faturamento do mês
- Consultar agenda do dia
- Recuperar senhas (via Vault)

**Documentação de queries:** [PLANO_TABELAS_SUPABASE.md](./PLANO_TABELAS_SUPABASE.md)

---

### Alfred PWA

**Status:** 🔮 Futuro (V2+)

**Planejado:**
- Sincronização de dados
- Visualização de contextos formatados
- Interface para contatos
- Dashboard de resumos

---

### Google Drive

**Integração:** Referências em `documentos`

**Como funciona:**
- Tabela guarda metadata (título, tipo, tags)
- Campo `drive_file_id` e `drive_url`
- N8N baixa arquivo quando necessário

---

## 📊 Resumo Atual

### Estatísticas

**Tabelas criadas:** 5
- 4 tabelas de contatos
- 1 tabela de contextos

**Tabelas planejadas:** 4
- preferencias_usuario
- senhas
- documentos
- comandos_rapidos

**Total de campos:** ~150+

**Índices:** 35+ (otimização de performance)

---

## 🎯 Próximos Passos

### Imediato
- [ ] Migrar contatos para as tabelas
- [ ] Configurar workflows N8N de teste
- [ ] Criar exemplos de queries comuns

### Curto Prazo
- [ ] Implementar tabela `senhas` com Vault
- [ ] Criar tabela `comandos_rapidos`
- [ ] Popular `contextos` com dados reais

### Médio Prazo
- [ ] Implementar `preferencias_usuario`
- [ ] Configurar `documentos` com Google Drive
- [ ] Criar funções SQL auxiliares

---

## 📚 Recursos Externos

### Supabase
- [Documentação Oficial](https://supabase.com/docs)
- [Supabase Vault](https://supabase.com/docs/guides/database/vault)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

### N8N
- [Nó Supabase](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/)
- [Workflows com Supabase](https://n8n.io/integrations/supabase/)

---

## 💡 Convenções do Projeto

### Nomenclatura
- **Tabelas:** snake_case em português (ex: `rica_contatos`, `preferencias_usuario`)
- **Campos:** snake_case descritivo (ex: `nome_completo`, `telefone_celular`)
- **Campos JSONB:** camelCase no JSON (ex: `{"nomeCompleto": "..."}`)

### Timestamps
- Sempre incluir `created_at` e `updated_at`
- Trigger automático para `updated_at`

### IDs
- Sempre usar UUID (`gen_random_uuid()`)
- Primary key em todas as tabelas

### JSONB
- Usar para dados flexíveis (metadata, configurações)
- Criar índices GIN quando necessário

---

## 🐛 Troubleshooting

### Erro ao conectar N8N
1. Verificar URL e API key no MCP
2. Testar query simples: `SELECT 1`
3. Verificar permissões da tabela

### Performance lenta
1. Verificar índices criados
2. Analisar query com `EXPLAIN`
3. Considerar adicionar índices específicos

### Dados não aparecem
1. Verificar se RLS está desabilitado (para sistema familiar)
2. Confirmar nome correto da tabela
3. Verificar se há filtros na query

---

## 📞 Contato

**Projeto:** Alfred Pennyworth
**Desenvolvedor:** Ricardo Nilton Borges
**Repositório:** [Link do repo]

---

**Última atualização:** 2025-10-25
**Versão do documento:** 1.0
