import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { 
    uploadPhoto, 
    getPhotos, 
    deletePhoto 
} from '../controllers/photos.controller';

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../public/uploads/photos'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `plant-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

const router = Router();

// POST /api/plants/photos/upload - Upload plant photo
router.post('/upload', upload.single('photo'), uploadPhoto);

// GET /api/plants/photos - Get plant photos (protected)
router.get('/', requireAuth, getPhotos);

// DELETE /api/plants/photos/:id - Delete photo (protected)
router.delete('/:id', requireAuth, deletePhoto);

export default router;