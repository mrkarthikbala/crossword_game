from ClueAnswerPair import ClueAnswerPair
from dbReader import dbReader

class FileReader:
	"""Reads the clues.txt file into the database."""
	def __init__(self):
		"""Constructor"""
		self.file_name = "clues.txt"
		self.clue_answer_pairs = []
		self.db_reader = dbReader()
		self.parse_words()
		self.fill_DB()

	def parse_words(self):
		"""Parses the words from the clues.txt file, returns them in list of ClueAnswerPair"""
		f = open(self.file_name)
		lines = f.readlines()
		values = lines[0].split("\t")
		for i in range(len(values)):
			word = values[i]
			if word == word.upper() and not word.isdigit():
				answer = word
				clue = values[i-1]
				#get rid of quotes on some clues
				clue = clue.replace('"', '')
				pair = ClueAnswerPair(clue, answer)
				self.clue_answer_pairs.append(pair)
	
	def fill_DB(self):
		"""Sends list of ClueAnswerPair to db"""
		self.db_reader.add_list_of_pairs(self.clue_answer_pairs)

file_reader = FileReader()
