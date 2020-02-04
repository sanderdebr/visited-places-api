mapboxgl.accessToken = 'pk.eyJ1Ijoic2FuZGVyZGViciIsImEiOiJjazY1YXR3NDQxNHlwM3JwZWJicHZ6ZDNyIn0.hs2f4c6kJanQ7E9QnHziLg';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 1,
});

// Get places from API
async function getPlaces() {
    const res = await fetch('/api');
    const data = await res.json();

    let places = data.data.map(place => (
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [place.location.coordinates[0], place.location.coordinates[1]]
            },
            properties: {
                city: place.location.city
            }
        }
    ));

    return places;
};

// Show places on map
async function showMap() {
    let places = await getPlaces();

    map.on('load', () => {

        map.addSource('api', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: places
            }
        });

        map.addLayer({
            id: 'points',
            type: 'symbol',
            minzoom: 0,
            source: 'api',
            layout: {
                'icon-image': 'marker-15',
                'icon-allow-overlap': true,
                'text-allow-overlap': true,
                'icon-size': 2,
                'text-field': '{city}',
                'text-offset': [0, 0.9],
                'text-anchor': 'top'
            },
            paint: {
                "text-color": "#00d1b2",
            },
        });

        // Retrieving API data every second
        // window.setInterval(async () => {
        //     places = await getPlaces();

        //     map.getSource('api').setData({
        //         type: 'FeatureCollection',
        //         features: places
        //     });

        // }, 1000);

    });
};
// Handle user input
const form = document.getElementById('form');
const place = document.getElementById('place');

function handleChange() {
    if (place.value === '') {
        place.style.border = '3px solid lightcoral';
    } else {
        place.style.border = 'none';
    }
}

// Send POST to API to add place
async function addPlace(e) {
    e.preventDefault();

    if (place.value === '') {
        place.placeholder = 'Please fill in an address';
        return;
    }

    const sendBody = {
        address: place.value
    };

    try {
        place.value = '';
        place.placeholder = 'Loading...';

        const res = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendBody)
        });

        if (res.status === 400) {
            throw Error;
        }
        
        if (res.status === 200) {
            place.style.border = 'none';
            place.placeholder = 'Succesfully added!';
            
            // Retrieve updated data
            places = await getPlaces();

            map.getSource('api').setData({
                type: 'FeatureCollection',
                features: places
            });
        }
    } catch (err) {
        place.placeholder = err;
        return;
    }
};

place.addEventListener('keyup', handleChange);
form.addEventListener('submit', addPlace);

// Render places
showMap();