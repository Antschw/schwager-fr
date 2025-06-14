import React from "react";
import { Button, ButtonGroup } from "@heroui/react";
import { useTranslation } from "react-i18next";

interface TimeRangeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
    const { t } = useTranslation();

    const timeRanges = [
        { label: t('plant.periods.24h'), value: "24h" },
        { label: t('plant.periods.7d'), value: "7d" },
        { label: t('plant.periods.30d'), value: "30d" },
        { label: t('plant.periods.all'), value: "all" }
    ];

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <h2 className="text-lg font-medium text-foreground">{t('plant.timeRange')} :</h2>
            <ButtonGroup variant="flat">
                {timeRanges.map((range) => (
                    <Button
                        key={range.value}
                        color={value === range.value ? "success" : "default"}
                        variant={value === range.value ? "flat" : "light"}
                        onPress={() => onChange(range.value)}
                        className="px-4"
                    >
                        {range.label}
                    </Button>
                ))}
            </ButtonGroup>
        </div>
    );
};