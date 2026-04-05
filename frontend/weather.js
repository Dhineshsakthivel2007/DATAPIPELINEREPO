let tempChart, radarChart;

// Main Fetch Function
async function fetchWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    if (!city) return;

    const loader = document.getElementById('loader');
    const dash = document.getElementById('mainDash');

    // UI Feedback: Show loader
    loader.style.display = 'grid';
    dash.classList.remove('active');

    try {
        const response = await fetch(`http://127.0.0.1:8000/weather/${city}`);
        if (!response.ok) throw new Error("City not found");
        
        const result = await response.json();
        const data = result.data[0];

        updateDashboardUI(data);
        updateCharts(data);

        // Simulated delay for "Scanning" feel
        setTimeout(() => {
            loader.style.display = 'none';
            dash.classList.add('active');
        }, 1000);

    } catch (error) {
        console.error(error);
        alert("Atmospheric data unavailable. Ensure the local server is running.");
        loader.style.display = 'none';
    }
}

// Update DOM elements
function updateDashboardUI(data) {
    document.getElementById('cityName').innerText = data.city.toUpperCase();
    document.getElementById('countryCode').innerText = data.country;
    document.getElementById('currTemp').innerText = Math.round(data.temperature);
    document.getElementById('weatherDesc').innerText = data.description;
    document.getElementById('humVal').innerText = data.humidity + '%';
    document.getElementById('humBar').style.width = data.humidity + '%';
    document.getElementById('pressVal').innerText = data.pressure + ' hPa';
    document.getElementById('seaVal').innerText = data.sea_level + ' hPa';
    document.getElementById('windSpd').innerText = data.wind_speed + ' m/s';
    
    // Rotate Compass Needle
    document.getElementById('windNeedle').style.transform = `rotate(${data.wind_deg}deg)`;

    // Solar Transit (Sun Icon Progress)
    const now = new Date().getTime();
    const rise = new Date(data.sunrise).getTime();
    const set = new Date(data.sunset).getTime();
    const progress = Math.min(Math.max((now - rise) / (set - rise), 0), 1);
    
    document.getElementById('sunIcon').style.left = (progress * 95) + '%';
    document.getElementById('sunriseTime').innerText = formatTime(data.sunrise);
    document.getElementById('sunsetTime').innerText = formatTime(data.sunset);

    // Dynamic Weather Emojis
    updateWeatherIcon(data.description);
}

function formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function updateWeatherIcon(desc) {
    const icon = document.getElementById('weatherIcon');
    const d = desc.toLowerCase();
    if (d.includes('rain')) icon.innerText = '🌧️';
    else if (d.includes('cloud')) icon.innerText = '☁️';
    else if (d.includes('clear')) icon.innerText = '☀️';
    else if (d.includes('storm')) icon.innerText = '⛈️';
    else icon.innerText = '🌤️';
}

// Data Visualization
function updateCharts(data) {
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    const ctxRadar = document.getElementById('radarChart').getContext('2d');

    if (tempChart) tempChart.destroy();
    if (radarChart) radarChart.destroy();

    // Line Chart with Area Gradient
    const gradient = ctxTemp.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
    gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

    tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: ['Low', 'Current', 'High'],
            datasets: [{
                label: 'Temperature °C',
                data: [data.min_temperature, data.temperature, data.max_temperature],
                borderColor: '#0ea5e9',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                x: { grid: { display: false }, ticks: { color: '#64748b' } }
            }
        }
    });

    // Radar Chart for Atmospheric comparison
    radarChart = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Humidity', 'Pressure', 'Wind', 'Ground', 'Stability'],
            datasets: [{
                data: [
                    data.humidity, 
                    (data.pressure - 980) * 2, 
                    data.wind_speed * 4, 
                    (data.ground_level - 980) * 2, 
                    75
                ],
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: '#8b5cf6',
                pointBackgroundColor: '#fff'
            }]
        },
        options: {
            scales: {
                r: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { display: false },
                    pointLabels: { color: '#94a3b8', font: { size: 11, family: 'Space Grotesk' } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// Event Listeners
document.getElementById('fetchBtn').addEventListener('click', fetchWeather);
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather();
});