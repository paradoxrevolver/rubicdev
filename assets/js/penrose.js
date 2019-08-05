/*
	Created by paradoxrevolver aka rubic
	Last updated 19.06.28

	This function represents a single instance and places on a canvas element given to it.
	It generates a spinning penrose triangle that rotates and reacts to mouse movements.
*/
let penrose = function(canvas) {
	if(!(canvas instanceof HTMLElement))
		throw "penrose.js looked for elements with the class \"penrose-canvas\" but did not receive an HTMLElement";
	// essentials for referencing this function and element
	// these are called with let and not on _ as to prevent them
	// from being visible on the instance. there's not much of a
	// reason to anyways, you can get these variables by selecting
	// the html element pretty easily.
	let _ = this;
	let penroseParent = canvas.parentElement;
	let penroseCanv = canvas;
	let p = canvas.getContext('2d', {
		alpha: true
	});

	// initialization
	// generally features constants and stuff we expect to never need to be updated
	_.Init = function() {
		// shows debugs
		_.DEBUG = {
			// cursor numbers every frame
			BREATHING_EFFECT: false,
			PRINT_CURSOR_POSITION: false,
			PRINT_PENROSE_PROGRESS: false,
		};

		// this is the base MIN_LENGTH that the penrose starts with
		// why do we need this? this is so that as _.minLength changes later in Update(),
		// we can create a scalar _.minLength / _.MIN_LENGTH for applying to everything that
		// is expected to change as the size of the canvas changes.
		// all these constants that refer to pixel sizes will be precisely correct when _.minLength = _.MIN_LENGTH
		_.MIN_LENGTH = ( penroseParent.clientWidth < penroseParent.clientHeight ? penroseParent.clientWidth : penroseParent.clientHeight );

		_.PENROSE_STYLE = {
			SCALE: 12.5,
			LINE_COLOR:	"#ffffff",
		}

		// default progress settings for the penrose
		_.PENROSE_PROGRESS = {
			// point in progress where penrose is fully visible
			FULL_POINT: 1.00,
			// point in progress where penrose bends the first time [not currently used]
			BEND_POINT: 0.50,
			// point in progress where penrose bends into oblivion [not currently used]
			LINE_POINT: 0.20,
			// point in progress where penrose is completely gone
			GONE_POINT: 0,
			// pixel distance from penrose or greater that penrose becomes full
			CEILING_DISTANCE: 300,
			// pixel distance from penrose or lesser that penrose disappears
			FLOOR_DISTANCE: 150,
			// speed that current approaches goal
			INTERPOLATE_SPEED: 0.10,
		};

		// default styling of the buttons
		_.BUTTON_STYLE = {
			VERTICAL_SPREAD: 20,
			FONT_SIZE: 14,
			TEXT_COLOR: "#ffffff",
			FONT_FAMILY: "Anonymous Pro",
			// this number might seem a little arbitrary...
			// basically, despite asking for a font to be 24px tall, the characters themselves are shorter.
			// this value changes the difference between the center of the font and the bottom.
			// if the highlight background behind buttons doesn't center with the text, change this.
			TEXT_BOTTOM_SHIFT: 3.33,
			// this number scales the background widths down multiplicatively if they're all too wide or too narrow
			// characters are generally not as wide as they are tall, so this number is often less than 1
			TEXT_CHAR_WIDTH: 0.55,
			// speed at which the background appears and disappears
			INTERPOLATE_SPEED: 0.16,
			// padding around the text for the highlighted rectangles, in pixels
			PADDING: {
				UP:		2,
				RIGHT: 	8,
				DOWN: 	2,
				LEFT: 	8,
			},
		}

		// initalize the array of every button in the navigation
		_.buttonArray = [
			{
				text: "\u0394",
				textColorHover: "#000000",
				bgColorHover: "#ffffff",
				url: "/delta",
				FollowUrl: () => {
					// if the current penrose progress is not one...
					if( _.penroseProgress.current < 0.25 ) {
						// this link just scrolls to the top of the page
						window.scroll({
							top: 0,
							left: 0,
							behavior: 'smooth'
						});
					}
					else
						// otherwise, it secretly takes you to delta
						window.location.href = "/delta"
				},
			}, {
				text: "ME",
				textColorHover: "#ffb156",
				bgColorHover: "#a21620",
				url: "me",
			}, {
				text: "ART",
				textColorHover: "#ffe37f",
				bgColorHover: "#cf7037",
				url: "art",
			}, {
				text: "CODE",
				textColorHover: "#000000",
				bgColorHover: "#eab238",
				url: "code",
			}, {
				text: "SOUND",
				textColorHover: "#d2ff6c",
				bgColorHover: "#11a55c",
				url: "sound",
			}, {
				text: "DESIGN",
				textColorHover: "#6af6ff",
				bgColorHover: "#3c60bd",
				url: "design",
			}, {
				text: "CONNECT",
				textColorHover: "#ff96ff",
				bgColorHover: "#6942c6",
				url: "connect",
			},
		];

		// fill out all the important initial information about buttons
		_.buttonArray.forEach((button, i, buttonArray) => {
			// space out the text
			button.text = _.AddSpaces(button.text, 2);
			// the default, unhighlighted text color
			button.textColor = _.BUTTON_STYLE.TEXT_COLOR;
			// initalize the loading state. every button manages its own loading state
			button.loading = 0;
			// initalize the goal, which loading will lerp towards
			button.goal = 0;
			// if there isn't already a link function in this button, set it.
			// this is so that back in the buttonArray declaration, we can override the default
			if (!(button.FollowUrl instanceof Function)) {
				button.FollowUrl = () => {
					let element = document.querySelector('#' + button.url);
					if(element instanceof Element)
						element.scrollIntoView({
							behavior: 'smooth'
						});
					else
						window.location.href = '/#' + button.url;
				};
			}
		});

		// going to need this number
		_.R3 = Math.sqrt(3);
		// all the points for drawing the penrose properly
		_.PENROSE_POINTS = {
			inner: [
				{ x:     0, y:   1/3 * _.R3 },
				{ x:  -1/2, y:  -1/6 * _.R3 },
				{ x:   1/2, y:  -1/6 * _.R3 },
			],
			middle: [
				{ x:  -4/3, y:   5/3 * _.R3 },
				{ x:  19/6, y:  -1/6 * _.R3 },
				{ x: -11/6, y:  -3/2 * _.R3 },
			],
			outer: [
				{ x:  -4/3, y:  13/3 * _.R3 },
				{ x:   4/3, y:  13/3 * _.R3 },
				{ x: -43/6, y:  -3/2 * _.R3 },
				{ x:  43/6, y:  -3/2 * _.R3 },
				{ x: -35/6, y: -17/6 * _.R3 },
				{ x:  35/6, y: -17/6 * _.R3 },
			]
		}

		// initialize the cursor, which is updated elsewhere
		_.cursor = {
			// these are updated every frame, and are relative to the top left of the canvas
			x: 0, y: 0,
			// these are updated only as the cursor moves, and are relative to the page
			pageX: 0, pageY: 0,
			isPresent: false,
			isClicking: false,
			isStyled: false,
			centerDist: 1000,
		};

		// progress in the penrose's loading
		_.penroseProgress = {
			// the current progress the penrose is into appearing or disappearing, 0 is gone, 1 is full
			current: 1.0,
			// see Update for info
			currentFifth: 1.0,
			// the goal progress that current is steadily approaching at all times
			goal: 1.0,
			// top speed of rotations the penrose makes every second
			rps: 1.5,
			// current angle rotation of the penrose
			rotation: 0.0
		};

		// save the width and height of the canvas as shorter variables _.w and _.h
		_.UpdateCanvasDimensions();
	}

	// the specific side of updates that needs to handle variables that might've changed
	_.Update = function() {
		// save the smaller of the two lengths
		// this can be used to determine the dimensions of everything related to the size
		_.minLength = ( _.w < _.h ? _.w : _.h );
		// this is the scalar for everything on the canvas as its size changes
		_.scalar = _.minLength / _.MIN_LENGTH;
		// even though this is longer than just doing w/2 or h/2, it's a little nicer to read
		_.center = {
			x: _.w / 2.0,
			y: _.h / 2.0
		};

		// here we shift backwards by the left and top of the canvas's client rectangle.
		// this actually assumes that the canvas and its parent div are fixed regardless of scroll position!
		// the mouse coordinates are now with respect to the top left corner of the canvas,
		// which is good, because all the coordinates on the canvas are oriented that way defaultly anyways
		_.cursor.x = _.cursor.pageX - penroseCanv.getBoundingClientRect().left;
		_.cursor.y = _.cursor.pageY - penroseCanv.getBoundingClientRect().top;
		// this distance, however, is from the center of the canvas,
		// since that's the distance we care the most about
		_.cursor.centerDist = Math.sqrt(Math.pow(_.cursor.x - _.center.x, 2) + Math.pow(_.cursor.y - _.center.y, 2));

		// button styles that are changing every update
		_.buttonStyle = {
			fontSize: _.scalar * _.BUTTON_STYLE.FONT_SIZE,
			verticalSpread: _.scalar * _.BUTTON_STYLE.VERTICAL_SPREAD,
			padding: {
				up:		_.scalar * _.BUTTON_STYLE.PADDING.UP,
				right: 	_.scalar * _.BUTTON_STYLE.PADDING.RIGHT,
				down: 	_.scalar * _.BUTTON_STYLE.PADDING.DOWN,
				left: 	_.scalar * _.BUTTON_STYLE.PADDING.LEFT
			}
		};
		_.buttonStyle.font = _.buttonStyle.fontSize + "px " + _.BUTTON_STYLE.FONT_FAMILY;

		// update values on every button in the button array
		_.buttonArray.forEach((button, i, buttonArray) => {
			button.x = _.center.x;
			// this indicates the dead center of the text that will be drawn
			button.y = _.center.y + ((i - ((buttonArray.length - 1) / 2.0)) * _.buttonStyle.verticalSpread - _.buttonStyle.fontSize/_.BUTTON_STYLE.TEXT_BOTTOM_SHIFT);
			// these are furthest up, right, down, and left lines of the bg box behind this button.
			// these are magnitudes, so they need to be shifted by button.x and button.y to be placed
			// properly on the canvas
			button.bgBox = {
				up: 	_.buttonStyle.fontSize / 2.0
						+ _.buttonStyle.padding.up,
				right: 	_.buttonStyle.fontSize / 2.0 * button.text.length * _.BUTTON_STYLE.TEXT_CHAR_WIDTH
						+ _.buttonStyle.padding.right,
				down: -(_.buttonStyle.fontSize / 2.0
						+ _.buttonStyle.padding.down),
				left: -(_.buttonStyle.fontSize / 2.0 * button.text.length * _.BUTTON_STYLE.TEXT_CHAR_WIDTH
						+ _.buttonStyle.padding.left)
			}
			// lerp loading towards goal
			button.loading = _.Lerp(button.loading, button.goal, _.BUTTON_STYLE.INTERPOLATE_SPEED);
		});

		_.penroseProgress.goal = _.Clamp(0.0, (
			(_.PENROSE_PROGRESS.FULL_POINT - _.PENROSE_PROGRESS.GONE_POINT) /
			(_.PENROSE_PROGRESS.CEILING_DISTANCE - _.PENROSE_PROGRESS.FLOOR_DISTANCE)
		) * (_.cursor.centerDist - _.PENROSE_PROGRESS.FLOOR_DISTANCE),
										 1.0);

		// if the cursor is entirely missing, force the penrose to appear in full
		if(!_.cursor.isPresent) { _.penroseProgress.goal = 1; }

		// lerp penrose loading towards goal
		_.penroseProgress.current = _.Lerp(_.penroseProgress.current,
										   _.penroseProgress.goal,
										   _.PENROSE_PROGRESS.INTERPOLATE_SPEED);

		// changes porportional to current from 0 to 1
		// while it is between 0 and 0.1. used for hiding the
		// penrose and revealing the text.
		_.penroseProgress.currentFifth = Math.min(_.penroseProgress.current * 5, 1);

		// advance rotation
		_.penroseProgress.rotation += _.penroseProgress.rps;


		// iterating through these set of points will give you a
		// single L of the penrose
		_.penroseL = [
			_.PENROSE_POINTS.inner[2],
			_.PENROSE_POINTS.middle[1],
			_.PENROSE_POINTS.outer[0],
			_.PENROSE_POINTS.outer[2],
			_.PENROSE_POINTS.outer[4],
			_.PENROSE_POINTS.middle[0],
			_.PENROSE_POINTS.inner[2],
		];

		// copy each object in penroseL so we can make changes
		for(let i = 0; i < _.penroseL.length; i++) {
			_.penroseL[i] = {..._.penroseL[i]};
		}

		// scale the points in the L appropriately
		_.penroseL.forEach((p) => {
			p.x *= _.PENROSE_STYLE.SCALE * _.scalar;
			p.y *= _.PENROSE_STYLE.SCALE * _.scalar;
		});

		if( _.DEBUG.PRINT_CURSOR_POSITION) {
			console.log("CURSOR POSITION: (" + _.cursor.x + ", " + _.cursor.y + ")");
			console.log("DISTANCE FROM CENTER: " + _.cursor.centerDist);
			console.log("CURSOR IS PRESENT: " + _.cursor.isPresent);
		}
	}

	// renders to the canvas based on the state of every variable
	_.Render = function() {
		// clear the canvas before drawing anything
		p.clearRect(0, 0, _.w, _.h);
		// draw normal, unhighlighted text
		_.DrawText();
		// draw over that with any buttons that should be highlighted
		_.DrawHighlightedText();
		// draw over that with the penrose triangle based on its current progress
		_.DrawPenrose();
	};

	_.DrawText = function() {
		p.save();

		// set up font styling
		p.font = _.buttonStyle.font;
		p.fillStyle = _.BUTTON_STYLE.TEXT_COLOR;
		p.textAlign = "center";
		p.globalAlpha = 1 - _.penroseProgress.currentFifth;

		_.buttonArray.forEach((button) => {
			// draw the text for each button
			// we shift y by a half of the font size because the position specifies the
			// BOTTOM of the text to be drawn, but button.y is in the dead center
			p.fillText( button.text, button.x, button.y + _.buttonStyle.fontSize/_.BUTTON_STYLE.TEXT_BOTTOM_SHIFT );
		});

		p.restore();
	};

	_.DrawHighlightedText = function() {
		p.save();

		// set up font styling
		p.font = _.buttonStyle.font;
		p.textAlign = "center";
		p.globalAlpha = 1 - _.penroseProgress.currentFifth;

		_.buttonArray.forEach((button) => {
			// we'll actually want to save and restore because we're going to create a
			// clipping path somewhere in the middle here
			p.save();

			// draw colored background
			p.beginPath();
			p.moveTo(button.x + button.bgBox.left, 	button.y + button.bgBox.up);
			p.lineTo(button.x + button.bgBox.right, button.y + button.bgBox.up);
			p.lineTo(button.x + button.bgBox.right, button.y + button.bgBox.down);
			p.lineTo(button.x + button.bgBox.left, 	button.y + button.bgBox.down);
			p.closePath();

			// cursor is inside of the button range
			if( p.isPointInPath(_.cursor.x, _.cursor.y) ) {
				button.goal = 1;
				_.SetCursorStyle("pointer");
				// if clicking, go to button link
				if(_.cursor.isClicking)
					_.TravelToButtonLink(button);
			} else {
				button.goal = 0;
			}

			// start a new path, dependent on progress
			p.beginPath();
			p.moveTo(button.x + button.bgBox.left 	* button.loading,
					 button.y + button.bgBox.up);
			p.lineTo(button.x + button.bgBox.right 	* button.loading,
					 button.y + button.bgBox.up);
			p.lineTo(button.x + button.bgBox.right 	* button.loading,
					 button.y + button.bgBox.down);
			p.lineTo(button.x + button.bgBox.left 	* button.loading,
					 button.y + button.bgBox.down);
			p.closePath();

			p.fillStyle = button.bgColorHover;
			p.fill();

			// clip the upcoming text to this box
			p.clip();

			// draw colored text
			p.fillStyle = button.textColorHover;
			p.fillText( button.text, button.x, button.y + _.buttonStyle.fontSize/_.BUTTON_STYLE.TEXT_BOTTOM_SHIFT);

			p.restore();
		});

		p.restore();
	};

	_.DrawPenrose = function() {
		p.save();
		// debug changes in progress
		if(_.DEBUG.PRINT_PENROSE_PROGRESS)
			console.log(_.penroseProgress.current.toFixed(4) + " -> " + _.penroseProgress.goal.toFixed(4));
		// rotate entire shape we're about to draw about the top left corner
		p.translate(_.w/2, _.h/2);
		p.rotate(_.penroseProgress.rotation * (Math.PI / 180));
		// set style for whole penrose
		p.strokeStyle = _.PENROSE_STYLE.LINE_COLOR;
		p.globalAlpha = _.penroseProgress.currentFifth;
		// alter the penroseL based on progress if necessary
		if(_.penroseProgress.current < 1)
			_.UpdatePenroseL();
		// draw each of the three Ls
		if(_.penroseProgress.current > 0)
			for(let i = 0; i < 3; i++) {
				_.DrawL();
				p.rotate(120 * (Math.PI / 180));
			}
		// shift back into the center of the canvas
		p.translate(-_.w/2, -_.h/2);
		p.restore();
	};

	// draw a single L of the penrose
	_.DrawL = function() {
		p.beginPath();
		p.moveTo(_.penroseL[0].x, _.penroseL[0].y);
		_.penroseL.forEach((point) => {
			p.lineTo(point.x, point.y);
		});
		p.closePath();

		p.globalCompositeOperation = "destination-out";
		p.fill("evenodd");
		p.globalCompositeOperation = "source-over";
		p.stroke();
	}

	// adds spaces between every letter,
	// adds as many spaces as spaceCount specifies
	_.AddSpaces = function(string, spaceCount) {
		let spacer = ' '.repeat(spaceCount);
		return string.split('').join(spacer);
	}

	// returns a number representing the new value, interpolated towards goal from start, according to proportion
	_.Lerp = function(start, goal, proportion) {
		return start + (goal - start) * proportion;
	}

	// lerps an array of points (or a single point) towards
	// a target point according to proportion
	_.LerpPointsTowardsPoint = function(points, target, proportion) {
		if(!(points instanceof Array))
			points = [points];
		points.forEach((point) => {
			point.x = _.Lerp(point.x, target.x, proportion);
			point.y = _.Lerp(point.y, target.y, proportion);
		});
	}

	// returns a number that is at minimum min,
	// at maximum max, or exactly number.
	_.Clamp = function(min, number, max) {
		return Math.min(max, Math.max(min, number));
	}

	// updates the penroseL array based on current penrose progress.
	_.UpdatePenroseL = function() {
		let leftHalf = _.PercentOfPath(_.penroseL.slice(0, 4), _.penroseProgress.current);
		let rightHalf = _.PercentOfPath(_.penroseL.slice(4, 7).reverse(), _.penroseProgress.current, 1.75).reverse();
		// replace the left and right halves of the L with the updated version
		_.penroseL.splice(0, 4, ...leftHalf);
		_.penroseL.splice(leftHalf.length, 3, ...rightHalf);
	}

	// return an array of points that is a percentage length
	// of the original path. exponent can be used to scale
	// the percent by a power.
	_.PercentOfPath = function(points, percentage, exponent) {
		let newPath = [points[0]];
		let distances = [0];
		let totalDist = 0;
		// get distances between every point and total distance
		for(let i = 1; i < points.length; i++) {
			let a = points[i-1];
			let b = points[i];
			let distance = _.Dist(a, b);
			distances.push(distance + totalDist);
			totalDist += distance;
		}
		// scale percentage if necessary
		if(exponent) { percentage **= exponent; }
		// this is the total distance we want to travel
		let goalDist = percentage * totalDist;
		// now for each distance
		for(let i = 1; i < distances.length; i++) {
			// if the goal is equal or further ahead, add this distance's
			// end point to the new path without changing it
			if(goalDist >= distances[i]) {
				newPath.push(points[i]);
			}
			// otherwise, we need to cut some fraction of this next distance
			else {
				// percentage of the way that we want to go from the previous
				// point to the next point, based on the goal distance
				let piecePercentage = (goalDist - distances[i-1])/(distances[i] - distances[i-1]);
				// the last point in the new path is a percentage of the way
				// from the previous point
				newPath.push({
					x: points[i-1].x + ((points[i].x - points[i-1].x) * piecePercentage),
					y: points[i-1].y + ((points[i].y - points[i-1].y) * piecePercentage)
				});
				// this is the last point, so break
				break;
			}
		}
		return newPath;
	}

	// returns the distance between points a and b.
	_.Dist = function(a, b) {
		return ((b.x - a.x)**2 + (b.y - a.y)**2)**0.5;
	}

	_.TravelToButtonLink = function(button) { button.FollowUrl(); }

	_.SetCursorClickState = function(state) { _.cursor.isClicking = state; }
	_.ResetCursorClickState = function() 	{ _.cursor.isClicking = false; }

	_.SetCursorStyle = function(style) 	{ document.body.style.cursor = style; _.cursor.isStyled = true; }
	_.ResetCursorStyle = function() 	{ if(_.cursor.isStyled) document.body.style.cursor = null; _.cursor.isStyled = false; }

	_.ResizeParentBreathe = function() {
		let newParentX = Math.floor(Math.cos(Date.now()/700) * 10 + 240);
		let newParentY = newParentX;

		penroseParent.style.width = newParentX + "px";
		penroseParent.style.height = newParentY + "px";
	};

	// will update the mouse position on the _.cursor object
	// needs to be fed an event from an event listener
	_.UpdateMousePosition = function(event) {
		_.cursor.isPresent = true;
		_.cursor.pageX = event.clientX;
		_.cursor.pageY = event.clientY;
	}

	// update the width and height variables as well as the dimensions of the canvas element
	// run per frame if something is actively enforcing the dimensions of the parent element
	_.UpdateCanvasDimensions = function() {
		// save the width and height of the canvas as shorter variables
		_.w = penroseCanv.width = penroseParent.clientWidth;
		_.h = penroseCanv.height = penroseParent.clientHeight;
	}

	// event listeners
	document.body.addEventListener("mouseleave", () => { _.cursor.isPresent = false; });
	document.body.addEventListener("mousemove", (event) => { _.UpdateMousePosition(event); } );
	document.body.addEventListener("click", () => { _.SetCursorClickState(true); });

	// steps once in the animation of the penrose.
	// this runs with requestAnimationFrame, so it all happens just before
	// the browser's next repaint.
	_.Step = function() {
		// reset states that change visuals
		_.ResetCursorStyle();
		// change the size of the penrose parent to ocsillate
		if(_.DEBUG.BREATHING_EFFECT) {
			_.ResizeParentBreathe();
			_.UpdateCanvasDimensions();
		}
		// update everything
		_.Update();
		// render everything to the canvas
		_.Render();
		// reset states that rely on events
		_.ResetCursorClickState();
		// finally we should make sure we get the next frame after this
		window.requestAnimationFrame(_.Step);
	}

	// initialize everything
	_.Init();
	// update once before stepping
	_.Update();
	// start the first step itself
	_.Step();
}

// attach the code to a page element and run it
document.addEventListener("DOMContentLoaded", () => {
	// note that #penrose-canvas should be a <canvas> element
	// and it should have a parent (like some kind of div)
	// that can be freely resized around the canvas
	let canvases = document.getElementsByClassName("penrose-canvas");
	Array.from(canvases).forEach((canvas) => {
		new penrose(canvas);
	});
});
