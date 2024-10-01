var bg;
var carbonPerPage = 1.76;	// Average carbon per page view

chrome.tabs.getSelected(null, function (tab) {
	bg = chrome.extension.getBackgroundPage();
	renderPage();
});

function formatCarbonWeight(value) {
	var suffix = "g";
	if (value >= 1000000000) {
		value = value / 1000000000;
		suffix = "mmt";
	} else if (value >= 1000000) {
		value = value / 1000000;
		suffix = "mt";
	} else if (value >= 1000) {
		value = value / 1000;
		suffix = "kg";
	}
	value = value % 1 == 0 ? value : value.toFixed(1)
	return value + suffix;
}



	var avgDay = sum / days;
	if (avgDay) {
		var year = avgDay * 365;
		var fc = document.getElementById('forecast-count');
		fc.innerHTML = formatCarbonWeight(year);

		var flight = 50 * 1000;
		var trees = 24 * 1000;
		if (year >= flight) {
			var fe = document.getElementById('flights');
			var ft = document.getElementById('trees');
			fe.innerHTML = "🛫  Whoa! That's equivalent to " + (year / flight).toFixed(0) + " flights between Paris and London. ";
			ft.innerHTML = "🌴  You need to plant " + (year / trees).toFixed(0) + " trees to offset this amount.";
		}
	}

