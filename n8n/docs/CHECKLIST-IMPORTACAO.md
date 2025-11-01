# ✅ Checklist de Importação - Sub-Workflow Google Drive

**Tempo estimado:** 10 minutos

---

## 📋 Pré-requisitos

- [ ] N8N acessível e funcionando
- [ ] Credenciais Google Drive configuradas
- [ ] Arquivos prontos:
  - [ ] `google-drive-operations-subworkflow.json`
  - [ ] `alfred-workflow-modified.json`
- [ ] Editor de texto disponível (VS Code, Notepad++, etc.)

---

## 🔄 Importação (Siga esta ordem)

### Passo 1: Sub-Workflow
- [ ] Abrir N8N
- [ ] Ir em **Workflows** → **Import from File**
- [ ] Selecionar `google-drive-operations-subworkflow.json`
- [ ] Workflow importado com nome "Google Drive Operations"
- [ ] **NÃO ATIVAR AINDA**

### Passo 2: Copiar ID
- [ ] Com o sub-workflow aberto, copiar o ID da URL
  - Exemplo: `https://n8n.example.com/workflow/ABC123XYZ`
  - ID = `ABC123XYZ`
- [ ] Anotar o ID: ___________________________

### Passo 3: Editar Workflow Principal
- [ ] Abrir `alfred-workflow-modified.json` no editor
- [ ] Buscar por: `{{ WORKFLOW_ID_DO_SUBWORKFLOW }}`
- [ ] Substituir pelo ID copiado
- [ ] Salvar arquivo
- [ ] Exemplo:
  ```json
  // Antes
  "workflowId": "{{ WORKFLOW_ID_DO_SUBWORKFLOW }}"

  // Depois
  "workflowId": "ABC123XYZ"
  ```

### Passo 4: Importar Workflow Principal
- [ ] No N8N, **Import from File** novamente
- [ ] Selecionar `alfred-workflow-modified.json` (editado)
- [ ] Workflow importado com todos os nós

### Passo 5: Verificação Visual
- [ ] Abrir workflow principal no N8N
- [ ] Verificar se há os seguintes nós:
  - [ ] Personal Assistant
  - [ ] Detect Action (novo)
  - [ ] Needs Sub-Workflow? (novo)
  - [ ] Call Google Drive Sub-Workflow (novo)
  - [ ] Merge Results (novo)
  - [ ] Edit Fields (Response)
- [ ] Verificar conexões:
  - [ ] Personal Assistant → Detect Action
  - [ ] Detect Action → Needs Sub-Workflow?
  - [ ] IF TRUE → Call Google Drive Sub-Workflow → Merge
  - [ ] IF FALSE → Merge
  - [ ] Merge → Edit Fields (Response)

### Passo 6: Ativação
- [ ] ⚠️ **NÃO ATIVAR** o sub-workflow "Google Drive Operations"
  - Sub-workflows com "Execute Workflow Trigger" ficam **Inactive**
  - Eles são executados sob demanda quando chamados
  - Status correto: **Inactive** ✅
- [ ] Voltar para workflow principal
- [ ] Clicar em **Activate**
- [ ] Status: **Active** ✅

---

## 🧪 Teste Funcional

### Teste 1: Google Drive (novo fluxo)
- [ ] Executar workflow manualmente ou via webhook
- [ ] Input de teste:
  ```json
  {
    "message": "Baixe o arquivo Checklist Casa do Mato",
    "userId": "ricardo-nilton",
    "timestamp": "2025-10-24T20:00:00.000Z",
    "source": "web-assistant"
  }
  ```
- [ ] Verificar execução:
  - [ ] Personal Assistant retornou JSON action
  - [ ] Detect Action identificou `needsAction: true`
  - [ ] IF direcionou para sub-workflow
  - [ ] Sub-workflow executou com sucesso
  - [ ] Merge combinou resultado
  - [ ] Edit Fields formatou resposta
- [ ] Output esperado:
  ```json
  {
    "success": true,
    "response": "Arquivo \"...\" baixado com sucesso, senhor. File ID: ...",
    "type": "generic",
    "timestamp": "..."
  }
  ```

### Teste 2: Fluxo Normal (Email/Calendar)
- [ ] Executar com input:
  ```json
  {
    "message": "Quais meus próximos eventos?",
    "userId": "ricardo-nilton"
  }
  ```
- [ ] Verificar:
  - [ ] Personal Assistant usou Google Calendar tool
  - [ ] Detect Action identificou `needsAction: false`
  - [ ] IF direcionou para Merge (bypass sub-workflow)
  - [ ] Resposta normal recebida

---

## ⚠️ Troubleshooting

### ❌ Erro: "Workflow not found"
- [ ] Verificar se ID foi copiado corretamente
- [ ] Verificar se sub-workflow está ativo
- [ ] Re-importar workflow principal com ID correto

### ❌ Erro: "File not found" ainda aparece
- [ ] Verificar credenciais Google Drive
- [ ] Testar sub-workflow isoladamente
- [ ] Verificar se arquivo existe no Drive

### ❌ AI não retorna JSON
- [ ] Verificar system prompt no Personal Assistant
- [ ] Deve conter seção "GOOGLE DRIVE OPERATIONS:"
- [ ] Re-importar ou editar manualmente

### ❌ Merge não funciona
- [ ] Verificar conexões do IF:
  - TRUE → input 0 do Merge
  - FALSE → input 1 do Merge
- [ ] Ajustar manualmente se necessário

---

## 🎉 Finalização

- [ ] Ambos workflows ativos
- [ ] Teste Google Drive funcionando
- [ ] Teste fluxo normal funcionando
- [ ] Nenhum erro nos logs
- [ ] Documentação lida

---

## 📞 Suporte

**Se algo não funcionar:**

1. Verificar logs de execução no N8N (clique na execução)
2. Testar sub-workflow isoladamente (botão "Execute Workflow")
3. Comparar com estrutura no `RESUMO-MODIFICACOES.md`
4. Revisar `INSTRUCOES-IMPORTACAO.md` passo a passo

---

## 🔄 Rollback (se necessário)

**Para voltar ao workflow anterior:**

- [ ] Desativar workflows novos
- [ ] Reimportar `Fluxo n8n- Alfred.json` (backup original)
- [ ] Ativar workflow original

---

**Data:** 24/10/2025
**Status:** Pronto para uso
**Duração esperada:** 10 minutos
