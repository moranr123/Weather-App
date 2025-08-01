const apiKey = "facaa74472bdb724f788529a7f42cfae"

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";


const weatherIcon = document.querySelector(".weather-icon");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

document.addEventListener("keydown",function(event){
    if(event.key == "Enter"){
        let cityName = searchInput.value;
        checkWeather(cityName);
    }
})

searchBtn.addEventListener("click",function(){
    checkWeather(searchInput.value);
})

async function checkWeather(city){

 
    const response = await fetch((apiUrl) + city + `&appid=${apiKey}`);

    if(response.status == 404){
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none"

    }else{
       document.querySelector(".error").style.display = "none"; 
   

    var data = await response.json();


    console.log(data);

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = data.main.temp + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
    

    if(data.weather[0].main == "Clouds"){
            weatherIcon.src = "images/clouds.png";
    }else if(data.weather[0].main == "Clear"){
        weatherIcon.src = "images/clear.png";
    }else if(data.weather[0].main == "Rain"){
        weatherIcon.src = "images/rain.png";
    }else if(data.weather[0].main == "Drizzle"){
        weatherIcon.src = "images/drizzle";
    }else if(data.weather[0].main == "Mist"){
        weatherIcon.src = "images/mist.png";
    }
    
    document.querySelector(".weather").style.display = "block";
     }
}