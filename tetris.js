const canvas = document.getElementById("playArea");
const context = canvas.getContext("2d");
const backgroundColor = "#cccccc"
const width = canvas.width;
const height = canvas.height;
const wpadding = 75;
const hpadding = 20;
const blockWidth = (width-(wpadding*2))/10;
const blockHeight = (height-(hpadding*2))/20;
const tetromino_colors = ["#04f7db","#ebf704","#f304f7","#0404f4", "#f77a04","#0df704","#f71904"]
                            //I,      O,         T,        J,          L,       S,        Z

let board = [];
let activeShape = [[0,0],[0,0],[0,0],[0,0]];
let current_rotation = 0;

const pieces = [
	[
		[0,1],[0,0],[0,2],[0,3] //I piece
	],

	[
		[0,0],[1,0],[0,1],[1,1] //O piece
	],
	[
		[0,0],[-1,1],[0,1],[1,1] //T piece
	],
	[
		[0,1],[0,0],[-2,1],[-1,1] //J piece
	],
	[
		[-1,1],[-1,0],[0,1],[1,1] //L piece
	],
	[
		[0,0],[1,0],[-1,1],[0,1] //S piece
	],
	[
		[0,0],[-1,0],[0,1],[1,1] //Z piece
	]

];
//Inital State of the Shapes
//
//1       I
//0
//2
//3
//
//01      O
//23
//
// 0      T
//123
//
//1       L
//023
//
//  1     J
//230
//
// 01     S
//23
//
//10      Z
// 23
//
context.strokeStyle = "#000000"; //Setting up the boundries visually
context.strokeRect(0,0, width, height);

function drawBlock(x, y, color){
    //Has constant width and height and may not be the same
    context.strokeStyle = "#000000";
    context.fillStyle = color;
    context.strokeRect(x, y, blockWidth, blockHeight);
    context.fillRect(x, y, blockWidth, blockHeight);
}

function initBoard(board){ //setting up a blank board, ready to be filled up by tetrominos
    board = []
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

function add_piece(board, piece){
	let Wmiddle = Math.floor(board.length/2);
	//let piece = 0;
	for (i = 0; i < 4; i++){
		let coords = [Wmiddle + pieces[piece][i][0], pieces[piece][i][1]];
		board[coords[0]][coords[1]] = tetromino_colors[piece];
		activeShape[i] = coords;
		current_rotation = 0;
	}
}

//function doesItFit(rotation){
	//-1 for anti-clockwise, 0 for none, 1 for clockwise
	//apply rotation if the rotation parameter is not 0
	
//	let nextCoords = 0;
	
	
	
//	for (i = 0; i < 4; i++){
		
//	}
	
	
//	return true;
	
//}

function rotate(anti){
	let newCoords = [];
	
	for (i = 1; i < activeShape.length; i++){
		newCoords.push([]);
		if (anti){
			newCoords[i].push(activeShape[i][0]);
			newCoords[i]push(activeShape[i][1] * -1);
		} else {
		
		}
	}
	
	
	return newCoords;
}

board = initBoard(board);
function draw(){
    drawBoard(board);
    window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
