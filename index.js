require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const { Dropbox } = require("dropbox");

const INTERVAL = 2 * 60 * 1000; // 2 minutes

const dropbox = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN
});

async function getData() {
    // TODO: récupérer tes données ici

    return {
        timestamp: new Date().toISOString(),
        data: [
            {
                id: 1,
                name: "Test"
            }
        ]
    };
}

async function exportToDropbox() {
    try {
        console.log(`[${new Date().toISOString()}] Starting export...`);

        const data = await getData();

        const filename = `export-${Date.now()}.json`;
        const localPath = path.join(__dirname, "data", filename);

        await fs.mkdir(path.dirname(localPath), {
            recursive: true
        });

        await fs.writeFile(
            localPath,
            JSON.stringify(data),
            "utf8"
        );

        console.log(`Created ${filename}`);

        const file = await fs.readFile(localPath);

        const dropboxPath = `${process.env.DROPBOX_FOLDER}/${filename}`;

        await dropbox.filesUpload({
            path: dropboxPath,
            contents: file,
            mode: {
                ".tag": "add"
            }
        });

        console.log(`Uploaded ${dropboxPath}`);

        await fs.unlink(localPath);

        console.log("Local file deleted");
    } catch (error) {
        console.error("Export failed:", error);
    }
}

// Exécuter immédiatement au démarrage
exportToDropbox();

// Puis toutes les 2 minutes
setInterval(exportToDropbox, INTERVAL);
