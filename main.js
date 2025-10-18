const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('src/pages'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/pages/index.html');
});

app.get('/file', (req, res) => {
    const filePath = "src/assets/" + req.query.file;
    console.log(filePath);
    if (filePath !== "src/assets/") {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.status(404).send('File not found');
            } else {
                // Set appropriate content type based on file extension
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

app.use((req, res) => {
    res.redirect('/404?error='+req.url);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;