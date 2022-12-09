from connection import connection
import random
from geopy import distance


class Airport:
    def __init__(self, icao, lat, lon, name):
        self.concert_here = False
        self.quest_dest = False
        self.icao = icao
        self.latitude = lat
        self.longitude = lon
        self.name = name
        self.quests = []

    def generate_quests(self, turn):
        cur_loc_coords = self.latitude, self.longitude

        class Quest:

            def __init__(self, passenger_amount):
                self.destination = airports[random.randint(0, 446)]
                self.name = self.destination.name
                self.icao = self.destination.icao
                self.destination_coords = self.destination.latitude, self.destination.longitude
                self.passenger_amount = passenger_amount
                self.reward = round(
                    int(distance.distance(cur_loc_coords, self.destination_coords).km * 0.25 * passenger_amount))
                self.turn = turn + 3

        for i in range(3):
            self.quests.append(Quest(i + 1))


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


airports = generate_airports()

# select_airport = airports[random.randint(0, 446)]
# select_airport.generate_quests(1)
# for quest in select_airport.quests:
#     print(
#         f"destination: {quest.destination}\nname: {quest.name}\nicao: {quest.icao}\n"
#         f"dest_coords: {quest.destination_coords}\npassenger_amount: {quest.passenger_amount}\n"
#         f"reward: {quest.reward}\nturn: {quest.turn}\n")
