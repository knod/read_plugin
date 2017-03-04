// app-spec.js

var WordNav = require('../lib/parse/WordNav.js');

describe("WordNav _sentences", function() {

	var wordNav = new WordNav();

	it("checks input sentences get saved", function() {
		
		var raw 	= [['I', 'like', 'apples']]
		var sents 	= wordNav.process( raw )._sentences;

		// expect( sents[0][0] ).toBe( raw[0][0] );
		expect( sents ).toBe( raw );
	});

	// it()

	// it("checks input sentences get saved", function() {
		
	// 	var raw 	= [['I', 'like', 'apples']]
	// 	var sents 	= wordNav.process( [['I', 'like', 'apples']] )._sentences;

	// 	expect( sents[0][0] ).toBe( raw[0][0] );
	// 	expect( sents ).toEqual( raw );

	// });
});
