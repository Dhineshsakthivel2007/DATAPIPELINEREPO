import joblib
from sklearn.ensemble import RandomForestRegressor
from MLmodel.features.feature_engineering import feature_extraction
from sklearn.model_selection import train_test_split
def train_model(X,y):
    x_train,x_test,y_train,y_test=train_test_split(X,y,test_size=0.2,random_state=42)
    model = RandomForestRegressor(n_estimators=200,max_depth=10, random_state=42)
    model.fit(x_train,y_train)
    score = model.score(x_test, y_test)
    print(score)
    joblib.dump(model, "MLmodel/model/saved_models/model.pkl")
    return model
X,y=feature_extraction()
data3=train_model(X,y)