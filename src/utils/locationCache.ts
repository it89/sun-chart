import type {LocationInfo} from "../types/location.types";
import LocationNameCache from "./LocationNameCache";

const LOCATION_STORAGE_KEY: string = 'user_location';

const geocodingCache = new LocationNameCache();

const defaultLocationInfo: LocationInfo = {
    latitude: 51.5074456,
    longitude: -0.1277653,
    name: 'London',
} as LocationInfo;

function saveLastLocation(location: LocationInfo): void {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

function getLastLocation(): LocationInfo | null {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);

    if (stored) {
        try {
            return JSON.parse(stored) as LocationInfo || null;
        } catch (error) {
            console.error(`Error on getting location from local store: ${error}`);
        }
    }
    return null;
}

export function getLastLocationOrDefault(): LocationInfo {
    const lastLocation = getLastLocation();

    if (lastLocation != null) {
        return lastLocation;
    } else {
        return defaultLocationInfo;
    }
}

export async function getLocationWithMemory(refresh: boolean = false): Promise<LocationInfo> {
    const lastLocation = getLastLocation();
    if (!refresh && lastLocation) {
        return lastLocation;
    }

    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 5000
            });
        });

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const name = await geocodingCache.getLocationName(latitude, longitude);

        const location: LocationInfo = {
            latitude: latitude,
            longitude: longitude,
            name: name,
        } as LocationInfo;

        saveLastLocation(location);

        return location;
    } catch (error) {
        console.warn(`Error on getting location: ${error}`);
        const lastLocation = getLastLocation();

        if (lastLocation == null) {
            saveLastLocation(defaultLocationInfo);
            return defaultLocationInfo;
        } else {
            return lastLocation;
        }
    }
}

