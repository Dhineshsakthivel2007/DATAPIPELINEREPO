/* ===========================
   ATMOS AI — weather.js
   Connects to FastAPI:
     GET /weather/{city}
     GET /predict/{city}
   =========================== */

const API_BASE = 'http://localhost:8000';

let charts = {};

// ---- BOOT ----
document.getElementById('run-btn').addEventListener('click', run);
document.getElementById('city_input').addEventListener('keydown', e => {
    if (e.key === 'Enter') run();
});

// ---- MAIN ORCHESTRATOR ----
async function run() {
    const city = document.getElementById('city_input').value.trim();
    if (!city) { alert('Please enter a city name.'); return; }

    const btn = document.getElementById('run-btn');
    btn.disabled = true;
    document.getElementById('loader').style.display = 'flex';

    try {
        const [weatherRes, predictRes] = await Promise.all([
            fetch(`${API_BASE}/weather/${city}`),
            fetch(`${API_BASE}/predict/${city}`)
        ]);

        if (!weatherRes.ok) throw new Error(`Weather API returned ${weatherRes.status}`);
        if (!predictRes.ok) throw new Error(`Predict API returned ${predictRes.status}`);

        const weatherJson = await weatherRes.json();
        const predictJson = await predictRes.json();

        const dataset = weatherJson.data;
        if (!dataset || !dataset.length) {
            alert('No data found. Check the city name.');
            return;
        }

        updateKPIs(dataset, city);
        updateMLBanner(dataset[0], predictJson);
        buildCharts(dataset, predictJson);
        buildTable(dataset);

    } catch (e) {
        alert('API Error: Make sure FastAPI is running at ' + API_BASE + '\n\nDetails: ' + e.message);
        console.error(e);
    } finally {
        btn.disabled = false;
        document.getElementById('loader').style.display = 'none';
    }
}

// ---- KPI UPDATE ----
function updateKPIs(list, city) {
    const d = list[0];
    document.getElementById('target-view').innerText  = city.toUpperCase();
    document.getElementById('record-count').innerText = list.length;
    document.getElementById('kpi-temp').innerText     = d.temperature.toFixed(1) + '°';
    document.getElementById('kpi-hum').innerText      = d.humidity + '%';
    document.getElementById('kpi-wind').innerText     = (d.wind_speed  || 0).toFixed(1);
    document.getElementById('kpi-pres').innerText     = Math.round(d.pressure || 0);
    document.getElementById('kpi-wdir').innerText     = (d.wind_deg || 0) + '°';
}

// ---- ML BANNER UPDATE ----
function updateMLBanner(latest, pred) {
    const predicted = pred.predicted_temperature;
    const actual    = latest.temperature;
    const delta     = typeof predicted === 'number' ? (predicted - actual).toFixed(2) : null;

    document.getElementById('pred-temp').innerText =
        typeof predicted === 'number' ? predicted.toFixed(2) : '--';

    const deltaEl = document.getElementById('pred-delta');
    if (delta !== null) {
        deltaEl.innerText = (delta >= 0 ? '+' : '') + delta + '°C';
        deltaEl.style.color = Math.abs(delta) < 2 ? '#10b981' : '#f59e0b';
    } else {
        deltaEl.innerText = '--';
        deltaEl.style.color = '#64748b';
    }

    document.getElementById('pred-source').innerText = (pred.source || 'API').toUpperCase();
}

// ---- CHART HELPERS ----
function destroyAll() {
    Object.values(charts).forEach(c => { try { c.destroy(); } catch (e) {} });
    charts = {};
}

const GRID_COLOR   = 'rgba(67,97,238,0.07)';
const TICK_COLOR   = '#64748b';
const TICK_FONT    = { size: 9 };

function axisStyle() {
    return {
        ticks: { color: TICK_COLOR, font: TICK_FONT },
        grid:  { color: GRID_COLOR }
    };
}

// ---- BUILD ALL CHARTS ----
function buildCharts(list, pred) {
    destroyAll();

    const N      = Math.min(list.length, 12);
    const labels = list.slice(0, N).map((_, i) => `T-${N - i}`);
    const temps  = list.slice(0, N).map(d => +d.temperature.toFixed(2));
    const predicted = pred.predicted_temperature;

    // 1. LINE — actual temps + ML predicted flat line
    charts.line = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Actual Temp',
                    data: temps,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67,97,238,0.08)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#4361ee'
                },
                {
                    label: 'ML Predicted',
                    data: Array(N).fill(
                        typeof predicted === 'number' ? +predicted.toFixed(2) : null
                    ),
                    borderColor: '#f72585',
                    borderDash: [6, 3],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: axisStyle(), y: axisStyle() }
        }
    });

    // 2. DOUGHNUT — atmospheric composition
    charts.ring = new Chart(document.getElementById('ringChart'), {
        type: 'doughnut',
        data: {
            labels: ['Oxygen', 'Nitrogen', 'Humidity'],
            datasets: [{
                data: [21, 78, list[0].humidity],
                backgroundColor: ['#4361ee', '#4cc9f0', '#f72585'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#64748b', font: { size: 10 }, boxWidth: 10, padding: 8 }
                }
            }
        }
    });

    // 3. BAR — pressure delta (color-coded by anomaly)
    const pressures = list.slice(0, N).map(d => +((d.pressure - 1000).toFixed(1)));
    charts.bar = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Pressure Δ (hPa - 1000)',
                data: pressures,
                backgroundColor: pressures.map(v =>
                    v > 15 ? 'rgba(247,37,133,0.7)' : 'rgba(76,201,240,0.7)'
                ),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ...axisStyle(), ticks: { color: TICK_COLOR, font: TICK_FONT, maxRotation: 0 } },
                y: axisStyle()
            }
        }
    });

    // 4. RADAR — ML feature space vs current reading (normalised 0–100)
    const d0      = list[0];
    const normHum  = d0.humidity;
    const normWind = Math.min((d0.wind_speed || 0) * 5, 100);
    const normTemp = Math.min(Math.max(d0.temperature + 40, 0), 100);
    const normPres = Math.min(Math.max((d0.pressure - 950) / 0.8, 0), 100);
    const normWDir = Math.min((d0.wind_deg || 0) / 3.6, 100);

    const mlTemp = typeof predicted === 'number'
        ? Math.min(Math.max(predicted + 40, 0), 100)
        : normTemp;

    charts.radar = new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: ['Humidity', 'Wind', 'Temp', 'Pressure', 'W.Dir'],
            datasets: [
                {
                    label: 'Current',
                    data: [normHum, normWind, normTemp, normPres, normWDir],
                    backgroundColor: 'rgba(67,97,238,0.2)',
                    borderColor: '#4361ee',
                    pointBackgroundColor: '#4361ee',
                    pointRadius: 3
                },
                {
                    label: 'ML Norm',
                    data: [normHum * 0.95, normWind * 1.05, mlTemp, normPres, normWDir],
                    backgroundColor: 'rgba(247,37,133,0.1)',
                    borderColor: '#f72585',
                    borderDash: [4, 2],
                    pointBackgroundColor: '#f72585',
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    ticks: { color: TICK_COLOR, font: TICK_FONT, backdropColor: 'transparent' },
                    grid: { color: 'rgba(67,97,238,0.15)' },
                    angleLines: { color: 'rgba(67,97,238,0.15)' },
                    pointLabels: { color: '#94a3b8', font: { size: 10 } }
                }
            }
        }
    });

    // 5. BUBBLE — humidity × wind speed, bubble radius encodes temperature magnitude
    const bubbleData = list.slice(0, Math.min(list.length, 15)).map(d => ({
        x: +d.humidity,
        y: +((d.wind_speed || 0).toFixed(2)),
        r: Math.max(4, Math.min(14, Math.abs(d.temperature) / 3))
    }));

    charts.bubble = new Chart(document.getElementById('bubbleChart'), {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Hum × Wind × Temp',
                data: bubbleData,
                backgroundColor: 'rgba(76,201,240,0.45)',
                borderColor: '#4cc9f0',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    ...axisStyle(),
                    title: { display: true, text: 'Humidity %', color: TICK_COLOR, font: TICK_FONT },
                    min: 0, max: 110
                },
                y: {
                    ...axisStyle(),
                    title: { display: true, text: 'Wind m/s', color: TICK_COLOR, font: TICK_FONT }
                }
            },
            layout: { padding: 10 }
        }
    });
}

// ---- DATA TABLE ----
function buildTable(list) {
    const rows = list.slice(0, 10);

    const tbody = rows.map((d, i) => {
        const t      = d.temperature;
        const status = t > 35
            ? '<span class="badge-high">High Temp</span>'
            : t < 5
                ? '<span class="badge-warn">Low Temp</span>'
                : '<span class="badge-ok">Normal</span>';

        return `<tr>
            <td style="color:#64748b">${i + 1}</td>
            <td>${t.toFixed(1)}°C</td>
            <td>${d.humidity}%</td>
            <td>${Math.round(d.pressure)} hPa</td>
            <td>${(d.wind_speed || 0).toFixed(1)} m/s</td>
            <td>${d.wind_deg || 0}°</td>
            <td>${status}</td>
        </tr>`;
    }).join('');

    document.getElementById('table-area').innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Temp (°C)</th>
                    <th>Humidity</th>
                    <th>Pressure</th>
                    <th>Wind</th>
                    <th>Wind Dir</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>`;
}