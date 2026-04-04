import { getWeatherData } from "./services/api.js";
import { renderTable } from "./components/table.js";

async function init() {
  const data = await getWeatherData();

  const tableHTML = renderTable(data);

  document.getElementById("table-container").innerHTML = tableHTML;
}

init();