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
  // Dropdown redirect logic
  function getExploreUrl(param, value) {
    let base = '/explore';
    if (!base.endsWith('.html')) base += '.html';
    return `${base}?${param}=${encodeURIComponent(value)}`;
  }
  const strategyDropdown = document.getElementById('menu-strategy-menu');
  if (strategyDropdown) {
    strategyDropdown.addEventListener('change', function () {
      const value = strategyDropdown.value;
      if (value) {
        window.location.href = getExploreUrl('strategy', value);
      }
    });
  }
  const causeDropdown = document.getElementById('menu-cause-menu');
  if (causeDropdown) {
    causeDropdown.addEventListener('change', function () {
      const value = causeDropdown.value;
      if (value) {
        window.location.href = getExploreUrl('cause', value);
      }
    });
  }
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
  // Dropdown population
  populateCauses();
  populateStrategies();
}
// menu.js
// Handles hamburger menu toggle and populates dropdowns

function populateDropdown(dropdownId, items) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) {
    console.log(`Dropdown element '${dropdownId}' not found.`);
    return;
  }
  console.log(`Populating dropdown '${dropdownId}' with items:`, items);
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = item.label;
    dropdown.appendChild(option);
  });
}

async function fetchTextFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      console.log(`Failed to fetch ${filePath}: status ${response.status}`);
      return [];
    }
    const text = await response.text();
    console.log(`Fetched ${filePath}:`, text);
    return text.split('\n').filter(line => line.trim() !== '');
  } catch {
    return [];
  }
}

async function populateCauses() {
  console.log('populateCauses called');
  const lines = await fetchTextFile('cause-symbols.txt');
  const items = lines.map(line => ({ value: line.trim(), label: line.trim() }));
  populateDropdown('menu-cause-menu', items);
}

async function populateStrategies() {
  console.log('populateStrategies called');
  const lines = await fetchTextFile('strategy-symbols.txt');
  const items = lines.map(line => {
    const parts = line.split(',');
    if (parts.length === 2) {
      return { value: parts[0].trim(), label: parts[1].trim() };
    } else {
      return { value: line.trim(), label: line.trim() };
    }
  });
  populateDropdown('menu-strategy-menu', items);
}

