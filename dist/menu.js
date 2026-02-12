// menu.js
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
// Dynamically loads the menu from menu.html into the element with id="menu-container"
document.addEventListener('DOMContentLoaded', function() {
  console.log('menu.js loaded');
  var container = document.getElementById('menu-container');
  if (container) {
    console.log('menu-container found, loading menu.html...');
    fetch('menu.html')
      .then(response => response.text())
      .then(html => {
        container.innerHTML = html;
        console.log('menu.html loaded and injected');
      });
  } else {
    console.log('menu-container not found');
  }
});
