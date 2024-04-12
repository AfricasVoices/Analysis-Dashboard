import {
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { describe, expect, test, beforeAll } from "vitest";

describe("Test the connection to the Firestore emulator is working", () => {
    let testEnv: RulesTestEnvironment;
    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: "avf-analysis-dashboard",
            firestore: {},
        });

        // Reset the emulator in case it was used for any previous tests
        await testEnv.clearFirestore();
    });

    const docToWrite = {
        test: "test",
    };

    test("Can write a test document to the Firestore emulator", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const ref = doc(context.firestore(), "users/test");
            await assertSucceeds(setDoc(ref, docToWrite));
        });
    });

    test("Can read the test document from the Firestore emulator", async () => {
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const ref = doc(context.firestore(), "users/test");
            const testDoc = await getDoc(ref);
            expect(testDoc.data()).toStrictEqual(docToWrite);
        });
    });
});
