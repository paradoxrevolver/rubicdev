# rubic.dev
my personal website for storing my work and weird web projects.

### a little history
this website started out on september 21st, 2017 as a website called revolv.fr, which was a simple hobby project with the eventual goal of becoming a sort of portfolio site. it was briefly rubic.cc before google announced their .dev domains, and today it's rubic.dev.

## Website Breakdown
for my own future self to reference and for those curious, this is a breakdown of a bunch of parts of my website.

### my own stuff
i made a number of useful things to get the site looking the way i wanted it to and for general quality of life improvements.

##### penrose.js
this code picks up any div with a class name of "penrose-canvas" and places a spinning penrose triangle navigation. this was originally a project i poured a ton of time into on [jsfiddle](https://jsfiddle.net/) before i really understood any javascript, so it was a neat introduction to the basics of js and canvas.

---

### dependencies
these are any and all code resources that i've used for the site that will still exist on the live version of the site, even if they're packed into code in some form or another.

##### [Eric Meyer's reset.css](https://meyerweb.com/eric/tools/css/reset/) (with some personal edits)
good defaults for css that would otherwise look weird. i've adjusted some things here and there.

##### [Cash](https://github.com/kenwheeler/cash)
a reduced size jquery alternative because i only needed some of the most convenient features

---

### development dependencies
these are any and all resources that i'm using for developing the site but are unnecessary to put on the server hosting it. they're just there for coding convenience.

##### [Jekyll](https://jekyllrb.com/)
i've tried a variety of different frameworks / content management systems for building this website but ultimately, it's just a simple static page. after passing through the react and vue.js space i decided on jekyll for its simplicity. working with Ruby has been interesting. so far, it does everything i need it to do without hassle.
