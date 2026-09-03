let currentValue = "";

let firstNumber = null;

let selectedOperator = null;

let waitingForSecondNumber = false;


// =========================
// ELEMENTS
// =========================

const currentDisplay =
    document.getElementById(
        "current-display"
    );


const previousDisplay =
    document.getElementById(
        "previous-display"
    );


const historyList =
    document.getElementById(
        "history-list"
    );


const historyCount =
    document.getElementById(
        "history-count"
    );


const copyMessage =
    document.getElementById(
        "copy-message"
    );


// =========================
// DISPLAY
// =========================

function updateDisplay() {

    currentDisplay.textContent =
        currentValue || "0";

}


// =========================
// NUMBER
// =========================

function inputNumber(number) {

    if (waitingForSecondNumber) {

        currentValue = "";

        waitingForSecondNumber = false;

    }


    if (
        number === "." &&
        currentValue.includes(".")
    ) {
        return;
    }


    if (
        currentValue === "0" &&
        number !== "."
    ) {
        currentValue = "";
    }


    currentValue += number;

    currentDisplay.classList.remove(
        "error-display"
    );

    updateDisplay();
}


// =========================
// OPERATOR
// =========================

function chooseOperator(operator) {

    if (currentValue === "") {
        return;
    }


    firstNumber =
        parseFloat(currentValue);


    selectedOperator =
        operator;


    waitingForSecondNumber = true;


    previousDisplay.textContent =
        `${firstNumber} ${operator}`;
}


// =========================
// PERCENT
// =========================

function percentage() {

    if (currentValue === "") {
        return;
    }


    const number =
        parseFloat(currentValue);


    currentValue =
        formatResult(number / 100);


    updateDisplay();
}


// =========================
// PLUS / MINUS
// =========================

function toggleSign() {

    if (currentValue === "") {
        return;
    }


    if (currentValue === "0") {
        return;
    }


    if (currentValue.startsWith("-")) {

        currentValue =
            currentValue.substring(1);

    } else {

        currentValue =
            "-" + currentValue;

    }


    updateDisplay();
}


// =========================
// CALCULATE
// =========================

async function calculateResult() {

    if (
        firstNumber === null ||
        selectedOperator === null ||
        currentValue === ""
    ) {
        return;
    }


    const secondNumber =
        parseFloat(currentValue);


    try {

        const response =
            await fetch(
                "/calculate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        num1: firstNumber,

                        operator:
                            selectedOperator,

                        num2: secondNumber

                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            showError(data.error);

            resetCalculation();

            return;
        }


        const result =
            data.result;


        previousDisplay.textContent =
            `${firstNumber} ${selectedOperator} ${secondNumber} =`;


        currentValue =
            formatResult(result);


        currentDisplay.classList.remove(
            "error-display"
        );


        updateDisplay();


        resetCalculationState();


        loadHistory();

    }

    catch (error) {

        showError(
            "Connection Error"
        );

    }

}


// =========================
// FORMAT
// =========================

function formatResult(result) {

    if (
        typeof result === "number" &&
        Number.isInteger(result)
    ) {

        return result.toString();

    }


    return parseFloat(
        Number(result).toFixed(10)
    ).toString();
}


// =========================
// ERROR
// =========================

function showError(message) {

    currentValue = message;

    currentDisplay.classList.add(
        "error-display"
    );

    updateDisplay();
}


// =========================
// CLEAR
// =========================

function clearCalculator() {

    currentValue = "";

    firstNumber = null;

    selectedOperator = null;

    waitingForSecondNumber = false;


    previousDisplay.textContent = "";

    currentDisplay.classList.remove(
        "error-display"
    );


    updateDisplay();
}


// =========================
// DELETE
// =========================

function deleteNumber() {

    if (waitingForSecondNumber) {
        return;
    }


    currentValue =
        currentValue.slice(0, -1);


    updateDisplay();
}


// =========================
// RESET
// =========================

function resetCalculationState() {

    firstNumber = null;

    selectedOperator = null;

    waitingForSecondNumber = false;
}


function resetCalculation() {

    firstNumber = null;

    selectedOperator = null;

    waitingForSecondNumber = false;

    currentValue = "";
}


// =========================
// LOCAL HISTORY
// =========================

function getLocalHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "smartCalculatorHistory"
            )
        ) || [];

    }

    catch {

        return [];

    }
}


function saveLocalHistory(entry) {

    const history =
        getLocalHistory();


    history.push(entry);


    localStorage.setItem(
        "smartCalculatorHistory",
        JSON.stringify(history)
    );
}


// =========================
// HISTORY
// =========================

async function loadHistory() {

    let history =
        getLocalHistory();


    /*
       If local history doesn't exist,
       try backend history.
    */

    if (history.length === 0) {

        try {

            const response =
                await fetch("/history");


            const data =
                await response.json();


            if (
                data.success &&
                data.history
            ) {

                history =
                    data.history;

            }

        }

        catch {

            history = [];

        }

    }


    renderHistory(history);
}


function renderHistory(history) {

    historyList.innerHTML = "";


    historyCount.textContent =
        `${history.length} calculation${
            history.length === 1
                ? ""
                : "s"
        }`;


    if (history.length === 0) {

        historyList.innerHTML =
            `<p class="empty-history">
                No calculations yet.
            </p>`;

        return;
    }


    [...history]
        .reverse()
        .forEach(item => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "history-item";


            element.textContent =
                typeof item === "string"
                    ? item
                    : item.expression;


            historyList.appendChild(
                element
            );

        });
}


// =========================
// CLEAR HISTORY
// =========================

async function clearHistory() {

    localStorage.removeItem(
        "smartCalculatorHistory"
    );


    try {

        await fetch(
            "/history/clear",
            {
                method: "DELETE"
            }
        );

    }

    catch {
        // Local history already cleared.
    }


    renderHistory([]);
}


// =========================
// COPY RESULT
// =========================

async function copyResult() {

    if (!currentValue) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            currentValue
        );


        copyMessage.textContent =
            "Copied!";


        setTimeout(() => {

            copyMessage.textContent = "";

        }, 1500);

    }

    catch {

        copyMessage.textContent =
            "Copy failed";

    }
}


// =========================
// BUTTON EVENTS
// =========================

document
    .querySelectorAll(
        "[data-number]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                inputNumber(
                    button.dataset.number
                );

            }
        );

    });


document
    .querySelectorAll(
        "[data-operator]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                chooseOperator(
                    button.dataset.operator
                );

            }
        );

    });


document
    .querySelector(
        '[data-action="equals"]'
    )
    .addEventListener(
        "click",
        calculateResult
    );


document
    .querySelector(
        '[data-action="clear"]'
    )
    .addEventListener(
        "click",
        clearCalculator
    );


document
    .querySelector(
        '[data-action="delete"]'
    )
    .addEventListener(
        "click",
        deleteNumber
    );


document
    .querySelector(
        '[data-action="percent"]'
    )
    .addEventListener(
        "click",
        percentage
    );


document
    .querySelector(
        '[data-action="sign"]'
    )
    .addEventListener(
        "click",
        toggleSign
    );


document
    .getElementById(
        "clear-history"
    )
    .addEventListener(
        "click",
        clearHistory
    );


document
    .getElementById(
        "copy-result"
    )
    .addEventListener(
        "click",
        copyResult
    );


// =========================
// KEYBOARD
// =========================

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;


        if (/^[0-9.]$/.test(key)) {

            inputNumber(key);

            return;
        }


        if (
            ["+", "-", "*", "/"]
                .includes(key)
        ) {

            chooseOperator(key);

            return;
        }


        if (key === "%") {

            percentage();

            return;
        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            calculateResult();

            return;
        }


        if (key === "Backspace") {

            deleteNumber();

            return;
        }


        if (key === "Escape") {

            clearCalculator();

        }

    }
);


// =========================
// START
// =========================

updateDisplay();

loadHistory();