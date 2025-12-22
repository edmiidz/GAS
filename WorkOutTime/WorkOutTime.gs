/**
 * WorkOutTime - Weather-based workout calendar automation
 *
 * Creates a "Work Out and Podcast listening" event at 11am when:
 * - Temperature is 7°C or higher
 * - Precipitation probability is less than 10%
 *
 * Location: Vancouver, BC (V6N 2P5 area)
 * Weather API: Open-Meteo (free, no API key required)
 */

// Vancouver, BC coordinates (V6N 2P5 - Kerrisdale area)
const LATITUDE = 49.2270;
const LONGITUDE = -123.1572;
const TIMEZONE = "America/Vancouver";

// Weather thresholds
const MIN_TEMPERATURE_C = 7;
const MAX_PRECIPITATION_PROBABILITY = 10; // percentage

// Event settings
const EVENT_TITLE = "Work Out and Podcast listening";
const EVENT_HOUR = 11; // 11am
const EVENT_DURATION_MINUTES = 60;

/**
 * Main function - Check weather and create event if conditions are good
 * Set this up with a daily trigger (e.g., 7am)
 */
function checkWeatherAndCreateEvent() {
  const weather = getWeatherForecast();

  if (!weather) {
    Logger.log("Failed to fetch weather data");
    return;
  }

  Logger.log(`Today's forecast for Vancouver:`);
  Logger.log(`  Temperature: ${weather.temperature}°C`);
  Logger.log(`  Precipitation probability: ${weather.precipitationProbability}%`);

  const isGoodWeather = weather.temperature >= MIN_TEMPERATURE_C &&
                         weather.precipitationProbability < MAX_PRECIPITATION_PROBABILITY;

  if (isGoodWeather) {
    Logger.log("Weather conditions are good! Creating workout event...");
    createWorkoutEvent();
  } else {
    Logger.log("Weather conditions not met. No event created.");
    if (weather.temperature < MIN_TEMPERATURE_C) {
      Logger.log(`  - Temperature ${weather.temperature}°C is below minimum ${MIN_TEMPERATURE_C}°C`);
    }
    if (weather.precipitationProbability >= MAX_PRECIPITATION_PROBABILITY) {
      Logger.log(`  - Precipitation probability ${weather.precipitationProbability}% is >= ${MAX_PRECIPITATION_PROBABILITY}%`);
    }
  }
}

/**
 * Fetch weather forecast from Open-Meteo API
 * Returns temperature and precipitation probability for today around 11am
 */
function getWeatherForecast() {
  // Open-Meteo API - free, no key required, works great for Canada
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&hourly=temperature_2m,precipitation_probability&timezone=${encodeURIComponent(TIMEZONE)}&forecast_days=1`;

  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Find the index for 11am (hour 11)
    const hourIndex = EVENT_HOUR;

    const temperature = data.hourly.temperature_2m[hourIndex];
    const precipitationProbability = data.hourly.precipitation_probability[hourIndex];

    return {
      temperature: temperature,
      precipitationProbability: precipitationProbability
    };
  } catch (error) {
    Logger.log(`Error fetching weather: ${error}`);
    return null;
  }
}

/**
 * Create the workout event on the default calendar at 11am today
 */
function createWorkoutEvent() {
  const calendar = CalendarApp.getDefaultCalendar();
  const today = new Date();

  // Set event start time to 11am today
  const eventStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), EVENT_HOUR, 0, 0);
  const eventEnd = new Date(eventStart.getTime() + EVENT_DURATION_MINUTES * 60 * 1000);

  // Check if event already exists today to avoid duplicates
  const existingEvents = calendar.getEventsForDay(today, {search: EVENT_TITLE});
  if (existingEvents.length > 0) {
    Logger.log(`Event "${EVENT_TITLE}" already exists for today. Skipping creation.`);
    return null;
  }

  const event = calendar.createEvent(EVENT_TITLE, eventStart, eventEnd, {
    description: `Auto-created by WorkOutTime script.\n\nWeather conditions met:\n- Temperature ≥ ${MIN_TEMPERATURE_C}°C\n- Precipitation probability < ${MAX_PRECIPITATION_PROBABILITY}%\n\nLocation: Vancouver, BC`
  });

  Logger.log(`Created event: "${EVENT_TITLE}" at ${eventStart.toLocaleString()}`);
  return event;
}

/**
 * Test function - Check current weather without creating event
 */
function testWeatherCheck() {
  const weather = getWeatherForecast();

  if (weather) {
    Logger.log("=== Weather Check Test ===");
    Logger.log(`Location: Vancouver, BC (${LATITUDE}, ${LONGITUDE})`);
    Logger.log(`Temperature at ${EVENT_HOUR}:00: ${weather.temperature}°C`);
    Logger.log(`Precipitation probability: ${weather.precipitationProbability}%`);
    Logger.log("");
    Logger.log("Thresholds:");
    Logger.log(`  Min temperature: ${MIN_TEMPERATURE_C}°C`);
    Logger.log(`  Max precipitation: ${MAX_PRECIPITATION_PROBABILITY}%`);
    Logger.log("");

    const tempOk = weather.temperature >= MIN_TEMPERATURE_C;
    const precipOk = weather.precipitationProbability < MAX_PRECIPITATION_PROBABILITY;

    Logger.log(`Temperature check: ${tempOk ? "PASS" : "FAIL"}`);
    Logger.log(`Precipitation check: ${precipOk ? "PASS" : "FAIL"}`);
    Logger.log("");
    Logger.log(`Would create event: ${tempOk && precipOk ? "YES" : "NO"}`);
  } else {
    Logger.log("Failed to fetch weather data");
  }
}

/**
 * Test function - Force create event regardless of weather
 */
function testCreateEvent() {
  const event = createWorkoutEvent();
  if (event) {
    Logger.log("Test event created successfully!");
  }
}

/**
 * Set up daily trigger to run at 7am Vancouver time
 * Run this once to configure automation
 */
function setupDailyTrigger() {
  // Remove existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkWeatherAndCreateEvent') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new daily trigger at 7am
  ScriptApp.newTrigger('checkWeatherAndCreateEvent')
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .inTimezone(TIMEZONE)
    .create();

  Logger.log("Daily trigger set up for 7am Pacific time");
}

/**
 * Remove all triggers for this script
 */
function removeTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log("All triggers removed");
}
