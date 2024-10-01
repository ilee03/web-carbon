var storage = window.localStorage;
var _dayPrefix = 'p';
var _dailyCount = 0;
var _keepDays = 45;

function formatDate(prev, sep) {
	sep = sep ? sep : "";
	var now = new Date();
	var td = new Date(now.getFullYear(), now.getMonth(), now.getDate() - prev);
	var dateParts = [
		('0000' + td.getFullYear()).slice(-4),		// year: YYYY
		('00' + (td.getMonth() + 1)).slice(-2),		// month: MM
		('00' + td.getDate()).slice(-2)				// day: DD
	]
	return dateParts.join(sep);
}

function getDayKey(d) {
	return _dayPrefix + d;
}

function setDayCount(previous, obj) { // Put day's pageviews into storage
	storage.setItem(getDayKey(formatDate(previous)), obj);
}

function getDayCount(previous) { // Pull day's pageviews from storage
	var c = storage.getItem(getDayKey(formatDate(previous)));
	return c == null ? 0 : parseInt(c);
}


// localStorage key lifecycle management
function getAllKeys(prefix) { // Get all keys with `prefix`
	return Object.keys(storage).filter(x => x.startsWith(prefix))
}

function getOldDayKeys(keep) {	// Get array of keys older than `keep`
	var newKeys = [];
	for (var i = keep - 1; i >= 0; i--) {
		newKeys.push(getDayKey(formatDate(i)));
	}
	return getAllKeys(_dayPrefix).filter(x => !newKeys.includes(x));
}

function purgeOldKeys(keep) { // Delete all keys older than `keep`
	getOldDayKeys(keep).forEach(function (item, index) { storage.removeItem(item) });
}


// Load listeners
chrome.extension.onRequest.addListener(function (f, s, r) {
	_dailyCount = getDayCount(0) + 1;
	setDayCount(0, _dailyCount);
});

chrome.extension.onRequest.addListener(function (f, s, r) {
	if (getAllKeys(_dayPrefix).length > _keepDays) {
		purgeOldKeys(_keepDays);
	}
});

// Function to fetch the size of the webpage
async function getPageSize(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.executeScript(tabId, {
            code: `
                (function() {
                    let totalSize = 0;
                    let images = Array.from(document.images);

                    // Calculate size of images
                    images.forEach((img) => {
                        if (img.complete) {
                            totalSize += img.naturalWidth * img.naturalHeight * 4; // Assume 4 bytes per pixel (RGBA)
                        }
                    });

                    // Estimate size of the rest of the page
                    let pageSize = document.documentElement.outerHTML.length; // Approximate page size in characters
                    totalSize += pageSize; // Add HTML size

                    return totalSize;
                })();
            `,
        }, (results) => {
            resolve(results[0]);
        });
    });
}

// Modify the listener for page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        getPageSize(tabId).then(pageSize => {
            // Convert size to kilobytes
            const sizeInKB = pageSize / 1024;
            // Assuming an emission factor of 0.0005 g CO2 per KB
            const emissionFactor = 0.0005;
            const carbonEmission = sizeInKB * emissionFactor; // in grams

            // Store or send the emission data as needed
            chrome.storage.local.set({ currentPageEmission: carbonEmission });
        });
    }
});
