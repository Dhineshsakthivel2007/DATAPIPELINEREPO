from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime,timedelta
from backend.ingestion.fetch_weather import fetch_data
from backend.processing.clean_transform import data_forming
from backend.storage.insert_data import insert_weather
default_args={
    'owner':'dhinesh',
    'start_date':datetime(2024,1,1),
    'retries':2,
    'retry_delay':timedelta(minutes=2)
}
def fetching_task(ti):
    cities = ['dharmapuri','salem','erode','chennai','kolkata','mumbai']
    data = {}
    for city in cities:
        result = fetch_data(city)
        print(f"{city} -> {result}")
        data[city] = result
    ti.xcom_push(key="raw_data", value=data)
def process_task(ti):
    raw_data=ti.xcom_pull(task_ids="fetching_task",key="raw_data")
    print('raw data',raw_data)
    process={}
    for city,data in raw_data.items():
        process[city]=data_forming(data)
    ti.xcom_push(key="process_data",value=process)
def insert_task(ti):
    process_data=ti.xcom_pull(task_ids="process_task",key="process_data")
    for city,df in process_data.items():
        if df is not None:
            insert_weather(df)
            print(f"{city} is inserted successfully")
        else:
            print("there is no data")
with DAG(
    dag_id="weather_pipeline",
    default_args=default_args,
    schedule_interval='*/5 * * * *',
    catchup=False
) as dag:
    t1=PythonOperator(
        task_id="fetching_task",
        python_callable=fetching_task
    )
    t2=PythonOperator(
        task_id="process_task",
        python_callable=process_task
    )
    t3=PythonOperator(
        task_id="insert_task",
        python_callable=insert_task
    )
    t1>>t2>>t3