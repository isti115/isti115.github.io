"use strict";

window.addEventListener("load", load, false);

var examples = [
  {
    maxIterations: 100,
    maxLength: 4,
    scale: 1,
    area: {
      "left": -0.4010416,
      "right": 0.1276041,
      "top": -1.1306532,
      "bottom": -0.6301507
    }
  },
  {
    maxIterations: 500,
    maxLength: 4,
    scale: 1,
    area: {
      "left": -0.7426271387832698,
      "right": -0.6898027566539924,
      "top": -0.32355795226185147,
      "bottom": -0.26382946117480377
    }
  },
  {
    maxIterations: 300,
    maxLength: 4,
    scale: 2,
    area: {
      "left": 0.26357017389933246,
      "right": 0.2653860003153481,
      "top": 0.002245732060185201,
      "bottom": 0.003922676745756188
    }
  },
  {
    maxIterations: 100,
    maxLength: 4,
    scale: 1,
    area: {
      "left": -1.815625,
      "right": -1.709374,
      "top": -0.069164,
      "bottom": 0.077809
    }
  }
];

var currentExample = -1;

var output;
var drag;

var canvas, context;

var workerCount = 1;
var maxIterations = 30;
var maxLength = 4;
var scale = 2;

var area = {};
area.top = 1.5; area.right = 1.5; area.bottom = -1.5; area.left = -2;
area = {left: -1.5, right: -0.5, top: 1.5, bottom: 0.5};
area = {left: -3, right: 3, top: -3, bottom: 3};
area = {left: -2, right: 1, top: -1, bottom: 1};
area = {left: -2.5, right: 1.5, top: -1.5, bottom: 1.5};

var baseColor = {r: 0, g: 0, b: 0};
var startColor = {r: 0, g: 0, b: 0};
var endColor = {r: 0, g: 0, b: 255};

var activeWorkerCount = 0;
var tempImage = new Image();

function load() {
  var doProcess = false;
  
  var configDiv = document.getElementById("config");
  
  configDiv.addEventListener("mouseover", function(){
    configDiv.style.transition = "width 0.3s, height 0.7s ease 0.3s";
  }, false);
  
  configDiv.addEventListener("mouseout", function(){
    configDiv.style.transition = "height 0.7s, width 0.3s ease 0.7s";
  }, false);
  
  document.getElementById("title").addEventListener("click", function () {
    location.hash = "";
    location.reload();
  }, false);
  
  document.getElementById("author").addEventListener("click", function () {
    context.drawImage(tempImage, 0, 0, canvas.width, canvas.height);
  }, false);
  
  document.getElementById("processButton").addEventListener("click", process, false);
  document.getElementById("exampleButton").addEventListener("click", example, false);
  document.getElementById("configShare").addEventListener("click", share, false);
  document.getElementById("shareCodeContainer").addEventListener("click", shareHide, false);
  
  output = document.getElementById("output");
  output.addEventListener("mousedown", dragStart, false);
  
  canvas = document.getElementById("outputCanvas");
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  if (location.hash != "") {
    var raw = location.hash.substr(1);
    var splitted = raw.split(';');
    
    document.getElementById("maxIterationsInput").value = splitted[0];
    document.getElementById("maxLengthInput").value = splitted[1];
    document.getElementById("scaleInput").value = splitted[2];
    document.getElementById("areaInput").value = splitted[3];
    
    document.getElementById("baseColorInput").value = splitted[4];
    document.getElementById("startColorInput").value = splitted[5];
    document.getElementById("endColorInput").value = splitted[6];
    
    if (splitted[7] == "autorender") {
      doProcess = true;
    }
  } else {
    var preferredArea = {left: -2.5, right: 1.5, top: -1.5, bottom: 1.5};
    
    if (canvas.width / canvas.height > (preferredArea.right - preferredArea.left) / (preferredArea.bottom - preferredArea.top)) {
      area.top = preferredArea.top;
      area.bottom = preferredArea.bottom;
      
      var totalWidth = (canvas.width / canvas.height) * (preferredArea.bottom - preferredArea.top);
      var extraWidth = totalWidth - (preferredArea.right - preferredArea.left);
      area.left = preferredArea.left - extraWidth / 2;
      area.right = preferredArea.right + extraWidth / 2;
    } else {
      area.left = preferredArea.left;
      area.right = preferredArea.right;
      
      var totalHeight = (canvas.height / canvas.width) * (preferredArea.right - preferredArea.left);
      var extraHeight = totalHeight - (preferredArea.bottom - preferredArea.top);
      area.top = preferredArea.top - extraHeight / 2;
      area.bottom = preferredArea.bottom + extraHeight / 2;
    }
    
    document.getElementById("areaInput").value = JSON.stringify(area);
  }
  
  configUpdate();
  
  context = canvas.getContext("2d");
  
  var configInputs = document.getElementsByClassName("configInput");
  
  for (var i = 0; i < configInputs.length; i++) {
    configInputs[i].addEventListener("change", configUpdate, false);
  }
  
  document.getElementById("areaInput").value = JSON.stringify(area);
  
  // doProcess = true;
  if (doProcess) {
    process();
  }
}

function share() {
  //alert("Feature under development.\nTo share the current view, copy and paste the link from the browser!");
  
  location.hash = maxIterations + ";" + maxLength + ";" + scale + ";" + JSON.stringify(area) + ";" +
  document.getElementById("baseColorInput").value + ";" +
  document.getElementById("startColorInput").value + ";" +
  document.getElementById("endColorInput").value + ";autorender";
  
  document.getElementById("shareCode").innerHTML = location.href;
  document.getElementById("shareCodeContainer").style.top = "100px";
}

function shareHide() {
  document.getElementById("shareCodeContainer").style.top = "-500px";
}

function configUpdate() {
  workerCount = parseInt(document.getElementById("workerCountInput").value);
  maxIterations = parseInt(document.getElementById("maxIterationsInput").value);
  maxLength = parseInt(document.getElementById("maxLengthInput").value);
  scale = parseInt(document.getElementById("scaleInput").value);
  area = JSON.parse(document.getElementById("areaInput").value);
  baseColor = hexToRgb(document.getElementById("baseColorInput").value);
  startColor = hexToRgb(document.getElementById("startColorInput").value);
  endColor = hexToRgb(document.getElementById("endColorInput").value);
  
  document.getElementById("scaleCounter").innerHTML = "Scale (" + scale + "):";
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex[1] + hex[2], 16),
    g: parseInt(hex[3] + hex[4], 16),
    b: parseInt(hex[5] + hex[6], 16)
  };
}

function dragStart(e) {
  if (e.button != 0) {
    return;
  }
  
  tempImage.src = canvas.toDataURL();
  
  output.addEventListener("mousemove", dragMove, false);
  output.addEventListener("mouseup", dragEnd, false);
  drag = {left: e.clientX, top: e.clientY};
}

function dragMove(e) {
  drag.right = e.clientX;
  drag.bottom = e.clientY;
  context.drawImage(tempImage, 0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgb(255, 255, 0)";
  context.strokeRect(drag.left, drag.top, drag.right - drag.left, drag.bottom - drag.top);
}

function dragEnd(e) {
  output.removeEventListener("mousemove", dragMove, false);
  output.removeEventListener("mouseup", dragEnd, false);
  
  // console.log(drag);
  
  if (Math.abs(drag.right - drag.left) < 10 || Math.abs(drag.bottom - drag.top) < 10) {
    return;
  }
  
  var dragResults = {};
  dragResults.left = drag.left < drag.right ? drag.left : drag.right;
  dragResults.right = drag.left < drag.right ? drag.right : drag.left;
  dragResults.top = drag.top < drag.bottom ? drag.top : drag.bottom;
  dragResults.bottom = drag.top < drag.bottom ? drag.bottom : drag.top;
  
  // console.log(dragResults);
  
  var newArea = {};
  
  newArea.left = area.left + ((area.right - area.left) * (dragResults.left / canvas.width));
  newArea.right = area.left + ((area.right - area.left) * (dragResults.right / canvas.width));
  newArea.top = area.top + ((area.bottom - area.top) * (dragResults.top / canvas.height));
  newArea.bottom = area.top + ((area.bottom - area.top) * (dragResults.bottom / canvas.height));
  
  area = newArea;
  
  document.getElementById("areaInput").value = JSON.stringify(area);
  
  console.log(area);
  process();
}

function example() {
  // alert("This function is under construction.");
  // return;

  var random = -1;
  
  do {
    random = Math.floor(Math.random() * examples.length);
  } while (random == currentExample)
  
  currentExample = random;
  
  document.getElementById("maxIterationsInput").value = examples[currentExample].maxIterations;
  document.getElementById("maxLengthInput").value = examples[currentExample].maxLength;
  document.getElementById("scaleInput").value = examples[currentExample].scale;
  document.getElementById("areaInput").value = JSON.stringify(examples[currentExample].area);
  
  configUpdate();
}

function validate() {
  
}

function process() {
  // console.log(workerCount);
  
  document.getElementById("title").innerHTML = "Discrete Mathematics - Mandelbrot Set - Processing";
  
  location.hash = maxIterations + ";" + maxLength + ";" + scale + ";" + JSON.stringify(area) + ";" +
  document.getElementById("baseColorInput").value + ";" +
  document.getElementById("startColorInput").value + ";" +
  document.getElementById("endColorInput").value;
  
  console.log(area);
  
  context.font = "15px Consolas";
  // context.fillStyle = "#6ae786";
  // context.fillStyle = "#0000ee";
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  var generalData = {};
  
  generalData.maxLength = maxLength;
  generalData.maxIterations = maxIterations;
  
  generalData.baseColor = baseColor;
  generalData.startColor = startColor;
  generalData.endColor = endColor;
  
  var partitionCount = {x: 4, y: 4};
  for (var y = 0; y < partitionCount.y; y++) {
    for (var x = 0; x < partitionCount.x; x++) {
      var currentWorker = new Worker("worker.js");
      
      var currentData = {};
      
      currentData.x = (canvas.width / partitionCount.x) * x;
      currentData.y = (canvas.height / partitionCount.y) * y;
      currentData.width = canvas.width / partitionCount.x / scale;
      currentData.height = canvas.height / partitionCount.y / scale;
      
      currentData.area = {};
      currentData.area.left = area.left + ((area.right - area.left) / partitionCount.x) * x;
      currentData.area.right = currentData.area.left + ((area.right - area.left) / partitionCount.x);
      currentData.area.top = area.top + ((area.bottom - area.top) / partitionCount.y) * y;
      currentData.area.bottom = currentData.area.top + ((area.bottom - area.top) / partitionCount.y);
      
      // currentData.scale = scale;
      currentData.general = generalData;
      
      currentWorker.addEventListener("message", workerMessage, false);
      currentWorker.postMessage(currentData);
      
      activeWorkerCount++;
      
      // currentPosition.x = area.left + ((area.right - area.left) * (x / canvas.width));
      // currentPosition.y = area.top  + ((area.bottom - area.top) * (y / canvas.height));
      
      // console.log(currentPosition);
      
      // var currentIterations = getValue(currentPosition.x, currentPosition.y);
      
      // var currentValue = currentIterations / maxIterations;
      
      // console.log(currentValue);
      
      // context.fillStyle = getColor(currentValue);
      
      // context.fillRect(x, y, scale, scale);
    }
  }
  
  document.getElementById("title").innerHTML = "Discrete Mathematics - Mandelbrot Set";
  
  // tempImage.src = canvas.toDataURL();
}

function workerMessage(e) {
  if (e.data.type == "results") {
    var data = e.data.data;
    
    for (var i = 0; i < data.results.length; i++) {
      context.fillStyle = data.results[i];
      context.fillRect(data.x + (i * scale), data.startY + (data.currentY * scale), scale + 1, scale + 1);
    }
  }
  
  if (e.data.type == "finished") {
    activeWorkerCount--;
    
    if (activeWorkerCount == 0) {
      tempImage.src = canvas.toDataURL();
    }
  }
}

function getValue(x, y) {
  var baseNumber = new Complex(x, y);
  var number = new Complex(x, y);
  
  var iterations = 0;
  
  while (number.length() < maxLength && iterations < maxIterations) {
    // console.log(number.length());
    
    number = number.square().add(baseNumber);
    
    iterations++;
  }
  
  return iterations;
}
