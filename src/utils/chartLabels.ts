export function getYearMonthLabels(
    dates: Date[],
    locale: string = navigator.language
): string[] {
    return dates.map((date: Date): string => {
            if (date.getDate() === 1) {
                return date.toLocaleString(locale, {month: 'short'});
            }
            return '';
        }
    )
}

export function getMonthDaysLabels(
    dates: Date[],
    locale: string = navigator.language
): string[] {
    return dates.map((date: Date): string => {
            return date.getDate() + '.' + date.toLocaleString(locale, {month: 'short'});
        }
    )
}
