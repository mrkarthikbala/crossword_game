
class ClueAnswerStorage:
	"""Holds a list of ClueAnswerPairs."""
	def __init__(self):
		self.cluesAndAnswers = []
	
	def add(self, clueAnswerPair):
		self.cluesAndAnswers.append(clueAnswerPair)

	def findLengthNAnswer(self, n):
		for pair in self.cluesAndAnswers:
			if len(pair.answer) == n:
				return pair
