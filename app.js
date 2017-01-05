var state = {
	currentLocation: {
		lat: 34.598467, 
		lng: 135.833055
	},
	currentWild: {},
	pokedex: {}
}

var settings = {
	limitBox: {
		topLeft: {
			x: state.currentLocation.lat + 0.00053, 
			y: state.currentLocation.lng - 0.00095
		},
		bottomRight: {
			x: state.currentLocation.lat - 0.00053, 
			y: state.currentLocation.lng + 0.00095
		}
	}
}

var map;


//randomly generate location of pokemon within window
function randomPokeGenX() {
	return (Math.random() * (settings.limitBox.topLeft.x - settings.limitBox.bottomRight.x) + settings.limitBox.bottomRight.x).toFixed(6);
}

function randomPokeGenY() {
	return (Math.random() * (settings.limitBox.topLeft.y - settings.limitBox.bottomRight.y) + settings.limitBox.bottomRight.y).toFixed(6);
}

$('#current-location-button').click(function() {

	if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      state.currentLocation = pos;

      settings = {
				limitBox: {
					topLeft: {
						x: state.currentLocation.lat + 0.00053, 
						y: state.currentLocation.lng - 0.00095
					},
					bottomRight: {
						x: state.currentLocation.lat - 0.00053, 
						y: state.currentLocation.lng + 0.00095
					}
				}
			};
    initMap();
    });
	}
  $('#start-screen').toggleClass('hidden');
  
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 20,
    center: state.currentLocation,
    mapTypeId: 'satellite'
  });

  // Show markers on map
  var iconBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  function getPokemonData(type) {
  	if (type === 'current') {
  		return { icon: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png' };
  	}
  	var number = Math.floor(Math.random() * (721 - 1)) + 1;
  	var sprite = iconBase + number + '.png';
  	var tooltip = getPokemonInfo(number, neededInfo);
  	return { icon: sprite, tooltip: tooltip };
  }

  function neededInfo(data) {
    var pokemon = {
      name: data.name,
      types: data.types,
      species: data.species.name,
      height: data.height,
      weight: (data.weight/10).toFixed(1) + 'kg',
    }
    console.log(pokemon);
  }

  function getPokemonInfo(number, callback) {
    var pokeApiBase = 'http://pokeapi.co/api/v2/pokemon/';
    $.getJSON(pokeApiBase + number, callback);
  }

  function addMarker(feature) {
    var marker = new google.maps.Marker({
      position: feature.position,
      icon: getPokemonData(feature.type).icon,
     	tooltip: getPokemonData(feature.type).tooltip,
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
    position: new google.maps.LatLng(state.currentLocation.lat, state.currentLocation.lng),
    type: 'current'
  }];

  for (var i = 0, feature; feature = features[i]; i++) {
    addMarker(feature);
  }
}

// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//   infoWindow.setPosition(pos);
//   infoWindow.setContent(browserHasGeolocation ?
//                         'Error: The Geolocation service failed.' :
//                         'Error: Your browser doesn\'t support geolocation.');
// }
