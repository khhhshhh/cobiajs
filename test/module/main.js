module(function (require) {
	// loadScript('a.js', function () {
	// 	console.log('a.js callback');
	// });

	/*
		thisfjldaj
		fdsasfdas fdasfvdsa ffdafd
		fdasfa
		var c = require('../../ap/b/d.js');
	*/
	console.log('------------Things in main.js');
	var a = require("a.js");
	var b = require('b.js');
	var dir1a = require('dir1/dir1a.js');
	console.log(a); 
	console.log(b); 
	console.log(dir1a);

	return {
		a: a,
		b: b,
		dir1a: dir1a
	}

});
