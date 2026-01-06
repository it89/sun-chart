import * as SunCalc from 'suncalc';

export function getDayLengthInHours(date: Date, latitude: number, longitude: number): number {
    const times = SunCalc.getTimes(date, latitude, longitude);
    const dayLengthMs = times.sunset.getTime() - times.sunrise.getTime();
    if (!dayLengthMs) {
        if (SunCalc.getPosition(times.solarNoon, latitude, longitude).altitude > 0) {
            return 24;
        } else {
            return 0;
        }
    }
    return dayLengthMs / (1000 * 60 * 60);
}

export function getDaysLengthInHours(dates: Date[], latitude: number, longitude: number): number[] {
    return dates.map(date => getDayLengthInHours(date, latitude, longitude));
}
