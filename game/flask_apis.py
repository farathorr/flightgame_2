from flask import Flask, Response, json
from flask_cors import CORS
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
        response = [{"id": game.id, "money": game.money, "co2_budget": game.co2_budget,
                     "co2_consumed": game.co2_consumed, "quests_failed":
                         game.failed_quests, "concerts_watched": len(game.concerts_watched),
                     "current_latitude": game.location.latitude, "current_longitude": game.location.longitude,
                     "current_icao": game.location.icao, "turn": game.turn, "current_co2lvl": game.plane.co2level,
                     "current_passengerlvl": game.plane.psngrlvl, "current_airportname": game.location.name}]
        for airport in game.airports:
            response.append({"Name": airport.name, "Icao": airport.icao, "Latitude": airport.latitude,
                             "Longitude": airport.longitude, "Concert_status": airport.concert_here,
                             "Is_quest_destination": airport.quest_dest})
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
        game.location.generate_quests(game.turn)
        airport = game.location
        response_json = json.dumps(
            {"concert_status": airport.concert_here, "quest_status": airport.quest_dest, "icao": airport.icao,
             "latitude": airport.latitude, "longitude": airport.longitude, "name": airport.name,
             "co2 consumed": game.co2_consumed, "failed_quests": game.failed_quests,
             "active_quest_amount": len(game.quests)})
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


@app.route("/<game_id>/takequest/<quest_i>")
def take_quest(game_id, quest_i):
    try:
        game = find_game(game_id)
        game.take_quest(int(quest_i))
        print(game.quests)
        response = []
        # is the player allowed to take more than one quest per turn?
        for quest in game.quests:
            airport = find_airport_quest(quest, game)
            response.append({
                "Name": quest.name, "Icao": quest.icao, "Destination_coordinates": quest.destination_coords,
                "Passenger_amount": quest.passenger_amount, "Reward": quest.reward, "Turn": quest.turn,
                "Airport_quest_dest": airport.quest_dest
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
        quests_dict = []
        for quest in game.quests:
            quest = {"Name": quest.name, "Destination_coordinates": quest.destination_coords,
                     "Passenger_amount": quest.passenger_amount, "Reward": quest.reward, "Turn": quest.turn}
            quests_dict.append(quest)
        quests_dict.append({"Money": game.money})
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


@app.errorhandler(404)
def page_not_found(error):
    response_json = json.dumps({"error": str(error)})
    return Response(response=response_json, status=404, mimetype="application/json")


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=5000)
