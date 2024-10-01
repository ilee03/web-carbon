var bg;

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

function renderPage(tab) {
    // Get the current page's carbon emission from storage
    chrome.storage.local.get(['currentPageEmission'], (result) => {
        const currentPageCarbon = result.currentPageEmission || 0; // Default to 0 if not set
        const currentPageCarbonElement = document.getElementById('current-page-carbon');
        currentPageCarbonElement.innerHTML = formatCarbonWeight(currentPageCarbon);
    });
}
