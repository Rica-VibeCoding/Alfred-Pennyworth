# Contexto do Projeto - Assistente Pessoal N8N

## Sobre o Desenvolvedor

**Nome:** Ricardo Nilton Borges

**Perfil:**
- Desenvolvedor full stack com visão empresarial
- Trabalha na área comercial (representante de indústrias moveleiras)
- Busca soluções práticas e diretas
- Sistema operacional: Windows 11
- Celular: iPhone 11

---

## Estrutura de Arquivos (Atual)

```
/
├── index.html              # Página principal
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker v1.3.0 (com bypass N8N para iOS)
├── config.js               # Config webhook (modo TESTE)
├── config-production.backup.js  # Backup config produção
├── package.json            # Scripts NPM e dependências
├── DEV-LOCAL.md            # Documentação desenvolvimento local
├── css/
│   ├── style.css          # Estilos principais
│   └── cards.css          # Estilos cards formatados
├── js/
│   ├── app.js             # Lógica principal e UI
│   ├── api.js             # Comunicação N8N
│   ├── speech.js          # Reconhecimento de voz
│   ├── storage-v2.js      # LocalStorage V2 (sessões múltiplas)
│   ├── sidebar.js         # Controle sidebar e histórico
│   └── cards.js           # Renderização cards formatados
└── assets/icons/          # Ícones PWA
```

**Ordem de carregamento scripts:**
1. config.js → 2. storage-v2.js → 3. api.js → 4. speech.js → 5. sidebar.js → 6. cards.js → 7. app.js

**Scripts NPM disponíveis:**
- `npm run dev` - Servidor local (modo TESTE)
- `npm run start` - Alias para dev
- `npm run prod` - Servidor com config PRODUÇÃO

---

## Desenvolvimento Local

### Setup Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Rodar servidor
npm run dev

# 3. Abrir navegador
http://127.0.0.1:5500  (⚠️ NÃO use localhost - CORS só aceita 127.0.0.1)
```

### ⚠️ Regra Importante

**NUNCA abra index.html direto (protocolo file://)** - Causa erros:
- ❌ CORS bloqueado
- ❌ Service Worker não funciona
- ❌ PWA não instala

**SEMPRE use servidor HTTP** (`npm run dev` ou `npx serve`)

### Documentação Completa

Consulte [DEV-LOCAL.md](./DEV-LOCAL.md) para:
- Troubleshooting completo
- Estrutura de arquivos detalhada
- Cache strategy
- Changelog

---
## Contexto do Projeto

### Problema Atual

Ricardo usa **N8N como assistente pessoal** (mordomo digital) que:
- Consulta emails
- Verifica agendas
- Acessa tabelas no Supabase com dados importantes
- Tem acesso ao Google Drive
- Gerencia todo ecossistema profissional/pessoal


### Solução Proposta

Criar **interface web própria** (PWA) para acionar N8N via webhook, sem depender de WhatsApp ou outros apps de terceiros.

**Benefícios:**
- Independência total
- Interface personalizada
- Mais rápido e direto
- Profissional
- Controle total

---

## Decisões Técnicas Tomadas

### Stack: HTML + CSS + JavaScript Puro

**Por quê:**
- Performance máxima (< 100KB, carrega < 1s)
- Zero dependências
- Simplicidade absoluta
- Fácil manutenção
- PWA nativo funciona perfeitamente
- Projeto pequeno e focado (não precisa de framework)

### Hospedagem: Vercel (Gratuito)

**Por quê:**
- Deploy automático via Git
- HTTPS gratuito (obrigatório para PWA)
- Zero configuração
- CDN global
- Simples e rápido

### Comunicação: Webhook N8N

**Status:** N8N configurado e funcionando
**Método:** POST para webhook configurado em `config.js`
**Resposta:** JSON estruturado

**Configuração Atual (config.js):**
- **Modo:** TESTE (webhook-test)
- **USER_ID:** ricardo-dev
- **TIMEOUT:** 120000ms (2 minutos) - workflows complexos com múltiplas APIs externas
- **RETRY_ATTEMPTS:** 3 tentativas com delays progressivos

**URLs dos Webhooks:**
- **Produção:** `https://n8n-n8n.l1huim.easypanel.host/webhook/0c689264-8178-477c-a366-66559b14cf16`
- **Teste:** `https://n8n-n8n.l1huim.easypanel.host/webhook-test/0c689264-8178-477c-a366-66559b14cf16`

**Trocar para produção:**
```bash
cp config-production.backup.js config.js
```

---

## Características do Projeto

### Minimalismo Funcional

**Filosofia:** Menos é mais
- uma tela de chat + side bar pequena
- Pouquíssimo código (< 1000 linhas total estimado)
- Interface limpa, moderna, sem enfeites desnecessários
- Cada elemento tem propósito claro
- ui com influencia do chat da https://www.perplexity.ai/

### Mobile-First

**Foco principal:** iPhone 11 (Safari)
- Design responsivo
- Touch-friendly (botões 44px+)
- PWA instalável na tela inicial
- Funciona offline (interface)

---

## Funcionalidades Implementadas (V1.3 - Produção)

**Core (✅ Completo):**
1. ✅ Envio de mensagem por texto e voz (Speech Recognition API)
2. ✅ Sistema de sessões múltiplas (Storage V2)
3. ✅ Sidebar com histórico organizado (Hoje, Ontem, 7 dias, Antigas)
4. ✅ Ícones contextuais automáticos (email, agenda, cliente, relatório)
5. ✅ Botão "Nova conversa" no header
6. ✅ Tratamento robusto de erros com retry
7. ✅ Timeout visual de 2 minutos (libera UI mesmo se servidor não responder)
8. ✅ PWA completo (instalável, offline-first)
9. ✅ Limpeza automática de sessões antigas (> 7 dias)
10. ✅ Limite de 20 sessões máximas

**Características Técnicas:**
- Storage V2 com migração automática de V1
- Service Worker com bypass para N8N (workaround iOS Safari)
- Retry automático (3 tentativas) em erros de rede
- Sanitização de input e validação de resposta

## Funcionalidades Planejadas (V2)

**Futuro:**
- Atalhos rápidos customizáveis
- Respostas formatadas por tipo (cards, listas)
- Favoritos/pins de mensagens
- Sincronização multidevice (Supabase)
- Dark mode
- Push notifications (quando iOS suportar)

---

## Integrações

### N8N Webhook

**Endpoint:** Configurável em `config.js`
**Request:**
```json
{
  "message": "texto do usuário",
  "userId": "ricardo-nilton",
  "timestamp": "2025-10-23T14:30:00.000Z",
  "source": "web-assistant"
}
```

**Response:**
```json
{
  "success": true,
  "response": "texto da resposta",
  "type": "generic",
  "timestamp": "2025-10-23T14:30:02.000Z",
  "metadata": {}
}
```

### LocalStorage

**Dados salvos:**
- Histórico completo de conversas
- Configurações do usuário
- Session ID

**Limpeza:** Automática (últimos 30 dias)

---

## Design System

### Cores Principais (Implementadas)

```css
--primary: #14b8a6          /* Teal - ações */
--background: #ffffff       /* Fundo */
--surface: #f9fafb         /* Cards */
--text-primary: #111827     /* Texto */
--text-secondary: #6b7280   /* Secundário */
--message-sent-bg: #f3f4f6         /* Cinza claro */
--message-received-bg: #d1fae5     /* Verde claro */
--sidebar-bg: #fafafa       /* Sidebar */
```

### Tipografia

**Fonte:** System stack (nativa do OS)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Componentes Principais (Implementados)

1. **Header:** Botão menu (sidebar), título "Alfred", status conexão, botão nova conversa
2. **Sidebar:** Histórico de sessões com ícones contextuais, agrupamento temporal
3. **Mensagem do usuário:** Cinza claro, direita, cantos arredondados
4. **Mensagem do assistente:** Verde claro, esquerda, cantos arredondados
5. **Input:** Barra inferior, auto-expand, microfone integrado, botão enviar
6. **Loading:** Três pontos animados (verde)
7. **Erro:** Banner vermelho claro no topo com botão fechar
8. **Retry:** Botão "Tentar novamente" em mensagens de erro
9. **Empty State:** Saudação inicial quando não há mensagens

### Inspirações Visuais

- ChatGPT (limpeza, espaçamentos)
- Linear (minimalismo, tipografia)
- Telegram (eficiência, rapidez)

**Resultado:** Moderno, profissional, sem parecer "antigo"

---

## Comportamento Esperado

### Fluxo Normal

1. Usuário digita ou fala mensagem
2. Mensagem aparece instantaneamente na tela (alinhada à direita)
3. Loading indicator aparece (três pontos)
4. POST enviado ao webhook N8N
5. Resposta chega
6. Loading desaparece
7. Resposta aparece na tela (alinhada à esquerda)
8. Tudo salvo no LocalStorage

### Tratamento de Erros

- **Sem conexão:** Banner claro "Você está offline"
- **Timeout:** "Demorou muito, tente novamente"
- **Erro N8N:** Mostra mensagem do erro
- **Permissão microfone:** Solicita e explica

### PWA

- **Online:** Funciona normalmente
- **Offline:** Interface carrega, mas não envia mensagens
- **Instalação:** Prompt nativo do navegador
- **Ícone:** Na tela inicial, abre sem barra

---

## Validações Importantes

### Frontend

1. Mensagem não pode estar vazia (após trim)
2. Máximo 2000 caracteres
3. Debounce de 500ms entre envios
4. Desabilitar envio durante processamento
5. Verificar navigator.onLine antes de enviar

### API

1. Timeout de 120 segundos (2 minutos) - workflows N8N complexos
2. Timeout visual de 120 segundos (libera UI independente da API)
3. Retry: 3 tentativas (1s, 3s, 5s) apenas para erros 5xx e rede
4. Validar JSON de resposta e normalizar formatos diferentes
5. Tratar todos status codes (200, 400, 500, 503)
6. Sanitização de input (remove caracteres invisíveis)

---

## Segurança

### Não Fazer

- ❌ Hardcoded webhook URL (usar config.js)
- ❌ Guardar dados sensíveis em LocalStorage
- ❌ Permitir múltiplos envios simultâneos
- ❌ Confiar cegamente na resposta da API

### Fazer

- ✅ Sanitizar input antes de enviar
- ✅ Validar resposta JSON
- ✅ Rate limiting (debounce)
- ✅ HTTPS obrigatório
- ✅ Timeout em requisições

---

## Priorização Clara

**P2+ (Futuro - V2):**
- Atalhos
- Formatação rica
- Sincronização
- Tudo mais

**Foco:** pensar em V2.

---

## Expectativas de Qualidade

### O que Ricardo valoriza:

1. **Sinceridade:** Se algo não está bom, diga
2. **Objetividade:** Direto ao ponto, sem enrolação
3. **Funcionalidade:** Tem que funcionar, não só parecer bonito
4. **Simplicidade:** Código limpo, fácil de entender
5. **Performance:** Rápido é não-negociável
6. **Relatórios objetivos:** Diagnóstico direto, sem exemplos de código desnecessários

### O que Ricardo NÃO quer:

1. Código complexo desnecessário
2. "Gambiarras" que funcionam por acaso
3. Soluções que dependem de terceiros
4. Excesso de comentários explicando óbvio
5. Frameworks sem justificativa
6. Relatórios verbosos com blocos de código quando não solicitados

 ### Comunicação efetiva:

  1. **Diagnóstico primeiro:** Identifique o problema, causa e solução
  2. **Seja direto:** Sem introduções longas ou contexto desnecessário
  3. **Código sob demanda:** Mostre código só se for pedido ou absolutamente necessário
  4. **Linguagem clara:** Técnico quando preciso, simples quando possível
  5. **Ação sobre teoria:** O que fazer > por que fazer (a menos que perguntado)

  ### O que funciona:

  - Relatórios tipo: "3 erros encontrados em X, Y, Z. Causa: A. Solução: B."
  - Respostas que terminam com próximo passo claro
  - Explicações técnicas quando há trade-offs a decidir

  ### O que não funciona:

  - Blocos de código não solicitados
  - Explicações que repetem o óbvio
  - Relatórios que "contam uma história"

---

## Observações Importantes

### LocalStorage

- Limite ~5-10MB (suficiente para texto)
- Limpar automaticamente dados > 30 dias
- Formato: JSON estruturado
- Não sincroniza entre dispositivos (V1)

### Service Worker

- Cacheia assets estáticos
- Network-first para API
- Permite funcionar offline (interface)
- Atualiza automaticamente

---

## Documentação Relacionada

**Leia TODOS estes documentos antes de começar:**

1. **README.md** - Visão geral
2. **ARCHITECTURE.md** - Como funciona
3. **DESIGN-SYSTEM.md** - Como deve parecer
4. **API-CONTRACT.md** - Como comunicar com N8N
5. **FEATURES.md** - O que desenvolver
6. **PWA-CONFIG.md** - Como configurar PWA

**Ordem de leitura:** INDEX.md tem o guia completo.

---

## Contexto Adicional: Filosofia do Projeto

Solução própria é **ativo dele**. Controla, melhora quando quer, integra o que precisar.

### O Que Torna Este Projeto Especial

Não é apenas "um chat". É uma **ferramenta de produtividade empresarial** disfarçada de chat simples.

Ricardo usa isso para:
- Consultar agenda rapidamente
- Verificar emails importantes
- Acessar dados de clientes
- Gerenciar processos comerciais

Simplicidade na interface, poder nos bastidores.

---

## Metodologia de Desenvolvimento

### Abordagem Iterativa e Consultiva

**IMPORTANTE: Não desenvolver tudo de uma vez.** Seguir desenvolvimento fase por fase com validação constante.

**Processo para cada fase:**

1. **Pesquisa primeiro:**
   - Benchmarking de interfaces modernas (ChatGPT, Claude Code, WhatsApp)
   - Melhores práticas 2025 (GitHub, Reddit, Dev.to, Web.dev)
   - Documentação oficial (MDN)
   - Análise de prós/contras de cada abordagem

2. **Documentar a fase:**
   - Criar documento explicando o que será feito
   - Apresentar 2-3 opções com justificativas
   - Incluir referências visuais e exemplos de código

3. **Decisão conjunta:**
   - Apresentar opções ao Ricardo
   - Explicar trade-offs de cada escolha
   - Decidir melhor caminho baseado em pesquisa

4. **Implementação:**
   - Código limpo e testado
   - Seguir padrões estabelecidos
   - Comentários apenas quando necessário

5. **Teste e validação:**
   - Testar em navegador
   - Validar no iPhone 11 (prioridade)
   - Confirmar antes de próxima fase

### Fontes de Pesquisa Prioritárias

- **GitHub:** Repos populares de chat interfaces (2024-2025)
- **Web.dev:** Google best practices
- **MDN:** Documentação técnica oficial
- **Communities:** Reddit r/webdev, Dev.to posts recentes
- **Benchmarks:** ChatGPT, Claude Code, WhatsApp Web, Telegram Web
- **Foco temporal:** Práticas de 2025 ou 2024 validadas

--

## Resumo Executivo (TL;DR)

**O que:** PWA de chat para acionar N8N via webhook

**Por que:** Independência, personalização, profissionalismo

**Como:** HTML+CSS+JS puro, deploy Vercel

**Quando:** V1 agora (simples), V2 depois (formatação rica)

**Onde:** iPhone 11 principalmente, mas funciona em tudo

**Prioridade:** Funcionalidade > Beleza (mas queremos ambos)

