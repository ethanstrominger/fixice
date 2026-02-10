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
        if (menuLinks.style.display === 'none') {
          menuLinks.style.display = 'flex';
        } else {
          menuLinks.style.display = 'none';
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
    // Set strategy dropdown to match URL param
    const params = new URLSearchParams(window.location.search);
    const strategyParam = params.get('strategy');
    if (strategyParam) {
      strategyMenu.value = strategyParam;
    }
    var strategyHandler = function() {
      console.log('Strategy dropdown changed:', strategyMenu.value);
      if (strategyMenu.value) {
        if (causeMenu) causeMenu.value = '';
        window.location.href = 'link-explorer.html?strategy=' + encodeURIComponent(strategyMenu.value);
      } else {
        window.location.href = 'link-explorer.html';
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
        window.location = 'link-explorer.html?cause=' + encodeURIComponent(causeMenu.value);
      } else {
        window.location = 'link-explorer.html';
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenuExperimental);
} else {
  initMenuExperimental();
}
