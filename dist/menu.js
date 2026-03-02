// Dynamically inject menu.html into #menu-container if present, then initialize menu logic
async function initMenu() {
  const menuContainer = document.getElementById('menu-container');
  if (menuContainer) {
    const response = await fetch('menu.html');
    const html = await response.text();
    const temp = document.createElement('div');
    temp.innerHTML = html;
    let menuMarkup = '';
    const nav = temp.querySelector('nav.main-menu');
    const header = temp.querySelector('div[style*="flex-direction:column"]');
    if (header) menuMarkup += header.outerHTML;
    if (nav) menuMarkup += nav.outerHTML;
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

