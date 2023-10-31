

(function () {

    function strate_geoloc(el) {

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };

        function display(pos) {
            const crd = pos.coords;
            el.querySelector('.geoloc-lat').innerHTML = `Latitude : ${crd.latitude}`;
            el.querySelector('.geoloc-lng').innerHTML = `Longitude : ${crd.longitude}`;
            el.querySelector('.geoloc-altitude').innerHTML = `Altitude : ${crd.altitude}`;
            el.querySelector('.geoloc-heading').innerHTML = `Heading : ${crd.heading}`;

            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://api-adresse.data.gouv.fr/reverse/?lat=${crd.latitude}&lon=${crd.longitude}`);
            //xhr.open('GET', `https://api-adresse.data.gouv.fr/reverse/?lon=2.3477734553611986&lat=48.870945281788245`);
            xhr.send();
            xhr.onload = () => {
                const data = JSON.parse(xhr.response);
                console.log(data);
                el.querySelector('.geoloc-city').innerHTML = data.features[0].properties.city;
            };
        }

        function meteo(pos) {
            const crd = pos.coords;
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://api.openweathermap.org/data/2.5/weather?&lang=fr&lat=${crd.latitude}&lon=${crd.longitude}&units=metric&appid=2cf13efac4223f0890daf638301d7e84`);
            xhr.send();
            xhr.onload = () => {
                const data = JSON.parse(xhr.response);
                el.querySelector('.name').innerHTML = `${data.name} - <i>${data.weather[0].description}</i>`;
                el.querySelector('.cloud').src = `assets/img/clouds/${data.weather[0].icon}@2x.png`;
                el.querySelector('.temperature').innerHTML = `Température: <b>${data.main.temp}°C</b>`;
                el.querySelector('.temperature_feellike').innerHTML = `Ressenti: <b>${data.main.feels_like}°C</b>`;
                el.querySelector('.humidity').innerHTML = `Humidité: <b>${data.main.humidity}%</b>`;
                el.querySelector('.wind_speed').innerHTML = `Vent: <b>${data.wind.speed}km/h</b>`;
            };
        }

        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }

        el.querySelector('.btn-location').onclick = () => {
            navigator.geolocation.getCurrentPosition(display, error, options);
        }

        navigator.geolocation.getCurrentPosition(meteo, error, options);

        // watching
        var id_speed;
        const deg2rads = function (degrees) {
            return degrees * (Math.PI / 180);
        };
        const distanceBetweenPoints = function (lat1, lon1, lat2, lon2, R = 6371) {
            return Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)) * R;
        };
        london = {
            lat: 51.511214,
            long: -0.119824
        };
        function distanceBetween(position) {
            var  dlKilometers, latRads, longRads;
            latRads = deg2rads(position.coords.latitude);
            longRads = deg2rads(position.coords.longitude);
            london.latRads = deg2rads(london.lat);
            london.longRads = deg2rads(london.long);
            dlKilometers = distanceBetweenPoints(latRads, longRads, london.latRads, london.longRads);
            return dlKilometers.toFixed(2);
        }

        function watch(pos) {
            const crd = pos.coords;
            el.querySelector(".speed").innerHTML = crd.latitude;
            el.querySelector(".distance").innerHTML = `${distanceBetween(pos)} km`;
        }

        const btn_speed = el.querySelector('.btn-speed');

        btn_speed.onclick = () => {
            if (btn_speed.classList.contains('active')) {
                navigator.geolocation.clearWatch(id_speed);
            } else {
                id_speed = navigator.geolocation.watchPosition(watch, error, {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 0,
                });
            }
            btn_speed.classList.toggle('active')
        };



        this.start = () => {
        }
    }


    window.strate_geoloc = strate_geoloc;
})();