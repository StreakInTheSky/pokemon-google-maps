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
  return (Math.random() * ((locationState.currentBounds.east - 0.0001) - (locationState.currentBounds.west - 0.0001)) + (locationState.currentBounds.west - 0.0001)).toFixed(6);
}

function randomPokeGenX() {
  return (Math.random() * ((locationState.currentBounds.north - 0.0001) - (locationState.currentBounds.south - 0.0001)) + (locationState.currentBounds.south - 0.0001)).toFixed(6);
}

// creates new pokemon and add to state
function getPokemonInfo(number) {
  var pokeApiBase = 'https://pokeapi.co/api/v2/pokemon/';
  var pokemon;
  $.getJSON(pokeApiBase + number, function(data) {
    pokemon = {
      name: data.name,
      types: data.types, 
      height: (data.height / 10).toFixed(1) + 'm',
      weight: (data.weight / 10).toFixed(1) + 'kg',
    }
    pokemonState.currentWild[number].info = pokemon;
  });
}

function spawnPokemon(pokeNum, lat, lng) {
  function createPokemon() {
    pokemonState.currentWild[pokeNum] = {
      lat: lat,
      lng: lng,
    };

    getPokemonInfo(pokeNum);
    console.log('pokemon created')
  };
  createPokemon();
  if (Object.keys(pokemonState.currentWild).length > 10) {
    delete pokemonState.currentWild[pokeNum[0]];
    console.log('pokemon-deleted');
    createPokemon();
    showPokemonMarkers()
  } else {
    createPokemon();
    showPokemonMarkers()
  }
}

function intervalOfSpawning() {
  setInterval(function() {
    var num = generatePokeNum();
    var coor = { x: randomPokeGenX(), y: randomPokeGenY() }
    spawnPokemon(num, coor.x, coor.y);
  }, Math.random() * 1000);//((10 * 1000) - (1 * 1000)));
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
      marker.setMap(null);
      updateCaughtList(key);
      pokemonState.currentWild = {};
      initMap();
      pokemonState.currentCaught++;
      displayHUD();
      intervalOfSpawning();
    } else {
      marker.setMap(null);
      updateCaughtList(key);
      delete pokemonState.currentWild[key];
      pokemonState.currentCaught++;
      displayHUD();
    }
  })
}

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
      doWhenPokemonCaught(marker, key);
    });
  }
}

function showUserMarker(map) {
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
    spawnPokemon(1, locationState.currentLocation.lat + 0.000031, locationState.currentLocation.lng + 0.00008);
    spawnPokemon(4, locationState.currentLocation.lat + 0.00004, locationState.currentLocation.lng);
    spawnPokemon(7, locationState.currentLocation.lat + 0.000038, locationState.currentLocation.lng - 0.00008);
    
    initMap();
    displayHUD();
    showUserMarker(map);
    showPokemonMarkers(map);
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