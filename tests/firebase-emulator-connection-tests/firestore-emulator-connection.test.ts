import { assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore"
import { describe, expect, test } from "vitest"

describe("Test the connection to the Firestore emulator is working", async () => {
    let testEnv = await initializeTestEnvironment({
        projectId: "avf-analysis-dashboard",
        firestore: {
            // Allow global access to everything for now, so we can initialise the database
            rules:
                "service cloud.firestore { match /databases/{database}/documents { match /{document=**} { " +
                "allow read, write: if true;" +
                "}}}"
        }
    })

    // Reset the emulator in case it was used for any previous tests
    await testEnv.clearFirestore();

    const docToWrite = {
        "test": "test"
    }

    // We can use an unauthenticated context for admin at this point because we haven't set
    // any rules yet.
    const admin = testEnv.unauthenticatedContext();
    const ref = doc(admin.firestore(), "users/test")

    // Check the Firestore emulator connection is working
    test("Can write a test document to the Firestore emulator", async () => {
        await assertSucceeds(setDoc(ref, docToWrite))
    });

    test("Can read the test document from the Firestore emulator", async () => {
        const testDoc = await getDoc(ref)
        expect(testDoc.data()).toStrictEqual(docToWrite);
    });
})
