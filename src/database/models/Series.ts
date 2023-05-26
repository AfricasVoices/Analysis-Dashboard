import {
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData,
} from "firebase/firestore";


export default class Series {
    /**
     * Represents the parent document for all analysis done within a series.
     *
     * A series is a collection of radio shows that were analysed together.
     *
     * @param seriesId Unique id of this series.
     * @param seriesName User-facing display name of this series.
     * @param projectName User-facing display name of the project that this series ran under.
     *                    Multiple series may have run under the same project.
     * @param poolName User-facing name of the engagement database pool that holds the data for this series.
     */
    constructor(
        public seriesId: string,
        public seriesName: string,
        public projectName: string,
        public poolName: string
    ) {}
}

export const seriesConvertor: FirestoreDataConverter<Series> = {
    toFirestore: (series: Series): DocumentData => ({
        series_id: series.seriesId,
        series_name: series.seriesName,
        project_name: series.projectName,
        pool_name: series.poolName,
    }),
    fromFirestore: (
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Series => {
        const data = snapshot.data(options);
        return new Series(
            data["series_id"],
            data["series_name"],
            data["project_name"],
            data["pool_name"]
        );
    },
};
