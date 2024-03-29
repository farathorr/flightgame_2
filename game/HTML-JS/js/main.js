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
let gameId = '';
let gameData = '';
let availableQuests = [];
const completedConcerts = [];
const concerts = [];
let airports = [];
const airportMarkers = L.featureGroup().addTo(map);
let questTaken = false;
let questList = [];
let status = [];

// icons
const blueIcon = L.divIcon({className: 'blue-icon'}); // For Concert
const greenIcon = L.divIcon({className: 'green-icon'}); // For basic
const redIcon = L.divIcon({className: 'red-icon'}); // For Quest
const magentaIcon = L.divIcon({className: 'magenta-icon'}); // For Quest + Concert

gameSetup(`${apiUrl}/start/`); // add starting quests

// function to fetch data from API
async function getData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Invalid server input!');
    const data = await response.json();
    return data;
}

// function to get upgrade price
function getPrice(type, level) {
    if (level === 1) {
        return 500;
    } else if (level === 2) {
        return 750;
    } else if (level === 3) {
        return 1500;
    }
}


// function to upgrade
async function getUpgrade(type, level) {
    if (level === 4) {
        return alert(`${type} taso on maksimissa`);
    }
    let price = getPrice(type, level);
    if (type === 'matkustajapaikkojen' && status.Money >= price) {
        if (confirm(`Seuraava matkustajapaikka taso maksaa ${price}€`)) {
            let upgradeData = await getData(`${apiUrl}/${gameId}/upgradepsngr`);
            status.Current_passengerlvl = upgradeData.Psngrlvl;
            status.Money = upgradeData.Money;
            document.querySelector(
                '#passenger').innerHTML = (status.Current_passengerlvl + 1);
            document.querySelector('#money').innerHTML = status.Money;
        }
    } else if (type === 'matkustajapaikkojen' && status.Money < price) {
        alert("Rahasi eivät riitä matkustajapaikkojen päivitykseen")
    } else if (type === 'CO2 suodattimen' && status.Money >= price) {
        if (confirm(`Seuraava CO2 suodattimen taso maksaa ${price}€`)) {
            let upgradeData = await getData(`${apiUrl}/${gameId}/upgradeco2`);
            status.Current_co2lvl = upgradeData.Co2lvl;
            status.Money = upgradeData.Money;
            document.querySelector('#co_level').innerHTML = status.Current_co2lvl;
            document.querySelector('#money').innerHTML = status.Money;
        }
    } else if (type === 'CO2 suodattimen' && status.Money < price) {
        alert("Rahasi eivät riitä CO2 suodattimen päivitykseen")
    }
}

// function to fail quest
function questFail() {
    questList.splice(0, 1)
    alert("Tehtävän aika raja on mennyt umpeen")
    updateQuests()
}

// function to updateQuests
function updateQuests() {
    document.querySelector('#questposition1').innerHTML = 'Much Empty'
    document.querySelector('#questposition2').innerHTML = 'Much Empty'
    document.querySelector('#questposition3').innerHTML = 'Much Empty'
    if (questList.length > 0) {
        for (let i = 0; i < questList.length; i++) {
            let positiontag = '#questposition' + (parseInt(i + 1));
            let questposition = document.querySelector(positiontag);
            if (questposition.innerHTML === 'Much Empty') {
                let content = (`Destination: ` + questList[i].Name + `<br/>`) +
                    (questList[i].Passenger_amount + ` passenger(s)` + `<br/>`) +
                    (`Reward: ` + questList[i].Reward + `€` + `<br/>` +
                        `Tehtävä umpeutuu vuorolla: ` + questList[i].Turn);
                questposition.innerHTML = content;
                updateMap();
            }
        }
    }
}

// function to fly to a new airport
async function flyTo(dest_icao) {
    try {
        questTaken = false;
        airports = [];
        airportMarkers.clearLayers();
        gameData = await getData(`${apiUrl}/${gameId}/flyto/${dest_icao}`);
        if (gameData[0].Quest_status === false) {
            new Audio('audio/flying_sound.mp3').play()
        }
        for (let i = 0; i < gameData[1].length; i++) {
            airports.push(gameData[1][i]);
        }
        updateStatus(gameData);
        checkIfQuestFailed()
        checkGameOver()
        availableQuests = await checkQuests();
        let airport = airports[getIndex(airports, status.Icao)];
        updateMap();
    } catch
        (error) {
        console.log(error);
    }
}

// function to get available quest information
async function checkQuests() {
    let quests = await getData(`${apiUrl}/${gameId}/questcheck`);
    for (let x in quests) {
        let tag = '#aq' + (parseInt(x) + 1);
        let target = document.querySelector(tag);
        let content = (`Destination: ` + quests[x].Name + `<br/>`) +
            (quests[x].Passenger_amount + ` passenger(s)` + `<br/>`) +
            (`Reward: ` + quests[x].Reward + `€`);
        target.innerHTML = content;
    }
    return quests;
}

// function to get quest // hide the questbutton upon success to prevent duplicate quest accepts
async function getQuest(questButton_value, quests) {
    let quest = quests[questButton_value];
    if ((status.Current_passengerlvl + 1) >= quest.Passenger_amount) {
        for (let i = 1; i <= 3; i++) {
            let positiontag = '#questposition' + (parseInt(i));
            let questposition = document.querySelector(positiontag);
            if (questposition.innerHTML === 'Much Empty') {
                let takenQuestData = await getData(
                    `${apiUrl}/${gameId}/takequest/${questButton_value}`);
                questList.push(takenQuestData);
                let content = (`Destination: ` + takenQuestData.Name + `<br/>`) +
                    (takenQuestData.Passenger_amount + ` passenger(s)` + `<br/>`) +
                    (`Reward: ` + takenQuestData.Reward + `€` + `<br/>` +
                        `Tehtävä umpeutuu vuorolla: ` + takenQuestData.Turn);
                questposition.innerHTML = content;
                alert('Tehtävä hyväksytty');
                questTaken = true;
                airports[getIndex(airports, quest.Icao)].Is_quest_destination = true;
                updateMap();
                hideDialog();
                return takenQuestData;
            }
        }
        alert('Tehtävä listasi on täynnä');
    } else {
        alert('Lentokoneesi matkustajakapasiteetti ei riitä tähän tehtävään');
    }
}

// function to complete quests // quest1, quest2, quest3, flight_destination, current_money
async function questComplete(airport) {
    // console.log("Questlist:")
    // console.log(questList)
    if (airport.Is_quest_destination === true) {
        airport.Is_quest_destination = false
        let moneyAfterQuest = await getData(`${apiUrl}/${gameId}/completequest`);
        alert(
            `Olet suorittanut tehtävän ja saanut palkkioksi:${moneyAfterQuest[0].Money -
            status.Money}€`);
        status.Money = moneyAfterQuest[0].Money;
        document.querySelector('#money').innerHTML = status.Money;
        questList.splice(getIndex(questList, airport.Icao), 1);
        updateQuests()
        new Audio('audio/quest_complete.mp3').play()
    }
}

// function to check if quest failed
function checkIfQuestFailed() {
    if (questList.length > 0) {
        if (questList[0].Turn < status.Turn) {
            questFail()
        }
    }
}

// function to get starting status
function startStatus(status) {
    document.querySelector('#consumed').innerHTML = status.Co2_consumed;
    document.querySelector('#budget').innerHTML = status.Co2_budget;
    document.querySelector('#money').innerHTML = status.Money;
    document.querySelector('#turn').innerHTML = status.Turn;
    document.querySelector('#co_level').innerHTML = status.Current_co2lvl;
    document.querySelector(
        '#passenger').innerHTML = (status.Current_passengerlvl + 1);
    document.querySelector('#airport-name').innerHTML = status.Name;
}

// function to update game status
function updateStatus(gameData) {
    let newStatus = gameData[0];
    status.Co2_consumed = newStatus.Co2_consumed;
    status.Money = newStatus.Money;
    status.Turn = newStatus.Turn;
    status.Name = newStatus.Name;
    status.Latitude = newStatus.Latitude;
    status.Longitude = newStatus.Longitude;
    status.Icao = newStatus.Icao;
    if (status.Quests_failed !== newStatus.Quests_failed) {

    }
    status.Quests_failed = newStatus.Quests_failed
    document.querySelector('#consumed').innerHTML = newStatus.Co2_consumed;
    document.querySelector('#money').innerHTML = newStatus.Money;
    document.querySelector('#turn').innerHTML = newStatus.Turn;
    document.querySelector('#airport-name').innerHTML = newStatus.Name;
}

// function to find index of icao
function getIndex(array, value) {
    return array.findIndex(obj => obj.Icao === value);
}

// function to complete concert
async function watchConcert() {
    return await getData(`${apiUrl}/${gameId}/watch`);
}

// function to check if concert active in location
async function checkForConcert(airport) {
    if (airport.Concert_status === true) {
        let concert = concerts[getIndex(concerts, airport.Icao)];
        if (confirm(
            `Sijainnissa on aktiivinen konsertti, haluatko osallistua? Lippu maksaa ${concert.Price}€`)) {
            let balance_check = (status.Money >= concert.Price);
            if (balance_check === true) {
                concert.Concert_over = true;
                airport.Concert_status = false
                let concertData = await watchConcert(); // check what values needed
                new Audio('audio/concert_complete.mp3').play()
                // console.log('Concert Data');
                // console.log(concertData);
                status.Money = concertData.Money
                document.querySelector('#money').innerHTML = status.Money
                updateConcerts();
                gameWon()
            } else {
                alert('Rahasi eivät riitä konserttirannekkeeseen.');
            }
        }
    }
}

// function to update goal data and goal table in UI
function updateConcerts() {
    document.querySelector('#goals').innerHTML = '';
    for (let concert of concerts) {
        const button = document.createElement('button');
        button.classList.add('button-38')
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');
        img.src = 'img/icons8-music-100.png';
        img.alt = 'Goal icon';
        figcaption.innerHTML = concert.Genre;
        figure.append(img);
        figure.append(figcaption);
        button.append(figure);
        button.addEventListener('click', function () {
            let concertAirport = airports[getIndex(airports, concert.Icao)];
            map.flyTo([concertAirport.Latitude, concertAirport.Longitude], 10);
        })
        if (concert.Concert_over) { // Check this later together!!!
            button.classList.add('done');
            img.src = 'img/icons8-music-200.png';
            completedConcerts.includes(concert.Genre) ||
            completedConcerts.push(concert.Genre);
        }
        document.querySelector('#goals').append(button);
    }
}

// function to check if game is over
function checkGameOver() {
    let reason = ''
    if (status.Co2_consumed > status.Co2_budget) {
        reason = "CO2 päästöt ylittivät sallitun budjetin"
    } else if (status.Quests_failed >= 3) {
        reason = "Epäonnistuit liian monta tehtävää"
    }
    if (reason !== '') {
        airportMarkers.clearLayers();
        alert(`Peli ohi! \n${completedConcerts.length} konsertissa käyty. \nSyy epäonnistumiseen: ${reason}`);
        let dialog = document.querySelector("dialog").innerHTML = ''
        dialog = document.querySelector("dialog")
        let button = document.createElement("button")
        button.classList.add('resetbutton')
        button.innerText = "Yritä uudelleen?"
        button.addEventListener('click', function () {
            refreshPage()
        })
        dialog.append(button)
        dialog.showModal()
    }
}

// function to refresh page
function refreshPage() {
    window.location.reload();
}

// function to check if game won
async function gameWon() {
    if (completedConcerts.length >= 6) {
        let score = (status.Co2_budget - status.Co2_consumed + status.Money - status.Turn * 200)
        let name = prompt(`Onneksi olkoon onnistuit käymään kaikissa konserteissa!\nSait ${score} pistettä \n Syötä nimesi tallentaaksesi lopputuloksen`)
        if (name !== '') {
            let topscores = await getData(`${apiUrl}/${gameId}/score/${name}/${score}`)
            console.log("Topscores:")
            console.log(topscores)

            airportMarkers.clearLayers();
            let dialog = document.querySelector("dialog").innerHTML = ''
            dialog = document.querySelector("dialog")
            let button = document.createElement("button")
            button.classList.add('resetbutton')
            button.innerText = "Pelaa uudelleen"
            button.addEventListener('click', function () {
                refreshPage()
            })
            for (let topscore of topscores) {
                let li = document.createElement('li')
                li.classList.add('topscore')
                li.innerHTML = `${topscore[0]} pistettä`
                dialog.append(li)
            }
            dialog.append(button)
            dialog.showModal()
        } else {
            airportMarkers.clearLayers();
            let dialog = document.querySelector("dialog").innerHTML = ''
            dialog = document.querySelector("dialog")
            let button = document.createElement("button")
            button.classList.add('resetbutton')
            button.innerText = "Pelaa uudelleen"
            button.addEventListener('click', function () {
                refreshPage()
            })
            dialog.append(button)
            dialog.showModal()
        }
    }
}

// function to update map
async function updateMap() {
    for (let airport of airports) {
        const marker = L.marker([airport.Latitude, airport.Longitude]).addTo(map);
        airportMarkers.addLayer(marker);
        if (airport.Icao === status.Icao) {
            map.flyTo([airport.Latitude, airport.Longitude], 10);
            checkForConcert(airport, concerts);
            questComplete(airport);
            marker.bindPopup(`You are here: <b>${airport.Name}</b>`);
            marker.openPopup();
            marker.setIcon(greenIcon);
        } else if (airport.Concert_status && airport.Is_quest_destination) {
            marker.setIcon(magentaIcon);
            const popupContent = document.createElement('div');
            const h4 = document.createElement('h4');
            h4.innerHTML = airport.Name;
            popupContent.append(h4);
            const goButton = document.createElement('button');
            goButton.classList.add('flybutton');
            goButton.innerHTML = 'Fly here';
            popupContent.append(goButton);
            const p = document.createElement('p');
            let q_index = getIndex(questList, airport.Icao);
            let c_index = getIndex(concerts, airport.Icao);
            p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${questList[q_index].Turn}\nTäällä ${concerts[c_index].Genre} konsertti`;
            popupContent.append(p);
            marker.bindPopup(popupContent);
            goButton.addEventListener('click', async function () {
                flyTo(airport.Icao);
            });
        } else if (airport.Concert_status) {
            marker.setIcon(blueIcon);
            const popupContent = document.createElement('div');
            const h4 = document.createElement('h4');
            h4.innerHTML = airport.Name;
            popupContent.append(h4);
            const goButton = document.createElement('button');
            goButton.classList.add('flybutton');
            goButton.innerHTML = 'Fly here';
            popupContent.append(goButton);
            const p = document.createElement('p');
            let index = getIndex(concerts, airport.Icao);
            p.innerHTML = `Täällä ${concerts[index].Genre} konsertti`;
            popupContent.append(p);
            marker.bindPopup(popupContent);
            goButton.addEventListener('click', async function () {
                flyTo(airport.Icao);
            });
        } else if (airport.Is_quest_destination) {
            // console.log("Airport with quest destination status")
            // console.log(airport)
            marker.setIcon(redIcon);
            const popupContent = document.createElement('div');
            const h4 = document.createElement('h4');
            h4.innerHTML = airport.Name;
            popupContent.append(h4);
            const goButton = document.createElement('button');
            goButton.classList.add('flybutton');
            goButton.innerHTML = 'Fly here';
            popupContent.append(goButton);
            const p = document.createElement('p');
            let index = getIndex(questList, airport.Icao);
            p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${questList[index].Turn} `;
            popupContent.append(p);
            marker.bindPopup(popupContent);
            goButton.addEventListener('click', async function () {
                flyTo(airport.Icao);
            });
        } else {
            marker.setIcon(greenIcon);
            const popupContent = document.createElement('div');
            const h4 = document.createElement('h4');
            h4.innerHTML = airport.Name;
            popupContent.append(h4);
            const goButton = document.createElement('button');
            goButton.classList.add('flybutton');
            goButton.innerHTML = 'Fly here';
            popupContent.append(goButton);
            marker.bindPopup(popupContent);
            goButton.addEventListener('click', async function () {
                flyTo(airport.Icao);
            });
        }
    }
}

// function to set up game
// this is the main function that creates the game and calls the other functions
async function gameSetup(url) {
    try {
        airportMarkers.clearLayers();
        gameData = await getData(url);
        gameId = gameData[0].Id;
        for (let i = 0; i < gameData[2].length; i++) {
            airports.push(gameData[2][i]);
        }
        for (let i = 0; i < gameData[1].length; i++) {
            concerts.push(gameData[1][i]);
        }
        status = gameData[0];
        startStatus(status);
        availableQuests = await checkQuests();
        let airport = airports[getIndex(airports, status.Icao)];

        checkForConcert(airport, concerts);
        updateMap();
        updateConcerts();
    } catch
        (error) {
        console.log(error);
    }
}

let tehtava_button = document.getElementById('t_button');
let konsertti_button = document.getElementById('k_button');
let valitse_button = document.getElementById('tk_button');

tehtava_button.addEventListener('click', hidequest);
konsertti_button.addEventListener('click', hideconcert);
valitse_button.addEventListener('click', showDialog);

function hidequest() {
    var x = document.getElementById('tehtava');
    var y = document.getElementById('genret');
    if (x.style.display === 'none') {
        x.style.display = 'block';
        y.style.display = 'none';

    } else x.style.display = 'block';
    y.style.display = 'none';
}

function hideconcert() {
    var x = document.getElementById('tehtava');
    var y = document.getElementById('genret');
    if (y.style.display === 'none') {
        y.style.display = 'block';
        x.style.display = 'none';
    } else y.style.display = 'block';
    x.style.display = 'none';
}

const dialog = document.querySelector('dialog');
const span = document.querySelector('#modalX');
span.addEventListener('click', hideDialog);

function showDialog() {
    if (!questTaken) {
        // console.log('Modal Opened');
        dialog.showModal();
    } else {
        alert('Olet ottanut jo tehtävän tällä vuorolla');
    }
}

function hideDialog() {
    // console.log('Modal Closed');
    dialog.close();
}

// //Quest Buttons and button functions

let questButton1 = document.querySelector('#aq1button');
let questButton2 = document.querySelector('#aq2button');
let questButton3 = document.querySelector('#aq3button');

questButton1.addEventListener('click', async function () {
    let value = 0;
    getQuest(value, availableQuests);
});
questButton2.addEventListener('click', async function () {
    let value = 1;
    getQuest(value, availableQuests);
});
questButton3.addEventListener('click', async function () {
    let value = 2;
    getQuest(value, availableQuests);
});
let fancy1 = document.querySelector('#fancy1');
let fancy2 = document.querySelector('#fancy2');
let fancy3 = document.querySelector('#fancy3');

fancy1.addEventListener('click', function () {
    let questposition = document.querySelector('#questposition1');
    if (questposition.innerHTML !== 'Much Empty') {
        let questAirport = airports[getIndex(airports, questList[0].Icao)];
        map.flyTo([questAirport.Latitude, questAirport.Longitude], 10);
    }
});

fancy2.addEventListener('click', function () {
    let questposition = document.querySelector('#questposition2');
    if (questposition.innerHTML !== 'Much Empty') {
        let questAirport = airports[getIndex(airports, questList[1].Icao)];
        map.flyTo([questAirport.Latitude, questAirport.Longitude], 10);
    }
});

fancy3.addEventListener('click', function () {
    let questposition = document.querySelector('#questposition3');
    if (questposition.innerHTML !== 'Much Empty') {
        let questAirport = airports[getIndex(airports, questList[2].Icao)];
        map.flyTo([questAirport.Latitude, questAirport.Longitude], 10);
    }
});
let co2Upgrade = document.querySelector('#upgradeco2');
let passengerUpgrade = document.querySelector('#upgradepass');
co2Upgrade.addEventListener('click', function () {
    getUpgrade('CO2 suodattimen', (status.Current_co2lvl + 1));
});
passengerUpgrade.addEventListener('click', function () {
    getUpgrade('matkustajapaikkojen', (status.Current_passengerlvl + 1));
});