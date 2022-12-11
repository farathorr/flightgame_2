'use strict';
/* 1. show map using Leaflet library. (L comes from the Leaflet library) */

const map = L.map('map', {tap: false});
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 7);

// global variables
const apiUrl = 'http://127.0.0.1:5000/';
const startLoc = 'EFHK'; // Add randomness!
let gameId = '';
let gameData = '';
let availableQuests
const concerts = [];
let airports = [];
const airportMarkers = L.featureGroup().addTo(map);
let cq1active = false
let cq2active = false
let cq3active = false
let questTaken = false

// icons
const blueIcon = L.divIcon({className: 'blue-icon'}); // For Concert
const greenIcon = L.divIcon({className: 'green-icon'}); // For basic
const redIcon = L.divIcon({className: 'red-icon'}); // For Quest
const magentaIcon = L.divIcon({className: 'magenta-icon'}); // For Quest + Concert

// form for player name
// Might add this!
// Game would start here

// document.querySelector('#player-form').addEventListener('submit', function (evt) {
//   evt.preventDefault();
//   const playerName = document.querySelector('#player-input').value;
//   document.querySelector('#player-modal').classList.add('hide');
//   gameSetup(`${apiUrl}newgame?player=${playerName}&loc=${startLoc}`);
// });

gameSetup(`${apiUrl}/start/`); // add starting quests

// function to fetch data from API
async function getData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Invalid server input!');
    const data = await response.json();
    return data;
}

// function to fly to a new airport
async function flyto(dest_icao) {
    return await getData(`${apiUrl}/${gameId}/flyto/${dest_icao}`)
}

// function to call starting quests // set values after getting data!
// function startingQuests() {
//     getData(`${apiUrl}/${gameId}/ starting quest url here!`)
// }

// function to get available quest information
async function checkQuests() {
    let quests = await getData(`${apiUrl}/${gameId}/questcheck`)
    console.log(`Quests: ${quests}`)
    console.log(quests)
    console.log(quests[0])
    for (let x in quests) {
        let tag = "#aq" + (parseInt(x) + 1)
        console.log(`Tag:${tag}`)
        let target = document.querySelector(tag)
        let content = (`Destination: ` + quests[x].Name + `<br/>`) + (quests[x].Passenger_amount + ` passenger(s)` + `<br/>`) + (`Reward: ` + quests[x].Reward + `€`)
        target.innerHTML = content
    }
    return quests

}

// function to get quest // hide the questbutton upon success to prevent duplicate quest accepts
async function getQuest(questButton_value, quests, gameData) {
    let quest = quests[questButton_value]
    if ((gameData.current_passengerlvl + 1) >= quest.Passenger_amount) {
        for (let i = 1; i <= 3; i++) {
            let positiontag = "#questposition" + (parseInt(i))
            let questposition = document.querySelector(positiontag)
            if (questposition.innerHTML === "Much Empty") {
                let takenQuestData = await getData(`${apiUrl}/${gameId}/takequest/${questButton_value}`)
                console.log(`Taken Quest data:`)
                console.log(takenQuestData)
                let content = (`Destination: ` + takenQuestData[0].Name + `<br/>`) + (takenQuestData[0].Passenger_amount + ` passenger(s)` + `<br/>`) + (`Reward: ` + takenQuestData[0].Reward + `€` + `<br/>` + `Tehtävä umpeutuu vuorolla: ` + takenQuestData[0].Turn)
                questposition.innerHTML = content
                alert('Tehtävä hyväksytty')
                questTaken = true
                hideDialog()
                return takenQuestData
            }
        }
        alert('Tehtävä listasi on täynnä');
    } else {
        alert('Lentokoneesi matkustajakapasiteetti ei riitä tähän tehtävään')
    }
}

// function to complete quests // quest1, quest2, quest3, flight_destination, current_money
function questComplete(airport, quests) {
    if (airport.quest_dest === true) {
        getData(`${apiUrl}/${gameId}/ checkquest url here!`)
    }
}

// function to check if quest failed
function checkIfQuestFailed(turn, quests, failed_quests) {
    getData(`${apiUrl}/${gameId}/ check if quest failed url`)
}

// function to update game status
function updateStatus(status) {
    console.log("Status:")
    console.log(status)
    // document.querySelector('#player-name').innerHTML = `Player: ${status.name}`;
    document.querySelector('#consumed').innerHTML = status[1];
    document.querySelector('#budget').innerHTML = status[0];
    document.querySelector('#money').innerHTML = status[2];
    document.querySelector('#turn').innerHTML = status[3];
    document.querySelector('#co_level').innerHTML = status[4];
    document.querySelector('#passenger').innerHTML = (status[5] + 1);
    document.querySelector('#airport-name').innerHTML = status[6]
}

// function to show weather at selected airport
// function showWeather(airport) {
//   document.querySelector('#airport-name').innerHTML = airport.name;
//   document.querySelector('#airport-temp').innerHTML = `${airport.weather.temp}°C`;
//   document.querySelector('#weather-icon').src = airport.weather.icon;
//   document.querySelector('#airport-conditions').innerHTML = airport.weather.description;
//   document.querySelector('#airport-wind').innerHTML = `${airport.weather.wind.speed}m/s`;
// }

// function to find index of icao
function getIndex(array, value) {
    return array.findIndex(obj => obj.icao === value)
}

// function to complete concert
async function watchConcert() {
    return await getData(`${apiUrl}/${gameId}/watch`)

}

// function to check if concert active in location
function checkForConcert(airport, concerts) {
    if (airport.Concert_status === true) {
        let concert = concerts[getIndex(concerts, airport.icao)]
        let participation_check = confirm(`Sijainnissa on aktiivinen konsertti, haluatko osallistua? Lippu maksaa ${concert.price}`)
        if (participation_check === true) {
            let balance_check = (gamedata.status.money >= concert.price)
            if (balance_check === true) {
                checkConcerts(concert.genre)
                let consertData = watchConcert() // check what values needed
                updateConcerts(concerts)
            } else {
                alert('Rahasi eivät riitä konserttirannekkeeseen.')
            }
        }
    }
}

// function to check if any goals have been reached
// Might be useless?
function checkConcerts(concert_genre) {
    if (!concerts.includes(concert_genre)) {
        document.querySelector('.goal').classList.remove('hide');
        location.href = '#goals';
    }
}

// function to update goal data and goal table in UI
// This is needed?!
function updateConcerts(concerts) {
    document.querySelector('#goals').innerHTML = '';
    for (let concert of concerts) {
        const li = document.createElement('li');
        const figure = document.createElement('figure');
        // const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');
        // img.src = goal.icon;
        // img.alt = `goal name: ${goal.name}`;
        figcaption.innerHTML = concert.genre;
        // figure.append(img);
        figure.append(figcaption);
        li.append(figure);
        if (concert.concert_over) { // Check this later together!!!
            li.classList.add('done');
            concerts.includes(concert.genre) || concerts.push(concert.genre);
        }
        document.querySelector('#goals').append(li);
    }
}

// function to check if game is over
function checkGameOver(budget, quest_failed) {
    if (budget <= 0) {
        alert(`Game Over. ${concerts.length} goals reached.`);
        return false;
    }
    return true;
}

// function to set up game
// this is the main function that creates the game and calls the other functions
async function gameSetup(url) {
    try {
        document.querySelector('.goal').classList.add('hide');
        airportMarkers.clearLayers();
        gameData = await getData(url);
        console.log("Game Data:")
        console.log(gameData);
        gameId = gameData[0].id
        for (let i = 1; i <= gameData.length; i++) {
            airports.push(gameData[i])
        }
        console.log("Airports:")
        console.log(airports)
        console.log(airports[0])
        let status = []
        // status = [gameData[0].co2_budget, gameData[0].co2_consumed, gameData[0].money, gameData[0].turn, gameData[0].current_co2lvl, gameData[0].current_passengerlvl, gameData[0].current_airportname]
        status.push(gameData[0].co2_budget, gameData[0].co2_consumed, gameData[0].money, gameData[0].turn, gameData[0].current_co2lvl, gameData[0].current_passengerlvl, gameData[0].current_airportname)
        // console.log("Status:)
        // console.log(status)
        updateStatus(status);
        availableQuests = await checkQuests()
        // if (!checkGameOver(gameData.status.co2.budget)) return;
        // checkForConcert(gameData.airport.icao,)
        // generateNewQuests()
        for (let airport of airports) {
            // console.log("Singular airport")
            // console.log(airport)
            const marker = L.marker([airport.Latitude, airport.Longitude]).addTo(map);
            airportMarkers.addLayer(marker);
            if (airport.Concert_status && airport.Is_quest_destination) {
                marker.setIcon(magentaIcon);
                const popupContent = document.createElement('div');
                const h4 = document.createElement('h4');
                h4.innerHTML = airport.name;
                popupContent.append(h4);
                const goButton = document.createElement('button');
                goButton.classList.add('button');
                goButton.innerHTML = 'Fly here';
                popupContent.append(goButton);
                const p = document.createElement('p');
                let q_index = getIndex(quests, airport.icao)
                let c_index = getIndex(concerts, airport.icao)
                p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${quests[q_index].turn}\nTäällä ${concerts[c_index].genre} konsertti`;
                popupContent.append(p);
                marker.bindPopup(popupContent);
                goButton.addEventListener('click', function () {
                    gameSetup(`${apiUrl}flyto?game=${gameData.status.id}&dest=${airport.ident}&consumption=${airport.co2_consumption}`);
                });
            } else if (airport.Concert_status) {
                marker.setIcon(blueIcon);
                const popupContent = document.createElement('div');
                const h4 = document.createElement('h4');
                h4.innerHTML = airport.name;
                popupContent.append(h4);
                const goButton = document.createElement('button');
                goButton.classList.add('button');
                goButton.innerHTML = 'Fly here';
                popupContent.append(goButton);
                const p = document.createElement('p');
                let index = getIndex(concerts, airport.Icao)
                p.innerHTML = `Täällä ${concerts[index].genre} konsertti`;
                popupContent.append(p);
                marker.bindPopup(popupContent);
                goButton.addEventListener('click', function () {
                    flyto(airport.Icao);
                });
            } else if (airport.Is_quest_destination) {
                marker.setIcon(redIcon);
                const popupContent = document.createElement('div');
                const h4 = document.createElement('h4');
                h4.innerHTML = airport.Name;
                popupContent.append(h4);
                const goButton = document.createElement('button');
                goButton.classList.add('button');
                goButton.innerHTML = 'Fly here';
                popupContent.append(goButton);
                const p = document.createElement('p');
                let index = getIndex(quests, airport.Icao)
                p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${quests[index].turn} `;
                popupContent.append(p);
                marker.bindPopup(popupContent);
                goButton.addEventListener('click', function () {
                    flyto(airport.Icao);
                });
            } else if (airport.Icao === gameData.current_airportname) {
                map.flyTo([airport.Latitude, airport.Longitude], 10);
                // showWeather(airport);
                checkForConcert(airport.Icao, concerts.genre);
                questComplete(airport.Icao, quests)
                checkIfQuestFailed(gameData.turn, quests, gameData.failed_quests)
                marker.bindPopup(`You are here: <b>${airport.name}</b>`);
                marker.openPopup();
                marker.setIcon(greenIcon);
            }
            // // updateConcerts(gameData.concerts);
        }
    } catch
        (error) {
        console.log(error);
    }
}

// event listener to hide goal splash
/*document.querySelector('.goal').addEventListener('click', function (evt) {
  evt.currentTarget.classList.add('hide');
});
*/
let tehtava_button = document.getElementById("t_button")
let konsertti_button = document.getElementById("k_button")
let valitse_button = document.getElementById("tk_button")

//let paivitys_button = document.getElementById( "p_button")
tehtava_button.addEventListener("click", hidequest);
konsertti_button.addEventListener("click", hideconsert);
valitse_button.addEventListener("click", showDialog);

//paivitys_button.addEventListener("click", hideupgrade)


function hidequest() {
    var x = document.getElementById("tehtava");
    var y = document.getElementById("genret");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none";

    } else x.style.display = "block"
    y.style.display = "none";

}

function hideconsert() {
    var x = document.getElementById("tehtava");
    var y = document.getElementById("genret");
    if (y.style.display === "none") {
        y.style.display = "block";
        x.style.display = "none";

    } else y.style.display = "block"
    x.style.display = "none"

}

const dialog = document.querySelector("dialog")
const span = document.querySelector('#modalX')
span.addEventListener('click', hideDialog)

function showDialog() {
    if (!questTaken) {
        console.log("Modal Opened")
        dialog.showModal()
    } else {
        alert('Olet ottanut jo tehtävän tällä vuorolla')
    }
}

function hideDialog() {
    console.log("Modal Closed")
    dialog.close()
}


// //Quest Buttons and button functions

let questButton1 = document.querySelector('#aq1button')
let questButton2 = document.querySelector('#aq2button')
let questButton3 = document.querySelector('#aq3button')

questButton1.addEventListener("click", async function () {
    let value = 0
    getQuest(value, availableQuests, gameData)
})
questButton2.addEventListener("click", async function () {
    let value = 1
    getQuest(value, availableQuests, gameData)
})
questButton3.addEventListener("click", async function () {
    let value = 2
    getQuest(value, availableQuests, gameData)
})
