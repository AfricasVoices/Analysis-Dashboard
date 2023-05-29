import { beforeAll, describe, expect, test } from "vitest";
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestContext,
    RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
    doc,
    Firestore,
    FirestoreDataConverter,
    setDoc,
} from "firebase/firestore";
import SeriesUser, {
    SnapshotPermissions,
    userConvertor,
} from "../../src/database/models/SeriesUser";
import Database from "../../src/database/Database";
import AnalysisSnapshot, {
    analysisSnapshotConverter,
    AnalysisSnapshotTag,
} from "../../src/database/models/AnalysisSnapshot";
import Series, { seriesConvertor } from "../../src/database/models/Series";

async function writeTestDataToFirestore(firestore: Firestore): Promise<void> {
    type TestDoc<T> = {
        path: string;
        data: T;
        convertor: FirestoreDataConverter<T>;
    };
    const testDocs: (
        | TestDoc<SeriesUser>
        | TestDoc<AnalysisSnapshot>
        | TestDoc<Series>
    )[] = [
        {
            path: "series/series-1",
            data: new Series(
                "test-series",
                "Test Series",
                "Test Project",
                "Pool-Test"
            ),
            convertor: seriesConvertor,
        },
        {
            path: "series/series-1/users/user1@example.com",
            data: new SeriesUser(
                "user1@example.com",
                new SnapshotPermissions(true, []),
                new Map()
            ),
            convertor: userConvertor,
        },
        {
            path: "series/series-1/users/user2@example.com",
            data: new SeriesUser(
                "user2@example.com",
                new SnapshotPermissions(false, ["latest"]),
                new Map()
            ),
            convertor: userConvertor,
        },
        {
            path: "series/series-1/snapshots/1",
            data: new AnalysisSnapshot([], []),
            convertor: analysisSnapshotConverter,
        },
        {
            path: "series/series-1/snapshots/2",
            data: new AnalysisSnapshot([], [new AnalysisSnapshotTag("latest")]),
            convertor: analysisSnapshotConverter,
        },
    ];

    // Write all test docs in parallel
    await Promise.all(
        testDocs.map((testDoc) => {
            const ref = doc(firestore, testDoc.path).withConverter<
                SeriesUser | AnalysisSnapshot | Series
            >(testDoc.convertor);
            return setDoc(ref, testDoc.data);
        })
    );
}

let testEnv: RulesTestEnvironment;
async function setUpDatabase() {
    testEnv = await initializeTestEnvironment({
        projectId: "avf-dashboards-test",
        firestore: {},
    });

    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
        await writeTestDataToFirestore(context.firestore());
    });
}

async function getUserContext(
    userEmail: string | null
): Promise<RulesTestContext> {
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
            await assertSucceeds(db.getUser("series-1", "user1@example.com"));
        });

        test("A user cannot access another user's user document", async () => {
            const db = await getDatabaseForUser("user1@example.com");
            await assertFails(db.getUser("series-1", "user2@example.com"));
        });
    });

    describe.concurrent("Test analysis snapshot read permissions", () => {
        test("A user with 'read-all' permissions can read all the analysis snapshots in a series via getAnalysisSnapshot()", async () => {
            const db = await getDatabaseForUser("user1@example.com");
            await assertSucceeds(db.getAnalysisSnapshot("series-1", "1"));
            await assertSucceeds(db.getAnalysisSnapshot("series-1", "2"));
        });

        test("A user with 'read-all' permissions can read all the analysis snapshots in a series via getAnalysisSnapshots()", async () => {
            const db = await getDatabaseForUser("user1@example.com");
            await assertSucceeds(db.getAnalysisSnapshots("series-1"));
        });

        test("A user with 'read-tag-categories' permissions only can only read snapshots that are tagged with one of those categories, via getAnalysisSnapshot()", async () => {
            const db = await getDatabaseForUser("user2@example.com");
            await assertFails(db.getAnalysisSnapshot("series-1", "1"));
            await assertSucceeds(db.getAnalysisSnapshot("series-1", "2"));
        });

        test("A user with 'read-tag-categories' permissions only can only read snapshots that are tagged with one of those categories, via getAnalysisSnapshots()", async () => {
            const db = await getDatabaseForUser("user2@example.com");
            await assertFails(db.getAnalysisSnapshots("series-1"));
            await assertSucceeds(
                db.getAnalysisSnapshots("series-1", ["latest"])
            );
        });
    });

    describe.concurrent("Test Database get methods", () => {
        test("Can correctly deserialize SeriesUsers", async () => {
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

        test("Can correctly deserialize AnalysisSnapshots (via getAnalysisSnapshot() and getAnalysisSnapshots())", async () => {
            const db = await getDatabaseForUser("user1@example.com");

            const expected1 = new AnalysisSnapshot([], []);
            const expected2 = new AnalysisSnapshot(
                [],
                [new AnalysisSnapshotTag("latest")]
            );

            const snapshot1 = await db.getAnalysisSnapshot("series-1", "1");
            expect(snapshot1).toStrictEqual(expected1);

            const snapshot2 = await db.getAnalysisSnapshot("series-1", "2");
            expect(snapshot2).toStrictEqual(expected2);

            const all = await db.getAnalysisSnapshots("series-1");
            expect(all).toStrictEqual([expected1, expected2]);
        });

        test("Can correctly deserialize Series", async () => {
            const db = await getDatabaseForUser("user1@example.com");
            const series = await db.getSeries("series-1");

            expect(series).toStrictEqual(
                new Series(
                    "test-series",
                    "Test Series",
                    "Test Project",
                    "Pool-Test"
                )
            );
        });
    });
});
