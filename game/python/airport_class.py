import mysql.connector
class Airport:
    def __init__(self, icao, lat, lon, name, concert_here=False, ):
        self.concert_here = concert_here
        self.icao = icao
        self.latitude = lat
        self.longitude = lon
        self.name = name



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

# airport_generation
airports = []
sql = f"SELECT ident, latitude_deg, longitude_deg, name FROM airport where type='large_airport' "
cursor = connection.cursor()
cursor.execute(sql)
res = cursor.fetchall
for airport_data in res():
    airports.append(Airport(airport_data[0], airport_data[1], airport_data[2], airport_data[3]))

