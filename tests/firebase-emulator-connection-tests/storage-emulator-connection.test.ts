import {
    ref,
    uploadString,
    getDownloadURL,
    StorageReference,
} from "firebase/storage";
import fetch from "node-fetch";
import { expect, test, describe, beforeAll } from "vitest";
import {
    assertSucceeds,
    initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

describe("Test the connection to the Firebase Storage emulator is working", async () => {
    let testRef: StorageReference;
    beforeAll(async () => {
        let testEnv = await initializeTestEnvironment({
            projectId: "avf-dashboards-test",
            storage: {
                // Allow global access to everything for now, so we can initialise the database
                rules:
                    "rules_version = '2';" +
                    "service firebase.storage { match /b/{bucket}/o { match /{allPaths=**} {" +
                    "    allow read, write: if true;" +
                    "}}}",
            },
        });

        // Reset the emulator in case it was used for any previous tests
        await testEnv.clearStorage();

        const admin = testEnv.unauthenticatedContext();
        testRef = ref(admin.storage(), "test.txt");
    });

    const message = "Test message";

    test("Can write a test blob to the Firebase Storage emulator", async () => {
        await assertSucceeds(uploadString(testRef, message));
    });

    test("Can read the uploaded test blob from the Firebase Storage emulator", async () => {
        const url = await getDownloadURL(testRef);
        const response = await fetch(url);
        const downloadedText = await response.text();
        expect(message).toStrictEqual(downloadedText);
    });
});
