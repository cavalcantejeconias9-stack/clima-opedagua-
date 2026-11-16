const weatherCodeMap = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Principalmente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Nevoeiro', icon: '🌫️' },
  48: { label: 'Nevoeiro com geada', icon: '🌫️' },
  51: { label: 'Chuvisca leve', icon: '🌦️' },
  53: { label: 'Chuvisca moderada', icon: '🌦️' },
  55: { label: 'Chuvisca intensa', icon: '🌧️' },
  56: { label: 'Chuvisca gelada leve', icon: '🌧️' },
  57: { label: 'Chuvisca gelada intensa', icon: '🌧️' },
  61: { label: 'Chuva leve', icon: '🌦️' },
  63: { label: 'Chuva moderada', icon: '🌧️' },
  65: { label: 'Chuva forte', icon: '🌧️' },
  66: { label: 'Chuva gelada leve', icon: '🌧️' },
  67: { label: 'Chuva gelada forte', icon: '🌧️' },
  71: { label: 'Neve leve', icon: '🌨️' },
  73: { label: 'Neve moderada', icon: '❄️' },
  75: { label: 'Neve forte', icon: '❄️' },
  77: { label: 'Granizo', icon: '🌨️' },
  80: { label: 'Pancadas leves', icon: '🌦️' },
  81: { label: 'Pancadas moderadas', icon: '🌧️' },
  82: { label: 'Pancadas fortes', icon: '⛈️' },
  85: { label: 'Neve em pancadas', icon: '🌨️' },
  86: { label: 'Neve forte em pancadas', icon: '❄️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo', icon: '⛈️' },
  99: { label: 'Trovoada severa', icon: '⛈️' }
};

const dateText = document.querySelector('#dateText');
const cityName = document.querySelector('#cityName');
const temperature = document.querySelector('#temperature');
const conditionText = document.querySelector('#conditionText');
const conditionTag = document.querySelector('#conditionTag');
const weatherIcon = document.querySelector('#weatherIcon');
const feelsLike = document.querySelector('#feelsLike');
const humidity = document.querySelector('#humidity');
const wind = document.querySelector('#wind');
const tempRange = document.querySelector('#tempRange');
const forecastList = document.querySelector('#forecastList');
const searchForm = document.querySelector('#searchForm');
const cityInput = document.querySelector('#cityInput');
const locationButton = document.querySelector('#locationButton');

const formatDay = (value) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit' }).format(date);
};

const setConditionMeta = (code) => {
  const info = weatherCodeMap[code] || { label: 'Clima variável', icon: '🌤️' };
  conditionText.textContent = info.label;
  conditionTag.textContent = info.label;
  weatherIcon.textContent = info.icon;
};

const renderForecast = (days) => {
  forecastList.innerHTML = '';

  days.forEach((day) => {
    const template = document.querySelector('#forecastItemTemplate');
    const clone = template.content.cloneNode(true);
    const dayNode = clone.querySelector('.forecast-day');
    const iconNode = clone.querySelector('.forecast-icon');
    const tempNode = clone.querySelector('.forecast-temp');

    const code = day.weather_code;
    const info = weatherCodeMap[code] || { label: 'Clima variável', icon: '🌤️' };

    dayNode.textContent = formatDay(day.date);
    iconNode.textContent = info.icon;
    tempNode.textContent = `${Math.round(day.temperature_2m_max)}° / ${Math.round(day.temperature_2m_min)}°`;

    forecastList.appendChild(clone);
  });
};

const updateCurrentWeather = (data, locationName) => {
  const current = data.current;
  const daily = data.daily;

  cityName.textContent = locationName;
  dateText.textContent = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  }).format(new Date());

  temperature.textContent = `${Math.round(current.temperature_2m)}°`;
  setConditionMeta(current.weather_code);
  feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
  humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  tempRange.textContent = `${Math.round(daily.temperature_2m_max[0])}° / ${Math.round(daily.temperature_2m_min[0])}°`;

  renderForecast(daily);
};

const fetchWeather = async (latitude, longitude, locationName) => {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

  const response = await fetch(weatherUrl);
  if (!response.ok) {
    throw new Error('Não foi possível buscar a previsão do tempo.');
  }

  const data = await response.json();
  updateCurrentWeather(data, locationName);
};

const searchByCity = async (city) => {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
  const response = await fetch(geocodeUrl);

  if (!response.ok) {
    throw new Error('Cidade não encontrada.');
  }

  const data = await response.json();
  const result = data.results?.[0];

  if (!result) {
    throw new Error('Nenhuma cidade encontrada com esse nome.');
  }

  await fetchWeather(result.latitude, result.longitude, `${result.name}, ${result.country}`);
};

const handleSearch = async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    cityInput.focus();
    return;
  }

  try {
    cityInput.disabled = true;
    cityInput.value = city;
    await searchByCity(city);
  } catch (error) {
    alert(error.message || 'Erro ao carregar o clima.');
  } finally {
    cityInput.disabled = false;
  }
};

const useUserLocation = () => {
  if (!navigator.geolocation) {
    alert('Seu navegador não suporta geolocalização.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      await fetchWeather(latitude, longitude, 'Minha localização');
    },
    () => {
      alert('Não foi possível obter sua localização. Tente buscar por cidade.');
    }
  );
};

searchForm.addEventListener('submit', handleSearch);
locationButton.addEventListener('click', useUserLocation);

searchByCity('Lisboa').catch(() => {
  cityInput.value = 'Lisboa';
  cityName.textContent = 'Lisboa';
  temperature.textContent = '--°';
  conditionText.textContent = 'Não foi possível carregar';
  conditionTag.textContent = 'Erro';
  weatherIcon.textContent = '⚠️';
});
