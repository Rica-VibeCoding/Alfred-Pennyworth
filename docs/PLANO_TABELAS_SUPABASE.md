# Plano de Tabelas Supabase - Alfred Pennyworth

> **Documento Dinâmico**: Este documento evolui com as decisões do projeto.
> **Última atualização**: 2025-10-25 (atualizado após criação das tabelas de contatos)
> **Status**: Em implementação

---

## Sumário

1. [Contexto](#contexto)
2. [Decisões Arquiteturais](#decisões-arquiteturais)
3. [Segurança: Vault para Senhas](#segurança-vault-para-senhas)
4. [Estrutura de Tabelas (PT-BR)](#estrutura-de-tabelas-pt-br)
5. [Outputs Estruturados](#outputs-estruturados)
6. [Próximas Decisões](#próximas-decisões)
7. [Scripts SQL](#scripts-sql)

---

## Contexto

### Objetivo
Criar estrutura de dados no Supabase para facilitar acesso do N8N a informações pessoais e profissionais de Ricardo, permitindo respostas mais rápidas e contextualizadas.

### Integrações
- **N8N**: Acessa via nó Supabase (queries SQL diretas)
- **Alfred PWA**: Acesso futuro (V2+)
- **Google Drive**: Documentos importantes (referenciados nas tabelas)

### Requisitos Principais
1. ✅ **Senhas seguras**: Vault com encriptação
2. ✅ **Documentos**: Metadata + referências (arquivos no Drive)
3. ✅ **Contextos ricos**: Outputs formatados para respostas melhores
4. ✅ **Comandos rápidos**: Atalhos customizados
5. ❌ **Clientes**: Já existe em outro projeto (não criar)

---

## Decisões Arquiteturais

### Abordagem Escolhida: **Estruturada (Proposta 2 adaptada)**

**Por quê:**
- Organização clara e escalável
- Queries SQL simples e rápidas
- Estruturado onde faz sentido, flexível onde precisa
- Performance otimizada

### Tabelas Principais (PT-BR)

**Contatos (Sistema Familiar - 4 tabelas):**
1. **`rica_contatos`** ✅ CRIADA - Contatos de Ricardo
2. **`dani_contatos`** ✅ CRIADA - Contatos de Dani
3. **`bele_contatos`** ✅ CRIADA - Contatos de Bele
4. **`ti_contatos`** ✅ CRIADA - Contatos de Ti

**Outputs Estruturados:**
5. **`contextos`** ✅ CRIADA - Dados com templates de formatação

**Dados Pessoais (Planejadas):**
6. **`preferencias_usuario`** - Configurações pessoais
7. **`senhas`** - Credenciais encriptadas (Vault)
8. **`documentos`** - Metadata de arquivos importantes (já existe tabela vector)
9. **`comandos_rapidos`** - Atalhos customizados

**Removido:**
- ❌ `clientes` - Já existe em outro projeto

---

## Segurança: Vault para Senhas

### Decisão: Usar Supabase Vault

**Tecnologia:** Supabase Vault (extensão PostgreSQL + libsodium)

**Características:**
- ✅ Encriptação autenticada (AEAD)
- ✅ Chaves gerenciadas pelo Supabase (fora do banco)
- ✅ Dados encriptados em disco, backups e replicação
- ✅ Descriptografia sob demanda (não fica em disco)
- ✅ Assinatura digital impede falsificação

### Quando Implementar

**Opção A: Agora** (RECOMENDADO)
- Vault é core do sistema
- Senhas são prioridade alta
- Setup único, funciona para sempre

**Opção B: Depois**
- Fazer tabelas normais primeiro
- Vault na fase 2

### Como Funciona

```sql
-- Criar senha
SELECT vault.create_secret(
  'minha_senha_aqui',
  'gmail_ricardo',
  'Senha do Gmail principal'
);

-- Buscar senha descriptografada (apenas em funções SQL seguras)
SELECT decrypted_secret
FROM vault.decrypted_secrets
WHERE name = 'gmail_ricardo';
```

### Segurança RLS

```sql
-- Apenas usuário autenticado acessa suas senhas
ALTER TABLE vault.secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User acessa apenas suas senhas"
ON vault.secrets
FOR ALL
TO authenticated
USING (auth.uid() = user_id);
```

### Integração N8N

**No workflow N8N:**
1. Nó Supabase com query SQL
2. Query: `SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'nome_senha'`
3. Usar valor em próximo nó (HTTP Request, Email, etc)
4. **Nunca** retornar senha na resposta ao usuário

**Exemplo de uso:**
```
User: "preciso da senha do gmail"
N8N: Busca vault.decrypted_secrets WHERE name LIKE '%gmail%'
Resposta: "Encontrei 2 senhas de gmail: 'gmail_ricardo' e 'gmail_work'. Qual você precisa?"
User: "gmail_ricardo"
N8N: Retorna senha formatada ou executa ação diretamente
```

---

## Estrutura de Tabelas (PT-BR)

---

## 📞 CONTATOS FAMILIARES (IMPLEMENTADO)

### Decisão Arquitetural: 4 Tabelas Separadas

**Escolha:** Opção B - Tabelas separadas por pessoa da família

**Por quê escolhemos esta abordagem:**
- ✅ Isolamento total e visual por usuário
- ✅ Facilita gerenciamento inicial no N8N (workflows separados)
- ✅ Independência total entre membros da família
- ✅ Simples de entender e manter no início

**Trade-off aceito:**
- ⚠️ Mais tabelas = mais código SQL (mas replicável)
- ⚠️ Compartilhamento futuro requer tabela adicional
- ⚠️ Adicionar pessoa = criar tabela completa

---

### Estrutura das Tabelas de Contatos

**Tabelas criadas:**
- `rica_contatos` - Ricardo
- `dani_contatos` - Dani
- `bele_contatos` - Bele
- `ti_contatos` - Ti

**Todas com estrutura idêntica:**

```sql
CREATE TABLE [nome]_contatos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificação
  nome_completo TEXT NOT NULL,
  apelido TEXT,

  -- Telefones
  telefone_celular TEXT,
  telefone_trabalho TEXT,
  telefone_casa TEXT,

  -- Emails
  email_pessoal TEXT,
  email_trabalho TEXT,

  -- Endereço completo
  endereco_rua TEXT,
  endereco_numero TEXT,
  endereco_complemento TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT,
  endereco_estado TEXT,
  endereco_cep TEXT,
  endereco_pais TEXT DEFAULT 'Brasil',

  -- Profissional
  empresa TEXT,
  cargo TEXT,
  departamento TEXT,

  -- Pessoal
  data_nascimento DATE,

  -- Organização
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notas TEXT,
  favorito BOOLEAN DEFAULT false,
  importancia TEXT DEFAULT 'media' CHECK (importancia IN ('baixa', 'media', 'alta', 'urgente')),

  -- Interação
  ultima_interacao TIMESTAMPTZ,
  frequencia_contato TEXT, -- 'diaria', 'semanal', 'mensal', 'rara'

  -- Mídia e redes sociais
  foto_url TEXT,
  redes_sociais JSONB DEFAULT '{}'::JSONB,
  -- Exemplo: {"whatsapp": "+5511999999999", "instagram": "@user", "linkedin": "..."}

  -- Metadados flexíveis
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices criados (em todas as tabelas):**
- `idx_[nome]_contatos_nome` - Busca por nome
- `idx_[nome]_contatos_apelido` - Busca por apelido
- `idx_[nome]_contatos_telefone_celular` - Busca por telefone
- `idx_[nome]_contatos_email_pessoal` - Busca por email
- `idx_[nome]_contatos_tags` - Busca por tags (GIN index)
- `idx_[nome]_contatos_favorito` - Filtragem de favoritos
- `idx_[nome]_contatos_importancia` - Filtragem por importância

**Triggers criados:**
- Trigger `set_timestamp_[nome]_contatos` - Atualiza `updated_at` automaticamente

---

### Exemplos de Uso no N8N

**Buscar contato por nome:**
```sql
SELECT * FROM rica_contatos
WHERE nome_completo ILIKE '%João Silva%'
OR apelido ILIKE '%João%';
```

**Buscar favoritos:**
```sql
SELECT * FROM rica_contatos
WHERE favorito = true
ORDER BY ultima_interacao DESC;
```

**Buscar por telefone:**
```sql
SELECT * FROM rica_contatos
WHERE telefone_celular LIKE '%99999%';
```

**Buscar por tags:**
```sql
SELECT * FROM rica_contatos
WHERE 'familia' = ANY(tags);
```

**Adicionar contato:**
```sql
INSERT INTO rica_contatos (
  nome_completo,
  telefone_celular,
  email_pessoal,
  tags,
  importancia
) VALUES (
  'João Silva',
  '+55 11 99999-9999',
  'joao@email.com',
  ARRAY['trabalho', 'cliente'],
  'alta'
);
```

**Atualizar última interação:**
```sql
UPDATE rica_contatos
SET ultima_interacao = NOW()
WHERE nome_completo = 'João Silva';
```

---

### Integração com Workflows N8N

**Workflow separado por família:**

1. **Webhook específico para cada pessoa**
   - `webhook/ricardo-contatos`
   - `webhook/dani-contatos`
   - `webhook/bele-contatos`
   - `webhook/ti-contatos`

2. **Nó Supabase configurado com tabela correta**
   - Ricardo → `rica_contatos`
   - Dani → `dani_contatos`
   - etc.

3. **Exemplos de perguntas:**
   - "Qual o telefone do João?"
   - "Me mostra os favoritos"
   - "Contatos com aniversário este mês"
   - "Última vez que falei com Maria"

---

## 🎨 OUTPUTS ESTRUTURADOS (IMPLEMENTADO)

### Tabela: `contextos`

**Status:** ✅ CRIADA e testada
**Propósito:** Armazenar dados com templates de formatação para respostas bonitas e consistentes

---

### Estrutura da Tabela

```sql
CREATE TABLE contextos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Tipo de contexto
  tipo TEXT NOT NULL,
  -- Valores: 'email', 'evento', 'tarefa', 'faturamento', 'documento',
  --         'contato', 'resumo_diario', 'localizacao', 'projeto', 'meta', 'nota'

  -- Identificação
  titulo TEXT NOT NULL,
  descricao TEXT,

  -- Proprietário (sistema familiar)
  usuario TEXT, -- 'rica', 'dani', 'bele', 'ti'

  -- Dados estruturados
  dados JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Template de output (como mostrar)
  template_output JSONB DEFAULT '{}'::JSONB,

  -- Status e organização
  status TEXT DEFAULT 'ativo', -- 'ativo', 'arquivado', 'concluido'
  prioridade TEXT DEFAULT 'media', -- 'baixa', 'media', 'alta', 'urgente'
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Datas
  data_referencia DATE,
  prazo DATE,

  -- Metadados
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_contextos_tipo` - Filtro por tipo
- `idx_contextos_usuario` - Filtro por usuário
- `idx_contextos_status` - Filtro por status
- `idx_contextos_data_referencia` - Ordenação por data
- `idx_contextos_tags` - Busca por tags (GIN)

---

### Formatos de Output Implementados

#### 1. Email (único)
```
📧 Remetente: João Silva
📊 Assunto: Proposta Móveis
📅 Data: 25/10/2025
❌ Não lido
📝 Texto: Segue proposta...
```

#### 2. Email (lista)
```
📧 João Silva
📊 Proposta Móveis
📅 25/10/2025

📧 Maria Santos
📊 Reunião Urgente
📅 24/10/2025
```

#### 3. Contato
```
👤 João Silva
📞 +55 11 99999-9999
📧 joao@email.com
🏷️ profissional, cliente
```

#### 4. Evento/Agenda
```
📅 08:30 - Reunião Cliente X
📅 14:00 - Visita Fábrica Y
```

#### 5. Tarefas/Pendências
```
✅ Enviar proposta (concluído)
⏳ Ligar fornecedor (pendente)
🔴 Relatório urgente
```

#### 6. Faturamento
```
📊 Faturado Movelmar
📅 Data: 25/10/2025
✅ Bloqueado: R$ 250.000
💰 Liberado: R$ 325.000
⏳ Pendente: R$ 98.000
```

#### 7. Resumo Diário
```
📧 5 emails
📅 3 reuniões
✅ 2 tarefas concluídas
```

#### 8. Localização/Endereço
```
📍 Rua X, 123
🏙️ São Paulo - SP
```

#### 9. Documento
```
📄 CNH
✅ Válido até 2030
🔗 Link Drive
```

---

### Exemplos Práticos

**Exemplo 1: Email**
```sql
INSERT INTO contextos (tipo, titulo, usuario, dados, template_output) VALUES (
  'email',
  'Email de João Silva',
  'rica',
  '{
    "remetente": "João Silva",
    "assunto": "Proposta Móveis",
    "data": "2025-10-25",
    "lido": false,
    "texto": "Segue proposta conforme conversamos..."
  }'::jsonb,
  '{
    "formato": "card_email",
    "campos": ["remetente", "assunto", "data", "lido"]
  }'::jsonb
);
```

**Exemplo 2: Faturamento**
```sql
INSERT INTO contextos (tipo, titulo, usuario, dados, template_output, data_referencia) VALUES (
  'faturamento',
  'Faturado Movelmar Outubro',
  'rica',
  '{
    "data": "2025-10-25",
    "bloqueado": 250000,
    "liberado": 325000,
    "pendente": 98000
  }'::jsonb,
  '{
    "formato": "card_financeiro",
    "moeda": "BRL",
    "campos": ["bloqueado", "liberado", "pendente"]
  }'::jsonb,
  '2025-10-25'
);
```

**Exemplo 3: Evento**
```sql
INSERT INTO contextos (tipo, titulo, usuario, dados, template_output, data_referencia) VALUES (
  'evento',
  'Reunião Cliente X',
  'rica',
  '{
    "horario": "08:30",
    "local": "Escritório",
    "participantes": ["João", "Maria"]
  }'::jsonb,
  '{
    "formato": "timeline_evento",
    "icone": "📅"
  }'::jsonb,
  CURRENT_DATE
);
```

---

### Como N8N Usa

**1. Buscar dados:**
```sql
SELECT * FROM contextos
WHERE tipo = 'email'
AND usuario = 'rica'
AND status = 'ativo'
ORDER BY data_referencia DESC;
```

**2. N8N lê `template_output`:**
```json
{
  "formato": "card_email",
  "campos": ["remetente", "assunto", "data", "lido"]
}
```

**3. N8N formata resposta:**
```
📧 João Silva
📊 Proposta Móveis
📅 25/10/2025
❌ Não lido
```

---

### Integração com Alfred PWA

**V1 (atual):** N8N retorna texto formatado
**V2 (futuro):** N8N retorna JSON, Alfred renderiza cards bonitos

---

## 📋 DADOS PESSOAIS (PLANEJADO)

### 1. `preferencias_usuario`

**Propósito:** Configurações pessoais e preferências do Ricardo

```sql
CREATE TABLE preferencias_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Configurações de trabalho
  horario_trabalho_inicio TIME DEFAULT '08:00',
  horario_trabalho_fim TIME DEFAULT '18:00',
  dias_trabalho TEXT[] DEFAULT ARRAY['seg', 'ter', 'qua', 'qui', 'sex'],

  -- Localizações
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  idioma TEXT DEFAULT 'pt-BR',
  localizacao_principal TEXT, -- Ex: "Escritório - Rua X, São Paulo"

  -- Preferências de comunicação
  preferencias_notificacao JSONB DEFAULT '{}',
  formatos_data_hora JSONB DEFAULT '{"data": "DD/MM/YYYY", "hora": "HH:mm"}',

  -- Configurações do assistente
  tom_voz TEXT DEFAULT 'profissional', -- profissional, casual, direto
  nivel_detalhe TEXT DEFAULT 'medio', -- minimo, medio, detalhado

  -- Metadados
  configuracoes_customizadas JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Exemplo de uso:**
```json
{
  "horario_trabalho_inicio": "08:00",
  "horario_trabalho_fim": "18:00",
  "preferencias_notificacao": {
    "email_urgente": true,
    "whatsapp_cliente": true,
    "resumo_diario": "08:00"
  },
  "configuracoes_customizadas": {
    "cliente_prioritario_atual": "Empresa X",
    "meta_mes_atual": "R$ 50.000"
  }
}
```

---

### 2. `senhas` (Metadata + Vault)

**Propósito:** Gerenciar senhas e credenciais com segurança máxima

**Arquitetura híbrida:**
- **Metadata**: Tabela normal com informações não-sensíveis
- **Valores secretos**: Vault (`vault.secrets`)

```sql
CREATE TABLE senhas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Identificação
  nome TEXT NOT NULL UNIQUE, -- 'gmail_ricardo', 'whatsapp_business'
  descricao TEXT,
  categoria TEXT, -- 'email', 'social', 'banking', 'work'

  -- Relação com Vault
  vault_secret_id UUID, -- Referência ao vault.secrets.id

  -- Informações adicionais (NÃO-SENSÍVEIS)
  username TEXT, -- Email ou usuário (não é secreto)
  url TEXT, -- URL do serviço
  notas TEXT, -- Observações

  -- Uso e organização
  tags TEXT[], -- ['principal', 'pessoal', 'urgente']
  ultimo_uso TIMESTAMPTZ,
  frequencia_uso INT DEFAULT 0,

  -- Segurança
  requer_2fa BOOLEAN DEFAULT false,
  alerta_expiracao DATE, -- Aviso para trocar senha

  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fluxo de criação:**
```sql
-- 1. Criar secret no Vault
SELECT vault.create_secret(
  'minha_senha_super_secreta',
  'gmail_ricardo',
  'Senha do Gmail principal'
) AS vault_id;

-- 2. Criar metadata na tabela senhas
INSERT INTO senhas (user_id, nome, descricao, categoria, vault_secret_id, username, url)
VALUES (
  auth.uid(),
  'gmail_ricardo',
  'Gmail principal - uso pessoal e profissional',
  'email',
  '<UUID_RETORNADO_DO_VAULT>',
  'ricardo.nilton@gmail.com',
  'https://gmail.com'
);
```

**Consulta segura via N8N:**
```sql
-- Buscar senha por nome
SELECT
  s.nome,
  s.descricao,
  s.username,
  s.url,
  v.decrypted_secret AS senha
FROM senhas s
INNER JOIN vault.decrypted_secrets v ON s.vault_secret_id = v.id
WHERE s.nome = 'gmail_ricardo'
AND s.user_id = auth.uid();
```

---

### 3. `documentos`

**Propósito:** Metadata de documentos importantes (arquivos no Google Drive)

```sql
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Identificação
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT, -- 'cpf', 'rg', 'cnh', 'contrato', 'nota_fiscal', 'relatorio'

  -- Localização
  drive_file_id TEXT, -- ID do arquivo no Google Drive
  drive_url TEXT, -- URL direto
  caminho_local TEXT, -- Se tiver cópia local

  -- Conteúdo
  conteudo_extraido TEXT, -- OCR ou texto extraído (para busca)
  formato TEXT, -- 'pdf', 'docx', 'jpg', 'png'
  tamanho_kb INT,

  -- Classificação
  categoria TEXT, -- 'pessoal', 'profissional', 'financeiro', 'legal'
  tags TEXT[],
  confidencial BOOLEAN DEFAULT false,

  -- Validade
  data_emissao DATE,
  data_validade DATE,
  alerta_renovacao DATE,

  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Exemplo de registro:**
```json
{
  "titulo": "CNH - Ricardo Nilton Borges",
  "descricao": "Carteira Nacional de Habilitação - Categoria B",
  "tipo": "cnh",
  "drive_file_id": "1a2b3c4d5e6f7g8h9i",
  "drive_url": "https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i",
  "categoria": "pessoal",
  "data_emissao": "2020-03-15",
  "data_validade": "2030-03-15",
  "tags": ["documento", "identidade"],
  "confidencial": true,
  "metadata": {
    "numero_registro": "***********",
    "orgao_expedidor": "DETRAN-SP"
  }
}
```

**Uso no N8N:**
- User: "preciso da minha CNH"
- N8N: Query `SELECT * FROM documentos WHERE tipo = 'cnh'`
- Resposta: Retorna drive_url + metadata importante
- N8N pode baixar o arquivo do Drive e enviar por email/WhatsApp

---

### 4. `contextos`

**Propósito:** Informações contextuais para respostas formatadas e ricas

**🔍 ÁREA DE PESQUISA ATIVA** - Estrutura pode evoluir após exploração

```sql
CREATE TABLE contextos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Identificação
  tipo TEXT NOT NULL, -- 'projeto', 'tarefa', 'nota', 'rotina', 'meta'
  titulo TEXT NOT NULL,
  descricao TEXT,

  -- Status
  status TEXT DEFAULT 'ativo', -- 'ativo', 'pausado', 'concluido', 'arquivado'
  prioridade TEXT DEFAULT 'media', -- 'baixa', 'media', 'alta', 'urgente'

  -- Datas
  data_inicio DATE,
  data_fim DATE,
  prazo DATE,

  -- Conteúdo estruturado
  dados JSONB NOT NULL DEFAULT '{}',

  -- Output formatado (CRÍTICO para respostas bonitas)
  template_output JSONB DEFAULT '{}', -- Define como mostrar ao usuário

  -- Organização
  categoria TEXT,
  tags TEXT[],
  relacionados UUID[], -- IDs de outros contextos relacionados

  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Exemplo - Projeto:**
```json
{
  "tipo": "projeto",
  "titulo": "Reforma do escritório",
  "status": "ativo",
  "prioridade": "alta",
  "prazo": "2025-11-30",
  "dados": {
    "orcamento_total": 25000,
    "gasto_atual": 8500,
    "fornecedores": [
      {"nome": "Marcenaria Silva", "servico": "Móveis", "valor": 12000},
      {"nome": "Elétrica Pro", "servico": "Instalação", "valor": 5000}
    ],
    "etapas": [
      {"nome": "Demolição", "status": "concluido", "data": "2025-10-10"},
      {"nome": "Elétrica", "status": "em_andamento", "progresso": 60},
      {"nome": "Móveis", "status": "pendente"}
    ]
  },
  "template_output": {
    "tipo_visualizacao": "card_projeto",
    "campos_principais": ["orcamento_total", "gasto_atual", "prazo"],
    "mostrar_progresso": true,
    "formato_dinheiro": "BRL"
  }
}
```

**Uso no N8N com Output Estruturado:**
```
User: "como está o projeto da reforma?"

N8N Query: SELECT * FROM contextos WHERE titulo ILIKE '%reforma%' AND tipo = 'projeto'

N8N Response (usando template_output):
📊 Projeto: Reforma do escritório
Status: 🟢 Ativo | Prioridade: 🔴 Alta
Prazo: 30/11/2025 (36 dias)

💰 Orçamento:
- Total: R$ 25.000,00
- Gasto: R$ 8.500,00 (34%)
- Saldo: R$ 16.500,00

📋 Etapas:
✅ Demolição - Concluído (10/10)
🔄 Elétrica - 60% (em andamento)
⏳ Móveis - Pendente

👷 Fornecedores:
- Marcenaria Silva: R$ 12.000
- Elétrica Pro: R$ 5.000
```

---

### 5. `comandos_rapidos`

**Propósito:** Atalhos customizados para comandos frequentes

**🔍 ÁREA DE PESQUISA ATIVA** - Estrutura pode evoluir após exploração

```sql
CREATE TABLE comandos_rapidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Comando
  comando TEXT NOT NULL UNIQUE, -- 'agenda hoje', 'emails urgentes', 'clientes sp'
  aliases TEXT[], -- Variações: ['agenda', 'minha agenda', 'compromissos']
  descricao TEXT,

  -- Ação
  tipo_acao TEXT NOT NULL, -- 'query', 'webhook', 'workflow_n8n', 'funcao_sql'
  acao_payload JSONB NOT NULL, -- Dados da ação a executar

  -- Exemplo de acao_payload para tipo 'query':
  -- {
  --   "query": "SELECT * FROM eventos WHERE data = CURRENT_DATE",
  --   "formato_resposta": "lista_eventos"
  -- }

  -- Exemplo de acao_payload para tipo 'workflow_n8n':
  -- {
  --   "workflow_id": "abc-123-def",
  --   "parametros": {"periodo": "hoje"}
  -- }

  -- Configurações
  requer_confirmacao BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,

  -- Uso
  contagem_uso INT DEFAULT 0,
  ultimo_uso TIMESTAMPTZ,

  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Exemplo - Comando "agenda hoje":**
```json
{
  "comando": "agenda hoje",
  "aliases": ["agenda", "compromissos hoje", "o que tenho hoje"],
  "descricao": "Mostra agenda do dia atual com todos compromissos",
  "tipo_acao": "workflow_n8n",
  "acao_payload": {
    "workflow_id": "calendario-diario-xyz",
    "parametros": {
      "periodo": "hoje",
      "incluir_tarefas": true
    },
    "formato_resposta": "timeline"
  },
  "requer_confirmacao": false,
  "ativo": true
}
```

**Fluxo no N8N:**
```
User: "agenda"

N8N:
1. Query: SELECT * FROM comandos_rapidos
   WHERE comando = 'agenda' OR 'agenda' = ANY(aliases)
2. Encontra comando "agenda hoje"
3. Lê acao_payload.tipo_acao = 'workflow_n8n'
4. Executa workflow específico com parâmetros
5. Retorna resposta formatada

Response:
📅 Agenda de Hoje - 25/10/2025

08:30 - Reunião com Cliente X
10:00 - Visita Fábrica Móveis Y
14:00 - Apresentação produtos
16:30 - Follow-up proposta Z

✅ 2 tarefas pendentes
```

---

## Outputs Estruturados

### Conceito: Structured Outputs (OpenAI/Claude)

**Problema:** Respostas de AI são texto livre, difícil de formatar consistentemente.

**Solução:** Usar JSON Schema para forçar outputs estruturados.

### Implementação no N8N

**No workflow N8N:**
1. Configurar nó AI (OpenAI/Anthropic) com "Output Format: JSON"
2. Definir schema baseado no `template_output` da tabela
3. AI retorna JSON válido garantido
4. N8N formata resposta bonita usando template

**Exemplo de Schema:**
```json
{
  "type": "object",
  "properties": {
    "tipo_resposta": {"type": "string", "enum": ["projeto", "evento", "lista"]},
    "titulo": {"type": "string"},
    "resumo": {"type": "string"},
    "dados_principais": {"type": "object"},
    "itens": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "nome": {"type": "string"},
          "status": {"type": "string"},
          "valor": {"type": "string"}
        }
      }
    }
  },
  "required": ["tipo_resposta", "titulo"]
}
```

### Campos `template_output` nas Tabelas

**Propósito:** Cada contexto/comando define como quer ser exibido

**Formatos suportados:**
- `card_projeto`: Card com orçamento e etapas
- `timeline`: Linha do tempo cronológica
- `lista_simples`: Bullet points
- `tabela`: Formato tabular
- `card_info`: Card informativo com ícones

**Benefícios:**
- ✅ Respostas consistentes
- ✅ Formatação bonita automática
- ✅ Fácil de adicionar novos formatos
- ✅ AI sempre retorna dados corretos

---

## Próximas Decisões

### 1. Implementação de Senhas com Vault

**Questões pendentes:**
- [ ] Implementar Vault agora ou depois?
- [ ] Quais senhas migrar primeiro? (Gmail, WhatsApp, etc)
- [ ] Como gerenciar permissões de acesso no N8N?

**Próximo passo:** Decidir timing

---

### 2. Exploração de `contextos` e `comandos_rapidos`

**Questões pendentes:**
- [ ] Que tipos de contextos são mais úteis?
- [ ] Quais comandos rápidos criar primeiro?
- [ ] Como estruturar `dados` JSONB para máxima flexibilidade?
- [ ] Que formatos de output criar primeiro?

**Próximo passo:** Benchmarking de assistentes (ChatGPT, Claude, Notion AI)

---

### 3. Documentos: Storage vs Metadata

**Questões pendentes:**
- [ ] Usar Supabase Storage ou apenas referências ao Google Drive?
- [ ] Fazer OCR de documentos? (extrair texto para busca)
- [ ] Quais documentos são prioritários?

**Próximo passo:** Definir workflow de documentos

---

## Scripts SQL

### Setup Inicial

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Vault já vem habilitado no Supabase
```

### RLS Global (todas as tabelas)

```sql
-- Template RLS para todas as tabelas
-- Copiar e adaptar para cada tabela criada

ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users only access their own data"
ON nome_tabela
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Triggers de Updated_At

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em cada tabela
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON nome_tabela
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
```

---

## Changelog

### 2025-10-25 - Atualização: Tabela Contextos Criada
- ✅ **CRIADA** tabela `contextos` para outputs estruturados
- ✅ 9 formatos de output documentados (email, evento, tarefa, faturamento, etc)
- ✅ 3 exemplos inseridos e testados
- ✅ 5 índices para performance
- ✅ Documentação completa com exemplos SQL
- 📝 Sistema pronto para integração com N8N

### 2025-10-25 - Atualização: Tabelas de Contatos Criadas
- ✅ **CRIADAS** 4 tabelas de contatos familiares:
  - `rica_contatos` (Ricardo)
  - `dani_contatos` (Dani)
  - `bele_contatos` (Bele)
  - `ti_contatos` (Ti)
- ✅ Estrutura completa com 31 campos cada
- ✅ 7 índices por tabela para performance
- ✅ Triggers de `updated_at` configurados
- ✅ RLS **NÃO** aplicado (sistema familiar sem autenticação individual)
- 📝 Documentação completa com exemplos SQL

### 2025-10-25 - Criação do documento
- ✅ Definida arquitetura estruturada em PT-BR
- ✅ Pesquisada solução de segurança para senhas (Vault)
- ✅ Estruturadas 5 tabelas principais de dados pessoais
- ✅ Identificadas áreas de pesquisa (`contextos`, `comandos_rapidos`)
- ⏳ Pendente: Criação das tabelas de dados pessoais
- ⏳ Pendente: Decisão sobre timing do Vault
- ⏳ Pendente: Migração de dados para as tabelas

---

## Referências

- [Supabase Vault Docs](https://supabase.com/docs/guides/database/vault)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OpenAI Structured Outputs](https://openai.com/index/introducing-structured-outputs-in-the-api/)
- Comunidade N8N: Workflows com Supabase + AI

---

**Próximo passo:** Validar estrutura com Ricardo e iniciar implementação fase por fase.
