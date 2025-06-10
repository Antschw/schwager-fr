import React from "react";
import { MoistureData, PumpData, ImageData } from "../types/plant-data";
import { generateMockData } from "../utils/mock-data";

export function usePlantData(timeRange: string) {
    const [moistureData, setMoistureData] = React.useState<MoistureData[]>([]);
    const [pumpData, setPumpData] = React.useState<PumpData>({
        activations: 0,
        totalDuration: 0,
        waterUsed: 0,
        tankLevel: 0,
        dailyUsage: []
    });
    const [imageData, setImageData] = React.useState<ImageData[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        setIsLoading(true);

        // Simulate API call with a delay
        const timer = setTimeout(() => {
            const { moistureData, pumpData, imageData } = generateMockData(timeRange);
            setMoistureData(moistureData);
            setPumpData(pumpData);
            setImageData(imageData);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeRange]);

    return {
        moistureData,
        pumpData,
        imageData,
        isLoading
    };
}