// Parse link-list.txt and filter/group records by cause
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
		} else if (line.startsWith('Cause: ')) {
			rec.cause = line.replace('Cause: ', '').trim();
			// End of record
			if (rec.title || rec.description) {
				records.push(rec);
			}
			rec = {};
		}
	});
	return records;
}

function filterByCause(records, selectedCause) {
	// Filter records by cause (case-insensitive, comma-separated supported)
	return records.filter(rec => {
		if (!rec.cause) return false;
		return rec.cause.split(',').map(c => c.trim().toLowerCase()).includes(selectedCause.toLowerCase());
	});
}

function groupByAction(records) {
	// Group records by each action (strategy)
	const groupMap = {};
	records.forEach(rec => {
		let actions = rec.activities ? rec.activities.split(',').map(a => a.trim()) : ['Other'];
		if (actions.length === 0) actions = ['Other'];
		actions.forEach(action => {
			if (!groupMap[action]) groupMap[action] = [];
			groupMap[action].push(rec);
		});
	});
  console.log('Grouped records by action:', groupMap);
	return groupMap;
}

// Load strategy-symbols.txt and build a map
async function loadStrategySymbols() {
  const response = await fetch('strategy-symbols.txt');
  const text = await response.text();
  const map = {};
  text.split('\n').forEach(line => {
    const [strategy, display] = line.split(',');
    if (strategy && display) map[strategy.trim()] = display.trim();
  });
  return map;
}

const params = new URLSearchParams(window.location.search);
const cause = params.get('cause');
const strategy = params.get('strategy');

function filterByStrategy(records, selectedStrategy) {
	if (!selectedStrategy) return records;
	return records.filter(rec => {
		if (!rec.activities) return false;
		return rec.activities.split(',').map(a => a.trim().toLowerCase()).includes(selectedStrategy.toLowerCase());
	});
}

Promise.all([loadLinks(), loadStrategySymbols()]).then(([records, strategyMap]) => {
	let filtered = records;
	if (cause) {
		filtered = filterByCause(filtered, cause);
	}
	if (strategy) {
		filtered = filterByStrategy(filtered, strategy);
	}
	const groupMap = groupByAction(filtered);
	const tagList = document.getElementById('tag-list');
	tagList.innerHTML = '';
	Object.keys(groupMap).sort().forEach(action => {
		// Create and append action heading
		const groupHeader = document.createElement('h3');
		groupHeader.textContent = 'Action: ' + action;
		groupHeader.style.marginTop = '2em';
		tagList.appendChild(groupHeader);
		groupMap[action].forEach(rec => {
			// Render record
			const recDiv = document.createElement('div');
			recDiv.style.marginBottom = '1em';
			// Map activities to symbols
			let activityDisplay = '';
			if (rec.activities) {
				const acts = rec.activities.split(',').map(a => a.trim());
				activityDisplay = acts.map(a => strategyMap[a] || a).join(' ');
			}
			recDiv.innerHTML = `
				<strong>${rec.link ? `<a href="${rec.link}" target="_blank">${rec.title || ''}</a>` : rec.title || ''}</strong><br>
				<span>${rec.description || ''}</span><br>
				<div>${activityDisplay}</div>
			`;
			tagList.appendChild(recDiv);
		});
	});
});
