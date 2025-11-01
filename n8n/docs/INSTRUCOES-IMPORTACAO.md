# Instruções de Importação - Integração Sub-Workflow Google Drive

## Arquivos Gerados

1. **google-drive-operations-subworkflow.json** - Sub-workflow isolado para operações do Google Drive
2. **alfred-workflow-modified.json** - Workflow principal modificado
3. **modify-workflow.py** - Script Python usado para gerar as modificações

## Passo a Passo de Importação

### ⚠️ IMPORTANTE: Siga esta ordem exata

### Passo 1: Importar Sub-Workflow Google Drive

1. Abra seu N8N
2. Vá em **Workflows** → **Import from File**
3. Selecione `google-drive-operations-subworkflow.json`
4. **Não ative o workflow ainda** (ele deve ficar inactive)
5. **COPIE O ID DO WORKFLOW**
   - Você pode ver o ID na URL do navegador
   - Exemplo: `https://seu-n8n.com/workflow/ABC123XYZ` → ID é `ABC123XYZ`
   - Ou use o botão "Copy Workflow ID" se disponível

### Passo 2: Editar Workflow Principal Modificado

Antes de importar o workflow principal, você precisa configurar o ID do sub-workflow:

1. Abra `alfred-workflow-modified.json` em um editor de texto
2. Procure por `{{ WORKFLOW_ID_DO_SUBWORKFLOW }}`
3. Substitua pelo ID copiado no Passo 1
4. Salve o arquivo

**Exemplo:**
```json
// ANTES
"workflowId": "{{ WORKFLOW_ID_DO_SUBWORKFLOW }}"

// DEPOIS (com seu ID real)
"workflowId": "ABC123XYZ"
```

### Passo 3: Importar Workflow Principal

1. No N8N, vá em **Workflows** → **Import from File**
2. Selecione `alfred-workflow-modified.json` (já editado)
3. O workflow será importado com a nova estrutura

### Passo 4: Ativar Workflow Principal

1. ⚠️ **NÃO ative o sub-workflow** "Google Drive Operations"
   - Sub-workflows com "Execute Workflow Trigger" devem ficar **Inactive**
   - Eles são executados sob demanda quando chamados
2. Ative APENAS o workflow principal (o que tem o Webhook)

## Verificação da Estrutura

O workflow principal modificado deve ter esta estrutura de fluxo:

```
Webhook1
  ↓
Edit Fields (Input)
  ↓
Personal Assistant (AI Agent)
  ↓
Detect Action (Code) ← NOVO
  ↓
Needs Sub-Workflow? (IF) ← NOVO
  ├─ TRUE → Call Google Drive Sub-Workflow ← NOVO
  │            ↓
  │         Merge Results ← NOVO (input 1)
  │
  └─ FALSE → Merge Results (input 2)
              ↓
Edit Fields (Response) - MODIFICADO para Code
  ↓
Respond to Webhook1
```

## Mudanças Implementadas

### ✅ Nós Removidos
- "Pesquisar arquivos e pastas" (Google Drive Tool)
- "Baixar arquivo do Drive" (Google Drive Tool)
- "Compartilhar arquivo" (Google Drive Tool)
- Sub-workflow interno (movido para arquivo separado)

### ✅ Nós Adicionados
- **Detect Action**: Detecta quando AI retorna JSON action
- **Needs Sub-Workflow?**: IF que roteia para sub-workflow ou fluxo normal
- **Call Google Drive Sub-Workflow**: Executa sub-workflow com fileName
- **Merge Results**: Reúne resultados dos dois branches

### ✅ Nós Modificados
- **Personal Assistant**: System prompt atualizado com instruções Google Drive
- **Edit Fields (Response)**: Transformado em Code node com lógica condicional

## System Prompt Atualizado

O AI Agent agora tem estas instruções adicionais:

```
GOOGLE DRIVE OPERATIONS:
Quando usuário pedir para buscar/baixar/compartilhar arquivo do Drive, você NÃO executa diretamente.
Retorne apenas JSON: { "action": "google_drive", "operation": "download", "fileName": "termo exato do usuário" }
Depois informe ao usuário: "Vou buscar esse arquivo no Google Drive, senhor."
```

## Teste de Validação

Após importar, teste com esta mensagem:

**Input (via webhook ou chat):**
```json
{
  "message": "Baixe o arquivo Checklist Casa do Mato",
  "userId": "ricardo-nilton",
  "timestamp": "2025-10-24T20:00:00.000Z",
  "source": "web-assistant"
}
```

**Output esperado:**
```json
{
  "success": true,
  "response": "Arquivo \"Checklist Casa do Mato.csv\" baixado com sucesso, senhor. File ID: 1nvsZ...",
  "type": "generic",
  "timestamp": "2025-10-24T20:00:02.000Z",
  "metadata": {}
}
```

## Fluxo de Execução Detalhado

### Cenário 1: Usuário pede arquivo do Drive

1. Webhook recebe: `"Baixe o arquivo Casa do Mato"`
2. Personal Assistant detecta pedido de Google Drive
3. **Retorna JSON**: `{"action": "google_drive", "operation": "download", "fileName": "Casa do Mato"}`
4. **Detect Action** identifica `needsAction: true`
5. **IF** roteia para TRUE → Execute Workflow
6. **Sub-workflow executa**:
   - Search Files com termo "Casa do Mato"
   - Validate Results (busca case-insensitive)
   - Download File (se encontrado)
   - Retorna: `{success: true, fileId: "...", fileName: "..."}`
7. **Merge** combina resultado
8. **Edit Fields (Response)** formata resposta final
9. Usuário recebe confirmação

### Cenário 2: Usuário faz pergunta normal

1. Webhook recebe: `"Quais são meus emails de hoje?"`
2. Personal Assistant processa com Gmail Tool
3. **Retorna texto**: `"Você tem 5 emails hoje, senhor..."`
4. **Detect Action** identifica `needsAction: false`
5. **IF** roteia para FALSE → direto para Merge
6. **Merge** passa dados adiante
7. **Edit Fields (Response)** formata resposta
8. Usuário recebe resposta

## Troubleshooting

### ⚠️ Erro: "Workflow could not be activated: no trigger node"
- **Causa**: Tentou ativar o sub-workflow
- **Solução**: ✅ **Isso é NORMAL!** Sub-workflow deve ficar **Inactive**
  - Sub-workflows com "Execute Workflow Trigger" NÃO têm trigger próprio
  - Eles são chamados sob demanda pelo workflow principal
  - Deixe o status como **Inactive** e ative apenas o workflow principal

### Erro: "Workflow not found"
- **Causa**: ID do sub-workflow não foi configurado corretamente
- **Solução**: Volte ao Passo 2 e verifique o ID

### Erro: "File not found" ainda aparece
- **Causa**: Sub-workflow não existe ou ID está incorreto
- **Solução**: Verifique se sub-workflow foi importado e ID está correto

### AI Agent não retorna JSON
- **Causa**: System prompt não foi atualizado
- **Solução**: Reimporte o workflow ou edite manualmente o prompt

### Merge não funciona
- **Causa**: Conexões incorretas entre IF e Merge
- **Solução**: Verifique que TRUE vai para input 0 e FALSE vai para input 1 do Merge

## Backup do Workflow Original

O arquivo original está preservado em:
- `n8n/arquivos/Fluxo n8n- Alfred.json`

Se precisar reverter, basta reimportar este arquivo.

## Próximos Passos (Opcional)

Após validar que tudo funciona:

1. Renomeie o workflow principal para "Alfred Final" ou nome desejado
2. Renomeie o sub-workflow para algo mais descritivo se preferir
3. Delete os nós antigos do Google Drive se ainda estiverem no workflow original

## Suporte

Se encontrar problemas:
1. Verifique os logs de execução no N8N
2. Teste o sub-workflow isoladamente (executar manualmente)
3. Valide que todas as credenciais Google estão configuradas

---

**Gerado em:** 24/10/2025
**Script:** modify-workflow.py
**Versão:** 1.0
