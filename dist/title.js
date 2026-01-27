// title.js
// Dynamically inserts the site title and subtitle at the top of the page

function insertSiteTitle() {
  const container = document.getElementById('site-title-container');
  if (!container) return;
  container.innerHTML = `
    <h1 style="font-size:2.5em; color:#b30000; font-weight:900; margin-bottom:0.1em; margin-top:0; letter-spacing:0.01em;">FIX ICE</h1>
    <div style="font-size:1.35em; color:#005580; font-weight:600; margin-bottom:0.7em;">Burlington, MA and Beyond</div>
    <img src="eagles.jpeg" alt="Protesters with signs" style="width:100%; max-width:1200px; max-height:420px; height:420px; object-fit:cover; display:block; border-radius:0; box-shadow:0 2px 12px rgba(0,0,0,0.13); margin-bottom:1.2em; margin-left:auto; margin-right:auto;">
  `;
}

document.addEventListener('DOMContentLoaded', insertSiteTitle);
