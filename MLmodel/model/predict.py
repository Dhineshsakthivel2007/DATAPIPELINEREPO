import joblib
import pandas as pd

model = joblib.load("MLmodel/model/saved_models/model.pkl")

def predict(data: dict):
    df = pd.DataFrame([data])
    prediction = model.predict(df)
    return prediction[0]