import random
from airport_class import generate_airports

airports = generate_airports()


class Game:
    def __init__(self, id, money=500, budget=25000, consumed=0, failed=0):
        self.id = id
        self.money = money
        self.co2_budget = budget  # if consumed goes over budget, game over
        self.c02_consumed = consumed
        self.failed_quests = failed  # if more than 3 failed, game over
        self.concerts_watched = 0
        self.location = airports[random.randint(0, 446)]


game = Game(1)
print(game.location.icao)