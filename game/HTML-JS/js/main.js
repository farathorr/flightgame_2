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

// function to get upgrade price // FIX PRICING!!!
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

// function to get current quests
// async function currentQuests() {
//     return await getData(`${apiUrl}/${gameId}/currentquests`)
// }

// function to fly to a new airport
async function flyTo(dest_icao) {
  // let destinationData = await getData(`${apiUrl}/${gameId}/flyto/${dest_icao}`)
  // return await getData(`${apiUrl}/${gameId}/flyto/${dest_icao}`)
  try {
    questTaken = false;
    // console.log(gameId)
    airports = [];
    airportMarkers.clearLayers();
    gameData = await getData(`${apiUrl}/${gameId}/flyto/${dest_icao}`);
    if (gameData[0].Quest_status === false){
      new Audio('audio/flying_sound.mp3').play()
    }
    // console.log("GAMEDATA 2.0:")
    // console.log(gameData)
    console.log("Game Data:")
    console.log(gameData);
    for (let i = 0; i < gameData[1].length; i++) {
      airports.push(gameData[1][i]);
    }
    // console.log("Airports:")
    // console.log(airports)
    // console.log(airports[0])
    // console.log("Concerts:")
    // console.log(concerts)
    // console.log(concerts[0])
    updateStatus(gameData);
    availableQuests = await checkQuests();
    let airport = airports[getIndex(airports, status.Icao)];
    // console.log(status.Icao)
    // console.log("Airport in gameSetup:")
    // console.log(airport)
    // checkForConcert(airport, concerts)
    updateMap();
  } catch
      (error) {
    console.log(error);
  }

}

// function to call starting quests // set values after getting data!
// function startingQuests() {
//     getData(`${apiUrl}/${gameId}/ starting quest url here!`)
// }

// function to get available quest information
async function checkQuests() {
  let quests = await getData(`${apiUrl}/${gameId}/questcheck`);
  console.log(`Quests:`);
  console.log(quests);
  console.log(quests[0]);
  for (let x in quests) {
    let tag = '#aq' + (parseInt(x) + 1);
    console.log(`Tag:${tag}`);
    let target = document.querySelector(tag);
    let content = (`Destination: ` + quests[x].Name + `<br/>`) +
        (quests[x].Passenger_amount + ` passenger(s)` + `<br/>`) +
        (`Reward: ` + quests[x].Reward + `€`);
    target.innerHTML = content;
  }
  return quests;

}

// function to get quest // hide the questbutton upon success to prevent duplicate quest accepts
async function getQuest(questButton_value, quests, gameData) {
  let quest = quests[questButton_value];
  console.log('Get Quest quest:');
  console.log(quest);
  console.log('Passenger level:');
  console.log(gameData[0].Current_passengerlvl);
  if ((status.Current_passengerlvl + 1) >= quest.Passenger_amount) {
    for (let i = 1; i <= 3; i++) {
      let positiontag = '#questposition' + (parseInt(i));
      let questposition = document.querySelector(positiontag);
      if (questposition.innerHTML === 'Much Empty') {
        let takenQuestData = await getData(
            `${apiUrl}/${gameId}/takequest/${questButton_value}`);
        questList.push(takenQuestData);
        console.log(`Taken Quest data:`);
        console.log(takenQuestData);
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
async function questComplete(airport, quests) {
  if (airport.Is_quest_destination === true) {
    let x = getIndex(questList, airport.Icao);
    let positiontag = '#questposition' + (parseInt(x + 1));
    let questposition = document.querySelector(positiontag);
    questposition.innerHTML = 'Much Empty';
    let moneyAfterQuest = await getData(`${apiUrl}/${gameId}/completequest`);
    console.log(moneyAfterQuest);
    alert(
        `Olet suorittanut tehtävän ja saanut palkkioksi:${moneyAfterQuest[0].Money -
        status.Money}€`);
    status.Money = moneyAfterQuest[0].Money;
    document.querySelector('#money').innerHTML = status.Money;
    questList.pop([getIndex(questList, airport.Icao)]);
    new Audio('audio/quest_complete.mp3').play()
  }
}

// function to check if quest failed
// function checkIfQuestFailed(turn, quests, failed_quests) {
//     getData(`${apiUrl}/${gameId}/ check if quest failed url`)
// }

// function to get starting status
function startStatus(status) {
  console.log('Status:');
  console.log(status);
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
  console.log('Status2+:');
  console.log(status);
  status.Co2_consumed = newStatus.Co2_consumed;
  status.Money = newStatus.Money;
  status.Turn = newStatus.Turn;
  status.Name = newStatus.Name;
  status.Latitude = newStatus.Latitude;
  status.Longitude = newStatus.Longitude;
  status.Icao = newStatus.Icao;
  document.querySelector('#consumed').innerHTML = newStatus.Co2_consumed;
  document.querySelector('#money').innerHTML = newStatus.Money;
  document.querySelector('#turn').innerHTML = newStatus.Turn;
  document.querySelector('#airport-name').innerHTML = newStatus.Name;
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
  return array.findIndex(obj => obj.Icao === value);
}

// function to complete concert
async function watchConcert() {
  return await getData(`${apiUrl}/${gameId}/watch`);

}

// function to check if concert active in location
async function checkForConcert(airport) {
  // console.log("Airport from checkForConcert:")
  // console.log(airport)
  if (airport.Concert_status === true) {
    let concert = concerts[getIndex(concerts, airport.Icao)];
    // let participation_check = confirm(`Sijainnissa on aktiivinen konsertti, haluatko osallistua? Lippu maksaa ${concert.Price}`)
    if (confirm(
        `Sijainnissa on aktiivinen konsertti, haluatko osallistua? Lippu maksaa ${concert.Price}`)) {
      let balance_check = (status.Money >= concert.Price);
      if (balance_check === true) {
        let concertData = await watchConcert(); // check what values needed
        concert.Concert_over = true;
        new Audio('audio/concert_complete.mp3').play()
        console.log('Concert Data');
        console.log(concertData);
        updateConcerts();
      } else {
        alert('Rahasi eivät riitä konserttirannekkeeseen.');
      }
    }
  }
}

// function to check if any goals have been reached
// Might be useless?

// function to update goal data and goal table in UI
// This is needed?!
function updateConcerts() {
  document.querySelector('#goals').innerHTML = '';
  for (let concert of concerts) {
    console.log("Concert:")
    console.log(concert)
    const li = document.createElement('li');
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    const figcaption = document.createElement('figcaption');
    img.src = 'img/icons8-music-100.png';
    img.alt = 'Goal icon';
    figcaption.innerHTML = concert.Genre;
    figure.append(img);
    figure.append(figcaption);
    li.append(figure);
    li.addEventListener('click', function(){
      let concertAirport = airports[getIndex(airports, concert.Icao)];
    map.flyTo([concertAirport.Latitude, concertAirport.Longitude], 10);
    })
    if (concert.Concert_over) { // Check this later together!!!
      li.classList.add('done');
      img.src = 'img/icons8-music-200.png';
      completedConcerts.includes(concert.Genre) ||
      completedConcerts.push(concert.Genre);
    }
    document.querySelector('#goals').append(li);
  }
}

// function to check if game is over
function checkGameOver(budget, quest_failed) {
  if (budget <= 0) {
    alert(`Game Over. ${completedConcerts.length} concerts visited.`);
    return false;
  }
  return true;
}

// function to update map
async function updateMap() {
  for (let airport of airports) {
    const marker = L.marker([airport.Latitude, airport.Longitude]).addTo(map);
    airportMarkers.addLayer(marker);
    // console.log("Airport vs gamedata")
    // console.log(airport.Icao)
    // console.log(status.Icao)
    if (airport.Icao === status.Icao) {
      map.flyTo([airport.Latitude, airport.Longitude], 10);
      // showWeather(airport);
      console.log('Airport in updateMap:');
      console.log(airport);
      checkForConcert(airport, concerts);
      questComplete(airport, questList);
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
      console.log('Questlist:');
      console.log(questList);
      p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${questList[q_index].Turn}\nTäällä ${concerts[c_index].Genre} konsertti`;
      popupContent.append(p);
      marker.bindPopup(popupContent);
      goButton.addEventListener('click', async function() {
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
      console.log('Concerts index:');
      console.log(concerts[index]);
      console.log(index);
      console.log(concerts);
      p.innerHTML = `Täällä ${concerts[index].Genre} konsertti`;
      popupContent.append(p);
      marker.bindPopup(popupContent);
      goButton.addEventListener('click', async function() {
        flyTo(airport.Icao);
      });
    } else if (airport.Is_quest_destination) {
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
      console.log('Questlist:');
      console.log(questList);
      p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${questList[index].Turn} `;
      popupContent.append(p);
      marker.bindPopup(popupContent);
      goButton.addEventListener('click', async function() {
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
      // const p = document.createElement('p');
      // let index = getIndex(quests, airport.Icao)
      // p.innerHTML = `Täällä tehtävä joka epäonnistuu vuorolla ${quests[index].turn} `;
      // popupContent.append(p);
      marker.bindPopup(popupContent);
      goButton.addEventListener('click', async function() {
        flyTo(airport.Icao);
      });
      // // updateConcerts();
    }
  }
}

// function to set up game
// this is the main function that creates the game and calls the other functions
async function gameSetup(url) {
  try {
    airportMarkers.clearLayers();
    gameData = await getData(url);
    console.log('Game Data:');
    console.log(gameData);
    gameId = gameData[0].Id;
    for (let i = 0; i < gameData[2].length; i++) {
      airports.push(gameData[2][i]);
    }
    for (let i = 0; i < gameData[1].length; i++) {
      concerts.push(gameData[1][i]);
    }
    // console.log("Airports:")
    // console.log(airports)
    // console.log(airports[0])
    // console.log("Concerts:")
    // console.log(concerts)
    // console.log(concerts[0])
    status = gameData[0];
    startStatus(status);
    availableQuests = await checkQuests();
    let airport = airports[getIndex(airports, status.Icao)];
    // console.log(status.Icao)
    // console.log("Airport in gameSetup:")
    // console.log(airport)
    checkForConcert(airport, concerts);
    updateMap();
    updateConcerts();
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
let tehtava_button = document.getElementById('t_button');
let konsertti_button = document.getElementById('k_button');
let valitse_button = document.getElementById('tk_button');

//let paivitys_button = document.getElementById( "p_button")
tehtava_button.addEventListener('click', hidequest);
konsertti_button.addEventListener('click', hideconcert);
valitse_button.addEventListener('click', showDialog);

//paivitys_button.addEventListener("click", hideupgrade)

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
    console.log('Modal Opened');
    dialog.showModal();
  } else {
    alert('Olet ottanut jo tehtävän tällä vuorolla');
  }
}

function hideDialog() {
  console.log('Modal Closed');
  dialog.close();
}

// //Quest Buttons and button functions

let questButton1 = document.querySelector('#aq1button');
let questButton2 = document.querySelector('#aq2button');
let questButton3 = document.querySelector('#aq3button');

questButton1.addEventListener('click', async function() {
  let value = 0;
  getQuest(value, availableQuests, gameData);
});
questButton2.addEventListener('click', async function() {
  let value = 1;
  getQuest(value, availableQuests, gameData);
});
questButton3.addEventListener('click', async function() {
  let value = 2;
  getQuest(value, availableQuests, gameData);
});
let fancy1 = document.querySelector('#fancy1');
let fancy2 = document.querySelector('#fancy2');
let fancy3 = document.querySelector('#fancy3');

fancy1.addEventListener('click', function() {
  let questposition = document.querySelector('#questposition1');
  if (questposition.innerHTML !== 'Much Empty') {
    let questAirport = airports[getIndex(airports, questList[0].Icao)];
    map.flyTo([questAirport.Latitude, questAirport.Longitude], 10);
  }
});

fancy2.addEventListener('click', function() {
  let questposition = document.querySelector('#questposition2');
  if (!questposition.innerHTML !== 'Much Empty') {
    let questAirport = airports[getIndex(airports, questList[1].Icao)];
    map.flyTo([questAirport.Latitude, questAirport.Longitude], 10);
  }
});

fancy3.addEventListener('click', function() {
  let questposition = document.querySelector('#questposition3');
  if (!questposition.innerHTML !== 'Much Empty') {
    let questAirport = airports[getIndex(airports, questList[2].Icao)];
    map.flyTo([questAirport.Latitude, questAirport.Longitude], 10);
  }
});
let co2Upgrade = document.querySelector('#upgradeco2');
let passengerUpgrade = document.querySelector('#upgradepass');
co2Upgrade.addEventListener('click', function() {
  getUpgrade('CO2 suodattimen', (status.Current_co2lvl + 1));
});
passengerUpgrade.addEventListener('click', function() {
  getUpgrade('matkustajapaikkojen', (status.Current_passengerlvl + 1));
});
