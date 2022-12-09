from flask import Flask, Response, json
from flask_cors import CORS
from game_class import *
# THIS FILE IS OUTDATED AND REDUNDANT FOR NOW

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# WIP
games = []


def find_game(game_id):
    for game in games:
        if game.id == game_id:
            return game


def find_concert(selected_game):
    for concert in concerts:
        if concert.icao == selected_game.location.icao:
            return concert


@app.route("/start/")
def start_game():
    try:
        generate_airports()
        generate_concerts()
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


@app.route("/<game_id>/watch")
def watch_concert(game_id):
    try:
        game = find_game(game_id)
        game.watch_concert()
        concert = find_concert(game)
        response_json = json.dumps(
            {"concerts_watched": game.concerts_watched, "money": game.money,
             "concert_here": game.location.concert_here,
             "concert_over": concert.concert_over

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
            "money": game.money, "co2lvl": game.plane.co2level, "psngrlvl": game.plane.psngrlvl
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
            "money": game.money, "co2lvl": game.plane.co2level, "psngrlvl": game.plane.psngrlvl
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
