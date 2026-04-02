from backend.config.settings import WEATHER_MAP_KEY
import requests
def fetch_data(city):
    if not isinstance(city,str):
        return("city must be string")
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_MAP_KEY}"
        response=requests.get(url)
        if response.status_code!=200:
            return ("Api_error:",response.txt)
            return None
        else:
            return response.json()
    except Exception as e:
        print("error: ",e)
        return None