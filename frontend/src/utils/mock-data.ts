import { MoistureData, PumpData, ImageData } from "../types/plant-data";
import { subHours, subDays, format, addHours } from "date-fns";

export function generateMockData(timeRange: string) {
    // Generate moisture data
    const moistureData = generateMoistureData(timeRange);

    // Generate pump data
    const pumpData = generatePumpData(timeRange);

    // Generate image data
    const imageData = generateImageData(timeRange);

    return {
        moistureData,
        pumpData,
        imageData
    };
}

function generateMoistureData(timeRange: string): MoistureData[] {
    const now = new Date();
    const data: MoistureData[] = [];

    let startDate: Date;
    let interval: number;

    switch (timeRange) {
        case "24h":
            startDate = subHours(now, 24);
            interval = 1; // 1 hour
            break;
        case "7d":
            startDate = subDays(now, 7);
            interval = 6; // 6 hours
            break;
        case "30d":
            startDate = subDays(now, 30);
            interval = 24; // 24 hours
            break;
        case "all":
        default:
            startDate = subDays(now, 90);
            interval = 48; // 48 hours
            break;
    }

    let currentDate = new Date(startDate);
    let moistureLevel = Math.floor(Math.random() * 30) + 50; // Start between 50-80%

    while (currentDate <= now) {
        // Natural decay of moisture
        moistureLevel -= Math.floor(Math.random() * 10) + 5;

        // Ensure moisture doesn't go below 10%
        moistureLevel = Math.max(10, moistureLevel);

        // Check if watering is needed
        const needsWatering = moistureLevel < 30;

        // Add data point
        data.push({
            timestamp: currentDate.getTime(),
            value: moistureLevel,
            watered: needsWatering
        });

        // If watered, increase moisture level
        if (needsWatering) {
            moistureLevel = Math.floor(Math.random() * 20) + 70; // 70-90%
        }

        // Move to next interval
        currentDate = addHours(currentDate, interval);
    }

    return data;
}

function generatePumpData(timeRange: string): PumpData {
    const now = new Date();
    let startDate: Date;
    let activations: number;
    let totalDuration: number;
    let waterUsed: number;

    switch (timeRange) {
        case "24h":
            startDate = subHours(now, 24);
            activations = Math.floor(Math.random() * 3) + 1;
            totalDuration = activations * (Math.floor(Math.random() * 3) + 1);
            waterUsed = totalDuration * 30;
            break;
        case "7d":
            startDate = subDays(now, 7);
            activations = Math.floor(Math.random() * 10) + 5;
            totalDuration = activations * (Math.floor(Math.random() * 3) + 1);
            waterUsed = totalDuration * 30;
            break;
        case "30d":
            startDate = subDays(now, 30);
            activations = Math.floor(Math.random() * 30) + 15;
            totalDuration = activations * (Math.floor(Math.random() * 3) + 1);
            waterUsed = totalDuration * 30;
            break;
        case "all":
        default:
            startDate = subDays(now, 90);
            activations = Math.floor(Math.random() * 90) + 45;
            totalDuration = activations * (Math.floor(Math.random() * 3) + 1);
            waterUsed = totalDuration * 30;
            break;
    }

    // Generate daily usage data
    const dailyUsage = [];
    let currentDate = new Date(startDate);

    while (currentDate <= now) {
        dailyUsage.push({
            date: format(currentDate, "yyyy-MM-dd"),
            amount: Math.floor(Math.random() * 100) + 20
        });

        currentDate = addHours(currentDate, 24);
    }

    return {
        activations,
        totalDuration,
        waterUsed,
        tankLevel: Math.floor(Math.random() * 60) + 40, // 40-100%
        dailyUsage
    };
}

function generateImageData(timeRange: string): ImageData[] {
    const now = new Date();
    const data: ImageData[] = [];

    let startDate: Date;
    let count: number;

    switch (timeRange) {
        case "24h":
            startDate = subHours(now, 24);
            count = 6;
            break;
        case "7d":
            startDate = subDays(now, 7);
            count = 14;
            break;
        case "30d":
            startDate = subDays(now, 30);
            count = 30;
            break;
        case "all":
        default:
            startDate = subDays(now, 90);
            count = 45;
            break;
    }

    const interval = (now.getTime() - startDate.getTime()) / count;

    for (let i = 0; i < count; i++) {
        const timestamp = startDate.getTime() + (interval * i);
        data.push({
            id: `img-${i}`,
            url: `https://picsum.photos/800/600?random=${i + 1}&seed=plant`,
            timestamp
        });
    }

    return data;
}