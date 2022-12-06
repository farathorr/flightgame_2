class Plane:
    def __init__(self, co2level, psngrlvl):
        self.co2level = co2level
        self.psngrlvl = psngrlvl

    def upgrade_psngr(self):
        self.psngrlvl += 1

    def upgrade_co2(self):
        self.co2level += 1

