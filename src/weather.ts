const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

interface AlertsResponse {
  features: AlertFeature[];
}

interface PointsResponse {
  properties: {
    forecast?: string;
  };
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}

/**
 * Helper function for making NWS API requests
 * @param url - The URL to make the request to
 * @returns The response from the NWS API
 */
async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

/**
 * Format alert data
 * @param feature - The alert feature to format
 * @returns The formatted alert data
 */
function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || "Unknown"}`,
    `Area: ${props.areaDesc || "Unknown"}`,
    `Severity: ${props.severity || "Unknown"}`,
    `Status: ${props.status || "Unknown"}`,
    `Headline: ${props.headline || "No headline"}`,
    "---",
  ].join("\n");
}

/**
 * Get weather alerts for a state
 * @param state - Two-letter state code (e.g. CA, NY)
 * @returns Formatted alerts text
 */
export async function getAlerts(state: string): Promise<string> {
  const stateCode = state.toUpperCase();
  const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
  const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

  if (!alertsData) {
    return "Failed to retrieve alerts data";
  }

  const features = alertsData.features || [];
  if (features.length === 0) {
    return `No active alerts for ${stateCode}`;
  }

  const formattedAlerts = features.map(formatAlert);
  return `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;
}

/**
 * Get weather forecast for a location
 * @param latitude - Latitude of the location
 * @param longitude - Longitude of the location
 * @returns Formatted forecast text
 */
export async function getForecast(latitude: number, longitude: number): Promise<string> {
  // Get grid point data
  const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

  if (!pointsData) {
    return `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`;
  }

  const forecastUrl = pointsData.properties?.forecast;
  if (!forecastUrl) {
    return "Failed to get forecast URL from grid point data";
  }

  // Get forecast data
  const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
  if (!forecastData) {
    return "Failed to retrieve forecast data";
  }

  const periods = forecastData.properties?.periods || [];
  if (periods.length === 0) {
    return "No forecast periods available";
  }

  // Format forecast periods
  const formattedForecast = periods.map((period: ForecastPeriod) =>
    [
      `${period.name || "Unknown"}:`,
      `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
      `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
      `${period.shortForecast || "No forecast available"}`,
      "---",
    ].join("\n")
  );

  return `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;
}
