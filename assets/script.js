var searchButton = document.getElementById('searchbutton');
var clearButton = document.getElementById('clear-search');
var previoushistory = document.getElementById('history');
var citySearched = document.getElementById('city');
var localTemp = document.getElementById('local-temp');
var localHumidity = document.getElementById('local-humidity');
var localWind = document.getElementById('local-wind');
var localUV = document.getElementById('local-UV');
var fiveDayForecast = document.getElementById('five-day-forecast');
var uvValue = document.getElementById('UV-value');
var forecastData;
var weatherData;
var searchData;

function cityLocalStorage(event) {
    event.preventDefault();

    searchData = document.querySelector('#searchinput').value;
    if (listHistory.indexOf(searchData) === -1) {
        listHistory.push(searchData);
        localStorage.setItem('history', JSON.stringify(listHistory));
        showSearchHistory(searchData);
    }
    if (!searchData) {
        console.error('Please enter a city to see the weather forecast');
        return;
    }

    getApi(searchData);
}

function getApi(city) {

    var forecastApi = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=a4a3175d4b58de2f36d962b7e179ec68&units=imperial";
    var weatherAPI = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=a4a3175d4b58de2f36d962b7e179ec68&units=imperial";

    citySearched.innerHTML = "";
    fiveDayForecast.innerHTML = "";
    localTemp.innerHTML = "";
    localHumidity.innerHTML = "";
    localWind.innerHTML = "";
    localUV.innerHTML = "";
    uvValue.innerHTML = "";

    fetch(forecastApi)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function (data) {
            forecastData = data;

            for (i = 4; i < forecastData.list.length; i += 8) {
                var forecastDiv = document.createElement("div");
                forecastDiv.classList.add("col", "bg-primary", "forecast", "text-white", "ml-2", "mb-2",)

                var date = document.createElement("h2")
                var weeklyDate = data.list[i].dt_txt;
                date.textContent = new Date(weeklyDate).toLocaleDateString();

                var temperature = document.createElement("p")
                var weeklyTemperature = data.list[i].main.temp;
                temperature.textContent = "Temperature: " + weeklyTemperature + " ℉";

                var forecastHumidity = document.createElement("p")
                var weeklyHumidity = data.list[i].main.humidity;
                forecastHumidity.textContent = "Humidity: " + weeklyHumidity + "%";

                var forecastIcon = document.createElement("img");
                forecastIcon.setAttribute("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png")

                forecastDiv.append(date, forecastIcon, temperature, forecastHumidity)
                fiveDayForecast.appendChild(forecastDiv);

            }
        })

    fetch(weatherAPI)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }
            console.log(response);
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            console.log("Current data")
            weatherData = data;
            showCurrentWeather(weatherData);
        })
}


function showCurrentWeather(weatherData) {

    var Latt = weatherData.coord.lat;
    var Long = weatherData.coord.lon;
    calculateUV(Latt, Long);

    var showCity = document.createElement('h2');
    citySearched.append(showCity);

    var weatherIcon = document.createElement("img");
    weatherIcon.setAttribute("src", "http://openweathermap.org/img/w/" + weatherData.weather[0].icon + ".png")

    var todaysDate = new Date(moment().format()).toLocaleDateString();

    showCity.append(document.createTextNode(weatherData.name + "   "));
    showCity.append(document.createTextNode(" (" + todaysDate + ") "));
    showCity.append(weatherIcon);

    localTemp.append(document.createTextNode("Current Temperature: " + weatherData.main.temp + " ℉"));

    localHumidity.append(document.createTextNode("Current Humidity: " + weatherData.main.humidity + " %"));

    localWind.append(document.createTextNode("Current Wind Speed: " + weatherData.wind.speed + " MPH"));

    localUV.append(document.createTextNode("Current UV Index:  "));

}

function calculateUV(latitude, longitude) {
    var uvindexAPI = "http://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=a4a3175d4b58de2f36d962b7e179ec68";

    fetch(uvindexAPI)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            }
            console.log(response);
            return response.json();
        })
        .then(function (data) {
            uvIndex = data.value;
            uvColor(uvIndex);

        })
}

function uvColor(uvIndex) {
    uvValue.append(document.createTextNode(uvIndex));

    if (uvIndex >= 3 && uvIndex < 6) {
        uvValue.style.backgroundColor = "yellow";
    }
    else if (uvIndex >= 6 && uvIndex < 8) {
        uvValue.style.backgroundColor = "orange";
    }
    else if (uvIndex >= 8 && uvIndex < 11) {
        uvValue.style.backgroundColor = "red";
    }
    else {
        uvValue.style.backgroundColor = "violet";
    }
}

function showSearchHistory(city) {

    var citySearchedName = document.createElement('li');
    citySearchedName.textContent = city;

    citySearchedName.onclick = function () {
        getApi(this.textContent)
    }

    previoushistory.appendChild(citySearchedName);

}

searchButton.addEventListener('click', cityLocalStorage);


var listHistory = JSON.parse(localStorage.getItem('history')) || [];

if (listHistory.length) {
    for (let i = 0; i < listHistory.length; i++) {
        showSearchHistory(listHistory[i])

    }
}

clearButton.addEventListener('click', function clearListHistory() {
    previoushistory.textContent = "";
    localStorage.clear();
    listHistory = [];
});