import { describe, beforeAll, test, expect } from "vitest";
import { assertFails, initializeTestEnvironment, RulesTestContext } from "@firebase/rules-unit-testing";
import { Firestore, setDoc, doc } from "firebase/firestore";
import User, { SnapshotPermissions, userConvertor } from "../../src/database/models/User";
import Database from "../../src/database/Database";
import fs from "fs"

async function writeTestDataToFirestore(firestore: Firestore): Promise<void> {
    const testDocs = [
        {
            path: "series/series-1/users/user-1",
            data: new User(
                "user-1",
                new SnapshotPermissions(true, []),
                new Map()
            ),
            converter: userConvertor
        },
        {
            path: "series/series-1/users/user-2",
            data: new User(
                "user-2",
                new SnapshotPermissions(false, ["latest"]),
                new Map()
            ),
            converter: userConvertor
        }
    ]

    // Write all test docs in parallel
    await Promise.all(testDocs.map(testDoc => {
        const ref = doc(firestore, testDoc.path).withConverter(testDoc.converter);
        return setDoc(ref, testDoc.data)
    }))
}

async function getUserContext(userId: string | null): Promise<RulesTestContext> {
    const testEnv = await initializeTestEnvironment({
        projectId: "avf-dashboards-test",
        firestore: {
            rules: fs.readFileSync("firestore.rules", "utf8")
        },
    })

    return userId ? testEnv.authenticatedContext(userId) : testEnv.unauthenticatedContext()
}

async function getDatabaseForUserId(userId: string | null): Promise<Database> {
    const userContext = await getUserContext(userId)
    // @ts-ignore because userContext.firestore() returns the Firebase v8 type but Database expects the v9
    // type. Both types are compatible with each other, just defined in different places.
    const firestore: Firestore = userContext.firestore()
    return new Database(firestore)
}

async function setUpDatabase() {
     const testEnv = await initializeTestEnvironment({
            projectId: "avf-dashboards-test",
            firestore: {
                // Allow global access to everything for now, so we can initialise the database
                rules:
                    "service cloud.firestore { match /databases/{database}/documents { match /{document=**} { " +
                    "allow read, write: if true;" +
                    "}}}"
            }
        });

     await testEnv.clearFirestore()

     const admin = testEnv.unauthenticatedContext();
     // @ts-ignore
     await writeTestDataToFirestore(admin.firestore())
}

describe.concurrent("Test Database", () => {
    beforeAll(setUpDatabase)

    describe.concurrent("Test user document read permissions", () => {
        test("An unauthenticated user cannot access any user documents", async () => {
            const db = await getDatabaseForUserId(null);
            await assertFails(db.getUser("series-1", "user-1"))
            await assertFails(db.getUser("series-1", "user-2"))
        });

        test("A user can access their user document", async () => {
            const db = await getDatabaseForUserId("user-1")
            const user = await db.getUser("series-1", "user-1")
            expect(user).toStrictEqual(new User(
                "user-1",
                new SnapshotPermissions(true, []),
                new Map()
            ))
        })

        test("A user cannot access another user's user document", async () => {
            const db = await getDatabaseForUserId("user-1");
            await assertFails(db.getUser("series-1", "user-2"))
        })
    })
})
