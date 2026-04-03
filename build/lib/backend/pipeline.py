from backend.processing.clean_transform import data_forming
from backend.storage.insert_data import insert_weather
def run_pipeline(cities=None):
    if cities is None:
        cities=["chennai","ooty","dharmapuri"]
    results=[]
    for city in cities:
        df=data_forming(city)
        if df is not None:
            insert_weather(df)
            print(f"{city} data inserted successfully")
            results.append((city,"success"))
        else:
            results.append((city,"failed"))
            print(f"{city} data inserted is unsuccessfully")
    return results