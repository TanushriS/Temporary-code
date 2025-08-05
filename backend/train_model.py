import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
import joblib

MODEL_PATH = 'model.pkl'
ENCODER_PATH = 'encoder.pkl'
COLUMN_PATH = 'columns.pkl'
DATA_PATH = 'thermosense_test_data.csv'

def train_and_save():
    df = pd.read_csv(DATA_PATH)

    features = ['battery_temp', 'ambient_temp', 'device_state']
    target = 'measured_health_impact'

    encoder = OneHotEncoder(sparse_output=False)
    device_state_encoded = encoder.fit_transform(df[['device_state']])
    device_state_df = pd.DataFrame(device_state_encoded, columns=encoder.get_feature_names_out(['device_state']))

    X = pd.concat([df[['battery_temp', 'ambient_temp']].reset_index(drop=True), device_state_df], axis=1)
    y = df[target]

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    joblib.dump(X.columns.tolist(), COLUMN_PATH)
    
    print("Model and encoder trained and saved.")

if __name__ == "__main__":
    train_and_save()