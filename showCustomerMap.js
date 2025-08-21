// This is a basic JavaScript template

function showCustomerMap(executionContext) {
    const formContext = executionContext.getFormContext();
    const address = formContext.getAttribute("jmi_location").getValue();

    if (!address) {
        alert("No address found.");
        return;
    }

    const apiKey = "20d7857b113c4874aff73157252105"; // Your Google Maps API key
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                const location = data.results[0].geometry.location;

                const mapWindow = window.open("", "_blank", "width=600,height=500");
                mapWindow.document.write(`
                    <html><head><title>Customer Map</title></head><body>
                    <div id="map" style="height:100%; width:100%;"></div>
                    <script>
                        function initMap() {
                            var map = new google.maps.Map(document.getElementById("map"), {
                                center: { lat: ${location.lat}, lng: ${location.lng} },
                                zoom: 15
                            });
                            new google.maps.Marker({ position: { lat: ${location.lat}, lng: ${location.lng} }, map: map });
                        }
                    </script>
                    <script async defer
                        src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap">
                    </script>
                    </body></html>
                `);
            } else {
                alert("Unable to find location: " + data.status);
            }
        })
        .catch(error => {
            console.error("Map error:", error);
            alert("Error loading map: " + error.message);
        });
}
