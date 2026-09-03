from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

HISTORY_FILE = "history.json"


# =========================
# History Functions
# =========================

def load_history():
    try:
        if not os.path.exists(HISTORY_FILE):
            return []

        with open(HISTORY_FILE, "r") as file:
            data = json.load(file)

        if isinstance(data, list):
            return data

        return []

    except (json.JSONDecodeError, OSError):
        return []


def save_history(history):
    with open(HISTORY_FILE, "w") as file:
        json.dump(history, file, indent=4)


# =========================
# Calculation Function
# =========================

def calculate(num1, operator, num2):

    if operator == "+":
        return num1 + num2

    elif operator == "-":
        return num1 - num2

    elif operator == "*":
        return num1 * num2

    elif operator == "/":

        if num2 == 0:
            raise ZeroDivisionError("Cannot divide by zero")

        return num1 / num2

    else:
        raise ValueError("Invalid operator")


# =========================
# Home Page
# =========================

@app.route("/")
def home():
    return render_template("index.html")


# =========================
# Calculate API
# =========================

@app.route("/calculate", methods=["POST"])
def calculate_api():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "No data received"
        }), 400

    try:

        num1 = float(data.get("num1"))
        operator = data.get("operator")
        num2 = float(data.get("num2"))

        result = calculate(num1, operator, num2)

        history = load_history()

        history_entry = f"{num1} {operator} {num2} = {result}"

        history.append(history_entry)

        save_history(history)

        return jsonify({
            "success": True,
            "result": result,
            "history": history
        })

    except ZeroDivisionError as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 400

    except (ValueError, TypeError):

        return jsonify({
            "success": False,
            "error": "Please enter valid numbers and operator."
        }), 400


# =========================
# Get History
# =========================

@app.route("/history", methods=["GET"])
def get_history():

    history = load_history()

    return jsonify({
        "success": True,
        "history": history
    })


# =========================
# Clear History
# =========================

@app.route("/history/clear", methods=["DELETE"])
def clear_history():

    save_history([])

    return jsonify({
        "success": True,
        "history": []
    })


# =========================
# Run Application
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )