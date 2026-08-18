require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const { Dropbox } = require("dropbox");

const INTERVAL = 2 * 60 * 1000; // 2 minutes

// Vérification des variables d'environnement
const requiredEnv = [
    "DROPBOX_APP_KEY",
    "DROPBOX_APP_SECRET",
    "DROPBOX_REFRESH_TOKEN",
    "DROPBOX_FOLDER"
];

for (const variable of requiredEnv) {
    if (!process.env[variable]) {
        console.error(`Missing environment variable: ${variable}`);
        process.exit(1);
    }
}

// Connexion Dropbox avec refresh token
const dropbox = new Dropbox({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN
});

let running = false;

/**
 * Récupération des données.
 *
 * Remplace cette fonction par ton appel API / scraping /
 * récupération de données.
 */
async function getData() {
    return {
        timestamp: new Date().toISOString(),
        data: [
            {
                id: 1,
                name: "Test"
            },
            {
                id: 2,
                name: "Example"
            }
        ]
    };
}

/**
 * Génère et envoie le fichier sur Dropbox.
 */
async function exportToDropbox() {
    if (running) {
        console.log("Export already running, skipping...");
        return;
    }

    running = true;

    let localPath = null;

    try {
        console.log(
            `[${new Date().toISOString()}] Starting export...`
        );

        // Récupération des données
        const data = await getData();

        // Nom unique du fichier
        const filename = `export-${Date.now()}.json`;

        // Dossier local temporaire
        localPath = path.join(
            __dirname,
            "data",
            filename
        );

        // Création du dossier
        await fs.mkdir(
            path.dirname(localPath),
            {
                recursive: true
            }
        );

        // Création du JSON
        await fs.writeFile(
            localPath,
            JSON.stringify(data),
            "utf8"
        );

        console.log(`Created ${filename}`);

        // Lecture du fichier
        const file = await fs.readFile(localPath);

        // Nettoyage du chemin Dropbox
        const folder = process.env.DROPBOX_FOLDER
            .replace(/\/+$/, "");

        const dropboxPath = `${folder}/${filename}`;

        // Upload
        await dropbox.filesUpload({
            path: dropboxPath,
            contents: file,
            mode: {
                ".tag": "add"
            }
        });

        console.log(
            `Uploaded to Dropbox: ${dropboxPath}`
        );

        // Suppression locale uniquement après
        // confirmation de l'upload
        await fs.unlink(localPath);

        console.log("Local file deleted");

    } catch (error) {
        console.error("Export failed:", error);

        // On ne supprime PAS le fichier en cas d'erreur
        // pour éviter de perdre les données.

        if (localPath) {
            console.error(
                `Local file kept at: ${localPath}`
            );
        }

    } finally {
        running = false;
    }
}

/**
 * Premier export immédiatement au démarrage.
 */
exportToDropbox();

/**
 * Puis toutes les 2 minutes.
 */
setInterval(() => {
    exportToDropbox();
}, INTERVAL);
