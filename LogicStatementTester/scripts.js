"use strict";

window.addEventListener("load", load, false);

var simplificationTable = [
	{from: "n0", to: "1"}, {from: "n1", to: "0"},
	
	{from: "0o0", to: "0"},
	{from: "0o1", to: "1"}, {from: "1o0", to: "1"},
	{from: "1o1", to: "1"},
	
	{from: "0a0", to: "0"},
	{from: "0a1", to: "0"}, {from: "1a0", to: "0"},
	{from: "1a1", to: "1"},
	
	{from: "0i0", to: "1"},
	{from: "0i1", to: "1"}, {from: "1i0", to: "0"},
	{from: "1i1", to: "1"},
	
	{from: "0e0", to: "1"},
	{from: "0e1", to: "0"}, {from: "1e0", to: "0"},
	{from: "1e1", to: "1"}
];

var examples = [
	//Always TRUE
	"{A} or not {A}",
	"({A} or {B}) and (not {B}) => {A}",
	"(not ({A} <-> {B})) <-> (({A} or {B}) and not ({A} and {B}))",
	"(({A} <-> {B}) and ({B} <-> {C})) => ({A} <-> {C})",
	
	//Mixed
	"{this} or {that}",
	
	//Always FALSE
	"{A} and not {A}"
];

var currentExample = -1;

function load() {
	var helpDiv = document.getElementById("help");
	
	helpDiv.addEventListener("mouseover", function(){
		helpDiv.style.transition = "width 0.3s, height 0.7s ease 0.3s";
	}, false);
	
	helpDiv.addEventListener("mouseout", function(){
		helpDiv.style.transition = "height 0.7s, width 0.3s ease 0.7s";
	}, false);
	
	document.getElementById("processButton").addEventListener("click", process, false);
	// document.getElementById("processButton").addEventListener("click", test, false);
	
	document.getElementById("exampleButton").addEventListener("click", example, false);
	
	// document.getElementById("inputField").value = "{A} and (not {B}) or {C}";
	// document.getElementById("inputField").value = "({A} or {B}) and (not {B}) => {A}";
	// document.getElementById("inputField").value = "(not ({A} <-> {B})) <-> (({A} or {B}) and not ({A} and {B}))";
}

function example() {
	var input = document.getElementById("inputField");
	
	var random = -1;
	
	do {
		random = Math.floor(Math.random() * examples.length);
	} while (random == currentExample)
	
	currentExample = random;
	input.value = examples[random];
}

function validate(input) {
	var braceCount = 0;
	var parenthesisCount = 0;
	for (var i = 0; i < input.length; i++) {
		if (input[i] == "(") {
			parenthesisCount += 1;
		} else if (input[i] == ")") {
			parenthesisCount -= 1;
		} else if (input[i] == "{") {
			braceCount += 1;
		} else if (input[i] == "}") {
			braceCount -= 1;
		}
	}
	
	var result = {};
	result.isValid = false;
	if (parenthesisCount != 0) {
		result.error = "Unbalanced parentheses.";
	} else if (braceCount != 0) {
		result.error = "Unbalanced braces.";
	} else {
		result.isValid = true;
	}
	
	return result;
}

function process() {
	var input = document.getElementById("inputField").value;
	
	if (input == "") {
		alert("Please enter a statement!");
		return;
	}
	
	var validationResult = validate(input);
	
	if (!validationResult.isValid) {
		alert(validationResult.error);
		return;
	}
	
	// 0 -> false; 1 -> true; o -> or; a -> and, n -> not, i -> implication, e -> equivalence
	
	input = fasterReplace(input, " ", "");
	input = fasterReplace(input, "not", "n");
	input = fasterReplace(input, "or", "o");
	input = fasterReplace(input, "and", "a");
	input = fasterReplace(input, "=>", "i");
	input = fasterReplace(input, "<->", "e");
	
	var variableNames = [];
	var variables = [];
	
	for (var i = 0; i < input.length; i++) {
		if (input[i] == "{") {
			i++;
			var variableName = "";
			while (input[i] != "}") {
				variableName += input[i];
				i++;
			}
			if (variableNames.indexOf(variableName) == -1) {
				variableNames.push(variableName);
				variables.push(0);
			}
		}
	}
	
	// var progressBar = document.getElementById("progressBar");
	// progressBar.max = Math.pow(2, variables.length);
	
	var alltrue = true;
	var allfalse = true;
	
	var output = "";
	
	for (var c = 0; c < Math.pow(2, variables.length); c++) {
		// progressBar.value = c;
		var processedInput = "";
		
		for (var i = 0; i < input.length; i++) {
			if (input[i] == "{") {
				i++;
				var variableName = "";
				while (input[i] != "}") {
					variableName += input[i];
					i++;
				}
				i++;
				processedInput += variables[variableNames.indexOf(variableName)];
			}
			if (i < input.length) {
				processedInput += input[i];
			}
		}
		
		var evaluated = evaluate(processedInput);
		
		if (evaluated == -1) {
			alert("Unknown error.");
			return;
		}
		
		var result = evaluated == "1";
		console.log(processedInput, result, variables);
		
		var variableValues = [];
		
		for (var i = 0; i < variables.length; i++) {
			variableValues.push(variableNames[i] + ": " + variables[i]);
		}
		
		output += "<tr><td>" + variableValues.join(", ");
		output += "</td><td>" + processedInput + "</td><td>" + result + "</td></tr>";
		// output += " --> " + processedInput + " --> " + result + "<br>";
		
		if (result && allfalse) {
			allfalse = false;
		} else if (!result && alltrue) {
			alltrue = false;
		}
		
		step(variables);
	}
	
	// var conclusion = "Always true: " + alltrue + " <br> Always false: " + allfalse + "<br>";
	
	var conclusionDiv = document.getElementById("conclusion");
	conclusionDiv.className = alltrue ? "alltrue" : allfalse ? "allfalse" : "mixed";
	conclusionDiv.innerHTML = alltrue ? "Always TRUE -- Tautology" : allfalse ? "Always FALSE -- Contradiction" : "Mixed Results -- Satisfyable";
	
	
	document.getElementById("outputBody").innerHTML = output;
}

function evaluate(statement) {
	console.log("evaluating: " + statement);
	var currentStatement = "";
	
	for (var i = 0; i < statement.length; i++) {
		if (statement[i] == "(") {
			var partialStatement = "";
			var parenthesisCount = 1;
			i++;
			
			while(parenthesisCount > 0 && i < statement.length) {
				if(statement[i] == "("){parenthesisCount++;}
				else if(statement[i] == ")"){parenthesisCount--;}
				if (parenthesisCount > 0) {
					partialStatement += statement[i];
				}
				i++;
			}
			currentStatement += evaluate(partialStatement);
		}
		if (i < statement.length) {
			currentStatement += statement[i];
		}
	}
	
	return simplify(currentStatement);
}

function simplify(statement) {
	while (statement.length > 1) {
		var previous = statement;
		for (var i = 0; i < simplificationTable.length; i++) {
			while (statement.indexOf(simplificationTable[i].from) != -1)
			{
				statement = fasterReplace(statement, simplificationTable[i].from, simplificationTable[i].to);
			}
		}
		if (statement == previous) {
			return -1;
		}
	}
	
	return statement;
}

function step(array) {
	var i = array.length - 1;
	while (i >= 0 && array[i]) {
		array[i] = 0;
		i--;
	}
	if (i == -1) {
		return "end";
	} else {
		array[i] = 1;
		return array;
	}
}

function fasterReplace(string, from, to) {
	return string.split(from).join(to);
}

function test() {
	var test = "";
	var testa = [0, 0, 0];
	for (var i = 0; i < 8; i++) {
		console.log(testa);
		step(testa);
	}
}