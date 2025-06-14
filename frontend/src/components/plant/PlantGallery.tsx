import React from "react";
import { Card, CardBody, Image, Button, Spinner, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { ImageData } from "../../types/plant-data";

interface PlantGalleryProps {
    images: ImageData[];
    isLoading: boolean;
    fullView?: boolean;
}

export const PlantGallery: React.FC<PlantGalleryProps> = ({ images, isLoading, fullView = false }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const imagesPerPage = fullView ? 9 : 3;

    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Spinner color="success" size="lg" />
            </div>
        );
    }

    if (!images || images.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <p className="text-default-400">{t('plant.messages.noImages')}</p>
            </div>
        );
    }

    // For carousel view
    const nextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    // For grid view
    const totalPages = Math.ceil(images.length / imagesPerPage);
    const startIndex = (currentPage - 1) * imagesPerPage;
    const displayedImages = images.slice(startIndex, startIndex + imagesPerPage);

    const formatTimestamp = (timestamp: number) => {
        // @ts-ignore
        return format(new Date(timestamp), "d MMM yyyy HH:mm", { locale: fr });
    };

    return (
        <div>
            {fullView ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <CardBody className="p-0">
                                        <div className="relative w-full">
                                            <Image
                                                src={image.url}
                                                alt={`Plante le ${formatTimestamp(image.timestamp)}`}
                                                className="w-full h-48 object-cover"
                                                classNames={{
                                                    wrapper: "w-full !max-w-none",
                                                    img: "w-full h-48 object-cover"
                                                }}
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white">
                                                <p className="text-xs">{formatTimestamp(image.timestamp)}</p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-4">
                        <Pagination
                            total={totalPages}
                            page={currentPage}
                            onChange={setCurrentPage}
                            showControls
                            color="success"
                        />
                    </div>
                </div>
            ) : (
                <div className="relative w-full">
                    <div className="overflow-hidden rounded-lg w-full">
                        <motion.div
                            key={images[currentIndex].id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-full"
                        >
                            <Image
                                src={images[currentIndex].url}
                                alt={`Plante le ${formatTimestamp(images[currentIndex].timestamp)}`}
                                className="w-full h-64 object-cover"
                                classNames={{
                                    wrapper: "w-full !max-w-none",
                                    img: "w-full h-64 object-cover"
                                }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-white">
                                <p>{formatTimestamp(images[currentIndex].timestamp)}</p>
                            </div>
                        </motion.div>
                    </div>

                    <Button
                        isIconOnly
                        variant="flat"
                        color="success"
                        className="absolute top-1/2 left-2 -translate-y-1/2"
                        onPress={prevImage}
                        aria-label="Image précédente"
                    >
                        <Icon icon="lucide:chevron-left" className="text-lg" />
                    </Button>

                    <Button
                        isIconOnly
                        variant="flat"
                        color="success"
                        className="absolute top-1/2 right-2 -translate-y-1/2"
                        onPress={nextImage}
                        aria-label="Image suivante"
                    >
                        <Icon icon="lucide:chevron-right" className="text-lg" />
                    </Button>

                    <div className="flex justify-center mt-4 gap-1">
                        {images.map((_, index) => (
                            <Button
                                key={index}
                                isIconOnly
                                size="sm"
                                variant={index === currentIndex ? "solid" : "light"}
                                color="success"
                                className="min-w-6 w-6 h-6"
                                onPress={() => setCurrentIndex(index)}
                                aria-label={`Aller à l'image ${index + 1}`}
                            >
                                <span className="text-xs">{index + 1}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};