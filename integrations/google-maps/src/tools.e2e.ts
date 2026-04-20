import {
  defineSlateToolE2EIntegration,
  runSlateToolE2ESuite,
  type ToolE2EContext
} from '@slates/test';
import { provider } from './index';

let googleplex = {
  address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
  addressLines: ['1600 Amphitheatre Parkway'],
  locality: 'Mountain View',
  regionCode: 'US'
};

let shoreline = {
  latitude: 37.425,
  longitude: -122.0808
};

let roadPath = [
  { latitude: 37.4218, longitude: -122.0842 },
  { latitude: 37.4225, longitude: -122.0864 },
  { latitude: 37.4232, longitude: -122.0888 }
];

let first = <T>(values: T[] | undefined, label: string) => {
  let value = values?.[0];
  if (!value) {
    throw new Error(`${label} did not return any results.`);
  }
  return value;
};

let readCoordinates = (value: { latitude?: unknown; longitude?: unknown }) => {
  let latitude = Number(value.latitude);
  let longitude = Number(value.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Expected a valid latitude/longitude pair.');
  }

  return { latitude, longitude };
};

let coordinateString = (latitude: number, longitude: number) => `${latitude},${longitude}`;

let createSearchInput = (location: { latitude: number; longitude: number }) => ({
  textQuery: 'Googleplex',
  languageCode: 'en',
  regionCode: 'US',
  maxResultCount: 5,
  locationBiasLatitude: location.latitude,
  locationBiasLongitude: location.longitude,
  locationBiasRadius: 5000
});

let getLocation = async (ctx: ToolE2EContext) => {
  let geocode = await ctx.invokeTool('geocode', {
    address: googleplex.address,
    language: 'en',
    region: 'us'
  });
  let location = first(geocode.output.results, 'geocode');

  readCoordinates(location);
  return location;
};

let getPlace = async (ctx: ToolE2EContext) => {
  let location = readCoordinates(await getLocation(ctx));
  let search = await ctx.invokeTool('search_places', createSearchInput(location));
  let place = first(search.output.places, 'search_places');

  if (!place.placeId) {
    throw new Error('search_places did not return a placeId.');
  }

  return place;
};

export let googleMapsToolE2E = defineSlateToolE2EIntegration({
  scenarioOverrides: {
    geocode: {
      name: 'geocode reverse-geocodes the canonical Mountain View coordinates',
      run: async ctx => {
        let location = readCoordinates(await getLocation(ctx));
        let result = await ctx.invokeTool('geocode', {
          latitude: location.latitude,
          longitude: location.longitude,
          language: 'en'
        });

        first(result.output.results, 'geocode reverse');
      }
    },
    validate_address: {
      name: 'validate_address standardizes the canonical Googleplex address',
      run: async ctx => {
        let result = await ctx.invokeTool('validate_address', {
          addressLines: googleplex.addressLines,
          locality: googleplex.locality,
          regionCode: googleplex.regionCode
        });

        if (!result.output.formattedAddress) {
          throw new Error('validate_address did not return a formatted address.');
        }
      }
    },
    search_places: {
      name: 'search_places finds Googleplex near the canonical coordinates',
      run: async ctx => {
        let place = await getPlace(ctx);

        if (!place.placeId) {
          throw new Error('search_places did not return a placeId.');
        }
      }
    },
    get_place_details: {
      name: 'get_place_details loads details for the searched place',
      run: async ctx => {
        let place = await getPlace(ctx);
        let placeId = String(place.placeId);
        let result = await ctx.invokeTool('get_place_details', {
          placeId,
          languageCode: 'en'
        });

        if (result.output.placeId !== placeId) {
          throw new Error(
            `get_place_details returned ${result.output.placeId} instead of ${placeId}.`
          );
        }
      }
    },
    get_directions: {
      name: 'get_directions returns a driving route across Mountain View',
      run: async ctx => {
        let location = readCoordinates(await getLocation(ctx));
        let result = await ctx.invokeTool('get_directions', {
          origin: coordinateString(location.latitude, location.longitude),
          destination: coordinateString(shoreline.latitude, shoreline.longitude),
          mode: 'driving',
          units: 'imperial',
          region: 'us'
        });

        if ((result.output.totalRoutes ?? 0) < 1) {
          throw new Error('get_directions did not return any routes.');
        }
      }
    },
    compute_route_matrix: {
      name: 'compute_route_matrix computes a single nearby driving pair',
      run: async ctx => {
        let location = readCoordinates(await getLocation(ctx));
        let result = await ctx.invokeTool('compute_route_matrix', {
          origins: [location],
          destinations: [{ latitude: shoreline.latitude, longitude: shoreline.longitude }],
          travelMode: 'DRIVE'
        });
        let element = first(result.output.elements, 'compute_route_matrix');

        if (
          result.output.totalPairs !== 1 ||
          (!element.duration && !element.distanceMeters)
        ) {
          throw new Error('compute_route_matrix did not return a usable route matrix element.');
        }
      }
    },
    get_elevation: {
      name: 'get_elevation returns elevations for two Mountain View points',
      run: async ctx => {
        let location = readCoordinates(await getLocation(ctx));
        let result = await ctx.invokeTool('get_elevation', {
          locations: [
            location,
            { latitude: shoreline.latitude, longitude: shoreline.longitude }
          ]
        });

        if (result.output.elevations.length < 2) {
          throw new Error('get_elevation did not return both elevation points.');
        }
      }
    },
    get_timezone: {
      name: 'get_timezone resolves the Mountain View time zone',
      run: async ctx => {
        let location = readCoordinates(await getLocation(ctx));
        let result = await ctx.invokeTool('get_timezone', {
          latitude: location.latitude,
          longitude: location.longitude
        });

        if (!result.output.timeZoneId) {
          throw new Error('get_timezone did not return a timeZoneId.');
        }
      }
    },
    get_air_quality: {
      name: 'get_air_quality returns air quality data for Mountain View',
      run: async ctx => {
        let location = readCoordinates(await getLocation(ctx));
        let result = await ctx.invokeTool('get_air_quality', {
          latitude: location.latitude,
          longitude: location.longitude,
          languageCode: 'en'
        });

        if (result.output.indexes.length === 0) {
          throw new Error('get_air_quality did not return any air quality indexes.');
        }
      }
    },
    snap_to_roads: {
      name: 'snap_to_roads aligns a short Googleplex-area path to roads',
      run: async ctx => {
        let result = await ctx.invokeTool('snap_to_roads', {
          path: roadPath,
          interpolate: true
        });

        if (result.output.snappedPoints.length === 0) {
          throw new Error('snap_to_roads did not return any snapped points.');
        }
      }
    },
    generate_static_map: {
      name: 'generate_static_map builds a Mountain View map URL',
      run: async ctx => {
        let location = readCoordinates(await getLocation(ctx));
        let result = await ctx.invokeTool('generate_static_map', {
          center: coordinateString(location.latitude, location.longitude),
          zoom: 14,
          width: 640,
          height: 360,
          maptype: 'roadmap',
          markers: [
            `color:red|label:G|${coordinateString(location.latitude, location.longitude)}`,
            `color:blue|label:S|${coordinateString(shoreline.latitude, shoreline.longitude)}`
          ],
          path: [
            'color:0x0b57d0|weight:4',
            coordinateString(location.latitude, location.longitude),
            coordinateString(shoreline.latitude, shoreline.longitude)
          ].join('|'),
          language: 'en'
        });

        if (!result.output.mapUrl.includes('/maps/api/staticmap')) {
          throw new Error('generate_static_map did not return a Google Static Maps URL.');
        }
      }
    },
    geolocate: {
      name: 'geolocate estimates a location with IP fallback enabled',
      run: async ctx => {
        let result = await ctx.invokeTool('geolocate', {
          considerIp: true
        });

        if (
          !Number.isFinite(result.output.latitude) ||
          !Number.isFinite(result.output.longitude) ||
          result.output.accuracyMeters <= 0
        ) {
          throw new Error('geolocate did not return a usable estimated location.');
        }
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleMapsToolE2E
});
