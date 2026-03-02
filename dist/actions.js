// actions.js
// Shows all records from link-list.txt with Action Type, Cause, and Action filters
// Grouping/collapsible behaviour:
//   Action Type only    → group by Cause (collapsible)
//   Cause only       → group by Action (collapsible)
//   Both selected    → flat table, heading "Cause: xxx  Action: xxx"
//   Neither selected → outer group by Action (collapsible), inner by Cause (collapsible)

async function loadLinks() {
  const response = await fetch('link-list.txt');
  const text = await response.text();
  const records = [];
  let rec = {};
  text.split('\n').forEach(line => {
    line = line.trim();
    if (line.startsWith('Link: ')) {
      rec.link = line.replace('Link: ', '').trim();
    } else if (line.startsWith('Title: ')) {
      rec.title = line.replace('Title: ', '').trim();
    } else if (line.startsWith('Description: ')) {
      rec.description = line.replace('Description: ', '').trim();
    } else if (line.startsWith('Activities: ')) {
      rec.activities = line.replace('Activities: ', '').trim();
    } else if (line.startsWith('Mode: ')) {
      rec.mode = line.replace('Mode: ', '').trim();
    } else if (line.startsWith('Tag: ')) {
      rec.tag = line.replace('Tag: ', '').trim();
    } else if (line.startsWith('Cause: ')) {
      rec.cause = line.replace('Cause: ', '').trim();
      if (rec.title || rec.description) {
        records.push(rec);
      }
      rec = {};
    }
  });
  return records;
}

async function loadActionTypeSymbols() {
  const response = await fetch('strategy-symbols.txt');
  const text = await response.text();
  const map = {};
  text.split('\n').forEach(line => {
    const [strategy, display] = line.split(',');
    if (strategy && display) map[strategy.trim()] = display.trim();
  });
  return map;
}

function splitValues(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

function populateSelect(selectId, values) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const sorted = Array.from(values).sort();
  sorted.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

// Build a <table> element from a list of records
function buildTable(records, actionTypeMap) {
  const table = document.createElement('table');
  table.className = 'actions-table';
  const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Title</th><th>Description</th><th>Action Type</th><th>Cause</th><th>Mode</th><th>Tag</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  records.forEach(rec => {
    const tr = document.createElement('tr');

    const tdTitle = document.createElement('td');
    if (rec.link) {
      const a = document.createElement('a');
      a.href = rec.link;
      a.target = '_blank';
      a.textContent = rec.title || rec.link;
      tdTitle.appendChild(a);
    } else {
      tdTitle.textContent = rec.title || '';
    }

    const tdDesc = document.createElement('td');
    tdDesc.textContent = rec.description || '';

    const tdActionType = document.createElement('td');
    tdActionType.textContent = splitValues(rec.activities).map(a => actionTypeMap[a] || a).join(' ');

    const tdCause = document.createElement('td');
    tdCause.textContent = rec.cause || '';

    const tdMode = document.createElement('td');
    tdMode.textContent = rec.mode || '';

    const tdTag = document.createElement('td');
    tdTag.textContent = rec.tag || '';

    tr.append(tdTitle, tdDesc, tdActionType, tdCause, tdMode, tdTag);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

// Wrap content in a collapsible <details> section
function makeCollapsible(labelHtml, innerEl, extraClass) {
  const section = document.createElement('div');
  section.className = 'actions-section' + (extraClass ? ' ' + extraClass : '');
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.innerHTML = labelHtml;
  details.appendChild(summary);
  details.appendChild(innerEl);
  section.appendChild(details);
  return section;
}

// Group records by a key-getter that returns an array of values per record
function groupBy(records, keyGetter) {
  const map = new Map();
  records.forEach(rec => {
    keyGetter(rec).forEach(k => {
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(rec);
    });
  });
  return map;
}

function renderContent(records, actionTypeFilter, causeFilter, modeFilter, tagFilter, actionTypeMap) {
  // Apply filters
  let filtered = records;
  if (actionTypeFilter) {
    filtered = filtered.filter(r =>
      splitValues(r.activities).map(a => a.toLowerCase()).includes(actionTypeFilter.toLowerCase())
    );
  }
  if (causeFilter) {
    filtered = filtered.filter(r =>
      splitValues(r.cause).map(c => c.toLowerCase()).includes(causeFilter.toLowerCase())
    );
  }
  if (modeFilter) {
    filtered = filtered.filter(r =>
      splitValues(r.mode).map(t => t.toLowerCase()).includes(modeFilter.toLowerCase())
    );
  }
  if (tagFilter) {
    filtered = filtered.filter(r =>
      splitValues(r.tag).map(t => t.toLowerCase()).includes(tagFilter.toLowerCase())
    );
  }

  const container = document.getElementById('actions-container');
  const countDiv = document.getElementById('actions-count');
  container.innerHTML = '';
  countDiv.textContent = `Showing ${filtered.length} of ${records.length} actions`;

  const hasCause = !!causeFilter;
  const hasActionType = !!actionTypeFilter;

  if (hasCause && hasActionType) {
    // ── Both selected: flat table with heading ──────────────────────────────
    const heading = document.createElement('div');
    heading.className = 'actions-flat-heading';
    heading.textContent = `Cause: ${causeFilter}   Action Type: ${actionTypeMap[actionTypeFilter] || actionTypeFilter}`;
    container.appendChild(heading);
    container.appendChild(buildTable(filtered, actionTypeMap));

  } else if (hasActionType && !hasCause) {
    // ── Action Type only: group by Cause ───────────────────────────────────────
    const byGroup = groupBy(filtered, r => splitValues(r.cause).length ? splitValues(r.cause) : ['(none)']);
    Array.from(byGroup.keys()).sort().forEach(cause => {
      const recs = byGroup.get(cause);
      container.appendChild(
        makeCollapsible(
          `Cause: ${cause} <span style="font-weight:400;font-size:0.9em;">(${recs.length})</span>`,
          buildTable(recs, actionTypeMap)
        )
      );
    });

  } else if (hasCause && !hasActionType) {
    // ── Cause only: group by Action ─────────────────────────────────────────
    const byGroup = groupBy(filtered, r => splitValues(r.activities).length ? splitValues(r.activities) : ['other']);
    Array.from(byGroup.keys()).sort().forEach(action => {
      const recs = byGroup.get(action);
      const label = actionTypeMap[action] || action;
      container.appendChild(
        makeCollapsible(
          `Action: ${label} <span style="font-weight:400;font-size:0.9em;">(${recs.length})</span>`,
          buildTable(recs, actionTypeMap)
        )
      );
    });

  } else {
    // ── Neither selected: outer = Action (collapsible), inner = Cause (heading) ──
    const byAction = groupBy(filtered, r => splitValues(r.activities).length ? splitValues(r.activities) : ['other']);
    Array.from(byAction.keys()).sort().forEach(action => {
      const actionRecs = byAction.get(action);
      const actionLabel = actionTypeMap[action] || action;

      const byCause = groupBy(actionRecs, r => splitValues(r.cause).length ? splitValues(r.cause) : ['(none)']);
      const innerWrap = document.createElement('div');
      Array.from(byCause.keys()).sort().forEach(cause => {
        const causeRecs = byCause.get(cause);
        const heading = document.createElement('h4');
        heading.textContent = cause;
        heading.style.cssText = 'margin:0.8em 0 0.3em 0;color:#23408e;font-size:1em;font-weight:700;border-bottom:1px solid #d0d8f0;padding-bottom:0.2em;';
        innerWrap.appendChild(heading);
        innerWrap.appendChild(buildTable(causeRecs, actionTypeMap));
      });

      container.appendChild(
        makeCollapsible(
          `Action: ${actionLabel} <span style="font-weight:400;font-size:0.9em;">(${actionRecs.length})</span>`,
          innerWrap
        )
      );
    });
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  const [records, actionTypeMap] = await Promise.all([loadLinks(), loadActionTypeSymbols()]);

  // Collect unique values for each filter from the data
  const strategies = new Set();
  const causes = new Set();
  const modes = new Set();
  const tags = new Set();
  records.forEach(r => {
    splitValues(r.activities).forEach(a => strategies.add(a));
    splitValues(r.cause).forEach(c => causes.add(c));
    splitValues(r.mode).forEach(t => modes.add(t));
    splitValues(r.tag).forEach(t => tags.add(t));
  });

  // Populate Action Type filter with display symbols
  const actionTypeSel = document.getElementById('filter-actiontype');
  Array.from(strategies).sort().forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = actionTypeMap[v] || v;
    actionTypeSel.appendChild(opt);
  });
  populateSelect('filter-cause', causes);
  populateSelect('filter-mode', modes);
  populateSelect('filter-tag', tags);

  // Read initial filters from URL params
  const params = new URLSearchParams(window.location.search);
  const initActionType = params.get('actiontype') || '';
  const initCause = params.get('cause') || '';
  const initMode = params.get('mode') || '';
  const initTag = params.get('tag') || '';
  if (initActionType) actionTypeSel.value = initActionType;
  if (initCause) document.getElementById('filter-cause').value = initCause;
  if (initMode) document.getElementById('filter-mode').value = initMode;
  if (initTag) document.getElementById('filter-tag').value = initTag;

  function applyFilters() {
    renderContent(
      records,
      document.getElementById('filter-actiontype').value,
      document.getElementById('filter-cause').value,
      document.getElementById('filter-mode').value,
      document.getElementById('filter-tag').value,
      actionTypeMap
    );
  }

  document.getElementById('filter-actiontype').addEventListener('change', applyFilters);
  document.getElementById('filter-cause').addEventListener('change', applyFilters);
  document.getElementById('filter-mode').addEventListener('change', applyFilters);
  document.getElementById('filter-tag').addEventListener('change', applyFilters);

  applyFilters();
});
