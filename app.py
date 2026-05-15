from flask import Flask, request, jsonify, render_template
import pickle
import re
from features import extract_features
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

email_model = pickle.load(open("model/email_model.pkl", "rb"))
vectorizer = pickle.load(open("model/vectorizer.pkl", "rb"))
model = pickle.load(open("model/phishing_model.pkl", "rb"))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/scan", methods=["POST"])
def scan():
    url = request.json["url"]

    prediction = model.predict([url])[0]
    result = "Harmful" if prediction == 1 else "Legitimate"

    return jsonify({"result": result})

@app.route("/scan_email", methods=["POST"])
def scan_email():
    text = request.json["text"]

    prediction = email_model.predict(vectorizer.transform([text]))[0]

    if prediction == 1:
        result = "Suspicious Email"
    else:
        result = "Legitimate"

    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=False)





