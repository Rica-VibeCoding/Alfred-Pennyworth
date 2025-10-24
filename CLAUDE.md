# Contexto do Projeto - Assistente Pessoal N8N

## Sobre o Desenvolvedor

**Nome:** Ricardo Nilton Borges

**Perfil:**
- Desenvolvedor full stack com visão empresarial
- Trabalha na área comercial (representante de indústrias moveleiras)
- Perfeccionista que valoriza verdade sobre incentivo
- Busca soluções práticas e diretas
- Sistema operacional: Windows 11
- Celular: iPhone 11

**Objetivo Pessoal:**
- Juntar 3 milhões de reais até 2027
- Usa tecnologia para otimizar processos comerciais
- Valoriza eficiência e autonomia

---

## Contexto do Projeto

### Problema Atual

Ricardo usa **N8N como assistente pessoal** (mordomo digital) que:
- Consulta emails
- Verifica agendas
- Acessa tabelas no Supabase com dados importantes
- Tem acesso ao Google Drive
- Gerencia todo ecossistema profissional/pessoal

**Problema:** Atualmente aciona via **WhatsApp**, dependendo de terceiros.

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

**Rejeitado:**
- NextJS (exagero, complexidade desnecessária)
- React/Vue (adiciona peso sem necessidade)
- Vite (build process desnecessário)

### Hospedagem: Vercel (Gratuito)

**Por quê:**
- Deploy automático via Git
- HTTPS gratuito (obrigatório para PWA)
- Zero configuração
- CDN global
- Simples e rápido

**Rejeitado:**
- Hostinger VPS (overkill para arquivos estáticos)
- Hostinger compartilhada (mais trabalhoso que Vercel)

### Comunicação: Webhook N8N

**Status:** N8N já está configurado e funcionando
**Método:** POST para webhook
**Resposta:** JSON estruturado

---

## Características do Projeto

### Minimalismo Funcional

**Filosofia:** Menos é mais
- Não tem 10 telas, é uma tela de chat
- Pouquíssimo código (< 300 linhas total estimado)
- Interface limpa, moderna, sem enfeites desnecessários
- Cada elemento tem propósito claro

### Mobile-First

**Foco principal:** iPhone 11 (Safari)
- Design responsivo
- Touch-friendly (botões 44px+)
- PWA instalável na tela inicial
- Funciona offline (interface)

### Performance Crítica

**Objetivo:** Carregamento instantâneo
- Bundle total < 100KB
- First Contentful Paint < 1s
- Time to Interactive < 2s
- Lighthouse Score > 90

---

## Funcionalidades V1 (MVP)

**Essenciais (P0):**
1. Envio de mensagem por texto
2. Envio de mensagem por voz (Speech Recognition API)
3. Exibição de mensagens estilo chat
4. Indicador de carregamento
5. Histórico de conversas (LocalStorage)
6. Design responsivo
7. Tratamento de erros

**Importantes (P1):**
8. PWA básico (instalável)

**Tudo mais é V2 (futuro).**

---

## Funcionalidades V2 (Evolução Futura)

**Não desenvolver agora, mas preparar estrutura:**
- Atalhos rápidos ("Agenda hoje", "Últimos emails")
- Respostas formatadas por tipo (agenda em cards, emails em lista)
- Favoritos/pins de respostas importantes
- Modo offline inteligente
- Sincronização multidevice (Supabase/Firebase)

**Preparação:**
- N8N já retorna campo `type` na resposta (V1 ignora, V2 usa)
- JSON de histórico estruturado para aceitar metadata futura
- CSS modular para adicionar novos componentes depois

---

## Estrutura de Arquivos

```
/
├── index.html              # Página única
├── css/
│   └── style.css           # Estilos (pode ser arquivo único)
├── js/
│   ├── app.js              # Lógica principal
│   ├── api.js              # Comunicação N8N
│   ├── storage.js          # LocalStorage
│   └── speech.js           # Reconhecimento de voz
├── manifest.json           # PWA config
├── sw.js                   # Service Worker
├── config.js               # Configurações (não versionar)
├── config.example.js       # Template de config
└── assets/
    └── icons/              # Ícones PWA (múltiplos tamanhos)
```

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

### Cores Principais

```css
--primary: #2563eb          /* Azul - ações */
--background: #ffffff       /* Fundo */
--surface: #f9fafb         /* Cards */
--text-primary: #111827     /* Texto */
--text-secondary: #6b7280   /* Secundário */
```

### Tipografia

**Fonte:** System stack (nativa do OS)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Componentes Principais

1. **Mensagem do usuário:** Azul, direita, cantos arredondados
2. **Mensagem do assistente:** Cinza claro, esquerda, cantos arredondados
3. **Input:** Barra inferior, auto-expand, microfone integrado
4. **Loading:** Três pontos animados
5. **Erro:** Banner vermelho claro no topo

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

1. Timeout de 30 segundos
2. Retry: 3 tentativas (1s, 3s, 5s)
3. Validar JSON de resposta
4. Tratar todos status codes (200, 400, 500, 503)

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

## Testes Necessários

### Funcionalidade

- [ ] Envia mensagem por texto
- [ ] Envia mensagem por voz
- [ ] Recebe e exibe resposta
- [ ] Histórico persiste
- [ ] Funciona offline (interface)
- [ ] PWA instala corretamente
- [ ] Erros são tratados

### Dispositivos

- [ ] iPhone 11 (Safari) - PRIORIDADE
- [ ] Android (Chrome)
- [ ] Desktop (Chrome, Safari)

### Performance

- [ ] Carrega < 2s
- [ ] Bundle < 100KB
- [ ] Lighthouse > 90

---

## Priorização Clara

**P0 (Fazer AGORA - V1):**
- Interface funcional
- Envio texto/voz
- Recebimento respostas
- Histórico
- PWA básico

**P1 (Nice to have - V1):**
- Estado vazio bonito
- Animações suaves

**P2+ (Futuro - V2):**
- Atalhos
- Formatação rica
- Sincronização
- Tudo mais

**Foco:** Fazer V1 funcionar perfeitamente antes de pensar em V2.

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

---

## Observações Importantes

### Voz para Texto

- Usar **Web Speech API** (nativa)
- Funciona no Safari iOS (iPhone 11)
- Precisa HTTPS
- Pedir permissão adequadamente
- Fallback: ocultar botão se não suportado

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

## Comandos Úteis

### Desenvolvimento Local

```bash
# Servidor local simples (Live Server, http-server, etc)
npx http-server -p 3000

# Ou Python
python -m http.server 3000
```

### Deploy Vercel

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel deploy

# Production
vercel --prod
```

---

## Checklist Final Antes de Entregar

### Funcionalidade

- [ ] Mensagem por texto funciona
- [ ] Mensagem por voz funciona
- [ ] Respostas aparecem corretamente
- [ ] Histórico salva e carrega
- [ ] Erros são tratados
- [ ] PWA é instalável

### Qualidade

- [ ] Código limpo e organizado
- [ ] Performance ótima (< 2s)
- [ ] Responsivo (mobile + desktop)
- [ ] Sem console.errors

### Deploy

- [ ] config.js não versionado
- [ ] config.example.js criado
- [ ] README atualizado com instruções
- [ ] Deploy na Vercel funcionando
- [ ] HTTPS ativo

### Testes

- [ ] Testado no iPhone 11
- [ ] Testado em Android
- [ ] Testado offline
- [ ] Testado com erro de rede

---

## Contexto Adicional: Filosofia do Projeto

### Por Que Este Projeto Existe

Ricardo quer **independência**. Usar WhatsApp para acionar N8N é:
- Depender de terceiro
- Interface não otimizada
- Sem personalização
- Pode mudar/quebrar a qualquer momento

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

### Plano de Execução

**Ver arquivo:** `PLANO-EXECUCAO.md` para roadmap completo com todas as fases detalhadas.

---

## Mindset para Desenvolvimento

### Perguntas a Fazer Sempre

1. **Isso é realmente necessário?** (Minimalismo)
2. **Isso deixa mais rápido ou mais lento?** (Performance)
3. **Isso adiciona dependência?** (Evitar)
4. **Isso funciona no iPhone 11?** (Prioridade)
5. **Isso é fácil de manter?** (Simplicidade)

### Princípios

- **Less is more:** Cada linha de código tem custo
- **Fast is better:** Usuário não espera
- **Simple is better:** Manutenção futura agradece
- **Working is better:** Funcional > bonito (mas queremos ambos)
- **Research-driven:** Toda decisão baseada em pesquisa

---

## Resumo Executivo (TL;DR)

**O que:** PWA de chat para acionar N8N via webhook

**Por que:** Independência, personalização, profissionalismo

**Como:** HTML+CSS+JS puro, deploy Vercel

**Quando:** V1 agora (simples), V2 depois (formatação rica)

**Onde:** iPhone 11 principalmente, mas funciona em tudo

**Prioridade:** Funcionalidade > Beleza (mas queremos ambos)

---

**Última atualização:** Outubro 23, 2025
**Versão:** 1.0
**Status:** Pronto para desenvolvimento