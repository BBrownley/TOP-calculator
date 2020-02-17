const memoryDisplay = document.getElementById("memory");
const mainDisplay = document.getElementById("main");

let memory = "";
let main = "0";
let mainHasDecimal = false;
let solved = false;

let memorySizeAdjustments = 0;
let mainSizeAdjustments = 0;

function updateDisplay() {
    mainDisplay.textContent = main;
    memoryDisplay.textContent = memory;

    const mainDisplayWidth = mainDisplay.getBoundingClientRect().width;
    
    if (mainDisplayWidth > 375 && mainSizeAdjustments <= 2) {
        mainDisplay.classList.toggle(`small-${mainSizeAdjustments}`);
        mainSizeAdjustments++;
        mainDisplay.classList.toggle(`small-${mainSizeAdjustments}`);
    }
}

function clear() {
    memory = "";
    main = "0";

    mainDisplay.classList.toggle(`small-${mainSizeAdjustments}`);

    memorySizeAdjustments = 0;
    mainSizeAdjustments = 0;

    updateDisplay();
}

function evaluate(numA, numB, operator) {

    numA = Number(numA);
    numB = Number(numB);

    if (operator === "+") {
        return numA + numB;
    } else if (operator === "-") {
        return numA - numB;
    } else if (operator === "x") {
        return numA * numB;
    } else if (operator === "/") {
        return numA / numB;
    }
}

function calculate() {

    const equation = `${memory} ${main}`;
    memory = "";
    updateDisplay();

    let equationParts = equation.split(" ").filter(part => part.length > 0);

    // Get equation in the form a+b-c+d-e...
    let md = equationParts.reduce((acc, part) => {

        if (acc.operators.length > 0) {

            const answer = evaluate(acc.values.pop(), part, acc.operators.pop())
            acc.processedEq.pop();
            acc.processedEq.push(answer);
            acc.values.push(answer);
            
        } else if (part === "x" || part === "/" ) {
            acc.operators.push(part);
        } else if (part === "+" || part === "-") {
            acc.processedEq.push(part);
        } else {
            acc.values.push(part);
            acc.processedEq.push(part);
        }
        
        return acc;

    }, {values: [], operators: [], processedEq: []})

    if (md.processedEq.includes(Infinity) || md.processedEq.includes(NaN)) return "Error";

    // Original eq only contained mult/div
    if (md.processedEq.length < 2) return md.processedEq[0];

    // Solve
    return md.processedEq.reduce((acc, part) => {
        if (acc.operators.length > 0) {
            const answer = evaluate(acc.values.pop(), part, acc.operators.pop());
            acc.total = answer;
            acc.values.push(answer);
        } else if (part === "+" || part === "-") {
            acc.operators.push(part);
        } else {
            acc.values.push(part);
        }
        return acc;
    }, {operators: [], values: [], total: 0}).total

}

function appendNumber(e) {
    const number = e.target.getAttribute("data-key") || e.key;
    if (main === "0" || operatorActive || solved) {
        main = number;
        solved = false;
        operatorActive = false;
        mainHasDecimal = false;
    } else {
        main += number;
    }
    updateDisplay();
}

const numberButtons = Array.from(document.getElementsByClassName("number-button"));
numberButtons.forEach(button => button.addEventListener("click", appendNumber));

const clearButton = document.getElementById("clear");
clearButton.addEventListener("click", clear);

const operators = Array.from(document.getElementsByClassName("operator"));
let operatorActive = false;

function appendOperator(operator) {

    let sign = operator;

    if (operator === "*") sign = "x";

    if (solved) return;
    if (operatorActive) {
        memory = `${memory.substring(0, memory.length - 1)} ${sign}`
    } else {
        memory += ` ${main} ${sign}`;
        operatorActive = true;
    }
    updateDisplay();
}

operators.forEach(operator => operator.addEventListener("click", () => {
    appendOperator(operator.getAttribute("data-sign"))
}));

const plusMinusButton = document.getElementById("plus-minus");
plusMinusButton.addEventListener("click", () => {

    if (main === "0" || solved || operatorActive) return;
    
    if (main.substring(0,1) === "-") {
        main = main.substring(1, main.length);
    } else {
        main = `-${main}`; 
    }
    updateDisplay();
})

function appendDecimal() {
    if (!mainHasDecimal) {
        mainHasDecimal = true;
        main = `${main}.`;
    }

    if (operatorActive || solved) {
        main = "0.";
        solved = false;
        mainHasDecimal = true;
        operatorActive = false;
    }

    updateDisplay();
}

const decimalButton = document.getElementById("add-decimal");
decimalButton.addEventListener("click", appendDecimal);

function solveHandler() {

    let answer = calculate();

    if (typeof(answer) === "number") {
        answer = parseFloat((answer).toFixed(3));
    }

    let answerLength = answer.toString().length

    // if (answerLength >)
    
    main = answer;
    solved = true;
    updateDisplay();

}

const equalsButton = document.getElementById("equals-button");
equalsButton.addEventListener("click", solveHandler);

function roundToSixPlaces(number) {
    const parts = number.toString().split(".")
    const whole = parts[0];
    console.log(parts[1]);
    const decimal = Number.from(parts[1]).toFixed(6);
    return `${whole}.${decimal}`
}

function keyboardHandler(e) {
    console.log(e);
    if (parseInt(e.key) <= 9 && parseInt(e.key) >= 0 && e.shiftKey === false) {
        appendNumber(e);
    } else if (e.key === "." && e.shiftKey === false) {
        appendDecimal();
    } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/" || e.key === "x") {
        appendOperator(e.key)
    } else if (e.key === "Enter") {
        solveHandler();
    } else if (e.key === "Backspace") {
        backspaceHandler();
    }
}

function backspaceHandler() {
    if (main.length === 1) {
        main = "0";
    } else {
        main = main.substring(0, main.length - 1);
    }
    updateDisplay();
}

const backspaceButton = document.getElementById("backspace");
backspaceButton.addEventListener("click", backspaceHandler);

window.addEventListener("keydown", (e) => keyboardHandler(e));