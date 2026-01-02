import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {Line} from 'react-chartjs-2';
import {getIndexForDate} from "../utils/yearDays";
import {getDaysLengthInHours} from "../utils/sun";
import {getMonthDaysLabels, getYearMonthLabels} from "../utils/chartLabels";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    annotationPlugin,
);

interface SunDayLengthChartProps {
    dates: Date[];
    latitude: number;
    longitude: number;
}

export function SunDayLengthChart({dates, latitude, longitude}: SunDayLengthChartProps) {
    const currentDate = new Date();
    const daysLength = getDaysLengthInHours(dates, latitude, longitude);
    const tickLabels: string[] = getYearMonthLabels(dates);
    const labels: string[] = getMonthDaysLabels(dates);
    const todayIndex = getIndexForDate(dates, currentDate);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                display: false,
            },
            title: {
                display: false,
                text: 'Day Length',
            },
            annotation: {
                annotations: {
                    today: {
                        xMin: todayIndex,
                        xMax: todayIndex,
                        borderColor: 'rgba(0, 0, 0, 0.5)',
                        borderWidth: 3,
                        label: {
                            display: false,
                            content: 'Today',
                            position: 'center'
                        }
                    }
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 0,
                    autoSkip: false,
                    callback: (_: any, index: number) => {
                        const label = tickLabels[index];
                        return label || undefined;
                    }
                },
                grid: {
                    display: true
                }
            },
            y: {
                title: {
                    display: false,
                    text: 'Hours'
                },
                min: 0,
                max: 24,
            }
        }
    };

    const data = {
        labels: labels,
        datasets: [
            {
                fill: true,
                label: 'Day Length',
                data: daysLength,
                borderColor: 'rgb(255, 153, 51)',
                backgroundColor: 'rgba(255, 153, 51, 0.5)',
                pointRadius: 1
            },
        ],
    };

    return <Line options={options} data={data}/>;
}