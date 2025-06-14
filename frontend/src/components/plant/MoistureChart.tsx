import React from "react";
import { Card, Spinner } from "@heroui/react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { MoistureData } from "../../types/plant-data";

interface MoistureChartProps {
    data: MoistureData[];
    isLoading: boolean;
}

export const MoistureChart: React.FC<MoistureChartProps> = ({ data, isLoading }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Spinner color="success" size="lg" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <p className="text-default-400">{t('plant.messages.noMoistureData')}</p>
            </div>
        );
    }

    const formatXAxis = (timestamp: number) => {
        // @ts-ignore
        return format(new Date(timestamp), "HH:mm", { locale: fr });
    };

    const formatTooltipTime = (timestamp: number) => {
        // @ts-ignore
        return format(new Date(timestamp), "d MMM yyyy HH:mm", { locale: fr });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Card className="p-2 border border-default-200 shadow-sm">
                    <p className="font-medium">{formatTooltipTime(label)}</p>
                    <p className="text-success">
                        Humidité: {payload[0].value}%
                    </p>
                    {payload[0].payload.watered && (
                        <p className="text-success-600 text-sm mt-1">
                            {t('plant.messages.plantWatered')}
                        </p>
                    )}
                </Card>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--heroui-success-500))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--heroui-success-500))" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--heroui-default-200))" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatXAxis}
                        stroke="hsl(var(--heroui-default-400))"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="hsl(var(--heroui-default-400))"
                        tick={{ fontSize: 12 }}
                        label={{
                            value: 'Humidité %',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontSize: 12, fill: 'hsl(var(--heroui-default-500))' }
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                        y={30}
                        label={{
                            value: t('plant.messages.wateringThreshold'),
                            position: "insideBottomRight",
                            fill: "hsl(var(--heroui-danger-500))",
                            fontSize: 12
                        }}
                        stroke="hsl(var(--heroui-danger-500))"
                        strokeDasharray="3 3"
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--heroui-success-600))"
                        fillOpacity={1}
                        fill="url(#colorMoisture)"
                        activeDot={{ r: 6, stroke: "hsl(var(--heroui-success-700))", strokeWidth: 1, fill: "hsl(var(--heroui-success-500))" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};