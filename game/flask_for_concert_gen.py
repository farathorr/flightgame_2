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


