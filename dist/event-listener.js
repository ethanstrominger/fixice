// Hamburger menu toggle and overflow logic (moved from menu.html)
function initHamburgerMenuAndOverflow() {
  function updateMenuOverflow() {
    const menuLinks = document.getElementById('menuLinks');
    const moreMenu = document.getElementById('moreMenu');
    if (!menuLinks || !moreMenu) return;
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
  updateMenuOverflow();
  // Hamburger menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const menuLinks = document.getElementById('menuLinks');
  if (menuToggle && menuLinks) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      menuLinks.classList.toggle('menu-links-open');
    });
  }
  // Hide menu when clicking outside (mobile)
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 1200 && menuLinks && menuLinks.classList.contains('menu-links-open')) {
      if (!menuLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        menuLinks.classList.remove('menu-links-open');
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
  if (moreMenu) {
    const moreBtn = moreMenu.querySelector('.more-menu-btn');
    if (moreBtn) {
      moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = moreMenu.querySelector('.more-dropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        moreMenu.classList.toggle('open');
      });
    }
  }
}
function showDebug(msg) {
  var debugDiv = document.getElementById('debug-status');
  if (debugDiv) {
    debugDiv.style.display = 'block';
    debugDiv.textContent = msg;
  } else {
    console.log('DEBUG:', msg);
  }
}
var dropdown = document.getElementById('test-dropdown');
var button = document.getElementById('test-button');
if (dropdown) {
  dropdown.addEventListener('change', function() {
    console.log('Dropdown changed:', dropdown.value);
  });
  dropdown.onchange = function() {
    console.log('Dropdown onchange fired:', dropdown.value);
  };
} else {
  showDebug('Dropdown NOT found');
}
if (button) {
  button.addEventListener('click', function() {
    console.log('Button clicked');
  });
} else {
  showDebug('Button NOT found');
}
console.log('Script loaded and listeners attached');

function initMenuExperimental() {
  var debugDiv = document.getElementById('menu-debug-status');
  function showDebugMenu(msg) {
    if (debugDiv) {
      debugDiv.style.display = 'block';
      debugDiv.textContent = msg;
    }
  }
  var menu = document.querySelector('.main-menu');
  var toggle = document.querySelector('.menu-toggle');
  var menuLinks = menu ? menu.querySelector('.menu-links') : null;
  // Start menu collapsed on contact.html
  if (window.location.pathname.endsWith('contact.html')) {
    if (menuLinks) menuLinks.style.display = 'none';
  }
  if (toggle) {
    console.log('Toggle found');
    toggle.addEventListener('click', function () {
      if (menuLinks) {
        if (window.innerWidth <= 1200) {
          // Mobile/tablet: use class toggle
          const nowOpen = menuLinks.classList.toggle('menu-links-open');
          if (nowOpen) {
            console.log('Menu options displayed (menu-links-open class present, mobile)');
          } else {
            console.log('Menu options hidden (menu-links-open class not present, mobile)');
          }
        } else {
          // Desktop: use style.display
          if (menuLinks.style.display === 'none' || menuLinks.style.display === '') {
            menuLinks.style.display = 'flex';
            console.log('Menu options displayed (flex, desktop)');
          } else {
            menuLinks.style.display = 'none';
            console.log('Menu options hidden (none, desktop)');
          }
        }
      }
    });
  } else {
    showDebugMenu('Menu toggle not found');
  }
  var strategyMenu = document.getElementById('menu-strategy-menu');
  var causeMenu = document.getElementById('menu-cause-menu');
  // Dynamically populate causes from cause-symbols.txt
  if (causeMenu) {
    console.log('Found causeMenu element:', causeMenu);
    fetch('cause-symbols.txt')
      .then(response => {
        console.log('Fetched cause-symbols.txt:', response);
        return response.text();
      })
      .then(text => {
        console.log('Cause file text:', text);
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        console.log('Parsed cause lines:', lines);
        // Remove all options except the first (placeholder)
        while (causeMenu.options.length > 1) {
          causeMenu.remove(1);
        }
        lines.forEach(cause => {
          const opt = document.createElement('option');
          opt.value = cause;
          opt.textContent = cause;
          causeMenu.appendChild(opt);
          console.log('Added cause option:', cause);
        });
        // Set cause dropdown to match URL param
        const params = new URLSearchParams(window.location.search);
        const causeParam = params.get('cause');
        if (causeParam) {
          causeMenu.value = causeParam;
        }
      });
  }
  if (strategyMenu) {
    console.log('Strategy dropdown found');
    // Dynamically populate strategies from strategy-symbols.txt
    fetch('strategy-symbols.txt')
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        // Remove all options except the first (placeholder)
        while (strategyMenu.options.length > 1) {
          strategyMenu.remove(1);
        }
        lines.forEach(line => {
          const [strategy, display] = line.split(',');
          if (strategy && display) {
            const opt = document.createElement('option');
            opt.value = strategy.trim();
            opt.textContent = display.trim();
            strategyMenu.appendChild(opt);
          }
        });
        // Set strategy dropdown to match URL param
        const params = new URLSearchParams(window.location.search);
        const strategyParam = params.get('strategy');
        if (strategyParam) {
          strategyMenu.value = strategyParam;
        }
      });
    var strategyHandler = function() {
      console.log('Strategy dropdown changed:', strategyMenu.value);
      if (strategyMenu.value) {
        if (causeMenu) causeMenu.value = '';
        window.location.href = 'explore.html?strategy=' + encodeURIComponent(strategyMenu.value);
      } else {
        window.location.href = 'explore.html';
      }
    };
    strategyMenu.addEventListener('change', strategyHandler);
    strategyMenu.onchange = strategyHandler;
  } else {
    showDebugMenu('Strategy dropdown NOT found');
  }
  if (causeMenu) {
    console.log('Cause dropdown found');
    var causeHandler = function() {
      console.log('Cause dropdown changed:', causeMenu.value);
      if (causeMenu.value) {
        if (strategyMenu) strategyMenu.value = '';
        window.location = 'explore.html?cause=' + encodeURIComponent(causeMenu.value);
      } else {
        window.location = 'explore.html';
      }
    };
    causeMenu.addEventListener('change', causeHandler);
    causeMenu.onchange = causeHandler;
  } else {
    showDebugMenu('Cause dropdown NOT found');
  }
  var switchBtn = document.getElementById('switch-menu');
  if (switchBtn) {
    console.log('Switch menu button found');
    switchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      alert('Switching to standard menu!');
      localStorage.setItem('fixice-menu', 'standard');
      window.location = 'menu.html';
    });
  } else {
    showDebugMenu('Switch menu button NOT found');
  }
}

