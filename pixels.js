let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const grass = ctx.createImageData(1,1); // only do this once per page
d  = grass.data;
d[0] = 0;
d[1] = 200;
d[2] = 0;
d[3] = 255;

const grassDark = ctx.createImageData(1,1); // only do this once per page
d  = grassDark.data;
d[0] = 0;
d[1] = 150;
d[2] = 0;
d[3] = 255;

const curbDark = ctx.createImageData(1,1); // only do this once per page
d  = curbDark.data;
d[0] = 214;
d[1] = 4;
d[2] = 4;
d[3] = 255;

const curbLight = ctx.createImageData(1,1); // only do this once per page
d  = curbLight.data;
d[0] = 214;
d[1] = 200;
d[2] = 200;
d[3] = 255;

const road = ctx.createImageData(1,1); // only do this once per page
d  = road.data;
d[0] = 150;
d[1] = 150;
d[2] = 150;
d[3] = 255;

const roadLine = ctx.createImageData(1,1); // only do this once per page
d  = roadLine.data;
d[0] = 190;
d[1] = 190;
d[2] = 190;
d[3] = 255;
