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
const gameId = '';
const concerts = [];
const airportMarkers = L.featureGroup().addTo(map);

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

// function to call starting quests // set values after getting data!
function startingQuests(){
    getData(`${apiUrl}/${gameId}/ starting quest url here!`)
}

// function to generate available quests
function generateNewQuests(){
    getData(`${apiUrl}/${gameId}/ generate quests url here!`)
}
// function to get available quest information
function checkQuest(){
    let questData = getData(`${apiUrl}/${gameId}/questcheck`)

}

// function to get quest // hide the questbutton upon success to prevent duplicate quest accepts
function getQuest(questbutton_value, quests){
    let quest = quests[questbutton_value]
    getData(`${apiUrl}/${gameId}/ getQuest url!`)
}

// function to complete quests // quest1, quest2, quest3, flight_destination, current_money
function questComplete (airport, quests) {
    if (airport.quest_status === true) {
        getData(`${apiUrl}/${gameId}/ checkquest url here!`)
    }
}

// function to check if quest failed
function checkIfQuestFailed(turn, quests, failed_quests){
    getData(`${apiUrl}/${gameId}/ check if quest failed url`)
}

// function to update game status
function updateStatus(status) {
    console.log(status)
    // document.querySelector('#player-name').innerHTML = `Player: ${status.name}`;
    document.querySelector('#consumed').innerHTML = status[1];
    document.querySelector('#budget').innerHTML = status[0];
    document.querySelector('#money').innerHTML = status[2];
    document.querySelector('#turn').innerHTML = status[3];
    document.querySelector('#co_level').innerHTML = status[4];
    document.querySelector('#passenger').innerHTML = status[5];
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
function completeConcert(){
    getData(`${apiUrl}/${gameId}/ complete concert url!`)
}
// function to check if concert active in location
function checkForConcert(airport, concerts) {
    if (airport.concert_status === true) {
        let concert = concerts[getIndex(concerts, airport.icao)]
        let participation_check = confirm(`Sijainnissa on aktiivinen konsertti, haluatko osallistua? Lippu maksaa ${concert.price}`)
        if (participation_check === true) {
            let balance_check = (gamedata.status.money >= concert.price)
            if (balance_check === true) {
                checkConcerts(concert.genre)
                completeConcert() // check what values needed
                updateConcerts(concerts)
            } else {
                prompt('Rahasi eivät riitä konserttirannekkeeseen.')
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
        const gameData = await getData(url);
        console.log(gameData);
        let status = [gameData.co2_budget, gameData.co2_consumed, gameData.money, gameData.turn, gameData.current_co2lvl, gameData.current_passengerlvl]
        console.log(status)
        updateStatus(status);
        if (!checkGameOver(gameData.status.co2.budget)) return;
        checkForConcert(gameData.airport.icao,)
        generateNewQuests()
        for (let airport of gameData.location) {
            const marker = L.marker([airport.latitude, airport.longitude]).addTo(map);
            airportMarkers.addLayer(marker);
            if (airport.active) {
                map.flyTo([airport.latitude, airport.longitude], 10);
                // showWeather(airport);
                checkForConcert(airport.icao, concerts.genre);
                questComplete(airport.icao, quests)
                checkIfQuestFailed(gameData.turn, quests, gameData.failed_quests)
                marker.bindPopup(`You are here: <b>${airport.name}</b>`);
                marker.openPopup();
                marker.setIcon(greenIcon);
            } else if (airport.concert_status && airport.quest_status) {
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
            } else if (airport.concert_status) {
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
                let index = getIndex(concerts, airport.icao)
                p.innerHTML = `Täällä ${concerts[index].genre} konsertti`;
                popupContent.append(p);
                marker.bindPopup(popupContent);
                goButton.addEventListener('click', function () {
                    gameSetup(`${apiUrl}flyto?game=${gameData.status.id}&dest=${airport.ident}&consumption=${airport.co2_consumption}`);
                });
            } else if (airport.quest_status) {
                marker.setIcon(redIcon);
                const popupContent = document.createElement('div');
                const h4 = document.createElement('h4');
                h4.innerHTML = airport.name;
                popupContent.append(h4);
                const goButton = document.createElement('button');
                goButton.classList.add('button');
                goButton.innerHTML = 'Fly here';
                popupContent.append(goButton);
                const p = document.createElement('p');
                let index = getIndex(quests, airport.icao)
                p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${quests[index].turn} `;
                popupContent.append(p);
                marker.bindPopup(popupContent);
                goButton.addEventListener('click', function () {
                    gameSetup(`${apiUrl}flyto?game=${gameData.status.id}&dest=${airport.ident}&consumption=${airport.co2_consumption}`);
                });
            }
        }
        // updateConcerts(gameData.concerts);
    } catch (error) {
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
tehtava_button.addEventListener("click", hidequest);
konsertti_button.addEventListener("click", hideconsert);


function hidequest() {
    var x = document.getElementById("myDIV");
    var y = document.getElementById("tehtava")
    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none";
    } else y.style.display = "none";
}

function hideconsert() {
    var x = document.getElementById("myDIV");
    var y = document.getElementById("tehtava")
    if (y.style.display === "none") {
        y.style.display = "block";
        x.style.display = "none";
    } else x.style.display = "none";
}

// Quest Buttons and button functions
// const questbutton1 = document.querySelector(#questbutton1)
// const questbutton2 = document.querySelector(#questbutton2)
// const questbutton3 = document.querySelector(#questbutton3)
//
// function qbutton1Function(quests){
//     let value = 0
//     getQuest(value, quests)
// }
// function qbutton2Function(quests){
//     let value = 1
//     getQuest(value, quests)
// }
// function qbutton3Function(quests){
//     let value = 2
//     getQuest(value, quests)
// }
// questbutton1.addEventListener("click", qbutton1Function(quests))
// questbutton2.addEventListener("click", qbutton2Function(quests))
// questbutton3.addEventListener("click", qbutton3Function(quests))