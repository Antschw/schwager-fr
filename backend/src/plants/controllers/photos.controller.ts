import { Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import prisma from '../../shared/utils/prisma';

const uploadPhotoSchema = z.object({
    plantId: z.string(),
    description: z.string().optional(),
});

export const uploadPhoto = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No photo file provided',
            });
        }

        const { plantId, description } = uploadPhotoSchema.parse(req.body);

        // Create thumbnail
        const thumbnailPath = req.file.path.replace(/(\.[^.]+)$/, '_thumb$1');
        await sharp(req.file.path)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        // Store photo metadata in database
        const photo = await prisma.plantPhoto.create({
            data: {
                plantId,
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: `/uploads/photos/${req.file.filename}`,
                thumbnailPath: `/uploads/photos/${path.basename(thumbnailPath)}`,
                size: req.file.size,
                mimeType: req.file.mimetype,
                description,
                createdAt: new Date(),
            },
        });

        // Emit real-time notification
        const io = req.app.get('io');
        io.emit('photo:uploaded', { plantId, photo });

        res.status(201).json({
            success: true,
            data: photo,
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        
        // Clean up uploaded file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error uploading photo',
        });
    }
};

export const getPhotos = async (req: Request, res: Response) => {
    try {
        const { plantId, limit = '20', offset = '0' } = req.query;

        const whereClause = plantId ? { plantId: plantId as string } : {};

        const photos = await prisma.plantPhoto.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
        });

        const totalCount = await prisma.plantPhoto.count({ where: whereClause });

        res.json({
            success: true,
            data: {
                photos,
                totalCount,
                hasMore: (parseInt(offset as string) + photos.length) < totalCount,
            },
        });
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching photos',
        });
    }
};

export const deletePhoto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const photo = await prisma.plantPhoto.findUnique({
            where: { id },
        });

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found',
            });
        }

        // Delete files from filesystem
        const fullPath = path.join(__dirname, '../../../public', photo.path);
        const thumbnailFullPath = path.join(__dirname, '../../../public', photo.thumbnailPath);

        try {
            await fs.unlink(fullPath);
            await fs.unlink(thumbnailFullPath);
        } catch (fileError) {
            console.error('Error deleting files:', fileError);
        }

        // Delete from database
        await prisma.plantPhoto.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Photo deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting photo',
        });
    }
};