/*
	Created by rubic aka paradoxrevolver
	Last updated 24.03.28

	This function represents a single instance and places on a canvas element given to it.
	It generates a background of interactable drifting pixelated stars.
*/

// let starfield = function (canvas) {
//     if (!(canvas instanceof HTMLElement))
//         throw "starfield instance did not receive an HTMLElement";

//     let _ = this;
//     let starfieldCanv = canvas;
//     let s = canvas.getContext("2d", {
//         alpha: true,
//     });

//     _.Update = function () {};

//     // run once for every animation frame
//     _.Step = function () {
//         // update values
//         _.Update();
//         // get a new animation frame
//         window.requestAnimationFrame(_.Step);
//     };

//     _.Step();
// };

// // inner scope so currentScript is scoped to this script
// {
//     let currentScript = document.currentScript;
//     // runs when page is ready
//     $(() => {
//         let canvas = $(currentScript).siblings("canvas.starfield-canvas")[0];
//         new starfield(canvas);
//     });
// }

const starfield = (ctx) => {

	let x = 100;
	let y = 100;
  
	ctx.setup = () => {
		ctx.createCanvas(200, 200);
	}

	ctx.draw = () => {
		ctx.background(0);
		ctx.fill(255);
		ctx.rect(x,y,50,50);
	}
}

let containers = $('.starfield')

containers.each((_, el) => {
	new p5(starfield, el);
})