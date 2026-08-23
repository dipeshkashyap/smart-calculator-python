import json


def load_history():
    try:
        with open("history.json", "r") as file:
            return json.load(file)

    except FileNotFoundError:
        return []

    except json.JSONDecodeError:
        return []


def save_history(history):
    with open("history.json", "w") as file:
        json.dump(history, file, indent=4)


def show_menu():
    print("\n==== SMART CALCULATOR V8 ====")
    print("1. Addition")
    print("2. Subtraction")
    print("3. Multiplication")
    print("4. Division")
    print("5. Calculation History")
    print("6. Exit")

    return input("Choose an option: ")


def calculate(num1, choice, num2):

    if choice == "1":
        return num1 + num2

    elif choice == "2":
        return num1 - num2

    elif choice == "3":
        return num1 * num2

    elif choice == "4":
        if num2 == 0:
            return "Error: Cannot divide by zero"

        return num1 / num2

    else:
        return "Choice is not valid"


def get_symbol(choice):

    symbols = {
        "1": "+",
        "2": "-",
        "3": "*",
        "4": "/"
    }

    return symbols.get(choice)


def show_history(history):

    print("\n===== CALCULATION HISTORY =====")

    if len(history) == 0:
        print("No calculations yet.")
        return

    for index, item in enumerate(history, start=1):
        print(f"{index}. {item}")


history = load_history()


while True:

    choice = show_menu()

    # Exit
    if choice == "6":
        print("\nGoodbye! Calculator closed.")
        break

    # History
    if choice == "5":
        show_history(history)
        continue

    # Validate choice
    if choice not in ["1", "2", "3", "4"]:
        print("\nError: Invalid choice.")
        continue

    # Get numbers
    try:
        num1 = float(input("Enter First Number: "))
        num2 = float(input("Enter Second Number: "))

    except ValueError:
        print("\nError: Please enter valid numbers.")
        continue

    # Calculate
    result = calculate(num1, choice, num2)

    # Handle calculation error
    if isinstance(result, str):
        print("\n", result)
        continue

    # Get operator symbol
    symbol = get_symbol(choice)

    # Create history entry
    history_entry = f"{num1} {symbol} {num2} = {result}"

    # Save to memory
    history.append(history_entry)

    # Save permanently
    save_history(history)

    # Display result
    print("\nResult:", result)