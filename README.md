# 🌦️ Weather Data Pipeline with ML Prediction (End-to-End MLOps Project)

## 🚀 Overview

This project is a **full-stack data engineering + machine learning system** that collects weather data, processes it, stores it in a database, trains a machine learning model, and serves predictions via an API.

It follows a **modern MLOps architecture** using:

* Data pipelines (Airflow)
* OLAP storage (PostgreSQL)
* ML model training & prediction
* API deployment (FastAPI)
* Visualization (Frontend + Grafana)
* Containerization (Docker)

---

## 🧠 Architecture

```
User → Frontend → FastAPI Backend → ML Model
                             ↓
                        PostgreSQL
                             ↑
                        Airflow DAG
```

---

## ⚙️ Tech Stack

### Backend

* FastAPI
* Python
* Pandas
* Scikit-learn

### Data Pipeline

* Apache Airflow

### Database

* PostgreSQL

### Frontend

* HTML, CSS, JavaScript

### Monitoring & Visualization

* Grafana

### DevOps

* Docker
* Docker Compose

---

## 📁 Project Structure

```
weather_data_pipeline/
│
├── backend/              # FastAPI backend
├── frontend/             # UI (HTML, CSS, JS)
├── MLmodel/              # ML pipeline & model
│   ├── data/
│   ├── features/
│   ├── model/
│
├── airflow/              # DAGs & configs
├── docker-compose.yml
└── README.md
```

---

## 🔄 Data Pipeline

* Weather data is fetched from external API
* Data is cleaned and transformed
* Stored in PostgreSQL
* Updated periodically using Airflow DAGs

---

## 🤖 Machine Learning

* Model: Random Forest Regressor
* Features:

  * humidity
  * pressure
  * wind speed
  * location (lat, lon)
  * time features (hour, day, month)
* Target: Temperature

### Training

* Automated weekly using Airflow
* Model is saved as:

```
MLmodel/model/saved_models/model.pkl
```

---

## 🌐 API Endpoints

### Get Latest Weather

```
GET /weather/{city}
```

### Predict Temperature (Auto)

```
GET /predict/{city}
```

### Predict Temperature (Manual Input)

```
POST /predict
```

---

## 🖥️ Frontend

* Input city name
* Fetch prediction from API
* Displays predicted temperature
* Connected to backend via REST API

---

## 📊 Grafana Dashboard

* Connected to PostgreSQL
* Visualizes:

  * Temperature trends
  * City-wise analytics

---

## 🐳 Docker Setup

### Start all services

```
docker-compose up --build
```

### Services:

* Backend → `http://localhost:8000`
* Frontend → `http://localhost:81`
* Airflow → `http://localhost:8080`
* Grafana → `http://localhost:3000`

---

## 🔁 Airflow DAG

* DAG Name: `weekly_model_training`
* Schedule: Weekly
* Tasks:

  * Fetch data
  * Feature engineering
  * Train model
  * Save model

---

## 🧪 Example Prediction

```
GET /predict/chennai
```

Response:

```json
{
  "city": "chennai",
  "predicted_temperature": 33.5
}
```

---

## 🎯 Key Features

* End-to-end pipeline (Data → ML → API → UI)
* Automated model retraining
* Real-time + cached prediction system
* Dockerized microservices architecture
* Monitoring with Grafana

---

## 🧠 What I Learned

* Building scalable data pipelines
* Feature engineering for ML models
* Deploying ML with FastAPI
* Docker & container orchestration
* Airflow for workflow automation
* Full-stack integration

---

## 🚀 Future Improvements

* Model versioning
* CI/CD pipeline
* Cloud deployment (AWS/GCP)
* Advanced models (XGBoost)
* Real-time streaming (Kafka)

---

## 👨‍💻 Author

**Dhinesh S**
AI & Data Science Student

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and share feedback!
