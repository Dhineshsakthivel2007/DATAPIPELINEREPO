from backend.storage.db import db_connection

def insert_weather(df):
    conn = db_connection()
    cursor = conn.cursor()

    for _, row in df.iterrows():
        cursor.execute("""
            INSERT INTO weather_data (
                city, country, longitude, latitude,
                temperature, category,
                min_temperature, max_temperature,
                humidity, pressure,
                wind_speed, wind_deg,
                description, sunrise, sunset, collected_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            row["city"], row["country"], row["longitude"], row["latitude"],
            row["temperature"], row["category"],
            row["min_temperature"], row["max_temperature"],
            row["humidity"], row["pressure"],
            row["wind_speed"], row["wind_deg"],
            row["description"], row["sunrise"], row["sunset"], row["collected_at"]
        ))

    conn.commit()
    cursor.close()
    conn.close()