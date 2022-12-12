
from random_genre_request import genre_request
from airport_class import *


class Concert:
    def __init__(self, genre, icao):
        self.genre = genre
        self.icao = icao
        self.concert_over = False
        self.price = 500


# concert generation

def generate_concerts(game):
    concerts_list = []
    default_genres = ["Rock", "Pop", "Jazz", "Country", "Metal", "Rap"]
    while len(concerts_list) != 6:
        rnd_int = random.randint(0, len(game.airports) - 1)
        if not game.airports[rnd_int].concert_here:
            game.airports[rnd_int].concert_here = True
            genre = genre_request()
            if genre is None:
                for default in default_genres:
                    concerts_list.append(Concert(default, game.airports[rnd_int].icao))
            else:
                concerts_list.append(Concert(genre, game.airports[rnd_int].icao))
    # testing
    for i in concerts_list:
        print(f"ICAO :{i.icao}\nPRICE: {i.price}\nCONCERT OVER: {i.concert_over}\nGENRE: {i.genre}\n")
    return concerts_list
