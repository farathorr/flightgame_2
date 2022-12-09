from airport_class import generate_airports
from geopy.distance import geodesic as gd
import random

airports = generate_airports()

def generate_quest_class(self, airport_list, turn):
    cur_loc_coords = self.latitude, self.longitude
    name = self.name


class Quest:

    def __init__(self, passenger_amount=1):
        self.location = airports[random.randint(0, 446)]
        self.name = self.location.name
        self.location_coords = self.location.latitude, self.location.longitude
        self.passenger_amount = passenger_amount
        self.reward = round(
            int(gd(cur_loc_coords, self.location.latitude,
                   self.location.longitude) * 0.25 * self.passenger_amount), -2)
        self.turn = turn + 3
