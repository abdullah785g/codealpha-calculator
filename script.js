// ==========================================
// ELEMENTS
// ==========================================

const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");

const historyBtn = document.getElementById("history-btn");
const historyOverlay = document.getElementById("history-overlay");
const closeHistoryBtn = document.getElementById("close-history");

const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

const themeBtn = document.getElementById("theme-btn");


// ==========================================
// CALCULATOR STATE
// ==========================================

let current = "";
let previous = "";

let operator = null;

let justCalculated = false;


// ==========================================
// HISTORY
// ==========================================

let history =
    JSON.parse(
        localStorage.getItem("calculatorHistory")
    ) || [];


// ==========================================
// DISPLAY
// ==========================================

function updateDisplay() {

    resultDisplay.textContent = current || "0";


    if (previous && operator) {

        expressionDisplay.textContent =
            `${formatNumber(previous)} ${getSymbol(operator)}`;

    } else {

        expressionDisplay.textContent = "";
    }
}


// ==========================================
// ADD NUMBER
// ==========================================

function appendNumber(number) {

    if (justCalculated) {

        current = "";

        justCalculated = false;
    }


    // Prevent multiple decimal points

    if (
        number === "." &&
        current.includes(".")
    ) {
        return;
    }


    // Decimal at beginning

    if (
        number === "." &&
        current === ""
    ) {
        current = "0";
    }


    // Prevent unnecessary leading zero

    if (
        current === "0" &&
        number !== "."
    ) {
        current = "";
    }


    current += number;

    updateDisplay();
}


// ==========================================
// CHOOSE OPERATOR
// ==========================================

function chooseOperator(selectedOperator) {

    if (
        current === "" &&
        previous === ""
    ) {
        return;
    }


    // Change operator before entering second number

    if (
        current === "" &&
        previous !== ""
    ) {

        operator = selectedOperator;

        updateDisplay();

        return;
    }


    // Calculate previous operation first

    if (
        previous !== "" &&
        current !== "" &&
        operator
    ) {

        calculate(false);
    }


    previous = current;

    current = "";

    operator = selectedOperator;

    justCalculated = false;

    updateDisplay();
}


// ==========================================
// CALCULATE
// ==========================================

function calculate(addToHistory = true) {

    const first = parseFloat(previous);
    const second = parseFloat(current);


    if (
        Number.isNaN(first) ||
        Number.isNaN(second) ||
        !operator
    ) {
        return;
    }


    let answer;


    switch (operator) {

        case "+":

            answer = first + second;

            break;


        case "-":

            answer = first - second;

            break;


        case "*":

            answer = first * second;

            break;


        case "/":

            if (second === 0) {

                showError(
                    "Cannot divide by zero"
                );

                return;
            }

            answer = first / second;

            break;


        default:

            return;
    }


    answer = roundResult(answer);


    const expression =
        `${formatNumber(first)} ${getSymbol(operator)} ${formatNumber(second)}`;


    current = String(answer);

    previous = "";

    operator = null;

    justCalculated = true;


    expressionDisplay.textContent =
        expression;


    resultDisplay.textContent =
        formatNumber(answer);


    if (addToHistory) {

        addHistory(
            expression,
            answer
        );
    }
}


// ==========================================
// PERCENTAGE
// ==========================================

function percentage() {

    if (current === "") {
        return;
    }


    const number = parseFloat(current);


    if (Number.isNaN(number)) {
        return;
    }


    current =
        String(
            roundResult(number / 100)
        );


    updateDisplay();
}


// ==========================================
// PLUS / MINUS
// ==========================================

function toggleSign() {

    if (
        current === "" ||
        current === "0"
    ) {
        return;
    }


    if (current.startsWith("-")) {

        current =
            current.slice(1);

    } else {

        current =
            "-" + current;
    }


    updateDisplay();
}


// ==========================================
// DELETE
// ==========================================

function deleteNumber() {

    if (justCalculated) {

        clearCalculator();

        return;
    }


    current =
        current.slice(0, -1);


    updateDisplay();
}


// ==========================================
// CLEAR
// ==========================================

function clearCalculator() {

    current = "";

    previous = "";

    operator = null;

    justCalculated = false;

    updateDisplay();
}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    resultDisplay.textContent = "Error";

    expressionDisplay.textContent = message;


    current = "";

    previous = "";

    operator = null;

    justCalculated = true;
}


// ==========================================
// FORMAT NUMBER
// ==========================================

function formatNumber(number) {

    const value = Number(number);


    if (!Number.isFinite(value)) {
        return number;
    }


    return new Intl.NumberFormat(
        "en-US",
        {
            maximumFractionDigits: 10
        }
    ).format(value);
}


// ==========================================
// ROUND RESULT
// ==========================================

function roundResult(number) {

    return Number(
        parseFloat(
            number.toFixed(10)
        )
    );
}


// ==========================================
// OPERATOR SYMBOL
// ==========================================

function getSymbol(operation) {

    const symbols = {

        "+": "+",

        "-": "−",

        "*": "×",

        "/": "÷"

    };


    return symbols[operation] || operation;
}


// ==========================================
// ADD HISTORY
// ==========================================

function addHistory(
    expression,
    answer
) {

    history.unshift({

        expression: expression,

        answer: answer
    });


    // Keep only latest 10 calculations

    history =
        history.slice(0, 10);


    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );


    renderHistory();
}


// ==========================================
// RENDER HISTORY
// ==========================================

function renderHistory() {

    if (history.length === 0) {

        historyList.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">
                    ◷
                </div>

                <p>
                    No calculations yet
                </p>

                <span>
                    Your calculations will appear here
                </span>

            </div>
        `;

        return;
    }


    historyList.innerHTML =
        history.map(
            (item, index) => {

                return `

                    <div
                        class="history-item"
                        data-index="${index}"
                    >

                        <div class="history-expression">
                            ${escapeHTML(item.expression)}
                        </div>

                        <div class="history-result">
                            = ${formatNumber(item.answer)}
                        </div>

                    </div>
                `;
            }
        ).join("");
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// CLEAR HISTORY
// ==========================================

clearHistoryBtn.addEventListener(
    "click",
    () => {

        history = [];

        localStorage.removeItem(
            "calculatorHistory"
        );

        renderHistory();
    }
);


// ==========================================
// CLICK HISTORY ITEM
// ==========================================

historyList.addEventListener(
    "click",
    event => {

        const item =
            event.target.closest(
                ".history-item"
            );


        if (!item) {
            return;
        }


        const selected =
            history[item.dataset.index];


        if (!selected) {
            return;
        }


        current =
            String(selected.answer);

        previous = "";

        operator = null;

        justCalculated = true;


        expressionDisplay.textContent =
            selected.expression;


        resultDisplay.textContent =
            formatNumber(
                selected.answer
            );


        closeHistory();
    }
);


// ==========================================
// OPEN HISTORY
// ==========================================

function openHistory() {

    historyOverlay.classList.add(
        "active"
    );

    historyOverlay.setAttribute(
        "aria-hidden",
        "false"
    );
}


// ==========================================
// CLOSE HISTORY
// ==========================================

function closeHistory() {

    historyOverlay.classList.remove(
        "active"
    );

    historyOverlay.setAttribute(
        "aria-hidden",
        "true"
    );
}


// ==========================================
// HISTORY BUTTON
// ==========================================

historyBtn.addEventListener(
    "click",
    openHistory
);


// ==========================================
// CLOSE HISTORY BUTTON
// ==========================================

closeHistoryBtn.addEventListener(
    "click",
    closeHistory
);


// ==========================================
// CLICK OUTSIDE HISTORY
// ==========================================

historyOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            historyOverlay
        ) {

            closeHistory();
        }
    }
);


// ==========================================
// CALCULATOR BUTTONS
// ==========================================

document
    .querySelectorAll("[data-number]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                appendNumber(
                    button.dataset.number
                );
            }
        );
    });


document
    .querySelectorAll("[data-operation]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                chooseOperator(
                    button.dataset.operation
                );
            }
        );
    });


// ==========================================
// ACTION BUTTONS
// ==========================================

document
    .querySelector(
        "[data-action='equals']"
    )
    .addEventListener(
        "click",
        () => {

            calculate(true);
        }
    );


document
    .querySelector(
        "[data-action='clear']"
    )
    .addEventListener(
        "click",
        clearCalculator
    );


document
    .querySelector(
        "[data-action='delete']"
    )
    .addEventListener(
        "click",
        deleteNumber
    );


document
    .querySelector(
        "[data-action='percent']"
    )
    .addEventListener(
        "click",
        percentage
    );


document
    .querySelector(
        "[data-action='sign']"
    )
    .addEventListener(
        "click",
        toggleSign
    );


// ==========================================
// KEYBOARD SUPPORT
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        // Numbers

        if (/^[0-9]$/.test(key)) {

            appendNumber(key);

            return;
        }


        // Decimal

        if (key === ".") {

            appendNumber(".");

            return;
        }


        // Operators

        if (
            ["+", "-", "*", "/"]
                .includes(key)
        ) {

            chooseOperator(key);

            return;
        }


        // Percentage

        if (key === "%") {

            percentage();

            return;
        }


        // Enter

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate(true);

            return;
        }


        // Backspace

        if (key === "Backspace") {

            deleteNumber();

            return;
        }


        // Escape

        if (key === "Escape") {

            if (
                historyOverlay.classList
                    .contains("active")
            ) {

                closeHistory();

            } else {

                clearCalculator();
            }

            return;
        }


        // C

        if (
            key.toLowerCase() === "c"
        ) {

            clearCalculator();

            return;
        }
    }
);


// ==========================================
// THEME
// ==========================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        const isLight =
            document.body.classList
                .contains("light");


        themeBtn.textContent =
            isLight ? "☾" : "☀";


        localStorage.setItem(
            "calculatorTheme",
            isLight
                ? "light"
                : "dark"
        );
    }
);


// ==========================================
// RESTORE THEME
// ==========================================

const savedTheme =
    localStorage.getItem(
        "calculatorTheme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light"
    );

    themeBtn.textContent = "☾";
}


// ==========================================
// INITIAL DISPLAY
// ==========================================

updateDisplay();

renderHistory();