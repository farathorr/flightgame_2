from connection import connection
import random
import geopy

def generate_starting_quests():
    class Quest:
        def __init__(self):
            self.location = ""
            self.name = ""
            self.location_coords = ""
            self.passenger_amount = ""
            self.reward = ""
            self.turn = ""

    blank_quest = Quest()
    quest1 = blank_quest
    quest2 = blank_quest
    quest3 = blank_quest
    return quest1, quest2, quest3, blank_quest


def generate_quest_class(airport_list, current_location, turn):
    list_range = len(airport_list)
    cur_loc_coords = get_airport_coords(current_location)[0]

    class Quest:

        def __init__(self, passenger_amount):
            self.location = airport_list[random.randint(0, list_range)][0]
            self.name = get_airport_name(self.location)
            self.location_coords = get_airport_coords(self.location[0])
            self.passenger_amount = passenger_amount
            self.reward = round(
                int(distance_between_airports(cur_loc_coords, self.location_coords) * 0.25 * self.passenger_amount), -2)
            self.turn = turn + 3

    quest1 = Quest(1)
    quest2 = Quest(random.randint(1, 3))
    quest3 = Quest(random.randint(1, 3))
    return quest1, quest2, quest3


def check_quests(c_q1, c_q2, c_q3, a_q1, a_q2, a_q3, passenger_lvl):
    a_q_list = [a_q1, a_q2, a_q3]
    current_passenger_level = get_mod(passenger_lvl, 'Passenger')
    questinput = int(input(
        f"1. {a_q1.passenger_amount} matkustajalle lentokentälle: {a_q1.name}. Palkkio: {a_q1.reward}€\n2. {a_q2.passenger_amount} matkustajalle lentokentälle: {a_q2.name}. Palkkio: {a_q2.reward}€\n3. {a_q3.passenger_amount} matkustajalle lentokentälle: {a_q3.name}. Palkkio: {a_q3.reward}€"))
    if questinput == 1 or questinput == 2 or questinput == 3:
        if c_q1.name == "" and current_passenger_level >= a_q_list[questinput - 1].passenger_amount:
            c_q1 = a_q_list[questinput - 1]
        elif c_q2.name == "" and current_passenger_level >= a_q_list[questinput - 1].passenger_amount:
            c_q2 = a_q_list[questinput - 1]
        elif c_q3.name == "" and current_passenger_level >= a_q_list[questinput - 1].passenger_amount:
            c_q3 = a_q_list[questinput - 1]
        else:
            print("Tehtävälista on täynnä.")
    else:
        print("Tehtävää ei hyväksytty.")
    return c_q1, c_q2, c_q3


# Check for singular quest. Gets rid of input
def check_quest(c_q1, c_q2, c_q3, a_q, passenger_lvl):
    current_passenger_level = get_mod(passenger_lvl, 'Passenger')
    if c_q1.name == "" and current_passenger_level >= a_q.passenger_amount:
        c_q1 = a_q
    elif c_q2.name == "" and current_passenger_level >= a_q.passenger_amount:
        c_q2 = a_q
    elif c_q3.name == "" and current_passenger_level >= a_q.passenger_amount:
        c_q3 = a_q
    else:
        print("Tehtävälista on täynnä.")
    return c_q1, c_q2, c_q3


def quest_complete(quest1, quest2, quest3, flight_destination, current_money, blank_quest):
    if flight_destination == quest1.location:
        print("Olet suorittanut tehtävän ja ansainnut", quest1.reward, "€")
        current_money += quest1.reward
        quest1 = blank_quest
    if flight_destination == quest2.location:
        print("Olet suorittanut tehtävän ja ansainnut", quest2.reward, "€")
        current_money += quest2.reward
        quest2 = blank_quest
    if flight_destination == quest3.location:
        print("Olet suorittanut tehtävän ja ansainnut", quest3.reward, "€")
        current_money += quest3.reward
        quest3 = blank_quest
    return quest1, quest2, quest3, current_money


def quest_fail(quest, blank_quest, failed_quests):
    quest = blank_quest
    failed_quests += 1
    return quest, failed_quests


def check_quest_if_quest_failed(turn, quest1, quest2, quest3, failed_quests):
    if quest1.turn != "":
        if quest1.turn < turn:
            quest1, failed_quests = quest_fail(quest1, failed_quests)
    if quest2.turn != "":
        if quest2.turn < turn:
            quest2, failed_quests = quest_fail(quest2, failed_quests)
    if quest3.turn != "":
        if quest3.turn < turn:
            quest3, failed_quests = quest_fail(quest3, failed_quests)
    return quest1, quest2, quest3, failed_quests


# Examples

airports = get_airports()
turn = 1
passenger_level = 0
failed_quests = 0
location_now = "EFHK"

# Generating starting quests
current_quest1, current_quest2, current_quest3, blank_quest = generate_starting_quests()

# Generating new quests
a_quest1, a_quest2, a_quest3 = generate_quest_class(airports, location_now, turn)

# Check if quest is acceptable
target_quest = ""
current_quest1, current_quest2, current_quest3 = check_quest(current_quest1, current_quest2, current_quest3, target_quest)

# Checking quests (not used)
current_quest1, current_quest2, current_quest3 = check_quests(current_quest1, current_quest2, current_quest3, a_quest1, a_quest2, a_quest3, passenger_level)

# Checking if quests have failed
current_quest1, current_quest2, current_quest3, failed_quests = check_quest_if_quest_failed(turn, current_quest1, current_quest2, current_quest3, failed_quests)
