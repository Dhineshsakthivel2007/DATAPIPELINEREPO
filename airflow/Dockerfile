FROM apache/airflow:2.9.0
ENV AIRFLOW_HOME=/opt/airflow

# Create directories and ensure the 'airflow' user owns them
RUN mkdir -p /opt/airflow/backend /opt/airflow/dags && \
    chown -R airflow:root /opt/airflow/backend /opt/airflow/dags

# Copy requirements to a consistent location
COPY airflow/requirements.txt /opt/airflow/airflow_requirements.txt
COPY backend/requirements.txt /opt/airflow/backend_requirements.txt

# Switch to airflow user to install python packages (best practice)
USER airflow

# FIX: The paths in 'pip install' now match the 'COPY' paths above
RUN pip install --no-cache-dir -r /opt/airflow/airflow_requirements.txt
RUN pip install --no-cache-dir -r /opt/airflow/backend_requirements.txt

# Copy the actual code
COPY --chown=airflow:root backend /opt/airflow/backend
COPY --chown=airflow:root airflow/dags /opt/airflow/dags

ENV PYTHONPATH="/opt/airflow"

# Standalone mode handles the DB init and admin creation
CMD ["standalone"]