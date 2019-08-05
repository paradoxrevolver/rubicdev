// makes the whole js file an anonymous function
( function() {

// the usual context grab, alpha transparent for body color to show through
var starfieldCanv = document.getElementById( "starfieldCanv" );
var s = starfieldCanv.getContext( '2d', {
    alpha: true
} );



// the position of the cursor
var cursorX = 0,
    cursorY = 0;



// position the stars are following (this position chases the cursor)
var chaseX = 0,
	chaseY = 0;
// this number determines how long it takes to arrive at the cursor's position
// heigher number = stars are slower and take longer to catch up
var CHASE_S = 50;



// additional X and Y distance to add overtime
// these values rise from 0 towards 1 and reset to 0 before they reach 1
var glideX = 0,
	glideY = 0;
// these values determine the speed that glideX and Y increase at
// heigher number = faster gliding speed
var SPEED_X = 0.2,
	SPEED_Y = 0.1;



// the array of stars to be displaying every frame
var stars = [];





// function for creating a single star randomly
function setupStar() {
	for( var i = 0; i < 1000; i++ )
		stars.push( new Star( Math.random(), Math.random(), Math.random()) );
}

// function for setting up once
function setup() {
	// perform a single resize setup to start
	resizeSetup();

	// set up all of the stars with random constant numbers
	setupStar();
}

// function for running as a resize is being made
function resizeSetup() {
	// set the width and height of the canvas early on
    starfieldCanv.width = window.innerWidth;
    starfieldCanv.height = window.innerHeight;
}







// function for running each step (happens often)
function step() {
    // get a new frame to display
    window.requestAnimationFrame(step);
    s.clearRect( 0, 0, starfieldCanv.width, starfieldCanv.height );

	// draw each star according the current data in stars
	stars.forEach(
		function( val ) {
			drawStar( val );
		}
	);

	// now we can update some numbers to prepare for the next update to screen
	chaseX += (cursorX - chaseX) / CHASE_S;
	chaseY += (cursorY - chaseY) / CHASE_S;

	glideX += SPEED_X;
	glideY += SPEED_Y;
}






// this function draws a Star with exactly the properties of that Star, purely.
function drawStar( star ) {
	s.save();
	s.globalAlpha = 1-star.z;
	s.fillStyle = "#fff";
	s.fillRect(
				( Math.floor( (star.x+1) * starfieldCanv.width
						  	+ 300 * (1-star.z) * chaseX / starfieldCanv.width
							+ glideX ) )
				% starfieldCanv.width,

				( Math.floor( (star.y+1) * starfieldCanv.height
						  	+ 300 * (1-star.z) * chaseY / starfieldCanv.height
							+ glideY ) )
				% starfieldCanv.height,

			    Math.floor( (1-star.z) * 2 + 0.1 ),
				Math.floor( (1-star.z) * 2 + 0.1 )
			  );
	s.restore();
}








// first time setup
setup();

// take a step when ready (happens often)
$(document).ready( function() {
    window.requestAnimationFrame(step);
} );

// function for resizing properly
$(window).resize( function() {
    resizeSetup();
} );





// function for registering when the mouse moves on the body
document.body.addEventListener( "mousemove", function(event) {
    mouseXY(event);
}, false );

// function for setting the position of the cursor when it moves
function mouseXY(e) {
    if (!e)
        var e = event;

    cursorX = e.pageX - (starfieldCanv.width / 2);
    cursorY = e.pageY - (starfieldCanv.height / 2);
}





// the Star object holds data for a single star in the background
function Star( x, y, z ) {

    /*  x and y indicate the position of the star on the background as follows:
     *  both values are from 0 to 1, where 0 is 0% of the distance across the window
     *  from the left (x) or top (y). 1 means 100% of the distance, which means
     *  along the right (x) or the bottom (y).
     */
    this.x = x;
    this.y = y;

    /*  z is the "distance" the star is from the user, 0 to 1.
	 *  0 is means the star is extremely close and effected greatly by the position
	 * 	of the mouse. 1 means the star is very far away and not effected by the
	 *	mouse much at all.
     */
    this.z = z;
}




} )();
