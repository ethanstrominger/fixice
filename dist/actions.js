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
    const trimmed = line.trim();
    if (trimmed === '') {
      if (rec.title || rec.description) {
        records.push(rec);
        rec = {};
      }
      return;
    }
    if (trimmed.startsWith('Link: ')) {
      rec.link = trimmed.replace('Link: ', '').trim();
    } else if (trimmed.startsWith('Title: ')) {
      // If a new Title starts while a record is pending (no Cause: seen yet), push it first
      if (rec.title || rec.description) {
        records.push(rec);
        rec = {};
      }
      rec.title = trimmed.replace('Title: ', '').trim();
    } else if (trimmed.startsWith('Description: ')) {
      rec.description = trimmed.replace('Description: ', '').trim();
    } else if (trimmed.startsWith('Action Type: ')) {
      rec.activities = trimmed.replace('Action Type: ', '').trim();
    } else if (trimmed.startsWith('Mode: ')) {
      rec.mode = trimmed.replace('Mode: ', '').trim();
    } else if (trimmed.startsWith('Tag: ')) {
      rec.tag = trimmed.replace('Tag: ', '').trim();
    } else if (trimmed.startsWith('Time: ')) {
      rec.time = trimmed.replace('Time: ', '').trim();
    } else if (trimmed.startsWith('Frequency: ')) {
      rec.frequency = trimmed.replace('Frequency: ', '').trim();
    } else if (trimmed.startsWith('Location: ')) {
      rec.location = trimmed.replace('Location: ', '').trim();
    } else if (trimmed.startsWith('Cause: ')) {
      rec.cause = trimmed.replace('Cause: ', '').trim();
      if (rec.title || rec.description) {
        records.push(rec);
      }
      rec = {};
    }
  });
  // Push any trailing record not terminated by Cause: or blank line
  if (rec.title || rec.description) {
    records.push(rec);
  }
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
// currentGroupLabel: the group this table is inside (to exclude from "also in" note)
// recordGroupsMap: Map<record, string[]> of all groups each record belongs to
function buildTable(records, actionTypeMap, currentGroupLabel, recordGroupsMap) {
  const table = document.createElement('table');
  table.className = 'actions-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Title</th><th>Time</th><th>Description</th><th>Action Type</th><th>Cause</th><th>Mode</th><th>Frequency</th><th>Tag</th></tr>';
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
    // ** marker for items that appear in multiple groups
    if (recordGroupsMap && recordGroupsMap.has(rec)) {
      const mark = document.createElement('span');
      mark.textContent = ' **';
      mark.title = 'Listed in multiple sections';
      mark.style.cssText = 'color:#888;font-size:0.85em;';
      tdTitle.appendChild(mark);
    }

    const tdTime = document.createElement('td');
    tdTime.textContent = rec.time || '';

    const tdDesc = document.createElement('td');
    tdDesc.textContent = rec.description || '';

    const tdActionType = document.createElement('td');
    tdActionType.textContent = splitValues(rec.activities).map(a => actionTypeMap[a] || a).join(' ');

    const tdCause = document.createElement('td');
    tdCause.textContent = rec.cause || '';

    const tdMode = document.createElement('td');
    tdMode.textContent = rec.mode || '';

    const tdFreq = document.createElement('td');
    tdFreq.textContent = rec.frequency || '';

    const tdTag = document.createElement('td');
    tdTag.textContent = rec.tag || '';

    tr.append(tdTitle, tdTime, tdDesc, tdActionType, tdCause, tdMode, tdFreq, tdTag);
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

// For each record that appears in more than one group, map it to the list of all its group labels
function buildRecordGroupsMap(groupMap) {
  const recordGroups = new Map();
  groupMap.forEach((recs, groupKey) => {
    recs.forEach(rec => {
      if (!recordGroups.has(rec)) recordGroups.set(rec, []);
      recordGroups.get(rec).push(groupKey);
    });
  });
  // Only keep records that appear in more than one group
  recordGroups.forEach((groups, rec) => {
    if (groups.length <= 1) recordGroups.delete(rec);
  });
  return recordGroups;
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

function renderContent(records, actionTypeFilter, causeFilter, modeFilter, tagFilter, frequencyFilter, actionTypeMap) {
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
  if (frequencyFilter) {
    filtered = filtered.filter(r =>
      (r.frequency || '').toLowerCase() === frequencyFilter.toLowerCase()
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
    // ── Action Type only: group by Cause ──────────────────────────────────────
    const byGroup = groupBy(filtered, r => splitValues(r.cause).length ? splitValues(r.cause) : ['(none)']);
    const rgMap = buildRecordGroupsMap(byGroup);
    Array.from(byGroup.keys()).sort().forEach(cause => {
      const recs = byGroup.get(cause);
      container.appendChild(
        makeCollapsible(
          `Cause: ${cause} <span style="font-weight:400;font-size:0.9em;">(${recs.length})</span>`,
          buildTable(recs, actionTypeMap, cause, rgMap)
        )
      );
    });

  } else if (hasCause && !hasActionType) {
    // ── Cause only: group by Action ─────────────────────────────────────────
    const byGroup = groupBy(filtered, r => splitValues(r.activities).length ? splitValues(r.activities) : ['other']);
    const rgMap = buildRecordGroupsMap(byGroup);
    Array.from(byGroup.keys()).sort().forEach(action => {
      const recs = byGroup.get(action);
      const label = actionTypeMap[action] || action;
      container.appendChild(
        makeCollapsible(
          `Action: ${label} <span style="font-weight:400;font-size:0.9em;">(${recs.length})</span>`,
          buildTable(recs, actionTypeMap, label, rgMap)
        )
      );
    });

  } else {
    // ── Neither selected: outer = Action (collapsible), inner = Cause (heading) ──
    const byAction = groupBy(filtered, r => splitValues(r.activities).length ? splitValues(r.activities) : ['other']);
    const actionRgMap = buildRecordGroupsMap(byAction);
    // Map action key → display label for use in "also in" notes
    const actionDisplayMap = new Map();
    byAction.forEach((_, k) => actionDisplayMap.set(k, actionTypeMap[k] || k));
    // Rebuild actionRgMap with display labels
    const actionRgMapDisplay = new Map();
    actionRgMap.forEach((groups, rec) => {
      actionRgMapDisplay.set(rec, groups.map(g => actionDisplayMap.get(g) || g));
    });
    Array.from(byAction.keys()).sort().forEach(action => {
      const actionRecs = byAction.get(action);
      const actionLabel = actionTypeMap[action] || action;

      const byCause = groupBy(actionRecs, r => splitValues(r.cause).length ? splitValues(r.cause) : ['(none)']);
      const causeRgMap = buildRecordGroupsMap(byCause);

      // Build one unified table for all records under this action type,
      // inserting a single-cell separator row each time the cause changes.
      const table = document.createElement('table');
      table.className = 'actions-table';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>Title</th><th>Time</th><th>Description</th><th>Action Type</th><th>Cause</th><th>Mode</th><th>Frequency</th><th>Tag</th></tr>';
      table.appendChild(thead);
      const tbody = document.createElement('tbody');

      Array.from(byCause.keys()).sort().forEach(cause => {
        const causeRecs = byCause.get(cause);

        // Cause separator row — text only in first cell
        const separatorRow = document.createElement('tr');
        const separatorCell = document.createElement('td');
        separatorCell.textContent = cause;
        separatorCell.style.cssText = 'font-weight:700;font-size:1.15em;color:#fff;background:#6b82b5;padding:0.5em 0.8em;letter-spacing:0.02em;';
        separatorRow.appendChild(separatorCell);
        // Fill remaining cells so table doesn't break layout
        for (let i = 1; i < 8; i++) {
          const empty = document.createElement('td');
          empty.style.background = '#6b82b5';
          separatorRow.appendChild(empty);
        }
        tbody.appendChild(separatorRow);

        // Merge duplicate markers for each record
        const mergedRgMap = new Map();
        causeRecs.forEach(rec => {
          const notes = [];
          if (causeRgMap.has(rec)) notes.push(...causeRgMap.get(rec).filter(g => g !== cause).map(g => 'cause: ' + g));
          if (actionRgMapDisplay.has(rec)) notes.push(...actionRgMapDisplay.get(rec).filter(g => g !== actionLabel).map(g => 'action: ' + g));
          if (notes.length) mergedRgMap.set(rec, notes);
        });
        const rgMap = mergedRgMap.size ? mergedRgMap : null;

        causeRecs.forEach(rec => {
          const tr = document.createElement('tr');
          const tdTitle = document.createElement('td');
          if (rec.link) {
            const a = document.createElement('a');
            a.href = rec.link; a.target = '_blank';
            a.textContent = rec.title || rec.link;
            tdTitle.appendChild(a);
          } else {
            tdTitle.textContent = rec.title || '';
          }
          if (rgMap && rgMap.has(rec)) {
            const mark = document.createElement('span');
            mark.textContent = ' **';
            mark.title = 'Listed in multiple sections';
            mark.style.cssText = 'color:#888;font-size:0.85em;';
            tdTitle.appendChild(mark);
          }
          const tdTime = document.createElement('td'); tdTime.textContent = rec.time || '';
          const tdDesc = document.createElement('td'); tdDesc.textContent = rec.description || '';
          const tdActionType = document.createElement('td'); tdActionType.textContent = splitValues(rec.activities).map(a => actionTypeMap[a] || a).join(' ');
          const tdCause = document.createElement('td'); tdCause.textContent = rec.cause || '';
          const tdMode = document.createElement('td'); tdMode.textContent = rec.mode || '';
          const tdFreq = document.createElement('td'); tdFreq.textContent = rec.frequency || '';
          const tdTag = document.createElement('td'); tdTag.textContent = rec.tag || '';
          tr.append(tdTitle, tdTime, tdDesc, tdActionType, tdCause, tdMode, tdFreq, tdTag);
          tbody.appendChild(tr);
        });
      });

      table.appendChild(tbody);

      container.appendChild(
        makeCollapsible(
          `Action: ${actionLabel} <span style="font-weight:400;font-size:0.9em;">(${actionRecs.length})</span>`,
          table
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
  const frequencies = new Set();
  records.forEach(r => {
    splitValues(r.activities).forEach(a => strategies.add(a));
    splitValues(r.cause).forEach(c => causes.add(c));
    splitValues(r.mode).forEach(t => modes.add(t));
    splitValues(r.tag).forEach(t => tags.add(t));
    if (r.frequency) frequencies.add(r.frequency);
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
  populateSelect('filter-frequency', frequencies);

  // Read initial filters from URL params
  const params = new URLSearchParams(window.location.search);
  const initActionType = params.get('actiontype') || '';
  const initCause = params.get('cause') || '';
  const initMode = params.get('mode') || '';
  const initTag = params.get('tag') || '';
  const initFrequency = params.get('frequency') || '';
  if (initActionType) actionTypeSel.value = initActionType;
  if (initCause) document.getElementById('filter-cause').value = initCause;
  if (initMode) document.getElementById('filter-mode').value = initMode;
  if (initTag) document.getElementById('filter-tag').value = initTag;
  if (initFrequency) document.getElementById('filter-frequency').value = initFrequency;

  function applyFilters() {
    renderContent(
      records,
      document.getElementById('filter-actiontype').value,
      document.getElementById('filter-cause').value,
      document.getElementById('filter-mode').value,
      document.getElementById('filter-tag').value,
      document.getElementById('filter-frequency').value,
      actionTypeMap
    );
  }

  document.getElementById('filter-actiontype').addEventListener('change', applyFilters);
  document.getElementById('filter-cause').addEventListener('change', applyFilters);
  document.getElementById('filter-mode').addEventListener('change', applyFilters);
  document.getElementById('filter-tag').addEventListener('change', applyFilters);
  document.getElementById('filter-frequency').addEventListener('change', applyFilters);

  applyFilters();
});
