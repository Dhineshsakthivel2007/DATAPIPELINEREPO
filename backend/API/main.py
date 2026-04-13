from fastapi import FastAPI
from backend.storage.db import db_connection
from fastapi.middleware.cors import CORSMiddleware
from backend.ingestion.fetch_weather import fetch_data
from backend.processing.clean_transform import data_forming
from backend.storage.insert_data import insert_weather
from MLmodel.model.predict import predict
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
    city=city.strip().lower()
    with db_connection() as conn:
        with conn.cursor() as cursor:
            query=("SELECT * FROM weather_data WHERE LOWER(TRIM(city)) = %s AND collected_at >= NOW() - INTERVAL '30 minutes' ORDER BY collected_at DESC LIMIT 1")
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
import pandas as pd

@app.get("/predict/{city}")
def predict_city(city: str):
    city = city.strip().lower()

    with db_connection() as conn:
        query = """
        SELECT * FROM weather_data
        WHERE LOWER(TRIM(city)) = %s
        AND collected_at >= NOW() - INTERVAL '30 minutes'
        ORDER BY collected_at DESC
        LIMIT 1
        """
        df = pd.read_sql(query, conn, params=(city,))

    source = "db"
    if df.empty:
        raw_data = fetch_data(city)

        if raw_data is None:
            return {"error": "City not found"}

        df = data_forming(raw_data)
        insert_weather(df)

        source = "api"
    df["collected_at"] = pd.to_datetime(df["collected_at"])
    df["hour"] = df["collected_at"].dt.hour
    df["day"] = df["collected_at"].dt.day
    df["month"] = df["collected_at"].dt.month

    features = [
        "latitude",
        "longitude",
        "humidity",
        "pressure",
        "wind_speed",
        "wind_deg",
        "hour",
        "day",
        "month"
    ]

    input_data = df[features].iloc[0].to_dict()

    result = predict(input_data)

    return {
        "city": city,
        "predicted_temperature": result,
        "source": source
    }