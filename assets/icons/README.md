# Ícones PWA - Alfred

## Geração de Ícones

Escolha um dos métodos abaixo para gerar os ícones:

### Método 1: Browser (Recomendado)
1. Abra `generate-icons.html` no navegador
2. Clique em "Gerar e Baixar Todos os Ícones"
3. Os arquivos PNG serão baixados automaticamente
4. Mova os arquivos para esta pasta `/assets/icons/`

### Método 2: Node.js
```bash
npm install canvas
node generate-icons.js
```

### Método 3: Online
Use: https://www.pwabuilder.com/imageGenerator

## Ícones Necessários

- icon-32x32.png (favicon)
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png (Apple touch icon)
- icon-180x180.png (Apple touch icon)
- icon-192x192.png (Android)
- icon-384x384.png
- icon-512x512.png (Android splash)

## Design

- Formato: Círculo azul (#2563eb) com letra "A" branca (#ffffff)
- Fonte: System sans-serif, bold
- Tamanho texto: 55% do tamanho do ícone
