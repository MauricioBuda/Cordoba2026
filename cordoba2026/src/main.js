import "./style.css";

/* ============================================================
   CONFIGURACIÓN GENERAL
   Editá los datos de este archivo. No hace falta modificar el HTML.
   ============================================================ */

const CONFIG = {
  countdownTarget: "2026-11-28T08:00:00-03:00", // 28/11/2026 a las 08:00, UTC-3.
  timezone: "America/Argentina/Cordoba",
  countdownMessages: {
    // Escribí cada mensaje entre comillas. Si lo dejás vacío, no se muestra texto.
    before15Days: "Paciencia amor mio", // Mensaje inicial: hasta que falten 15 días.
    fifteenDays: "Ya menos de 15 días je", // Se muestra al entrar en los últimos 15 días.
    tenDays: "Menos de 10 dias pituca!", // Se muestra al entrar en los últimos 10 días.
    sevenDays: "Una semanita para desconectarrr", // Se muestra al entrar en los últimos 7 días.
    daily: {
      6: "Seeeeeeeeeis", // Cuando falten 6 días.
      5: "Ciiiiiiiiinco", // Cuando falten 5 días.
      4: "Cuaaaaaaaaatro", // Cuando falten 4 días.
      3: "Tres días y nos vamos con picado grueso!", // Cuando falten 3 días.
      2: "Nuestra mente ya está allá", // Cuando falten 2 días.
      1: "Ya estoy viendo los caballitos", // Cuando falte 1 día.
    },
    finished: "Nos fuiiimooooooo", // Mensaje final: la cuenta regresiva llegó a cero.
  },
  weather: {
    // Coordenadas de Villa Berna, departamento Calamuchita, Córdoba.
    latitude: -31.9166667,
    longitude: -64.7355556,
    // Pegá acá tu clave de WeatherAPI.com. Si queda vacía, se usa Open-Meteo.
    // Importante: una clave escrita en JavaScript del navegador queda visible para visitantes.
    weatherApiKey: "",
    weatherApiForecastDays: 3, // Plan gratuito: 3 días. Con un plan de 5+ días, podés cambiarlo a 5.
    refreshEveryMs: 30 * 60 * 1000, // Actualización automática cada 30 minutos.
  },
};

/*
  CALENDARIO: del 28/11/2026 al 06/12/2026.
  Cargá el resumen y las actividades de cada fecha.
  Podés agregar varias actividades dentro de "activities".

  Estructura de cada actividad:
  {
    time: "09:30",                 // Hora (opcional).
    title: "Desayuno",             // Título.
    description: "...",            // Detalle (opcional).
    place: "Nombre del lugar"     // Destino mencionado (opcional).
  }

  Los destinos mencionados acá NO se agregan automáticamente a la grilla.
*/
const calendarDays = [
  { date: "2026-11-28", summary: "", activities: [] },
  { date: "2026-11-29", summary: "", activities: [] },
  { date: "2026-11-30", summary: "", activities: [] },
  { date: "2026-12-01", summary: "", activities: [] },
  { date: "2026-12-02", summary: "", activities: [] },
  { date: "2026-12-03", summary: "", activities: [] },
  { date: "2026-12-04", summary: "", activities: [] },
  { date: "2026-12-05", summary: "", activities: [] },
  { date: "2026-12-06", summary: "", activities: [] },
];

/*
  DESTINOS: esta lista es INDEPENDIENTE del calendario.
  Agregá, quitá o modificá tarjetas manualmente.
  Para cada lugar podés completar:
  - category: por ejemplo "Alojamiento", "Excursión", "Gastronomía".
  - name: nombre que se verá en la tarjeta.
  - description: breve explicación.
  - locationUrl: enlace a Google Maps u otro mapa.
  - websiteUrl: página oficial, redes o sitio relevante.

  El primer elemento es solamente una tarjeta modelo para el alojamiento.
  Reemplazá sus textos y enlaces por los datos reales.
*/
const destinations = [
  {
    id: "alojamiento-villa-berna",
    category: "Alojamiento",
    name: "Alojamiento en Villa Berna",
    description: "Completá este texto con el nombre y los datos del alojamiento.",
    locationUrl: "",
    websiteUrl: "",
  },
];

/* ============================================================
   UTILIDADES
   ============================================================ */

const $ = (selector, parent = document) => parent.querySelector(selector);

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function dateAtNoon(dateString) {
  // El mediodía evita cambios de fecha por diferencias de zona horaria.
  return new Date(`${dateString}T12:00:00-03:00`);
}

function formatDate(dateString, options) {
  return new Intl.DateTimeFormat("es-AR", {
    ...options,
    timeZone: CONFIG.timezone,
  }).format(dateAtNoon(dateString));
}

function isAvailableNumber(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function formatTemperature(value) {
  return isAvailableNumber(value) ? `${Math.round(Number(value))}°` : "—";
}

/* ============================================================
   CUENTA REGRESIVA
   ============================================================ */

const countdownTarget = new Date(CONFIG.countdownTarget);
const countdownElements = {
  days: $("#countdown-days"),
  hours: $("#countdown-hours"),
  minutes: $("#countdown-minutes"),
  seconds: $("#countdown-seconds"),
  message: $("#countdown-message"),
};

const MILLISECONDS_PER_DAY = 86_400_000;

function getCountdownMessage(remainingMs) {
  if (remainingMs <= 0) return CONFIG.countdownMessages.finished;

  // Se usa ceil para que el mensaje cambie al comenzar cada nuevo tramo de 24 horas.
  const daysRemaining = Math.ceil(remainingMs / MILLISECONDS_PER_DAY);
  const messages = CONFIG.countdownMessages;

  if (daysRemaining > 15) return messages.before15Days;
  if (daysRemaining > 10) return messages.fifteenDays;
  if (daysRemaining > 7) return messages.tenDays;
  if (daysRemaining === 7) return messages.sevenDays;

  return messages.daily[daysRemaining] ?? messages.sevenDays;
}

function updateCountdown() {
  const remainingMs = countdownTarget.getTime() - Date.now();

  if (remainingMs <= 0) {
    countdownElements.days.textContent = "0";
    countdownElements.hours.textContent = "00";
    countdownElements.minutes.textContent = "00";
    countdownElements.seconds.textContent = "00";
    countdownElements.message.textContent = getCountdownMessage(remainingMs);
    return;
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  // Los días no llevan ceros a la izquierda: 24 en lugar de 024.
  countdownElements.days.textContent = String(days);
  countdownElements.hours.textContent = String(hours).padStart(2, "0");
  countdownElements.minutes.textContent = String(minutes).padStart(2, "0");
  countdownElements.seconds.textContent = String(seconds).padStart(2, "0");
  countdownElements.message.textContent = getCountdownMessage(remainingMs);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

/* ============================================================
   CLIMA: WEATHERAPI.COM (OPCIONAL) + OPEN-METEO DE RESPALDO
   ============================================================ */

const weatherElements = {
  icon: $("#current-icon"),
  temperature: $("#current-temperature"),
  description: $("#current-description"),
  feelsLike: $("#current-feels-like"),
  humidity: $("#current-humidity"),
  wind: $("#current-wind"),
  status: $("#weather-status"),
  forecast: $("#weather-forecast"),
  refresh: $("#weather-refresh"),
  sourceLink: $("#weather-source-link"),
};

function getWeatherInfo(code, isDay = 1) {
  const weatherConditions = [
    { codes: [0], day: ["☀", "Despejado"], night: ["☾", "Despejado"] },
    { codes: [1], day: ["🌤", "Mayormente despejado"], night: ["☾", "Mayormente despejado"] },
    { codes: [2], day: ["⛅", "Parcialmente nublado"], night: ["☁", "Parcialmente nublado"] },
    { codes: [3], day: ["☁", "Nublado"], night: ["☁", "Nublado"] },
    { codes: [45, 48], day: ["〰", "Niebla"], night: ["〰", "Niebla"] },
    { codes: [51, 53, 55, 56, 57], day: ["🌦", "Llovizna"], night: ["🌧", "Llovizna"] },
    { codes: [61, 63, 65, 66, 67], day: ["🌧", "Lluvia"], night: ["🌧", "Lluvia"] },
    { codes: [71, 73, 75, 77], day: ["❄", "Nieve"], night: ["❄", "Nieve"] },
    { codes: [80, 81, 82], day: ["🌦", "Chaparrones"], night: ["🌧", "Chaparrones"] },
    { codes: [85, 86], day: ["🌨", "Chaparrones de nieve"], night: ["🌨", "Chaparrones de nieve"] },
    { codes: [95, 96, 99], day: ["⛈", "Tormenta"], night: ["⛈", "Tormenta"] },
  ];

  const condition = weatherConditions.find((item) => item.codes.includes(Number(code)));
  if (!condition) return { icon: "·", description: "Estado no disponible" };
  const [icon, description] = Number(isDay) === 1 ? condition.day : condition.night;
  return { icon, description };
}

function getWeatherApiInfo(conditionText, isDay = 1) {
  const text = String(conditionText || "").toLocaleLowerCase("es-AR");
  const day = Number(isDay) === 1;

  if (/torment|thunder/.test(text)) return { icon: "⛈", description: conditionText || "Tormenta" };
  if (/nieve|snow|blizzard|aguanieve|sleet/.test(text)) return { icon: "❄", description: conditionText || "Nieve" };
  if (/llovizna|drizzle/.test(text)) return { icon: day ? "🌦" : "🌧", description: conditionText || "Llovizna" };
  if (/lluvia|rain|chaparr|shower/.test(text)) return { icon: "🌧", description: conditionText || "Lluvia" };
  if (/niebla|neblina|fog|mist|haze/.test(text)) return { icon: "〰", description: conditionText || "Niebla" };
  if (/parcial|partly/.test(text)) return { icon: "⛅", description: conditionText || "Parcialmente nublado" };
  if (/nublado|cloudy|overcast/.test(text)) return { icon: "☁", description: conditionText || "Nublado" };
  if (/despejado|soleado|sunny|clear/.test(text)) return { icon: day ? "☀" : "☾", description: conditionText || "Despejado" };

  return { icon: "·", description: conditionText || "Estado no disponible" };
}

function setWeatherSource(name, url) {
  weatherElements.sourceLink.textContent = name;
  weatherElements.sourceLink.href = url;
}

function formatUpdateTime(date) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CONFIG.timezone,
  }).format(date);
}

function renderOpenMeteoForecast(daily) {
  const forecastCards = daily.time.slice(0, 5).map((date, index) => {
    const weather = getWeatherInfo(daily.weather_code[index]);
    const dayName = formatDate(date, { weekday: "short" });
    const max = formatTemperature(daily.temperature_2m_max[index]);
    const min = formatTemperature(daily.temperature_2m_min[index]);
    const rainProbability = daily.precipitation_probability_max?.[index];
    const rainText = isAvailableNumber(rainProbability)
      ? `Lluvia: ${Math.round(Number(rainProbability))}%`
      : "Lluvia: s/d";

    return `
      <article class="forecast-card">
        <p class="forecast-card__day">${escapeHtml(dayName)}</p>
        <span class="forecast-card__icon" aria-hidden="true">${weather.icon}</span>
        <p class="forecast-card__description">${escapeHtml(weather.description)}</p>
        <div class="forecast-card__temperatures">
          <span>${escapeHtml(max)}</span>
          <span>${escapeHtml(min)}</span>
        </div>
        <p class="forecast-card__rain">${escapeHtml(rainText)}</p>
      </article>
    `;
  });

  weatherElements.forecast.innerHTML = forecastCards.join("");
}

function renderWeatherApiForecast(forecastDays) {
  const forecastCards = forecastDays.slice(0, 5).map((forecastDay) => {
    const day = forecastDay.day;
    const weather = getWeatherApiInfo(day.condition?.text);
    const dayName = formatDate(forecastDay.date, { weekday: "short" });
    const max = formatTemperature(day.maxtemp_c);
    const min = formatTemperature(day.mintemp_c);
    const rainProbability = day.daily_chance_of_rain;
    const rainText = isAvailableNumber(rainProbability)
      ? `Lluvia: ${Math.round(Number(rainProbability))}%`
      : "Lluvia: s/d";

    return `
      <article class="forecast-card">
        <p class="forecast-card__day">${escapeHtml(dayName)}</p>
        <span class="forecast-card__icon" aria-hidden="true">${weather.icon}</span>
        <p class="forecast-card__description">${escapeHtml(weather.description)}</p>
        <div class="forecast-card__temperatures">
          <span>${escapeHtml(max)}</span>
          <span>${escapeHtml(min)}</span>
        </div>
        <p class="forecast-card__rain">${escapeHtml(rainText)}</p>
      </article>
    `;
  });

  weatherElements.forecast.innerHTML = forecastCards.join("");
}

function renderOpenMeteoCurrent(current) {
  const weather = getWeatherInfo(current.weather_code, current.is_day);
  weatherElements.icon.textContent = weather.icon;
  weatherElements.temperature.textContent = formatTemperature(current.temperature_2m);
  weatherElements.description.textContent = weather.description;
  weatherElements.feelsLike.textContent = formatTemperature(current.apparent_temperature);
  weatherElements.humidity.textContent = isAvailableNumber(current.relative_humidity_2m)
    ? `${Math.round(Number(current.relative_humidity_2m))}%`
    : "—";
  weatherElements.wind.textContent = isAvailableNumber(current.wind_speed_10m)
    ? `${Math.round(Number(current.wind_speed_10m))} km/h`
    : "—";
}

function renderWeatherApiCurrent(current) {
  const weather = getWeatherApiInfo(current.condition?.text, current.is_day);
  weatherElements.icon.textContent = weather.icon;
  weatherElements.temperature.textContent = formatTemperature(current.temp_c);
  weatherElements.description.textContent = weather.description;
  weatherElements.feelsLike.textContent = formatTemperature(current.feelslike_c);
  weatherElements.humidity.textContent = isAvailableNumber(current.humidity)
    ? `${Math.round(Number(current.humidity))}%`
    : "—";
  weatherElements.wind.textContent = isAvailableNumber(current.wind_kph)
    ? `${Math.round(Number(current.wind_kph))} km/h`
    : "—";
}

function buildOpenMeteoUrl() {
  const parameters = new URLSearchParams({
    latitude: String(CONFIG.weather.latitude),
    longitude: String(CONFIG.weather.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: CONFIG.timezone,
    forecast_days: "5",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
  });

  return `https://api.open-meteo.com/v1/forecast?${parameters.toString()}`;
}

function buildWeatherApiUrl() {
  const parameters = new URLSearchParams({
    key: CONFIG.weather.weatherApiKey.trim(),
    q: `${CONFIG.weather.latitude},${CONFIG.weather.longitude}`,
    days: String(CONFIG.weather.weatherApiForecastDays),
    aqi: "no",
    alerts: "no",
    lang: "es",
  });

  return `https://api.weatherapi.com/v1/forecast.json?${parameters.toString()}`;
}

async function fetchWeatherJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `El servicio respondió con estado ${response.status}.`);
  }

  return data;
}

async function loadWeatherFromWeatherApi() {
  const data = await fetchWeatherJson(buildWeatherApiUrl());
  const apiForecastDays = data.forecast?.forecastday;

  if (!data.current || !Array.isArray(apiForecastDays) || apiForecastDays.length < 3) {
    throw new Error("WeatherAPI no devolvió las condiciones actuales y los tres días disponibles en el plan gratuito.");
  }

  let forecastDays = apiForecastDays.slice(0, 5);
  let usedOpenMeteoExtension = false;

  // El plan gratuito de WeatherAPI entrega 3 días. Completamos los 2 restantes
  // con Open-Meteo. Si la cuenta permite 5 días, no hace falta esta segunda fuente.
  if (forecastDays.length < 5) {
    const openData = await fetchWeatherJson(buildOpenMeteoUrl());
    if (!openData.daily || !Array.isArray(openData.daily.time) || openData.daily.time.length < 5) {
      throw new Error("No se pudo completar el pronóstico de cinco días.");
    }

    const datesAlreadyIncluded = new Set(forecastDays.map((forecastDay) => forecastDay.date));
    const extraDays = openData.daily.time
      .map((date, index) => ({
        date,
        day: {
          condition: { text: getWeatherInfo(openData.daily.weather_code[index]).description },
          maxtemp_c: openData.daily.temperature_2m_max[index],
          mintemp_c: openData.daily.temperature_2m_min[index],
          daily_chance_of_rain: openData.daily.precipitation_probability_max?.[index],
        },
      }))
      .filter((forecastDay) => !datesAlreadyIncluded.has(forecastDay.date));

    forecastDays = [...forecastDays, ...extraDays].slice(0, 5);
    usedOpenMeteoExtension = true;
  }

  if (forecastDays.length < 5) {
    throw new Error("No se pudieron reunir cinco días completos de pronóstico.");
  }

  renderWeatherApiCurrent(data.current);
  renderWeatherApiForecast(forecastDays);
  setWeatherSource(
    usedOpenMeteoExtension ? "WeatherAPI.com + Open-Meteo" : "WeatherAPI.com",
    "https://www.weatherapi.com/",
  );

  const updateDate = isAvailableNumber(data.current.last_updated_epoch)
    ? new Date(Number(data.current.last_updated_epoch) * 1000)
    : new Date();
  const sourceNote = usedOpenMeteoExtension ? " · últimos días desde Open-Meteo" : "";
  weatherElements.status.textContent = `Actualizado a las ${formatUpdateTime(updateDate)}${sourceNote}`;
}

async function loadWeatherFromOpenMeteo(statusPrefix = "") {
  const data = await fetchWeatherJson(buildOpenMeteoUrl());

  if (!data.current || !data.daily || !Array.isArray(data.daily.time) || data.daily.time.length < 5) {
    throw new Error("Open-Meteo no devolvió los cinco días solicitados.");
  }

  renderOpenMeteoCurrent(data.current);
  renderOpenMeteoForecast(data.daily);
  setWeatherSource("Open-Meteo", "https://open-meteo.com/");

  const updateDate = data.current.time
    ? new Date(`${data.current.time}:00-03:00`)
    : new Date();
  const prefix = statusPrefix ? `${statusPrefix} · ` : "";
  weatherElements.status.textContent = `${prefix}Actualizado a las ${formatUpdateTime(updateDate)}`;
}

async function loadWeather() {
  weatherElements.refresh.disabled = true;
  weatherElements.status.textContent = "Actualizando pronóstico…";

  try {
    if (CONFIG.weather.weatherApiKey.trim()) {
      try {
        await loadWeatherFromWeatherApi();
        return;
      } catch (weatherApiError) {
        console.warn("WeatherAPI no respondió; se utilizará Open-Meteo como respaldo:", weatherApiError);
        await loadWeatherFromOpenMeteo("Respaldo Open-Meteo");
        return;
      }
    }

    await loadWeatherFromOpenMeteo();
  } catch (error) {
    console.error("No se pudo cargar el pronóstico:", error);
    weatherElements.status.textContent = "No se pudo actualizar el pronóstico.";
    weatherElements.forecast.innerHTML =
      '<p class="weather-placeholder">No hay datos meteorológicos disponibles en este momento. Revisá tu conexión o volvé a intentar con el botón de actualización.</p>';
    weatherElements.description.textContent = "Clima no disponible";
  } finally {
    weatherElements.refresh.disabled = false;
  }
}

weatherElements.refresh.addEventListener("click", loadWeather);
loadWeather();
window.setInterval(loadWeather, CONFIG.weather.refreshEveryMs);

/* ============================================================
   CALENDARIO Y VENTANA DE DETALLE
   ============================================================ */

const calendarGrid = $("#calendar-grid");
const dayModal = $("#day-modal");
const modalDialog = $(".day-modal__dialog", dayModal);
const modalTitle = $("#modal-title");
const modalDate = $("#modal-date");
const modalContent = $("#modal-content");
const modalCloseButton = $("#modal-close");
const confettiLayer = $("#confetti-layer");
let lastFocusedElement = null;

function renderCalendar() {
  calendarGrid.innerHTML = calendarDays
    .map((day) => {
      const date = dateAtNoon(day.date);
      const weekday = formatDate(day.date, { weekday: "long" });
      const month = formatDate(day.date, { month: "long", year: "numeric" });
      const dayNumber = String(date.getUTCDate()).padStart(2, "0");
      const activityCount = Array.isArray(day.activities) ? day.activities.length : 0;
      const summary = day.summary?.trim()
        ? day.summary
        : activityCount > 0
          ? `${activityCount} ${activityCount === 1 ? "actividad" : "actividades"} planificadas`
          : "Todavía no cargaste actividades para este día.";

      return `
        <button
          class="day-card"
          type="button"
          data-date="${escapeHtml(day.date)}"
          aria-label="Abrir el detalle del ${escapeHtml(weekday)} ${dayNumber}"
        >
          <span class="day-card__top">
            <span class="day-card__weekday">${escapeHtml(weekday)}</span>
            <span class="day-card__number">${escapeHtml(dayNumber)}</span>
          </span>
          <span class="day-card__month">${escapeHtml(month)}</span>
          <span class="day-card__summary">${escapeHtml(summary)}</span>
          <span class="day-card__hint">Ver detalle +</span>
        </button>
      `;
    })
    .join("");

  calendarGrid.querySelectorAll("[data-date]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedDay = calendarDays.find((day) => day.date === button.dataset.date);
      if (selectedDay) openDayModal(selectedDay, button);
    });
  });
}

function renderDayDetails(day) {
  const safeSummary = day.summary?.trim()
    ? `<p class="modal-summary">${escapeHtml(day.summary)}</p>`
    : "";
  const activities = Array.isArray(day.activities) ? day.activities : [];

  if (activities.length === 0) {
    return `${safeSummary}<p class="modal-empty">Todavía no cargaste actividades para este día. Para agregar el itinerario, editá el arreglo <strong>calendarDays</strong> en el archivo <strong>main.js</strong>.</p>`;
  }

  const activityMarkup = activities
    .map((activity) => {
      const time = activity.time?.trim()
        ? `<p class="modal-activity__time">${escapeHtml(activity.time)}</p>`
        : "";
      const title = activity.title?.trim() || "Actividad";
      const description = activity.description?.trim()
        ? `<p class="modal-activity__description">${escapeHtml(activity.description)}</p>`
        : "";
      const place = activity.place?.trim()
        ? `<p class="modal-activity__place">Lugar: ${escapeHtml(activity.place)}</p>`
        : "";

      return `
        <article class="modal-activity">
          ${time}
          <h3>${escapeHtml(title)}</h3>
          ${description}
          ${place}
        </article>
      `;
    })
    .join("");

  return `${safeSummary}<div class="modal-activity-list">${activityMarkup}</div>`;
}

let confettiCleanupTimer = null;

function clearConfetti() {
  if (confettiCleanupTimer !== null) {
    window.clearTimeout(confettiCleanupTimer);
    confettiCleanupTimer = null;
  }
  confettiLayer.innerHTML = "";
}

function launchConfetti() {
  clearConfetti();

  const colors = ["#f3d58b", "#f5f1e6", "#d98a70", "#9fc2a4", "#a9c6db", "#d7a9d4"];
  const shapes = ["", "", "confetti-piece--circle", "confetti-piece--ribbon", "confetti-piece--star"];
  const fragment = document.createDocumentFragment();

  // 300 piezas en varias tandas, en lugar de las 72 originales.
  for (let index = 0; index < 300; index += 1) {
    const piece = document.createElement("span");
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const isStar = shape === "confetti-piece--star";
    const spinDirection = Math.random() < 0.5 ? -1 : 1;
    const spin = spinDirection * (540 + Math.random() * 1800);

    piece.className = `confetti-piece ${shape}`.trim();
    if (isStar) piece.textContent = "✦";

    piece.style.setProperty("--left", `${Math.random() * 100}%`);
    piece.style.setProperty("--size", `${6 + Math.random() * 11}px`);
    piece.style.setProperty("--spawn-offset", `${Math.random() * 90}px`);
    piece.style.setProperty("--delay", `${Math.random() * 1.8 + (index % 3) * 0.12}s`);
    piece.style.setProperty("--duration", `${3 + Math.random() * 2}s`);
    piece.style.setProperty("--rotate", `${Math.random() * 360}deg`);
    piece.style.setProperty("--mid-spin", `${spin * 0.48}deg`);
    piece.style.setProperty("--spin", `${spin}deg`);
    piece.style.setProperty("--mid-drift", `${-110 + Math.random() * 220}px`);
    piece.style.setProperty("--drift", `${-260 + Math.random() * 520}px`);
    piece.style.setProperty("--piece-color", colors[Math.floor(Math.random() * colors.length)]);
    fragment.appendChild(piece);
  }

  confettiLayer.appendChild(fragment);
  confettiCleanupTimer = window.setTimeout(clearConfetti, 7_400);
}

function openDayModal(day, triggerElement) {
  lastFocusedElement = triggerElement;
  modalDate.textContent = formatDate(day.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  modalTitle.textContent = "Itinerario del día";
  modalContent.innerHTML = renderDayDetails(day);
  dayModal.hidden = false;
  document.body.classList.add("modal-open");
  launchConfetti();
  modalCloseButton.focus();
}

function closeDayModal() {
  if (dayModal.hidden) return;
  dayModal.hidden = true;
  document.body.classList.remove("modal-open");
  clearConfetti();
  if (lastFocusedElement) lastFocusedElement.focus();
}

modalCloseButton.addEventListener("click", closeDayModal);
$("[data-close-modal]", dayModal).addEventListener("click", closeDayModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDayModal();

  if (event.key === "Tab" && !dayModal.hidden) {
    const focusableElements = modalDialog.querySelectorAll("button, a[href], [tabindex]:not([tabindex='-1'])");
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});

renderCalendar();

/* ============================================================
   GRILLA DE DESTINOS (INDEPENDIENTE DEL CALENDARIO)
   ============================================================ */

function renderDestinations() {
  const destinationsGrid = $("#destinations-grid");

  if (destinations.length === 0) {
    destinationsGrid.innerHTML =
      '<p class="empty-state">Todavía no cargaste destinos. Agregalos en el arreglo <strong>destinations</strong> de main.js.</p>';
    return;
  }

  destinationsGrid.innerHTML = destinations
    .map((destination) => {
      const links = [];
      if (destination.locationUrl?.trim()) {
        links.push(
          `<a class="destination-link" href="${escapeHtml(destination.locationUrl)}" target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a>`,
        );
      }
      if (destination.websiteUrl?.trim()) {
        links.push(
          `<a class="destination-link" href="${escapeHtml(destination.websiteUrl)}" target="_blank" rel="noopener noreferrer">Abrir página ↗</a>`,
        );
      }

      return `
        <article class="destination-card">
          <p class="destination-card__category">${escapeHtml(destination.category || "Lugar")}</p>
          <h3>${escapeHtml(destination.name || "Destino sin nombre")}</h3>
          <p class="destination-card__description">${escapeHtml(destination.description || "")}</p>
          ${
            links.length > 0
              ? `<div class="destination-card__links">${links.join("")}</div>`
              : '<p class="destination-card__no-links">Todavía no hay enlaces cargados.</p>'
          }
        </article>
      `;
    })
    .join("");
}

renderDestinations();
