from flask import Flask, request, Response, json
from flask_cors import CORS
from airport_class import generate_airports, Airport
from concert_class import generate_concerts, Concert
from connection import connection

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# WIP
airports = generate_airports()
concerts = generate_concerts()


def get_data(icao):
    for airport in airports:
        if airport.icao == icao:
            return airport


@app.route("/airport/<icao>")
def get_airport_data(icao):
    try:
        airport = get_data(icao)
        response_json = json.dumps(
            {"concert_status": airport.concert_here, "quest_status": airport.quest_here, "icao": airport.icao,
             "latitude": airport.latitude, "longitude": airport.longitude, "name": airport.name})
        return Response(response=response_json, status=200, mimetype="application/json")
    except TypeError:
        response_json = json.dumps({"message": "unknown icao or invalid parameters", "status": "400 Bad request"})
        return Response(response=response_json, status=400, mimetype="application/json")


@app.errorhandler(404)
def page_not_found(error):
    response_json = json.dumps({"error": str(error)})
    return Response(response=response_json, status=404, mimetype="application/json")


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=5000)
