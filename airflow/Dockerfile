FROM apache/airflow:2.9.0

ENV AIRFLOW_HOME=/opt/airflow

# Create directories
RUN mkdir -p /opt/airflow/backend /opt/airflow/dags && \
    chown -R airflow:root /opt/airflow

# Copy requirements
COPY airflow/requirements.txt /opt/airflow/airflow_requirements.txt
COPY backend/requirements.txt /opt/airflow/backend_requirements.txt

# Switch to airflow user
USER airflow

# Install dependencies
RUN pip install --no-cache-dir -r /opt/airflow/airflow_requirements.txt
RUN pip install --no-cache-dir -r /opt/airflow/backend_requirements.txt

# Copy code
COPY --chown=airflow:root backend /opt/airflow/backend
COPY --chown=airflow:root airflow/dags /opt/airflow/dags

# Python path
ENV PYTHONPATH="/opt/airflow"

CMD ["standalone"]