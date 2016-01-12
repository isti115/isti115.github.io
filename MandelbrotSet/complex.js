"use strict";

var Complex = function (real, imag) {
  this.real = real;
  this.imag = imag;
}

Complex.prototype.add = function (z) {
  return new Complex(this.real + z.real, this.imag + z.imag);
}

Complex.prototype.multiply = function (z) {
  return new Complex((this.real * z.real) - (this.imag * z.imag), (this.real * z.imag) + (this.real * z.imag));
}

Complex.prototype.square = function () {
  return new Complex(Math.pow(this.real, 2) - Math.pow(this.imag, 2), 2 * (this.real * this.imag));
}

Complex.prototype.length = function () {
  return Math.pow(Math.pow(this.real, 2) + Math.pow(this.imag, 2), 0.5);
}

Complex.prototype.toString = function () {
  return this.real + " + " + this.imag + "i";
}
