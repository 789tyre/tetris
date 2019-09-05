"use strict";
const canvas = document.getElementById("playArea");
const context = canvas.getContext("2d");
const backgroundColor = "#cccccc"
const width = canvas.width;
const height = canvas.height;
const wpadding = 100;
const hpadding = 20;
const board_width = 10;
const board_height = 20;
const blockWidth = (width-(wpadding*2))/10;
const blockHeight = (height-(hpadding*2))/20;
const boxSize = wpadding/2;
const miniBlockSize = boxSize/5;
const tetromino_colors = ["#04f7db","#ebf704","#f304f7","#0404f4", "#f77a04","#0df704","#f71904"]
                            //I,      O,         T,        J,          L,       S,        Z


let removeDup = (numbers) => numbers.filter((number, i) => numbers.indexOf(number) === i);
let locker;
//Board and shape variables
let board = [];
let activeShape = [[0,0],[0,0],[0,0],[0,0]];
let current_shape = 0;
let fullLines = [];
let next_shape = -1; //Edit the addShape function and the settle shape function to handle these as well
let hold_shape = -1;

//Game state trackers
let paused =  false;
let canHold = true;
let gameover = false;
let lines = 0;
let score = 0;
let level = 0;
let speed = 70;
let waitTimer = 0;
let speedCounter = speed;
let ID;

//Controls
let controls = [];


const pieces = [
	[
		[0,2],[0,0],[0,1],[0,3] //I piece
	],
	[
		[-1,0],[0,0],[-1,1],[0,1] //O piece
	],
	[
		[0,1],[-1,1],[0,0],[1,1] //T piece
	],
	[
		[0,1],[1,0],[-1,1],[1,1] //J piece
	],
	[
		[0,1],[-1,0],[-1,1],[1,1] //L piece
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
//2
//0
//3
//
//01      O
//23
//
// 2      T
//103
//
//1       L
//203
//
//  1     J
//203
//
// 12     S
//30
//
//12      Z
// 03
//
context.strokeStyle = "#000000"; //Setting up the boundries visually
context.strokeRect(0,0, width, height);

function setControls(newControls){
	for(let i = 0; i < newControls.length; i++){
		document.getElementById(i.toString()).value = newControls[i];
	}
}

function setControlsSpecial(mode){
	switch (mode){
	case 1:
		setControls(["o", "a", "e", ",", ".", "'", "p"]);
	case 2:
		setControls(["o", "a", "e", ",", "t", "h", "n"]);
	}
}

function getControls(){
	let controls = [];
	for(let i = 0; i < 7; i++){
		controls.push( document.getElementById( i.toString() ).value );
	}
	return controls
}


function drawBlock(x, y, color){
    //Has constant width and height and may not be the same
    context.strokeStyle = "#000000";
    context.fillStyle = color;
    context.strokeRect(x, y, blockWidth, blockHeight);
    context.fillRect(x, y, blockWidth, blockHeight);
}

function drawMiniBlock(x, y, color){
	context.strokeStyle = "#000000";
	context.fillStyle = color;
	context.strokeRect(x, y, miniBlockSize, miniBlockSize);
	context.fillRect(x, y, miniBlockSize, miniBlockSize);
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
	context.fillStyle = backgroundColor;
	context.strokeStyle = "#000000";
	context.fillRect(0,0, width, height);
	context.strokeRect(0,0, width, height);
    for(let i = 0; i < board.length; i++){ //Draw the board
        for(let j = 0; j < board[i].length; j++){
            drawBlock((wpadding+(blockWidth*i)), (hpadding+(blockHeight*j)), board[i][j])
        }
    }
	//Draw the next and hold box
	context.font = "20px Arial";
	context.fillStyle = "#000000";
	context.fillText("Next", wpadding + blockWidth * board_width + hpadding+13, hpadding * 1.5);
	context.strokeStyle = "#000000";
	context.fillStyle = backgroundColor;
	context.strokeRect(wpadding + (blockWidth * board_width) + hpadding, hpadding * 2,  boxSize, boxSize); //Next box
	context.fillRect(wpadding + hpadding + (blockWidth * board_width), hpadding * 2, boxSize, boxSize);

	for(let i = 0; i < activeShape.length; i++){
		let centerW = boxSize/2 - miniBlockSize/2;
		let centerH = (boxSize/2) - miniBlockSize * 1.5;
		drawMiniBlock(wpadding + hpadding + (blockWidth * board_width) + centerW + (pieces[next_shape][i][0] * miniBlockSize), hpadding * 2 + centerH + (pieces[next_shape][i][1] * miniBlockSize), tetromino_colors[next_shape]);
		//Maybe instead have a function that figures out where to put the mini shape and not this calculating garbage and offcenter stuff.

	}
	
	context.fillStyle = "#000000";
	context.fillText("Hold", hpadding + 13, hpadding * 1.5);
	context.fillStyle = backgroundColor;
	context.strokeRect(hpadding, hpadding * 2, boxSize, boxSize); //Hold Box
	context.fillRect(hpadding, hpadding * 2, boxSize, boxSize);
	if (hold_shape != -1){
		context.fillStyle = tetromino_colors[hold_shape];
		for(let i = 0; i < activeShape.length; i++){
			let centerW = boxSize/2 - miniBlockSize/2;
			let centerH = (boxSize/2) - miniBlockSize * 1.5;
			drawMiniBlock(hpadding + centerW + pieces[hold_shape][i][0] * miniBlockSize, hpadding * 2 + centerH + pieces[hold_shape][i][1] * miniBlockSize);
		}
	}

	//Draw the level, current score and the line count
	context.fillStyle = "#000000";
	context.fillText("Level: " + level, hpadding, boxSize + hpadding * 3);
	context.fillText("Lines: " + lines, hpadding, boxSize + hpadding * 4);
	context.fillText("Score: " + score, hpadding, boxSize + hpadding * 5);
	
}

function add_shape(){
	let Wmiddle = Math.floor(board_width/2);

	if (next_shape == -1){
		next_shape = Math.floor(Math.random() * 7);
	}


	let coords = add_shape_specific(next_shape);
	current_shape = next_shape;
	next_shape = Math.floor(Math.random() * 7);

	if (checkGameOver(coords)){
		updateShape(coords);
	} else {
		alert("Game over");
		locker.stop();
		document.removeEventListener("keydown", keyPressed, false);
		window.cancelAnimationFrame(draw);
		gameover = true;
	}

}

function add_shape_specific(piece){
	let coords = []
	let Wmiddle = Math.floor(board_width/2);
	for(let i = 0; i < activeShape.length; i++){
		activeShape[i] = [0,0];
		coords.push([Wmiddle + pieces[piece][i][0], pieces[piece][i][1]]);
	}
	return coords
}


function checkGameOver(coords){
	for (let i = 0; i < coords.length; i++){
		if (board[coords[i][0]][coords[i][1]] != backgroundColor){return false;}
	}
	return true;
}

function holdShape(){
	canHold = false;
	if (hold_shape != -1) {
		//Swap the held shape and the current shape if it can fit
		let toSwap = hold_shape;
		hold_shape = current_shape;
		current_shape = toSwap;
		for(let i = 0; i < activeShape.length; i++){
			board[activeShape[i][0]][activeShape[i][1]] = backgroundColor;
		}
		updateShape(add_shape_specific(current_shape));

	} else {
		//put the current shape into the hold box and get the next shape
		for (let i = 0; i < activeShape.length; i++){
			board[activeShape[i][0]][activeShape[i][1]] = backgroundColor;
		}
		hold_shape = current_shape;
		current_shape = next_shape;
		updateShape(add_shape_specific(next_shape));
		next_shape = Math.floor(Math.random() * 7);
	}
}



function translate_shape(direction, coords){
	//This function gives the new coordinates given the old coordinates and the direction.
	//0 = down, 1 = left, 2 = right, 3 = anti clockwise, 4 = clockwise
	let newCoords = [];
	let relativeCoords = []
	if(current_shape == 1 && (direction == 3 || direction == 4)){return coords;}
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
		board[newCoords[i][0]][newCoords[i][1]] = tetromino_colors[current_shape];
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
		fullLines = [];
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
		//console.log(fullLines);
		if(fullLines.length > 0){
			waitTimer = 15;
		} else {
			add_shape();
		}
		//waitTimer = 15;
		canHold = true;

}


function clearLines(fullLines){
	//Clear and move the blocks above it downward
	for(let current_line = 0; current_line < fullLines.length; current_line++){
		for(let i = 0; i < board_width; i++){ //This loop clears the line
			board[i][fullLines[current_line]] = backgroundColor;
		}
	
		let tempBoard = board.map(function(arr) {return arr.slice();})
		for(let i = 0; i < fullLines[current_line]; i++){
			for (let block = 0; block < board_width; block++){
				board[block][i + 1] = tempBoard[block][i];
			}
		}
	}
	
	//Update Score and line count and maybe level and speed
	switch(fullLines.length){
	case 1:
		score += 40 * (level + 1);
		break;
	case 2:
		score += 100 * (level + 1);
		break;
	case 3:
		score += 300 * (level + 1);
		break;
	case 4:
		score += 1200 * (level + 1);
		break;
	}
	lines += fullLines.length;
	if (lines != 0 && lines >= level * 10){
		speed -= 10;
		level++;
	}
	add_shape();
}

function pause(){
	paused = !paused; //Toggle paused state

	if (paused){
		//Release the scroll bar
		locker.stop();
		//Draw a big rectangle that prevents cheating
		context.fillStyle = backgroundColor;
		context.fillRect(0,0,width, height);
		context.font = "50px Arial";
		context.fillStyle = "#000000";
		context.fillText("PAUSED",width/2-100,height/2);
		context.strokeRect(0,0,width, height);
	} else {
		//Get controls and validate them (should be in another function)
		controls = getControls();
		//lock the scroll bar again
		locker = dontScroll();
		//Restart the animation
		window.requestAnimationFrame(draw);
	}

}


function draw(){
	if(!paused){	
		if (!gameover){
			if (waitTimer){
				waitTimer--;
				if (!waitTimer){
					clearLines(fullLines);
				}
			} else {
		
				speedCounter--;
				if (speedCounter <= 0){
					if (doesItFit(0, 0, true)){
						updateShape(translate_shape(0, activeShape));
						speedCounter = speed;
					} else {
						settleShape();
						speedCounter = speed;
					}
				}
			}
		}
    	drawBoard(board);
    	ID = window.requestAnimationFrame(draw);
	} else {
		window.cancelAnimationFrame(ID);
	}
}

function keyPressed(e){
	if (!gameover && !waitTimer && !paused){
		switch(e.key){
		case (controls[1]): //Left
				if(doesItFit(-1, 0, false)){updateShape(translate_shape(1, activeShape));}
				break;
		case (controls[2]): //Right
				if(doesItFit(1, 0, false)){updateShape(translate_shape(2, activeShape));}
				break;
		case (controls[0]): //Down
				if(doesItFit(0,0, true)){updateShape(translate_shape(0, activeShape))}else{settleShape(); speedCounter = speed;}
				break;
		case (controls[3]): //Hold
				if(canHold){holdShape();}
				break;
		case (controls[5]): //Rotate Anti Clockwise
				if(doesItFit(0,1, false)){updateShape(translate_shape(4, activeShape));}
				break;
		case (controls[4]): //Rotate Clockwise
				if(doesItFit(0,-1, false)){updateShape(translate_shape(3, activeShape))}
				break;
		}
	}
	if (e.key == controls[6]){
		pause();
	}
}

function dontScroll(){
	let lockX = window.scrollX;
	let lockY = 0;
	window.scrollTo(lockX, lockY);

	function lockIt(){
		window.scrollTo(lockX, lockY);
		return false;
	}
	window.addEventListener("scroll", lockIt, false);

	return {
		stop: function(){
			window.removeEventListener("scroll", lockIt, false);
		}
	}
}

function restartGame(){
	paused = true;
	draw();
	paused = false;
	board = initBoard(board);
	gameover = false;
	lines = 0;
	level = 0;
	score = 0;
	speed = 60;
	hold_shape = -1;
	canHold = true;
	add_shape();
	locker = dontScroll();
	document.addEventListener("keydown", keyPressed, false);
}

function startGame(){
	
	controls = getControls();
	restartGame();
	ID = window.requestAnimationFrame(draw);
}

