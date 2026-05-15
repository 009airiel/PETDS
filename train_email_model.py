import pandas as pd
import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# load main dataset
data = pd.read_csv("dataset/email/combined_data.csv")

# load Malaysian email dataset for better local accuracy
malaysian_data = pd.read_csv("dataset/email/malaysian_emails.csv")

# clean datasets
data = data.dropna()
data = data[data["text"].str.len() > 10]
malaysian_data = malaysian_data.dropna()

# Oversample Malaysian emails to give them enough weight in training
malaysian_data = pd.concat([malaysian_data] * 50, ignore_index=True)

# Combine all training data
data = pd.concat([data, malaysian_data], ignore_index=True)
data = data.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"Total training data: {len(data)}")
print(data["label"].value_counts())

# split
X = data["text"]
y = data["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# convert text to numbers
vectorizer = TfidfVectorizer(
    stop_words='english',
    max_features=20000,
    ngram_range=(1, 3),
    sublinear_tf=True
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# train model
model = LogisticRegression(
    max_iter=1000,
    C=1.0,
    class_weight='balanced',
    random_state=42
)
model.fit(X_train_vec, y_train)

# evaluate
y_pred = model.predict(X_test_vec)

tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

print("\nNew model result:")
print(f"  - Accuracy:  {accuracy_score(y_test, y_pred) * 100:.2f}%")
print(f"  - Precision: {precision_score(y_test, y_pred) * 100:.2f}%")
print(f"  - Recall:    {recall_score(y_test, y_pred) * 100:.2f}%")
print(f"  - F1:        {f1_score(y_test, y_pred) * 100:.2f}%")
print(f"  - Confusion matrix: {tn} TN, {fp} FP, {fn} FN, {tp} TP")

# save model
pickle.dump(model, open("model/email_model.pkl", "wb"))
pickle.dump(vectorizer, open("model/vectorizer.pkl", "wb"))

print("\nEmail model trained and saved!")