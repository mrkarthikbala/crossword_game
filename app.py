from flask import Flask
from flask import render_template, request
import json
import parser
from dbReader import dbReader
from Grid import Grid
from Player import Player

#Server code
app = Flask(__name__)
app.debug = True

#db reader
db_read = dbReader()

#displays main page - right now this loads the game canvas directly
@app.route('/')
def index():
    return render_template('index.html')

difficulty_setting = "easy"
#POSTing to this sets the difficulty
@app.route('/setDifficulty', methods = ['POST'])
def setDifficulty():
	global difficulty_setting
	difficulty_setting = request.data[request.data.index("=")+1:]
	return json.dumps({'ok':'ok'})


#POSTing to this url gets all required information to display a new puzzle
@app.route('/getNewPuzzle', methods = ['POST'])
def getNewPuzzle():
	global difficulty_setting
	new_grid = Grid(db_read, difficulty_setting)
	new_puzzle = new_grid.generate_puzzle()
	clues = new_grid.clues
	missing_letters = new_grid.missing_letters

	#we return three things in the data - a new puzzle, a list of clues for that puzzle, and the missing letters to the answer of that puzzle
	print missing_letters
	return json.dumps({'puzzle': new_puzzle, 'clues': clues, 'answers' : missing_letters})

#the signup form layout
@app.route('/signUp')
def signUpForm():
	return render_template('signUp.html')

#POSTing to this url adds a new player to the db with username, password, and high score 0
@app.route('/createNewPlayer', methods=['POST'])
def createNewPlayer():
	data = request.data
	username = data[data.index("username=") + len("username="): data.index("password")-1]
	password = data[data.index("password=") + len("password=") : ]
	player = Player(username, password, 0)

	#if player already exists, we return an error
	if db_read.find_player_of_username(username):
		return json.dumps({'error':True})

	db_read.add_new_player(player)
	return json.dumps({'ok':'ok'})

#displays the login page for the app
@app.route('/login')
def login():
	return render_template('login.html')

#POSTing to this url will login the player with username and password given in the data. Returns the high score of the user.
@app.route('/loginWithUser', methods = ['POST'])
def loginWithUser():
	data = request.data
	username = data[data.index("username=") + len("username="): data.index("password")-1]
	password = data[data.index("password=") + len("password=") : ]
	player = db_read.find_player(username, password)
	#If we didn't find the player we were looking for, we return an error.
	if player == -1:
		return json.dumps({'error':True})
	return json.dumps({'high_score':player.high_score})

#POSTing to this url will update the high score of the player with the username given in the data.
@app.route('/updateHighScore', methods = ['POST'])
def updateHighScore():
	data = request.data
	username = data[data.index("username=") + len("username="): data.index("highScore")-1]
	high_score = data[data.index("highScore=") + len("highScore="): ]
	
	db_read.update_high_score(username, high_score)
	return json.dumps({'ok':'ok'})



@app.route('/tests')
#Tests certain js functions
def tests():
	return render_template('tests.html')

if __name__ == '__main__':
    app.run()

