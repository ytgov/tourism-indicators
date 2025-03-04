// Data loading and processing utilities
export async function loadCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        const headers = rows[0].map(header => header.trim().replace(/\r$/, '')); // Remove any trailing \r
        const data = rows.slice(1).filter(row => row.length > 1);
        
        return {
            headers,
            data,
            raw: rows
        };
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return null;
    }
}

// Data formatting utilities
export const formatters = {
    number: (value) => new Intl.NumberFormat().format(value),
    currency: (value) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
    }).format(value),
    percentage: (value) => new Intl.NumberFormat('en-US', { 
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1 
    }).format(value / 100),
    millions: (value) => `${(value / 1000000).toFixed(1)}M`,
    thousands: (value) => `${(value / 1000).toFixed(1)}K`
};

// Data analysis utilities
export const analytics = {
    calculateYOYChange: (current, previous) => {
        return previous ? ((current - previous) / previous) * 100 : null;
    },
    
    calculateMovingAverage: (data, period = 3) => {
        return data.map((value, index, array) => {
            if (index < period - 1) return null;
            const sum = array.slice(index - period + 1, index + 1).reduce((a, b) => a + b, 0);
            return sum / period;
        });
    },
    
    findSeasonalPattern: (monthlyData) => {
        const monthlyAverages = Array(12).fill(0).map(() => ({ sum: 0, count: 0 }));
        
        monthlyData.forEach(item => {
            const month = new Date(item.date).getMonth();
            monthlyAverages[month].sum += item.value;
            monthlyAverages[month].count++;
        });
        
        return monthlyAverages.map(({ sum, count }) => count ? sum / count : 0);
    }
};
