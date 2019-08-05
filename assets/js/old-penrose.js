// makes the whole js file an anonymous function
( function() {


var penCanv = document.getElementById("penCanv");
var p = penCanv.getContext('2d');
var stackCanv = document.getElementById("stackCanv");
var s = stackCanv.getContext('2d', {
    alpha: true
});
var xstackCanv = document.createElement("canvas");
var xs = xstackCanv.getContext('2d', {
    alpha: true
});

var scale = 2; //scale for visuals to be scaled up to, rasterized, and scaled back down
xstackCanv.width = stackCanv.width * scale;
xstackCanv.height = stackCanv.height * scale;

//GENERAL VARIABLES
var cursorX = 0, //mouse position variables
    cursorY = 0,
    distPre = 0, //distance from center
    dist = 0,
    halfWidth = penCanv.width / 2, //half penCanv width
    halfHeight = penCanv.height / 2, //half penCanv height
    mousePresent = false, //is the mouse on screen?
    mousePresentCorr = false; //is penrose being corrected for because mouse left?
//PENROSE VARIABLES
var tScale = 15, //scale of the triangle
    progress = 0, //progress of drawing the entire penrose, 0 to 1
    nextProgress = 1, //incoming progress value
    bendPoint = 0.50, //point in progress at which triangle bends
    linePoint = 0.25, //point in progress at which triangle vanishes into points
    prCeiling = 300, //pixel radius that penrose becomes full
    prFloor = 100, //pixel radius that penrose disappears entirely
    rps = 0.25, //revolutions per second
    currAngle = 0, //current angle in degrees of the penrose
    nextTurn = 1, //next angle in degrees turn to make
    transitionSpeed = 15, //speed at which the triangle's progress drags
    penroseLineCol = "#fff",
    penroseFillCol = "#1A1B1E";
//NAVIGATION VARIABLES
var isClicked = false, //true only when mouse was just clicked
    isNewPointer = false, //true when a different cursor needs to be loaded
    layerSpread = 22; //pixel spread of each layer of text in the pyramid

//ARRAY OF BUTT
var button = [{
    text: "\u0394",
    x: halfWidth,
    y: halfHeight - 3 * layerSpread,
    bgCol: "#1A1B1E",
    bgColHov: "#fff", //white
    textCol: "#fff",
    textColHov: "#1A1B1E",
    textFontHov: "14px Cousine",
    loading: 0, //amount that new colors need to be loaded
    link: function() {
        if( progress != 1 )
            window.location.href = "";
        else
            window.location.href = "delta"
    }
}, {
    text: "M  E",
    x: halfWidth,
    y: halfHeight - 2 * layerSpread,
    bgCol: "#1A1B1E",
    bgColHov: "RGB(162, 22, 32)", //red
    textCol: "#fff",
    textColHov: "RGB(255, 177, 86)",
    textFontHov: "14px Cousine",
    loading: 0, //amount that new colors need to be loaded
    link: function() {
        window.location.href = "me"
    }
}, {
    text: "A  R  T",
    x: halfWidth,
    y: halfHeight - 1 * layerSpread,
    bgCol: "#1A1B1E",
    bgColHov: "RGB(207, 112, 55)", //orange
    textCol: "#fff",
    textColHov: "RGB(255, 227, 127)",
    textFontHov: "14px Cousine",
    loading: 0, //amount that new colors need to be loaded
    link: function() {
        window.location.href = "art"
    }
}, {
    text: "C  O  D  E",
    x: halfWidth,
    y: halfHeight - 0 * layerSpread,
    bgCol: "#1A1B1E",
    bgColHov: "RGB(234, 178, 56)", //yellow
    textCol: "#fff",
    textColHov: "RGB(26, 27, 30)",
    textFontHov: "14px Cousine",
    loading: 0, //amount that new colors need to be loaded
    link: function() {
        window.location.href = "code"
    }
}, {
    text: "S  O  U  N  D",
    x: halfWidth,
    y: halfHeight + 1 * layerSpread,
    bgCol: "#1A1B1E",
    bgColHov: "RGB(17, 165, 92)", //green
    textCol: "#fff",
    textColHov: "RGB(210, 255, 108)",
    textFontHov: "14px Cousine",
    loading: 0, //amount that new colors need to be loaded
    link: function() {
        window.location.href = "sound"
    }
}, {
    text: "D  E  S  I  G  N",
    x: halfWidth,
    y: halfHeight + 2 * layerSpread,
    bgCol: "#1A1B1E",
    bgColHov: "RGB(60, 96, 189)", //blue
    textCol: "#fff",
    textColHov: "RGB(106, 246, 255)",
    textFontHov: "14px Cousine",
    loading: 0, //amount that new colors need to be loaded
    link: function() {
        window.location.href = "design"
    }
}, {
    text: "C  O  N  T  A  C  T",
    x: halfWidth,
    y: halfHeight + 3 * layerSpread,
    bgCol: "#1A1B1E",
    bgColHov: "RGB(105, 66, 198)", //purp
    textCol: "#fff",
    textColHov: "RGB(255, 150, 255)",
    textFontHov: "14px Cousine",
    loading: 0, //amount that new colors need to be loaded
    link: function() {
        window.location.href = "contact"
    }
}]

//CRAZY TRIANGLE MATH
var R3 = Math.sqrt(3);
var innerTri = [{
    x: 0,
    y: 1 / 3 * R3 * tScale
}, {
    x: -1 / 2 * tScale,
    y: -1 / 6 * R3 * tScale
}, {
    x: 1 / 2 * tScale,
    y: -1 / 6 * R3 * tScale
}]
var midTri = [{
    x: -4 / 3 * tScale,
    y: 5 / 3 * R3 * tScale
}, {
    x: 19 / 6 * tScale,
    y: -1 / 6 * R3 * tScale
}, {
    x: -11 / 6 * tScale,
    y: -3 / 2 * R3 * tScale
}]
var outerTri = [{
    x: -4 / 3 * tScale,
    y: 13 / 3 * R3 * tScale
}, {
    x: 4 / 3 * tScale,
    y: 13 / 3 * R3 * tScale
}, {
    x: -43 / 6 * tScale,
    y: -3 / 2 * R3 * tScale
}, {
    x: 43 / 6 * tScale,
    y: -3 / 2 * R3 * tScale
}, {
    x: -35 / 6 * tScale,
    y: -17 / 6 * R3 * tScale
}, {
    x: 35 / 6 * tScale,
    y: -17 / 6 * R3 * tScale
}]

function setup() { //setup stuff
}

$(window).resize(function() { //size properly
    setup();
});

setup(); //first time setup

xs.scale(scale, scale);

function step() { //every reload of the penCanv
    window.requestAnimationFrame(step);
    s.clearRect(0, 0, stackCanv.width, stackCanv.height);
    xs.clearRect(0, 0, xstackCanv.width, xstackCanv.height);
    p.clearRect(0, 0, penCanv.width, penCanv.height);

    for (var i = 0; i < button.length; i++) {

        //draw the SAME COLOR AS BG RECTANGLE for REGISTERING CLICKING FOR LINKS
        //s.fillStyle = button[i].bgCol;
        s.beginPath();
        s.moveTo(button[i].x - (12.5 * Math.floor((button[i].text.length + 2) / 3)), button[i].y - (19 / 32 * layerSpread));
        s.lineTo(button[i].x + (12.5 * Math.floor((button[i].text.length + 2) / 3)), button[i].y - (19 / 32 * layerSpread));
        s.lineTo(button[i].x + (12.5 * Math.floor((button[i].text.length + 2) / 3)), button[i].y + (7 / 32 * layerSpread));
        s.lineTo(button[i].x - (12.5 * Math.floor((button[i].text.length + 2) / 3)), button[i].y + (7 / 32 * layerSpread));
        s.closePath();
        //s.fill();

        if (s.isPointInPath(cursorX, cursorY)) {
            button[i].loading = button[i].loading + 0.01 + (1 - button[i].loading) / ((button[i].text.length + 5) / 3); //move towards 1
            if (button[i].loading > 1 - 0.001) { //if close enough to 1
                button[i].loading = 1; //set to 1
            }
            isNewPointer = true;

            if (isClicked == true) {
                button[i].link();
            }
        } else {
            button[i].loading = ((button[i].loading + 0) / 1.14) - 0.004; //move towards 0
            if (button[i].loading < 0 + 0.005) { //if close enough to 0
                button[i].loading = 0; //set to 0
            }
        }

        //draw the REGULAR WHITE WORD
        xs.font = "14px Cousine";
        xs.fillStyle = button[i].textCol;
        xs.textAlign = "center";
        xs.fillText(button[i].text, button[i].x, button[i].y);

        //draw the COLORED ON-HOVER RECTANGLE
        xs.fillStyle = button[i].bgColHov;
        xs.save(); //save here to restore later
        xs.beginPath();
        xs.moveTo(button[i].x - ((12.5 * Math.floor((button[i].text.length + 2) / 3))) * button[i].loading, button[i].y - (19 / 32 * layerSpread));
        xs.lineTo(button[i].x + ((12.5 * Math.floor((button[i].text.length + 2) / 3))) * button[i].loading, button[i].y - (19 / 32 * layerSpread));
        xs.lineTo(button[i].x + ((12.5 * Math.floor((button[i].text.length + 2) / 3))) * button[i].loading, button[i].y + (7 / 32 * layerSpread));
        xs.lineTo(button[i].x - ((12.5 * Math.floor((button[i].text.length + 2) / 3))) * button[i].loading, button[i].y + (7 / 32 * layerSpread));
        xs.closePath();
        xs.fill();
        xs.clip(); //have the colored rectangle clip the following text

        //draw the COLORED ON-HOVER WORD
        xs.font = button[i].textFontHov;
        xs.fillStyle = button[i].textColHov;
        xs.fillText(button[i].text, button[i].x, button[i].y);
        xs.restore();
    }
    s.drawImage(xstackCanv, 0, 0, stackCanv.width, stackCanv.height);

    if (isNewPointer == true) { //if a new pointer needs to be loaded
        document.body.style.cursor = "pointer";
        isNewPointer = false;
    } else {
        document.body.style.cursor = "auto";
    }

    isClicked = false;

    $("#stackCanv").css({
        "opacity": Math.pow(1 - progress, 7)
    });

    //$("#display").text("position: ( " + cursorX + ", " + cursorY + " )" );
    //$("#display2").text("isClickd: " + isClicked );
    //$("#display3").text("loadings: " + button[0].loading.toFixed(4) + " " + button[1].loading.toFixed(4) + " " +  button[2].loading.toFixed(4) + " " + button[3].loading.toFixed(4) + " " + button[4].loading.toFixed(4) + " " + button[5].loading.toFixed(4) + " " + button[6].loading.toFixed(4) );

    //p.fillStyle = '#222';
    //p.fillRect(0, 0, penCanv.width, penCanv.height);
    p.lineJoin = "round";

    dist = dist + ((distPre - dist) / transitionSpeed);

    //var cntrDist = findDistance( cursorX, cursorY, halfWidth, halfHeight );
    //if ( cntrDist < appearPoint && cntrDist >= vanishPoint ) { progress = (cntrDist - vanishPoint) / ( appearPoint - vanishPoint ); }
    //else if ( cntrDist < vanishPoint ) 											{ progress = 0; }
    //else 																										{ progress = 1.0; }   deleted this because line below does it much more efficiently

    nextProgress = (Math.min(prCeiling - prFloor, (Math.max(0, dist - prFloor)))) / (prCeiling - prFloor);

    if (mousePresent == true) { //if the mouse is currently on screen
        if (mousePresentCorr == true) { //if the penrose is still trying to correct itself but now must turn the other way
            progress = (progress + nextProgress) / 1.5; //crawl back towards nextProgress

            if (progress < nextProgress + 0.01) { //if progress is close enough, you can stop correcting
                mousePresentCorr = false;
            }
        } else { //if the penrose is simply being shifted away from the mouse
            progress = nextProgress;
        }
    } else {
        if (progress >= 1) {
            progress = 1;
            dist = prCeiling;
            mousePresentCorr = false;
        } else {
            progress += 0.04;
            mousePresentCorr = true;
        }
    }

    // DRAWING THE PENROSE ##########################################################
    p.save();
    for (var i = 0; i < 3; i++) {
        if (i == 0) {
            p.strokeStyle = penroseLineCol;
            p.fillStyle = penroseFillCol;
        } else if (i == 1) {
            p.strokeStyle = penroseLineCol;
            p.fillStyle = penroseFillCol;
        } else if (i == 2) {
            p.strokeStyle = penroseLineCol;
            p.fillStyle = penroseFillCol;
        }
        p.translate(halfWidth, halfHeight);
        p.rotate(120 * (Math.PI / 180));
        p.translate(-halfWidth, -halfHeight);
        drawL();
    }
    p.restore();

    // ROTATING THE PENROSE ###########################################################
    p.translate(halfWidth, halfHeight);
    if (dist >= prCeiling) { //if the mouse is outside of range that affects triangle
        rps = Math.min(rps + 0.01, 0.25 + (dist - prCeiling) / 5000);
        p.rotate((rps * 360 / 60) * (Math.PI / 180)); //rotate the entire triangle
        currAngle = (currAngle + (rps * 360 / 60)) % 120; //set the current angle of the penrose
    } else { //if mouse is inside range affecting triangle
        if (currAngle % 120 > 0.1) { //if there's still distance to the next turn
            nextTurn = Math.min(rps * 360 / 60, (120 - currAngle % 120) / 10);
            rps = nextTurn * 60 / 360;
            p.rotate(nextTurn * (Math.PI / 180));
            currAngle = (currAngle + nextTurn) % 120;
        }

        if (nextTurn < 0.01) //distance to upright is so small, just set it upright
        {
            p.rotate(nextTurn * 10 * (Math.PI / 180));
            currAngle = 120;
            nextTurn = 0;
        }
    }
    p.translate(-halfWidth, -halfHeight);
}

$(document).ready(function() { //step every time
    window.requestAnimationFrame(step);
});

function drawL() { //drawing the outer left L shape to the penrose.
    p.lineWidth = 1;

    if (progress > bendPoint) { //drawing the triangle between its bend and its end
        p.beginPath();
        p.moveTo(halfWidth + innerTri[2].x, halfHeight - innerTri[2].y);
        p.lineTo(halfWidth + midTri[1].x, halfHeight - midTri[1].y);
        p.lineTo(halfWidth + outerTri[0].x, halfHeight - outerTri[0].y);
        p.lineTo(halfWidth + (outerTri[0].x + (outerTri[2].x - outerTri[0].x) * ((linToLog(progress) - bendPoint) / (1 - bendPoint))), halfHeight - (outerTri[0].y + (outerTri[2].y - outerTri[0].y) * ((linToLog(progress) - bendPoint) / (1 - bendPoint))));
        p.lineTo(halfWidth + (midTri[0].x + (outerTri[4].x - midTri[0].x) * ((linToLog(progress) - bendPoint) / (1 - bendPoint))), halfHeight - (midTri[0].y + (outerTri[4].y - midTri[0].y) * ((linToLog(progress) - bendPoint) / (1 - bendPoint))));
        p.lineTo(halfWidth + midTri[0].x, halfHeight - midTri[0].y);
        p.closePath();
    } else if (progress <= bendPoint && progress > linePoint) { // drawing the triangle between its center and its bend
        p.beginPath();
        p.moveTo(halfWidth + innerTri[2].x, halfHeight - innerTri[2].y);
        p.lineTo(halfWidth + midTri[1].x, halfHeight - midTri[1].y);
        p.lineTo(halfWidth + (midTri[1].x + (outerTri[0].x - midTri[1].x) * ((linToLog(progress) - linToLog(linePoint)) / (linToLog(bendPoint) - linToLog(linePoint)))), halfHeight - (midTri[1].y + (outerTri[0].y - midTri[1].y) * ((linToLog(progress) - linToLog(linePoint)) / (linToLog(bendPoint) - linToLog(linePoint)))));
        p.lineTo(halfWidth + (innerTri[2].x + (midTri[0].x - innerTri[2].x) * ((linToLog(progress) - linToLog(linePoint)) / (linToLog(bendPoint) - linToLog(linePoint)))), halfHeight - (innerTri[2].y + (midTri[0].y - innerTri[2].y) * ((linToLog(progress) - linToLog(linePoint)) / (linToLog(bendPoint) - linToLog(linePoint)))));
        p.closePath();
    } else { //drawing the triangle between its center and into nothing
        p.strokeStyle = "rgba(255,255,255," + progress / linePoint + ")"
        p.beginPath();
        p.moveTo(halfWidth + innerTri[2].x, halfHeight - innerTri[2].y);
        p.lineTo(halfWidth + (innerTri[2].x + (midTri[1].x - innerTri[2].x) * (linToLog(progress) * 1 / linToLog(linePoint))), halfHeight - (innerTri[2].y + (midTri[1].y - innerTri[2].y) * (linToLog(progress) * 1 / linToLog(linePoint))));
        p.closePath();
    }

    if (progress !== 0) {
        p.fill();
        p.stroke();
    } //don't draw anything if you're too close

    distPre = findDistance(cursorX, cursorY, halfWidth, halfHeight);

    //TEXT INFO
    /**$("#display").text("position: " + cursorX + ", " + cursorY);
    $("#display2").text("cntrpstn: " + (cursorX - halfWidth) + ", " + (cursorY - halfHeight));
    $("#display3").text("cntrdist: " + dist);
    $("#display4").text("progress: " + progress);
    $("#display5").text("currAngl: " + currAngle );
    $("#display6").text("nextTurn: " + nextTurn );
    $("#display7").text("rps     : " + rps );
    $("#display8").text("mousPres: " + mousePresent ); **/
}

function tween(val, from, to, duration, easing, clearQueue, jumpToEnd) {
    $({
        n: from
    }).stop(clearQueue, jumpToEnd).animate({
        n: to
    }, {
        duration: duration,
        easing: easing,
        step: function(now, fx) {
            window[val] = now;
        }
    });
}

function findDistance(startX, startY, endX, endY) {
    return Math.hypot(startX - endX, startY - endY);
}

function linToLog(num) {
    return (-1 / (1 + Math.pow(100000, num - bendPoint))) + 1;
}

document.body.addEventListener("mousemove", function(event) { //now listening to the mouse
    mouseXY(event);
}, false);

document.body.addEventListener("mouseenter", function(event) { //now listening to the mouse
    mousePresent = true;
}, false);

document.body.addEventListener("mouseleave", function(event) { //now listening to the mouse
    mousePresent = false;
}, false);

document.body.addEventListener("click", function(e) {
    isClicked = true;
}, false);

function mouseXY(e) {
    if (!e)
        var e = event;

    //cursorX = e.pageX - $("#penCanv").offset().left;
    //cursorY = e.pageY - $("#penCanv").offset().top;

    cursorX = (e.pageX - $("#penCanv").offset().left);
    cursorY = (e.pageY - $("#penCanv").offset().top);
}



} )();