var storage = window.localStorage;
var _dayPrefix = 'p'; // Prefix for pageviews
var _domainPrefix = 'd'; // Prefix for domain-specific pageviews
var _dailyCount = 0;
var _keepDays = 45;
var carbonPerPage = 1.76; // Carbon per page view (grams)

// Format date to get the right day key
function formatDate(prev, sep) {
	sep = sep ? sep : "";
	var now = new Date();
	var td = new Date(now.getFullYear(), now.getMonth(), now.getDate() - prev);
	var dateParts = [
		('0000' + td.getFullYear()).slice(-4),		// year: YYYY
		('00' + (td.getMonth() + 1)).slice(-2),		// month: MM
		('00' + td.getDate()).slice(-2)				// day: DD
	];
	return dateParts.join(sep);
}

// Get key for pageviews on a specific day
function getDayKey(d) {
	return _dayPrefix + d;
}

// Get key for the domain
function getDomainKey(domain) {
	return _domainPrefix + domain;
}

// Set pageviews for a specific day and store it in localStorage
function setDayCount(previous, obj) {
	storage.setItem(getDayKey(formatDate(previous)), obj);
}

// Get the pageviews for a specific day from localStorage
function getDayCount(previous) {
	var c = storage.getItem(getDayKey(formatDate(previous)));
	return c == null ? 0 : parseInt(c);
}

// Get pageviews for the current domain
function getDomainCount(domain) {
	var c = storage.getItem(getDomainKey(domain));
	return c == null ? 0 : parseInt(c);
}

// Set pageviews for the current domain
function setDomainCount(domain, count) {
	storage.setItem(getDomainKey(domain), count);
}

// Get total CO₂e across all websites
function getTotalCO2e() {
	var totalPageviews = 0;
	getAllKeys(_dayPrefix).forEach(key => {
		totalPageviews += parseInt(storage.getItem(key)) || 0;
	});
	return totalPageviews * carbonPerPage; // Return in grams
}

// Get CO₂e for the current domain
function getDomainCO2e(domain) {
	var domainPageviews = getDomainCount(domain);
	return domainPageviews * carbonPerPage; // Return in grams
}

// localStorage key lifecycle management
function getAllKeys(prefix) {
	return Object.keys(storage).filter(x => x.startsWith(prefix));
}

// Get all keys older than a specified number of days
function getOldDayKeys(keep) {
	var newKeys = [];
	for (var i = keep - 1; i >= 0; i--) {
		newKeys.push(getDayKey(formatDate(i)));
	}
	return getAllKeys(_dayPrefix).filter(x => !newKeys.includes(x));
}

// Delete keys older than the keep value
function purgeOldKeys(keep) {
	getOldDayKeys(keep).forEach(function (item) {
		storage.removeItem(item);
	});
}

// Track pageviews for current domain
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	var currentDomain = new URL(tabs[0].url).hostname;
	var currentDomainCount = getDomainCount(currentDomain) + 1;
	setDomainCount(currentDomain, currentDomainCount);
	
	_dailyCount = getDayCount(0) + 1;
	setDayCount(0, _dailyCount);
});

// Load listeners for request
chrome.extension.onRequest.addListener(function (f, s, r) {
	// Daily pageviews increment and store in localStorage
	_dailyCount = getDayCount(0) + 1;
	setDayCount(0, _dailyCount);

	// Remove old keys if the number of days exceeds the keep limit
	if (getAllKeys(_dayPrefix).length > _keepDays) {
		purgeOldKeys(_keepDays);
	}

	// Respond with CO₂e info
	r({
		domainCO2e: getDomainCO2e(new URL(s.tab.url).hostname),
		totalCO2e: getTotalCO2e()
	});
});
