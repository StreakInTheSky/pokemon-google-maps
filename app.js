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
      info: 'none1'
		},
		4: {
			lat: locationState.currentLocation.lat + 0.00004,
			lng: locationState.currentLocation.lng,
      info: 'none4'
		},
		7: {
			lat: locationState.currentLocation.lat + 0.000038,
			lng: locationState.currentLocation.lng - 0.00006,
      info: 'none7'
		},
	}
}

var map;
var infowindow;

function getUserLocation() {
  $('#current-location-button').click(function() {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        locationState.currentLocation = pos;

        pokemonState.currentWild['1'].lat = pos.lat + 0.000031;
        pokemonState.currentWild['1'].lng = pos.lng + 0.00008;
        pokemonState.currentWild['4'].lat = pos.lat + 0.00004;
        pokemonState.currentWild['4'].lng = pos.lng;
        pokemonState.currentWild['7'].lat = pos.lat + 0.000038;
        pokemonState.currentWild['7'].lng = pos.lng - 0.00008;

        initMap();
      })
      $('#start-screen').toggleClass('hidden');
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
  if (Object.keys(pokemonState.currentWild).length > 10) {
    removePokemon();
  }
  showPokemonMarkers(map);
}

function intervalOfSpawning() {
  setInterval(spawnPokemon, 1000);//Math.random() * ((30 * 1000) - (1 * 1000)));
}

function removePokemon() {
  var pokeNum = Object.keys(pokemonState.currentWild)
  delete pokemonState.currentWild[pokeNum[0]];
}

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

function formatPokemonInfo(key) {
  var pokemon = pokemonState.currentWild[key].info;
  var types;
  if (pokemon.types.length > 1) {
    types = pokemon.types[0].type.name + ', ' + pokemon.types[1].type.name;
  } else {
    types = pokemon.types[0].type.name;
  }

  return ('<div class="pokemon-info">' +
    '<p>' + pokemon.name +'</p>' +
    '<table>' +
      '<tbody>' +
        '<tr><td>types:</td><td>' + types +'</td></tr>' +
        '<tr><td>height:</td><td>' + pokemon.height +'</td></tr>' +
        '<tr><td>weight:</td><td>' + pokemon.weight +'</td></tr>' +
      '</tbody>' +
    '</table>' +
  '</div>')
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
      infowindow = new google.maps.InfoWindow({
        content: formatPokemonInfo(key)
      });
      infowindow.open(map, marker);
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
    getPokemonInfo(key);
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
    // locationState.currentLocation = map.getCenter().toJSON();
    showUserMarker(map);
    showPokemonMarkers(map);
  });
}

$(function(){getUserLocation();});