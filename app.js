var locationState = {
	currentLocation: {
		lat: 34.598467, 
		lng: 135.833055
	},
	currentBounds: {},
}

var pokemonState = {
	currentWild: {
		1: {
			lat: locationState.currentLocation.lat + 0.000031,
			lng: locationState.currentLocation.lng + 0.00006,
		},
		4: {
			lat: locationState.currentLocation.lat + 0.00004,
			lng: locationState.currentLocation.lng,
		},
		7: {
			lat: locationState.currentLocation.lat + 0.000038,
			lng: locationState.currentLocation.lng - 0.00006,
		},
	},
	pokedex: {},
}

var map;

function getUserLocation() {
  $('#current-location-button').click(function() {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        locationState.currentLocation = pos;

        initMap();
      })
      $('#start-screen').toggleClass('hidden');
      intervalOfSpawning();
    }
  })
}

//randomly generate location of pokemon within window
function randomPokeGenY() {
	return (Math.random() * (locationState.currentBounds.east - locationState.currentBounds.west) + locationState.currentBounds.west).toFixed(6);
}

function randomPokeGenX() {
	return (Math.random() * (locationState.currentBounds.north - locationState.currentBounds.south) + locationState.currentBounds.south).toFixed(6);
}

// creates new pokemon and add to state
function spawnPokemon() {
	var pokemon;
	var pokeNum = Math.floor(Math.random() * (721 - 1)) + 1;
	var locLat = randomPokeGenX();
	var locLng = randomPokeGenY();

	pokemonState.currentWild[pokeNum] = {
		lat: locLat,
		lng: locLng
	};
  showMarkers(map);
}

function intervalOfSpawning() {
  setInterval(spawnPokemon, Math.random() * ((30 * 1000) - (1 * 1000)));
}

function removePokemon() {
  if (pokemonState.currentWild.length > 10) {
    delete pokemonState.currentWild.indexOf
  }
}

function neededInfo(data) {
  var pokemon = {
    name: data.name,
    types: data.types,
    height: data.height,
    weight: (data.weight / 10).toFixed(1) + 'kg',
    sprite: data.sprites.front_default,
  }
  return pokemon;
}

function getPokemonInfo(number, callback) {
  var pokeApiBase = 'http://pokeapi.co/api/v2/pokemon/';
  $.getJSON(pokeApiBase + number, callback);
}

function showMarkers(map) {
  var userMarker = {
    position: new google.maps.LatLng(locationState.currentLocation.lat, locationState.currentLocation.lng),
    icon: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png'
  }

  function addMarker(feature) {
    var marker = new google.maps.Marker({
      position: feature.position,
      icon: feature.icon,
      map: map
    });
  }

  addMarker(userMarker);

  $.each(pokemonState.currentWild, function(key) {
    var pokeIconBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
    var pokemonMarker = {
      position: new google.maps.LatLng(this.lat, this.lng),
      icon: pokeIconBase + key + '.png'
    }
    addMarker(pokemonMarker);
  })
}

// function showMarkers(map) {
//   // Show markers on map
//   var iconBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

//   function getPokemonData(type) {
//     if (type === 'current') {
//       return { icon: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png' };
//     }
//     var number = Math.floor(Math.random() * (721 - 1)) + 1;
//     var sprite = iconBase + number + '.png';
//     var tooltip = getPokemonInfo(number, neededInfo);
//     return { icon: sprite, tooltip: tooltip };
//   }

//   function neededInfo(data) {
//     var pokemon = {
//       name: data.name,
//       types: data.types,
//       height: data.height,
//       weight: (data.weight/10).toFixed(1) + 'kg',
//     }
//   }

//   function getPokemonInfo(number, callback) {
//     var pokeApiBase = 'http://pokeapi.co/api/v2/pokemon/';
//     $.getJSON(pokeApiBase + number, callback);
//   }

//   function addMarker(feature) {
//     var marker = new google.maps.Marker({
//       position: feature.position,
//       icon: getPokemonData(feature.type).icon,
//       tooltip: getPokemonData(feature.type).tooltip,
//       map: map
//     });
//   }


//   var features = [{
//     position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
//     type: 'pokemon'
//   }, {
//     position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
//     type: 'pokemon'
//   }, {
//     position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
//     type: 'pokemon'
//   }, {
//     position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
//     type: 'pokemon'
//   }, {
//     position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
//     type: 'pokemon'
//   }, {
//     position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
//     type: 'pokemon'
//   }, {
//     position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
//     type: 'pokemon'
//   }, {
//     position: new google.maps.LatLng(locationState.currentLocation.lat, locationState.currentLocation.lng),
//     type: 'current'
//   }];

//   for (var i = 0, feature; feature = features[i]; i++) {
//     addMarker(feature);
//   }
// }

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 20,
    center: locationState.currentLocation,
    mapTypeId: 'satellite'
  });

  google.maps.event.addListener(map, 'bounds_changed', function() {
    locationState.currentBounds = map.getBounds().toJSON();
    showMarkers(map);
  });
	
}

$(function(){getUserLocation();});