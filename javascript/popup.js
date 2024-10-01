document.addEventListener('DOMContentLoaded', function () {
    const co2ValueElement = document.getElementById('co2Value');

    // Example function to fetch CO2 value (adjust based on your API)
    function fetchCO2Data() {
        // Simulating an API call
        const co2Value = 0.002; // Replace with the actual fetch logic
        co2ValueElement.innerText = `${co2Value} kg CO2`;
    }

    fetchCO2Data();
});
