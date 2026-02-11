

document.addEventListener('DOMContentLoaded', function() {
  fetch('resources.txt')
    .then(r => r.text())
    .then(text => {
      const container = document.getElementById('resources-list');
      container.innerHTML = '';
      const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#') && !line.startsWith('s#'));
      let html = '';
      let inList = false;
      lines.forEach(line => {
        if (line.startsWith('Heading:')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += `<h2>${line.replace('Heading:', '').trim()}</h2>`;
        } else if (line.includes('|')) {
          if (!inList) { html += '<ul>'; inList = true; }
          const [name, description, link] = line.split('|').map(s => s.trim());
          if (name && link) {
            html += `<li><a href="${link}" target="_blank">${name}</a>: ${description}</li>`;
          } else {
            html += `<li>${name}: ${description}</li>`;
          }
        }
      });
      if (inList) html += '</ul>';
      container.innerHTML = html;
    });
});
