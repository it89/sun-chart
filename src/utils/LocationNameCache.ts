import geohash from 'ngeohash';

interface CachedGeocode {
    hashKey: string;
    name: string;
    timestamp: number;
}

interface ReverseGeocodeResult {
    name: string;
}

const GEOCODING_CACHE_KEY = 'location_names';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PRECISION = 5; // 2.5 km

class LocationNameCache {
    private cache: Map<string, CachedGeocode> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Get location name from local storage or external API
     */
    async getLocationName(
        latitude: number,
        longitude: number,
        language: string = 'ru'
    ): Promise<any> {
        const hashKey = geohash.encode(latitude, longitude, PRECISION);

        const cached = this.cache.get(hashKey);
        const now = Date.now();

        if (cached && ((now - cached.timestamp) < CACHE_DURATION_MS)) {
            return cached.name;
        }

        const name = await this.getLocationNameByApi(latitude, longitude, language);

        if (name != null) {
            this.cache.set(hashKey, {
                hashKey: hashKey,
                name,
                timestamp: now,
            });

            this.saveToStorage();
            return name;
        } else {
            return this.getDefaultLocationName(latitude, longitude);
        }
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(GEOCODING_CACHE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.cache = new Map(parsed);
            }
        } catch (error) {
            console.warn(`Failed to load geocoding cache: ${error}`);
            this.cache = new Map();
        }
    }

    private saveToStorage(): void {
        try {
            const serialized = JSON.stringify(Array.from(this.cache.entries()));
            localStorage.setItem(GEOCODING_CACHE_KEY, serialized);
        } catch (error) {
            console.warn(`Failed to save geocoding cache: ${error}`);
        }
    }

    private async getLocationNameByApi(latitude: number,
                                       longitude: number,
                                       language: string = 'ru'): Promise<string | null> {
        try {
            console.log("Get location name");
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${language}&zoom=10`
            );

            if (!response.ok) {
                console.error(`OSM error! Status: ${response.status}`)
                return null;
            }

            const data: ReverseGeocodeResult = await response.json();

            // Добавляем задержку для соблюдения лимитов (1 запрос/сек)
            await new Promise(resolve => setTimeout(resolve, 1000));

            return data.name;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`OSM error: ${errorMessage}`);
            return null;
        }
    }

    private getDefaultLocationName(latitude: number,
                                   longitude: number): string {
        return latitude.toFixed(2) + ":" + longitude.toFixed(2);
    }
}

export default LocationNameCache;
