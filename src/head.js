(function (global, doc) {

var previousCobia = global.Cobia;
var Cobia = global.Cobia = {};

Cobia.noConflict = function () {
	window.Cobia = previousCobia;
};
