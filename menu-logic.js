function updateMenuOverflow() {
  const menuLinks = document.getElementById('menuLinks');
  const moreMenu = document.getElementById('moreMenu');
  const moreDropdown = moreMenu.querySelector('.more-dropdown');
  const items = Array.from(menuLinks.querySelectorAll('.menu-item'));
  // Reset
  moreMenu.style.display = 'none';
  moreDropdown.innerHTML = '';
  items.forEach(item => item.style.display = '');
  // Only run on desktop (not hamburger)
  if (window.innerWidth <= 1200) return;
  let menuWidth = menuLinks.offsetWidth;
  let usedWidth = 0;
  let lastFittingIdx = -1;
  // Calculate how many items fit
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item.style.display = '';
    usedWidth += item.offsetWidth;
    if (usedWidth + moreMenu.offsetWidth > menuWidth) {
      break;
    }
    lastFittingIdx = i;
  }
  // If not all fit, move extras to More
  if (lastFittingIdx < items.length - 1) {
    moreMenu.style.display = '';
    for (let i = lastFittingIdx + 1; i < items.length; i++) {
      const item = items[i];
      const clone = item.cloneNode(true);
      clone.style.display = 'block';
      clone.style.color = '#23408e';
      clone.style.background = 'none';
      clone.style.padding = '0.4em 1em';
      clone.style.borderRadius = '5px';
      clone.style.textDecoration = 'none';
      clone.style.fontWeight = '600';
      clone.style.whiteSpace = 'nowrap';
      moreDropdown.appendChild(clone);
      item.style.display = 'none';
    }
  }
}
window.addEventListener('resize', updateMenuOverflow);
function initMenuLogic() {
  console.log('[menu-logic.js] initMenuLogic called');
  updateMenuOverflow();
  // Hamburger menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const menuLinks = document.getElementById('menuLinks');
  if (menuToggle && menuLinks) {
    console.log('[menu-logic.js] Attaching hamburger click handler');
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      menuLinks.classList.toggle('menu-links-open');
      // Remove any inline display style so CSS can take over
      menuLinks.style.display = '';
      // Fallback: if opening, force display flex inline if still hidden
      const computedDisplay = window.getComputedStyle(menuLinks).display;
      if (menuLinks.classList.contains('menu-links-open')) {
        if (computedDisplay === 'none') {
          menuLinks.style.display = 'flex';
          console.log('[menu-logic.js] Fallback: forced display:flex inline');
        }
        // Debug: add outline and background
        // Remove all debug/override styles for production
        menuLinks.style.outline = '';
        menuLinks.style.background = '';
        menuLinks.style.position = '';
        menuLinks.style.top = '';
        menuLinks.style.left = '';
        menuLinks.style.width = '';
        menuLinks.style.zIndex = '';
        menuLinks.style.color = '';
        menuLinks.style.minHeight = '';
          menuLinks.style.outline = '';
          menuLinks.style.background = '';
          menuLinks.style.zIndex = '';
          menuLinks.style.position = '';
          menuLinks.style.top = '';
          menuLinks.style.left = '';
          menuLinks.style.width = '';
          menuLinks.style.height = '';
          menuLinks.style.overflowY = '';
          menuLinks.style.color = '';
          menuLinks.style.minHeight = '';
          menuLinks.style.flexDirection = '';
          menuLinks.style.justifyContent = '';
          menuLinks.style.alignItems = '';
          menuLinks.style.overflow = '';
          Array.from(menuLinks.children).forEach(child => {
            child.style.display = '';
            child.style.color = '';
            child.style.background = '';
            child.style.margin = '';
            child.style.minHeight = '';
            child.style.border = '';
            child.style.overflow = '';
          });
        menuLinks.style.background = '';
        menuLinks.style.color = '';
        menuLinks.style.minHeight = '';
        menuLinks.style.flexDirection = '';
        menuLinks.style.justifyContent = '';
        menuLinks.style.alignItems = '';
        menuLinks.style.overflow = '';
        Array.from(menuLinks.children).forEach(child => {
          menuLinks.style.outline = '';
          menuLinks.style.background = '';
          menuLinks.style.zIndex = '';
          menuLinks.style.position = '';
          menuLinks.style.top = '';
          menuLinks.style.left = '';
          menuLinks.style.width = '';
          menuLinks.style.height = '';
          menuLinks.style.overflowY = '';
          menuLinks.style.color = '';
          menuLinks.style.minHeight = '';
          menuLinks.style.flexDirection = '';
          menuLinks.style.justifyContent = '';
          menuLinks.style.alignItems = '';
          menuLinks.style.overflow = '';
          Array.from(menuLinks.children).forEach(child => {
            child.style.display = '';
            child.style.color = '';
            child.style.background = '';
            child.style.margin = '';
            child.style.minHeight = '';
            child.style.border = '';
            child.style.overflow = '';
          });
          const menuContainer = document.getElementById('menu-container');
          if (menuContainer) {
            menuContainer.style.outline = '';
            menuContainer.style.background = '';
            menuContainer.style.zIndex = '';
            menuContainer.style.position = '';
            menuContainer.style.top = '';
            menuContainer.style.left = '';
            menuContainer.style.width = '';
            menuContainer.style.height = '';
          }
      if (!menuLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        menuLinks.classList.remove('menu-links-open');
        console.log('[menu-logic.js] Clicked outside, closing menu');
      }
    }
    // More dropdown hide
    const moreMenu = document.getElementById('moreMenu');
    if (moreMenu) {
      moreMenu.querySelector('.more-dropdown').style.display = 'none';
      moreMenu.classList.remove('open');
    }
  });
  // Toggle More dropdown
  const moreMenu = document.getElementById('moreMenu');
  if (moreMenu && moreMenu.querySelector('.more-menu-btn')) {
    moreMenu.querySelector('.more-menu-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdown = moreMenu.querySelector('.more-dropdown');
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      moreMenu.classList.toggle('open');
      console.log('[menu-logic.js] More menu toggled');
    });
  } else {
    console.warn('[menu-logic.js] moreMenu or .more-menu-btn not found', {moreMenu});
  }
}
