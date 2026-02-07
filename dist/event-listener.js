function showDebug(msg) {
  var debugDiv = document.getElementById('debug-status');
  debugDiv.style.display = 'block';
  debugDiv.textContent = msg;
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
  if (toggle) {
    console.log('Toggle found');
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  } else {
    showDebugMenu('Menu toggle not found');
  }
  var strategyMenu = document.getElementById('menu-strategy-menu');
  var causeMenu = document.getElementById('menu-cause-menu');
  if (strategyMenu) {
    console.log('Strategy dropdown found');
    var strategyHandler = function() {
      console.log('Strategy dropdown changed:', strategyMenu.value);
      if (strategyMenu.value) {
        if (causeMenu) causeMenu.value = '';
        window.location.href = 'link-explorer-experimental.html?strategy=' + encodeURIComponent(strategyMenu.value);
      } else {
        window.location.href = 'link-explorer-experimental.html';
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
        window.location = 'link-explorer-experimental.html?cause=' + encodeURIComponent(causeMenu.value);
      } else {
        window.location = 'link-explorer-experimental.html';
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
