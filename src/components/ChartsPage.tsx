import {getDaysAround, getYearDays} from "../utils/yearDays";
import {SunDayLengthChart} from "./SunDayLengthChart";

interface ChartsPageProps {
    isCentralDate: boolean;
}

export function ChartsPage({isCentralDate}: ChartsPageProps) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const days = isCentralDate ? getDaysAround(currentDate) : getYearDays(year);

    return (
        <>
            <SunDayLengthChart dates={days} latitude={59.57} longitude={30.19}/>
        </>
    )
}