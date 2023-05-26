import {
    doc,
    collection,
    getDoc,
    getDocs,
    query,
    where,
    Firestore,
    Query,
} from "firebase/firestore";
import SeriesUser, { userConvertor } from "./models/SeriesUser";
import AnalysisSnapshot, {
    analysisSnapshotConverter,
} from "./models/AnalysisSnapshot";

export default class Database {
    constructor(private firestore: Firestore) {}

    /**
     * Gets the user object for the given series and user email.
     *
     * @param seriesId
     * @param email
     * @return User object, if it exists, otherwise undefined.
     */
    async getUser(
        seriesId: string,
        email: string
    ): Promise<SeriesUser | undefined> {
        const path = `series/${seriesId}/users/${email}`;
        const ref = doc(this.firestore, path).withConverter(userConvertor);
        return (await getDoc(ref)).data();
    }

    /**
     * Gets the specified AnalysisSnapshot.
     *
     * @param seriesId
     * @param snapshotId
     * @return AnalysisSnapshot object, if it exists, otherwise undefined.
     */
    async getAnalysisSnapshot(
        seriesId: string,
        snapshotId: string
    ): Promise<AnalysisSnapshot | undefined> {
        const path = `series/${seriesId}/snapshots/${snapshotId}`;
        const ref = doc(this.firestore, path).withConverter(
            analysisSnapshotConverter
        );
        return (await getDoc(ref)).data();
    }

    /**
     * Gets the AnalysisSnapshots within a series. The returned result set can optionally be filtered.
     *
     * @param seriesId
     * @param filter_tag_categories: An optional list of tag categories to filter on. If provided, only snapshots
     *                               that have any of the tag categories provided here will be returned.
     * TODO: Add options for filtering on snapshot creation date, and paging/limiting
     * @return AnalysisSnapshots within the series that match the filters.
     */
    async getAnalysisSnapshots(
        seriesId: string,
        filter_tag_categories?: string[]
    ): Promise<AnalysisSnapshot[]> {
        const path = `series/${seriesId}/snapshots`;
        let ref: Query<AnalysisSnapshot> = collection(
            this.firestore,
            path
        ).withConverter(analysisSnapshotConverter);

        if (filter_tag_categories) {
            ref = query(
                ref,
                where(
                    "tag_categories",
                    "array-contains-any",
                    filter_tag_categories
                )
            );
        }

        return (await getDocs(ref)).docs.map((d) => d.data());
    }
}
