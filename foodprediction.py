import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.neural_network import MLPRegressor
import pickle

# Load the dataset
data_path = "Food_Sales.csv"
df = pd.read_csv(data_path)

# Convert the 'Day' column to numerical values using LabelEncoder
day_encoder = LabelEncoder()
df["Day"] = day_encoder.fit_transform(df["Day"])

# Encode categorical variables
categorical_features = ["Day", "Time Period", "Food Sold"]

# Preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ("onehot", OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough'
)

# Features and target
X = df[categorical_features] 
y = df["Quantity"]

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Apply preprocessing pipeline
scaler = StandardScaler(with_mean=False)  
pipeline = Pipeline([('preprocessor', preprocessor),
                     ('scaler', scaler)])

X_train_preprocessed = pipeline.fit_transform(X_train)
X_test_preprocessed = pipeline.transform(X_test)

# Initialize and train MLP Regressor
mlp_model = MLPRegressor(
    activation='tanh',
    hidden_layer_sizes=(150, 100, 50),
    learning_rate_init=0.01,
    max_iter=500,
    solver='sgd',
    random_state=42
)

# Fit the model
mlp_model.fit(X_train_preprocessed, y_train)

# Predict using the MLP Regressor
y_pred_mlp = mlp_model.predict(X_test_preprocessed)

# Evaluate the MLP Regressor model
mae_mlp = mean_absolute_error(y_test, y_pred_mlp)
r2_mlp = r2_score(y_test, y_pred_mlp)

# Print evaluation metrics
print(f"MLP Regressor MAE: {mae_mlp}")
print(f"MLP Regressor R²: {r2_mlp}")

# Save the trained MLP model for food prediction
with open('model1.pkl', 'wb') as f:
    pickle.dump(mlp_model, f)

# Save the preprocessing pipeline for food prediction
with open('pipeline1.pkl', 'wb') as f:
    pickle.dump(pipeline, f)

