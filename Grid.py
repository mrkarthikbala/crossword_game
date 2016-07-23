from ClueAnswerPair import ClueAnswerPair
from random import randint
from math import log, floor
class Grid:
	"""Contains individual puzzle information and output"""

	def __init__(self, db_reader, difficulty_string):
		"""Grid constructor"""
		self.db_reader = db_reader
		self.my_grid = [ [ None for i in range(15) ] for j in range(15) ]
		self.clues =[]
		#A list of letters that the user must enter in to solve the puzzle.
		self.missing_letters = []
		if difficulty_string == "easy":
			base_length = 3
			self.num_collisions = 2
		elif difficulty_string == "medium":
			base_length = 7
			self.num_collisions = 3
		elif difficulty_string == "hard":
			base_length = 11
			self.num_collisions = 4
		
		self.length = randint(base_length, base_length+4)

	def generate_puzzle(self):
		"""Generates an individual puzzle, of the desired length and with the desired number of collisions"""
		pair = self.db_reader.find_pair_of_length(self.length)

		collision_indices = self.get_collision_indices(len(pair.answer)-1, self.num_collisions)
		
		#find list of pairs that intersect with the answer in the crossword		
		colliding_pairs = []

		for i in collision_indices:
			colliding_pairs.append(self.db_reader.find_colliding_pair(pair.answer[i], self.length))
		
		#get the clues for each pair
		self.fill_clues(pair, colliding_pairs)
	
		#Get the answer with blanks to display in the puzzle
		hidden_answer = self.format_answer(pair.answer, collision_indices)
		return self.fill_grid(hidden_answer, colliding_pairs, collision_indices)

	def fill_clues(self, pair, colliding_pairs):
		"""Populates self.clues with all the clues for this puzzle."""
		self.clues.append(pair.clue)
		self.clues += [i.clue for i in colliding_pairs]
	
	def format_answer(self, answer, collision_indices):
		"""Takes away all letters from answer except those at the collision indices."""
		new_answer = ""
		
		for i in range(len(answer)):
			if i in collision_indices:
				new_answer += answer[i]
			else:
				new_answer += " "
				self.missing_letters.append(answer[i])

		return new_answer

	def fill_grid(self, answer, colliding_pairs, collision_indices):
		"""Format the crossword grid."""

		start_x_index = randint(0, 15-len(answer))
		start_y_index = randint(5, 10)	#change: this is for collisions of length 6 or less
		
		
		#draw the answer in the grid
		for i in range(0, len(answer)):
			self.my_grid[start_y_index][start_x_index + i] = " "					

		#draw the collisions in the grid
		for i in range(len(collision_indices)):
			pair = colliding_pairs[i]
			collision_letter = answer[collision_indices[i]]
			pair_collision_index_x = answer.index(collision_letter)	
			pair_collision_index_y = pair.answer.index(collision_letter)
			start_y_index_collision = start_y_index - pair_collision_index_y

			for j in range(0, len(pair.answer)):
				self.my_grid[start_y_index_collision + j][start_x_index + pair_collision_index_x] = pair.answer[j]
		return self.my_grid

	def get_collision_indices(self, max_idx, num_collisions):
		"""Returns a list of potential indices for collisions in the current puzzle."""
		collision_indices = []
		for i in range(num_collisions):
			choice = -20
			choice = randint(0, max_idx)
			#we want to ensure that the cs aren't right next to each other!
			while choice in collision_indices or choice+1 in collision_indices or choice-1 in collision_indices:
				choice = randint(0, max_idx)

			collision_indices.append(choice)
		return collision_indices
