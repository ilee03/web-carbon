var bg;
var carbonPerPage = 1.76; // Average carbon per page view in grams

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    bg = chrome.extension.getBackgroundPage();
    renderPage(tabs[0]);
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
    value = value % 1 == 0 ? value : value.toFixed(1);
    return value + suffix;
}

function calculateCurrentPageCarbon(tab) {
    // For demonstration, we'll use the size of the page in bytes to estimate CO2 emissions
    // You might want to modify this logic based on actual network usage
    var pageSize = tab.url ? 1000 : 0; // Mocking page size in bytes; replace with actual size calculation if available

    // Assume 0.0001 kg of CO2 per byte as an example factor
    var emissionsPerByte = 0.0001; // Adjust this value based on research/real-world data

    return pageSize * emissionsPerByte * 1000; // Convert kg to grams
}

function renderPage(tab) {
    var today = bg.getDayCount(0);
    var todayCarbon = document.getElementById('today-carbon');
    todayCarbon.innerHTML = formatCarbonWeight(today * carbonPerPage);

    // Calculate CO2e for the current page
    var currentPageCarbon = calculateCurrentPageCarbon(tab); // Use the new function to calculate CO2 emissions
    var currentPageCarbonElement = document.getElementById('current-page-carbon');
    currentPageCarbonElement.innerHTML = formatCarbonWeight(currentPageCarbon);

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

    for (var i = 29; i >= 0; i--) {
        var dayCount = dayArr[i];
        var barHeight = parseInt(dayCount * ratio);

        var column = document.createElement('div');
        column.setAttribute('class', 'chart-column');
        column.setAttribute('title', formatCarbonWeight(dayCount) + ' on ' + bg.formatDate(i, '-'));
        column.style.height = parseInt(columnHeight) + 'px';

        var area = document.createElement('div');
        area.setAttribute('class', 'chart-area');
        area.style.height = parseInt(columnHeight) + 'px';
        column.appendChild(area);

        var barWrap = document.createElement('div');
        barWrap.setAttribute('class', 'chart-bar-wrap');
        barWrap.style.height = barHeight + 'px';
        area.appendChild(barWrap);

        bar = document.createElement('div');
        bar.setAttribute('class', 'chart-bar');
        if (i == 0) {
            bar.setAttribute('class', 'chart-bar today');
        }
        bar.style.height = barHeight + 'px';
        barWrap.appendChild(bar);
        chart.appendChild(column);

        if (dayCount > 0) {
            sum += dayCount;
            days++;
        }
    }

    if (days > 7) {
        var chartDefault = document.getElementById('chart-default');
        chartDefault.setAttribute('class', 'chart-default-hidden');
    }
}
