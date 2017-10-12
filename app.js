var locationState = {
	currentLocation: {
		lat: 35.576448,
		lng: 139.437330
	},
	currentBounds: {},
}

var pokemonState = {
	currentWild: {},
  currentCaught: 0,
  currentMarkers: {}
}

var map;
var infoWindow;


//randomly generate pokemon numbers and coordinates
function generatePokeNum() {
  return Math.floor(Math.random() * (151 - 1)) + 1;
}

function randomPokeGenY() {
  return (Math.random() * ((locationState.currentBounds.east - 0.00005) - (locationState.currentBounds.west + 0.00005)) + (locationState.currentBounds.west + 0.00005)).toFixed(6);
}

function randomPokeGenX() {
  return (Math.random() * ((locationState.currentBounds.north - 0.00012) - (locationState.currentBounds.south)) + (locationState.currentBounds.south)).toFixed(6);
}

// creates new pokemon and add to state
function getPokemonInfo(number, callback) {
  var pokeApiBase = 'https://pokeapi.co/api/v2/pokemon/';
  var pokemonInfo;
	$.getJSON(pokeApiBase + number + '/', function(data) {
 		pokemonInfo = {
      name: data.name,
      types: data.types,
      height: (data.height / 10).toFixed(1) + 'm',
      weight: (data.weight / 10).toFixed(1) + 'kg',
    }
		callback(pokemonInfo);
  });
}

function spawnPokemon(pokeNum, lat, lng) {
  function createPokemon() {
		getPokemonInfo(pokeNum, function(info){
			pokemonState.currentWild[pokeNum] = {
				lat: lat,
				lng: lng,
				info: info
			};
			showPokemonMarker(pokeNum);
		});
  };
	var pokemonList = Object.keys(pokemonState.currentWild)
  if (pokemonList.length > 10) {
		var randomPokemon = pokemonList[Math.floor(Math.random() * 9)]
    delete pokemonState.currentWild[randomPokemon];
		deleteMarker(randomPokemon)
	}

  createPokemon();
}

function intervalOfSpawning() {
  setInterval(function() {
    var num = generatePokeNum();
    var coor = { x: randomPokeGenX(), y: randomPokeGenY() }
    spawnPokemon(num, coor.x, coor.y);
  }, Math.random() * ((15 * 1000) - (1 * 1000)));
}

function formatPokemonInfo(key) {

  var pokemon = pokemonState.currentWild[key].info;
  var types;
  if (pokemon.types.length > 1) {
    types = pokemon.types[0].type.name + ', ' + pokemon.types[1].type.name;
  } else {
    types = pokemon.types[0].type.name;
  }

  return ('<div class="pokemon-info">' +
    '<p class="pokemon-name">' + pokemon.name +'</p>' +
    '<table>' +
      '<tbody>' +
        '<tr><td class="info-type">types:</td><td>' + types +'</td></tr>' +
        '<tr><td class="info-type">height:</td><td>' + pokemon.height +'</td></tr>' +
        '<tr><td class="info-type">weight:</td><td>' + pokemon.weight +'</td></tr>' +
      '</tbody>' +
    '</table>' +
  '</div>')
}

function createInfoWindowContent(key) {
  return formatPokemonInfo(key) +
         '<div class="catch-pokemon-button"><button class="catch">Catch Pokemon</button></div>';
}

function updateCaughtList(key) {
  $('.list-of-caught').append(
    '<li class="caught-pokemon">' + pokemonState.currentWild[key].info.name + '</li>'
  )
}

function doWhenPokemonCaught(marker, key) {
  $('.catch-pokemon-button').on('click', 'button', function(){

    if (pokemonState.currentCaught === 0) {

      updateCaughtList(key);
      pokemonState.currentWild = {};
      pokemonState.currentCaught++;
			deleteMarker(1);
			deleteMarker(4);
			deleteMarker(7);
      displayHUD();
      intervalOfSpawning();
    } else {
      deleteMarker(key); // Should delete the marker here!
      updateCaughtList(key);
      delete pokemonState.currentWild[key];
      pokemonState.currentCaught++;

      displayHUD();
    }
  })
}

// Adds markers to map

function deleteMarker(pokeNum) {
	var marker = pokemonState.currentMarkers[pokeNum];
	marker.setMap(null)
	delete pokemonState.currentMarkers[pokeNum]
}

function addMarker(icon) {
  var marker = new google.maps.Marker({
    position: icon.position,
    icon: icon.icon,
    map: map
  });
  if (icon.pokemon) {
		var key = icon.key;
		pokemonState.currentMarkers[key] = marker;
    marker.addListener('click', function() {
      infoWindow.setContent(createInfoWindowContent(key));
      infoWindow.open(map, marker);

      doWhenPokemonCaught(marker, key);
    });
  }
}

function showUserMarker() {
  var userMarker = {
    position: new google.maps.LatLng(locationState.currentLocation.lat, locationState.currentLocation.lng),
    icon: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png'
  }
  addMarker(userMarker);
}

function showPokemonMarker(pokeNum) {
	var pokemon = pokemonState.currentWild[pokeNum]
  var pokeIconBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  var pokemonMarker = {
    position: new google.maps.LatLng(pokemon.lat, pokemon.lng),
    icon: pokeIconBase + pokeNum + '.png',
    pokemon: true,
    key: pokeNum
  }
  addMarker(pokemonMarker);
}

function displayHUD() {
  $('.caught-num').text(pokemonState.currentCaught);
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 20,
    center: locationState.currentLocation,
    mapTypeId: 'satellite',
    disableDefaultUI: true
  });

  infoWindow = new google.maps.InfoWindow;

  google.maps.event.addListener(map, 'bounds_changed', function() {
    locationState.currentBounds = map.getBounds().toJSON();
    locationState.currentLocation = map.getCenter().toJSON();
  });
}

function getUserLocation() {
  function startLocation() {
		// Code we wish we had:
		//
		// spawnInitialPokemon().then(function() {
		//   // Continue...
	  // })

		//1.  Make one of these into a promise:


    spawnPokemon(1, locationState.currentLocation.lat + 0.000031, locationState.currentLocation.lng + 0.00008);
    spawnPokemon(4, locationState.currentLocation.lat + 0.00004, locationState.currentLocation.lng);
    spawnPokemon(7, locationState.currentLocation.lat + 0.000038, locationState.currentLocation.lng - 0.00008);

    displayHUD();
    showUserMarker();
		$('#start-screen').toggleClass('hidden');
		$('.hud').toggleClass('hidden');
  };

  $('#current-location-button').click(function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        locationState.currentLocation = pos;

        initMap();
				startLocation()
      }, function(){
				setTimeout(startLocation(), 2000);
			});
    } else {
			startLocation();
    }
  });

  $('#default-location-button').click(startLocation);
}

$(document).ready(getUserLocation());
