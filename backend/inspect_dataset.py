import kagglehub
import os
import pandas as pd

print("Downloading dataset...")
path = kagglehub.dataset_download("prashantsingh001/recipes-dataset-64k-dishes")
print(f"Dataset downloaded to: {path}")

# Inspect the directory contents
print("\nFiles in the dataset:")
files = os.listdir(path)
for f in files:
    print(f"- {f}")

# Try to read the first CSV or JSON file
for f in files:
    full_path = os.path.join(path, f)
    if f.endswith('.csv'):
        print(f"\nInspecting {f} (CSV):")
        try:
            df = pd.read_csv(full_path, nrows=5)
            print("Columns:", df.columns.tolist())
            print("First 2 rows:")
            print(df.head(2).to_dict(orient='records'))
        except Exception as e:
            print(f"Failed to read CSV: {e}")
        break
    elif f.endswith('.json'):
        print(f"\nInspecting {f} (JSON):")
        try:
            df = pd.read_json(full_path)
            print("Columns:", df.columns.tolist())
            print("First 2 rows:")
            print(df.head(2).to_dict(orient='records'))
        except Exception as e:
            print(f"Failed to read JSON: {e}")
        break
