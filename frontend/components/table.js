export function renderTable(data) {
  let html = `
    <table>
      <tr>
        <th>City</th>
        <th>Temp</th>
        <th>Condition</th>
        <th>Humidity</th>
      </tr>
  `;

  data.forEach(item => {
    html += `
      <tr>
        <td>${item.city}</td>
        <td>${item.temperature}°C</td>
        <td>${item.condition}</td>
        <td>${item.humidity}%</td>
      </tr>
    `;
  });

  html += "</table>";
  return html;
}