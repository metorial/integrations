import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getAirQuality,
  getAirQualityHistory,
  getAirQualityForecast,
  getWeather,
  getWeatherForecast,
  getWeatherHistory,
  getPollen,
  getPollenForecast,
  getPollenHistory,
  getWildfire,
  getWildfireRisk,
  getNaturalDisasters,
  getNaturalDisastersHistory,
  getSoil,
  getWaterVapor,
  getNdvi,
  getElevation,
  geocode,
} from './tools';
import {
  airQualityChange,
  naturalDisasterAlert,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAirQuality,
    getAirQualityHistory,
    getAirQualityForecast,
    getWeather,
    getWeatherForecast,
    getWeatherHistory,
    getPollen,
    getPollenForecast,
    getPollenHistory,
    getWildfire,
    getWildfireRisk,
    getNaturalDisasters,
    getNaturalDisastersHistory,
    getSoil,
    getWaterVapor,
    getNdvi,
    getElevation,
    geocode,
  ],
  triggers: [
    inboundWebhook,
    airQualityChange,
    naturalDisasterAlert,
  ],
});
