var state = {
	currentLocation: {
		lat: 34.598467, 
		lng: 135.833055
	},
	currentWild: {},
	pokedex: {}
}

// var settings = {
// 	limitBox: {
// 		topLeft: {
// 			x: 34.605372, 
// 			y: 135.821255
// 		},
// 		bottomRight: {
// 			x: 34.590367, 
// 			y: 135.843629
// 		}
// 	}
// }
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

    });
	}
  $('#start-screen').toggleClass('hidden');
  initMap();
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 20,
    center: state.currentLocation,
    mapTypeId: 'satellite'
  });

  // Show markers on map
  var iconBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  var icons = {
    // pokemon: {
    //   icon: iconBase + 'parking_lot_maps.png'
    // },
    // current: {
    //   icon: iconBase + 'library_maps.png'
    // },
  };

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
