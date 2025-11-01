# Alfred - Assistente Pessoal N8N

Interface web PWA minimalista para acionar workflows N8N via webhook, permitindo interação por texto e voz.

## Sobre o Projeto

Alfred é um assistente pessoal que se conecta ao N8N para consultar emails, gerenciar agenda, acessar dados do Supabase e automatizar processos. Esta interface web substitui a dependência de WhatsApp ou outros apps de terceiros, oferecendo controle total e experiência otimizada.

**Suporte Multi-usuário**: Este projeto foi projetado para ser facilmente replicado para múltiplos usuários (família, equipe) mantendo um único código-fonte centralizado. Cada pessoa tem seu próprio PWA independente com URL personalizada.

### Características

- **Zero dependências**: HTML, CSS e JavaScript puro
- **Performance máxima**: Bundle < 40KB, carregamento < 2s
- **PWA completo**: Instalável na tela inicial (iOS/Android)
- **Multi-usuário**: 1 código → múltiplos deployments independentes
- **Offline-first**: Interface funciona sem conexão
- **Mobile-first**: Otimizado para iPhone 11 Safari
- **Reconhecimento de voz**: Web Speech API nativa
- **Histórico local**: Conversas salvas no LocalStorage

## Stack Técnico

- **Frontend**: HTML5 + CSS3 + JavaScript ES6+ (Vanilla)
- **PWA**: Service Worker + Manifest.json
- **Hospedagem**: Vercel (CDN global + HTTPS gratuito)
- **API**: N8N Webhook (POST)
- **Armazenamento**: LocalStorage (histórico de conversas)

## Estrutura do Projeto

```
/
├── index.html              # Página principal
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker (com bypass N8N)
├── vercel.json             # Configuração Vercel
├── config.example.js       # Template de configuração
├── config.js               # Configuração atual (gitignored)
├── css/
│   └── style.css          # Estilos completos
├── js/
│   ├── app.js             # Lógica principal e UI
│   ├── api.js             # Comunicação N8N
│   ├── speech.js          # Reconhecimento de voz
│   ├── storage-v2.js      # LocalStorage V2 (sessões múltiplas)
│   └── sidebar.js         # Controle sidebar e histórico
└── assets/
    └── icons/             # Ícones PWA (múltiplos tamanhos)
```

**Bundle Total**: ~40KB (HTML+CSS+JS, sem config e ícones)

## Instalação Local

### Pré-requisitos

- Node.js v16+ (recomendado: v22.21.0)
- npm ou pnpm
- Navegador moderno com suporte a Service Worker

### Setup Rápido (Recomendado)

```bash
# 1. Clonar repositório
git clone https://github.com/Rica-VibeCoding/Alfred-Pennyworth.git
cd alfred-pennyworth

# 2. Instalar dependências
npm install

# 3. Rodar servidor local
npm run dev

# 4. Abrir navegador
# http://127.0.0.1:5500 (NÃO use localhost - problema CORS)
```

**✅ Pronto!** A aplicação roda em modo desenvolvimento (webhook de teste).

📖 **Documentação completa:** Veja [DEV-LOCAL.md](./DEV-LOCAL.md) para mais detalhes.

---

### Passo 1: Configurar Webhook N8N

**Desenvolvimento (Padrão):**
O projeto já vem configurado com webhook de teste em `config.js`.

**Produção:**
Para usar seu próprio webhook N8N, edite `config.js`:

```javascript
const CONFIG = {
  API_ENDPOINT: 'https://seu-n8n.com/webhook/seu-id',
  APP_NAME: 'Alfred',
  USER_ID: 'seu-nome',
  TIMEOUT: 120000, // 2 minutos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAYS: [1000, 3000, 5000]
};
```

### Passo 2: Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor local (modo TESTE) |
| `npm run start` | Alias para `dev` |
| `npm run prod` | Servidor com config PRODUÇÃO |

### Passo 3: Ícones PWA

✅ **Ícones já incluídos** no projeto em `/assets/icons/`.

Se precisar regenerar:

```bash
cd assets/icons
node generate-icons-cli.js
```

**Ícones incluídos:**
- icon-32x32.png (favicon)
- icon-72x72.png, icon-96x96.png, icon-128x128.png, icon-144x144.png
- icon-152x152.png, icon-180x180.png (Apple)
- icon-192x192.png, icon-384x384.png, icon-512x512.png (Android)

### ⚠️ Importante: Nunca Abra index.html Direto

**❌ Não funciona:**
```bash
# Duplo clique em index.html (protocolo file://)
# Causa erros CORS e Service Worker não funciona
```

**✅ Sempre use servidor HTTP:**
```bash
npm run dev
# ou
npx serve -p 5500
```

## Deploy na Vercel

### Deploy Multi-usuário (Recomendado)

Este projeto suporta **múltiplos usuários independentes** usando **1 repositório + múltiplos projetos Vercel**.

**Como funciona:**
- 1 código-fonte centralizado (manutenção única)
- Cada pessoa tem seu próprio projeto Vercel com URL personalizada
- Cada projeto usa variáveis de ambiente diferentes (webhook, userId, etc)
- Atualização do código: 1 `git push` → todos os sites atualizam automaticamente

**Usuários configurados:**
- 👨‍💼 **Ricardo** → `alfred-ricardo.vercel.app`
- 👩 **Dani** → `alfred-dani.vercel.app`
- 👧 **Letícia** → `alfred-leticia.vercel.app`
- 👧 **Isabelle** → `alfred-isabelle.vercel.app`

### Passo 1: Setup Inicial (uma vez)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login
```

### Passo 2: Deploy para cada usuário

Crie um projeto separado para cada pessoa:

#### Deploy Ricardo

```bash
# No diretório do projeto
vercel --prod

# Durante o wizard:
# - Project Name: alfred-ricardo
# - Link to existing: No
```

Depois configure as variáveis de ambiente:

```bash
vercel env add API_ENDPOINT production
# Cole: https://seu-n8n.com/webhook/ricardo

vercel env add USER_ID production
# Digite: ricardo-nilton

vercel env add APP_NAME production
# Digite: Alfred
```

#### Deploy Dani

Repita o processo mudando apenas o nome do projeto e as variáveis:

```bash
vercel --prod
# Project Name: alfred-dani

vercel env add API_ENDPOINT production
# Cole: https://seu-n8n.com/webhook/dani

vercel env add USER_ID production
# Digite: dani

vercel env add APP_NAME production
# Digite: Alfred
```

#### Deploy Letícia e Isabelle

Repita o mesmo processo:
- **Letícia**: `alfred-leticia`, webhook `/leticia`, userId `leticia`
- **Isabelle**: `alfred-isabelle`, webhook `/isabelle`, userId `isabelle`

### Passo 3: Configuração N8N (Webhooks)

Você tem 2 opções para organizar os workflows N8N:

#### Opção A: Workflows Separados (RECOMENDADO)

Crie 1 workflow independente para cada pessoa:

```
📁 N8N Workflows:
├── 🔵 Alfred - Ricardo (webhook: /ricardo)
├── 🟢 Alfred - Dani (webhook: /dani)
├── 🟡 Alfred - Letícia (webhook: /leticia)
└── 🟣 Alfred - Isabelle (webhook: /isabelle)
```

**Vantagens:**
- ✅ Isolamento total (dados não se misturam)
- ✅ Permissões independentes (cada um acessa seus próprios recursos)
- ✅ Debug mais fácil (logs separados)
- ✅ Personalização individual (lógica diferente por usuário)
- ✅ Escalável (adicionar novos usuários sem afetar existentes)

**Quando usar:** Contextos diferentes (ex: profissional vs pessoal), permissões diferentes

#### Opção B: Workflow Único com Roteamento

Use 1 workflow principal que roteia baseado no `userId`:

```
📁 N8N Workflow:
└── 🔵 Alfred - Router (webhook: /alfred)
    ├── Switch (baseado em userId)
    ├──── ricardo → Fluxo Ricardo
    ├──── dani → Fluxo Dani
    ├──── leticia → Fluxo Letícia
    └──── isabelle → Fluxo Isabelle
```

**Vantagens:**
- ✅ Código compartilhado (DRY)
- ✅ Manutenção centralizada
- ✅ Lógica comum reutilizada

**Desvantagens:**
- ❌ Complexidade adicional
- ❌ Risco de dados se misturarem
- ❌ Debug mais difícil

**Quando usar:** Lógica idêntica entre usuários, contextos similares

### Exemplo de Estrutura de Webhooks (Opção A)

```bash
# Ricardo (Profissional)
https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-ricardo

# Dani (Pessoal)
https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-dani

# Letícia (Pessoal)
https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-leticia

# Isabelle (Pessoal)
https://n8n-n8n.l1huim.easypanel.host/webhook/alfred-isabelle
```

### Manutenção Contínua

Após o setup inicial, a manutenção é **zero esforço**:

1. Desenvolva mudanças localmente
2. Teste
3. `git push origin main`
4. **Todos os 4 sites atualizam automaticamente** 🎉

Não precisa:
- ❌ Abrir 4 projetos diferentes
- ❌ Fazer deploy manual 4 vezes
- ❌ Sincronizar código entre repositórios
- ❌ Gerenciar branches

### URLs Finais

Após deploy, cada pessoa terá sua própria URL:

- Ricardo: `https://alfred-ricardo.vercel.app`
- Dani: `https://alfred-dani.vercel.app`
- Letícia: `https://alfred-leticia.vercel.app`
- Isabelle: `https://alfred-isabelle.vercel.app`

Cada uma pode instalar seu próprio PWA na tela inicial do celular!

### Método Alternativo: Git Integration (Automático)

Se preferir deploy automático via GitHub:

1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Import Project" **4 vezes** (1 para cada pessoa)
4. Para cada projeto:
   - Selecione o mesmo repositório
   - Mude o nome do projeto (`alfred-ricardo`, `alfred-dani`, etc)
   - Configure variáveis de ambiente no painel
5. Deploy automático a cada `git push`!

### Variáveis de Ambiente por Projeto

Cada projeto Vercel deve ter estas variáveis configuradas:

| Variável | Ricardo | Dani | Letícia | Isabelle |
|----------|---------|------|---------|----------|
| `API_ENDPOINT` | `https://...webhook/alfred-ricardo` | `https://...webhook/alfred-dani` | `https://...webhook/alfred-leticia` | `https://...webhook/alfred-isabelle` |
| `USER_ID` | `ricardo-nilton` | `dani` | `leticia` | `isabelle` |
| `APP_NAME` | `Alfred` | `Alfred` | `Alfred` | `Alfred` |

**Importante**: Não commite `config.js` (já está no `.gitignore`)

## Uso

### Interface Web

1. Acesse a URL do deploy
2. Digite mensagem ou clique no microfone
3. Aguarde resposta do N8N
4. Histórico é salvo automaticamente

### Instalação PWA

#### iPhone/iPad (Safari)

1. Abra o site no Safari
2. Toque no botão "Compartilhar"
3. Role e toque em "Adicionar à Tela de Início"
4. Confirme o nome "Alfred"

#### Android (Chrome)

1. Abra o site no Chrome
2. Toque nos três pontos (menu)
3. Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"

#### Desktop (Chrome/Edge)

1. Abra o site
2. Clique no ícone de instalação na barra de endereço
3. Ou vá em Menu > Instalar Alfred

## API Contract (N8N)

### Request (POST ao webhook)

```json
{
  "message": "Qual minha agenda hoje?",
  "userId": "ricardo-nilton",
  "timestamp": "2025-10-24T14:30:00.000Z",
  "source": "web-assistant"
}
```

### Response (JSON do N8N)

```json
{
  "success": true,
  "response": "Você tem 3 reuniões hoje...",
  "type": "generic",
  "timestamp": "2025-10-24T14:30:02.000Z",
  "metadata": {}
}
```

**Campos opcionais**:
- `type`: Pode ser usado para formatação futura (V2)
- `metadata`: Dados adicionais para UI rica (V2)

## Performance

### Metrics Alcançados

- **Bundle Size**: ~36KB (100% dentro do target < 100KB)
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Lighthouse PWA Score**: > 90 (esperado)
- **Offline Support**: Interface completa

### Otimizações Implementadas

1. **Zero frameworks**: Apenas código nativo
2. **Cache inteligente**: Service Worker com estratégias adequadas
3. **Lazy loading**: Recursos carregados sob demanda
4. **CSS inline crítico**: Reduz render-blocking
5. **Compressão**: Vercel entrega Gzip/Brotli automaticamente

## Cache Strategy

### Static Cache (Cache-first)

- HTML, CSS, JavaScript
- Manifest.json
- Ícones PWA

### Network-first

- Chamadas API (N8N webhook)
- Navegação

### Runtime Cache

- Imagens e fontes (7 dias)
- Limite de 50 itens

## Offline Behavior

- **Interface**: Funciona completamente offline
- **Histórico**: Acessível offline
- **Envio de mensagens**: Requer conexão (mostra banner de offline)
- **Service Worker**: Atualiza automaticamente em background

## Tratamento de Erros Avançado

O sistema implementa tratamento robusto de erros para garantir que a interface nunca fique travada:

### Timeout Duplo (API + Visual)
- **Timeout API:** 120 segundos (2 minutos) - N8N workflows complexos com múltiplas APIs
- **Timeout Visual:** 120 segundos - libera UI mesmo se API não responder
- **Retry automático:** 3 tentativas (1s, 3s, 5s) apenas para erros 5xx e rede
- **Erros 4xx:** Não fazem retry (bad request, not found, etc)

### Botão "Tentar Novamente"
- Mensagens de erro exibem botão "↻ Tentar novamente"
- Um clique reenvia automaticamente a última mensagem que falhou
- Não precisa digitar novamente ou fechar o app

### Estado Sempre Recuperável
- Após qualquer erro, a interface é imediatamente liberada
- Usuário pode:
  - Tentar novamente a mensagem que falhou (botão retry)
  - Enviar uma nova mensagem diferente
  - Continuar usando o app normalmente
- **Nunca** é necessário fechar e abrir o app

### Tipos de Erro Tratados
- **Timeout API**: Servidor não responde em 120s (2min) após 3 retries
- **Timeout Visual**: Libera UI após 120s independente do status da API
- **Offline**: Sem conexão à internet (detectado antes de enviar)
- **Erro HTTP 4xx**: Erro de cliente (não faz retry)
- **Erro HTTP 5xx**: Erro de servidor (faz retry automático)
- **Erro N8N**: Workflow com problema interno (resposta com success: false)

## Troubleshooting

### PWA não instala no iPhone

- Verifique se está usando HTTPS
- Confirme que todos os ícones foram gerados
- Teste no Safari (não Chrome iOS)
- Valide `manifest.json` em [Web Manifest Validator](https://manifest-validator.appspot.com/)

### Speech Recognition não funciona

- HTTPS é obrigatório
- Só funciona em navegadores compatíveis (Chrome Desktop, Safari iOS)
- Verifique permissões do microfone
- Teste em navegador privado (permissões limpas)

### N8N não responde

- Verifique `config.js` está correto
- Confirme webhook N8N está ativo
- Teste webhook diretamente com cURL:
```bash
curl -X POST https://seu-n8n.com/webhook/id \
  -H "Content-Type: application/json" \
  -d '{"message": "teste", "userId": "teste"}'
```

### Service Worker não atualiza

- Abra DevTools > Application > Service Workers
- Clique em "Unregister"
- Recarregue a página (Ctrl+Shift+R / Cmd+Shift+R)

### Histórico não salva

- Verifique LocalStorage não está cheio (limite ~5-10MB)
- Confirme navegador não está em modo privado
- Limpe dados antigos: DevTools > Application > Local Storage

## Segurança

### Implementado

- ✅ HTTPS obrigatório
- ✅ Sanitização de input
- ✅ Validação de JSON response
- ✅ Rate limiting (debounce 500ms)
- ✅ Timeout de 120s (2 min) em requisições
- ✅ Config.js não versionado
- ✅ CORS configurado no N8N

### Recomendações

- Não exponha webhook N8N publicamente sem autenticação
- Use secrets do N8N para validar origem
- Implemente rate limiting no N8N (proteção DDoS)
- Monitore logs de webhook para comportamento suspeito

## Testes

### Funcionalidades

- [ ] Envio de mensagem por texto
- [ ] Envio de mensagem por voz
- [ ] Recebimento e exibição de respostas
- [ ] Histórico persiste após refresh
- [ ] Tratamento de erros (sem conexão, timeout, erro API)
- [ ] PWA instalável em iOS
- [ ] PWA instalável em Android
- [ ] Funciona offline (interface)

### Dispositivos

- [ ] iPhone 11 Safari (PRIORIDADE)
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Edge

### Performance

- [ ] Lighthouse Performance > 90
- [ ] Lighthouse PWA > 90
- [ ] Lighthouse Accessibility > 90
- [ ] First Paint < 1s
- [ ] Interactive < 2s
- [ ] Bundle < 100KB

## Sistema de Sessões (V2)

O Alfred organiza conversas em **sessões múltiplas** com histórico separado e persistente.

### Como Funciona

- **Nova sessão:** Botão "+" no header cria conversa limpa
- **Trocar sessão:** Botão "☰" abre sidebar com histórico completo
- **Título automático:** Primeiros 40 caracteres da primeira mensagem do usuário
- **Agrupamento temporal automático:**
  - Hoje (conversas de hoje)
  - Ontem (conversas de ontem)
  - Últimos 7 dias
  - Mais antigas

### Limites e Limpeza

- **Máximo:** 20 sessões salvas simultaneamente
- **Idade máxima:** 7 dias (sessões antigas removidas automaticamente)
- **Limpeza manual:** Botão "Limpar antigas" na sidebar
- **Proteção:** Sessão atual nunca é removida

### Armazenamento (Storage V2)

- **LocalStorage key:** `alfred_sessions` (estrutura V2)
- **Migração automática:** Dados V1 (`alfred_data`) convertidos automaticamente para V2
- **Backup preservado:** `alfred_data_v1_backup` mantido após migração
- **Cada sessão contém:**
  - ID único (UUID)
  - Título (gerado da primeira mensagem)
  - Array de mensagens com timestamps
  - createdAt e updatedAt

### Ícones Contextuais Automáticos

Detectados pela primeira mensagem da sessão:
- 📧 Email (palavras-chave: "email", "e-mail")
- 📅 Agenda (palavras-chave: "agenda", "calendário", "reunião")
- 👤 Cliente (palavras-chave: "cliente", "contato")
- 📊 Relatório (palavras-chave: "relatório", "análise", "dados")
- 💬 Padrão (outras conversas)

---

## Roadmap

### V1.3 (✅ Concluído - Em Produção)

**Interface & UX:**
- ✅ Interface de chat responsiva e moderna
- ✅ Envio por texto e voz (Speech Recognition API)
- ✅ Sistema de sessões múltiplas (Storage V2)
- ✅ Sidebar com histórico completo
- ✅ Agrupamento temporal automático (Hoje, Ontem, 7 dias, Antigas)
- ✅ Ícones contextuais automáticos
- ✅ Empty state e transições suaves

**Funcionalidades:**
- ✅ PWA completo (instalável, offline-first)
- ✅ Tratamento robusto de erros com retry
- ✅ Timeout duplo (API 120s + Visual 120s)
- ✅ Botão "Tentar novamente" em erros
- ✅ Estado sempre recuperável (nunca trava)
- ✅ Limpeza automática de sessões antigas (> 7 dias)
- ✅ Limite de 20 sessões máximas

**Deploy:**
- ✅ Multi-usuário (1 código → N sites independentes)
- ✅ Variáveis de ambiente por projeto (Vercel)
- ✅ Deploy automático via Git

**Técnico:**
- ✅ Service Worker com bypass N8N (workaround iOS)
- ✅ Migração automática Storage V1 → V2
- ✅ Retry inteligente (apenas 5xx e rede)
- ✅ Sanitização de input

### V2 (Planejado)

**Features:**
- [ ] Atalhos rápidos customizáveis
- [ ] Respostas formatadas por tipo (cards, listas)
- [ ] Favoritos/pins de mensagens importantes
- [ ] Busca no histórico
- [ ] Exportar conversas

**Integração:**
- [ ] Sincronização multidevice (Supabase)
- [ ] Push notifications (quando iOS suportar)

**UI/UX:**
- [ ] Dark mode
- [ ] Temas personalizáveis
- [ ] Markdown nas respostas
- [ ] Anexos de arquivos

## Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Importante**: Mantenha a filosofia do projeto (minimalismo, performance, zero dependências)

## Licença

MIT License - Sinta-se livre para usar em seus projetos

## Autor

**Ricardo Nilton Borges**
- Desenvolvedor Full Stack
- Representante Comercial (Indústrias Moveleiras)
- Foco: Automação e produtividade empresarial

## Agradecimentos

- N8N pela plataforma de automação incrível
- Vercel pelo hosting gratuito e confiável
- Comunidade web.dev pelas best practices de PWA

---

**Última atualização**: Novembro 01, 2025
**Versão**: 1.3.0
**Status**: 🚀 **EM PRODUÇÃO** (Suporte Multi-usuário)

📖 **Documentação de Desenvolvimento:** [DEV-LOCAL.md](./DEV-LOCAL.md)
📊 **Guia Multi-usuário:** [MULTI-USER-SETUP.md](./MULTI-USER-SETUP.md)
