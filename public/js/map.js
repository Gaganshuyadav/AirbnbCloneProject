
mapboxgl.accessToken = mapToken ;


const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates , // starting position [lng(|), lat(--)]
    zoom: 8, // starting zoom
});

//Create a default Marker
const marker1 = new mapboxgl.Marker({color:"red"})
    .setLngLat(listing.geometry.coordinates)    //listing from ejs using JSON.stringify
    //Create Popup message
    .setPopup(
        new mapboxgl.Popup({offset:25})        //offset means the popup message distance from marker
        .setHTML(`<h4>${listing.location}</h4><p>Exact Location will be provided after booking</p>`)
        // .setMaxWidth("300px")
    )    
    .addTo(map);