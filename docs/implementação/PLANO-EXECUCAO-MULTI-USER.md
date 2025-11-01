# Plano de Execução: Implementação Multi-usuário

**Objetivo:** Preparar o Alfred para suportar múltiplos usuários (Ricardo, Dani, Letícia, Isabelle) sem aumentar complexidade do código.

**Estratégia:** 1 repositório → 4 projetos Vercel → cada um com env vars diferentes

---

## Fase 1: Preparação do Código (30 min)

### Task 1.1: Criar Sistema de Config Híbrido

**Arquivo:** `/js/config.js` (NOVO)

**O que fazer:**
1. Criar arquivo que detecta ambiente (prod vs dev)
2. Em produção: ler meta tags do HTML
3. Em desenvolvimento: usar `window.CONFIG` do config.js local
4. Exportar `window.CONFIG` global

**Validação:**
- [ ] Arquivo criado
- [ ] Console mostra "✅ Config carregado"
- [ ] `window.CONFIG` disponível globalmente

---

### Task 1.2: Atualizar index.html

**Arquivo:** `/index.html`

**O que fazer:**
1. Adicionar meta tags com placeholders:
   - `<meta name="api-endpoint" content="{{API_ENDPOINT}}">`
   - `<meta name="user-id" content="{{USER_ID}}">`
   - `<meta name="app-name" content="{{APP_NAME}}">`
2. Adicionar `<script src="js/config.js"></script>` ANTES de `app.js`
3. Manter `<script src="config.js">` com `onerror` para dev local

**Validação:**
- [ ] Meta tags adicionadas no `<head>`
- [ ] Script `js/config.js` carregado antes de `app.js`
- [ ] Ordem correta: `config.js` → `js/config.js` → `storage.js` → `api.js` → etc

---

### Task 1.3: Criar Script de Build

**Arquivo:** `/scripts/inject-env.js` (NOVO)

**O que fazer:**
1. Criar pasta `/scripts/`
2. Criar script Node.js que:
   - Lê `index.html`
   - Substitui `{{API_ENDPOINT}}` por `process.env.API_ENDPOINT`
   - Substitui `{{USER_ID}}` por `process.env.USER_ID`
   - Substitui `{{APP_NAME}}` por `process.env.APP_NAME`
   - Salva arquivo modificado
3. Adicionar logs de confirmação

**Validação:**
- [ ] Pasta `/scripts/` criada
- [ ] Script executa sem erros
- [ ] Testa localmente: `node scripts/inject-env.js`

---

### Task 1.4: Atualizar vercel.json

**Arquivo:** `/vercel.json`

**O que fazer:**
1. Adicionar campo `buildCommand`: `"node scripts/inject-env.js"`
2. Manter configurações existentes (headers, etc)

**Validação:**
- [ ] JSON válido (sem erros de sintaxe)
- [ ] `buildCommand` adicionado

---

### Task 1.5: Atualizar config.example.js

**Arquivo:** `/config.example.js`

**O que fazer:**
1. Adicionar comentários explicando uso local vs produção
2. Manter estrutura existente

**Validação:**
- [ ] Comentários claros sobre quando usar

---

### Task 1.6: Verificar .gitignore

**Arquivo:** `/.gitignore`

**O que fazer:**
1. Confirmar que `config.js` está ignorado
2. Adicionar `.env*` se não existir
3. Adicionar `.vercel` se não existir

**Validação:**
- [ ] `config.js` não será commitado
- [ ] `.gitignore` atualizado

---

## Fase 2: Testes Locais (15 min)

### Task 2.1: Teste de Desenvolvimento Local

**O que fazer:**
1. Copiar `config.example.js` → `config.js`
2. Configurar webhook de teste
3. Rodar `npx http-server -p 3000`
4. Abrir `http://localhost:3000`
5. Verificar console do navegador

**Validação:**
- [ ] Console mostra "✅ Config carregado: { ambiente: 'DESENVOLVIMENTO', ... }"
- [ ] `window.CONFIG.API_ENDPOINT` correto
- [ ] `window.CONFIG.USER_ID` correto
- [ ] App funciona normalmente

---

### Task 2.2: Teste de Build Script

**O que fazer:**
1. Exportar env vars localmente:
   ```bash
   export API_ENDPOINT="https://test.com/webhook/test"
   export USER_ID="test-user"
   export APP_NAME="Alfred Test"
   ```
2. Executar: `node scripts/inject-env.js`
3. Verificar `index.html` se placeholders foram substituídos
4. Restaurar `index.html` original

**Validação:**
- [ ] Script executa sem erros
- [ ] Placeholders substituídos corretamente
- [ ] HTML válido após substituição

---

## Fase 3: Deploy Vercel (30 min)

### Task 3.1: Deploy Projeto Ricardo

**O que fazer:**
1. Commit e push das mudanças:
   ```bash
   git add .
   git commit -m "feat: adiciona suporte multi-usuário via env vars"
   git push origin main
   ```

2. Deploy via CLI:
   ```bash
   vercel --prod
   # Nome do projeto: alfred-ricardo
   ```

3. Configurar env vars:
   ```bash
   vercel env add API_ENDPOINT production
   # Cole: https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-ricardo

   vercel env add USER_ID production
   # Digite: ricardo-nilton

   vercel env add APP_NAME production
   # Digite: Alfred
   ```

4. Redeploy para aplicar env vars:
   ```bash
   vercel --prod
   ```

**Validação:**
- [ ] Deploy bem-sucedido
- [ ] URL: `alfred-ricardo.vercel.app` funciona
- [ ] Console mostra ambiente: PRODUÇÃO
- [ ] `window.CONFIG.USER_ID` = "ricardo-nilton"

---

### Task 3.2: Deploy Projeto Dani

**O que fazer:**
1. Deploy via CLI (mesmo código, projeto diferente):
   ```bash
   vercel --prod
   # Nome do projeto: alfred-dani
   ```

2. Configurar env vars:
   ```bash
   vercel env add API_ENDPOINT production
   # Cole: https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-dani

   vercel env add USER_ID production
   # Digite: dani

   vercel env add APP_NAME production
   # Digite: Alfred
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

**Validação:**
- [ ] URL: `alfred-dani.vercel.app` funciona
- [ ] `window.CONFIG.USER_ID` = "dani"
- [ ] Independente do projeto Ricardo

---

### Task 3.3: Deploy Projeto Letícia

**Repetir Task 3.2 com:**
- Nome projeto: `alfred-leticia`
- USER_ID: `leticia`
- Webhook: `/webhook/alfred-leticia`

**Validação:**
- [ ] URL: `alfred-leticia.vercel.app` funciona
- [ ] `window.CONFIG.USER_ID` = "leticia"

---

### Task 3.4: Deploy Projeto Isabelle

**Repetir Task 3.2 com:**
- Nome projeto: `alfred-isabelle`
- USER_ID: `isabelle`
- Webhook: `/webhook/alfred-isabelle`

**Validação:**
- [ ] URL: `alfred-isabelle.vercel.app` funciona
- [ ] `window.CONFIG.USER_ID` = "isabelle"

---

## Fase 4: Configuração N8N (60 min)

### Task 4.1: Criar Workflow Ricardo

**O que fazer:**
1. Duplicar workflow atual do Ricardo
2. Renomear: "Alfred - Ricardo"
3. Atualizar webhook node:
   - Path: `/webhook/alfred-ricardo`
   - Method: POST
4. Configurar contexto profissional:
   - Gmail: conta empresarial
   - Google Calendar: agenda comercial
   - Supabase: tabelas de clientes
5. Testar com cURL:
   ```bash
   curl -X POST https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-ricardo \
     -H "Content-Type: application/json" \
     -d '{"message": "teste", "userId": "ricardo-nilton"}'
   ```

**Validação:**
- [ ] Workflow ativo
- [ ] Webhook responde
- [ ] Logs N8N mostram execução bem-sucedida
- [ ] App web recebe resposta correta

---

### Task 4.2: Criar Workflow Dani

**O que fazer:**
1. Criar workflow do zero ou duplicar template básico
2. Nome: "Alfred - Dani"
3. Webhook path: `/webhook/alfred-dani`
4. Configurar contexto pessoal:
   - Gmail: conta pessoal da Dani
   - Google Calendar: agenda pessoal
5. Testar

**Validação:**
- [ ] Workflow ativo
- [ ] Webhook responde
- [ ] Contexto correto (dados da Dani, não do Ricardo)

---

### Task 4.3: Criar Workflows Letícia e Isabelle

**Repetir Task 4.2 para cada uma:**
- Letícia: webhook `/webhook/alfred-leticia`, contexto escolar/pessoal
- Isabelle: webhook `/webhook/alfred-isabelle`, contexto escolar/pessoal

**Validação:**
- [ ] 4 workflows ativos no N8N
- [ ] Cada um com webhook único
- [ ] Contextos isolados

---

## Fase 5: Testes End-to-End (30 min)

### Task 5.1: Teste Completo por Usuário

Para cada usuário (Ricardo, Dani, Letícia, Isabelle):

**O que testar:**
1. Abrir URL específica (`alfred-{nome}.vercel.app`)
2. Verificar console:
   - Ambiente: PRODUÇÃO
   - User ID correto
3. Enviar mensagem de texto
4. Verificar resposta do N8N
5. Verificar histórico salvo no LocalStorage
6. Instalar PWA na tela inicial
7. Testar reconhecimento de voz

**Validação por usuário:**
- [ ] App carrega < 2s
- [ ] Configuração correta no console
- [ ] Mensagem enviada com sucesso
- [ ] Resposta recebida do workflow correto
- [ ] Histórico persiste após refresh
- [ ] PWA instalável
- [ ] Voz funciona (se suportado)

---

### Task 5.2: Teste de Isolamento

**O que testar:**
1. Abrir `alfred-ricardo.vercel.app` e enviar mensagem
2. Abrir `alfred-dani.vercel.app` e verificar:
   - Histórico está vazio (não herdou do Ricardo)
   - LocalStorage separado
3. Verificar logs N8N:
   - Workflow Ricardo executou
   - Workflow Dani não foi afetado

**Validação:**
- [ ] Dados não se misturam
- [ ] LocalStorage isolado por domínio
- [ ] Workflows independentes

---

### Task 5.3: Teste de Manutenção

**O que testar:**
1. Fazer pequena mudança no código (ex: cor de um botão)
2. Commit e push:
   ```bash
   git add .
   git commit -m "test: mudança visual para testar auto-deploy"
   git push origin main
   ```
3. Aguardar 2-3 minutos
4. Abrir as 4 URLs e verificar mudança aplicada

**Validação:**
- [ ] Mudança aparece em todos os 4 sites
- [ ] Deploy automático funcionou
- [ ] Zero intervenção manual

---

## Fase 6: Documentação (15 min)

### Task 6.1: Atualizar README.md

**Status:** ✅ JÁ FEITO

**Validação:**
- [x] Seção "Deploy Multi-usuário" adicionada
- [x] URLs documentadas
- [x] Estratégia de webhooks explicada
- [x] Versão atualizada para 1.3.0

---

### Task 6.2: Criar Guia para Família

**Arquivo:** `/docs/GUIA-USUARIOS.md` (NOVO)

**O que fazer:**
1. Criar guia simples para Dani, Letícia, Isabelle
2. Explicar como usar
3. Como instalar PWA
4. Troubleshooting básico

**Validação:**
- [ ] Guia criado
- [ ] Linguagem não-técnica
- [ ] Screenshots (se necessário)

---

## Fase 7: Handoff e Treinamento (30 min)

### Task 7.1: Configurar Celulares

Para cada pessoa da família:

**O que fazer:**
1. Abrir URL específica no Safari (iPhone)
2. Compartilhar → Adicionar à Tela de Início
3. Testar envio de mensagem
4. Ensinar uso básico:
   - Digitar mensagem
   - Usar microfone
   - Ver histórico (sidebar)

**Validação:**
- [ ] PWA instalado no celular de cada pessoa
- [ ] Testado envio de mensagem
- [ ] Pessoa sabe usar básico

---

### Task 7.2: Monitoramento Inicial

**O que fazer:**
1. Monitorar logs N8N primeiros 2-3 dias
2. Verificar erros no Vercel (painel)
3. Perguntar feedback da família
4. Ajustar conforme necessário

**Validação:**
- [ ] Logs N8N limpos (sem erros recorrentes)
- [ ] Vercel sem erros 500/502
- [ ] Família consegue usar sem dificuldade

---

## Checklist Final

### Código
- [ ] `js/config.js` criado e testado
- [ ] `index.html` atualizado com meta tags
- [ ] `scripts/inject-env.js` criado
- [ ] `vercel.json` atualizado
- [ ] `.gitignore` verificado
- [ ] Tudo commitado e pushado

### Deploy Vercel
- [ ] 4 projetos criados (ricardo, dani, leticia, isabelle)
- [ ] Env vars configuradas em cada projeto
- [ ] Todas URLs funcionando

### N8N
- [ ] 4 workflows criados e ativos
- [ ] Webhooks únicos configurados
- [ ] Contextos isolados (emails, agendas, etc)
- [ ] Testados via cURL

### Testes
- [ ] Teste local (dev) funcionando
- [ ] Teste produção (4 sites) funcionando
- [ ] Teste isolamento (dados não se misturam)
- [ ] Teste auto-deploy (mudança propaga)

### Documentação
- [ ] README.md atualizado
- [ ] MULTI-USER-SETUP.md criado
- [ ] Guia para usuários criado
- [ ] Versão bumped para 1.3.0

### Família
- [ ] PWAs instalados nos celulares
- [ ] Treinamento básico feito
- [ ] Primeiros testes bem-sucedidos

---

## Estimativa de Tempo Total

| Fase | Tempo | Status |
|------|-------|--------|
| 1. Preparação do Código | 30 min | ⏳ Pendente |
| 2. Testes Locais | 15 min | ⏳ Pendente |
| 3. Deploy Vercel | 30 min | ⏳ Pendente |
| 4. Configuração N8N | 60 min | ⏳ Pendente |
| 5. Testes E2E | 30 min | ⏳ Pendente |
| 6. Documentação | 15 min | ✅ Parcial |
| 7. Handoff | 30 min | ⏳ Pendente |
| **TOTAL** | **~3.5 horas** | **5% completo** |

---

## Próximos Passos

1. ✅ Documentação (README) → **CONCLUÍDO**
2. ⏳ Implementar mudanças no código (Fase 1)
3. ⏳ Testar localmente (Fase 2)
4. ⏳ Deploy na Vercel (Fase 3)

**Pronto para começar a implementação?** Execute Fase 1 quando estiver pronto.
