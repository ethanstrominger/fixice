// fixice2.js
// Handles hamburger menu toggle and populates dropdowns

// fixice2.js
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

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired');
  // Hamburger menu logic
  const menuToggle = document.getElementById('menuToggle');
  const menuLinks = document.getElementById('menuLinks');
  if (menuToggle && menuLinks) {
    console.log('menuToggle and menuLinks found');
    menuToggle.addEventListener('click', function () {
      menuLinks.classList.toggle('menu-links-open');
      console.log('Hamburger menu toggled');
    });
    document.addEventListener('click', function (e) {
      if (
        window.innerWidth <= 1200 &&
        !menuLinks.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        menuLinks.classList.remove('menu-links-open');
        console.log('Hamburger menu closed by outside click');
      }
    });
  } else {
    console.log('menuToggle or menuLinks not found');
  }
  // Dropdown population
  populateCauses();
  populateStrategies();
});
