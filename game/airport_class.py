from connection import connection


class Airport:
    def __init__(self, icao, lat, lon, name, concert_here=False, quest_here=False):
        self.concert_here = concert_here
        self.quest_here = quest_here
        self.icao = icao
        self.latitude = lat
        self.longitude = lon
        self.name = name


# airport generation
def generate_airports():
    airports_list = []
    sql = f"SELECT ident, latitude_deg, longitude_deg, name FROM airport where type='large_airport' "
    cursor = connection.cursor()
    cursor.execute(sql)
    res = cursor.fetchall
    for airport_data in res():
        airports_list.append(Airport(airport_data[0], airport_data[1], airport_data[2], airport_data[3]))
    # TEST
    # for i in airports_list:
    #     print(
    #         f"CONCERT HERE: {i.concert_here}\nICAO: {i.icao}\nNAME: {i.name}\nLONGITUDE: {i.longitude}\nLATITUDE: {i.latitude}\n")
    return airports_list
