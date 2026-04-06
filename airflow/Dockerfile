FROM apache/airflow:2.9.0
ENV AIRFLOW_HOME=/opt/airflow
COPY airflow/requirements.txt /airflow_requirements.txt
RUN pip install --no-cache-dir -r /airflow_requirements.txt
COPY backend/requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt
COPY --chown=airflow:root backend /opt/airflow/backend
COPY --chown=airflow:root airflow/dags /opt/airflow/dags
ENV PYTHONPATH="/opt/airflow"
USER airflow
CMD ["standalone"]
