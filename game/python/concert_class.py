import random
import mysql.connector
from airport_class import generate_airports
from random_genre_request import genre_request


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


def generate_concerts():
    concerts_list = []
    default_genres = ["Rock", "Pop", "Jazz", "Country", "Metal", "Rap"]
    while len(concerts_list) != 6:
        rnd_int = random.randint(0, len(airports) - 1)
        if not airports[rnd_int].concert_here:
            airports[rnd_int].concert_here = True
            genre = genre_request()
            if genre is None:
                for default in default_genres:
                    concerts_list.append(Concert(default, airports[rnd_int].icao))
            else:
                concerts_list.append(Concert(genre, airports[rnd_int].icao))
    # Testing
    for i in concerts_list:
        print(f"ICAO :{i.icao}\nPRICE: {i.price}\nCONCERT OVER: {i.concert_over}\nGENRE: {i.genre}\n")
    return concerts_list


# calling functions
airports = generate_airports()
concerts = generate_concerts()
