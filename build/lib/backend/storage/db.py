import psycopg2
from backend.config.settings import DB_HOST,DB_NAME,DB_PASSWORD,DB_PORT,DB_USER
def db_connection():
    conn=psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    return conn