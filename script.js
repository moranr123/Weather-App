const apiKey = "facaa74472bdb724f788529a7f42cfae";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=";

// DOM elements
const weatherIcon = document.querySelector(".weather-icon");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const unitToggle = document.getElementById("unitToggle");
const forecastContainer = document.getElementById("forecastContainer");

// State variables
let currentUnit = 'celsius';
let currentWeatherData = null;

// Event listeners
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const cityName = searchInput.value.trim();
        if (cityName) {
            checkWeather(cityName);
        }
    }
});

searchBtn.addEventListener("click", function() {
    const cityName = searchInput.value.trim();
    if (cityName) {
        checkWeather(cityName);
    }
});

locationBtn.addEventListener("click", function() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                checkWeatherByCoords(latitude, longitude);
            },
            (error) => {
                hideLoading();
                showError("Unable to get your location. Please try searching for a city.");
            }
        );
    } else {
        showError("Geolocation is not supported by this browser.");
    }
});

unitToggle.addEventListener("click", function() {
    currentUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    unitToggle.textContent = currentUnit === 'celsius' ? '°C' : '°F';
    
    if (currentWeatherData) {
        updateWeatherDisplay(currentWeatherData);
    }
});

// Utility functions
function showLoading() {
    document.querySelector(".loading").style.display = "block";
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error").style.display = "none";
}

function hideLoading() {
    document.querySelector(".loading").style.display = "none";
}

function showError(message) {
    hideLoading();
    document.querySelector(".error").style.display = "block";
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error p").textContent = message;
}

function hideError() {
    document.querySelector(".error").style.display = "none";
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

function getWeatherIcon(weatherMain, weatherDesc) {
    const weatherIcons = {
        'Clear': 'clear.png',
        'Clouds': 'clouds.png',
        'Rain': 'rain.png',
        'Drizzle': 'drizzle.png',
        'Thunderstorm': 'rain.png',
        'Snow': 'snow.png',
        'Mist': 'mist.png',
        'Smoke': 'mist.png',
        'Haze': 'mist.png',
        'Dust': 'mist.png',
        'Fog': 'mist.png',
        'Sand': 'mist.png',
        'Ash': 'mist.png',
        'Squall': 'wind.png',
        'Tornado': 'wind.png'
    };
    
    return `images/${weatherIcons[weatherMain] || 'clear.png'}`;
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// API functions
async function checkWeather(city) {
    showLoading();
    hideError();
    
    try {
        const response = await fetch(`${weatherApiUrl}${city}&appid=${apiKey}`);
        
        if (response.status === 404) {
            showError("City not found. Please check the spelling and try again.");
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentWeatherData = data;
        
        // Get forecast data
        const forecastResponse = await fetch(`${forecastApiUrl}${city}&appid=${apiKey}`);
        const forecastData = await forecastResponse.json();
        
        updateWeatherDisplay(data, forecastData);
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError("Failed to fetch weather data. Please try again.");
    }
}

async function checkWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`${weatherApiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        currentWeatherData = data;
        
        // Get forecast data
        const forecastResponse = await fetch(`${forecastApiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const forecastData = await forecastResponse.json();
        
        updateWeatherDisplay(data, forecastData);
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError("Failed to fetch weather data. Please try again.");
    }
}

function updateWeatherDisplay(weatherData, forecastData = null) {
    const weather = document.querySelector(".weather");
    
    // Update current weather
    document.querySelector(".city").textContent = weatherData.name;
    document.querySelector(".weather-desc").textContent = weatherData.weather[0].description;
    document.querySelector(".date-time").textContent = formatTime(weatherData.dt);
    
    // Update temperature
    const temp = currentUnit === 'celsius' ? weatherData.main.temp : celsiusToFahrenheit(weatherData.main.temp);
    document.querySelector(".temp").textContent = `${Math.round(temp)}°${currentUnit === 'celsius' ? 'c' : 'f'}`;
    
    // Update weather icon
    weatherIcon.src = getWeatherIcon(weatherData.weather[0].main, weatherData.weather[0].description);
    
    // Update weather details
    const feelsLike = currentUnit === 'celsius' ? weatherData.main.feels_like : celsiusToFahrenheit(weatherData.main.feels_like);
    document.querySelector(".feels-like").textContent = `Feels like ${Math.round(feelsLike)}°${currentUnit === 'celsius' ? 'c' : 'f'}`;
    document.querySelector(".humidity").textContent = `${weatherData.main.humidity}%`;
    document.querySelector(".wind").textContent = `${weatherData.wind.speed} km/h`;
    document.querySelector(".visibility").textContent = `${(weatherData.visibility / 1000).toFixed(1)} km`;
    document.querySelector(".pressure").textContent = `${weatherData.main.pressure} hPa`;
    
    // Calculate UV index (simplified - in real app you'd need a separate UV API)
    const uvIndex = Math.round((weatherData.main.temp + 20) / 10);
    document.querySelector(".uv-index").textContent = uvIndex;
    
    // Update forecast if available
    if (forecastData) {
        updateForecast(forecastData);
    }
    
    // Show weather with animation
    weather.style.display = "block";
    weather.classList.add("fade-in");
    
    setTimeout(() => {
        weather.classList.remove("fade-in");
    }, 500);
}

function updateForecast(forecastData) {
    forecastContainer.innerHTML = '';
    
    // Group forecast by day and get daily data
    const dailyData = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });
    
    // Get next 5 days
    const days = Object.keys(dailyData).slice(0, 5);
    
    days.forEach((day, index) => {
        const dayData = dailyData[day];
        const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
        const maxTemp = Math.max(...dayData.map(item => item.main.temp));
        const minTemp = Math.min(...dayData.map(item => item.main.temp));
        const mostFrequentWeather = getMostFrequentWeather(dayData);
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item slide-in';
        forecastItem.style.animationDelay = `${index * 0.1}s`;
        
        const tempRange = currentUnit === 'celsius' 
            ? `${Math.round(minTemp)}° - ${Math.round(maxTemp)}°`
            : `${Math.round(celsiusToFahrenheit(minTemp))}° - ${Math.round(celsiusToFahrenheit(maxTemp))}°`;
        
        forecastItem.innerHTML = `
            <img src="${getWeatherIcon(mostFrequentWeather.main, mostFrequentWeather.description)}" alt="${mostFrequentWeather.description}">
            <div class="day">${formatDate(dayData[0].dt)}</div>
            <div class="temp-range">${tempRange}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

function getMostFrequentWeather(dayData) {
    const weatherCount = {};
    dayData.forEach(item => {
        const weather = item.weather[0].main;
        weatherCount[weather] = (weatherCount[weather] || 0) + 1;
    });
    
    const mostFrequent = Object.keys(weatherCount).reduce((a, b) => 
        weatherCount[a] > weatherCount[b] ? a : b
    );
    
    return dayData.find(item => item.weather[0].main === mostFrequent).weather[0];
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Try to get user's location as default
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                checkWeatherByCoords(latitude, longitude);
            },
            (error) => {
                // If geolocation fails, fall back to a default city
                console.log('Geolocation failed, using default city');
                checkWeather("New York");
            }
        );
    } else {
        // If geolocation is not supported, use a default city
        console.log('Geolocation not supported, using default city');
        checkWeather("New York");
    }
});