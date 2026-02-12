// dropdown.js
// Populates By Cause and By Strategy dropdowns from cause-symbols.txt and strategy-symbols.txt

function populateDropdown(dropdownId, items) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // Remove existing options except the first
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
    if (!response.ok) return [];
    const text = await response.text();
    return text.split('\n').filter(line => line.trim() !== '');
  } catch {
    return [];
  }
}

async function populateCauses() {
  const lines = await fetchTextFile('cause-symbols.txt');
  const items = lines.map(line => ({ value: line.trim(), label: line.trim() }));
  populateDropdown('menu-cause-menu', items);
}

async function populateStrategies() {
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

window.addEventListener('DOMContentLoaded', () => {
  populateCauses();
  populateStrategies();
});
