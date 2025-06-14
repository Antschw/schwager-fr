import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../../shared/utils/prisma';

const pumpTriggerSchema = z.object({
    plantId: z.string(),
    duration: z.number().min(1).max(300), // 1-300 seconds
    reason: z.string().optional(),
});

const deviceSettingsSchema = z.object({
    plantId: z.string(),
    settings: z.object({
        autoWatering: z.boolean().optional(),
        moistureThreshold: z.number().min(0).max(100).optional(),
        pumpDuration: z.number().min(1).max(300).optional(),
        checkInterval: z.number().min(60).optional(), // seconds
    }),
});

export const triggerPump = async (req: Request, res: Response) => {
    try {
        const { plantId, duration, reason } = pumpTriggerSchema.parse(req.body);

        // Log the pump activation
        const pumpLog = await prisma.pumpActivation.create({
            data: {
                plantId,
                duration,
                reason: reason || 'Manual trigger',
                triggeredBy: req.user?.id || 'system',
                timestamp: new Date(),
            },
        });

        // Emit real-time command to IoT device via WebSocket
        const io = req.app.get('io');
        io.emit('device:pump:activate', {
            plantId,
            duration,
            activationId: pumpLog.id,
        });

        // Also broadcast to web clients for UI updates
        io.emit('pump:activated', {
            plantId,
            duration,
            reason,
            timestamp: pumpLog.timestamp,
        });

        res.json({
            success: true,
            message: 'Pump activation triggered',
            data: {
                activationId: pumpLog.id,
                plantId,
                duration,
                timestamp: pumpLog.timestamp,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pump activation data',
                errors: error.errors,
            });
        }

        console.error('Error triggering pump:', error);
        res.status(500).json({
            success: false,
            message: 'Error triggering pump',
        });
    }
};

export const getDeviceStatus = async (req: Request, res: Response) => {
    try {
        const { plantId } = req.query;

        const whereClause = plantId ? { plantId: plantId as string } : {};

        // Get latest device status
        const deviceStatuses = await prisma.deviceStatus.findMany({
            where: whereClause,
            orderBy: { lastSeen: 'desc' },
        });

        // Get recent pump activations
        const recentActivations = await prisma.pumpActivation.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' },
            take: 5,
        });

        res.json({
            success: true,
            data: {
                devices: deviceStatuses,
                recentActivations,
            },
        });
    } catch (error) {
        console.error('Error fetching device status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching device status',
        });
    }
};

export const updateDeviceSettings = async (req: Request, res: Response) => {
    try {
        const { plantId, settings } = deviceSettingsSchema.parse(req.body);

        // Update or create device settings
        const deviceSettings = await prisma.deviceSettings.upsert({
            where: { plantId },
            update: {
                ...settings,
                updatedAt: new Date(),
                updatedBy: req.user?.id || 'system',
            },
            create: {
                plantId,
                ...settings,
                createdAt: new Date(),
                updatedAt: new Date(),
                updatedBy: req.user?.id || 'system',
            },
        });

        // Emit settings update to IoT device
        const io = req.app.get('io');
        io.emit('device:settings:update', {
            plantId,
            settings: deviceSettings,
        });

        res.json({
            success: true,
            message: 'Device settings updated',
            data: deviceSettings,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid settings data',
                errors: error.errors,
            });
        }

        console.error('Error updating device settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating device settings',
        });
    }
};