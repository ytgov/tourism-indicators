document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/tc_tourism_industry_performance_index.csv?" + Math.random();

    const columns = [
        { key: 'CBRE_RevPAR',       label: 'Hotel RevPAR' },
        { key: 'AirDNA_Revenue',     label: 'Short-term rental revenue' },
        { key: 'Restaurant_Spend',   label: 'Restaurant sales' },
        { key: 'Retail_Sales',       label: 'Retail sales' },
        { key: 'Air_Arrivals',       label: 'Airport arrivals' },
        { key: 'Highway_Counts',     label: 'Highway traffic' },
    ];

    fetch(csvUrl)
        .then(r => r.text())
        .then(csv => {
            const rows = csv.split(/\r?\n/).map(r => r.replace(/"/g, '').split(','));
            const headers = rows[0];
            const data = rows.slice(1)
                .filter(r => r.length >= 2 && r[0].trim())
                .map(r => {
                    const obj = { year: parseInt(r[0]) };
                    headers.forEach((h, i) => { obj[h.trim()] = parseFloat(r[i]); });
                    return obj;
                })
                .filter(r => !isNaN(r.year))
                .sort((a, b) => a.year - b.year);

            const years = data.map(r => r.year);

            // Build flat series data: [colIndex, rowIndex, value]
            // Highcharts heatmap: x = column (indicator), y = row (year, reversed so newest on top)
            // First pass: find max distance above and below 100 for separate normalization
            let maxAbove = 0, maxBelow = 0;
            data.forEach(row => {
                columns.forEach(col => {
                    const val = row[col.key];
                    if (!isNaN(val)) {
                        if (val - 100 > maxAbove) maxAbove = val - 100;
                        if (100 - val > maxBelow) maxBelow = 100 - val;
                    }
                });
            });

            // Interpolate between white (255,255,255) and a target rgb at a given alpha
            function interpolateColor(targetR, targetG, targetB, alpha) {
                const r = Math.round(255 + (targetR - 255) * alpha);
                const g = Math.round(255 + (targetG - 255) * alpha);
                const b = Math.round(255 + (targetB - 255) * alpha);
                return `rgb(${r},${g},${b})`;
            }

            function pointColor(val) {
                const delta = val - 100;
                if (delta > 0) {
                    // Green: #0f6723 = rgb(15, 103, 35), capped at 200 (delta = 100)
                    const alpha = Math.min(delta / 100, 1);
                    return { bg: interpolateColor(15, 103, 35, alpha), alpha };
                } else if (delta < 0) {
                    // Red: #a42330 = rgb(164, 35, 48)
                    const alpha = maxBelow > 0 ? Math.abs(delta) / maxBelow : 0;
                    return { bg: interpolateColor(164, 35, 48, alpha), alpha };
                }
                return { bg: '#ffffff', alpha: 0 };
            }

            // Second pass: build series data with per-point colors
            const seriesData = [];
            data.forEach((row, yi) => {
                columns.forEach((col, xi) => {
                    const val = row[col.key];
                    if (!isNaN(val)) {
                        const { bg, alpha } = pointColor(val);
                        seriesData.push({
                            x: xi,
                            y: yi,
                            value: val,
                            color: bg,
                            dataLabels: { color: alpha > 0.5 ? '#ffffff' : '#333333' }
                        });
                    }
                });
            });

            Highcharts.chart('tipi-heatmap-highcharts-container', {
                credits: { enabled: false },
                chart: {
                    type: 'heatmap',
                    marginTop: 90,
                    marginBottom: 10
                },
                title: {
                    text: 'Component indicators (index, 2018 = 100)',
                    style: { fontSize: '14px' }
                },
                xAxis: {
                    categories: columns.map(c => c.label),
                    opposite: true,
                    labels: { style: { fontSize: '14px' } }
                },
                yAxis: {
                    categories: years.map(String),
                    title: null,
                    reversed: true,
                    labels: { style: { fontSize: '14px' } }
                },
                colorAxis: false,
                legend: { enabled: false },
                tooltip: {
                    formatter: function () {
                        return `<b>${this.series.yAxis.categories[this.point.y]}</b><br/>
                                ${this.series.xAxis.categories[this.point.x]}: <b>${this.point.value.toFixed(1)}</b>`;
                    }
                },
                series: [{
                    name: 'Index value',
                    data: seriesData,
                    dataLabels: {
                        enabled: true,
                        formatter: function () { return this.point.value.toFixed(1); },
                        style: { fontSize: '13px', fontWeight: 'normal', textOutline: 'none' }
                    },
                    borderWidth: 1,
                    borderColor: '#e0e0e0'
                }]
            });
        })
        .catch(err => console.error('Error loading TIPI Highcharts heatmap data:', err));
});
