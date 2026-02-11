// Handles hamburger menu toggle after menu is injected
document.addEventListener('DOMContentLoaded', function() {
  function attachMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLinks = document.getElementById('menuLinks');
    if (menuToggle && menuLinks) {
      menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        menuLinks.classList.toggle('menu-links-open');
      });
    }
  }
  // Wait for menu to be injected
  setTimeout(attachMenuToggle, 200);
});
