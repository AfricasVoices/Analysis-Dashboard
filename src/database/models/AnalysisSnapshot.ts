import {
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData,
} from "firebase/firestore";

export class AnalysisSnapshotTag {
    constructor(public tagCategory: string) {}
}

export default class AnalysisSnapshot {
    constructor(
        public datasets: string[],
        public tags: AnalysisSnapshotTag[]
    ) {}

    get uniqueTagCategories(): Set<string> {
        const allTagCategories = this.tags.map((t) => t.tagCategory);
        return new Set(allTagCategories);
    }
}

export const analysisSnapshotConverter: FirestoreDataConverter<AnalysisSnapshot> =
    {
        toFirestore: (snapshot: AnalysisSnapshot): DocumentData => ({
            datasets: snapshot.datasets,
            tags: snapshot.tags.map((t) => ({
                tag_category: t.tagCategory,
            })),
            tag_categories: [...snapshot.uniqueTagCategories],
        }),
        fromFirestore: (
            snapshot: QueryDocumentSnapshot,
            options: SnapshotOptions
        ): AnalysisSnapshot => {
            const data = snapshot.data(options);
            return new AnalysisSnapshot(
                data["datasets"],
                data["tags"].map(
                    (t: DocumentData) =>
                        new AnalysisSnapshotTag(t["tag_category"])
                )
            );
        },
    };
