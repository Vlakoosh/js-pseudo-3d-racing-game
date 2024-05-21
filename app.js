canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
const SCREEN_WIDTH = 160;
const SCREEN_HEIGHT = 100;
canvas.height = SCREEN_HEIGHT;
canvas.width = SCREEN_WIDTH;
canvas.style.background = "rgb(50,50,230)"; //blue

const carImage = new Image();
carImage.src = "resources/images/car.png";

const MAX_SPEED = 10;
let playerPosition = 0; //range from -1 (left edge) to +1 (right edge)
let playerDistance = 0;
let playerSpeed = 0; //range from 0 to 1;
let steeringAngle = 0; //range from -1 to 1

let backgroundPhase= 0;


let d;
//trackVector is a piece of the track with a curviture and a distance. 
//Curviture is the sharpness of the turn
class trackVector{
    constructor(curve, distance){
        this.curve = curve;
        this.distance = distance;
    }

}

//initialize a demo track
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

let trackSection = 0;
let targetCurvature = 0;
let currentCurvature = 0;

//make a buffer to optimize rendering
let bufferData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
let buffer = bufferData.data;

let leftKeyPressed = false;
let rightKeyPressed = false;
let upKeyPressed = false;

document.onkeydown = function (e) {
    if(e.key === "ArrowLeft"){
        leftKeyPressed = true;
    }
    if(e.key === "ArrowRight"){
        rightKeyPressed = true;
    }
    if(e.key === "ArrowUp"){
        upKeyPressed = true;
    }
};

document.onkeyup = function (e) {
    if(e.key === "ArrowLeft"){
        leftKeyPressed = false;
    }
    if(e.key === "ArrowRight"){
        rightKeyPressed = false;
    }
    if(e.key === "ArrowUp"){
        upKeyPressed = false;
    }
};


function updateScreen() {
    if (trackSection > track.length) trackSection = 0;
    targetCurvature = track[Math.floor(trackSection)].curve;

    let targetAngle = 0;
    if (leftKeyPressed){
        targetAngle = -1;
    }
    if (rightKeyPressed){
        targetAngle = 1;
    }
    let angleDifference = targetAngle - steeringAngle;
    if (targetAngle === 0){
        steeringAngle += angleDifference * 0.09 / (SCREEN_HEIGHT/160);
    }
    else{
        steeringAngle += angleDifference * 0.0005 / (SCREEN_HEIGHT/160);
    }

    let targetSpeed = 0;
    if (upKeyPressed){
        targetSpeed = 1;
    }

    //if player is off the tack
    if (playerPosition < -0.8 || playerPosition > 0.8){
        targetSpeed = 0.2;
    }

    let speedDifference = targetSpeed - playerSpeed;

    playerSpeed += speedDifference * 0.05;

    playerPosition += steeringAngle * SCREEN_WIDTH/160;
    playerDistance += playerSpeed*2;
    //
    for (let y = 0; y < SCREEN_HEIGHT; y ++)
    {
        let perspective = y / (SCREEN_HEIGHT / 2);
        let grassColor = Math.sin(((20 * Math.pow(1-perspective, 3)) + playerDistance * 0.3)/ (SCREEN_WIDTH/160));
        let curbColor = Math.sin((80 * (Math.pow(1-perspective, 3)) + playerDistance * 0.3* (SCREEN_WIDTH/160))/ (SCREEN_WIDTH/160));

        for (let x = 0; x < SCREEN_WIDTH; x++)
        {

            let roadMiddlePoint = 0.5 + currentCurvature * Math.pow((1-perspective), 3);
            let curvatureDifference = (targetCurvature - currentCurvature) / (SCREEN_WIDTH/160);
            currentCurvature += (curvatureDifference * 0.0000003 * playerSpeed) / (SCREEN_WIDTH/160);
            playerPosition -= (currentCurvature * 0.000001 * playerSpeed) / (SCREEN_WIDTH/160);
            //0.1 - minimum road width
            let roadWidth = 0.1 + perspective * 1.3;
            let curbWidth = roadWidth * 0.07;

            roadWidth *= 0.5;

            let leftGrassBound = (roadMiddlePoint - roadWidth/2 - curbWidth) * SCREEN_WIDTH;
            let leftCurbBound = (roadMiddlePoint - roadWidth/2) * SCREEN_WIDTH;
            let laneSplit1Left = (roadMiddlePoint - roadWidth/3/2) * SCREEN_WIDTH - roadWidth*0.03*SCREEN_WIDTH;
            let laneSplit1Right = (roadMiddlePoint - roadWidth/3/2) * SCREEN_WIDTH;
            let laneSplit2Left = (roadMiddlePoint + roadWidth/3/2) * SCREEN_WIDTH;
            let laneSplit2Right = (roadMiddlePoint + roadWidth/3/2) * SCREEN_WIDTH + (roadWidth*0.03)*SCREEN_WIDTH;
            let rightCurbBound = (roadMiddlePoint + roadWidth/2) * SCREEN_WIDTH;
            let rightGrassBound = (roadMiddlePoint + roadWidth/2 + curbWidth) * SCREEN_WIDTH;


            let row = SCREEN_HEIGHT / 2 + y;

            let currentGrass;
            if (grassColor > 0){
                currentGrass = grass;
            }
            else {
                currentGrass = grassDark;
            }

            let currentCurb;
            let currentRoadLine;
            if (curbColor > 0){
                currentCurb = curbLight;
                currentRoadLine = roadLine;
            }
            else {
                currentCurb = curbDark;
                currentRoadLine = road;
            }

            //the random >=/<=/+1 are for fixing empty pixels on places where x rounds
            if (x >= 0 && x < leftGrassBound) {
                buffer[(x + row*SCREEN_WIDTH)*4] = currentGrass.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentGrass.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentGrass.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x > leftGrassBound-1 && x < leftCurbBound) {
                buffer[(x + row*SCREEN_WIDTH)*4] = currentCurb.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentCurb.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentCurb.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x >= leftCurbBound && x <= laneSplit1Left) {
                buffer[(x + row*SCREEN_WIDTH)*4] = road.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = road.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = road.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x > laneSplit1Left && x <= laneSplit1Right){
                buffer[(x + row*SCREEN_WIDTH)*4] = currentRoadLine.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentRoadLine.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentRoadLine.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x > laneSplit1Right && x < laneSplit2Left){
                buffer[(x + row*SCREEN_WIDTH)*4] = road.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = road.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = road.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x >= laneSplit2Left && x < laneSplit2Right){
                buffer[(x + row*SCREEN_WIDTH)*4] = currentRoadLine.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentRoadLine.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentRoadLine.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }
            if (x >= laneSplit2Right && x <= rightCurbBound) {
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
                buffer[(x + row*SCREEN_WIDTH)*4] = currentGrass.data[0];
                buffer[(x + row*SCREEN_WIDTH)*4 + 1] = currentGrass.data[1];
                buffer[(x + row*SCREEN_WIDTH)*4 + 2] = currentGrass.data[2];
                buffer[(x + row*SCREEN_WIDTH)*4 + 3] = 255;
            }





        }
    }
    ctx.putImageData(bufferData, 0, 0);
    backgroundPhase += (currentCurvature*0.2*playerSpeed) * (SCREEN_WIDTH/160);
    for(let x = 0; x < SCREEN_WIDTH; x++){
        let hill1Height = Math.abs(Math.sin(x * 0.02 + backgroundPhase * 0.08)) * 20 * SCREEN_WIDTH/160;
        let hill2Height = Math.abs(Math.sin(x * 0.04 + backgroundPhase * 0.4 + 2)) * 15 * SCREEN_WIDTH/160;
        let forestHeight = Math.abs(Math.sin(x * 0.4 + backgroundPhase * 5 + 2)) * 1.4 * SCREEN_WIDTH/160;

        ctx.beginPath(); // Start a new path
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(0,120,0)";
        ctx.moveTo(x, SCREEN_HEIGHT/2); // Move the pen to x, y
        ctx.lineTo(x, SCREEN_HEIGHT/2 - hill1Height); // Draw a line to x,y
        ctx.stroke(); // Render the path

        ctx.beginPath(); // Start a new path
        ctx.strokeStyle = "rgb(0,160,0)";
        ctx.moveTo(x, SCREEN_HEIGHT/2); // Move the pen to x, y
        ctx.lineTo(x, SCREEN_HEIGHT/2 - hill2Height); // Draw a line to x,y
        ctx.stroke(); // Render the path

        ctx.beginPath(); // Start a new path
        ctx.strokeStyle = "rgb(0,80,0)";
        ctx.moveTo(x, SCREEN_HEIGHT/2); // Move the pen to x, y
        ctx.lineTo(x, SCREEN_HEIGHT/2 - forestHeight * 5); // Draw a line to x,y
        ctx.stroke(); // Render the path
    }

    if(playerPosition > 0.95) {
        playerPosition = 0.947;
        steeringAngle = -0.001;
    }
    if(playerPosition < -0.95) {
        playerPosition = -0.953;
        steeringAngle = 0.001;
    }

    let carY = SCREEN_HEIGHT - carImage.height*SCREEN_HEIGHT/100 - 3;
    let carX = SCREEN_WIDTH / 2 + (SCREEN_WIDTH * playerPosition / 2) - (carImage.width/2)*SCREEN_WIDTH/160;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(carImage, 0, 0, carImage.width, carImage.height, carX, carY, carImage.width*SCREEN_WIDTH/160, carImage.height*SCREEN_HEIGHT/100);
    trackSection+=0.01*playerSpeed;
}

var img = new Image();
img.src = "resources/images/startIcon.png";
img.onload = function () {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, SCREEN_WIDTH/2 - img.width/2, SCREEN_HEIGHT/2 - img.height/2);
}

let start = false
canvas.addEventListener("click", ()=>{
    if (!start){
        start = true;
        setInterval(()=>{
            updateScreen();
        }, 17);
    }
})

