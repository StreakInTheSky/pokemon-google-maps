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
			lat: locationState.currentLocation.lat + 0.0004,
			lng: locationState.currentLocation.lng + 0.0004,
		},
		4: {
			lat: locationState.currentLocation.lat + 0.0004,
			lng: locationState.currentLocation.lng + 0.0004,
		},
		7: {
			lat: locationState.currentLocation.lat + 0.0004,
			lng: locationState.currentLocation.lng + 0.0004,
		},
	},
	pokedex: {},
}

var map;

//randomly generate location of pokemon within window
function randomPokeGenY() {
	return (Math.random() * (locationState.currentBounds.east - locationState.currentBounds.west) + locationState.currentBounds.west).toFixed(6);
}

function randomPokeGenX() {
	return (Math.random() * (locationState.currentBounds.north - locationState.currentBounds.south) + locationState.currentBounds.south).toFixed(6);
}

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
  }
})

// creates new pokemon and 
function spawnPokemon() {
	var pokemon;
	var pokeNum = Math.floor(Math.random() * (721 - 1)) + 1;
	var locLat = randomPokeGenX();
	var locLng = randomPokeGenY();

	pokemonState.currentWild[pokeNum] = {
		lat: locLat,
		lng: locLng
	};
}

function showMarkers(map) {
  // Show markers on map
  var iconBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  function getPokemonIcon(type) {
  	if (type === 'current') {
  		return { icon: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png' };
  	}
  	var number = Math.floor(Math.random() * (721 - 1)) + 1;
  	var sprite = iconBase + number + '.png';
  	var tooltip = getPokemonData(number)
  	return { icon: sprite, tooltip: tooltip };
  }

  function getPokemonData(number) {
  	return //get crapola
  }

  function addMarker(feature) {
    var marker = new google.maps.Marker({
      position: feature.position,
      icon: getPokemonIcon(feature.type).icon,
     	tooltip: getPokemonIcon(feature.type).tooltip,
      map: map
    });
  }

  var features = [{
    position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
    type: 'pokemon'
  }, {
    position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
    type: 'pokemon'
  }, {
    position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
    type: 'pokemon'
  }, {
    position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
    type: 'pokemon'
  }, {
    position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
    type: 'pokemon'
  }, {
    position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
    type: 'pokemon'
  }, {
    position: new google.maps.LatLng(randomPokeGenX(), randomPokeGenY()),
    type: 'pokemon'
  }, {
    position: new google.maps.LatLng(locationState.currentLocation.lat, locationState.currentLocation.lng),
    type: 'current'
  }];

  for (var i = 0, feature; feature = features[i]; i++) {
    addMarker(feature);
  }
}

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

// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//   infoWindow.setPosition(pos);
//   infoWindow.setContent(browserHasGeolocation ?
//                         'Error: The Geolocation service failed.' :
//                         'Error: Your browser doesn\'t support geolocation.');
// }
