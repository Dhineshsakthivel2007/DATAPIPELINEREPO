from backend.processing.clean_transform import data_forming
from backend.storage.insert_data import insert_weather

cities=['ooty','chennai','dharmapuri']
for city in cities:
    df=data_forming(city)
    if df is not None:
        insert_weather(df)
        print("data inserted successfully")
    else:
        print("data is not inserted successfully")