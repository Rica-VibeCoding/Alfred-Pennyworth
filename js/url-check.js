// Verifica se está usando a URL correta para desenvolvimento local
// Deve ser carregado ANTES de app.js

(function() {
  'use strict';

  // Apenas em ambiente local (não produção)
  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168.') ||
                      window.location.hostname.includes('10.0.');

  if (!isLocalhost) {
    return; // Produção, não faz nada
  }

  // Se está acessando via IP de rede (192.168.x.x, 10.0.x.x)
  if (window.location.hostname.includes('192.168.') ||
      window.location.hostname.includes('10.0.')) {

    const localhostUrl = `http://localhost:${window.location.port}${window.location.pathname}`;

    // Criar banner de aviso
    const banner = document.createElement('div');
    banner.id = 'url-warning-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #FEF3C7;
      border-bottom: 2px solid #F59E0B;
      padding: 16px 20px;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    banner.innerHTML = `
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #92400E; margin-bottom: 4px; font-size: 14px;">
          ⚠️ URL Incorreta
        </div>
        <div style="color: #78350F; font-size: 13px;">
          Use <strong>localhost</strong> para evitar erros CORS com N8N
        </div>
      </div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <a
          href="${localhostUrl}"
          style="
            background: #F59E0B;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            font-size: 13px;
            white-space: nowrap;
          "
        >
          Ir para localhost
        </a>
        <button
          id="dismiss-url-warning"
          style="
            background: transparent;
            border: none;
            color: #92400E;
            cursor: pointer;
            font-size: 20px;
            padding: 0 8px;
            line-height: 1;
          "
          aria-label="Fechar aviso"
        >
          ×
        </button>
      </div>
    `;

    // Adicionar ao body quando DOM estiver pronto
    if (document.body) {
      document.body.insertBefore(banner, document.body.firstChild);

      // Ajustar padding do body para não cobrir conteúdo
      document.body.style.paddingTop = '80px';
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.insertBefore(banner, document.body.firstChild);
        document.body.style.paddingTop = '80px';
      });
    }

    // Botão para dispensar (mas não recomendado)
    const dismissBtn = banner.querySelector('#dismiss-url-warning');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        banner.remove();
        document.body.style.paddingTop = '';
      });
    }

    // Log no console também
    console.warn(
      '%c⚠️ URL INCORRETA\n\n' +
      'Você está acessando via IP de rede: ' + window.location.hostname + '\n' +
      'Isso causará erros CORS com N8N.\n\n' +
      'Use: ' + localhostUrl + '\n',
      'font-size: 14px; font-weight: bold; color: #F59E0B; background: #FEF3C7; padding: 12px; border-left: 4px solid #F59E0B;'
    );
  }
})();
