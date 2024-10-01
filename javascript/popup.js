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

function renderPage() {
	var today = bg.getDayCount(0)
	var todayCarbon = document.getElementById('today-carbon');
	todayCarbon.innerHTML = formatCarbonWeight(today * carbonPerPage);

	var dayArr = [];
	var chart = document.getElementById('chart');
	for (var i = 29; i >= 0; i--) {
		var dayCount = bg.getDayCount(i);
		dayArr[i] = dayCount * carbonPerPage;
	}
	var max = dayArr.length ? Math.max.apply(null, dayArr) : 0;

	var columnHeight = 120.0;
	var ratio = columnHeight / max;
	var bar = null;
	var sum = 0;
	var days = 0;
	chart.style.height = (parseInt(columnHeight)) + 'px';



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

}