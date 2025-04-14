from flask import Flask, render_template, request, jsonify , url_for
import pickle
import os
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.neural_network import MLPRegressor 

app = Flask(__name__, template_folder='templates', static_folder='static')


# Load the dataset
df_food_sales = pd.read_csv('Food_Sales.csv')
#df = pd.read_csv('visitor2.csv')
df_visitor = pd.read_excel('visitor2.xlsx', engine='openpyxl')

# Ensure the dataset has the required columns
required_columns_food_sales = ["Day", "Time Period", "Food Sold", "Quantity"]
for col in required_columns_food_sales:
    if col not in df_food_sales.columns:
        raise ValueError(f"Missing required column in Food_Sales.csv: {col}")
    
# Ensure the dataset has the required columns for visitor2.xlsx
required_columns_visitor = ["Day", "Time", "Visitor Count", "Place"]
for col in required_columns_visitor:
    if col not in df_visitor.columns:
        raise ValueError(f"Missing required column in visitor2.xlsx: {col}")

# Encode the 'Day' column for Food_Sales dataset
day_encoder_food_sales = LabelEncoder()
df_food_sales["Day"] = day_encoder_food_sales.fit_transform(df_food_sales["Day"])

# Encode the 'Day' column for visitor2 dataset (if needed for your analysis)
day_encoder_visitor = LabelEncoder()
df_visitor["Day"] = day_encoder_visitor.fit_transform(df_visitor["Day"])

# Encode the 'Place' column for visitor2 dataset
place_encoder = LabelEncoder()
df_visitor["Place"] = place_encoder.fit_transform(df_visitor["Place"])

# Define categorical features for model 1
categorical_features_model1 = ["Day", "Time Period", "Food Sold"]
numerical_features_model1 = []  
# Define preprocessing pipeline for model 1
preprocessor_model1 = ColumnTransformer(
    transformers=[('onehot', OneHotEncoder(handle_unknown='ignore'), categorical_features_model1)],
    remainder='passthrough'
)

pipeline_model1 = Pipeline([('preprocessor', preprocessor_model1),
                            ('scaler', StandardScaler(with_mean=False))])

# Prepare training data for model 1
X_model1 = df_food_sales[categorical_features_model1]
y_model1 = df_food_sales["Quantity"]

# Train the MLP Regressor for model 1
model1 = MLPRegressor(
    activation='tanh',
    hidden_layer_sizes=(150, 100, 50),
    learning_rate_init=0.01,
    max_iter=500,
    solver='sgd',
    random_state=42
)

# Define categorical features for model 2 (if different, otherwise use same features)
categorical_features_model2 = ["Day", "Time", "Place"]
numerical_features_model2 = ["Visitor Count"]

# Define preprocessing pipeline for model 2
preprocessor_model2 = ColumnTransformer(
    transformers=[('onehot', OneHotEncoder(handle_unknown='ignore'), categorical_features_model2)],
    remainder='passthrough'
)

pipeline_model2 = Pipeline([('preprocessor', preprocessor_model2),
                            ('scaler', StandardScaler(with_mean=False))])

# Prepare training data for model 2
X_model2 = df_visitor[categorical_features_model2]
y_model2 = df_visitor["Visitor Count"]

# Train the MLP Regressor for model 2
model2 = MLPRegressor(
    activation='tanh',
    hidden_layer_sizes=(100, 80),
    learning_rate_init=0.01,
    max_iter=500,
    solver='sgd',
    random_state=42
)

# Route to train Model 1
@app.route('/train_model1', methods=['POST'])
def train_model1():
    try:
        # Fit the preprocessing pipeline and MLP model for model 1
        X_preprocessed_model1 = pipeline_model1.fit_transform(X_model1)
        model1.fit(X_preprocessed_model1, y_model1)

        # Save the trained model and pipeline for model 1
        with open('model1.pkl', 'wb') as f:
            pickle.dump(model1, f)
        with open('pipeline1.pkl', 'wb') as f:
            pickle.dump(pipeline_model1, f)

        return jsonify({"message": "Model 1 trained successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route to train Model 2
@app.route('/train_model2', methods=['POST'])
def train_model2():
    try:
        # Fit the preprocessing pipeline and MLP model for model 2
        X_preprocessed_model2 = pipeline_model2.fit_transform(X_model2)
        model2.fit(X_preprocessed_model2, y_model2)

        # Save the trained model and pipeline for model 2
        with open('model2.pkl', 'wb') as f:
            pickle.dump(model2, f)
        with open('pipeline2.pkl', 'wb') as f:
            pickle.dump(pipeline_model2, f)

        return jsonify({"message": "Model 2 trained successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Route for predicting with Model 1
@app.route('/predict_model1', methods=['POST'])
def predict_model1():
    try:
        if not os.path.exists('model1.pkl') or not os.path.exists('pipeline1.pkl'):
            return jsonify({"error": "Model 1 not trained yet. Please train the model first by sending a POST request to /train_model1"}), 400
        
        # Load Model 1 and Pipeline 1
        with open('model1.pkl', 'rb') as f:
            model1 = pickle.load(f)
        with open('pipeline1.pkl', 'rb') as f:
            pipeline1 = pickle.load(f)

        # Parse input data and predict using Model 1
        data = request.json
        day = data['day']
        time_period = data['time_period']

        # Encode the input day
        encoded_day = day_encoder_food_sales.transform([day])[0]

        # Prepare predictions for all food items for Model 1
        predictions = []
        for food in df_food_sales["Food Sold"].unique():
            # Create input data frame for Model 1
            input_data = pd.DataFrame([{
                "Day": encoded_day,
                "Time Period": time_period,
                "Food Sold": food
            }])

            # Preprocess input and predict
            input_preprocessed = pipeline1.transform(input_data)
            prediction = model1.predict(input_preprocessed)[0]

            # Assuming food images are stored in static/images/ folder
            food_image_url = f"/static/images/{food.replace(' ', '_').lower()}.jpg"  # Modify as per your image naming convention

            # Append the prediction with the image URL
            predictions.append({"food": food, "prediction": prediction, "image_url": food_image_url})
            
        return jsonify(predictions)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict_model2', methods=['POST'])
def predict_model2():
    try:
        if not os.path.exists('model2.pkl') or not os.path.exists('pipeline2.pkl'):
            return jsonify({"error": "Model 2 not trained yet. Please train the model first by sending a POST request to /train_model2"}), 400
        
        # Load Model 2 and Pipeline 2
        with open('model2.pkl', 'rb') as f:
            model2 = pickle.load(f)
        with open('pipeline2.pkl', 'rb') as f:
            pipeline2 = pickle.load(f)

        # Parse form data
        hour = int(request.form['hour'])
        day = request.form['day']
        place = request.form['place']
        result_type = request.form['result_type']

        # Encode categorical variables
        day_encoded = day_encoder_visitor.transform([day])[0]
        place_encoded = place_encoder.transform([place])[0]

        if result_type == "single":
            # Prepare input DataFrame for single prediction
            input_data = pd.DataFrame({'Hour': [hour], 'Day': [day_encoded], 'Place': [place_encoded]})

            # Predict crowd size for the given input
            prediction = model2.predict(input_data)[0]
            predicted_crowd = int(round(prediction))

            return render_template('result_single.html', prediction=predicted_crowd)

        elif result_type == "graph":
            # Create a DataFrame for all hours of the day
            hours = list(range(0, 24))  # Generate hours from 0 to 23
            input_data = pd.DataFrame({'Hour': hours, 'Day': [day_encoded] * 24, 'Place': [place_encoded] * 24})

            # Predict crowd size for all hours
            predictions = model2.predict(input_data)

            # Create the plot
            fig, ax = plt.subplots()
            ax.plot(hours, predictions)
            ax.set_xlabel('Hour')
            ax.set_ylabel('Predicted Visitor Count')
            ax.set_title(f'Predicted Crowd Size at {place} on {day}')
            ax.set_xticks(hours)
            ax.grid(True)

            # Convert plot to PNG image
            img = io.BytesIO()
            FigureCanvas(fig).print_png(img)
            img.seek(0)

            plot_url = 'data:image/png;base64,' + base64.b64encode(img.getvalue()).decode('utf-8')
            return render_template('result_graph.html', plot_url=plot_url)

        else:
            return "Invalid result type selected."

    except ValueError as e:
        return f"Error: Invalid input data. {e}"
    except Exception as e:
        if 'y contains previously unseen labels' in str(e):
            return "The selected place is not available in our data. Please choose from the provided options."
        else:
            return f"An error occurred: {e}"
        
        
@app.route('/')
def login():
    return render_template('login.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/food')
def food():
    return render_template('food.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/crowd')
def crowd():
    return render_template('prediction_page.html')

@app.route('/home2')
def home2():
    return render_template('home2.html')

@app.route('/homeAdmin')
def homeAdmin():
    return render_template('homeAdmin.html')

@app.route('/payment')
def payment():
    return render_template('payment.html')

@app.route('/reset')
def reset():
    return render_template('reset.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/addEvent')
def addevent():
    return render_template('addEvent.html')

@app.route('/aboutAdmin')
def aboutAdmin():
    return render_template('aboutAdmin.html')

@app.route('/contactAdmin')
def contactAdmin():
    return render_template('contactAdmin.html')


@app.route('/profileAdmin')
def profileAdmin():
    return render_template('profileAdmin.html')

if __name__ == '__main__':
    app.run(debug=True)
