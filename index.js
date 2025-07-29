import fs from 'fs';
import path from 'path';

import express from 'express';

const app = express();
const PORT = 3000;
const BASE_DIR = '/';

app.get('/image-service', (req, res) => {
    const filePath = req.query.path;

    if (!filePath) {
        return res.status(400)
                .send('Missing "path" query param');
    }

    const resolvedPath = path.resolve(BASE_DIR, '.' + filePath);

    if (!resolvedPath.startsWith(BASE_DIR)) {
        return res.status(403)
                .send('Access denied');
    }

    fs.stat(resolvedPath, (err, stats) => {
        if (err || !stats.isFile()) {
            return res.status(404)
                    .send('File not found');
        }

        const ext = path.extname(resolvedPath)
                .toLowerCase();
        let mimeType = 'application/octet-stream';

        switch (ext) {
        case '.jpg':
        case '.jpeg':
            mimeType = 'image/jpeg';
            break;
        case '.png':
            mimeType = 'image/png';
            break;
        case '.gif':
            mimeType = 'image/gif';
            break;
        case '.webp':
            mimeType = 'image/webp';
            break;
        }

        res.setHeader('Content-Type', mimeType);

        const stream = fs.createReadStream(resolvedPath);
        stream.pipe(res);
    });
});

app.listen(PORT, () => {
    console.log(`Image service running at http://localhost:${PORT}`);
});
