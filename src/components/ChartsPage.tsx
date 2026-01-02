import {getDaysAround, getYearDays} from "../utils/yearDays";
import {SunDayLengthChart} from "./SunDayLengthChart";
import {type FC} from "react";

interface ChartsPageProps {
    isCentralDate: boolean;
    latitude: number;
    longitude: number
}

export const ChartsPage: FC<ChartsPageProps> = ({isCentralDate, latitude, longitude}) => {
    const currentDate: Date = new Date();
    const year: number = currentDate.getFullYear();
    const days: Date[] = isCentralDate ? getDaysAround(currentDate) : getYearDays(year);

    return (
        <SunDayLengthChart dates={days} latitude={latitude} longitude={longitude}/>
    )
}
