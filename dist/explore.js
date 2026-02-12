console.log('explore.js loaded');
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
	return groupMap;
}

function groupByCause(records) {
	// Group records by each cause
	const groupMap = {};
	records.forEach(rec => {
		let causes = rec.cause ? rec.cause.split(',').map(c => c.trim()) : ['Other'];
		if (causes.length === 0) causes = ['Other'];
		causes.forEach(cause => {
			if (!groupMap[cause]) groupMap[cause] = [];
			groupMap[cause].push(rec);
		});
	});
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

// Show filter label below Resources heading, even if DOMContentLoaded already fired
function setFilterLabel() {
	const labelDiv = document.getElementById('filter-label');
	if (labelDiv) {
		if (strategy) {
			labelDiv.textContent = `Strategy: ${strategy}`;
		} else if (cause) {
			labelDiv.textContent = `Cause: ${cause}`;
		} else {
			labelDiv.textContent = '';
		}
	}
}
if (document.readyState === 'loading') {
	window.addEventListener('DOMContentLoaded', setFilterLabel);
} else {
	setFilterLabel();
}


function filterByStrategy(records, selectedStrategy) {
	if (!selectedStrategy) return records;
	return records.filter(rec => {
		if (!rec.activities) return false;
		return rec.activities.split(',').map(a => a.trim().toLowerCase()).includes(selectedStrategy.toLowerCase());
	});
}

Promise.all([loadLinks(), loadStrategySymbols()]).then(([records, strategyMap]) => {
	let filtered = records;
	let groupMap;
	let headingType;
	if (strategy) {
		filtered = filterByStrategy(filtered, strategy);
		groupMap = groupByCause(filtered);
		headingType = 'Cause';
	} else if (cause) {
		filtered = filterByCause(filtered, cause);
		groupMap = groupByAction(filtered);
		headingType = 'Action';
	} else {
		groupMap = groupByAction(filtered);
		headingType = 'Action';
	}
	const tagList = document.getElementById('tag-list');
	tagList.innerHTML = '';
	Object.keys(groupMap).sort().forEach(group => {
		// Create and append heading
		const groupHeader = document.createElement('h3');
		groupHeader.textContent = headingType + ': ' + group;
		groupHeader.style.marginTop = '2em';
		tagList.appendChild(groupHeader);
		const ul = document.createElement('ul');
		ul.style.listStyle = 'disc outside';
		ul.style.paddingLeft = '0.4em';
		ul.style.margin = '0';
		groupMap[group].forEach(rec => {
			let activityDisplay = '';
			if (rec.activities) {
				const acts = rec.activities.split(',').map(a => a.trim());
				activityDisplay = acts.map(a => strategyMap[a] || a).join(' ');
			}
			const li = document.createElement('li');
			li.style.marginBottom = '0.7em';
			li.style.textIndent = '-0.4em';
			li.style.paddingLeft = '0.4em';
				li.innerHTML = `${rec.link ? `<a href=\"${rec.link}\" target=\"_blank\">${rec.title || ''}</a>` : rec.title || ''} ${rec.description ? rec.description : ''}${activityDisplay ? '<br><span style=\"color:#23408e;font-size:0.98em;\">' + activityDisplay + '</span>' : ''}`;
			ul.appendChild(li);
		});
		tagList.appendChild(ul);
	});
});
