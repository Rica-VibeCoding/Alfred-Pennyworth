# Design System

## Filosofia de Design

**Minimalismo funcional:** Cada elemento tem propósito. Sem enfeites desnecessários.

**Mobile-first:** Projetado primeiro para celular, adapta para desktop.

**Acessibilidade:** Contraste adequado, tamanhos de toque confortáveis, feedback visual claro.

**Modernidade:** Inspirado em ChatGPT, Linear, Telegram - interfaces limpas e eficientes.

## Paleta de Cores

### Tema Claro (Padrão)

**Cores Principais:**
```css
--primary: #2563eb        /* Azul vibrante - ações principais */
--primary-hover: #1d4ed8  /* Hover do primary */
--primary-light: #dbeafe  /* Fundo de mensagens do assistente */

--background: #ffffff     /* Fundo principal */
--surface: #f9fafb       /* Fundo secundário/cards */
--border: #e5e7eb        /* Bordas sutis */

--text-primary: #111827   /* Texto principal */
--text-secondary: #6b7280 /* Texto secundário/timestamps */
--text-muted: #9ca3af    /* Placeholders */

--success: #10b981       /* Feedbacks positivos */
--error: #ef4444         /* Erros */
--warning: #f59e0b       /* Avisos */
```

### Tema Escuro (Opcional - V2)

```css
--primary: #3b82f6
--primary-hover: #2563eb
--primary-light: #1e3a5f

--background: #0f172a
--surface: #1e293b
--border: #334155

--text-primary: #f1f5f9
--text-secondary: #94a3b8
--text-muted: #64748b

--success: #10b981
--error: #ef4444
--warning: #f59e0b
```

## Tipografia

### Fonte Principal

**Family:** System font stack (nativo, rápido, familiar)
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

### Escalas de Tamanho

```css
--text-xs: 0.75rem      /* 12px - timestamps, labels pequenos */
--text-sm: 0.875rem     /* 14px - texto secundário */
--text-base: 1rem       /* 16px - texto principal */
--text-lg: 1.125rem     /* 18px - títulos pequenos */
--text-xl: 1.25rem      /* 20px - títulos */
--text-2xl: 1.5rem      /* 24px - títulos grandes */
```

### Pesos

```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

## Espaçamento

**Sistema de 4px base:**

```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
```

## Raios de Borda

```css
--radius-sm: 0.375rem   /* 6px - elementos pequenos */
--radius-md: 0.5rem     /* 8px - padrão */
--radius-lg: 0.75rem    /* 12px - cards */
--radius-xl: 1rem       /* 16px - containers grandes */
--radius-full: 9999px   /* Círculo/pílula */
```

## Sombras

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

## Transições

```css
--transition-fast: 150ms ease
--transition-base: 200ms ease
--transition-slow: 300ms ease
```

## Componentes

### 1. Container Principal

```
Layout vertical completo da tela:
- Header fixo no topo (opcional, só logo/título)
- Área de chat (scroll vertical, flex-grow)
- Input fixo no rodapé
```

**Especificações:**
- Largura máxima: 100% em mobile, 768px em desktop (centralizado)
- Padding lateral: 16px
- Background: --background

### 2. Mensagem do Usuário

**Visual:**
- Alinhado à direita
- Background: --primary
- Texto: branco
- Border-radius: 12px (canto inferior direito reto: 4px)
- Padding: 12px 16px
- Max-width: 80% da tela
- Sombra sutil: --shadow-sm

**Comportamento:**
- Fade in ao aparecer (200ms)
- Timestamp embaixo (--text-xs, --text-secondary)

### 3. Mensagem do Assistente

**Visual:**
- Alinhado à esquerda
- Background: --surface
- Texto: --text-primary
- Border-radius: 12px (canto inferior esquerdo reto: 4px)
- Padding: 12px 16px
- Max-width: 80% da tela
- Border: 1px solid --border

**Comportamento:**
- Fade in ao aparecer (200ms)
- Timestamp embaixo (--text-xs, --text-secondary)
- Loading dots animation enquanto espera resposta

### 4. Input de Texto

**Visual:**
- Background: --surface
- Border: 2px solid --border (focus: --primary)
- Border-radius: --radius-full
- Padding: 12px 48px 12px 16px (espaço para botão de enviar)
- Font-size: --text-base
- Placeholder: --text-muted

**Comportamento:**
- Focus: borda azul, outline removido
- Resize vertical desabilitado
- Auto-resize conforme texto (max 5 linhas)
- Transição suave: --transition-base

### 5. Botão de Microfone

**Visual:**
- Círculo: 44px x 44px (área de toque confortável)
- Background: transparent (normal), --primary-light (hover), --primary (ativo)
- Ícone: --primary (normal), branco (ativo)
- Border-radius: --radius-full
- Posicionado à direita do input

**Estados:**
- Normal: ícone de microfone cinza
- Hover: fundo azul claro
- Ativo/gravando: fundo azul, ícone branco, pulsando
- Desabilitado: opacidade 50%

### 6. Botão de Enviar

**Visual:**
- Círculo: 44px x 44px
- Background: --primary (habilitado), --border (desabilitado)
- Ícone: branco (seta/avião de papel)
- Border-radius: --radius-full
- Dentro do input, posição absoluta à direita

**Comportamento:**
- Desabilitado se input vazio
- Transição de cor: --transition-base
- Hover: --primary-hover
- Active: scale(0.95)

### 7. Loading Indicator

**Visual:**
- Três pontos animados
- Cor: --text-muted
- Animação: fade in/out sequencial
- Dentro de mensagem do assistente temporária

**Comportamento:**
- Aparece imediatamente após enviar
- Some quando resposta chega
- Fade in/out suave

### 8. Estado Vazio (Primeira Abertura)

**Visual:**
- Ícone/logo centralizado
- Título: "Como posso ajudar?"
- Sugestões de perguntas (opcional):
  - Cards pequenos com exemplos
  - Clicáveis para auto-preencher input

**Layout:**
- Centralizado vertical e horizontalmente
- Fade out quando primeira mensagem enviada

### 9. Timestamp

**Visual:**
- Font-size: --text-xs
- Color: --text-secondary
- Margin-top: 4px
- Format: "14:30" ou "Ontem 14:30" se não for hoje

### 10. Erro de Conexão

**Visual:**
- Banner no topo (não modal)
- Background: --error com opacidade 10%
- Border-left: 4px solid --error
- Padding: 12px 16px
- Ícone de alerta + mensagem
- Botão "Tentar novamente"

**Comportamento:**
- Slide in do topo
- Auto-dismiss após 5s (se não for crítico)
- Permite fechar manualmente

## Ícones

**Biblioteca:** Lucide Icons ou Font Awesome (CDN)

**Ícones necessários:**
- Microfone (mic)
- Enviar (send / arrow-right)
- Erro (alert-circle)
- Loading (loader / spinner)
- Fechar (x)
- Configurações (settings) - V2

**Tamanho padrão:** 20px
**Cor:** Herda do contexto ou --text-secondary

## Animações

### Mensagem Aparecer

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Loading Dots

```css
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
```

### Botão Hover

```css
transition: all 200ms ease;
&:hover {
  transform: scale(1.05);
}
&:active {
  transform: scale(0.95);
}
```

## Responsividade

### Breakpoints

```css
/* Mobile: padrão, sem media query */
/* Tablet: >= 768px */
/* Desktop: >= 1024px */
```

### Ajustes por Tela

**Mobile (< 768px):**
- Mensagens: max-width 85%
- Padding lateral: 16px
- Input: altura mínima 44px
- Botões: 44px (área de toque)

**Tablet/Desktop (>= 768px):**
- Container: max-width 768px, centralizado
- Mensagens: max-width 70%
- Padding lateral: 24px
- Input: pode ser ligeiramente maior

## Acessibilidade

### Contrastes Mínimos (WCAG AA)

- Texto principal: 7:1 (AAA)
- Texto secundário: 4.5:1 (AA)
- Botões: 3:1 (AA)

### Touch Targets

- Mínimo: 44px x 44px
- Espaçamento entre alvos: 8px

### Focus States

- Outline: 2px solid --primary
- Offset: 2px
- Border-radius mantém o do elemento

### ARIA Labels

- Botão de microfone: "Gravar mensagem por voz"
- Botão de enviar: "Enviar mensagem"
- Input: "Digite sua mensagem"

## Referências Visuais

**Inspiração de interfaces:**
- ChatGPT: Limpeza, espaçamentos generosos
- Linear: Minimalismo, tipografia excelente
- Telegram: Eficiência, rapidez visual
- Notion: Hierarquia clara, contraste sutil

## Implementação CSS

**Estrutura recomendada:**

1. **theme.css** - Variáveis CSS (cores, espaços, etc)
2. **reset.css** - Normalize/reset básico
3. **layout.css** - Grid/flex, containers
4. **components.css** - Estilos de componentes
5. **animations.css** - Keyframes e transições
6. **responsive.css** - Media queries

Ou tudo em **style.css** se preferir arquivo único (recomendado para projeto pequeno).
