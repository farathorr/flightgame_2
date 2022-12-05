import requests


def genre_request():
    request = "https://binaryjazz.us/wp-json/genrenator/v1/genre/"
    try:
        response = requests.get(request)
        if response.status_code == 200:
            response_json = response.json()
            print(response_json)
            return response_json
        elif response.status_code == 404:
            print(f"Hakua ei voitu suorittaa.\nVirhekoodi: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Hakua ei voitu suorittaa.\n{e}")
