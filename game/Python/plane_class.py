from connection import connection


class Plane:
    def __init__(self, co2level=0, psngrlvl=0):
        self.co2level = co2level
        self.psngrlvl = psngrlvl

    def get_price(self, upgrade_type, typelevel):
        sql = f"SELECT price FROM upgrade WHERE upgrade='{upgrade_type}' AND upgrade_level = '{typelevel+1}'"
        cursor = connection.cursor()
        cursor.execute(sql)
        result = cursor.fetchone()
        return result[0]

    def upgrade_psngrlvl(self, money):
        price = self.get_price("Passenger", self.psngrlvl)
        print("price:", price)
        new_money = money - price
        print("new money:", new_money)
        if new_money < 0:
            return money
        else:
            self.psngrlvl += 1
            return new_money

    def upgrade_co2lvl(self, money):
        price = self.get_price("Co2", self.co2level)
        print("price:", price)
        new_money = money - price
        print("new money:", new_money)
        if new_money < 0:
            return money
        else:
            self.co2level += 1
            return new_money

    def get_co2mod(self):
        sql = f"SELECT modifier FROM upgrade WHERE upgrade='Co2' and upgrade_level = '{self.co2level}'"
        cursor = connection.cursor()
        cursor.execute(sql)
        result = cursor.fetchone()
        return int(result[0])


plane = Plane()
print(plane.get_co2mod())

