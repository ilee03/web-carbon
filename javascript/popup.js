var bg;
var carbonPerPage = 1.76; // Average carbon per page view

chrome.tabs.getSelected(null, function (tab) {
	bg = chrome.extension.getBackgroundPage();
	renderPage();
});

function formatCarbonWeight(value) {
	let suffix = "g";
	if (value >= 1e9) {
		value = value / 1e9;
		suffix = "mmt";
	} else if (value >= 1e6) {
		value = value / 1e6;
		suffix = "mt";
	} else if (value >= 1e3) {
		value = value / 1e3;
		suffix = "kg";
	}
	return value % 1 === 0 ? value : value.toFixed(1) + suffix;
}

function renderPage() {
	const today = bg.getDayCount(0);
	document.getElementById('today-carbon').innerHTML = formatCarbonWeight(today * carbonPerPage);

	const dayArr = [];
	const chart = document.getElementById('chart');
	for (let i = 29; i >= 0; i--) {
		dayArr[i] = bg.getDayCount(i) * carbonPerPage;
	}
	const max = Math.max(...dayArr, 0);
	const columnHeight = 120;
	const ratio = max > 0 ? columnHeight / max : 0;

	chart.innerHTML = ''; // Clear chart before rendering
	let sum = 0, days = 0;

	dayArr.forEach((dayCount, i) => {
		const barHeight = dayCount * ratio;
		const column = document.createElement('div');
		column.className = 'chart-column';
		column.title = `${formatCarbonWeight(dayCount)} on ${bg.formatDate(i, '-')}`;
		
		const bar = document.createElement('div');
		bar.className = i === 0 ? 'chart-bar today' : 'chart-bar';
		bar.style.height = `${barHeight}px`;

		column.appendChild(bar);
		chart.appendChild(column);

		if (dayCount > 0) {
			sum += dayCount;
			days++;
		}
	});

	const avgDay = days > 0 ? sum / days : 0;
	if (avgDay) {
		document.getElementById('forecast-count').innerHTML = formatCarbonWeight(avgDay * 365);
	}

	// Hide the default message if data is available
	if (days > 7) {
		document.getElementById('chart-default').classList.add('chart-default-hidden');
	}
}
