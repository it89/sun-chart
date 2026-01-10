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
import {type FC} from "react";
import {useTheme} from "../context/ThemeContext";
import starsUrl from "../images/starsBackground.svg";
import sunUrl from "../images/sunBackground.svg";

const starsImage = new Image();
starsImage.src = starsUrl;

const sunImage = new Image();
sunImage.src = sunUrl;

const backgroundImagesPlugin = {
    id: 'backgroundImages',
    beforeDraw: (chart: ChartJS) => {
        const {ctx, chartArea, scales, options} = chart;

        const pluginsOptions = options.plugins as Record<string, unknown> | undefined;
        const backgroundImagesOptions = pluginsOptions?.backgroundImages as {enabled?: boolean} | undefined;
        if (!backgroundImagesOptions?.enabled) {
            return;
        }
        if (!chartArea) {
            return;
        }

        const xScale = scales.x;
        const yScale = scales.y;
        if (!xScale || !yScale) {
            return;
        }

        const {left, right, top, bottom} = chartArea;
        const width = right - left;
        const height = bottom - top;

        const drawOrQueueImage = (img: HTMLImageElement) => {
            if (img.complete) {
                ctx.drawImage(img, left, top, width, height);
            } else {
                img.onload = () => {
                    chart.draw();
                };
            }
        };

        ctx.save();
        drawOrQueueImage(starsImage);
        ctx.restore();

        const meta = chart.getDatasetMeta(0);
        const points = meta.data as {x: number; y: number; skip?: boolean}[];
        if (!points || points.length === 0) {
            return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(left, bottom);

        let firstPointDrawn = false;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (!point || point.skip) {
                continue;
            }
            const x = point.x;
            const y = point.y;
            if (!firstPointDrawn) {
                ctx.lineTo(x, bottom);
                firstPointDrawn = true;
            }
            ctx.lineTo(x, y);
        }

        const lastVisible = [...points].reverse().find(p => p && !p.skip);
        if (lastVisible) {
            ctx.lineTo(lastVisible.x, bottom);
        }
        ctx.closePath();
        ctx.clip();

        drawOrQueueImage(sunImage);
        ctx.restore();
    },
};

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
    backgroundImagesPlugin,
);

interface SunDayLengthChartProps {
    dates: Date[];
    latitude: number;
    longitude: number;
}

export const SunDayLengthChart: FC<SunDayLengthChartProps> = ({dates, latitude, longitude}) => {
    const {isDarkMode} = useTheme();
    const currentDate: Date = new Date();
    const daysLength: number[] = getDaysLengthInHours(dates, latitude, longitude);
    const tickLabels: string[] = getYearMonthLabels(dates);
    const labels: string[] = getMonthDaysLabels(dates);
    const todayIndex: number = getIndexForDate(dates, currentDate);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2,
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
            backgroundImages: {
                enabled: isDarkMode,
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    callback: (_value: string | number, index: number) => {
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
                fill: !isDarkMode,
                label: 'Day Length',
                data: daysLength,
                borderColor: 'rgb(255, 153, 51)',
                backgroundColor: isDarkMode ? 'rgba(255, 153, 51, 0.0)' : 'rgba(255, 153, 51, 0.5)',
                pointRadius: 1,
            },
        ],
    };

    return <Line options={options} data={data}/>;
}
