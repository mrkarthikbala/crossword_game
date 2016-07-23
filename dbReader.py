import MySQLdb as mdb
import md5
from ClueAnswerPair import ClueAnswerPair
from random import randint
from Player import Player

class dbReader:
	"""Reads/writes to the database"""
	def __init__(self):
		"""Constructor. Connects to database and initializes cursor."""
		self.db = self.connect_to_DB()
		self.cursor = self.db.cursor()

	def connect_to_DB(self):
		"""Logs into database."""
		return mdb.connect(host = "localhost", user = "root", passwd = "ubuntu", db = "final_project")

	

	def add_list_of_pairs(self, pairs):
		"""Adds each pair in the list to the database. Intended to be run once from the FileReader script."""
		count = 0
		for pair in pairs:
			clue = pair.clue
			answer = pair.answer
			length = len(answer)
			if count  % 1000 == 0:
				print count

			count+= 1

			self.cursor.execute("INSERT INTO ClueAnswerPairs (answer, clue, length) VALUES(%s, %s, %s)",[answer, clue, length]);
		self.db.commit()

	def find_pair_of_length(self, length):
		"""Returns a random ClueAnswerPair of the desired length"""

		self.cursor.execute("SELECT clue, answer FROM ClueAnswerPairs WHERE length = %s", [length])
		rows = self.cursor.fetchall()
		choice = randint(0,len(rows))
		return ClueAnswerPair(rows[choice][0][2:], rows[choice][1])

	def find_colliding_pair(self, letter, length):
		"""Returns a ClueAnswerPair with letter at a random point in the answer. Length of the colliding pair answer should be less than length."""
		search_pattern = '%' + letter + '%'
		self.cursor.execute("SELECT clue, answer FROM ClueAnswerPairs WHERE answer LIKE %s AND length <= %s", [search_pattern, length])
		rows = self.cursor.fetchall()

		choice = randint(0, len(rows))
		return ClueAnswerPair(rows[choice][0][2:], rows[choice][1])

	def add_new_player(self, player):
		"""Adds a new username/password combination to the Player table in the database. Users start with a high score of 0."""
	
		#hash the username and password before inserting it into the db
		crypto = md5.new()
		crypto.update(player.username)
		hashed_username = crypto.digest()

		crypto = md5.new()
		crypto.update(player.password)
		hashed_password = crypto.digest()

		self.cursor.execute("INSERT INTO Player (username, password, high_score) VALUES (%s, %s, %s)", [hashed_username, hashed_password, 0])
		self.db.commit()		

	def find_player_of_username(self, username):
		"""If a player with the given username exists, return True. Else return False."""
		crypto = md5.new()
		crypto.update(username)
		hashed_username = crypto.digest()

		self.cursor.execute("SELECT username FROM Player WHERE username LIKE %s", [hashed_username])
		rows = self.cursor.fetchall()
		return (len(rows) > 0)

	def find_player(self, username, password):
		"""If a player with the given username/password combination exists, create and return a corresponding Player object. Otherwise, return -1"""
	
		#hash the username and password
		crypto = md5.new()
		crypto.update(username)
		hashed_username = crypto.digest()
		
		crypto = md5.new()
		crypto.update(password)
		hashed_password = crypto.digest()

		self.cursor.execute("SELECT username, password, high_score FROM Player WHERE username LIKE %s AND password like %s", [hashed_username, hashed_password])
		rows = self.cursor.fetchall()
		if len(rows) == 0:
			return -1
		player = Player(rows[0][0], rows[0][1], int(rows[0][2]))
		return player


	def update_high_score(self, username, high_score):
		"""Set the high score for player with account name username to the new high score."""
		
		#hash username
		crypto = md5.new()
		crypto.update(username)
		hashed_username = crypto.digest()
		print hashed_username
		self.cursor.execute("UPDATE Player SET high_score = %s WHERE username = %s", [high_score, hashed_username])
		self.db.commit()

