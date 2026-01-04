import geohash from 'ngeohash';

interface CachedGeocode {
    key: string;
    name: string;
    timestamp: number;
}

interface OsmResponse {
    name: string;
}

const GEOCODING_CACHE_KEY = 'location_names';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PRECISION = 5; // 2.5 km
const CACHE_MAX_SIZE = 100;

const getCache = (): Map<string, CachedGeocode> => {
    try {
        const stored = localStorage.getItem(GEOCODING_CACHE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return new Map(parsed);
        }
    } catch (error) {
        console.warn(`Failed to load geocoding cache: ${error}`);
    }
    return new Map();
}

const saveCache = (map: Map<string, CachedGeocode>): void => {
    try {
        const serialized = JSON.stringify(Array.from(map.entries()));
        localStorage.setItem(GEOCODING_CACHE_KEY, serialized);
    } catch (error) {
        console.warn(`Failed to save geocoding cache: ${error}`);
    }
}

const getSavedLocationName = (key: string): string | null => {
    const map = getCache();
    const cached = map.get(key);
    const now = Date.now();

    if (cached && ((now - cached.timestamp) < CACHE_DURATION_MS)) {
        return cached.name;
    }
    return null;
}

const saveLocationName = (key: string, name: string): void => {
    let map = getCache();
    if (map.size >= CACHE_MAX_SIZE) {
        map = new Map();
    }
    map.set(key, {
        key: key,
        name,
        timestamp: Date.now(),
    });
    saveCache(map);
}

const getDefaultLocationName = (latitude: number,
                                longitude: number): string => {
    return latitude.toFixed(2) + ":" + longitude.toFixed(2);
}

const getLocationNameByApi = async (latitude: number,
                                    longitude: number,
                                    language: string = 'ru'): Promise<string | null> => {
    try {
        console.log("Get location name from OSM");
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language}&zoom=10`
        );

        if (!response.ok) {
            console.error(`OSM error! Status: ${response.status}`)
            return null;
        }

        const data: OsmResponse = await response.json();

        // Добавляем задержку для соблюдения лимитов (1 запрос/сек)
        await new Promise(resolve => setTimeout(resolve, 1000));

        return data.name;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`OSM error: ${errorMessage}`);
        return null;
    }
}

/**
 * Get location name from cache or external API.
 */
export const getLocationName = async (latitude: number,
                                      longitude: number,
                                      language: string = 'ru'
): Promise<string> => {
    const hashKey: string = geohash.encode(latitude, longitude, PRECISION);
    const savedName: string | null = getSavedLocationName(hashKey);
    if (savedName) {
        return savedName;
    }

    const name: string | null = await getLocationNameByApi(latitude, longitude, language);
    if (name) {
        saveLocationName(hashKey, name);
        return name;
    } else {
        return getDefaultLocationName(latitude, longitude);
    }
}
