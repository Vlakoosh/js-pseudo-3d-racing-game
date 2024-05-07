const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 100;

let playerPosition = 0; //range from -1 (left edge) to +1 (right edge)
let playerDistance = 100000;
let playerSpeed = 1;



canvas.height = SCREEN_HEIGHT;
canvas.width = SCREEN_WIDTH;
canvas.style.background = "blue";

let d;

class trackVector{
    constructor(curve, distance){
        this.curve = curve;
        this.distance = distance;
    }

}

let track = [new trackVector(0, 200)];
track.push(new trackVector(1, 2000));
track.push(new trackVector(0, 2000));
track.push(new trackVector(-1, 2000));
track.push(new trackVector(1, 2000));
track.push(new trackVector(0, 2000));
track.push(new trackVector(0.3, 2000));
track.push(new trackVector(-1, 2000));
track.push(new trackVector(0.3, 2000));
track.push(new trackVector(-0.5, 2000));

let trackOffset = 0;
let trackSection = 0;
let targetCurvature = 0;
let currentCurvature = 0;

let bufferData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
let buffer = bufferData.data;

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
d[0] = 255;
d[1] = 255;
d[2] = 255;
d[3] = 255;

const carImage = new Image();
carImage.src = "resources/images/car.png";


document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            playerPosition -= 0.03;
            break;
        case 39:
            playerPosition += 0.03;
            break;
    }
};

function updateScreen() {
    if (trackSection > track.length) trackSection = 0;
    targetCurvature = track[Math.floor(trackSection)].curve;


    for (let y = 0; y < SCREEN_HEIGHT; y ++)
    {
        let perspective = y / (SCREEN_HEIGHT / 2);
        let grassColor = Math.sin((20 * Math.pow(1-perspective, 3)) + playerDistance * 0.00003);
        let curbColor = Math.sin(80 * (Math.pow(1-perspective, 3)) + playerDistance * 0.00003);

        for (let x = 0; x < SCREEN_WIDTH; x++)
        {


            let roadMiddlePoint = 0.5 + currentCurvature * Math.pow((1-perspective), 3);
            let curvatureDifference = targetCurvature - currentCurvature;
            currentCurvature += curvatureDifference * 0.0000003;
            playerPosition -= currentCurvature * 0.000003;
            //0.1 - minimum road width
            let roadWidth = 0.1 + perspective * 0.8;
            let curbWidth = roadWidth * 0.15;

            roadWidth *= 0.5;

            let leftGrassBound = (roadMiddlePoint - roadWidth - curbWidth) * SCREEN_WIDTH;
            let leftCurbBound = (roadMiddlePoint - roadWidth) * SCREEN_WIDTH;
            let rightGrassBound = (roadMiddlePoint + roadWidth + curbWidth) * SCREEN_WIDTH;
            let rightCurbBound = (roadMiddlePoint + roadWidth) * SCREEN_WIDTH;

            let row = SCREEN_HEIGHT / 2 + y;

            let currentGrass;
            if (grassColor > 0){
                currentGrass = grass;
            }
            else {
                currentGrass = grassDark;
            }

            let currentCurb;
            if (curbColor > 0){
                currentCurb = curbLight;
            }
            else {
                currentCurb = curbDark;
            }

            //the random >=/<=/+1 are for fixing empty pixels on places where x rounds
            if (x >= 0 && x < leftGrassBound) {
                buffer[(x + row*SCREEN_WIDTH)*4] = currentGrass.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentGrass.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentGrass.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x > leftGrassBound-1 && x < leftCurbBound) {
                buffer[(x + row*SCREEN_WIDTH)*4] = 255;
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentCurb.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentCurb.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x >= leftCurbBound && x <= rightCurbBound) {
                buffer[(x + row*SCREEN_WIDTH)*4] = road.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = road.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = road.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x > rightCurbBound && x < rightGrassBound+1) {
                buffer[(x + row*SCREEN_WIDTH)*4] = currentCurb.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentCurb.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentCurb.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x > rightGrassBound && x < SCREEN_WIDTH) {
                buffer[(x + row*160)*4] = currentGrass.data[0];
                buffer[(x + row*160)*4 + 1] = currentGrass.data[1];
                buffer[(x + row*160)*4 + 2] = currentGrass.data[2];
                buffer[(x + row*160)*4 + 3] = 255;
            }



            playerDistance += playerSpeed;

        }
    }
    ctx.putImageData(bufferData, 0, 0);

    let carY = SCREEN_HEIGHT - carImage.height - 3;
    let carX = SCREEN_WIDTH / 2 + (SCREEN_WIDTH * playerPosition / 2) - carImage.width/2;

    ctx.drawImage(carImage, carX, carY);
    trackSection+=0.01;
}

setTimeout(() => {
    setInterval(()=>{
        updateScreen();
    }, 17);
}, 2000);
