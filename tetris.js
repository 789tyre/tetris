const canvas = document.getElementById("playArea");
const context = canvas.getContext("2d");
const backgroundColor = "#cccccc"
const width = canvas.width;
const height = canvas.height;
const wpadding = 75;
const hpadding = 20;
const blockWidth = (width-(wpadding*2))/10;
const blockHeight = (height-(hpadding*2))/20;

let board = [];

context.strokeStyle = "#000000"; //Setting up the boundries visually
context.strokeRect(0,0, width, height);

function drawBlock(x, y, color){
    //Has constant width and height
    context.strokeStyle = "#000000";
    context.fillStyle = color;
    context.strokeRect(x, y, blockWidth, blockHeight);
    context.fillRect(x, y, blockWidth, blockHeight);
}

function initBoard(board){
    for(i = 0; i<10; i++){
        board.push([]);
        for(j = 0; j<20; j++){
            board[i].push(backgroundColor);
        }
    }
    return board;
}

function drawBoard(board){
    for(i = 0; i < board.length; i++){
        for(j = 0; j < board[i].length; j++){
            drawBlock((wpadding+(blockWidth*i)), (hpadding+(blockHeight*j)), board[i][j])
        }
    }
}

board = initBoard(board);
function draw(){
    frameCount++;
    frameCount = frameCount%255;
    console.log(frameCount);
    drawBoard(board);
    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);