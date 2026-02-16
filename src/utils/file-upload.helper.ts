import { extname } from 'path';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';

// Allowed file types for images
export const imageFileFilter = (req: any, file: any, callback: any) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
        );
    }
    callback(null, true);
};

// Allowed file types for general files (documents, etc.)
export const documentFileFilter = (req: any, file: any, callback: any) => {
    if (!file.originalname.match(/\.(pdf|doc|docx|txt|xls|xlsx|csv)$/)) {
        return callback(
            new BadRequestException('Only document files are allowed!'),
            false,
        );
    }
    callback(null, true);
};

// Generate unique filename
export const editFileName = (req: any, file: any, callback: any) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(16)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${name}-${Date.now()}-${randomName}${fileExtName}`);
};

// Combined storage configuration
export const multerStorage = diskStorage({
    destination: (req: any, file: any, callback: any) => {
        // Determine path based on field name
        const uploadPath = file.fieldname === 'image' ? './uploads/images' : './uploads/documents';
        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }
        callback(null, uploadPath);
    },
    filename: editFileName,
});
