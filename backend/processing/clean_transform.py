import datetime
import pandas as pd
def category(temp_c):
    if temp_c<15:
        return "cold"
    elif temp_c<=20:
        return "cool"
    elif temp_c<30:
        return "warm"
    elif temp_c>=30:
        return "very_hot"
def data_forming(data):
    if not data:
        print("data is not fetched")
        return None
    try:
        temp=data.get("main",{}).get("temp")
        temp_c = temp - 273.15 if temp is not None else None
        min_temperature=data.get("main",{}).get("temp_min")
        max_temperature=data.get("main",{}).get("temp_max")
        sunrise=data.get("sys",{}).get("sunrise")
        sunset=data.get("sys",{}).get('sunset')
        df=pd.DataFrame([
            {
        "city":data.get("name").strip().lower() if data.get("name") is not None else None,
        "country":data.get("sys",{}).get("country").strip().lower() if data.get("sys",{}).get("country") else None,
        "longitude":data.get("coord",{}).get("lon"),
        "latitude":data.get("coord",{}).get("lat"),
        "wind_speed":data.get("wind",{}).get("speed"),
        "wind_deg":data.get("wind",{}).get("deg"),
        "temperature":temp_c if temp_c is not None else None,
        "category":category(temp_c) if temp_c is not None else None,
        "min_temperature":min_temperature-273.15 if min_temperature  is not None else None,
        "max_temperature":max_temperature-273.15 if max_temperature is not None else None,
        "sea_level":data.get("main",{}).get("sea_level"),
        "ground_level":data.get("main",{}).get("grnd_level"),
        "humidity":data.get("main",{}).get("humidity"),
        "pressure":data.get("main",{}).get("pressure"),
        "sunrise":datetime.datetime.fromtimestamp(sunrise) if sunrise is not None else None,
        "sunset":datetime.datetime.fromtimestamp(sunset) if sunset is not None else None,
        "description":data.get("weather", [{}])[0].get("description"),
        "collected_at":datetime.datetime.now()
        }
         ])
        return df 
    except Exception as e:
        print("error:",e)
        return None

