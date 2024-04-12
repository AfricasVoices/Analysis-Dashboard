import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { expect, test, describe, beforeAll } from "vitest";
import {
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

describe("Test the connection to the Firebase Storage emulator is working", async () => {
    let testEnv: RulesTestEnvironment;
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: "avf-analysis-dashboard",
            storage: {},
        });

        // Reset the emulator in case it was used for any previous tests
        await testEnv.clearStorage();
    });

    const message = "Test message";

    test("Can write a test blob to the Firebase Storage emulator", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const testRef = ref(context.storage(), "test.txt");
            await assertSucceeds(uploadString(testRef, message));
        });
    });

    test("Can read the uploaded test blob from the Firebase Storage emulator", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const testRef = ref(context.storage(), "test.txt");
            const url = await getDownloadURL(testRef);
            const response = await fetch(url);
            const downloadedText = await response.text();
            expect(message).toStrictEqual(downloadedText);
        });
    });
});
