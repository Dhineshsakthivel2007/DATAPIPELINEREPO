import pandas  as pd
from backend.storage.db import db_connection
def processed_data():
    with db_connection() as conn:
        query="SELECT * FROM weather_data"
        data=pd.read_sql(query,conn)
    return data
# print_data=processed_data()
# print(print_data)
