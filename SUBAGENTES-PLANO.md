# Plano de Criação dos Subagentes - Projeto Alfred

## 📚 Referências Encontradas

### Repositórios Populares (GitHub 2024-2025)
1. **0xfurai/claude-code-subagents** - 100+ subagentes especializados
2. **lst97/claude-code-sub-agents** - Coleção focada em full-stack
3. **wshobson/agents** - 85 agentes com workflows orquestrados
4. **VoltAgent/awesome-claude-code-subagents** - Coleção production-ready

### Estrutura Oficial (Documentação Claude)
- **Local:** `~/.claude/agents/` (user-level) ou `.claude/agents/` (project-level)
- **Formato:** Arquivos `.md` com YAML frontmatter
- **Modelos:** `haiku` (rápido), `sonnet` (padrão), `opus` (complexo)

---

## 🏗️ Estrutura dos Subagentes

### Formato Padrão

```markdown
---
name: nome-do-agente
description: Quando usar este agente (importante para auto-invocação)
tools: tool1, tool2, tool3  # Opcional - herda todas se omitido
model: sonnet  # Opcional - haiku/sonnet/opus/inherit
---

You are a [role description].

## Your Expertise
- [Domain knowledge area 1]
- [Domain knowledge area 2]

## Core Responsibilities
1. [Primary task]
2. [Secondary task]

## Approach
- [How you analyze problems]
- [How you provide solutions]

## Quality Standards
- [Standard 1]
- [Standard 2]

## Output Format
[What format your responses should follow]
```

---

## 🎯 Nossos 3 Subagentes

### 1. UI/UX Research Agent

**Nome:** `ui-ux-research`

**Descrição:** "Use when researching modern UI/UX patterns, benchmarking chat interfaces, or analyzing design best practices"

**Tools:** `WebSearch, WebFetch, Read, Write`

**Model:** `sonnet` (pesquisa precisa balanceamento)

**Prompt Principal:**
```markdown
You are a UI/UX research specialist focused on modern web chat interfaces.

## Your Expertise
- Modern chat UI patterns (2024-2025)
- Mobile-first design principles
- Accessibility standards (WCAG)
- Performance-oriented design
- Benchmarking popular interfaces (ChatGPT, Claude, WhatsApp)

## Core Responsibilities
1. Research and analyze modern UI/UX patterns
2. Compare different design approaches with pros/cons
3. Provide evidence-based recommendations
4. Focus on simplicity and performance

## Research Sources (Priority)
- GitHub repositories (2024-2025)
- Web.dev and MDN documentation
- Popular chat applications
- Reddit r/webdev, Dev.to recent posts

## Output Format
- Screenshots with annotations
- Comparison tables
- 2-3 design options with justifications
- Performance impact analysis
```

### 2. PWA/Performance Expert

**Nome:** `pwa-performance-expert`

**Descrição:** "Use for PWA configuration, service workers, performance optimization, and mobile Safari issues"

**Tools:** `Read, Write, Edit, Bash, WebSearch`

**Model:** `opus` (configuração complexa)

**Prompt Principal:**
```markdown
You are a PWA and performance optimization expert.

## Your Expertise
- Progressive Web Apps (manifest, service workers)
- Performance optimization (< 100KB, < 2s load)
- Mobile Safari quirks and workarounds
- Cache strategies and offline functionality
- Lighthouse auditing

## Core Responsibilities
1. Configure PWA for installability
2. Optimize bundle size and load time
3. Implement effective cache strategies
4. Ensure iPhone 11 Safari compatibility
5. Achieve Lighthouse score > 90

## Technical Standards
- Bundle size < 100KB total
- First Contentful Paint < 1s
- Time to Interactive < 2s
- Perfect mobile performance

## Focus Areas
- Service Worker implementation
- Manifest.json optimization
- Icon generation and configuration
- Meta tags for iOS/Android
- Offline-first patterns

## Output Format
- Configuration files with comments
- Performance metrics before/after
- Compatibility notes for Safari
- Lighthouse audit results
```

### 3. Vanilla JS Code Reviewer

**Nome:** `vanilla-js-reviewer`

**Descrição:** "Use to review JavaScript code without frameworks, ensure ES6+ best practices, and detect bugs"

**Tools:** `Read, Grep, Glob, Bash`

**Model:** `sonnet` (análise detalhada mas rápida)

**Prompt Principal:**
```markdown
You are a vanilla JavaScript code review expert.

## Your Expertise
- Modern JavaScript (ES6+) without frameworks
- Clean code principles
- Performance optimization
- Cross-browser compatibility
- Security best practices

## Review Priorities (in order)
1. **Logic errors and bugs** that could cause failures
2. **Security vulnerabilities** (XSS, injection)
3. **Performance issues** (memory leaks, inefficient loops)
4. **Code simplicity** (can it be simpler?)
5. **Browser compatibility** (especially Safari)
6. **Code style consistency**

## Specific Focus
- NO frameworks or libraries (vanilla only)
- Minimize dependencies
- Prefer native browser APIs
- Ensure iPhone 11 Safari compatibility
- Keep code under 300 lines per file

## Red Flags to Check
- Complex nested callbacks (suggest async/await)
- Direct DOM manipulation in loops
- Missing error handling
- Hardcoded values that should be config
- Memory leaks (event listeners not removed)

## Output Format
- Severity levels: 🔴 Critical, 🟡 Warning, 🟢 Suggestion
- Code snippets with fixes
- Performance impact notes
- Browser compatibility warnings
```

---

## 📁 Estrutura de Diretórios

```bash
# Criar no projeto (project-level)
/alfred-pennyworth/
└── .claude/
    └── agents/
        ├── ui-ux-research.md
        ├── pwa-performance-expert.md
        └── vanilla-js-reviewer.md

# OU criar globalmente (user-level)
~/.claude/
└── agents/
    └── alfred/  # pasta específica do projeto
        ├── ui-ux-research.md
        ├── pwa-performance-expert.md
        └── vanilla-js-reviewer.md
```

---

## 🔧 Configuração do Ambiente

### Passo 1: Verificar estrutura Claude Code
```bash
# Verificar se diretório existe
ls ~/.claude/

# Se não existir, criar
mkdir -p ~/.claude/agents/
```

### Passo 2: Escolher local de instalação

**Opção A: Project-level** (recomendado)
```bash
cd /mnt/c/Users/ricar/Projetos/Alfred\ Pennyworth/
mkdir -p .claude/agents/
```

**Opção B: User-level**
```bash
mkdir -p ~/.claude/agents/alfred/
```

### Passo 3: Criar os arquivos .md
Criar cada arquivo com o conteúdo específico na pasta escolhida.

### Passo 4: Verificar carregamento
```bash
# No Claude Code, usar comando:
/agents

# Deve listar os 3 novos agentes
```

---

## 🚀 Implementação Step-by-Step

### Fase 1: Criar UI/UX Research Agent ✅ CONCLUÍDO
1. ✅ Criado arquivo `ui-ux-research.md`
2. ✅ YAML frontmatter configurado (name, description, tools, model)
3. ✅ System prompt completo com expertise, responsibilities, standards
4. ⏳ Aguardando teste: "Research modern chat UI patterns"

**Localização:** `.claude/agents/ui-ux-research.md`

### Fase 2: Criar PWA/Performance Expert ⏳ PRÓXIMA
1. Criar arquivo `pwa-performance-expert.md`
2. Configurar tools específicas
3. Adicionar expertise em Safari/iPhone
4. Testar com: "Configure PWA manifest"

### Fase 3: Criar Vanilla JS Reviewer ⏳ PENDENTE
1. Criar arquivo `vanilla-js-reviewer.md`
2. Focar em código sem frameworks
3. Adicionar checklist de revisão
4. Testar com código exemplo

---

## ✅ Validação dos Subagentes

### Testes de Invocação

**Teste 1: Auto-invocação**
```
"I need to research chat interfaces"
→ Deve invocar ui-ux-research automaticamente
```

**Teste 2: Invocação explícita**
```
"Use the pwa-performance-expert to optimize load time"
→ Deve chamar o agente específico
```

**Teste 3: Review de código**
```
"Review this JavaScript code for bugs"
→ Deve usar vanilla-js-reviewer
```

### Checklist de Qualidade
- [ ] Agentes aparecem em `/agents`
- [ ] Descrições claras para auto-invocação
- [ ] Tools apropriadas para cada tarefa
- [ ] System prompts focados e específicos
- [ ] Testados com casos reais

---

## 🎯 Uso Durante o Projeto

### Fase 0 (Pesquisa)
→ **ui-ux-research** para benchmarking

### Fase 2-3 (Interface e Input)
→ **ui-ux-research** para validar design
→ **vanilla-js-reviewer** para código

### Fase 4-6 (API, Storage, Voz)
→ **vanilla-js-reviewer** para cada implementação

### Fase 8 (PWA)
→ **pwa-performance-expert** para toda configuração

### Fase 9 (Polimento)
→ **pwa-performance-expert** para auditoria final
→ **vanilla-js-reviewer** para code review completo

---

## 📝 Notas Importantes

1. **Modelos:**
   - `haiku` = mais rápido, tarefas simples
   - `sonnet` = balanceado (padrão)
   - `opus` = mais capaz, tarefas complexas

2. **Tools:** Se omitir, herda todas as ferramentas

3. **Contexto:** Cada subagente tem contexto próprio (não polui conversa principal)

4. **Versionamento:** Commit dos agentes no Git para compartilhar com time

---

## 🚨 Próximos Passos

1. **Decidir local:** Project-level ou User-level?
2. **Criar arquivos:** Implementar os 3 .md
3. **Testar:** Validar cada agente
4. **Documentar:** Adicionar ao README como usar

---

## 📊 Status de Implementação

| Subagente | Cor | Status | Arquivo | Linhas | Testado |
|-----------|-----|--------|---------|--------|---------|
| UI/UX Research | 🔵 Azul | ✅ Criado | `.claude/agents/ui-ux-research.md` | 68 | ✅ OK |
| PWA/Performance Expert | 🟢 Verde | ✅ Criado | `.claude/agents/pwa-performance-expert.md` | 106 | ✅ OK |
| Vanilla JS Reviewer | 🟡 Amarelo | ✅ Criado | `.claude/agents/vanilla-js-reviewer.md` | 192 | ✅ OK |

**Identificação Visual:** Cada subagente inicia respostas com seu emoji de cor para fácil identificação.

**Última atualização:** 2025-10-24 01:22
**Progresso:** 3/3 subagentes criados (100%) ✅

---

**Status:** CONCLUÍDO - Todos os subagentes criados
**Total:** 366 linhas de configuração especializada