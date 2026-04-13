from MLmodel.data.processed_data import processed_data
import pandas as pd

def feature_extraction(data):
    # data=processed_data()
    df=data.copy()
    df=df.dropna()
    df["collected_at"]=pd.to_datetime(df["collected_at"])
    df["hour"]=df["collected_at"].dt.hour
    df["day"]=df["collected_at"].dt.day
    df["month"]=df["collected_at"].dt.month
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
    target="temperature"
    x=df[features]
    y=df[target]
    return x,y
# df=processed_data()
# X, y = feature_extraction(df)

# print(X.head())
# print(y.head())
# print(X.shape)
# print(y.shape)