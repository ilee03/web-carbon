// Send a blank message
chrome.extension.sendRequest({ nothing: "null" });
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "calculateCarbon") {
        let emissions = calculateCarbonEmissions(window.location.href);

        // Send the emissions data to the background script for storage
        chrome.storage.local.get(['totalCarbon'], function (result) {
            let totalEmissions = parseFloat(result.totalCarbon) || 0;
            totalEmissions += parseFloat(emissions);

            // Store the new total emissions value
            chrome.storage.local.set({ totalCarbon: totalEmissions.toFixed(2) });

            // Also store the current tab's emissions to display in the popup
            chrome.storage.local.set({ currentCarbon: emissions });
        });
    }
});

function calculateCarbonEmissions(url) {
    // Placeholder calculation: Replace this with actual logic to calculate emissions based on the URL.
    return (Math.random() * 5).toFixed(2);
}
