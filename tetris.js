"use strict";
const canvas = document.getElementById("playArea");
const context = canvas.getContext("2d");
const backgroundColor = "#cccccc"
const width = canvas.width;
const height = canvas.height;
const wpadding = 75;
const hpadding = 20;
const board_width = 10;
const board_height = 20;
const blockWidth = (width-(wpadding*2))/10;
const blockHeight = (height-(hpadding*2))/20;
const tetromino_colors = ["#04f7db","#ebf704","#f304f7","#0404f4", "#f77a04","#0df704","#f71904"]
                            //I,      O,         T,        J,          L,       S,        Z

let removeDup = (numbers) => numbers.filter((number, i) => numbers.indexOf(number) === i);
let board = [];
let activeShape = [[0,0],[0,0],[0,0],[0,0]];
let current_rotation = 0;
let current_shape_color = 0;

let next_shape = 0; //Edit the addShape function and the settle shape function to handle these as well
let next_shape_color = 0;
let speed = 60;
let speedCounter = speed;

const pieces = [
	[
		[0,1],[0,0],[0,2],[0,3] //I piece
	],

	[
		[0,0],[1,0],[0,1],[1,1] //O piece
	],
	[
		[0,1],[-1,1],[0,0],[1,1] //T piece
	],
	[
		[0,1],[0,0],[-2,1],[-1,1] //J piece
	],
	[
		[-1,1],[-1,0],[0,1],[1,1] //L piece
	],
	[
		[0,1],[0,0],[1,0],[-1,1] //S piece
	],
	[
		[0,1],[-1,0],[0,0],[1,1] //Z piece
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
// 2      T
//103
//
//1       L
//023
//
//  1     J
//230
//
// 12     S
//30
//
//12      Z
// 03
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
    for(let i = 0; i < board_width; i++){
        board.push([]);
        for(let j = 0; j < board_height; j++){
            board[i].push(backgroundColor);
        }
    }
	
    return board;
}

function drawBoard(board){
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            drawBlock((wpadding+(blockWidth*i)), (hpadding+(blockHeight*j)), board[i][j])
        }
    }
}

function add_shape(board, piece){
	let Wmiddle = Math.floor(board.length/2);
	let coords = []

	for (let i = 0; i < 4; i++){
		activeShape[i] = [0,0];
		coords.push([Wmiddle + pieces[piece][i][0], pieces[piece][i][1]]);
		current_rotation = 0;
	}
	current_shape_color = piece;
	updateShape(coords);

}

function translate_shape(direction, coords){
	//This function gives the new coordinates given the old coordinates and the direction.
	//0 = down, 1 = left, 2 = right, 3 = anti clockwise, 4 = clockwise
	let newCoords = [];
	let relativeCoords = []

	for (let i = 0; i < coords.length; i++){
		if (direction == 3 || direction == 4){
			relativeCoords = [activeShape[i][0] - activeShape[0][0], activeShape[i][1] - activeShape[0][1]];
		}
		switch (direction){
		case 0:
			newCoords.push([coords[i][0], coords[i][1] + 1]);
			break;
		case 1:
			newCoords.push([coords[i][0] - 1, coords[i][1]]);
			break;
		case 2:
			newCoords.push([coords[i][0] + 1, coords[i][1]]);
			break;
		case 3:
			newCoords.push([relativeCoords[1] * -1 + coords[0][0], relativeCoords[0] + coords[0][1]]);
			break;
		case 4:
			newCoords.push([relativeCoords[1] + coords[0][0], relativeCoords[0] * -1 + coords[0][1]]);
			break;
		}
	}
	return newCoords;
}

function doesItFit(movement, rotation, down){ //The parameters are questions that are asked
	// for movement, -1 = left, 0 =  no movement, 1 = right
	// for rotation, -1 = Anti Clockwise, 0 = no rotation, 1 = Clockwise
	// for down, true = the shape is moving down, false the shape is not moving down.
	let newCoords = [];

	//First find what the new Coords are
	switch (movement){
	case -1:
		newCoords = translate_shape(1, activeShape);
		break;
	case 1:
		newCoords = translate_shape(2, activeShape);
		break;
	default:
		newCoords = activeShape;
		break;
	}

	if (down){newCoords = translate_shape(0,newCoords);}

	switch (rotation){
	case -1:
		newCoords = translate_shape(3, newCoords);
		break;
	case 1:
		newCoords = translate_shape(4, newCoords);
		break;
	default:
		newCoords = newCoords;
	}
	
	//Then check all of the coordinates and see if they all don't colide with any of the background.
	
	for (let i = 0; i < activeShape.length; i++){
		board[activeShape[i][0]][activeShape[i][1]] = backgroundColor;
	}
	for(let i = 0; i < newCoords.length; i++){
		if (newCoords[i][0] < 0 || newCoords[i][0] > board_width-1 || board[newCoords[i][0]][newCoords[i][1]] != backgroundColor){
			updateShape(activeShape)
			return false
		}
	}

	return true;
}

function updateShape(newCoords){ //Called whenever we make a change the the activeShape variable
	for(let i = 0; i < 4; i++){
		board[activeShape[i][0]][activeShape[i][1]] = backgroundColor;
	}
	
	for (let i = 0; i < 4; i++){
		board[newCoords[i][0]][newCoords[i][1]] = tetromino_colors[current_shape_color];
	}
	activeShape = newCoords;
}


function checkLine(y){
	
	for(let i = 0; i < board_width; i++){
		if(board[i][y] == backgroundColor){return false;}
	}
	
	return true;
}


function settleShape(){
	//Called when the shape hits the bottom
	
	//Check for any lines
		let fullLines = [];
		for(let i = 0; i < activeShape.length; i++){
			if(checkLine(activeShape[i][1])){
				fullLines.push(activeShape[i][1])
				for(let j = 0; j < board_width; j++){
					board[j][activeShape[i][1]] = "#ffffff";
				}
				
			}
		}
		
		fullLines.sort();
		fullLines = removeDup(fullLines);
		console.log(fullLines);
		
		//Clear and move the blocks above it downward
		for(let current_line = 0; current_line < fullLines.length; current_line++){
			for(let i = 0; i < board_width; i++){ //This loop clears the line
				board[i][fullLines[current_line]] = backgroundColor;
			}
			
			let tempBoard = board;
			for(let i = 0; i < fullLines[current_line]; i++){
				for (let block = 0; block < board_width; block++){
					board[block][i + 1] = tempBoard[block][i];
				}
			}
			
		}
	
	//update score if cleared
	
	//add a new shape
	//Check if you can put the piece in and if you can't
	let piece = Math.floor(Math.random() * 7);
	add_shape(board, piece);
	
	//end the Game

}

function draw(){
	speedCounter--;
	if (speedCounter <= 0){
		if (doesItFit(0, 0, true)){updateShape(translate_shape(0, activeShape));speedCounter = speed;} else {settleShape();}
	}
    drawBoard(board);
    window.requestAnimationFrame(draw);
}

function keyPressed(e){
	switch(e.key){
	case "ArrowLeft":
			if(doesItFit(-1, 0, false)){
				
				updateShape(translate_shape(1, activeShape));
			}
			break;
	case "ArrowRight":
			if(doesItFit(1, 0, false)){updateShape(translate_shape(2, activeShape));}
			break;
	case "ArrowDown":
			if(doesItFit(0,0, true)){updateShape(translate_shape(0, activeShape))}else{settleShape()}
			break;
	case ";":
			if(doesItFit(0,1, false)){updateShape(translate_shape(4, activeShape));}
			
			break;
	case "q":
			if(doesItFit(0,-1, false)){updateShape(translate_shape(3, activeShape))}
			break;
	}
}

function startGame(){
	window.cancelAnimationFrame(draw);
	board = initBoard(board);
	add_shape(board, Math.floor(Math.random() * 7));
	window.requestAnimationFrame(draw);
}

document.addEventListener("keydown", keyPressed, false);