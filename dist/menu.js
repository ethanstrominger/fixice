// Dynamically inject menu.html into #menu-container if present, then initialize menu logic
async function initMenu() {
  const menuContainer = document.getElementById('menu-container');
  if (menuContainer) {
    const response = await fetch('menu.html?v=3');
    const html = await response.text();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    let menuMarkup = '';
    const nav = temp.querySelector('nav.main-menu');
    const header = temp.querySelector('div[style*="flex-direction:column"]');
    const rally = temp.querySelector('div[data-menu-extra]');
    if (header) menuMarkup += header.outerHTML;
    if (nav) menuMarkup += nav.outerHTML;
    if (rally) menuMarkup += rally.outerHTML;
    if (!menuMarkup) menuMarkup = temp.innerHTML;
    menuContainer.innerHTML = menuMarkup;
    // Wait for DOM update, then run menu logic
    setTimeout(() => {
      setupMenuLogic();
    }, 0);
  } else {
    setupMenuLogic();
  }
}

// Analytics: record page loads and link clicks
(function() {
  // Use explicit API URL since the frontend (fixice.org) and API (api.fixice.org) are separate services
  const API_BASE = window.location.hostname === 'localhost' ? '' : 'https://api.fixice.org';
  function recordVisit(url) {
    fetch(API_BASE + '/api/record?url=' + encodeURIComponent(url), { method: 'GET', keepalive: true });
  }
  // Record on page load
  recordVisit(window.location.href);
  // Record on link clicks
  document.addEventListener('click', function(e) {
    let link = e.target.closest('a[href]');
    if (link && link.href.startsWith('http')) {
      recordVisit(link.href);
    }
  }, true);
})();

function setupMenuLogic() {
  // Hamburger menu logic
  const menuToggle = document.getElementById('menuToggle');
  const menuLinks = document.getElementById('menuLinks');
  if (menuToggle && menuLinks) {
    menuToggle.addEventListener('click', function () {
      menuLinks.classList.toggle('menu-links-open');
    });
    document.addEventListener('click', function (e) {
      if (
        window.innerWidth <= 1200 &&
        !menuLinks.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        menuLinks.classList.remove('menu-links-open');
      }
    });
  }
}

