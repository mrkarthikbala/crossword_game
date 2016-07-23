/*Makes POST request to difficulty change URL when button (easy/medium/hard) is clicked. */
function setSettings(){
	var difficultySetting = "medium";
	//the array of difficulty buttons to the right of the GUI
	var buttons = document.settings.difficulty;
	for(var i = 0; i < buttons.length; i++) {
	    buttons[i].onclick = function() {
		difficultySetting = this.value;
		$.ajax({
			url: '/setDifficulty',
			contentType: 'application/json',
      			data: {'difficulty': difficultySetting},
      	 		type: 'POST',	
			async: true,
		
		    });
	    };
	}
	
}
/*Makes POST request to /getNewPuzzle, parses JSON data returned */
function getNewPuzzle(){
	var puzzleAndClues;
	$.ajax({
		url: '/getNewPuzzle',
      		data: {},
       		type: 'POST',	
		async: false,
		success: function(data){
			puzzleAndClues = jQuery.parseJSON(data);
			},
		error: function(data){
			console.log(data);
		}
    });
	return puzzleAndClues;
}


/*Displays hint to user*/
function getHint(){
	var str = "Next Letter: " + gameCanvas.missingLetters[gameCanvas.countFilled];
	alert(str);
}

/*Update the high score, post to db*/
function updateHighScore(){
	if (localStorage.getItem("username") == null) return;

	$("#highScore").html("High Score: " + localStorage.getItem("highScore"));
	$.ajax({
		url: '/updateHighScore',
		contentType: 'application/json',
      		data: {'username': window.btoa(localStorage.getItem("username")), "highScore": localStorage.getItem("highScore")},
       		type: 'POST',	
		async: true,
		success: function(data){
			console.log(data);
			},
		error: function(data){
			console.log(data);
		}
    });
		
}

/*Puts together new puzzle. Called each time we solve a puzzle.*/
function getNewGrid(){
	gameCanvas.clear();
	var puzzleAndClues = getNewPuzzle();
	var clues = new Clues(puzzleAndClues["clues"]);
	var grid = new Grid(puzzleAndClues["puzzle"], clues.clueNumbers);
	gameCanvas.missingLetters = puzzleAndClues["answers"];
	gameCanvas.colorFirstSquare();
}
/*Fill in the username (if it exists) and player high score (if it exists) at the top of the page.*/
function initPlayerStats(){
	//if no player is logged in, just display the high score and shift the game down for aesthetics.
	if (localStorage.getItem("username") == null){
		localStorage.setItem("highScore", 0);
 		$("#highScore").html("High Score: " + localStorage.getItem("highScore"));
		$("#container").css("margin-top", "100px");
		return;
	}
		
	$("#username").html(localStorage.getItem("username"));
 	$("#highScore").html("High Score: " + localStorage.getItem("highScore"));
}

/*Initialize the canvas, set keyboard input handlers, and get our first puzzle.*/
function startGame() {
    initPlayerStats();
    
    gameCanvas.start();
    setSettings();
    document.addEventListener("keydown",keyDownHandler, false);
    document.addEventListener("input", keyDownHandler, false);
    getNewGrid();
}

/*HTML element in which the game is drawn*/
var gameCanvas = {
    canvas : document.createElement("canvas"),

	//unfilled board slot (missing letter) positions
	unfilledSlotsX : [],
	unfilledSlotsY : [],
	missingLetters: [],

	//game clock
	startTime: 0,

	//how many answers we've filled in
	countFilled: 0,

	//answers we've filled in
	filledLetters: [], 
	
	//total score
	totalScore: 0,
	
	//score for this puzzle
	wordScore: 0,
	
	//high score
	highScore: localStorage.getItem("highScore"),

    //insert canvas into page
    start : function() {
        this.canvas.width = 470;
        this.canvas.height = 470;
        this.context = this.canvas.getContext("2d");
	this.context.font="20px Georgia";
        $("#container").append(this.canvas);
	
	
    },
    //Color the first square of the answer when the puzzle is loaded
    colorFirstSquare: function(){
	this.context.strokeStyle = "blue";
	this.context.strokeRect(this.unfilledSlotsX[this.countFilled]-10, this.unfilledSlotsY[this.countFilled] - 20, 30, 30);
    },
    //clear the canvas
    clear : function() {
	this.countFilled = 0;
	this.wordScore = 0;
	this.startTime = 0;
	this.unfilledSlotsX = [];
	this.unfilledSlotsY = [];
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

	//display correct/incorrect message
	feedbackMessage : function(){
		var correct = true;
		for (var i = 0; i < this.missingLetters.length; i++){
			if (this.missingLetters[i] != this.filledLetters[i]) correct = false;
		}
		this.filledLetters = []
		//display feedback at top
		var msg = "Correct!";
		var color = "green";
		if (!correct){
			msg = "Incorrect.";
			color = "red";
		}
		
		$("#feedback").empty();
		$("#feedback").html("<h3 style=\"color:" + color + ";\">" + msg + "</h3>");
		
	
	},
	//add the user's typed letter to the board
	fillSlot : function(keyPressed){
		if (keyPressed == 8){		//backspace -- first erase current square, then reset the highlighting
			this.context.strokeStyle = "black";
			this.context.strokeRect(this.unfilledSlotsX[this.countFilled]-9.5, this.unfilledSlotsY[this.countFilled]-20, 30, 30);
			this.countFilled--;

			this.context.clearRect(this.unfilledSlotsX[this.countFilled]- 10, this.unfilledSlotsY[this.countFilled]-20, 30	, 30);
			this.context.strokeStyle = "blue";
			this.context.strokeRect(this.unfilledSlotsX[this.countFilled]-10, this.unfilledSlotsY[this.countFilled] - 20, 30, 30);

			this.filledLetters.pop();
			return;
		}
		//value of the pressed key
		keyPressed = String.fromCharCode(keyPressed).charAt(0);
		this.filledLetters.push(keyPressed);

		//fill the current square
		this.context.strokeRect(this.unfilledSlotsX[this.countFilled] - 10, this.unfilledSlotsY[this.countFilled] -20, 30, 30);
		this.context.fillText(keyPressed, this.unfilledSlotsX[this.countFilled], this.unfilledSlotsY[this.countFilled]);

		//highlight the square based on whether the key pressed was the right letter or not
	
		if (this.missingLetters[this.countFilled] != keyPressed){
			
			this.context.strokeStyle = "red";
			this.context.strokeRect(this.unfilledSlotsX[this.countFilled]-10, this.unfilledSlotsY[this.countFilled] - 20, 30, 30);
		}
		else{
			this.context.strokeStyle = "green";
			this.context.strokeRect(this.unfilledSlotsX[this.countFilled]-10, this.unfilledSlotsY[this.countFilled] - 20, 30, 30);
		}
		this.countFilled ++;
		
		//when the user finishes the puzzle, we display a new one, update the score and call for a new grid
		if (this.countFilled >= this.unfilledSlotsX.length){

			this.updateScore();
			this.clear();
			this.feedbackMessage();
			setTimeout(function(){getNewGrid();}, 50);
		}
		else {
			//highlight the next square blue
			this.context.strokeStyle="blue";
			this.context.strokeRect(this.unfilledSlotsX[this.countFilled]-10, this.unfilledSlotsY[this.countFilled] - 20, 30, 30);

		}
	},
    /*Increment total score by the score the player achieved on this word.*/
	updateScore: function(){
			this.totalScore += this.wordScore;
			this.wordScore = 0;
			if (this.totalScore > localStorage.getItem("highScore")){
				localStorage.setItem("highScore", this.totalScore);
				updateHighScore();
			}
	}

}

// Initialize the game clock
setInterval(function(){
	gameCanvas.startTime += 1;
	var numMins = Math.floor(gameCanvas.startTime/60);
	var numSecs = gameCanvas.startTime % 60;
	var timeString = (numMins >= 10 ? numMins : "0" + numMins) + ":" + (numSecs >= 10 ? numSecs : "0" + numSecs);
	$("#clock").html(timeString);
}
, 1000, 1000);

//Initialize the current puzzle's score.
//Score: 10x the length of the word, minus 1 for each second you take to complete it, minus 5 for each incorrect letter, plus 10 for each correct letter
setInterval(function(){
	gameCanvas.wordScore= gameCanvas.missingLetters.length + 3;
	gameCanvas.wordScore *= 10;
	gameCanvas.wordScore -= gameCanvas.startTime;
	
	for (var i = 0; i < gameCanvas.missingLetters.length; i++){
		if (gameCanvas.filledLetters.length >i){
			if (gameCanvas.missingLetters[i] == gameCanvas.filledLetters[i]) gameCanvas.wordScore += 10;
			else gameCanvas.wordScore -= 5;
		}
	}
	$("#score").html("Score: " + gameCanvas.wordScore);
}, 1000, 1000);

//Handle user input
function keyDownHandler(event)
{
	event.preventDefault();
	gameCanvas.fillSlot(event.keyCode);
}


//Display each clue in clueList on the right of the canvas
function Clues(clueList){
	
	this.clueNumbers = []
	var htmlString="";

	for (var i = 0; i < clueList.length; i++){
		//clue number
		var clueNumber = Math.floor(Math.random() * 100);
		this.clueNumbers.push(clueNumber);
		//clue itself
		if (i == 0) htmlString += "<h3 class=\"list-group-item active\">" + clueNumber + ". " + clueList[i]  + "</h3>";
	 	else htmlString += "<h3 class=\"list-group-item\">" + clueNumber + ". " + clueList[i]  + "</h3>";
		
	}
	$("div#clueList").empty();
	$("div#clueList").append(htmlString);
	
	
}

//Draw the puzzle represented by gridModel
function Grid(gridModel, clueNumbers){
	this.x = 100;
	this.y = 100;
	this.width = 450;
	this.height = 450;
	this.gridModel = gridModel;
	this.externalPadding = 10;
	

	//draw vertical grid lines
    for (var x = 0; x <= this.width; x += 30) {
        gameCanvas.context.moveTo(0.5+ x + this.externalPadding , this.externalPadding);
        gameCanvas.context.lineTo(0.5 + x + this.externalPadding, this.height + this.externalPadding);
    }

	//draw horizontal grid lines
    for (var y = 0; y <= this.height; y += 30) {
        gameCanvas.context.moveTo(this.externalPadding, 0.5 + y + this.externalPadding);
        gameCanvas.context.lineTo(this.width + this.externalPadding, 0.5 + y + this.externalPadding);
    }

	//draw grid text/black boxes
	gameCanvas.context.font="20px Georgia";
	var clueCount = 0;
	for (var x = 0; x < this.width; x+= 30){
		for (var y = 0; y < this.height; y+= 30){
			var fillValue = gridModel[y/30][x/30];
			//If we don't have a letter...
			if (fillValue == null){
				gameCanvas.context.fillRect(x + this.externalPadding, y + this.externalPadding, 30, 30);
			}
			else {
				//If the letter is a blank answer, add the location of this square to our list of squares to be filled.
				if (fillValue == " "){
					gameCanvas.unfilledSlotsX.push(x + this.externalPadding + 10);
					gameCanvas.unfilledSlotsY.push(y + 20 + this.externalPadding);
				}
				gameCanvas.context.font = "20px Georgia";
				gameCanvas.context.fillText(fillValue , x + this.externalPadding + 10, y+ 20 + this.externalPadding);
			}			
		}
	}
	gameCanvas.context.strokeStyle = "black";
	gameCanvas.context.stroke();
}

