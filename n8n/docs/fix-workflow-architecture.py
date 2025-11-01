#!/usr/bin/env python3
"""
Script para corrigir arquitetura do workflow - Remover Google Drive tools do AI Agent
"""
import json

print("🔧 Corrigindo arquitetura do workflow...\n")

# Ler workflow original (o que está no N8N agora)
with open('arquivos/Fluxo n8n- Alfred.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

print("📊 Análise do workflow original:")
print(f"   Total de nós: {len(workflow['nodes'])}")

# 1. Identificar nós conectados ao AI Agent
ai_agent_id = "d539a88d-eaa1-45ef-a0e8-5ed65222e121"
connected_tools = []

for node_name, connections in workflow['connections'].items():
    if 'ai_tool' in connections:
        for conn_list in connections['ai_tool']:
            for conn in conn_list:
                if conn['node'] == 'Personal Assistant':
                    connected_tools.append(node_name)

print(f"\n🔌 Tools conectados ao AI Agent:")
for tool in connected_tools:
    is_drive = 'Drive' in tool or 'arquivo' in tool.lower()
    marker = "❌ REMOVER" if is_drive else "✅ MANTER"
    print(f"   {marker} - {tool}")

# 2. Remover nós Google Drive do workflow
google_drive_tools = [
    "Baixar arquivo do Drive",
    "Compartilhar arquivo",
    "Pesquisar arquivos e pastas"
]

print(f"\n🗑️  Removendo {len(google_drive_tools)} nós Google Drive...")
workflow['nodes'] = [n for n in workflow['nodes'] if n['name'] not in google_drive_tools]

# 3. Remover conexões dos nós Google Drive
for tool_name in google_drive_tools:
    if tool_name in workflow['connections']:
        del workflow['connections'][tool_name]
        print(f"   ✅ Removida conexão: {tool_name}")

# 4. Atualizar System Prompt
print("\n📝 Atualizando System Prompt do AI Agent...")
personal_assistant = next(n for n in workflow['nodes'] if n['id'] == ai_agent_id)

old_prompt = personal_assistant['parameters']['options']['systemMessage']

# Remover menção antiga ao Google Drive Agent se existir
old_prompt = old_prompt.replace("  - Google Drive Agent → Handles all Drive operations\n", "")

# Adicionar novas instruções
new_instructions = """

GOOGLE DRIVE OPERATIONS - IMPORTANT:
When user requests to search/download/share files from Google Drive:
1. DO NOT use any Google Drive tool directly
2. Return ONLY this exact JSON format:
   {
     "action": "google_drive",
     "operation": "download",
     "fileName": "exact search term from user"
   }
3. After returning JSON, inform user: "Vou buscar esse arquivo no Google Drive, senhor."

Examples:
- User: "baixe o arquivo Casa do Mato" → Return JSON with fileName: "Casa do Mato"
- User: "preciso do checklist" → Return JSON with fileName: "checklist"
- User: "compartilhe a planilha X com Y" → Return JSON with operation: "share", fileName: "X"
"""

personal_assistant['parameters']['options']['systemMessage'] = old_prompt + new_instructions
print("   ✅ System Prompt atualizado")

# 5. Adicionar nós novos
print("\n➕ Adicionando novos nós...")

# Detect Action
detect_action = {
    "parameters": {
        "jsCode": """const output = $json.output;

// Log para debug
console.log('=== Detect Action ===');
console.log('Output type:', typeof output);
console.log('Output:', output);

try {
  const parsed = typeof output === 'string' ? JSON.parse(output) : output;

  if (parsed && parsed.action === 'google_drive') {
    console.log('✅ Google Drive action detected!');
    return [{
      json: {
        needsAction: true,
        operation: parsed.operation || 'download',
        fileName: parsed.fileName,
        originalOutput: output
      }
    }];
  }
} catch (e) {
  console.log('Not a JSON action, continue normal flow');
}

return [{
  json: {
    needsAction: false,
    output: output
  }
}];"""
    },
    "id": "detect-action-node-001",
    "name": "Detect Action",
    "type": "n8n-nodes-base.code",
    "typeVersion": 2,
    "position": [816, -112]
}
workflow['nodes'].append(detect_action)

# IF Node
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
    "id": "needs-subworkflow-if-001",
    "name": "Needs Sub-Workflow?",
    "type": "n8n-nodes-base.if",
    "typeVersion": 2,
    "position": [1040, -112]
}
workflow['nodes'].append(if_node)

# Execute Workflow
exec_workflow = {
    "parameters": {
        "source": "database",
        "workflowId": {
            "__rl": True,
            "mode": "id",
            "value": "vvN6NuHhfByE9PAr"
        },
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
    "id": "call-subworkflow-001",
    "name": "Call Google Drive Sub-Workflow",
    "type": "n8n-nodes-base.executeWorkflow",
    "typeVersion": 1.1,
    "position": [1264, -240]
}
workflow['nodes'].append(exec_workflow)

# Merge
merge_node = {
    "parameters": {
        "mode": "multiplex"
    },
    "id": "merge-results-001",
    "name": "Merge Results",
    "type": "n8n-nodes-base.merge",
    "typeVersion": 3,
    "position": [1488, -112]
}
workflow['nodes'].append(merge_node)

print("   ✅ Detect Action")
print("   ✅ Needs Sub-Workflow? (IF)")
print("   ✅ Call Google Drive Sub-Workflow")
print("   ✅ Merge Results")

# 6. Modificar Edit Fields (Response) para Code
print("\n🔄 Modificando Edit Fields (Response)...")
response_node_idx = next(i for i, n in enumerate(workflow['nodes'])
                          if n['id'] == 'b1eb67d4-d85e-4419-9e31-c19c997da1e4')

workflow['nodes'][response_node_idx] = {
    "parameters": {
        "jsCode": """const data = $json;

console.log('=== Edit Fields Response ===');
console.log('Data received:', data);

// Resposta normal do AI Agent (não precisa sub-workflow)
if (data.needsAction === false) {
  console.log('Normal AI response');
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
  console.log('Sub-workflow success');
  return [{
    json: {
      success: true,
      response: `Arquivo "${data.fileName}" processado com sucesso, senhor.`,
      type: "google_drive",
      timestamp: new Date().toISOString(),
      metadata: {
        fileId: data.fileId,
        fileName: data.fileName,
        mimeType: data.mimeType
      }
    }
  }];
}

// Erro do sub-workflow
console.log('Sub-workflow error');
return [{
  json: {
    success: false,
    response: `Desculpe, senhor. ${data.error || 'Erro ao processar arquivo do Google Drive.'}`,
    type: "error",
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
print("   ✅ Convertido para Code node")

# 7. Reconectar tudo
print("\n🔗 Reconectando fluxo...")

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

# Needs Sub-Workflow? -> TRUE: Execute, FALSE: Merge
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

print("   ✅ Personal Assistant → Detect Action")
print("   ✅ Detect Action → Needs Sub-Workflow?")
print("   ✅ IF TRUE → Call Google Drive Sub-Workflow → Merge")
print("   ✅ IF FALSE → Merge")
print("   ✅ Merge → Edit Fields (Response)")

# 8. Salvar
print("\n💾 Salvando workflow corrigido...")
with open('arquivos/alfred-workflow-FIXED.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2, ensure_ascii=False)

print("\n✅ CONCLUÍDO!")
print(f"\n📊 Resumo:")
print(f"   Nós removidos: {len(google_drive_tools)}")
print(f"   Nós adicionados: 4 (Detect Action, IF, Execute Workflow, Merge)")
print(f"   Nós modificados: 2 (Personal Assistant, Edit Fields Response)")
print(f"   Total de nós final: {len(workflow['nodes'])}")
print(f"\n📁 Arquivo gerado: arquivos/alfred-workflow-FIXED.json")
print(f"\n⚠️  IMPORTANTE:")
print(f"   1. Este workflow está sem os Google Drive tools no AI Agent")
print(f"   2. O AI agora vai retornar JSON quando detectar pedido de Google Drive")
print(f"   3. O sub-workflow (vvN6NuHhfByE9PAr) será chamado automaticamente")
print(f"   4. Reimporte este workflow no N8N")
