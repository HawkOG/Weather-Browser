const api = '9ee0a227ecea4b7f9e3170459252803'
// Set app units
const setUnits = () => {
    options.units = options.units === 'EU' ? 'US' : 'EU';
    alert('Settings changed. Change will be shown during the location change.')
}
const options = {
    units: 'EU'
};

console.log(`GLOBAL APP UNITS: ${options.units}`);

const fetchApi = async (url, query) => {
    try {
        const data = await fetch(`${url}?key=${api}&q=${query}`)
        const response = await data.json()
        return response;
    } catch (error) {
        console.warn("No data found" + error)
    }
}

const setData = async (url, query) => {
    // Set dummy data on page load
    url = url ? url : 'http://api.weatherapi.com/v1/current.json';
    query = query ? query : 'Yakutsk';

    const data = await fetchApi(url, query);

    console.log(data);
    let appUnits = options.units;
    const { current, location } = data;

    // Set city name and temp
    document.getElementById('location-name').innerHTML = `${location.name}, ${location.country} · ${appUnits == "EU" ? current.temp_c : current.temp_f}${appUnits == "EU" ? "°C" : "°F"}`;
    // Set region and timezone
    document.getElementById('timezone').innerText = location.region + " - " + location.tz_id.split("_").join(' ') + ' timezone'
    // Detailed info for city text 
    document.getElementById('detailedForLocation').innerText = `Detailed information for ${location.name}:`

    // Set details
    document.getElementById('information-wrapper').innerHTML = `
        <div>Visibility: ${appUnits == "EU" ? current.vis_km : current.vis_miles} ${appUnits == 'EU' ? 'km' : 'miles'}</div>
        <div>Humidity: ${current.humidity + "g/m3"}</div>
        <div>Heat index: ${appUnits == "EU" ? current.heatindex_c : current.heatindex_f}</div>
        <div>Wind direction: ${current.wind_dir}</div>
        <div>Wind speed: ${appUnits == "EU" ? current.wind_kph : current.wind_mph} ${appUnits == 'EU' ? 'kp/h' : 'mp/h'}</div>
        <div>Temperature: ${appUnits == "EU" ? current.temp_c : current.temp_f} ${appUnits == "EU" ? "°C" : "°F"}</div>
        <div>Feels like: ${appUnits == "EU" ? current.feelslike_c : current.feelslike_f} ${appUnits == "EU" ? "°C" : "°F"}</div>
        `
    getForecast(current.name ? current.name : query)
}

let autocompleter = document.getElementById('suggestions');
autocompleter.style.display = 'none';

const searchbar = document.getElementById('search').addEventListener('input', async (e) => {
    e.preventDefault();
    autocompleter.innerHTML = '';
    const data = await fetchApi('http://api.weatherapi.com/v1/search.json', e.target.value)
    const locations = Object.values(data);
    if (!locations.length) {
        autocompleter.innerHTML = `<span class="text-light">Loading <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#a31e29" stroke="#a31e29" stroke-width="15" r="15" cx="40" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#a31e29" stroke="#a31e29" stroke-width="15" r="15" cx="100" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#a31e29" stroke="#a31e29" stroke-width="15" r="15" cx="160" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg></span>`
    }
    if (e.target.value && true) {
        autocompleter.style.display = 'block';
    } else {
        autocompleter.style.display = 'none';
    }
    for (let i = 0; i < locations.length; i++) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<a class="a_suggestion" href="#">${locations[i].name}, ${locations[i].country}</a>`;

        listItem.querySelector('a').addEventListener('click', (event) => {
            event.preventDefault();  // Prevent the default anchor action
            e.target.value = `${locations[i].name}, ${locations[i].country}`
            autocompleter.style.display = 'none';
            setData('http://api.weatherapi.com/v1/current.json', e.target.value)
        });
        autocompleter.appendChild(listItem);
    }
})


const getForecast = async (city) => {
    try {
        console.log('Loading weather forecast for');
        console.log(city);
        const data = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${api}&q=${city}&days=7`)
        const response = await data.json();
        setForecastData(response)
    } catch (error) {
        console.error(error)
    }
}
const setForecastData = (data) => {
    console.log(data);
    const daysDiv = document.getElementById('days');
    daysDiv.innerHTML = '';

    const optionsday = { weekday: 'long' }; // Format for full weekday name
    data.forecast.forecastday.forEach((day, index) => {
        const date = new Date(day.date);
        daysDiv.innerHTML += `
            <div class="column rounded">
                <div class="date py-2">
                    <p>${date.toLocaleDateString('en-us', optionsday)}</p>
                </div>
                <div class="temp_icon">
                    <img src="https:${day.day.condition.icon}">
                    <h3>${options.units == "EU" ? day.day.avgtemp_c + "°C" : day.day.avgtemp_f + "°F"}</h3>
                    <p>${day.day.condition.text}</p>
                    <hr>
                    <p>Wind : ${options.units == "EU" ? day.day.maxwind_kph + " kph" : day.day.maxwind_mph + " mph"}</p>
                </div>
            </div>
        `;

    });


    const allDays = document.querySelectorAll('.column');
    allDays.forEach((item, i) => {
        allDays[i].addEventListener('click', () => {
            forecastEl.classList.toggle('showForecastGraph')
            showDetailedForecast(data.forecast.forecastday[i].hour)
        })
    })
};

const forecastEl = document.querySelector('.graph_visualizer')



const showDetailedForecast = (day) => {
    console.log(day)
    let temps = [];
    let hours = [];
    day.forEach((item, i) => {
        temps.push(`${options.units === 'EU' ? item.temp_c : item.temp_f}`)
        hours.push(formatEpochToTime(day[i].time_epoch))
    })
    console.log(temps)
    const ctx = document.getElementById('myChart');
    const a = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: `${options.units === 'EU' ? "Temperature (°C)" : "Temperature (°F)"}`,
                data: temps,
                borderWidth: 4,
                responsive: true,
                tension: .25,
                borderColor: 'rgb(163, 30, 41)',
            }]
        }
    });
    const chartClose = document.getElementById('closeChart')
    chartClose.addEventListener('click', () => {
        a.destroy();
        forecastEl.classList.remove('showForecastGraph')
    })
}
function formatEpochToTime(epochSeconds) {
    const date = new Date(epochSeconds * 1000); // Convert seconds to milliseconds
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

setData()
