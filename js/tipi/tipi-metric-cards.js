import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/tc_tourism_industry_performance_index.csv?" + Math.random();

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(csv => {
            const rows = csv.split(/\r?\n/).map(row => row.replace(/"/g, '').split(','));
            const data = rows.slice(1)
                .filter(row => row.length >= 2 && row[0].trim())
                .map(row => ({
                    year: parseInt(row[0]),
                    value: parseFloat(row[1])
                }))
                .filter(item => !isNaN(item.year) && !isNaN(item.value))
                .sort((a, b) => a.year - b.year);

            if (data.length === 0) throw new Error("No valid data points found");

            const latest = data[data.length - 1];
            const previous = data[data.length - 2];
            const baseline2019 = data.find(d => d.year === 2019);

            const yoyChange = previous
                ? ((latest.value - previous.value) / previous.value) * 100
                : 0;
            const vs2019Change = baseline2019
                ? ((latest.value - baseline2019.value) / baseline2019.value) * 100
                : null;

            updateMetricsCards(latest, previous, yoyChange, vs2019Change);
        })
        .catch(error => console.error("Error processing TIPI data:", error));

    function updateMetricsCards(latest, previous, yoyChange, vs2019Change) {
        const latestValue = document.getElementById("latest-value");
        const latestValueDate = document.getElementById("latest-value-date");
        if (latestValue) latestValue.textContent = latest.value.toFixed(1);
        if (latestValueDate) latestValueDate.textContent = "index value in " + latest.year;

        const yoyAmount = document.getElementById("yoy-amount");
        const yoyDateRange = document.getElementById("yoy-date-range");
        if (yoyAmount) {
            const color = yoyChange > 1 ? '#0f6726' : yoyChange < -1 ? '#a42330' : '#6c757d';
            const arrow = createArrowSvg(yoyChange);
            yoyAmount.innerHTML = `<span style="color: ${color};">${arrow}${yoyChange.toFixed(1)}% y/y</span>`;
        }
        if (yoyDateRange && previous) {
            yoyDateRange.textContent = "compared to " + previous.year;
        }

        const vs2019El = document.getElementById("vs2019-change");
        const vs2019Label = document.getElementById("vs2019-label");
        if (vs2019El && vs2019Change !== null) {
            const color = vs2019Change > 1 ? '#0f6726' : vs2019Change < -1 ? '#a42330' : '#6c757d';
            const arrow = createArrowSvg(vs2019Change);
            vs2019El.innerHTML = `<span style="color: ${color};">${arrow}${vs2019Change.toFixed(1)}%</span>`;
        }
        if (vs2019Label) vs2019Label.textContent = "compared to 2019";
    }
});
