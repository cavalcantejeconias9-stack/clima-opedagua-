const weatherCodeMap = {
  0: { label: 'Céu limpo', icon: '☀️' }, 1: { label: 'Principalmente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' }, 3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Nevoeiro', icon: '🌫️' }, 48: { label: 'Nevoeiro com geada', icon: '🌫️' },
  51: { label: 'Chuvisca leve', icon: '🌦️' }, 53: { label: 'Chuvisca moderada', icon: '🌦️' },
  55: { label: 'Chuvisca intensa', icon: '🌧️' }, 56: { label: 'Chuvisca gelada leve', icon: '🌧️' },
  57: { label: 'Chuvisca gelada intensa', icon: '🌧️' }, 61: { label: 'Chuva leve', icon: '🌦️' },
  63: { label: 'Chuva moderada', icon: '🌧️' }, 65: { label: 'Chuva forte', icon: '🌧️' },
  66: { label: 'Chuva gelada leve', icon: '🌧️' }, 67: { label: 'Chuva gelada forte', icon: '🌧️' },
  71: { label: 'Neve leve', icon: '🌨️' }, 73: { label: 'Neve moderada', icon: '❄️' },
  75: { label: 'Neve forte', icon: '❄️' }, 77: { label: 'Granizo', icon: '🌨️' },
  80: { label: 'Pancadas leves', icon: '🌦️' }, 81: { label: 'Pancadas moderadas', icon: '🌧️' },
  82: { label: 'Pancadas fortes', icon: '⛈️' }, 85: { label: 'Neve em pancadas', icon: '🌨️' },
  86: { label: 'Neve forte em pancadas', icon: '❄️' }, 95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo', icon: '⛈️' }, 99: { label: 'Trovoada severa', icon: '⛈️' }
};

const $ = (selector) => document.querySelector(selector);
const dateText = $('#dateText');
const cityName = $('#cityName');
const temperature = $('#temperature');
const conditionText = $('#conditionText');
const conditionTag = $('#conditionTag');
const weatherIcon = $('#weatherIcon');
const feelsLike = $('#feelsLike');
const humidity = $('#humidity');
const wind = $('#wind');
const tempRange = $('#tempRange');
const forecastList = $('#forecastList');
const searchForm = $('#searchForm');
const cityInput = $('#cityInput');
const locationButton = $('#locationButton');
const statusMessage = $('#statusMessage');
const themeButton = $('#themeButton');
const themeIcon = $('#themeIcon');
const installButton = $('#installButton');

const setStatus = (message = '') => { statusMessage.textContent = message; };
const formatDay = (value) => new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
const formatTemp = (value) => Number.isFinite(Number(value)) ? `${Math.round(Number(value))}°` : '--°';

const setConditionMeta = (code) => {
  const info = weatherCodeMap[code] || { label: 'Clima variável', icon: '🌤️' };
  conditionText.textContent = info.label;
  conditionTag.textContent = info.label;
  weatherIcon.textContent = info.icon;
  weatherIcon.setAttribute('aria-label', info.label);
};

const renderForecast = (daily) => {
  forecastList.replaceChildren();
  const template = $('#forecastItemTemplate');
  const days = daily.time || [];
  days.forEach((day, index) => {
    const clone = template.content.cloneNode(true);
    const code = Number(daily.weather_code?.[index]);
    const info = weatherCodeMap[code] || { label: 'Clima variável', icon: '🌤️' };
    clone.querySelector('.forecast-day').textContent = index === 0 ? 'Hoje' : formatDay(day);
    clone.querySelector('.forecast-icon').textContent = info.icon;
    clone.querySelector('.forecast-temp').textContent = `${formatTemp(daily.temperature_2m_max?.[index])} / ${formatTemp(daily.temperature_2m_min?.[index])}`;
    forecastList.appendChild(clone);
  });
};

const updateCurrentWeather = (data, locationLabel) => {
  if (!data.current || !data.daily) throw new Error('A resposta do clima está incompleta.');
  const current = data.current;
  const daily = data.daily;
  cityName.textContent = locationLabel;
  dateText.textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
  temperature.textContent = formatTemp(current.temperature_2m);
  setConditionMeta(current.weather_code);
  feelsLike.textContent = formatTemp(current.apparent_temperature);
  humidity.textContent = `${Math.round(current.relative_humidity_2m ?? 0)}%`;
  wind.textContent = `${Math.round(current.wind_speed_10m ?? 0)} km/h`;
  tempRange.textContent = `${formatTemp(daily.temperature_2m_max?.[0])} / ${formatTemp(daily.temperature_2m_min?.[0])}`;
  renderForecast(daily);
};

const fetchWeather = async (latitude, longitude, locationLabel, signal) => {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude, longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto', forecast_days: '5'
  }).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Não foi possível buscar a previsão do tempo. Tente novamente.');
  updateCurrentWeather(await response.json(), locationLabel);
};

let activeController;
const searchByCity = async (city) => {
  activeController?.abort();
  activeController = new AbortController();
  const { signal } = activeController;
  const params = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal });
  if (!response.ok) throw new Error('Não foi possível pesquisar essa cidade.');
  const result = (await response.json()).results?.[0];
  if (!result) throw new Error('Nenhuma cidade encontrada com esse nome.');
  const label = [result.name, result.admin1, result.country].filter(Boolean).filter((value, index, list) => list.indexOf(value) === index).join(', ');
  await fetchWeather(result.latitude, result.longitude, label, signal);
};

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) { cityInput.focus(); setStatus('Digite o nome de uma cidade.'); return; }
  cityInput.disabled = true;
  setStatus('Buscando previsão...');
  try { await searchByCity(city); setStatus(''); }
  catch (error) { if (error.name !== 'AbortError') setStatus(error.message || 'Erro ao carregar o clima.'); }
  finally { cityInput.disabled = false; }
});

locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) { setStatus('Seu navegador não oferece geolocalização.'); return; }
  setStatus('Obtendo sua localização...');
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try { await fetchWeather(coords.latitude, coords.longitude, 'Minha localização'); setStatus(''); }
    catch (error) { setStatus(error.message || 'Não foi possível carregar o clima.'); }
  }, () => setStatus('Localização indisponível. Você pode buscar uma cidade.'), { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
});

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeButton.setAttribute('aria-label', isDark ? 'Ativar tema claro' : 'Ativar tema escuro');
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#071827' : '#eaf5ff';
  try { localStorage.setItem('clima-theme', theme); } catch { /* armazenamento opcional */ }
};
let savedTheme;
try { savedTheme = localStorage.getItem('clima-theme'); } catch { savedTheme = null; }
setTheme(savedTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

let installPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});
window.addEventListener('appinstalled', () => { installButton.hidden = true; setStatus('Aplicativo instalado.'); });

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => setStatus('Modo offline indisponível neste momento.')));
}

searchByCity('Lisboa').catch((error) => {
  if (error.name !== 'AbortError') {
    cityName.textContent = 'Lisboa';
    conditionText.textContent = 'Não foi possível carregar';
    conditionTag.textContent = 'Sem conexão';
    weatherIcon.textContent = '⚠️';
    setStatus(error.message || 'Verifique sua conexão e tente novamente.');
  }
});
