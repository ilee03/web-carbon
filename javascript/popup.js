var bg;
var carbonPerMB = 1.76; // Average carbon per MB of data transferred

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
    value = value % 1 === 0 ? value : value.toFixed(1);
    return value + suffix;
}

function calculateCarbonFromPageSize(pageSizeInKB) {
    return (pageSizeInKB / 1024) * (carbonPerMB * 1000); // Convert to grams
}

function getPageSize(url) {
    return new Promise((resolve) => {
        fetch(url, { method: 'HEAD' })
            .then((response) => {
                const contentLength = response.headers.get('Content-Length');
                resolve(contentLength ? parseInt(contentLength) / 1024 : 0); // Return size in KB
            })
            .catch(() => {
                resolve(0); // If fetching fails, return 0
            });
    });
}

async function renderPage(tab) {
    var today = bg.getDayCount(0);
    var todayCarbon = document.getElementById('today-carbon');
    todayCarbon.innerHTML = formatCarbonWeight(today * carbonPerMB * 1000); // Total CO2e for today

    var pageSizeInKB = await getPageSize(tab.url);
    var currentPageCarbon = calculateCarbonFromPageSize(pageSizeInKB);

    var currentPageCarbonElement = document.getElementById('current-page-carbon');
    currentPageCarbonElement.innerHTML = formatCarbonWeight(currentPageCarbon);

    var dayArr = [];
    var chart = document.getElementById('chart');
    for (var i = 29; i >= 0; i--) {
        var dayCount = bg.getDayCount(i);
        dayArr[i] = dayCount * (carbonPerMB * 1000); // Total CO2e for the day
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
        if (i === 0) {
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
