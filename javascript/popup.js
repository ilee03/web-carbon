var bg;
var carbonPerPage = 1.76; // Average carbon per page view

// Get the background page and render the data
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	bg = chrome.extension.getBackgroundPage();
	renderPage(tabs[0].url); // Pass the current tab's URL
});

// Helper function to format the carbon weight
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

// Function to render the popup page
function renderPage(currentUrl) {
	const today = bg.getDayCount(0); // Get today's total pageviews
	const currentDomain = new URL(currentUrl).hostname; // Extract the domain from the URL
	const domainCO2e = bg.getDomainCO2e(currentDomain); // Get CO₂e for the current domain
	const totalCO2e = bg.getTotalCO2e(); // Get total CO₂e across all domains

	// Display today's carbon for all websites
	document.getElementById('today-carbon').innerHTML = formatCarbonWeight(today * carbonPerPage);
	
	// Display current website's CO₂e
	document.getElementById('current-domain-carbon').innerHTML = formatCarbonWeight(domainCO2e);
	
	// Display total CO₂e across all websites
	document.getElementById('total-carbon').innerHTML = formatCarbonWeight(totalCO2e);

	// Build the chart for the past 30 days of total CO₂e
	const dayArr = [];
	const chart = document.getElementById('chart');
	for (let i = 29; i >= 0; i--) {
		dayArr[i] = bg.getDayCount(i) * carbonPerPage;
	}
	const max = Math.max(...dayArr, 0);
	const columnHeight = 120;
	const ratio = max > 0 ? columnHeight / max : 0;

	chart.innerHTML = ''; // Clear the chart before rendering
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
