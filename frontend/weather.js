let predictionChart;

document.getElementById('run-btn').addEventListener('click', fetchReport);

async function fetchReport() {
    const city = document.getElementById('city_input').value;
    if (!city) return alert("Enter a city.");

    try {
        const res = await fetch(`http://127.0.0.1:8000/weather/${city}`);
        const json = await res.json();
        const data = json.data[0];

        document.getElementById('current-date').innerText = new Date().toLocaleDateString();
        document.getElementById('drift-alert').style.display = 'block';
        
        updateTable(data);
        renderBigChart(data);
    } catch (e) {
        alert("Server connection failed. Ensure FastAPI is running.");
    }
}

function updateTable(d) {
    const tbody = document.getElementById('drift-body');
    
    // Using real values from your API (d.temperature, d.humidity, etc.)
    const features = [
        { name: 'temperature', type: 'num', val: d.temperature, ref: 24.5 }, // Simulated Ref
        { name: 'humidity', type: 'num', val: d.humidity, ref: 60.0 },
        { name: 'windspeed', type: 'num', val: d.wind_speed, ref: 3.2 },
        { name: 'pressure', type: 'num', val: d.pressure, ref: 1012 }
    ];

    tbody.innerHTML = '';
    let driftCount = 0;

    features.forEach(f => {
        // Simple drift logic: if difference > 10% of reference
        const driftThreshold = f.ref * 0.1;
        const hasDrift = Math.abs(f.val - f.ref) > driftThreshold;
        if (hasDrift) driftCount++;

        tbody.innerHTML += `
            <tr>
                <td><strong>${f.name}</strong></td>
                <td>${f.type}</td>
                <td>${f.ref.toFixed(2)}</td> <td>${f.val.toFixed(2)}</td> <td><div class="mini-dist">${generateBars()}</div></td>
                <td><div class="mini-dist">${generateBars()}</div></td>
                <td class="${hasDrift ? 'status-label' : 'status-ok'}">
                    ${hasDrift ? 'Detected' : 'Not Detected'}
                </td>
                <td>K-S p_value</td>
            </tr>
        `;
    });

    document.getElementById('drift-percent').innerText = ((driftCount / features.length) * 100).toFixed(0);
}

function generateBars() {
    return Array.from({length: 10}, () => 
        `<div class="bar" style="height: ${Math.random() * 100}%"></div>`
    ).join('');
}

function renderBigChart(d) {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    if (predictionChart) predictionChart.destroy();

    predictionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Range A', 'Range B', 'Range C', 'Range D', 'Range E'],
            datasets: [
                {
                    label: 'Reference',
                    data: [15, 25, 10, 5, 2],
                    backgroundColor: '#cbd5e0'
                },
                {
                    label: 'Current',
                    data: [d.temperature/2, d.humidity/4, d.wind_speed*2, 10, 5],
                    backgroundColor: '#e53e3e'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: '#edf2f7' },
                    ticks: { color: '#718096' } 
                },
                x: { grid: { display: false }, ticks: { color: '#718096' } }
            }
        }
    });
}