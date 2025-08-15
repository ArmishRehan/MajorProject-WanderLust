// Get map div
const mapDiv = document.getElementById("map");

if (mapDiv) {
  let lng = parseFloat(mapDiv.dataset.lng);
  let lat = parseFloat(mapDiv.dataset.lat);
  const title = mapDiv.dataset.title;

  // Initialize map
  const map = new maplibregl.Map({
    container: "map",
    style: "https://demotiles.maplibre.org/style.json",
    center: [lng, lat],
    zoom: 5
  });

  // Add marker
  const marker = new maplibregl.Marker()
    .setLngLat([lng, lat])
    .setPopup(new maplibregl.Popup().setText(title))
    .addTo(map);

  // Only for edit page: update map on location/country change
  const locationInput = document.getElementById("location");
  const countryInput = document.getElementById("country");

  if (locationInput && countryInput) {
    async function updateMap() {
      const address = `${locationInput.value}, ${countryInput.value}`;
      if (!address.trim()) return;

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const res = await fetch(url, {
          headers: { "User-Agent": "wanderlust-app/1.0 (your_email@example.com)" }
        });
        const data = await res.json();
        if (data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);

          // Update map and marker
          map.setCenter([lng, lat]);
          marker.setLngLat([lng, lat]);

          // Update hidden inputs
          document.getElementById("coord-lng").value = lng;
          document.getElementById("coord-lat").value = lat;
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    }

    // Update map when typing or leaving the input
    locationInput.addEventListener("change", updateMap);
    countryInput.addEventListener("change", updateMap);
  }
}
