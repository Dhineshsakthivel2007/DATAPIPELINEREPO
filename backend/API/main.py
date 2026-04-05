from fastapi import FastAPI
from backend.storage.db import db_connection
from fastapi.middleware.cors import CORSMiddleware
from backend.ingestion.fetch_weather import fetch_data
from backend.processing.clean_transform import data_forming
from backend.storage.insert_data import insert_weather
import psycopg2
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return "weather api running use /weather to see the datas"
# @app.get("/weather")
# def get_weather():
#     with db_connection() as conn:
#         with conn.cursor() as cursor:
#             cursor.execute("SELECT * FROM weather_data")
#             data=cursor.fetchall()
#     return data
@app.get("/weather/{city}")
def get_weather_city(city:str):
    city=city.lower()
    with db_connection() as conn:
        with conn.cursor() as cursor:
            query=("SELECT * FROM weather_data WHERE LOWER(TRIM(city))=%s")
            cursor.execute(query,(city,))
            rows=cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            if rows:
                data = [dict(zip(columns, row)) for row in rows]
                return {"source": "db", "data": data}
            else:
                raw_data=fetch_data(city.lower())
                if raw_data is not None:
                    df=data_forming(raw_data)
                    data=insert_weather(df)
                    return {"source":"apifetch","data":df.to_dict(orient="records")}
                else:
                    return "check the city name"
                    