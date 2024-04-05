/*
	Created by rubic aka paradoxrevolver
	Last updated 24.03.28

	This function represents a single instance and places on a canvas element given to it.
	It generates a background of interactable drifting pixelated stars.
*/

const starfield = (ctx) => {
    let canvas = null;
    let canvasParent = null;
    let bgStars = [];
    let fgStars = [];
    const BG_STAR_COUNT = 600;
    const FG_STAR_COUNT = 50;
    const MULT_DRIFT_SPEED = 0.6;

    ctx.setup = () => {
        canvas = ctx.createCanvas(200, 200);
        canvasParent = canvas.parent();

        for (let i = 0; i < BG_STAR_COUNT; i++) {
            let closeness = Math.random();
            bgStars.push({
                x: Math.random(),
                y: Math.random(),
                closeness: closeness,
                innerRadius: 0.75 - closeness * 0.25,
                outerRadius: 1.5 + closeness * 2.5,
                numPoints: Math.floor(3 + Math.random() * 3),
                driftSpeed: 0.3 + closeness * 0.7,
                spinSpeed: 0.1 + Math.random() * 0.9,
            });
        }

        for (let i = 0; i < FG_STAR_COUNT; i++) {
            fgStars.push({
                x: Math.random(),
                y: Math.random(),
                innerRadius: 1.0,
                outerRadius: 5.0 + Math.random() * 2.0,
                numPoints: Math.floor(3 + Math.random() * 3),
                driftSpeed: 1.0 + Math.random() * 0.3,
                spinSpeed: 0.3 + Math.random() * 1.5,
            });
        }
    };

    ctx.draw = () => {
        const CW =
            canvasParent.clientWidth <= ctx.windowWidth
                ? canvasParent.clientWidth
                : ctx.windowWidth;
        const CH =
            canvasParent.clientHeight <= ctx.windowHeight
                ? canvasParent.clientHeight
                : ctx.windowHeight;
        // set canvas to parent size every frame
        ctx.resizeCanvas(CW, CH);

        ctx.background(0, 0);
        ctx.stroke(0, 0);

        bgStars.forEach((s) => {
            ctx.push();
            ctx.fill(255, 255 * s.closeness * s.closeness);

            // stars drift
            s.x += s.driftSpeed / 2000.0 * MULT_DRIFT_SPEED;
            s.y += (s.driftSpeed / 2000.0 * MULT_DRIFT_SPEED) * 0.75;

            // stars move away from mouse
            const radius = 0.26;
            const dx = ctx.mouseX / CW - s.x; // vector from star to mouse
            const dy = ctx.mouseY / CH - s.y;
            const dmag = Math.sqrt(dx * dx + dy * dy); // magnitude of distance
            const dmagr = radius - dmag; // remaining magnitude to edge of radius

            if (dmag <= radius) {
                s.x -= dmagr * dmagr * dmagr * s.closeness * dx;
                s.y -= dmagr * dmagr * dmagr * s.closeness * dy;
            }

            // stars loop across the canvas
            s.x %= 1.0;
            s.y %= 1.0;

            // move stars
            ctx.translate(s.x * CW, s.y * CH);

            // spin stars
            ctx.rotate(s.spinSpeed * (ctx.frameCount / 50.0));

            // draw
            drawStar(0, 0, s.innerRadius, s.outerRadius, s.numPoints);
            ctx.pop();
        });

        fgStars.forEach((s) => {
            ctx.push();
            ctx.fill(255);

            // stars drift
            s.x += s.driftSpeed / 2000.0 * MULT_DRIFT_SPEED;
            s.y += (s.driftSpeed / 2000.0 * MULT_DRIFT_SPEED) * 0.75;

            // stars move away from mouse
            const radius = 0.26;
            const dx = ctx.mouseX / CW - s.x; // vector from star to mouse
            const dy = ctx.mouseY / CH - s.y;
            const dmag = Math.sqrt(dx * dx + dy * dy); // magnitude of distance
            const dmagr = radius - dmag; // remaining magnitude to edge of radius

            if (dmag <= radius) {
                s.x -= dmagr * dmagr * dmagr * dx;
                s.y -= dmagr * dmagr * dmagr * dy;
            }

            // stars loop across the canvas
            s.x %= 1.0;
            s.y %= 1.0;

            // move stars
            ctx.translate(s.x * CW, s.y * CH);

            // spin stars
            ctx.rotate(s.spinSpeed * (ctx.frameCount / 50.0));

            // draw
            drawStar(0, 0, s.innerRadius, s.outerRadius, s.numPoints);
            ctx.pop();
        });

        // go through each star[i] and connect to each star[j]
        for (let i = 0; i < fgStars.length; i++) {
            for (let j = 0; j < fgStars.length; j++) {
                if (i === j) continue; // skip connecting this i star to itself
                if (j > i) continue; // skip connecting this j star back to an i star which is already connected

                ctx.push();
                ctx.fill(255);

                const ax = fgStars[i].x;
                const ay = fgStars[i].y;
                const bx = fgStars[j].x;
                const by = fgStars[j].y;

                const dx = bx - ax;
                const dy = by - ay;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const dmx = ctx.mouseX / CW - ax; // vector from star A to mouse
                const dmy = ctx.mouseY / CH - ay;
                const mdist = Math.sqrt(dmx * dmx + dmy * dmy);

                ctx.stroke(
                    255,
                    255 * Math.pow(1 - dist, 15) * Math.pow(1 - mdist, 6)
                );

                ctx.line(ax * CW, ay * CH, bx * CW, by * CH);
                ctx.pop();
            }
        }
    };

    // copied from the p5.js reference documentation
    function drawStar(x, y, radius1, radius2, npoints) {
        const TWO_PI = Math.PI * 2;
        let angle = ctx.TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        ctx.beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = x + Math.cos(a) * radius2;
            let sy = y + Math.sin(a) * radius2;
            ctx.vertex(sx, sy);
            sx = x + Math.cos(a + halfAngle) * radius1;
            sy = y + Math.sin(a + halfAngle) * radius1;
            ctx.vertex(sx, sy);
        }
        ctx.endShape();
    }
};

window.addEventListener("load", (_) => {
    let containers = $(".starfield");
    console.log(containers)

    containers.each((_, el) => {
        new p5(starfield, el);
    });
});
