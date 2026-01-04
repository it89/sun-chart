import type {LocationInfo} from "../types/location.types";
import {getLocationName} from "./LocationName";

const USER_LOCATION_STORAGE_KEY: string = 'user_location';
const SELECTED_LOCATION_STORAGE_KEY: string = 'selected_location';

const defaultLocationInfo: LocationInfo = {
    latitude: 51.5074456,
    longitude: -0.1277653,
    name: 'London',
} as LocationInfo;

const saveToStorage = (key: string, location: LocationInfo): void => {
    localStorage.setItem(key, JSON.stringify(location));
}

const getSavedLocation = (key: string): LocationInfo | null => {
    const stored = localStorage.getItem(key);

    if (stored) {
        try {
            return JSON.parse(stored) as LocationInfo || null;
        } catch (error) {
            console.error(`Error on getting location from local store: ${error}`);
        }
    }
    return null;
}

export const saveSelectedLocation = (location: LocationInfo) => {
    saveToStorage(SELECTED_LOCATION_STORAGE_KEY, location);
}

export const getSelectedLocation = (): LocationInfo => {
    const selectedLocation = getSavedLocation(SELECTED_LOCATION_STORAGE_KEY);

    if (selectedLocation != null) {
        return selectedLocation;
    } else {
        return defaultLocationInfo;
    }
}

export const getUserLocation = async (refresh: boolean = false): Promise<LocationInfo> => {
    const lastLocation = getSavedLocation(USER_LOCATION_STORAGE_KEY);
    if (!refresh && lastLocation) {
        return lastLocation;
    }

    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                maximumAge: 60 * 60 * 1000,
                enableHighAccuracy: false,
                timeout: 30000
            });
        });

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const name = await getLocationName(latitude, longitude);

        const location: LocationInfo = {
            latitude: latitude,
            longitude: longitude,
            name: name,
        } as LocationInfo;

        saveToStorage(USER_LOCATION_STORAGE_KEY, location);

        return location;
    } catch (error) {
        const errorMessage = error instanceof GeolocationPositionError ? error.message : String(error);
        console.warn(`Error on getting location: ${errorMessage}`);

        const lastLocation = getSavedLocation(USER_LOCATION_STORAGE_KEY);

        if (lastLocation == null) {
            const selectedLocation = getSelectedLocation();
            saveToStorage(USER_LOCATION_STORAGE_KEY, selectedLocation);
            return selectedLocation;
        } else {
            return lastLocation;
        }
    }
}

