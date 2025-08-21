function showCustomerMap(executionContext) {
    console.log("showCustomerMap function called."); // Debugging
    debugger; // Pause here to inspect the executionContext

    const formContext = executionContext.getFormContext();
    const address = formContext.getAttribute("jmi_location").getValue();
    console.log("Address retrieved:", address); // Debugging
    debugger; // Pause here to inspect the formContext and address

    if (!address) {
        alert("No address found.");
        return;
    }

    const apiKey = "20d7857b113c4874aff73157252105"; // Your Google Maps API key
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    console.log("Geocode URL:", geocodeUrl); // Debugging
    debugger; // Pause here to inspect the geocodeUrl

    fetch(geocodeUrl)
        .then(response => {
            console.log("Geocode API response received."); // Debugging
            debugger; // Pause here to inspect the response
            return response.json();
        })
        .then(data => {
            console.log("Geocode API data:", data); // Debugging
            debugger; // Pause here to inspect the data
            if (data.status === "OK") {
                const location = data.results[0].geometry.location;
                console.log("Location found:", location); // Debugging
                debugger; // Pause here to inspect the location

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
                console.error("Geocode API error:", data.status); // Debugging
                alert("Unable to find location: " + data.status);
            }
        })
        .catch(error => {
            console.error("Fetch error:", error); // Debugging
            debugger; // Pause here to inspect the error
            alert("Error loading map: " + error.message);
        });
}function showCustomerMap(executionContext) {
    console.log("showCustomerMap function called."); // Debugging

    const formContext = executionContext.getFormContext();
    const address = formContext.getAttribute("jmi_location").getValue();
    console.log("Address retrieved:", address); // Debugging

    if (!address) {
        alert("No address found.");
        return;
    }

    const apiKey = "20d7857b113c4874aff73157252105"; // Your Google Maps API key
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    console.log("Geocode URL:", geocodeUrl); // Debugging

    fetch(geocodeUrl)
        .then(response => {
            console.log("Geocode API response received."); // Debugging
            return response.json();
        })
        .then(data => {
            console.log("Geocode API data:", data); // Debugging
            if (data.status === "OK") {
                const location = data.results[0].geometry.location;
                console.log("Location found:", location); // Debugging

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
                console.error("Geocode API error:", data.status); // Debugging
                alert("Unable to find location: " + data.status);
            }
        })
        .catch(error => {
            console.error("Fetch error:", error); // Debugging
            alert("Error loading map: " + error.message);
        });
}