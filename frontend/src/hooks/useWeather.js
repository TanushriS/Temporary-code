import { useState, useCallback } from "react";
import axios from "axios";

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("disconnected");
  const [location, setLocation] = useState(null);

  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      setWeatherStatus("retrying");
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&timezone=auto`,
        { timeout: 10000 }
      );

      const data = response.data;
      const weatherInfo = {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        weatherCode: data.current.weather_code,
        uvIndex: data.current.uv_index || 0,
        lastUpdate: new Date(),
      };

      setWeatherData(weatherInfo);
      setWeatherStatus("connected");
      return { success: true, data: weatherInfo };
    } catch (error) {
      setWeatherStatus("disconnected");
      return { success: false, error: error.message };
    }
  }, []);

  const getLocationAndWeather = useCallback(async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        });
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      return await fetchWeather(
        position.coords.latitude,
        position.coords.longitude
      );
    } catch (error) {
      setWeatherStatus("disconnected");
      const fallbackWeather = {
        temperature: 22.5,
        humidity: 65,
        windSpeed: 3.2,
        weatherCode: 1,
        uvIndex: 3,
        fallback: true,
        lastUpdate: new Date(),
      };
      setWeatherData(fallbackWeather);
      return { success: false, error: error.message, data: fallbackWeather };
    }
  }, [fetchWeather]);

  const retryWeather = useCallback(async () => {
    if (location) {
      return await fetchWeather(location.latitude, location.longitude);
    } else {
      return await getLocationAndWeather();
    }
  }, [location, fetchWeather, getLocationAndWeather]);

  return { weatherData, weatherStatus, getLocationAndWeather, retryWeather };
};

export default useWeather;
