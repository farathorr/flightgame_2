import random
import mysql.connector
from airport_class import Airport
from game.api_stuff.random_genre_request import genre_request


class Concert:
    def __init__(self, genre, icao, concert_over=False, price=500):
        self.genre = genre
        self.icao = icao
        self.concert_over = concert_over
        self.price = price

    def watch(self, money, airports):
        self.concert_over = True
        money = money - self.price
        for airport in airports:
            if airport.icao == self.icao:
                airport.concert_here = False
        return money


# concert generation
def connect_db():
    return mysql.connector.connect(
        host='127.0.0.1',
        port=3306,
        database='flight_game1',
        user='root',
        password='1557',
        autocommit=True
    )


connection = connect_db()

airports = []
sql = f"SELECT ident, latitude_deg, longitude_deg, name FROM airport where type='large_airport' "
cursor = connection.cursor()
cursor.execute(sql)
res = cursor.fetchall
for airport_data in res():
    airports.append(Airport(airport_data[0], airport_data[1], airport_data[2], airport_data[3]))

concerts = []
default_genres = ["Rock", "Pop", "Jazz", "Country", "Metal", "Rap"]
while len(concerts) != 6:
    rnd_airport_num = random.randint(0, len(airports) - 1)
    if not airports[rnd_airport_num].concert_here:
        genre = genre_request()
        if genre is None:  # TODO Korjaa for looppi. Sen sisälle voi mennä samoja arvoja jos random lentokenttä on sama.
            for default_genre in default_genres:
                rnd_airport_num = random.randint(0, len(airports) - 1)
                airports[rnd_airport_num].concert_here = True
                concerts.append(Concert(default_genre, airports[rnd_airport_num].icao))

        else:
            airports[rnd_airport_num].concert_here = True
            concerts.append(Concert(genre, airports[rnd_airport_num].icao))
