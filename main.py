from flask import Flask
import os

app = Flask(__name__)

@app.route("/")
def home():
    return "Python app running 24/7"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 3000)))
