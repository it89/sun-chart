import type {LocationSearchInfo} from "../types/location.types";

interface CachedSearch {
    results: LocationSearchInfo[],
    timestamp: number;
}

interface OsmResponse {
    lat: number,
    lon: number,
    name: string,
    display_name: string,
    addresstype: string,
}

const LOCATION_SEARCH_CACHE_KEY = 'location_search';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_MAX_SIZE = 100;

const getKey = (query: string): string => {
    return query.toLowerCase().trim();
}

const getCache = (): Map<string, CachedSearch> => {
    try {
        const stored = localStorage.getItem(LOCATION_SEARCH_CACHE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return new Map(parsed);
        }
    } catch (error) {
        console.warn(`Failed to load location search cache: ${error}`);
    }
    return new Map();
}

const saveCache = (map: Map<string, CachedSearch>): void => {
    try {
        const serialized = JSON.stringify(Array.from(map.entries()));
        localStorage.setItem(LOCATION_SEARCH_CACHE_KEY, serialized);
    } catch (error) {
        console.warn(`Failed to save location search cache: ${error}`);
    }
}

const getSavedSearch = (query: string): LocationSearchInfo[] | null => {
    const key = getKey(query);
    const map = getCache();
    const cached = map.get(key);
    const now = Date.now();

    if (cached && ((now - cached.timestamp) < CACHE_DURATION_MS)) {
        return cached.results;
    }
    return null;
}

const saveSearch = (query: string, results: LocationSearchInfo[]): void => {
    const key = getKey(query);
    let map = getCache();
    if (map.size >= CACHE_MAX_SIZE) {
        map = new Map();
    }
    map.set(key, {
        results,
        timestamp: Date.now(),
    });
    saveCache(map);
}

const searchLocationsByApi = async (query: string): Promise<LocationSearchInfo[]> => {
    console.log("Search locations using OSM");
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&featureType=settlement&format=json`
    );

    if (!response.ok) {
        console.error(`OSM error! Status: ${response.status}`)
        return [];
    }

    const data: OsmResponse[] = await response.json();

    // Добавляем задержку для соблюдения лимитов (1 запрос/сек)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return data
        .filter(item => item.addresstype !== 'state')
        .map(item => ({
        latitude: item.lat,
        longitude: item.lon,
        name: item.name,
        fullName: item.display_name
    }));
}

/**
 * Search locations using cache or external API.
 */
export const searchLocations = async (query: string): Promise<LocationSearchInfo[]> => {
    if (!query.trim()) {
        return [];
    }

    const savedResults: LocationSearchInfo[] | null = getSavedSearch(query);
    if (savedResults != null) {
        return savedResults;
    }

    const externalResults = await searchLocationsByApi(query);
    saveSearch(query, externalResults);
    return externalResults;
}
