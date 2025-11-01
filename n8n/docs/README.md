# N8N Workflows - Alfred Pennyworth

Workflows e documentação para o assistente pessoal Alfred integrado com N8N.

---

## 📁 Estrutura de Arquivos

```
n8n/
├── arquivos/
│   ├── Fluxo n8n- Alfred.json                    [31 KB] Workflow original (backup)
│   ├── google-drive-operations-subworkflow.json  [7.2 KB] Sub-workflow Google Drive
│   └── alfred-workflow-modified.json             [24 KB] Workflow principal modificado
│
├── modify-workflow.py                             [6.5 KB] Script de modificação
├── INSTRUCOES-IMPORTACAO.md                       [5.8 KB] Guia passo a passo completo
├── RESUMO-MODIFICACOES.md                         [8.2 KB] Detalhes técnicos das mudanças
├── CHECKLIST-IMPORTACAO.md                        [3.5 KB] Checklist rápido
└── README.md                                      [Este arquivo]
```

---

## 🎯 O Que Foi Feito

### Problema Original
- AI Agent tentava usar Google Drive tools diretamente
- Passava nome de arquivo em vez de File ID
- Resultado: Erro "file not found"

### Solução Implementada
- **Sub-workflow separado** para operações do Google Drive
- **Detecção automática** de pedidos relacionados ao Drive
- **Roteamento inteligente** via JSON action
- **Busca case-insensitive** com validação robusta

---

## 🚀 Quick Start

**Para importar os workflows modificados:**

1. Leia: `CHECKLIST-IMPORTACAO.md` (10 minutos)
2. Importe `google-drive-operations-subworkflow.json` primeiro
3. Copie o ID do sub-workflow
4. Edite `alfred-workflow-modified.json` com o ID
5. Importe `alfred-workflow-modified.json`
6. Ative APENAS o workflow principal (sub-workflow fica Inactive)

**Documentação completa:** `INSTRUCOES-IMPORTACAO.md`

---

## 📊 Comparação de Workflows

| Métrica | Original | Modificado |
|---------|----------|------------|
| Total de nós | 24 | 20 (principal) + 7 (sub) |
| Google Drive tools | 3 (diretos) | 0 (delegados) |
| Arquitetura | Monolítica | Modular |
| Tratamento de erros | Básico | Robusto |
| Manutenibilidade | Baixa | Alta |

---

## 🔧 Modificações Principais

### Nós Removidos
- ❌ Pesquisar arquivos e pastas
- ❌ Baixar arquivo do Drive
- ❌ Compartilhar arquivo
- ❌ Sub-workflow interno (movido)

### Nós Adicionados
- ✅ **Detect Action** - Detecta JSON actions do AI
- ✅ **Needs Sub-Workflow?** - IF que roteia execução
- ✅ **Call Google Drive Sub-Workflow** - Executa sub-workflow
- ✅ **Merge Results** - Combina resultados

### Nós Modificados
- ✏️ **Personal Assistant** - System prompt atualizado
- ✏️ **Edit Fields (Response)** - Transformado em Code node

---

## 📖 Documentação

### Para Uso Rápido
1. **CHECKLIST-IMPORTACAO.md** - Passo a passo simplificado (10 min)

### Para Entendimento Técnico
2. **RESUMO-MODIFICACOES.md** - Detalhes completos das mudanças
3. **INSTRUCOES-IMPORTACAO.md** - Guia detalhado com troubleshooting

### Para Desenvolvimento
4. **modify-workflow.py** - Script Python que gera os workflows

---

## 🧪 Fluxo de Teste

### Teste Google Drive (novo fluxo)
```bash
Input:  "Baixe o arquivo Checklist Casa do Mato"
Output: "Arquivo \"Checklist Casa do Mato.csv\" baixado com sucesso, senhor. File ID: 1nvsZ..."
```

### Teste Normal (Email/Calendar)
```bash
Input:  "Quais meus próximos eventos?"
Output: "Você tem 3 eventos agendados, senhor..."
```

---

## 🏗️ Arquitetura do Fluxo

```
Webhook
  ↓
Edit Fields (Input)
  ↓
Personal Assistant (AI Agent)
  ├─ Email Tools
  ├─ Calendar Tools
  └─ Detecta Google Drive → retorna JSON
         ↓
   Detect Action (Code)
         ↓
   Needs Sub-Workflow? (IF)
         ├─ TRUE → Execute Google Drive Sub-Workflow
         │            ↓
         │         Merge Results
         │
         └─ FALSE → Merge Results
                       ↓
                Edit Fields (Response)
                       ↓
                Respond to Webhook
```

---

## 🔐 Credenciais Necessárias

- ✅ Google Drive OAuth2 (já configurada)
- ✅ Gmail OAuth2 (já configurada)
- ✅ Google Calendar OAuth2 (já configurada)
- ✅ OpenAI API (já configurada)

---

## ⚠️ Importante

### Antes de Importar
1. ⚠️ Importe o sub-workflow PRIMEIRO
2. ⚠️ Copie o ID do sub-workflow
3. ⚠️ Edite o workflow principal com o ID
4. ⚠️ Depois importe o workflow principal

### Backup
O workflow original está preservado em:
- `arquivos/Fluxo n8n- Alfred.json`

---

## 📞 Troubleshooting

| Erro | Solução |
|------|---------|
| ⚠️ "No trigger node" ao ativar sub-workflow | ✅ **Normal!** Sub-workflow fica Inactive |
| "Workflow not found" | Verificar ID do sub-workflow no Execute Workflow node |
| "File not found" | Verificar se sub-workflow foi importado |
| AI não retorna JSON | System prompt não foi atualizado |
| Merge não funciona | Verificar conexões do IF |

**Detalhes:** Ver seção Troubleshooting em `INSTRUCOES-IMPORTACAO.md`

---

## 🎯 Próximos Passos (Opcional)

Após validar que tudo funciona:

1. Renomear workflows para nomes mais descritivos
2. Adicionar mais operações ao sub-workflow (compartilhar, deletar)
3. Criar outros sub-workflows (Supabase, etc.)
4. Implementar cache de buscas frequentes

---

## 📈 Benefícios da Nova Arquitetura

- ✅ **Modularidade** - Sub-workflows reutilizáveis
- ✅ **Manutenibilidade** - Código organizado e separado
- ✅ **Debugging** - Testar componentes isoladamente
- ✅ **Escalabilidade** - Fácil adicionar novos sub-workflows
- ✅ **Precisão** - Busca inteligente case-insensitive
- ✅ **Robustez** - Tratamento completo de erros

---

## 📚 Links Úteis

- [N8N Documentation](https://docs.n8n.io/)
- [Execute Workflow Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/)
- [Code Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/)
- [Merge Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.merge/)

---

## 📝 Changelog

### v1.0 - 2025-10-24
- ✅ Sub-workflow Google Drive separado
- ✅ Detecção automática de JSON actions
- ✅ Roteamento inteligente com IF/Merge
- ✅ Edit Fields Response modificado para Code
- ✅ System prompt atualizado
- ✅ Documentação completa criada

---

## 👨‍💻 Gerado Por

**Script:** `modify-workflow.py`
**Data:** 24/10/2025
**Versão:** 1.0
**Status:** ✅ Pronto para produção

---

**Para começar:** Leia `CHECKLIST-IMPORTACAO.md` e siga os passos!
