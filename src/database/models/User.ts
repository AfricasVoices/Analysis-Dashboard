import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, DocumentData } from "firebase/firestore"

export class SnapshotPermissions {
    /**
     * Describes the permissions a user has for analysis snapshots.
     *
     * @param readAll Whether the user can read all the analysis snapshots.
     * @param readTagTypes Which analysis snapshot tag types can be read e.g. ["final-analysis", "latest"]
     */
    constructor(public readAll: boolean, public readTagTypes: string[]) {}
}

/**
 * Describes the permissions a user has for each file within a snapshot, as a map of
 * filename -> list of permissions.
 *
 * For example: Map("participants.csv" -> ["read"])
 */
export type FilePermissions = Map<string, string[]>

export default class User {
    /**
     * Represents an analysis dashboard user, for the purpose of controlling permissions to a series.
     *
     * @param userId Id of this user in Firebase Auth.
     * @param snapshotPermissions Describes the permissions for accessing different categories of analysis snapshot.
     * @param filePermissions Describes the permissions for accessing files listed in a snapshot.
     */
    constructor(public userId: string, public snapshotPermissions: SnapshotPermissions,
                public filePermissions: FilePermissions) {

    }
}

export const userConvertor: FirestoreDataConverter<User> = {
    toFirestore: (user: User): DocumentData => ({
        "userId": user.userId,
        "snapshot_permissions": {
            "read-all": user.snapshotPermissions.readAll,
            "read-tag-types": user.snapshotPermissions.readTagTypes
        },
        "file_permissions": Object.fromEntries(user.filePermissions.entries())
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): User => {
        const data = snapshot.data(options);
        return new User(
            data["userId"],
            new SnapshotPermissions(
                data["snapshot_permissions"]["read-all"],
                data["snapshot_permissions"]["read-tag-types"]
            ),
            new Map(Object.entries(data["file_permissions"]))
        );
    }
}
