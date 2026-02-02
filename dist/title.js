// title.js
// Dynamically inserts the site title and subtitle at the top of the page



function insertSiteTitle() {
  const container = document.getElementById('site-title-container');
  if (!container) return;
    container.innerHTML = `
      <div style="text-align:center; background:#fff;">
        <h1 class="fixice-title">FIX ICE</h1>
        <div class="fixice-subtitle">Burlington, MA and Beyond</div>
      </div>
    `;
}

document.addEventListener('DOMContentLoaded', insertSiteTitle);
