const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Static files FIRST - this serves CSS, JS, fonts, etc.
app.use(express.static('src/pages'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/pages/index.html');
});

app.get('/melody', (req, res) => {
    res.sendFile(__dirname + '/src/pages/melody.html');
});

app.get('/articulation', (req, res) => {
    res.sendFile(__dirname + '/src/pages/articulation.html');
});

app.get('/dynamics', (req, res) => {
    res.sendFile(__dirname + '/src/pages/dynamics.html');
});

app.get('/texture', (req, res) => {
    res.sendFile(__dirname + '/src/pages/texture.html');
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

app.get('/music', async (req, res) => {
    const jsonParam = req.query.json;
    
    // If no JSON parameter, serve the HTML page
    if (!jsonParam) {
        res.sendFile(__dirname + '/src/pages/music.html');
        return;
    }
    
    // If JSON parameter exists, generate and return PNG image
    let browser;
    try {
        const cropX = parseInt(req.query.cropX) || 0;
        const cropY = parseInt(req.query.cropY) || 0;
        const cropWidth = parseInt(req.query.cropWidth) || 0;
        const cropHeight = parseInt(req.query.cropHeight) || 0;
        
        // Launch headless browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        
        const page = await browser.newPage();
        
        // Set viewport size
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navigate to the music page with JSON parameter
        let fullUrl = `http://localhost:${PORT}/music.html?json=${encodeURIComponent(jsonParam)}`;
        if (cropWidth > 0 && cropHeight > 0) {
            fullUrl += `&cropX=${cropX}&cropY=${cropY}&cropWidth=${cropWidth}&cropHeight=${cropHeight}`;
        }
        
        await page.goto(fullUrl, { 
            waitUntil: 'networkidle2',
            timeout: 8000 
        });
        
        // Wait for the img element (page converts canvas to img with URL params)
        await page.waitForSelector('#canvas-container img', { timeout: 5000 });
        
        // Wait for image to be fully loaded
        await page.waitForFunction(() => {
            const img = document.querySelector('#canvas-container img');
            return img && img.complete && img.naturalWidth > 0;
        }, { timeout: 3000 });
        
        // Get the image data
        const imageBuffer = await page.evaluate((cropX, cropY, cropWidth, cropHeight) => {
            const img = document.querySelector('#canvas-container img');
            
            if (!img || !img.src.startsWith('data:image')) {
                throw new Error('No image data found');
            }
            
            // Create a canvas to work with the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to image size
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Get image data to find bounds
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            // Find the bounds of non-white/non-transparent content
            let minX = canvas.width;
            let minY = canvas.height;
            let maxX = 0;
            let maxY = 0;
            
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const i = (y * canvas.width + x) * 4;
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];
                    
                    // Check if pixel is not white/transparent (has content)
                    if (a > 0 && (r < 250 || g < 250 || b < 250)) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            
            // Add small padding (10px)
            const padding = 10;
            minX = Math.max(0, minX - padding);
            minY = Math.max(0, minY - padding);
            maxX = Math.min(canvas.width, maxX + padding);
            maxY = Math.min(canvas.height, maxY + padding);
            
            const trimWidth = maxX - minX;
            const trimHeight = maxY - minY;
            
            // Apply user-specified crop if provided, otherwise use auto-trim
            let finalX, finalY, finalWidth, finalHeight;
            
            if (cropWidth > 0 && cropHeight > 0) {
                // User specified crop coordinates
                finalX = cropX;
                finalY = cropY;
                finalWidth = cropWidth;
                finalHeight = cropHeight;
            } else {
                // Auto-trim to content
                finalX = minX;
                finalY = minY;
                finalWidth = trimWidth;
                finalHeight = trimHeight;
            }
            
            // Create final canvas with trimmed/cropped dimensions
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            finalCanvas.width = finalWidth;
            finalCanvas.height = finalHeight;
            
            // Draw the cropped/trimmed portion
            finalCtx.drawImage(canvas, finalX, finalY, finalWidth, finalHeight, 0, 0, finalWidth, finalHeight);
            
            return finalCanvas.toDataURL('image/png').split(',')[1];
        }, cropX, cropY, cropWidth, cropHeight);
        
        await browser.close();
        browser = null;
        
        // Convert base64 to buffer and send as PNG
        const imgBuffer = Buffer.from(imageBuffer, 'base64');
        res.type('image/png');
        res.send(imgBuffer);
        
    } catch (error) {
        console.error('Error generating music notation image:', error.message);
        
        if (browser) {
            await browser.close();
        }
        
        res.status(500).send('Error generating image: ' + error.message);
    }
});

app.get('/file', (req, res) => {
    const filePath = "src/assets/" + req.query.file;
    if (filePath !== "src/assets/") {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.status(404).send('File not found');
            } else {
                const fileExtension = filePath.split('.').pop().toLowerCase();
                switch (fileExtension) {
                    case 'png':
                        res.type('image/png');
                        break;
                    case 'jpg':
                        res.type('image/jpg');
                        break;
                    case 'jpeg':
                        res.type('image/jpeg');
                        break;
                    case 'gif':
                        res.type('image/gif');
                        break;
                    case 'svg':
                        res.type('image/svg+xml');
                        break;
                    default:
                        res.type('application/octet-stream');
                }
                res.send(data);
            }
        });
    } else {
        res.status(400).send('No file specified');
    }
});

app.get('/404', (req, res) => {
    res.status(404).send('404 - Page not found. Error: ' + (req.query.error || 'Unknown'));
});

app.use((req, res) => {
    // Don't redirect if it's a static file request that failed
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|html)$/)) {
        console.log('Static file 404:', req.url);
        res.status(404).send('File not found');
    } else {
        res.status(404).send('Page not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;