# rubic.dev
my personal website for storing my game development and weird web projects.

rubic.dev started out as a website called revolv.fr on September 21st, 2017. it was a simple hobby project with the eventual goal of becoming a portfolio site. the domain was briefly changed to rubic.cc before google announced their .dev domains, and now it's rubic.dev.

on June 4th, 2021, the website's first public version was effectively complete. although many of the media galleries didn't have the full functionality i designed for them, they were presentable, and rubic.dev officially became my current portfolio site.

## Website Breakdown
for my own future self to reference and for those curious, this is a breakdown of a bunch of parts of my website.

### my own stuff
i made a number of useful things to get the site looking the way i wanted it to and for general quality of life improvements.

##### penrose.js
this code picks up any div with a class name of "penrose-canvas" and places a spinning penrose triangle navigation. this was originally a project i poured a ton of time into on [jsfiddle](https://jsfiddle.net/) before i really understood any javascript, so it was a neat introduction to the basics of js, jquery, and canvas. clicking buttons in the navigation just scrolls to an anchor on the page, since that's all i needed it for.

##### starfield.js
this is the background effect of the website, and similarly pickes up a "starfield" div and places a screen-wide canvas of stars. this project was drawn up with the original version of the website, but didn't get implemented until about 7 years later. oops!

### dependencies
any code that isn't my own and shows up in my website files is here.

##### [Eric Meyer's reset.css](https://meyerweb.com/eric/tools/css/reset/) (with personal edits)
good css defaults, pretty typical for a lot of web developers but i felt like mentioning it anyways. i've adjusted some things here and there.

##### [Cash](https://github.com/kenwheeler/cash)
a reduced size jQuery alternative because i only needed some of the most convenient jQuery features.

##### [p5.js](https://p5js.org/)
a library for HTML canvas manipulation, just because i wanted to learn what kinds of features it has.

### development dependencies
any code that isn't my own but was used purely for the development of the website and doesn't show up in the website's files is here.

##### [Jekyll](https://jekyllrb.com/)
i tried a variety of different frameworks and content management systems for building this website. ultimately, it's just a simple static page. after passing through the react and vue.js space i decided on jekyll for its simplicity. so far, it does everything i need it to do without hassle.
