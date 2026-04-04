from fastapi import FastAPI
from backend.storage.db import db_connection
from fastapi.middleware.cors import CORSMiddleware
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
@app.get("/weather")
def get_weather():
    with db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM weather_data")
            data=cursor.fetchall()
    return data