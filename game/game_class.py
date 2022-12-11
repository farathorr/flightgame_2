import geopy

from plane_class import Plane
from geopy import distance
from concert_class import generate_concerts
from airport_class import *


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
        self.concerts_watched = []  # if 6, you won the game
        self.concerts = []
        self.airports = generate_airports()
        self.location = self.airports[random.randint(0, len(self.airports))]
        self.plane = Plane()
        self.turn = 1
        self.quests = []

    def flyto(self, icao):
        dest = get_data(icao)
        dest_coords = dest.latitude, dest.longitude
        current_coords = self.location.latitude, self.location.longitude
        distance = round(int(geopy.distance.distance(current_coords, dest_coords).km))
        consumption = distance * self.plane.get_co2mod()
        self.location = dest
        self.co2_consumed += consumption
        self.turn += 1
        for selected_quest in self.quests:
            if selected_quest.turn > self.turn:
                self.quests.remove(selected_quest)
                self.failed_quests += 1
                for airport in airports:
                    if airport.icao == selected_quest.icao:
                        airport.guest_dest = False
        self.location.generate_quests(self.turn)

    def take_quest(self, quest_i):
        selected_quest = self.location.quests[quest_i]
        self.quests.append(selected_quest)
        for airport in airports:
            if airport.icao == selected_quest.icao:
                airport.quest_dest = True

    def return_quest(self):
        for quest in self.quests:
            if quest.icao == self.location.icao:
                self.money += quest.reward
                self.quests.remove(quest)
                for airport in airports:
                    if airport.icao == quest.icao:
                        airport.quest_dest = False

    def watch_concert(self):
        for concert in self.concerts:
            if concert.concert_over:
                return
            else:
                if self.location.icao == concert.icao:
                    self.concerts_watched.append(concert.genre)
                    self.money = self.money - concert.price
                    concert.concert_over = True
                    self.location.concert_here = False

