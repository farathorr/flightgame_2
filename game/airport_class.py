from connection import connection
import random
from geopy.distance import geodesic as gd


class Airport:
    def __init__(self, icao, lat, lon, name, concert_here=False, quest_here=False):
        self.concert_here = concert_here
        self.quest_here = quest_here
        self.icao = icao
        self.latitude = lat
        self.longitude = lon
        self.name = name

    def generate_quest_class(self, airport_list, turn):
        cur_loc_coords = self.latitude, self.longitude
        name = self.name

        class Quest:

            def __init__(self, passenger_amount):
                self.location = airport_list[random.randint(0, 446)]
                self.name = name
                self.location_coords = self.location.latitude, self.location.longitude
                self.passenger_amount = passenger_amount
                self.reward = round(
                    int(gd(cur_loc_coords, self.location.latitude,
                           self.location.longitude) * 0.25 * self.passenger_amount), -2)
                self.turn = turn + 3

        quest1 = Quest(1)
        quest2 = Quest(random.randint(1, 3))
        quest3 = Quest(random.randint(1, 3))
        return quest1, quest2, quest3


# airport generation
def generate_airports():
    airports_list = []
    sql = f"SELECT ident, latitude_deg, longitude_deg, name FROM airport where type='large_airport' "
    cursor = connection.cursor()
    cursor.execute(sql)
    res = cursor.fetchall
    for airport_data in res():
        airports_list.append(Airport(airport_data[0], airport_data[1], airport_data[2], airport_data[3]))
    # TEST
    # for i in airports_list:
    #     print(
    #         f"CONCERT HERE: {i.concert_here}\nICAO: {i.icao}\nNAME: {i.name}\nLONGITUDE: {i.longitude}\nLATITUDE: {i.latitude}\n")
    return airports_list
