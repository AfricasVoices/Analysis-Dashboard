import { describe, beforeAll, test, expect } from "vitest";
import {
    assertFails,
    initializeTestEnvironment,
    RulesTestContext,
} from "@firebase/rules-unit-testing";
import { Firestore, setDoc, doc } from "firebase/firestore";
import SeriesUser, {
    SnapshotPermissions,
    userConvertor,
} from "../../src/database/models/SeriesUser";
import Database from "../../src/database/Database";
import fs from "fs";

async function writeTestDataToFirestore(firestore: Firestore): Promise<void> {
    const testDocs = [
        {
            path: "series/series-1/users/user1@example.com",
            data: new SeriesUser(
                "user1@example.com",
                new SnapshotPermissions(true, []),
                new Map()
            ),
            converter: userConvertor,
        },
        {
            path: "series/series-1/users/user2@example.com",
            data: new SeriesUser(
                "user2@example.com",
                new SnapshotPermissions(false, ["latest"]),
                new Map()
            ),
            converter: userConvertor,
        },
    ];

    // Write all test docs in parallel
    await Promise.all(
        testDocs.map((testDoc) => {
            const ref = doc(firestore, testDoc.path).withConverter(
                testDoc.converter
            );
            return setDoc(ref, testDoc.data);
        })
    );
}

async function getUserContext(
    userEmail: string | null
): Promise<RulesTestContext> {
    const testEnv = await initializeTestEnvironment({
        projectId: "avf-dashboards-test",
        firestore: {
            rules: fs.readFileSync("firestore.rules", "utf8"),
        },
    });

    if (userEmail === null) {
        return testEnv.unauthenticatedContext();
    }

    const userId = userEmail.split("@")[0]!;
    return testEnv.authenticatedContext(userId, {
        email: userEmail,
    });
}

async function getDatabaseForUser(userEmail: string | null): Promise<Database> {
    const userContext = await getUserContext(userEmail);
    // @ts-ignore because userContext.firestore() returns the Firebase v8 type but Database expects the v9
    // type. Both types are compatible with each other, just defined in different places.
    const firestore: Firestore = userContext.firestore();
    return new Database(firestore);
}

async function setUpDatabase() {
    const testEnv = await initializeTestEnvironment({
        projectId: "avf-dashboards-test",
        firestore: {
            // Allow global access to everything for now, so we can initialise the database
            rules:
                "service cloud.firestore { match /databases/{database}/documents { match /{document=**} { " +
                "allow read, write: if true;" +
                "}}}",
        },
    });

    await testEnv.clearFirestore();

    const admin = testEnv.unauthenticatedContext();
    // @ts-ignore because admin.firestore() returns the Firebase v8 type but Database expects the v9
    // type. Both types are compatible with each other, just defined in different places.
    await writeTestDataToFirestore(admin.firestore());
}

describe.concurrent("Test Database", () => {
    beforeAll(setUpDatabase);

    describe.concurrent("Test user document read permissions", () => {
        test("An unauthenticated user cannot access any user documents", async () => {
            const db = await getDatabaseForUser(null);
            await assertFails(db.getUser("series-1", "user1@example.com"));
            await assertFails(db.getUser("series-1", "user2@example.com"));
        });

        test("A user can access their user document", async () => {
            const db = await getDatabaseForUser("user1@example.com");
            const user = await db.getUser("series-1", "user1@example.com");
            expect(user).toStrictEqual(
                new SeriesUser(
                    "user1@example.com",
                    new SnapshotPermissions(true, []),
                    new Map()
                )
            );
        });

        test("A user cannot access another user's user document", async () => {
            const db = await getDatabaseForUser("user1@example.com");
            await assertFails(db.getUser("series-1", "user2@example.com"));
        });
    });
});
