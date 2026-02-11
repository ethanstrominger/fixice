

document.addEventListener('DOMContentLoaded', function() {
  fetch('resources.txt')
    .then(r => r.text())
    .then(text => {
      const container = document.getElementById('resources-list');
      container.innerHTML = '';
      const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#') && !line.startsWith('s#'));
      let html = '';
      let inList = false;
      function insertProtestTable(callback) {
        fetch('protests1000districtave.html')
          .then(r => r.text())
          .then(protestHtml => {
            // Extract the <table>...</table> from the HTML
            const match = protestHtml.match(/<table[\s\S]*?<\/table>/i);
            callback(match ? match[0] : '<div>Protest schedule not found.</div>');
          });
      }


      function renderLines(lines, cb) {
        let html = '';
        let inList = false;
        let inSection = false;
        let sectionTitle = '';
        let sectionContent = '';
        let i = 0;
        function closeSection() {
          if (inList) { sectionContent += '</ul>'; inList = false; }
          if (inSection) {
            html += `<details><summary>${sectionTitle}</summary>${sectionContent}</details>`;
            inSection = false;
            sectionTitle = '';
            sectionContent = '';
          }
        }
        function next() {
          if (i >= lines.length) {
            closeSection();
            cb(html);
            return;
          }
          const line = lines[i++];
          if (line.startsWith('Heading:')) {
            closeSection();
            inSection = true;
            sectionTitle = line.replace('Heading:', '').trim();
            sectionContent = '';
            next();
          } else if (line === 'Display list') {
            if (inList) { sectionContent += '</ul>'; inList = false; }
            insertProtestTable(function(tableHtml) {
              sectionContent += tableHtml;
              next();
            });
          } else if (line.includes('|')) {
            if (!inList) { sectionContent += '<ul>'; inList = true; }
            const [name, description, link] = line.split('|').map(s => s.trim());
            if (name && link) {
              sectionContent += `<li><a href="${link}" target="_blank">${name}</a>: ${description}</li>`;
            } else {
              sectionContent += `<li>${name}: ${description}</li>`;
            }
            next();
          } else if (line.startsWith('p:')) {
            // Display as paragraph only if line starts with 'p:'
            sectionContent += `<p>${line.slice(2).trim()}</p>`;
            next();
          } else {
            next();
          }
        }
        next();
      }

      renderLines(lines, function(finalHtml) {
        container.innerHTML = finalHtml;
      });
    });
});
