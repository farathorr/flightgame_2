import mysql.connector


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
