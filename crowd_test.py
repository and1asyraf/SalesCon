import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import pickle

# Load and clean data
data_path = "Visitor2.csv"
df = pd.read_csv(data_path)

# Convert time to a numerical feature (hour of the day)
def time_to_hour(time_str):
    try:
        return pd.to_datetime(time_str, format='%I:%M %p').hour
    except:
        return pd.to_datetime(time_str, format='%H:%M:%S').hour

df['Hour'] = df['Time'].apply(time_to_hour)

# Encode categorical features
label_encoder_day = LabelEncoder()
df['Day'] = label_encoder_day.fit_transform(df['Day'])

label_encoder_place = LabelEncoder()
df['Place'] = label_encoder_place.fit_transform(df['Place'])

# Save label encoders
with open('day_encoder.pkl', 'wb') as f:
    pickle.dump(label_encoder_day, f)

with open('place_encoder.pkl', 'wb') as f:
    pickle.dump(label_encoder_place, f)

# Prepare features and target variable
X = df[['Hour', 'Day', 'Place']]
y = df['Visitor Count']

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define preprocessing and model pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['Hour']),
        ('cat', OneHotEncoder(), ['Day', 'Place'])
    ]
)

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# Train the model
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error (MAE): {mae}")
print(f"Root Mean Square Error (RMSE): {rmse}")
print(f"R² Score: {r2}")

# Save the trained model for crowd prediction
with open('model2.pkl', 'wb') as f:
    pickle.dump(model, f)  # Save the entire pipeline

# Save the preprocessing pipeline for crowd prediction
with open('pipeline2.pkl', 'wb') as f:
    pickle.dump(preprocessor, f)  # Save the preprocessing part separately (if needed)

# Check columns in the DataFrame
print("Columns in DataFrame:", df.columns)

# Ensure 'Place' exists and contains data
if 'Place' not in df.columns:
    raise KeyError("'Place' column is missing from the DataFrame.")
if df["Place"].isnull().sum() > 0:
    print("Missing values detected in 'Place'. Filling with 'Unknown'.")
    df["Place"].fillna("Unknown", inplace=True)

# Encode 'Place'
df["Place"] = label_encoder_place.fit_transform(df["Place"])
print("Successfully encoded 'Place'.")
