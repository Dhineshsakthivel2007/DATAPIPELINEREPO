from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from backend.pipeline import run_pipeline
default_args={
    'owner':'dhinesh',
    'start_date':datetime(2026,4,1),
    'retries':2
}
def run_wheather():
    cities=["dharmapuri","chennai","delhi"]
    results=run_pipeline(cities)
    print(results)
with DAG(
    dag_id="weather_pipeline",
    default_args=default_args,
    schedule_interval='@daily',
    catchup=False
) as dag:
    t1=PythonOperator(
        task_id="task1",
        python_callable=run_wheather
    )