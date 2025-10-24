# Configuração PWA (Progressive Web App)

## Visão Geral

Configuração completa para transformar a interface web em PWA instalável, permitindo que funcione como app nativo no celular.

## Requisitos Obrigatórios

### 1. HTTPS

**Obrigatório para:**
- Service Worker funcionar
- PWA ser instalável
- Speech Recognition funcionar
- Credibilidade e segurança

**Deploy:**
- Vercel fornece HTTPS automaticamente (gratuito)
- Domínio padrão: `seu-projeto.vercel.app`
- Custom domain: também suporta HTTPS automático

---

### 2. Manifest.json

**Descrição:** Arquivo JSON que define como o app aparece quando instalado.

**Localização:** `/manifest.json` na raiz

**Conteúdo completo:**

```json
{
  "name": "Assistente Personal N8N",
  "short_name": "Assistente",
  "description": "Assistente pessoal via N8N para consultas rápidas de agenda, emails e clientes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-192x192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/assets/icons/icon-512x512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["productivity", "business"],
  "lang": "pt-BR",
  "dir": "ltr"
}
```

### Campos Explicados

**name:** Nome completo do app (exibido em tela de instalação)

**short_name:** Nome curto (exibido abaixo do ícone na home)

**description:** Breve descrição do app

**start_url:** URL de entrada quando app abre (sempre `/`)

**display:** Como o app abre
- `standalone` - Sem barra de navegador (parece app nativo) ✅ Recomendado
- `fullscreen` - Tela cheia (sem status bar)
- `minimal-ui` - Barra mínima
- `browser` - Como site normal

**background_color:** Cor de fundo da splash screen durante carregamento

**theme_color:** Cor da barra de status (topo do celular)

**orientation:** Orientação preferida
- `portrait-primary` - Vertical (recomendado para chat)
- `any` - Qualquer orientação

**scope:** Limita quais URLs são parte do PWA

**icons:** Array de ícones em múltiplos tamanhos

**categories:** Categorias na loja (se publicar)

**lang:** Idioma principal

**dir:** Direção do texto (ltr = left-to-right)

---

### 3. Ícones

**Tamanhos necessários:**
- 72x72, 96x96, 128x128, 144x144, 152x152 (iOS)
- 192x192, 384x384, 512x512 (Android)

**Tipos:**

**Any (padrão):**
- Ícone normal, sem segurança de corte
- Usado na maioria dos lugares

**Maskable:**
- Ícone com margem de segurança
- Pode ser cortado em círculo/squircle
- Importante para Android moderno

**Estrutura de pastas:**
```
/assets/
  /icons/
    icon-72x72.png
    icon-96x96.png
    icon-128x128.png
    icon-144x144.png
    icon-152x152.png
    icon-192x192.png
    icon-384x384.png
    icon-512x512.png
    icon-192x192-maskable.png
    icon-512x512-maskable.png
```

**Geração:**
- Design inicial: 512x512 (tamanho máximo)
- Tool: https://maskable.app/ (para testar maskable)
- Redimensionar para outros tamanhos
- Formato: PNG com transparência

**Design do Ícone:**
- Simples e reconhecível
- Funciona bem em pequeno
- Contraste adequado
- Borda de segurança para maskable (20% de cada lado)

---

### 4. Service Worker

**Descrição:** Script que roda em background, possibilita cache e offline.

**Localização:** `/sw.js` na raiz

**Código completo:**

```javascript
const CACHE_NAME = 'assistente-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/storage.js',
  '/js/speech.js',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

// Instalação: cachear arquivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: estratégia cache-first para assets, network-first para API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first para requisições de API (N8N webhook)
  if (request.method === 'POST' || url.pathname.includes('/webhook/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Você está offline. Conecte-se para enviar mensagens.',
              errorCode: 'OFFLINE'
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Cache-first para assets estáticos
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response; // Retorna do cache
        }
        return fetch(request).then((response) => {
          // Cacheia novos recursos válidos
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // Fallback se offline e não está em cache
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
```

### Estratégias de Cache

**Cache-First (assets estáticos):**
- Tenta cache primeiro
- Se não achar, busca na rede
- Cacheia novos recursos
- Usado para: HTML, CSS, JS, ícones

**Network-First (API):**
- Tenta rede primeiro
- Se falhar, retorna erro offline amigável
- Usado para: requisições ao N8N

**Versionamento:**
- Incrementa `CACHE_NAME` a cada deploy
- Caches antigos são limpos automaticamente

---

### 5. Registrar Service Worker

**No index.html ou app.js:**

```javascript
// Verifica suporte e registra
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[App] Service Worker registrado:', registration.scope);
      })
      .catch((error) => {
        console.error('[App] Falha ao registrar Service Worker:', error);
      });
  });
}
```

**Atualização do Service Worker:**

```javascript
// Detecta quando novo SW está disponível
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('[App] Nova versão disponível. Recarregando...');
  window.location.reload();
});

// Verifica por updates periodicamente
setInterval(() => {
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration) {
      registration.update();
    }
  });
}, 60000); // A cada 1 minuto
```

---

### 6. Meta Tags HTML

**No `<head>` do index.html:**

```html
<!-- PWA -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2563eb">

<!-- iOS -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Assistente">
<link rel="apple-touch-icon" href="/assets/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="152x152" href="/assets/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/icon-180x180.png">

<!-- Splash screens iOS (opcional, melhor UX) -->
<link rel="apple-touch-startup-image" href="/assets/splash/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px)">
<link rel="apple-touch-startup-image" href="/assets/splash/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px)">
<link rel="apple-touch-startup-image" href="/assets/splash/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px)">

<!-- Microsoft -->
<meta name="msapplication-TileColor" content="#2563eb">
<meta name="msapplication-TileImage" content="/assets/icons/icon-144x144.png">

<!-- Viewport (essencial) -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

<!-- Descrição e SEO -->
<meta name="description" content="Assistente pessoal via N8N para consultas rápidas de agenda, emails e clientes">
<meta name="keywords" content="assistente, produtividade, n8n, automação">
```

---

## Comportamento Offline

### O que funciona offline:

✅ Interface carrega normalmente
✅ Histórico de conversas (LocalStorage)
✅ Navegação na interface
✅ Leitura de mensagens antigas

### O que NÃO funciona offline:

❌ Enviar novas mensagens ao N8N
❌ Receber respostas novas
❌ Buscar dados externos

### Feedback para usuário:

Quando offline e tenta enviar:
- Exibe erro claro: "Você está offline. Conecte-se para enviar mensagens."
- Botão "Tentar novamente" (aguarda conexão)
- Indicador visual de status de conexão (opcional)

---

## Instalação (Como usuário vê)

### Android (Chrome):

1. Acessa o site
2. Banner aparece: "Adicionar Assistente à tela inicial"
3. Toca "Adicionar"
4. Ícone aparece na home
5. Abre sem barra de navegador

### iOS (Safari):

1. Acessa o site
2. Toca botão "Compartilhar" (quadrado com seta)
3. Rola e toca "Adicionar à Tela de Início"
4. Confirma nome e toca "Adicionar"
5. Ícone aparece na home
6. Abre sem barra de navegador

**Nota iOS:** Safari não mostra prompt automático, usuário precisa fazer manualmente.

---

## Verificação e Debug

### Ferramentas

**Chrome DevTools:**
1. Abrir DevTools (F12)
2. Aba "Application"
3. Seção "Manifest": verifica manifest.json
4. Seção "Service Workers": verifica SW ativo
5. Seção "Cache Storage": verifica arquivos cacheados

**Lighthouse:**
1. Chrome DevTools > Aba "Lighthouse"
2. Seleciona "Progressive Web App"
3. Clica "Generate report"
4. Verifica score e problemas

**PWA Builder:**
- https://www.pwabuilder.com/
- Testa seu PWA e gera relatório
- Sugere melhorias

### Checklist de Verificação

- [ ] HTTPS ativo
- [ ] manifest.json acessível
- [ ] Todos ícones carregando
- [ ] Service Worker registrado
- [ ] Assets sendo cacheados
- [ ] Funciona offline (interface)
- [ ] Theme color aparece na barra de status
- [ ] Instalável no Android
- [ ] Instalável no iOS
- [ ] Lighthouse PWA score > 90

---

## Critérios PWA (Google)

Para ser considerado PWA instalável:

✅ **Servido via HTTPS**
✅ **Manifest válido com:**
   - name ou short_name
   - icons (192px e 512px)
   - start_url
   - display: standalone ou fullscreen

✅ **Service Worker registrado**
✅ **Responde 200 quando offline (fetch event)**

**Bônus (melhora score):**
- Splash screen (iOS)
- Theme color
- Meta tags extras
- Ícones maskable

---

## Performance e Otimização

### Tamanho de Cache

**Objetivo:** < 5MB total

**Estratégia:**
- Apenas assets essenciais no cache inicial
- CSS/JS minificados
- Imagens otimizadas (ícones comprimidos)
- Sem bibliotecas pesadas

### Update Strategy

**Quando atualizar SW:**
1. Mudar `CACHE_NAME` (versão)
2. SW antigo é substituído
3. Cache antigo é limpo
4. Novos assets são cacheados

**Frequência:**
- A cada deploy com mudanças de código
- Não precisa atualizar para mudanças apenas no N8N

---

## Testes Necessários

### Android

- [ ] Chrome: instala e abre corretamente
- [ ] Ícone aparece bonito na home
- [ ] Theme color na barra de status
- [ ] Funciona offline (interface)
- [ ] Abre sem barra de navegador

### iOS (Safari)

- [ ] Adiciona à tela inicial funciona
- [ ] Ícone aparece bonito na home
- [ ] Status bar configurado corretamente
- [ ] Funciona offline (interface)
- [ ] Abre sem barra de navegador
- [ ] Speech Recognition funciona (importante!)

### Desktop

- [ ] Chrome: mostra ícone de instalação na barra
- [ ] Instala como app desktop
- [ ] Abre em janela separada

---

## Troubleshooting Comum

**"Service Worker não registra"**
- Verifica se está em HTTPS
- Checa console por erros
- Testa caminho `/sw.js` acessível

**"Não aparece prompt de instalação"**
- Android: verifica manifest válido
- iOS: não tem prompt automático, é manual
- Testa no Lighthouse

**"Ícone não aparece/aparece genérico"**
- Verifica caminhos dos ícones
- Confirma tamanhos corretos (192 e 512 obrigatórios)
- Testa ícones maskable

**"Theme color não aparece"**
- Confirma meta tag no HTML
- Verifica valor no manifest.json
- Reinicia app após instalação

**"Cache não atualiza"**
- Incrementa CACHE_NAME
- Desregistra SW manualmente (DevTools)
- Hard refresh (Ctrl+Shift+R)

---

## Recursos e Ferramentas

**Geradores de Ícones:**
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

**Testar Maskable:**
- https://maskable.app/

**Verificar PWA:**
- Chrome DevTools > Lighthouse
- https://www.pwabuilder.com/

**Documentação:**
- https://web.dev/progressive-web-apps/
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

---

## Deploy na Vercel

**Configuração automática:**
1. Push código para Git
2. Conecta repositório na Vercel
3. Deploy automático
4. HTTPS incluído
5. PWA funciona imediatamente

**Nenhuma configuração extra necessária:**
- manifest.json servido automaticamente
- sw.js registrado normalmente
- Arquivos estáticos cacheados

**Domínio customizado (opcional):**
- Adiciona domínio próprio na Vercel
- HTTPS automático (Let's Encrypt)
- PWA continua funcionando

---

## Checklist Final PWA

### Arquivos necessários:
- [ ] `/manifest.json` configurado
- [ ] `/sw.js` com estratégia de cache
- [ ] Ícones em `/assets/icons/` (todos tamanhos)
- [ ] Meta tags no `<head>` do HTML
- [ ] Registro do SW no JavaScript

### Funcionamento:
- [ ] HTTPS ativo (Vercel)
- [ ] Service Worker registrado
- [ ] Assets sendo cacheados
- [ ] Funciona offline (UI)
- [ ] Instalável no celular
- [ ] Ícone aparece corretamente
- [ ] Theme color na barra de status

### Qualidade:
- [ ] Lighthouse PWA score > 90
- [ ] Sem erros no console
- [ ] Performance boa (< 2s carregamento)
- [ ] Testado em Android e iOS
