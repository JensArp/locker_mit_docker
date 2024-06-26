const openWeatherApiKey = 'cbbc4708df34fee8dbcc2e5accb3caf0'; // Dein OpenWeatherMap API-Key
const mapboxApiKey = 'pk.eyJ1Ijoic2ViYTk0IiwiYSI6ImNsd2w2aXc2NjAxeWgybXJ6MDhrc3YydjMifQ.6fpQEUu3r6uIjUcPtJ7rUA'; // Dein Mapbox API-Key

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    
    // Event Listener für die 'Enter'-Taste
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            getWeather();
            closeDatalist(); // Schließt das Datalist-Menü bei Enter
        }
    });

    // Event Listener für den Such-Button
    searchButton.addEventListener('click', () => {
        getWeather();
        closeDatalist(); // Schließt das Datalist-Menü bei Klick auf die Suchschaltfläche
    });

    // Event Listener für die Eingabe im Suchfeld
    cityInput.addEventListener('input', updateCityList);
});

async function updateCityList(event) {
    const query = event.target.value;
    if (query.length < 3) return; // Beginne mit der Suche erst ab 3 Zeichen

    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxApiKey}&autocomplete=true&types=place&language=de`);
    const cityData = await response.json();
    
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = ''; // Alte Einträge entfernen
    
    cityData.features.forEach(city => {
        const option = document.createElement('option');
        option.value = city.place_name;
        cityList.appendChild(option);
    });
}

async function getWeather() {
    const city = document.getElementById('city-input').value;
    const weatherInfo = document.getElementById('weather-info');
    const currentWeather = document.getElementById('current-weather');
    const currentWeatherIcon = document.getElementById('current-weather-icon');
    const currentTemperature = document.getElementById('current-temperature');
    const currentLocation = document.getElementById('current-location');
    
    weatherInfo.style.display = 'none';
    currentWeather.style.display = 'none';

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${openWeatherApiKey}&lang=de`);
        const currentWeatherData = await response.json();

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${openWeatherApiKey}&lang=de`);
        const forecastData = await forecastResponse.json();

        displayWeather(currentWeatherData, forecastData);

        // Anzeige des aktuellen Wetters
        const weatherIcon = getWeatherIcon(currentWeatherData.weather[0].icon);
        currentWeatherIcon.src = `images/${weatherIcon}`;
        currentTemperature.textContent = `${Math.round(currentWeatherData.main.temp)}°C`;
        currentLocation.textContent = currentWeatherData.name;
        currentWeather.style.display = 'block';

        // Hintergrund ändern basierend auf dem aktuellen Wetter
        const weatherCondition = currentWeatherData.weather[0].main.toLowerCase();
        changeBackground(weatherCondition);
    } catch (error) {
        alert('Stadt nicht gefunden!');
    }
}

function closeDatalist() {
    const cityInput = document.getElementById('city-input');
    cityInput.blur(); // Entferne den Fokus vom Eingabefeld, um das Datalist-Menü zu schließen
    setTimeout(() => cityInput.focus(), 0); // Setze den Fokus nach einem kurzen Timeout zurück auf das Eingabefeld
}

function displayWeather(currentWeather, forecast) {
    const forecastElement = document.getElementById('forecast');
    forecastElement.innerHTML = '';

    for (let i = 0; i < forecast.list.length; i += 8) {
        const dayForecast = forecast.list[i];
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');

        const weatherIcon = getWeatherIcon(dayForecast.weather[0].icon);

        const date = new Date(dayForecast.dt_txt);
        const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
        const day = date.getDate();
        const month = date.getMonth() + 1; // Monate beginnen bei 0

        const template = document.getElementById('forecast-template').content.cloneNode(true);
        
        template.querySelector('.weekday').textContent = weekday;
        template.querySelector('.date').textContent = `${day}.${month < 10 ? '0' : ''}${month}`;
        template.querySelector('.weather-icon').src = `images/${weatherIcon}`;
        template.querySelector('.weather-icon').alt = dayForecast.weather[0].description;
        template.querySelector('.temperature').textContent = `${Math.round(dayForecast.main.temp)}°C`;
        template.querySelector('.description').textContent = dayForecast.weather[0].description;
        template.querySelector('.rain').textContent = `Regen: ${Math.round(dayForecast.pop * 100)}%`;
        template.querySelector('.wind').textContent = `Wind: ${Math.round(dayForecast.wind.speed * 3.6)} km/h`;
        template.querySelector('.humidity').textContent = `LF: ${dayForecast.main.humidity}%`;
        template.querySelector('.visibility').textContent = `Sicht: ${Math.round(dayForecast.visibility / 1000)} km`;
        template.querySelector('.feels-like').textContent = `Gefühlt: ${Math.round(dayForecast.main.feels_like)}°C`;

        dayElement.appendChild(template);
        forecastElement.appendChild(dayElement);
    }

    document.getElementById('weather-info').style.display = 'block';
}

function getWeatherIcon(iconCode) {
    switch(iconCode) {
        case '01d':
        case '01n':
            return 'clear.png';
        case '02d':
        case '02n':
        case '03d':
        case '03n':
        case '04d':
        case '04n':
            return 'cloudy.png';
        case '09d':
        case '09n':
        case '10d':
        case '10n':
            return 'rain.png';
        case '11d':
        case '11n':
            return 'thunderstorm.png';
        case '13d':
        case '13n':
            return 'snow.png';
        default:
            return 'default.png'; // Optional: Fallback-Icon
    }
}

function changeBackground(weatherCondition) {
    const body = document.body;
    let backgroundFilename = '';

    switch(weatherCondition) {
        case 'clear':
            backgroundFilename = 'clear.jpg';
            break;
        case 'clouds':
            backgroundFilename = 'cloudy.jpg';
            break;
        case 'rain':
            backgroundFilename = 'rain.jpg';
            break;
        case 'thunderstorm':
            backgroundFilename = 'thunderstorm.jpg';
            break;
        case 'snow':
            backgroundFilename = 'snow.jpg';
            break;
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
        case 'squall':
        case 'tornado':
            backgroundFilename = 'fog.jpg';
            break;
        default:
            backgroundFilename = 'default.jpg';
            break;
    }

    body.style.backgroundImage = `url('backgrounds/${backgroundFilename}')`;
}
