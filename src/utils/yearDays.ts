export function getDaysBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

export function getYearDays(year: number = new Date().getFullYear()): Date[] {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    return getDaysBetween(startDate, endDate);
}

export function getDaysAround(centralDate: Date = new Date(), count: number = 366 / 2): Date[] {
    const startDate: Date = new Date(centralDate);
    startDate.setDate(startDate.getDate() - count);

    const endDate: Date = new Date(centralDate);
    endDate.setDate(endDate.getDate() + count);

    return getDaysBetween(startDate, endDate);
}

export function getIndexForDate(dates: Date[], targetDate: Date): number {
    return dates.findIndex(date =>
        date.getFullYear() === targetDate.getFullYear() &&
        date.getMonth() === targetDate.getMonth() &&
        date.getDate() === targetDate.getDate()
    );
}
