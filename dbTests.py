import unittest
from dbReader import dbReader
from ClueAnswerPair import ClueAnswerPair
from Player import Player

class dbTests(unittest.TestCase):
  """Tests the dbReader class"""
  def setUp(self):
    self.db_reader = dbReader()

  def test_find_pair_of_length(self):
    pair = self.db_reader.find_pair_of_length(6)
    self.assertTrue(len(pair.answer) == 6)


  def test_find_colliding_pair(self):
    pair = self.db_reader.find_colliding_pair('z', 5)
    self.assertTrue('Z' in pair.answer)

  def test_add_new_player(self):
    player = Player("some username2", "some password",0)
    self.db_reader.add_new_player(player)
    self.assertTrue(self.db_reader.find_player_of_username(player.username))

  def test_find_player_of_username(self):
    self.assertTrue(self.db_reader.find_player_of_username("Bill"))

  def test_find_player(self):
    self.assertTrue(self.db_reader.find_player("Karthik", "karthik").high_score > 0)
		
  def test_update_high_score(self):
    self.db_reader.update_high_score("Karthik", 500)
    self.assertTrue(self.db_reader.find_player("Karthik", "karthik").high_score == 500)
   
if __name__ == '__main__':
    unittest.main()
