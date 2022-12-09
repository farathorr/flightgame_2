import random
from airport_class import generate_airports
from plane_class import Plane
from geopy.distance import geodesic as gd

airports = generate_airports()


def get_data(icao):
    for airport in airports:
        if airport.icao == icao:
            return airport


class Game:
    def __init__(self, money=500, budget=25000, consumed=0, failed=0):
        self.id = str(random.randint(0, 99)) + str(random.randint(0, 99))
        self.money = money
        self.co2_budget = budget  # if consumed goes over budget, game over
        self.co2_consumed = consumed
        self.failed_quests = failed  # if more than 3 failed, game over
        self.concerts_watched = 0
        self.location = airports[random.randint(0, 446)]
        self.plane = Plane()
        # self.turn = 1
        # self.quests

    def flyto(self, icao):
        dest = get_data(icao)
        distance = gd((self.location.latitude, self.location.longitude), (dest.longitude, dest.latitude))
        consumption = distance * Plane.get_co2mod()
        self.location = dest
        self.co2_consumed += consumption

