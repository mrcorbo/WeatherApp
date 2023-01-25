var APIkey = "appid=e3812d61a5b9cadace3264c964ce8123";
var searchBtn = $("#search");
var weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
var units = "&units=imperial"
var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";
var iconWeatherUrl = "https://openweathermap.org/img/wn/";
var uviUrl = "https://api.openweathermap.org/data/2.5/uvi";

// Weather Forecast - Current and 5-days
var weatherForecastEl = $("#weatherForecast");

// Current Weather Variables
var chosenCityEl = $("#chosenCity");
var iconEl = $("#icon");
var currentDateEl = $("#currentDate")
var temperatureEl = $("#temperature");
var windEl = $("#wind");
var humidityEl = $("#humidity");
var uvIndexEl = $("#uvIndex");

//History Variables//
var searchHistoryEl = $("#searchHistory");
var historyArr = [];
var clearHistoryBtn = $("#clearHistory")

//Function Init - calls Search City function - once the user types in the city and click the Search button, then fetch will be executed.
function init() {
	weatherForecastEl.hide();
	searchCity();
	historyClick();
	historyClear();
	historyDisplay();
	
};

//Function - Event Listener to Search Button
function searchCity() {
	searchBtn.on("click", function (event) {
		event.preventDefault();
		var userInputCity = $("#city").val().trim();
		if (userInputCity === "") {
				return;
		}	
		weatherCity(userInputCity);
		forecastCity(userInputCity);
		
		
	});
};

//Function weatherCity - Fetch to get the citie's information//

function weatherCity(userInputCity) {
	var queryUrl = weatherUrl + "?q=" + userInputCity + units + "&" + APIkey;

	fetch(queryUrl).then(function (cityResponse) {
		if (cityResponse.ok) {
			cityResponse.json().then(function (resultWeatherCity) {

				weatherForecastEl.show();

				var resultCity = resultWeatherCity;
				var cityName = resultCity.name;
		
				//Current Date displayed//

				var dtUnixCurrent = resultCity.dt;
				var currentDay = new Date(dayjs.unix(dtUnixCurrent));
				var dateCurrentjs = currentDay.toLocaleString("en-US", { weekday: "short", day: "numeric", month: "numeric", year:"numeric" });
				var cityTemperature = resultCity.main.temp.toFixed(0);
				var cityWind = resultCity.wind.speed.toFixed(0);
				var cityHumidity = resultCity.main.humidity;
				var weatherIcon = resultCity.weather[0].icon;

				var iconCompleteUrl = iconWeatherUrl + weatherIcon + '.png';

				//Unique values saved to History 
				function uniqueValuesHistory() {
					if (historyArr.includes(cityName) === false) {
						console.log(historyArr);
						historySave(cityName);
					}
				}
				uniqueValuesHistory(cityName);


				//Values displayed on current City Weather section

				chosenCityEl.text(cityName);
				currentDateEl.text(dateCurrentjs);
				iconEl.attr("src", iconCompleteUrl);
				temperatureEl.text("Temp: " + cityTemperature + " °F");
				windEl.text("Wind: " + cityWind + " mph");
				humidityEl.text("Humidity: " + cityHumidity + " %");


				console.log(resultCity);

				// UV Index - specific URL for UV index

				var latCity = resultCity.coord.lat;
				var lonCity = resultCity.coord.lon;
				var uviQueryUrl = uviUrl + "?" + APIkey + "&lat=" + latCity + "&lon=" + lonCity

				fetch(uviQueryUrl).then(function (uviResponse) {
					if (uviResponse.ok) {
						uviResponse.json().then(function (resultUvi) {

							function colorCode() {
								var UVI = resultUvi.value.toFixed(1);
								uvIndexEl.text(UVI);
								uvIndexEl.each(function (event) {
									event.preventDefault;
									if (UVI < 3) {
										uvIndexEl.addClass("low");
										uvIndexEl.removeClass("moderate")
										uvIndexEl.removeClass("high")
										uvIndexEl.removeClass("veryHigh")
									} else if (UVI > 3 && UVI < 6) {
										uvIndexEl.addClass("moderate");
										uvIndexEl.removeClass("low")
										uvIndexEl.removeClass("high")
										uvIndexEl.removeClass("veryHigh")
									} else if (UVI > 6 && UVI < 8) {
										uvIndexEl.addClass("high");
										uvIndexEl.removeClass("low")
										uvIndexEl.removeClass("moderate")
										uvIndexEl.removeClass("veryHigh")
									} else {
										uvIndexEl.addClass("veryHigh");
										uvIndexEl.removeClass("low")
										uvIndexEl.removeClass("moderate")
										uvIndexEl.removeClass("high")
									}
								})
							}
							colorCode();
						});
					};
				});
			});
		};
	});
};

// Function - Forecast - 5 days - For Loop 

function forecastCity(userInputCity) {
	var forecastQueryUrl = forecastUrl + "?q=" + userInputCity + units + "&" + APIkey;
	fetch(forecastQueryUrl).then(function (city5Response) {
		if (city5Response.ok) {
			city5Response.json().then(function (response5) {
				var results5 = response5;
				console.log(results5);

				for (i=0; i<5; i++){
			
				var cityTemperature1 = results5.list[((i+1)*8-3)].main.temp.toFixed(0);
				var date1 = results5.list[((i+1)*8-3)].dt;
				var dateNew1 = new Date(dayjs.unix(date1));
				var date1dayjs = dateNew1.toLocaleString("en-US", { weekday: "short", day: "numeric", month: "numeric", year:"numeric" });
				var cityWind1 = results5.list[((i+1)*8-3)].wind.speed.toFixed(0);
				var cityHumidity1 = results5.list[((i+1)*8-3)].main.humidity;
				var weatherIcon1 = results5.list[((i+1)*8-3)].weather[0].icon;
				var iconCompleteUrl1 = iconWeatherUrl + weatherIcon1 + '.png';

				$("#forecastTemperature"+i).text("Temp: " + cityTemperature1 + " °F");
				$("#forecastDate"+i).text(date1dayjs);
				$("#forecastIcon"+i).attr("src", iconCompleteUrl1);
				$("#forecastWind"+i).text("Wind: " + cityWind1 + " mph");
				$("#forecastHumidity"+i).text("Humidity: " + cityHumidity1 + " %");

				}
			})
		}
	})
};

//History Save//
function historySave(userInputCity) {
	historyArr.push(userInputCity);
	localStorage.setItem("cityHistory", JSON.stringify(historyArr));
	searchHistoryEl.empty();
	historyDisplay();
	console.log(historyArr);

}

//History Display//
function historyDisplay() {
	var getHistory = JSON.parse(localStorage.getItem("cityHistory"));
	for (var i = 0; i < getHistory.length; i++) {
		var cityHistoryLi = $('<li>');
		cityHistoryLi.text(getHistory[i]);
		searchHistoryEl.append(cityHistoryLi);
	}
	return (historyArr = getHistory);

};

//Event Listener to Cities saved on History
function historyClick() {
	searchHistoryEl.on("click", "li", function () {

		var cityLi = $(this).text();
		weatherCity(cityLi);
		forecastCity(cityLi);
	})
};


// Clear Button Function - clears history cities
function historyClear() {
	clearHistoryBtn.on("click", function () {
		searchHistoryEl.empty();
		localStorage.clear();
		historyArr = [];
	})
};

init();