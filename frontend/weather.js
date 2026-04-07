let chartRegistry = {};

document.getElementById('run-btn').addEventListener('click', analyzeDB);

async function analyzeDB() {
    const city = document.getElementById('city_input').value;
    if (!city) return alert("Please enter a query name.");

    try {
        const res = await fetch(`http://localhost:8000/weather/${city}`);
        const json = await res.json();
        const dataset = json.data; 

        updateDashboard(dataset, city);
        initAllCharts(dataset);
    } catch (e) {
        alert("API Error: Check your FastAPI server.");
    }
}

function updateDashboard(list, city) {
    const latest = list[0];
    document.getElementById('target-view').innerText = city.toUpperCase();
    document.getElementById('record-count').innerText = list.length;
    document.getElementById('kpi-temp').innerText = latest.temperature.toFixed(1) + "°C";
    document.getElementById('kpi-hum').innerText = latest.humidity + "%";
    document.getElementById('kpi-vis').innerText = "10km";
}

function initAllCharts(list) {
    // Destroy previous instances to prevent overlap
    Object.values(chartRegistry).forEach(c => c.destroy());

    const labels = list.slice(0, 7).map((_, i) => `Point ${i + 1}`);

    // 1. Line Chart
    chartRegistry.line = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Temp', data: list.map(d => d.temperature), borderColor: '#4361ee', tension: 0.4, fill: true, backgroundColor: 'rgba(67, 97, 238, 0.1)' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Ring Chart (Doughnut)
    chartRegistry.ring = new Chart(document.getElementById('ringChart'), {
        type: 'doughnut',
        data: {
            labels: ['Oxygen', 'Nitrogen', 'Humidity'],
            datasets: [{ data: [21, 78, list[0].humidity], backgroundColor: ['#4361ee', '#4cc9f0', '#f72585'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
    });

    // 3. Bar Chart
    chartRegistry.bar = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Pressure', data: list.map(d => (d.pressure-1000)), backgroundColor: '#4cc9f0' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 4. Radar Chart
    chartRegistry.radar = new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: ['Humidity', 'Visibility', 'Wind', 'Temp', 'Pressure'],
            datasets: [{
                label: 'Health Check',
                data: [list[0].humidity, 80, list[0].wind_speed * 10, list[0].temperature * 2, 70],
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                borderColor: '#4361ee'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}