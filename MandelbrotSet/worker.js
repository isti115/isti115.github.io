"use strict";

importScripts("complex.js");

self.addEventListener("message", message, false);

// var x, y, width, height, area, maxLength, maxIterations;

function message(e) {
  // console.log("worker created at:" + e.data.x + " | " + e.data.y);
  // console.log(e.data);
  
  var data = e.data;
  
  // x = data.x;
  // y = data.y;
  // width = data.width;
  // height = data.height;
  // area = data.area;
  // maxLength = data.maxLength;
  // maxIterations = data.maxIterations;
  
  for (var field in data) {
    self[field] = data[field];
  }
  
  processData();
  
  // console.log("can I even haz this in worker??? :D");
  // self.postMessage(data);
}

function processData() {
  for (var y = 0; y < height; y++) {
    var values = [];
    var currentY = area.top + (((area.bottom - area.top) / height) * y);
    for (var x = 0; x < width; x++) {
      var currentX = area.left + (((area.right - area.left) / width) * x);
      
      values[x] = getColor(getValue(currentX, currentY) / general.maxIterations);
    }
    
    self.postMessage({type: "results", data: {x: self.x, startY: self.y, currentY: y, results: values}});
  }
  
  self.postMessage({type: "finished"});
}

function getValue(x, y) {
  var baseNumber = new Complex(x, y);
  var number = new Complex(x, y);
  
  var iterations = 0;
  
  while (number.length() < general.maxLength && iterations < general.maxIterations) {    
    number = number.square().add(baseNumber);
    
    iterations++;
  }
  
  // console.log(x + "|" + y + " --> " + iterations);
  return iterations;
}

function between(x, min, max) {
  return Math.floor(min + ((max - min) * x));
}

function getColor(currentValue) {
  // ### --- Basic RGB --- ### //
  
    // context.fillStyle = "#" + Math.floor((currentValue * 999999));
    // context.fillStyle = "#ee" + Math.floor((currentValue * 99)) + "00";
  
  // ### --- Basic HSL --- ### //
  
    // context.fillStyle = "hsl(" + 180 + (currentValue) * 180 + ", 50%, 30%)";
    // context.fillStyle = "hsl(" + (currentValue * 10) * 360 + ", 75%, 50%)";
    // context.fillStyle = "hsl(" + "115" + ", " + (100 - currentValue * 100) + "%, 50%)";
  
  // ### --- Advanced HSL --- ### //
  
    // if (currentValue == 1) {
    //   var hue = 0, saturation = 0, lightness = 0;
    // } else {
    //   var hue = between(currentValue, 0, 360);
    //   var saturation = between(currentValue, 0, 100);
    //   var lightness = between(currentValue, 50, 100);  
    // }
    // 
    // context.fillStyle = "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)";
  
  // ### --- Advanced RGB --- ### //
    
    if (currentValue == 1) {
      var currentColor = general.baseColor;
    } else {
      var currentColor = {
        r: between(1 - currentValue, general.startColor.r, general.endColor.r),
        g: between(1 - currentValue, general.startColor.g, general.endColor.g),
        b: between(1 - currentValue, general.startColor.b, general.endColor.b)
      };
    }
    
    return "rgb(" + currentColor.r + ", " + currentColor.g + ", " + currentColor.b + ")";
  
  // ### --- Tests --- ### //
  
    // if (context.fillStyle == "#000000") {
    //   console.log(currentValue + "|" + context.fillStyle);
    // }
    
    // if (true || x < 50 && y < 50) {
      // console.log(x + " " + y + " | " + currentValue);
    // }
    // context.fillText(currentIterations, x, y);
}
