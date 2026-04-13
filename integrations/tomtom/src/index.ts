import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchGeocode,
  reverseGeocode,
  calculateRoute,
  matrixRouting,
  reachableRange,
  optimizeWaypoints,
  trafficFlow,
  trafficIncidents,
  listGeofenceProjects,
  createGeofenceProject,
  deleteGeofenceProject,
  createGeofence,
  listGeofences,
  deleteGeofence,
  geofenceReport,
  getTransitions,
  createGeofenceAlert,
  listGeofenceAlerts,
  deleteGeofenceAlert,
  reportLocation,
  getLocationHistory,
  listTrackedObjects,
  createTrackedObject,
  snapToRoads,
  manageContactGroup,
  deleteContactGroup
} from './tools';
import { geofenceTransitionTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchGeocode,
    reverseGeocode,
    calculateRoute,
    matrixRouting,
    reachableRange,
    optimizeWaypoints,
    trafficFlow,
    trafficIncidents,
    listGeofenceProjects,
    createGeofenceProject,
    deleteGeofenceProject,
    createGeofence,
    listGeofences,
    deleteGeofence,
    geofenceReport,
    getTransitions,
    createGeofenceAlert,
    listGeofenceAlerts,
    deleteGeofenceAlert,
    reportLocation,
    getLocationHistory,
    listTrackedObjects,
    createTrackedObject,
    snapToRoads,
    manageContactGroup,
    deleteContactGroup
  ],
  triggers: [inboundWebhook, geofenceTransitionTrigger]
});
