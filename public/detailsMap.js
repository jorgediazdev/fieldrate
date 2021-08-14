mapboxgl.accessToken = mapboxToken

const map = new mapboxgl.Map({
container: "map", // container ID
style: "mapbox://styles/mapbox/dark-v10", // style URL
center: field.geometry.coordinates, // starting position [lng, lat]
zoom: 9 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl())

new mapboxgl.Marker()
    .setLngLat(field.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
        .setHTML(
            `<h3>${field.name}</h3>`
        )
    )
    .addTo(map)