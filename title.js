// title.js
// Dynamically inserts the site title and subtitle at the top of the page



function insertSiteTitle() {
  const container = document.getElementById('site-title-container');
  if (!container) return;
    container.innerHTML = `
      <div style="text-align:center; background:#fff;">

      </div>
    `;
}

document.addEventListener('DOMContentLoaded', insertSiteTitle);
