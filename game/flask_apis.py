from flask import Flask, request, Response, json
from flask_cors import CORS
from game_class import *

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# WIP
airports = generate_airports()
concerts = generate_concerts()
games = []


def find_game(game_id):
    for game in games:
        if game.id == game_id:
            return game


@app.route("/start/")
def start_game():
    try:
        game = Game()
        games.append(game)
        game.location.generate_quests(game.turn)
        print(game.id)
        response_json = json.dumps(
            {"id": game.id, "money": game.money, "co2_budget": game.co2_budget,
             "co2_consumed": game.co2_consumed, "quests_failed":
                 game.failed_quests, "concerts_watched": len(game.concerts_watched),
             "current_latitude": game.location.latitude, "current_longitude": game.location.longitude,
             "current_icao": game.location.icao})
        print(response_json)
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
             "co2 consumed": game.co2_consumed, })
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "unknown icao or invalid parameters", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.route("/<game_id>/questcheck/")
def quest_check(game_id):
    try:
        game = find_game(game_id)
        questlist = game.location.quests
        response_json = json.dumps({
            "quest 0": questlist[0].name, "quest 1": questlist[1].name, "quest 2": questlist[2].name
        })
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "invalid id", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


# @app.route("/starting_quests")
# def get_starting_quests():
#     try:
#         quest1, quest2, quest3, blank_quest = generate_starting_quests()
#         Quests = quest1, quest2, quest3, blank_quest
#         response_json = json.dumps(Quests)
#         return Response(response=response_json, status=200, mimetype="application/json")
#     except TypeError:
#         response_json = json.dumps({"message": "unknown error occured", "status": "400 Bad request"})
#         return Response(response=response_json, status=400, mimetype="application/json")


@app.errorhandler(404)
def page_not_found(error):
    response_json = json.dumps({"error": str(error)})
    return Response(response=response_json, status=404, mimetype="application/json")


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=5000)
