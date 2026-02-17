import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagePath = path.join(process.cwd(), 'public/images/intro-bg.png');
const outputPath = path.join(process.cwd(), 'public/images/intro-bg-optimized.png');

// Also create WebP version for better compression
const webpPath = path.join(process.cwd(), 'public/images/intro-bg.webp');

async function optimizeImage() {
    try {
        if (!fs.existsSync(imagePath)) {
            console.log('[v0] Image not found at:', imagePath);
            return;
        }

        console.log('[v0] Optimizing intro-bg.png...');
        
        // Get original file size
        const originalSize = fs.statSync(imagePath).size;
        console.log('[v0] Original size:', (originalSize / 1024).toFixed(2), 'KB');

        // Optimize PNG: reduce resolution, quality, and use compression
        const pngBuffer = await sharp(imagePath)
            .resize(1920, 1080, {
                fit: 'cover',
                withoutEnlargement: true
            })
            .png({ quality: 80, progressive: true, compressionLevel: 9 })
            .toBuffer();

        fs.writeFileSync(imagePath, pngBuffer);
        const newSize = fs.statSync(imagePath).size;
        const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
        console.log('[v0] Optimized PNG size:', (newSize / 1024).toFixed(2), 'KB');
        console.log('[v0] Size reduction:', savings + '%');

        // Create WebP version for better compression (if supported by browser)
        const webpBuffer = await sharp(imagePath)
            .resize(1920, 1080, {
                fit: 'cover',
                withoutEnlargement: true
            })
            .webp({ quality: 75 })
            .toBuffer();

        fs.writeFileSync(webpPath, webpBuffer);
        console.log('[v0] Created WebP version:', (webpBuffer.length / 1024).toFixed(2), 'KB');
        console.log('[v0] Image optimization complete!');
    } catch (error) {
        console.error('[v0] Error optimizing image:', error.message);
    }
}

optimizeImage();
