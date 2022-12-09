from connection import connection


class Plane:
    def __init__(self, co2level=0, psngrlvl=0):
        self.co2level = co2level
        self.psngrlvl = psngrlvl

    def upgrade_psngr(self):
        self.psngrlvl += 1

    def upgrade_co2(self):
        self.co2level += 1

    def get_co2mod(self):
        sql = f"SELECT modifier FROM upgrade WHERE upgrade='Co2' and upgrade_level = '{self.co2level}'"
        cursor = connection.cursor()
        cursor.execute(sql)
        result = cursor.fetchone()
        print(result[0])
        return result


plane = Plane(1, 1)
print(plane.co2level)
plane.get_co2mod()
