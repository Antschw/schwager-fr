import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../shared/utils/prisma';

// Schema for sensor data validation
const sensorDataSchema = z.object({
    plantId: z.string(),
    temperature: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    soilMoisture: z.number().min(0).max(100).optional(),
    lightLevel: z.number().min(0).optional(),
    ph: z.number().min(0).max(14).optional(),
    timestamp: z.string().datetime().optional(),
});

export const postSensorData = async (req: Request, res: Response) => {
    try {
        const validatedData = sensorDataSchema.parse(req.body);
        
        // Store sensor data in database
        const sensorReading = await prisma.sensorReading.create({
            data: {
                ...validatedData,
                timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : new Date(),
            },
        });

        // Emit real-time data to connected clients
        const io = req.app.get('io');
        io.emit('sensor:data', sensorReading);

        res.status(201).json({
            success: true,
            data: sensorReading,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sensor data',
                errors: error.errors,
            });
        }

        console.error('Error storing sensor data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getSensorData = async (req: Request, res: Response) => {
    try {
        const { plantId } = req.query;

        const whereClause = plantId ? { plantId: plantId as string } : {};

        const latestReadings = await prisma.sensorReading.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' },
            take: 10,
        });

        res.json({
            success: true,
            data: latestReadings,
        });
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const getSensorHistory = async (req: Request, res: Response) => {
    try {
        const { plantId, startDate, endDate, limit = '100' } = req.query;

        const whereClause: any = {};
        
        if (plantId) {
            whereClause.plantId = plantId as string;
        }

        if (startDate || endDate) {
            whereClause.timestamp = {};
            if (startDate) whereClause.timestamp.gte = new Date(startDate as string);
            if (endDate) whereClause.timestamp.lte = new Date(endDate as string);
        }

        const readings = await prisma.sensorReading.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' },
            take: parseInt(limit as string),
        });

        res.json({
            success: true,
            data: readings,
        });
    } catch (error) {
        console.error('Error fetching sensor history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};