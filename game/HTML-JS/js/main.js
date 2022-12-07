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

gameSetup(`${apiUrl}/airport/${startLoc}`);

// function to fetch data from API
async function getData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Invalid server input!');
    const data = await response.json();
    return data;
}

// function to add starting markers


// function to update game status
function updateStatus(status) {
    // document.querySelector('#player-name').innerHTML = `Player: ${status.name}`;
    document.querySelector('#consumed').innerHTML = status.co2.consumed;
    document.querySelector('#budget').innerHTML = status.co2.budget;
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

function getIndex(array, icao) {
    return array.findIndex(obj => obj.icao === icao)
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
                concert.concert_over = true
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
function checkGameOver(budget) {
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
        updateStatus(gameData.status);
        if (!checkGameOver(gameData.status.co2.budget)) return;
        checkForConcert(gameData.airport.icao,)
        for (let airport of gameData.location) {
            const marker = L.marker([airport.latitude, airport.longitude]).addTo(map);
            airportMarkers.addLayer(marker);
            if (airport.active) {
                map.flyTo([airport.latitude, airport.longitude], 10);
                showWeather(airport);
                checkConcerts(concert.genre);
                marker.bindPopup(`You are here: <b>${airport.name}</b>`);
                marker.openPopup();
                marker.setIcon(greenIcon);
            } else {
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
                p.innerHTML = `Distance ${airport.distance}km`;
                popupContent.append(p);
                marker.bindPopup(popupContent);
                goButton.addEventListener('click', function () {
                    gameSetup(`${apiUrl}flyto?game=${gameData.status.id}&dest=${airport.ident}&consumption=${airport.co2_consumption}`);
                });
            }
        }
        updateConcerts(gameData.concerts);
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