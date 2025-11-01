#!/usr/bin/env python3
"""
Script para modificar workflow N8N - Integração com Sub-Workflow Google Drive
"""
import json
import uuid

# Ler workflow original
with open('arquivos/Fluxo n8n- Alfred.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("1. Removendo nós do Google Drive...")
# IDs dos nós a remover
nodes_to_remove = [
    "4c1340d7-1edb-4515-bd50-a53e681b3df8",  # Baixar arquivo do Drive
    "cd58adce-a418-4c29-8c3f-b02725b9ea26",  # Compartilhar arquivo
    "1a9dfee0-05b0-4afc-a954-6a619ebf2af8",  # Pesquisar arquivos e pastas
    # Também remover os nós do sub-workflow interno (será separado)
    "f2486c4b-a3af-47ec-89d7-f0683ee5d1af",  # Execute Workflow Trigger
    "c1670f57-b1ea-40e7-8c3f-52beab657018",  # Search Files
    "caef0a56-cfdd-44ea-bbf0-9241ca7be181",  # Validate Results
    "49b2e0ed-1d23-4791-ad38-9f55acaf831e",  # File Found?
    "cf8f6a8f-bdec-4ad9-a782-9a66781dd94a",  # Download File
    "d945d917-72fa-4a75-a7f6-992773b777a6",  # Format Success
    "30200b97-33e6-4810-aa87-c8e7d797e875",  # Format Error
]

# Filtrar nós
workflow['nodes'] = [n for n in workflow['nodes'] if n['id'] not in nodes_to_remove]

# Remover conexões dos nós removidos
for node_id in nodes_to_remove:
    if node_id in workflow['connections']:
        del workflow['connections'][node_id]

# Remover conexões ai_tool dos nós Google Drive do Personal Assistant
for key in list(workflow['connections'].keys()):
    if key in ["Baixar arquivo do Drive", "Compartilhar arquivo", "Pesquisar arquivos e pastas"]:
        del workflow['connections'][key]

print("2. Atualizando System Prompt...")
# Encontrar nó Personal Assistant
personal_assistant = next(n for n in workflow['nodes'] if n['id'] == 'd539a88d-eaa1-45ef-a0e8-5ed65222e121')

# Adicionar ao final do system prompt
new_prompt_section = """

GOOGLE DRIVE OPERATIONS:
Quando usuário pedir para buscar/baixar/compartilhar arquivo do Drive, você NÃO executa diretamente.
Retorne apenas JSON: { "action": "google_drive", "operation": "download", "fileName": "termo exato do usuário" }
Depois informe ao usuário: "Vou buscar esse arquivo no Google Drive, senhor."
"""

personal_assistant['parameters']['options']['systemMessage'] += new_prompt_section

print("3. Adicionando nó 'Detect Action'...")
detect_action_node = {
    "parameters": {
        "jsCode": """const output = $json.output;

try {
  const parsed = typeof output === 'string' ? JSON.parse(output) : output;

  if (parsed.action === 'google_drive') {
    return [{
      json: {
        needsAction: true,
        operation: parsed.operation,
        fileName: parsed.fileName,
        originalOutput: output
      }
    }];
  }
} catch (e) {
  // Não é JSON action, segue fluxo normal
}

return [{
  json: {
    needsAction: false,
    output: output
  }
}];"""
    },
    "id": str(uuid.uuid4()),
    "name": "Detect Action",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [816, -112]
}

workflow['nodes'].append(detect_action_node)

print("4. Adicionando nó 'IF - Needs Sub-Workflow?'...")
if_node = {
    "parameters": {
        "conditions": {
            "boolean": [
                {
                    "value1": "={{ $json.needsAction }}",
                    "value2": True
                }
            ]
        },
        "options": {}
    },
    "id": str(uuid.uuid4()),
    "name": "Needs Sub-Workflow?",
    "type": "n8n-nodes-base.if",
    "typeVersion": 2,
    "position": [1040, -112]
}

workflow['nodes'].append(if_node)

print("5. Adicionando nó 'Execute Workflow'...")
# NOTA: O workflowId precisa ser preenchido manualmente após importar o sub-workflow
execute_workflow_node = {
    "parameters": {
        "source": "database",
        "workflowId": "{{ WORKFLOW_ID_DO_SUBWORKFLOW }}",
        "mode": "once",
        "waitForResponse": True,
        "workflowInputs": {
            "assignments": [
                {
                    "name": "fileName",
                    "value": "={{ $json.fileName }}"
                }
            ]
        }
    },
    "id": str(uuid.uuid4()),
    "name": "Call Google Drive Sub-Workflow",
    "type": "n8n-nodes-base.executeWorkflow",
    "typeVersion": 1.1,
    "position": [1264, -240]
}

workflow['nodes'].append(execute_workflow_node)

print("6. Adicionando nó 'Merge'...")
merge_node = {
    "parameters": {
        "mode": "multiplex"
    },
    "id": str(uuid.uuid4()),
    "name": "Merge Results",
    "type": "n8n-nodes-base.merge",
    "typeVersion": 3,
    "position": [1488, -112]
}

workflow['nodes'].append(merge_node)

print("7. Modificando 'Edit Fields (Response)' para usar Code...")
# Encontrar e modificar o nó Edit Fields (Response)
response_node_idx = next(i for i, n in enumerate(workflow['nodes'])
                         if n['id'] == 'b1eb67d4-d85e-4419-9e31-c19c997da1e4')

workflow['nodes'][response_node_idx] = {
    "parameters": {
        "jsCode": """const data = $json;

// Resposta normal do AI Agent (não precisa sub-workflow)
if (data.needsAction === false) {
  return [{
    json: {
      success: true,
      response: data.output,
      type: "generic",
      timestamp: new Date().toISOString(),
      metadata: {}
    }
  }];
}

// Resultado do sub-workflow (Google Drive)
if (data.success === true) {
  return [{
    json: {
      success: true,
      response: `Arquivo "${data.fileName}" baixado com sucesso, senhor. File ID: ${data.fileId}`,
      type: "generic",
      timestamp: new Date().toISOString(),
      metadata: {}
    }
  }];
}

// Erro do sub-workflow
return [{
  json: {
    success: false,
    response: `Desculpe, senhor. ${data.error}`,
    type: "generic",
    timestamp: new Date().toISOString(),
    metadata: {}
  }
}];"""
    },
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [1712, -112],
    "id": "b1eb67d4-d85e-4419-9e31-c19c997da1e4",
    "name": "Edit Fields (Response)"
}

print("8. Reconectando fluxo...")
# Personal Assistant -> Detect Action
workflow['connections']['Personal Assistant'] = {
    "main": [[{
        "node": "Detect Action",
        "type": "main",
        "index": 0
    }]]
}

# Detect Action -> Needs Sub-Workflow?
workflow['connections']['Detect Action'] = {
    "main": [[{
        "node": "Needs Sub-Workflow?",
        "type": "main",
        "index": 0
    }]]
}

# Needs Sub-Workflow? -> TRUE: Execute Workflow, FALSE: Merge
workflow['connections']['Needs Sub-Workflow?'] = {
    "main": [
        [{
            "node": "Call Google Drive Sub-Workflow",
            "type": "main",
            "index": 0
        }],
        [{
            "node": "Merge Results",
            "type": "main",
            "index": 1
        }]
    ]
}

# Execute Workflow -> Merge
workflow['connections']['Call Google Drive Sub-Workflow'] = {
    "main": [[{
        "node": "Merge Results",
        "type": "main",
        "index": 0
    }]]
}

# Merge -> Edit Fields (Response)
workflow['connections']['Merge Results'] = {
    "main": [[{
        "node": "Edit Fields (Response)",
        "type": "main",
        "index": 0
    }]]
}

# Limpar pinData do subworkflow removido
if 'Execute Workflow Trigger' in workflow.get('pinData', {}):
    del workflow['pinData']['Execute Workflow Trigger']

print("9. Salvando workflow modificado...")
with open('arquivos/alfred-workflow-modified.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2, ensure_ascii=False)

print("\n✅ Workflow modificado com sucesso!")
print("\n⚠️  ATENÇÃO: Você precisa:")
print("1. Importar 'google-drive-operations-subworkflow.json' no N8N primeiro")
print("2. Copiar o ID do sub-workflow importado")
print("3. Substituir '{{ WORKFLOW_ID_DO_SUBWORKFLOW }}' no nó 'Call Google Drive Sub-Workflow'")
print("4. Importar 'alfred-workflow-modified.json'")
print("\nArquivos gerados:")
print("- n8n/arquivos/google-drive-operations-subworkflow.json (importar primeiro)")
print("- n8n/arquivos/alfred-workflow-modified.json (importar depois)")
