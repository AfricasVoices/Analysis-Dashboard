import getFirebaseApp from "./config/firebase-config";
import AuthController from "./auth/AuthController";
import Database from "./database/Database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
    DatasetAnalysis,
    ThemeAnalysis,
    ThemeType,
} from "./database/files/ThemeDistributions";
import PieChart from "./charts/PieChart";
import { renderSampleMessages } from "./charts/SampleMessages";

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

    const voices = await (
        await fetch("/theme_distribution_samples.json")
    ).json();

    const demogs = [
        new DatasetAnalysis(
            "Gender",
            [
                new ThemeAnalysis(
                    "scheme",
                    "code",
                    "Man",
                    "man",
                    ThemeType.Normal,
                    62
                ),
                new ThemeAnalysis(
                    "scheme",
                    "code",
                    "Woman",
                    "woman",
                    ThemeType.Normal,
                    43
                ),
            ],
            0
        ),
        new DatasetAnalysis(
            "State",
            [
                new ThemeAnalysis(
                    "scheme",
                    "code",
                    "Galmadug",
                    "galmadug",
                    ThemeType.Normal,
                    60
                ),
                new ThemeAnalysis(
                    "scheme",
                    "code",
                    "Jubbaland",
                    "jubbaland",
                    ThemeType.Normal,
                    25
                ),
                new ThemeAnalysis(
                    "scheme",
                    "code",
                    "Puntland",
                    "puntland",
                    ThemeType.Normal,
                    10
                ),
            ],
            0
        ),
    ];

    episodes.slice(0, 1).forEach((episode: DatasetAnalysis) => {
        const episodeTitle = document.createElement("div");
        episodeTitle.innerHTML = `
            <p>
                <b>${episode.episodeId}</b> (${episode.totalRelevantParticipants} relevant participants)
            </p>
            <div><b>Awareness Creation</b></div>
        `;
        chartsContainer!.appendChild(episodeTitle);

        const episodeContainer = document.createElement("div");
        episodeContainer.classList.add("episode-container")
        chartsContainer!.appendChild(episodeContainer);

        // new BubbleChart(chart, episode, voices);
        // new PieChart(chart, episode);

        const demogsContainer = document.createElement("div");
        demogsContainer.classList.add("demogs-container")
        episodeContainer.appendChild(demogsContainer)

        demogs.forEach(demog => {
            const demogContainer = document.createElement("span");
            demogsContainer.appendChild(demogContainer)

            new PieChart(demogContainer, demog);
        })

        const voicesContainer = document.createElement("div");
        voicesContainer.classList.add("voices-container")
        voicesContainer.innerHTML = renderSampleMessages(voices);
        episodeContainer.appendChild(voicesContainer)
    });
});
