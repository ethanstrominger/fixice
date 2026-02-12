// fixice2.js
// Handles hamburger menu toggle for responsive navigation

document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menuToggle');
  const menuLinks = document.getElementById('menuLinks');

  if (menuToggle && menuLinks) {
    menuToggle.addEventListener('click', function () {
      menuLinks.classList.toggle('menu-links-open');
    });

    // Optional: close menu when clicking outside (mobile)
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
});
