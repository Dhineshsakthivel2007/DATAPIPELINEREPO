from backend.ingestion.fetch_weather import fetch_data
import datetime
import pandas as pd
def catagory(temp_c):
    if temp_c<15:
        return "cold"
    elif temp_c<=20:
        return "cool"
    elif temp_c<30:
        return "warm"
    elif temp_c>=30:
        return "very_hot"
def data_forming(city):
    if not isinstance(city,str):
        print("city name must be string")
        return None
    try:
        data=fetch_data(city)
        if not data:
            print("the data is a null value")
            return None
        temp=data.get("main",{}).get("temp")
        temp_c = temp - 273.15 if temp else None
        min_temprature=data.get("main",{}).get("temp_min")
        max_temprature=data.get("main",{}).get("temp_max")
        sunrise=data.get("sys",{}).get("sunrise")
        sunset=data.get("sys",{}).get('sunset')
        df=pd.DataFrame([
            {
        "city":data.get("name").upper() if data.get("name") else None,
        "country":data.get("sys",{}).get("country").upper() if data.get("sys",{}).get("country") else None,
        "longitude":data.get("coord",{}).get("lon"),
        "latitude":data.get("coord",{}).get("lat"),
        "wind_speed":data.get("wind",{}).get("speed"),
        "wind_deg":data.get("wind",{}).get("deg"),
        "temprature":temp_c if temp_c else None,
        "catagory":catagory(temp_c) if temp_c else None,
        "min_temprature":min_temprature-273.15 if min_temprature else None,
        "max_temprature":max_temprature-273.15 if max_temprature else None,
        "sea_level":data.get("main",{}).get("sea_level"),
        "ground_level":data.get("main",{}).get("grnd_level"),
        "humidity":data.get("main",{}).get("humidity"),
        "pressure":data.get("main",{}).get("pressure"),
        "sunrise":datetime.datetime.fromtimestamp(sunrise) if sunrise else None,
        "sunset":datetime.datetime.fromtimestamp(sunset) if sunset else None,
        "description":data.get("weather", [{}])[0].get("description"),
        "collected_at":datetime.datetime.now()
        }
         ])
        return df 
    except Exception as e:
        print("error:",e)
        return None

