# Funcionalidades do Sistema

## Versão 1.0 (MVP - Minimum Viable Product)

Foco: Interface funcional, rápida e minimalista para uso imediato.

### F1.1 - Envio de Mensagem por Texto

**Descrição:** Usuário digita mensagem em campo de texto e envia ao assistente.

**Comportamento:**
- Campo de texto multiline (auto-expand até 5 linhas)
- Placeholder: "Digite sua mensagem..."
- Enter envia (Shift+Enter quebra linha)
- Botão "Enviar" habilitado apenas com texto
- Limpa campo após envio
- Feedback visual imediato (mensagem aparece instantaneamente)

**Validações:**
- Mensagem não pode estar vazia (após trim)
- Máximo 2000 caracteres
- Debounce de 500ms para evitar envios múltiplos

**Prioridade:** P0 (Essencial)

---

### F1.2 - Envio de Mensagem por Voz

**Descrição:** Usuário clica em botão de microfone e fala, sistema transcreve e envia.

**Comportamento:**
- Botão de microfone sempre visível
- Clique inicia gravação (pede permissão se necessário)
- Feedback visual: botão pulsa enquanto grava
- Transcrição acontece em tempo real (mostrar texto aparecendo)
- Clique novamente ou silêncio > 3s para enviar
- Se permissão negada: exibe mensagem explicativa

**Tecnologia:**
- Web Speech API (Speech Recognition)
- Fallback: se não suportado, oculta botão

**Validações:**
- Verifica suporte do navegador
- Solicita permissão de microfone
- Trata erros de reconhecimento

**Prioridade:** P0 (Essencial)

---

### F1.3 - Exibição de Mensagens (Chat)

**Descrição:** Interface de chat com mensagens do usuário e assistente.

**Comportamento:**
- Mensagens do usuário: alinhadas à direita, fundo azul
- Mensagens do assistente: alinhadas à esquerda, fundo cinza claro
- Scroll automático para última mensagem
- Animação suave ao aparecer (fade in + slide)
- Timestamp abaixo de cada mensagem
- Auto-scroll para nova mensagem

**Layout:**
- Área de chat: 100% altura disponível, scroll vertical
- Mensagens: max-width 80% da tela
- Espaçamento: 12px entre mensagens
- Padding lateral: 16px

**Prioridade:** P0 (Essencial)

---

### F1.4 - Indicador de Carregamento

**Descrição:** Feedback visual enquanto aguarda resposta do N8N.

**Comportamento:**
- Aparece imediatamente após enviar mensagem
- Três pontos animados (pulsando sequencialmente)
- Dentro de "bolha" temporária do assistente
- Desaparece ao receber resposta ou erro

**Visual:**
- Animação: dots com fade in/out
- Cor: cinza médio
- Posição: como mensagem do assistente

**Prioridade:** P0 (Essencial)

---

### F1.5 - Histórico de Conversas

**Descrição:** Armazenamento local de todas as conversas para consulta futura.

**Comportamento:**
- Salva automaticamente cada mensagem (usuário e assistente)
- Carrega histórico ao abrir app
- Persiste entre sessões
- Não requer autenticação/sincronização

**Armazenamento:**
- LocalStorage (JSON estruturado)
- Estrutura: array de conversas > array de mensagens
- Limpeza automática: mantém últimos 30 dias

**Dados salvos por mensagem:**
- ID único (UUID)
- Role (user/assistant)
- Conteúdo (texto)
- Timestamp
- Tipo de resposta (V1: sempre "generic")

**Prioridade:** P0 (Essencial)

---

### F1.6 - Design Responsivo

**Descrição:** Interface adapta perfeitamente a diferentes tamanhos de tela.

**Comportamento:**
- Mobile-first: projetado para celular
- Desktop: largura máxima, centralizado
- Tablet: aproveita espaço extra

**Breakpoints:**
- Mobile: < 768px (padrão)
- Tablet: >= 768px
- Desktop: >= 1024px

**Ajustes:**
- Tamanhos de fonte proporcionais
- Espaçamentos adaptativos
- Área de toque confortável em mobile (44px mínimo)

**Prioridade:** P0 (Essencial)

---

### F1.7 - PWA Básico

**Descrição:** Progressive Web App instalável na tela inicial.

**Comportamento:**
- Prompt de instalação em navegadores suportados
- Ícone na tela inicial (parece app nativo)
- Abre em standalone (sem barra de navegador)
- Funciona offline (apenas interface, sem API)

**Requisitos:**
- manifest.json configurado
- Service worker básico
- Ícones em múltiplos tamanhos
- HTTPS obrigatório

**Funcionalidade offline:**
- Interface carrega normalmente
- Exibe mensagem se tentar enviar sem conexão
- Histórico local sempre acessível

**Prioridade:** P1 (Importante)

---

### F1.8 - Tratamento de Erros

**Descrição:** Feedback claro quando algo dá errado.

**Tipos de erro tratados:**
1. **Sem conexão:** "Você está offline. Verifique sua conexão."
2. **Timeout:** "Demorou muito para responder. Tente novamente."
3. **Erro do servidor:** "Erro ao processar. Tente novamente em instantes."
4. **Permissão de microfone negada:** "Permita acesso ao microfone para usar voz."
5. **Navegador não suportado (voz):** Oculta botão de microfone

**Comportamento:**
- Banner de erro no topo da tela
- Botão "Tentar novamente" (se aplicável)
- Auto-dismiss após 5s (erros não críticos)
- Pode fechar manualmente (X)

**Visual:**
- Fundo vermelho claro
- Ícone de alerta
- Mensagem clara e acionável

**Prioridade:** P0 (Essencial)

---

### F1.9 - Estado Vazio (First Use)

**Descrição:** Tela de boas-vindas quando não há histórico.

**Comportamento:**
- Aparece apenas na primeira vez ou após limpar histórico
- Centralizado verticalmente
- Desaparece (fade out) ao enviar primeira mensagem

**Conteúdo:**
- Logo/ícone do assistente
- Título: "Como posso ajudar?"
- Subtítulo: "Digite ou fale sua mensagem"

**Prioridade:** P2 (Nice to have)

---

## Versão 2.0 (Evolução Planejada)

Foco: Otimização da experiência, formatação rica, produtividade.

### F2.1 - Atalhos Rápidos

**Descrição:** Botões para perguntas frequentes, envio com um toque.

**Comportamento:**
- Barra de atalhos acima do input (horizontal scroll)
- Cards clicáveis: "Agenda hoje", "Últimos emails", "Clientes ativos"
- Clique preenche e envia automaticamente
- Customizável: usuário pode adicionar/remover

**Visual:**
- Pills/chips com ícone + texto
- Scroll horizontal se não couber
- Animação ao clicar

**Dados:**
- Salvos em LocalStorage
- Padrões pré-definidos + customização

**Prioridade:** P1 (Importante)

---

### F2.2 - Respostas Formatadas por Tipo

**Descrição:** Diferentes layouts conforme tipo de resposta do N8N.

**Tipos implementados:**

**Agenda:**
- Cards com hora, título, duração
- Ícone de calendário
- Timeline visual se múltiplos eventos

**Email:**
- Lista com remetente destacado
- Assunto + preview
- Badge de não lido

**Cliente:**
- Card estruturado: nome, contato, última interação
- Status visual (ativo, pendente)
- Botões de ação rápida (não funcionais, só visual)

**Genérico:**
- Mantém formato atual (texto simples)

**Comportamento:**
- N8N retorna campo `type` na resposta
- Frontend renderiza componente específico
- Fallback: se tipo desconhecido, usa genérico

**Prioridade:** P1 (Importante)

---

### F2.3 - Favoritos/Pins

**Descrição:** Marcar respostas importantes para acesso rápido.

**Comportamento:**
- Ícone de estrela em cada mensagem do assistente
- Clique marca/desmarca como favorito
- Aba separada para ver apenas favoritos
- Sincronizado em LocalStorage

**Interface:**
- Toggle na tela: "Todas" / "Favoritas"
- Contador de favoritos
- Ordenação: mais recente primeiro

**Prioridade:** P2 (Nice to have)

---

### F2.4 - Busca no Histórico

**Descrição:** Pesquisar em conversas anteriores.

**Comportamento:**
- Campo de busca no topo
- Busca em tempo real (debounce 300ms)
- Destaca termos encontrados
- Filtra mensagens que contêm termo

**Funcionalidade:**
- Busca em conteúdo de mensagens
- Case-insensitive
- Mostra número de resultados
- Permite navegar entre resultados

**Prioridade:** P2 (Nice to have)

---

### F2.5 - Modo Escuro

**Descrição:** Tema escuro para uso noturno.

**Comportamento:**
- Toggle manual (ícone sol/lua)
- Ou automático (segue sistema operacional)
- Persiste escolha em LocalStorage
- Transição suave entre temas

**Visual:**
- Paleta de cores otimizada (ver DESIGN-SYSTEM.md)
- Contraste adequado (WCAG AA)
- Todas as cores adaptadas

**Prioridade:** P2 (Nice to have)

---

### F2.6 - Sincronização Multidevice

**Descrição:** Histórico e configurações sincronizados entre dispositivos.

**Comportamento:**
- Usa Supabase ou Firebase
- Sincroniza automaticamente
- Funciona offline (sync quando conectar)
- Login simples (email/senha ou Google)

**Dados sincronizados:**
- Histórico completo de conversas
- Favoritos
- Atalhos customizados
- Configurações (tema, preferências)

**Tecnologia:**
- Backend: Supabase (recomendado) ou Firebase
- Auth: Email/senha + OAuth Google
- Real-time: WebSocket para sync instantâneo

**Prioridade:** P3 (Futuro)

---

### F2.7 - Markdown nas Respostas

**Descrição:** Suporte a formatação rica nas respostas do assistente.

**Comportamento:**
- N8N retorna texto com markdown
- Frontend renderiza formatado
- Suporta: negrito, itálico, listas, links, código

**Biblioteca:**
- Marked.js ou similar (leve, < 20KB)
- Sanitização para evitar XSS

**Visual:**
- Estilos consistentes com design system
- Code blocks com syntax highlight (opcional)
- Links clicáveis

**Prioridade:** P2 (Nice to have)

---

### F2.8 - Exportar Conversa

**Descrição:** Exportar histórico para arquivo (PDF, TXT, JSON).

**Comportamento:**
- Botão "Exportar" em menu de opções
- Escolhe formato: PDF (formatado), TXT (plain), JSON (dados)
- Download automático
- Opção: exportar tudo ou período específico

**Formatos:**
- PDF: Bonito, estilo chat
- TXT: Simples, linha por linha
- JSON: Dados estruturados para backup

**Prioridade:** P3 (Futuro)

---

### F2.9 - Notificações Push

**Descrição:** Notificações proativas do assistente.

**Comportamento:**
- N8N pode enviar notificação push
- Usuário recebe mesmo com app fechado
- Clique abre app na conversa relevante

**Casos de uso:**
- Lembrete de compromisso
- Email urgente chegou
- Alerta customizado

**Tecnologia:**
- Push API do navegador
- Service Worker para receber
- Servidor push (FCM ou similar)

**Prioridade:** P3 (Futuro)

---

### F2.10 - Comandos de Voz Avançados

**Descrição:** Comandos customizados reconhecidos por palavra-chave.

**Comportamento:**
- Usuário configura comandos: "Pergunta do dia" = "Qual minha agenda e últimos emails?"
- Fala palavra-chave, sistema reconhece e executa
- Feedback visual de qual comando ativou

**Exemplos:**
- "Briefing" → Agenda + emails + tarefas
- "Vendas" → Clientes ativos + pipeline
- "Status" → Resumo de tudo

**Prioridade:** P3 (Futuro)

---

## Priorização Geral

**P0 - Essencial (V1.0):**
- Envio texto/voz
- Exibição de mensagens
- Histórico
- Loading indicator
- Tratamento de erros
- Design responsivo

**P1 - Importante (V1.5 ou V2.0):**
- PWA completo
- Atalhos rápidos
- Respostas formatadas

**P2 - Nice to have (V2.0):**
- Favoritos
- Busca no histórico
- Modo escuro
- Markdown
- Estado vazio

**P3 - Futuro (V2.5+):**
- Sincronização multidevice
- Exportar conversa
- Notificações push
- Comandos de voz avançados

## Critérios de Sucesso V1.0

- [ ] Usuário consegue enviar mensagem por texto
- [ ] Usuário consegue enviar mensagem por voz
- [ ] Respostas aparecem formatadas e legíveis
- [ ] Histórico persiste entre sessões
- [ ] Funciona perfeitamente em iPhone 11 (Safari)
- [ ] Carrega em < 2 segundos
- [ ] PWA instalável
- [ ] Erros tratados com feedback claro
- [ ] Interface moderna e profissional

## Roadmap Sugerido

**Fase 1 (1-2 semanas):** V1.0 completo
- Todas funcionalidades P0
- Deploy na Vercel
- Testes em iPhone 11

**Fase 2 (1 semana):** Refinamento
- Correções de bugs encontrados no uso real
- Melhorias de UX baseadas em feedback
- Otimizações de performance

**Fase 3 (2-3 semanas):** V2.0
- Atalhos rápidos
- Respostas formatadas por tipo
- 1-2 funcionalidades P2 escolhidas

**Fase 4 (Ongoing):** Evolução contínua
- Funcionalidades V2 restantes conforme necessidade
- Análise de uso para priorizar próximas features
