export async function getWeatherData() {
  const res = await fetch("http://127.0.0.1:8000/weather");
  return await res.json();
}