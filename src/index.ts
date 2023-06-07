import getFirebaseApp from "./config/firebase-config";
import AuthController from "./auth/AuthController";
import Database from "./database/Database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { DatasetAnalysis } from "./database/files/ThemeDistributions";
import BubbleChart from "./charts/BubbleChart";

// Initialize Firebase
const firebaseApp = getFirebaseApp();
const authController = new AuthController(firebaseApp);

authController.onSignedInUserChanged(async (user) => {
    const signedInUserUI = document.getElementById("signed-in-user");
    if (signedInUserUI) {
        signedInUserUI.innerText = `Signed in as ${user.email}`;
    }

    const db = new Database(getFirestore(firebaseApp), getStorage(firebaseApp));

    const seriesId = "eu_pcve_s03";
    const snapshotId = "9ece9570-c73c-46cf-8052-ff3ec89ed906";
    const fileId = "theme_distributions.json";

    const themeDistributionsResponse: Response = await db.getFile(
        seriesId,
        snapshotId,
        fileId
    );
    const themeDistributionsJson = await themeDistributionsResponse.json();
    const episodes: DatasetAnalysis[] = themeDistributionsJson.episodes
        .map((json: any) => DatasetAnalysis.fromJson(json))
        .filter(
            (ep: DatasetAnalysis) => ep.normalThemeDistributions().length > 0
        );

    const chartsContainer = document.getElementById("charts-container");
    episodes.forEach((episode: DatasetAnalysis) => {
        const episodeTitle = document.createElement("div");
        episodeTitle.innerHTML = `<b>${episode.episodeId}</b>`;
        chartsContainer!.appendChild(episodeTitle);

        const chart = document.createElement("div");
        chartsContainer!.appendChild(chart);

        new BubbleChart(chart, episode);
    });
});
