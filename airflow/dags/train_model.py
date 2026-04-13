from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

from MLmodel.data.processed_data import processed_data
from MLmodel.features.feature_engineering import feature_extraction
from MLmodel.model.train import train_model

default_args = {
    "owner": "dhinesh",
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

def train_pipeline(**kwargs):
    # 1. Load data
    df = processed_data()

    # 2. Feature engineering
    X, y = feature_extraction(df)

    # 3. Train model
    model = train_model(X, y)

    # Example: if your train_model prints score,
    # better modify it to RETURN score

    score = model.score(X, y)

    # 🔥 Push to XCom
    kwargs['ti'].xcom_push(key='model_score', value=score)

    return score


with DAG(
    dag_id="weekly_model_training",
    default_args=default_args,
    description="Train ML model weekly",
    schedule_interval="@weekly",
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:

    train_task = PythonOperator(
        task_id="train_model_task",
        python_callable=train_pipeline,
        provide_context=True   # 🔥 needed for XCom
    )

    train_task