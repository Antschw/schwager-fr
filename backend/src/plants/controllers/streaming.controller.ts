import { Request, Response } from 'express';
import { z } from 'zod';

// Note: This is a basic implementation. For production, you might want to use
// more robust streaming solutions like WebRTC, HLS, or dedicated streaming servers

const streamConfigSchema = z.object({
    plantId: z.string(),
    quality: z.enum(['low', 'medium', 'high']).default('medium'),
    rtspUrl: z.string().url().optional(), // If using IP camera with RTSP
});

// In-memory store for active streams (in production, use Redis)
const activeStreams = new Map<string, {
    plantId: string;
    startTime: Date;
    quality: string;
    viewers: number;
    streamProcess?: any;
}>();

export const startStream = async (req: Request, res: Response) => {
    try {
        const { plantId, quality, rtspUrl } = streamConfigSchema.parse(req.body);

        // Check if stream is already active
        if (activeStreams.has(plantId)) {
            return res.status(409).json({
                success: false,
                message: 'Stream already active for this plant',
            });
        }

        // For RTSP cameras, you can use node-rtsp-stream
        // For now, we'll create a placeholder stream entry
        const streamInfo = {
            plantId,
            startTime: new Date(),
            quality,
            viewers: 0,
        };

        // If RTSP URL provided, start RTSP stream conversion
        if (rtspUrl) {
            // This would initialize the RTSP to WebSocket stream conversion
            // Implementation depends on your camera setup
            console.log(`Starting RTSP stream from ${rtspUrl} for plant ${plantId}`);
        }

        activeStreams.set(plantId, streamInfo);

        // Emit stream status to connected clients
        const io = req.app.get('io');
        io.emit('stream:started', {
            plantId,
            quality,
            startTime: streamInfo.startTime,
        });

        res.json({
            success: true,
            message: 'Stream started successfully',
            data: {
                plantId,
                quality,
                startTime: streamInfo.startTime,
                streamUrl: `/api/plants/streaming/ws/${plantId}`, // WebSocket endpoint
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid stream configuration',
                errors: error.errors,
            });
        }

        console.error('Error starting stream:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting stream',
        });
    }
};

export const stopStream = async (req: Request, res: Response) => {
    try {
        const { plantId } = req.body;

        const streamInfo = activeStreams.get(plantId);
        if (!streamInfo) {
            return res.status(404).json({
                success: false,
                message: 'No active stream found for this plant',
            });
        }

        // Stop the stream process if exists
        if (streamInfo.streamProcess) {
            streamInfo.streamProcess.kill();
        }

        // Remove from active streams
        activeStreams.delete(plantId);

        // Emit stream status to connected clients
        const io = req.app.get('io');
        io.emit('stream:stopped', { plantId });

        res.json({
            success: true,
            message: 'Stream stopped successfully',
            data: {
                plantId,
                duration: Date.now() - streamInfo.startTime.getTime(),
            },
        });
    } catch (error) {
        console.error('Error stopping stream:', error);
        res.status(500).json({
            success: false,
            message: 'Error stopping stream',
        });
    }
};

export const getStreamStatus = async (req: Request, res: Response) => {
    try {
        const { plantId } = req.query;

        if (plantId) {
            const streamInfo = activeStreams.get(plantId as string);
            
            res.json({
                success: true,
                data: {
                    plantId,
                    isActive: !!streamInfo,
                    streamInfo: streamInfo || null,
                },
            });
        } else {
            // Return all active streams
            const allStreams = Array.from(activeStreams.entries()).map(([id, info]) => ({
                id,
                ...info,
            }));

            res.json({
                success: true,
                data: {
                    activeStreams: allStreams,
                    totalActive: allStreams.length,
                },
            });
        }
    } catch (error) {
        console.error('Error getting stream status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting stream status',
        });
    }
};

export const getStreamUrl = async (req: Request, res: Response) => {
    try {
        const { plantId } = req.query;

        if (!plantId) {
            return res.status(400).json({
                success: false,
                message: 'Plant ID is required',
            });
        }

        const streamInfo = activeStreams.get(plantId as string);
        
        if (!streamInfo) {
            return res.status(404).json({
                success: false,
                message: 'No active stream found for this plant',
            });
        }

        // Increment viewer count
        streamInfo.viewers++;

        res.json({
            success: true,
            data: {
                streamUrl: `/api/plants/streaming/ws/${plantId}`,
                quality: streamInfo.quality,
                viewers: streamInfo.viewers,
                uptime: Date.now() - streamInfo.startTime.getTime(),
            },
        });
    } catch (error) {
        console.error('Error getting stream URL:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting stream URL',
        });
    }
};