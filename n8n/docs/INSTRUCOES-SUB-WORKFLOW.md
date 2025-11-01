# Instruções - Sub-Workflow Google Drive

## Arquivo criado
`n8n/arquivos/google-drive-operations-subworkflow.json`

## Melhorias (Refatoração)

**Validação inteligente:**
- Filtra resultados da busca pelo nome correto (case-insensitive)
- Se Google Drive retornar arquivos, mas nenhum corresponder ao termo buscado, retorna erro detalhado
- Mostra quantos arquivos foram encontrados e quais são

**Mensagens de erro claras:**
- Indica se nenhum arquivo foi encontrado na busca
- Indica se a busca retornou arquivos, mas nenhum corresponde ao termo
- Lista os nomes dos arquivos encontrados para debugging

**Resposta de sucesso completa:**
- Inclui tamanho do arquivo
- Indica quantos arquivos corresponderam à busca
- Binary data preservado

## Passo 1: Importar Sub-Workflow

1. N8N → Menu → Workflows
2. "Add workflow" → "Import from File"
3. Selecione `google-drive-operations-subworkflow.json`
4. Ative o workflow (toggle on)
5. **Copie o ID do workflow** (URL: `/workflow/ABC123`)

## Passo 2: Atualizar Credenciais

No sub-workflow importado, atualize as credenciais dos nós Google Drive:
- "Search Files"
- "Download File"

Use suas credenciais Google Drive OAuth2.

## Passo 3: Testar Sub-Workflow Isoladamente

Execute manualmente passando:
```json
{
  "fileName": "Casa do Mato"
}
```

**Resultado esperado (sucesso):**
```json
{
  "success": true,
  "fileId": "1xYz2AbC...",
  "fileName": "Checklist Casa do Mato.pdf",
  "mimeType": "application/pdf",
  "size": "12345",
  "totalMatches": 1
}
```

**Resultado esperado (erro - nenhum encontrado):**
```json
{
  "success": false,
  "error": "Nenhum arquivo encontrado com \"XYZ\"",
  "fileName": "XYZ",
  "foundCount": 0
}
```

**Resultado esperado (erro - busca retornou, mas não corresponde):**
```json
{
  "success": false,
  "error": "Busca retornou 3 arquivo(s), mas nenhum contém \"Casa Mato\" no nome",
  "fileName": "Casa Mato",
  "foundCount": 3,
  "foundFiles": "arquivo1.pdf, arquivo2.doc, arquivo3.txt"
}
```

## Passo 4: Integrar no Workflow Principal

**Próximas ações necessárias:**

1. Remover Google Drive tools do AI Agent
2. Atualizar system prompt
3. Adicionar nó "Detect Action" após AI Agent
4. Adicionar nó "Execute Workflow" que chama o sub-workflow
5. Ajustar resposta final

**Quer que eu gere o workflow principal modificado ou prefere fazer manualmente?**

## Como funciona

```
User: "Baixe o arquivo Casa do Mato"
  ↓
AI Agent detecta ação Google Drive
  ↓
Retorna: { action: "download", fileName: "Casa do Mato" }
  ↓
Execute Workflow chama sub-workflow
  ↓
Sub-workflow: Search → Validate → Download
  ↓
Retorna resultado (success + binary data ou error)
  ↓
Resposta formatada pro usuário
```

## Vantagens

- Binary data funciona (contorna bug N8N)
- Validação robusta de File ID
- Debugging isolado
- Escalável (adicionar share/upload/delete)
