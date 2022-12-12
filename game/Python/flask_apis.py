from flask import Flask, Response, json
from flask_cors import CORS

from concert_class import generate_concerts
from game_class import *

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# WIP
games = []


def find_concert(game):
    for concert in game.concerts:
        if concert.icao == game.location.icao:
            return concert


def find_game(game_id):
    for game in games:
        if game.id == game_id:
            return game


def find_airport_quest(quest, game):
    for airport in game.airports:
        if quest.icao == airport.icao:
            return airport


@app.route("/start/")
def start_game():
    try:
        game = Game()
        game.concerts = generate_concerts(game)
        games.append(game)
        game.location.generate_quests(game.turn, game)
        print(game.id)
        response_airports = []
        response_concerts = []
        response = [{"Id": game.id, "Money": game.money, "Co2_budget": game.co2_budget,
                     "Co2_consumed": game.co2_consumed, "Quests_failed":
                         game.failed_quests, "Concerts_watched": game.concerts_watched,
                     "Latitude": game.location.latitude, "Longitude": game.location.longitude,
                     "Icao": game.location.icao, "Turn": game.turn, "Current_co2lvl": game.plane.co2level,
                     "Current_passengerlvl": game.plane.psngrlvl, "Name": game.location.name}]
        for airport in game.airports:
            response_airports.append({"Name": airport.name, "Icao": airport.icao, "Latitude": airport.latitude,
                                      "Longitude": airport.longitude, "Concert_status": airport.concert_here,
                                      "Is_quest_destination": airport.quest_dest})
        for concert in game.concerts:
            response_concerts.append({
                "Genre": concert.genre, "Icao": concert.icao, "Concert_over": concert.concert_over,
                "Price": concert.price
            })
        response.append(response_concerts)
        response.append(response_airports)
        response_json = json.dumps(response)
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid parameters", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/flyto/<icao>")
def fly(icao, game_id):
    try:
        game = find_game(game_id)
        game.flyto(icao)
        airport = game.location
        response_airports = []
        response = [
            {"Concert_status": airport.concert_here, "Quest_status": airport.quest_dest, "Icao": airport.icao,
             "Latitude": airport.latitude, "Longitude": airport.longitude, "Name": airport.name,
             "Co2_consumed": game.co2_consumed, "Quests_failed": game.failed_quests,
             "Active_quest_amount": len(game.quests), "Turn": game.turn, "Money": game.money}]
        for airport in game.airports:
            response_airports.append({"Name": airport.name, "Icao": airport.icao, "Latitude": airport.latitude,
                                      "Longitude": airport.longitude, "Concert_status": airport.concert_here,
                                      "Is_quest_destination": airport.quest_dest})
        response.append(response_airports)
        response_json = json.dumps(response)
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "unknown icao or invalid parameters", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/questcheck/")
def quest_check(game_id):
    try:
        game = find_game(game_id)
        questlist = game.location.quests
        response = []
        # To see contents
        # for i in questlist:
        #     name = i.name
        #     icao = i.icao
        #     destination_coords = i.destination_coords
        #     passenger_amount = i.passenger_amount
        #     reward = i.reward
        #     turn = i.turn
        #     print(
        #         f"Quest:\n Name: {name}\n Icao: {icao}\n "
        #         f"Destination coodinates: {destination_coords}\n Passenger amount: {passenger_amount}\n "
        #         f"Reward: {reward}\n Turn:{turn}\n")
        for i in range(len(questlist)):
            name = questlist[i].name
            icao = questlist[i].icao
            destination_coords = questlist[i].destination_coords
            passenger_amount = questlist[i].passenger_amount
            reward = questlist[i].reward
            turn = questlist[i].turn
            quest = {"Name": name, "Icao": icao, "Destination_coordinates": destination_coords,
                     "Passenger_amount": passenger_amount, "Reward": reward, "Turn": turn}
            response.append(quest)
        response_json = json.dumps(response)
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/takequest/<quest_num>")
def take_quest(game_id, quest_num):
    try:
        game = find_game(game_id)
        game.take_quest(int(quest_num))
        airport = game.location
        quest = airport.quests[int(quest_num)]
        response_json = json.dumps({
            "Name": quest.name, "Icao": quest.icao, "Destination_coordinates": quest.destination_coords,
            "Passenger_amount": quest.passenger_amount, "Reward": quest.reward, "Turn": quest.turn,
            "Airport_quest_dest": airport.quest_dest
        })
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/currentquests")
def current_quests(game_id):
    try:
        game = find_game(game_id)
        response = []
        for quest in game.quests:
            response.append({
                "Name": quest.name, "Icao": quest.icao, "Destination_coordinates": quest.destination_coords,
                "Passenger_amount": quest.passenger_amount, "Reward": quest.reward, "Turn": quest.turn
            })
        response_json = json.dumps(response)
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/completequest")
def complete_quest(game_id):
    try:
        game = find_game(game_id)
        game.return_quest()
        quests_dict = [{"Money": game.money}]
        for quest in game.quests:
            quests_dict.append({"Name": quest.name, "Destination_coordinates": quest.destination_coords,
                                "Passenger_amount": quest.passenger_amount, "Reward": quest.reward, "Turn": quest.turn})
        response_json = json.dumps(quests_dict)
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/watch")
def watch_concert(game_id):
    try:
        game = find_game(game_id)
        game.watch_concert()
        concert = find_concert(game)
        response_json = json.dumps(
            {"Concerts_watched": game.concerts_watched, "Money": game.money,
             "Concert_here": game.location.concert_here, "Concert_over": concert.concert_over
             })
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/upgradeco2")
def upgrade_co2(game_id):
    try:
        game = find_game(game_id)
        game.money = game.plane.upgrade_co2lvl(game.money)
        response_json = json.dumps({
            "Money": game.money, "Co2lvl": game.plane.co2level, "Psngrlvl": game.plane.psngrlvl
        })
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/upgradepsngr")
def upgrade_psngr(game_id):
    try:
        game = find_game(game_id)
        game.money = game.plane.upgrade_psngrlvl(game.money)
        response_json = json.dumps({
            "Money": game.money, "Co2lvl": game.plane.co2level, "Psngrlvl": game.plane.psngrlvl
        })
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/score/<name>/<score>")
def add_score_sql(game_id, score, name):
    try:
        game = find_game(game_id)
        if game in games:
            sql = f"INSERT INTO top_score VALUES('{name}', {score})"
            cursor = connection.cursor()
            cursor.execute(sql)
            response = []
            for i in range(5):
                sql = f"select player_name, score  from top_score group by score order by score desc limit {i},1"
                cursor = connection.cursor()
                cursor.execute(sql)
                response.append(cursor.fetchall())
            response_json = json.dumps(response)
            return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.errorhandler(404)
def page_not_found(error):
    response_json = json.dumps({"error": str(error)})
    return Response(response=response_json, status=404, mimetype="application/json")


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=5000)
