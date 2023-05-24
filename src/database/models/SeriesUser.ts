import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, DocumentData } from "firebase/firestore"

export class SnapshotPermissions {
    /**
     * Describes the permissions a user has for analysis snapshots.
     *
     * @param readAll Whether the user can read all the analysis snapshots.
     * @param readTagCategories Which analysis snapshot tag categories can be read e.g. ["final-analysis", "latest"]
     */
    constructor(public readAll: boolean, public readTagCategories: string[]) {}
}

/**
 * Describes the permissions a user has for each file within a snapshot, as a map of
 * filename -> list of permissions.
 *
 * For example: Map("participants.csv" -> ["read"])
 */
export type FilePermissions = Map<string, string[]>

export default class SeriesUser {
    /**
     * Represents an analysis dashboard user, for the purpose of controlling permissions to a series.
     *
     * @param email User's email address.
     * @param snapshotPermissions Describes the permissions for accessing different categories of analysis snapshot.
     * @param filePermissions Describes the permissions for accessing files listed in a snapshot.
     */
    constructor(public email: string, public snapshotPermissions: SnapshotPermissions,
                public filePermissions: FilePermissions) {

    }
}

export const userConvertor: FirestoreDataConverter<SeriesUser> = {
    toFirestore: (user: SeriesUser): DocumentData => ({
        "email": user.email,
        "snapshot_permissions": {
            "read_all": user.snapshotPermissions.readAll,
            "read_tag_categories": user.snapshotPermissions.readTagCategories
        },
        "file_permissions": Object.fromEntries(user.filePermissions.entries())
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SeriesUser => {
        const data = snapshot.data(options);
        return new SeriesUser(
            data["email"],
            new SnapshotPermissions(
                data["snapshot_permissions"]["read_all"],
                data["snapshot_permissions"]["read_tag_categories"]
            ),
            new Map(Object.entries(data["file_permissions"]))
        );
    }
}
