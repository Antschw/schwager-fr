import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardBody,
    Tabs,
    Tab,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import Header from "../components/ui/Header";
import { MoistureChart } from "../components/plant/MoistureChart";
import { PumpStats } from "../components/plant/PumpStats";
import { PlantGallery } from "../components/plant/PlantGallery";
import { TimeRangeSelector } from "../components/plant/TimeRangeSelector";
import { usePlantData } from "../hooks/usePlantData";
import { useMediaQuery } from "../hooks/useMediaQuery";

export default function PlantPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = React.useState<string>("24h");
    const { moistureData, pumpData, imageData, isLoading } = usePlantData(timeRange);
    const [selectedTab, setSelectedTab] = React.useState("dashboard");
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleRefresh = () => {
        // Trigger data refresh by changing the time range temporarily
        const currentRange = timeRange;
        setTimeRange("");
        setTimeout(() => setTimeRange(currentRange), 100);
    };

    const handleWaterNow = () => {
        // Simulate watering action
        console.log("Arrosage manuel déclenché");
        // Here you would call your API to trigger watering
    };

    const handleCapturePhoto = () => {
        // Simulate photo capture
        console.log("Capture de photo déclenchée");
        // Here you would call your API to capture a photo
    };

    const handleSettings = () => {
        // Navigate to settings or open settings modal
        console.log("Ouverture des paramètres");
    };

    const headerRightContent = (
        <div className="flex items-center gap-2">
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <Button
                        variant="light"
                        isIconOnly
                        aria-label={t('plant.actions.refresh')}
                    >
                        <Icon icon="lucide:more-vertical" className="text-lg" />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Actions">
                    <DropdownItem
                        key="refresh"
                        startContent={<Icon icon="lucide:refresh-cw" />}
                        onPress={handleRefresh}
                    >
                        {t('plant.actions.refresh')}
                    </DropdownItem>
                    <DropdownItem
                        key="water"
                        startContent={<Icon icon="lucide:droplets" />}
                        onPress={handleWaterNow}
                    >
                        {t('plant.actions.waterNow')}
                    </DropdownItem>
                    <DropdownItem
                        key="capture"
                        startContent={<Icon icon="lucide:camera" />}
                        onPress={handleCapturePhoto}
                    >
                        {t('plant.actions.capturePhoto')}
                    </DropdownItem>
                    <DropdownItem
                        key="settings"
                        startContent={<Icon icon="lucide:settings" />}
                        onPress={handleSettings}
                    >
                        {t('plant.actions.systemSettings')}
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );

    const headerLeftContent = (
        <div className="flex items-center gap-3">
            <Button
                variant="light"
                size="sm"
                onPress={() => navigate('/hub')}
                isIconOnly={isMobile}
                startContent={<Icon icon="lucide:arrow-left" />}
                aria-label={t('plant.back')}
            >
                {!isMobile && t('plant.back')}
            </Button>
            {isMobile && <Icon icon="lucide:sprout" className="text-success text-xl" />}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-default-100">
            <Header
                title={isMobile ? " " : t('plant.title')}
                leftContent={headerLeftContent}
                rightContent={headerRightContent}
            />

            <main className="container mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                </motion.div>

                <Tabs
                    aria-label={t('plant.tabs.dashboard')}
                    selectedKey={selectedTab}
                    onSelectionChange={(key) => setSelectedTab(key as string)}
                    variant="underlined"
                    color="success"
                    className="mb-6"
                >
                    <Tab key="dashboard" title={t('plant.tabs.dashboard')}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <Card className="w-full border border-default-200/50">
                                    <CardBody>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-success/10 rounded-lg">
                                                <Icon icon="lucide:droplets" className="text-success text-xl" />
                                            </div>
                                            <h2 className="text-xl font-semibold">{t('plant.sections.moisture')}</h2>
                                        </div>
                                        <MoistureChart data={moistureData} isLoading={isLoading} />
                                    </CardBody>
                                </Card>

                                <Card className="w-full border border-default-200/50">
                                    <CardBody>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-success/10 rounded-lg">
                                                <Icon icon="lucide:settings" className="text-success text-xl" />
                                            </div>
                                            <h2 className="text-xl font-semibold">{t('plant.sections.watering')}</h2>
                                        </div>
                                        <PumpStats data={pumpData} isLoading={isLoading} />
                                    </CardBody>
                                </Card>
                            </div>

                            <Card className="w-full border border-default-200/50">
                                <CardBody>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-success/10 rounded-lg">
                                            <Icon icon="lucide:camera" className="text-success text-xl" />
                                        </div>
                                        <h2 className="text-xl font-semibold">{t('plant.sections.gallery')}</h2>
                                    </div>
                                    <PlantGallery images={imageData} isLoading={isLoading} />
                                </CardBody>
                            </Card>
                        </motion.div>
                    </Tab>

                    <Tab key="gallery" title={t('plant.tabs.gallery')}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="w-full border border-default-200/50">
                                <CardBody>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-success/10 rounded-lg">
                                            <Icon icon="lucide:images" className="text-success text-xl" />
                                        </div>
                                        <h2 className="text-xl font-semibold">{t('plant.sections.timeline')}</h2>
                                    </div>
                                    <PlantGallery images={imageData} isLoading={isLoading} fullView />
                                </CardBody>
                            </Card>
                        </motion.div>
                    </Tab>

                    <Tab key="settings" title={t('plant.tabs.settings')}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="w-full border border-default-200/50">
                                <CardBody>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-success/10 rounded-lg">
                                            <Icon icon="lucide:settings" className="text-success text-xl" />
                                        </div>
                                        <h2 className="text-xl font-semibold">{t('plant.sections.systemSettings')}</h2>
                                    </div>
                                    <div className="space-y-6">
                                        <p className="text-default-500">
                                            {t('plant.messages.settingsDesc')}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="border border-default-200">
                                                <CardBody className="text-center p-6">
                                                    <Icon icon="lucide:thermometer" className="text-success text-3xl mx-auto mb-2" />
                                                    <h3 className="font-semibold mb-2">{t('plant.settings.thresholds.title')}</h3>
                                                    <p className="text-sm text-default-500">{t('plant.settings.thresholds.desc')}</p>
                                                </CardBody>
                                            </Card>

                                            <Card className="border border-default-200">
                                                <CardBody className="text-center p-6">
                                                    <Icon icon="lucide:clock" className="text-success text-3xl mx-auto mb-2" />
                                                    <h3 className="font-semibold mb-2">{t('plant.settings.scheduling.title')}</h3>
                                                    <p className="text-sm text-default-500">{t('plant.settings.scheduling.desc')}</p>
                                                </CardBody>
                                            </Card>

                                            <Card className="border border-default-200">
                                                <CardBody className="text-center p-6">
                                                    <Icon icon="lucide:camera" className="text-success text-3xl mx-auto mb-2" />
                                                    <h3 className="font-semibold mb-2">{t('plant.settings.camera.title')}</h3>
                                                    <p className="text-sm text-default-500">{t('plant.settings.camera.desc')}</p>
                                                </CardBody>
                                            </Card>

                                            <Card className="border border-default-200">
                                                <CardBody className="text-center p-6">
                                                    <Icon icon="lucide:wifi" className="text-success text-3xl mx-auto mb-2" />
                                                    <h3 className="font-semibold mb-2">{t('plant.settings.connectivity.title')}</h3>
                                                    <p className="text-sm text-default-500">{t('plant.settings.connectivity.desc')}</p>
                                                </CardBody>
                                            </Card>
                                        </div>

                                        <div className="flex justify-center">
                                            <p className="text-default-400 text-sm">{t('plant.messages.settingsComingSoon')}</p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    </Tab>
                </Tabs>
            </main>
        </div>
    );
}