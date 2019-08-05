/*
	Created by rubic aka paradoxrevolver
	Last updated 19.06.28

	This function represents a single instance and places on a canvas element given to it.
	It generates a background of interactable drifting pixelated stars.
*/
let starfield = function(canvas) {
	if(!(canvas instanceof HTMLElement))
		throw "starfield.js looked for elements with the class \"starfield-canvas\" but did not receive an HTMLElement";

	let _ = this;
	let starfieldCanv = canvas;
	let s = canvas.getContext('2d', {
		alpha: true
	});

	// initialization
	_.Init = function() {
		let DEBUG = {

		};
	}

	_.Update = function() {

	}

	// run once for every animation frame
	_.Step = function() {

		// update values
		_.Update();
		// get a new animation frame
		window.requestAnimationFrame(_.Step);
	}

	_.Init();
	// a single update before the first step
	_.Update();
	_.Step();
}

$(document).ready(() => {
	let elements = $(".starfield-canvas");
	Array.from(elements).forEach((canvas) => {
		new starfield(canvas);
	})
});
