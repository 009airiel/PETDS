import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

df1 = pd.read_csv("dataset/url/PhishTank_2026.csv")
df1.columns = ["url", "label"]

df2 = pd.read_csv("dataset/url/malaysian_dataset.csv")
df2.columns = ["url", "label"]

df3 = pd.read_csv("dataset/url/New Dataset.csv", usecols=["url", "label"])
df3.columns = ["url", "label"]

df = pd.concat([df1, df2, df3], ignore_index=True)

df = df.dropna()
df = df.drop_duplicates(subset=["url"])
df["url"] = df["url"].astype(str)

# Balance the dataset by oversampling legitimate URLs
phishing = df[df["label"] == 1]
legit = df[df["label"] == 0]

print(f"Before balancing - Phishing: {len(phishing)}, Legit: {len(legit)}")

# Oversample legitimate URLs to match phishing count
if len(legit) < len(phishing):
    legit_oversampled = legit.sample(n=len(phishing), replace=True, random_state=42)
    df = pd.concat([phishing, legit_oversampled], ignore_index=True)

print(f"After balancing - Total: {len(df)}")
print(df["label"].value_counts())

X = df["url"]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    (
        "vectorizer",
        TfidfVectorizer(
            analyzer="char",
            ngram_range=(2, 5),
            max_features=50000
        )
    ),

    (
        "classifier",
        RandomForestClassifier(
            n_estimators=300,
            max_depth=30,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        )
    )
])

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

print("\nNew model result:")
print(f"  - Accuracy:  {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"  - Precision: {precision_score(y_test, y_pred) * 100:.2f}%")
print(f"  - Recall:    {recall_score(y_test, y_pred) * 100:.2f}%")
print(f"  - F1:        {f1_score(y_test, y_pred) * 100:.2f}%")
print(f"  - Confusion matrix: {tn} TN, {fp} FP, {fn} FN, {tp} TP")

pickle.dump(model, open("model/phishing_model.pkl", "wb"))

print("\nML-only URL model trained and saved!")