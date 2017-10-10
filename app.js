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
  currentMarkers: []
}

var map;
var infoWindow;


//randomly generate pokemon numbers and coordinates
function generatePokeNum() {
  return Math.floor(Math.random() * (721 - 1)) + 1;
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
		console.log('Fetched data:', data)
 		pokemonInfo = {
      name: data.name,
      types: data.types,
      height: (data.height / 10).toFixed(1) + 'm',
      weight: (data.weight / 10).toFixed(1) + 'kg',
    }
		console.log('fetched info for pokemon', number)
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
			console.log('created pokemon:', pokeNum);
			showPokemonMarkers();
		});
  };

  if (Object.keys(pokemonState.currentWild).length > 10) {
    delete pokemonState.currentWild[pokeNum[0]];
    // console.log('pokemon-deleted');
	}

  createPokemon();
}

function intervalOfSpawning() {
  setInterval(function() {
    var num = generatePokeNum();
    var coor = { x: randomPokeGenX(), y: randomPokeGenY() }
    spawnPokemon(num, coor.x, coor.y);
  }, Math.random() * ((20 * 1000) - (3 * 1000)));
}

function formatPokemonInfo(key) {
	console.log('Formatting Pokemon info for key:', key)
	console.log('Current wild:', pokemonState.currentWild);

  var pokemon = pokemonState.currentWild[key].info;
	console.log('Formatted this info:', pokemon)
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
      marker.setMap(null);
      updateCaughtList(key);
      pokemonState.currentWild = {};
      initMap();
      pokemonState.currentCaught++;
      displayHUD();
      intervalOfSpawning();
    } else {
			console.log('Marker to delete:', marker);
			console.log('Key:', key);
			console.log('State before deletion:', pokemonState);

      marker.setMap(null); // Should delete the marker here!
      updateCaughtList(key);
      delete pokemonState.currentWild[key];
      pokemonState.currentCaught++;

			console.log('State after deletion:', pokemonState);

      displayHUD();
    }
  })
}

// Adds markers to map

function addMarker(feature) {
  var marker = new google.maps.Marker({
    position: feature.position,
    icon: feature.icon,
    map: map
  });
  if (feature.show) {
    marker.addListener('click', function() {
      var key = feature.key
      infoWindow.setContent(createInfoWindowContent(key));
      infoWindow.open(map, marker);

			console.log('Catching Pokemon:')
      doWhenPokemonCaught(marker, key);
    });
		// pokemonState.currentMarkers.push(marker)
		// console.log(pokemonState.currentMarkers)
  }
}

function showUserMarker() {
  var userMarker = {
    position: new google.maps.LatLng(locationState.currentLocation.lat, locationState.currentLocation.lng),
    icon: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png'
  }
  addMarker(userMarker);
}

function showPokemonMarkers() {
  $.each(pokemonState.currentWild, function(key) {
    var pokeIconBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
    var pokemonMarker = {
      position: new google.maps.LatLng(this.lat, this.lng),
      icon: pokeIconBase + key + '.png',
      show: true,
      key: key
    }
    addMarker(pokemonMarker);
  })
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
    // spawnPokemon(4, locationState.currentLocation.lat + 0.00004, locationState.currentLocation.lng);
    // spawnPokemon(7, locationState.currentLocation.lat + 0.000038, locationState.currentLocation.lng - 0.00008);
		// Right now, these may or may not be finished before next code runs!

		//2. All this should run once promise is resolved.
    // initMap();
    displayHUD();
    showUserMarker();
    // showPokemonMarkers(map);
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

        spawnPokemon(1, locationState.currentLocation.lat + 0.000031, locationState.currentLocation.lng + 0.00008);
        spawnPokemon(4, locationState.currentLocation.lat + 0.00004, locationState.currentLocation.lng);
        spawnPokemon(7, locationState.currentLocation.lat + 0.000038, locationState.currentLocation.lng - 0.00008);

        initMap();
        displayHUD();
        showUserMarker(map);
        showPokemonMarkers(map);
        $('#start-screen').addClass('hidden');
        $('.hud').removeClass('hidden');
      }, startLocation()
      );
    } else {
      startLocation();
    }
  });

  $('#default-location-button').click(startLocation);
}

$(document).ready(getUserLocation());
