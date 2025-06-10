import React from "react";
import { Card, CardBody, Progress, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { PumpData } from "../../types/plant-data";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PumpStatsProps {
    data: PumpData;
    isLoading: boolean;
}

export const PumpStats: React.FC<PumpStatsProps> = ({ data, isLoading }) => {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Spinner color="success" size="lg" />
            </div>
        );
    }

    if (!data || !data.activations) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <p className="text-default-400">{t('plant.messages.noPumpData')}</p>
            </div>
        );
    }

    const formatXAxis = (date: string) => {
        // @ts-ignore
        return format(new Date(date), "d MMM", { locale: fr });
    };

    // @ts-ignore
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title={t('plant.stats.activations')}
                    value={data.activations}
                    icon="lucide:power"
                    color="success"
                />
                <StatCard
                    title={t('plant.stats.totalDuration')}
                    value={`${data.totalDuration} min`}
                    icon="lucide:clock"
                    color="secondary"
                />
                <StatCard
                    title={t('plant.stats.waterUsed')}
                    value={`${data.waterUsed} ml`}
                    icon="lucide:droplets"
                    color="success"
                />
            </div>

            <div className="h-[200px]">
                <h3 className="text-sm font-medium text-default-600 mb-2">{t('plant.stats.dailyUsage')}</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data.dailyUsage}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--heroui-default-200))" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
                            stroke="hsl(var(--heroui-default-400))"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            stroke="hsl(var(--heroui-default-400))"
                            tick={{ fontSize: 12 }}
                            label={{
                                value: 'Eau (ml)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontSize: 12, fill: 'hsl(var(--heroui-default-500))' }
                            }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} ml`, t('plant.stats.waterUsed')]}
                            // @ts-ignore
                            labelFormatter={(label) => format(new Date(label), "d MMMM yyyy", { locale: fr })}
                        />
                        <Bar
                            dataKey="amount"
                            fill="hsl(var(--heroui-success-500))"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div>
                <h3 className="text-sm font-medium text-default-600 mb-2">{t('plant.stats.tankLevel')}</h3>
                <Progress
                    value={data.tankLevel}
                    color={data.tankLevel > 30 ? "success" : "danger"}
                    showValueLabel
                    className="max-w-full"
                    size="md"
                />
                <p className="text-xs text-default-400 mt-1">
                    {data.tankLevel > 30 ? t('plant.messages.tankGood') : t('plant.messages.tankLow')}
                </p>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: "success" | "secondary";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    return (
        <Card className="w-full">
            <CardBody className="flex flex-row items-center gap-4 py-3">
                <div className={`p-2 rounded-md ${color === 'success' ? 'bg-success/10' : 'bg-secondary/10'}`}>
                    <Icon icon={icon} className={`${color === 'success' ? 'text-success' : 'text-secondary'} text-xl`} />
                </div>
                <div>
                    <p className="text-sm text-default-500">{title}</p>
                    <p className="text-xl font-semibold">{value}</p>
                </div>
            </CardBody>
        </Card>
    );
};