export interface MoistureData {
    timestamp: number;
    value: number;
    watered: boolean;
}

export interface DailyWaterUsage {
    date: string;
    amount: number;
}

export interface PumpData {
    activations: number;
    totalDuration: number;
    waterUsed: number;
    tankLevel: number;
    dailyUsage: DailyWaterUsage[];
}

export interface ImageData {
    id: string;
    url: string;
    timestamp: number;
}