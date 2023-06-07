export enum ThemeType {
    Normal = "Normal",
    Control = "Control",
    Meta = "Meta",
}

export class ThemeAnalysis {
    constructor(
        public schemeId: string,
        public codeId: string,
        public displayText: string,
        public stringValue: string,
        public themeType: ThemeType,
        public totalConsentingParticipants: number
    ) {}

    static fromJson(json: any): ThemeAnalysis {
        return new ThemeAnalysis(
            json.scheme_id,
            json.code_id,
            json.display_text,
            json.string_value,
            json.theme_type,
            json.total_consenting_participants
        );
    }
}

export class DatasetAnalysis {
    constructor(
        public episodeId: string,
        public themeDistributions: ThemeAnalysis[],
        public totalRelevantParticipants: number
    ) {}

    static fromJson(json: any): DatasetAnalysis {
        return new DatasetAnalysis(
            json.episode_id,
            json.theme_distributions.map((themeAnalysis: any) =>
                ThemeAnalysis.fromJson(themeAnalysis)
            ),
            json.total_relevant_participants
        );
    }

    public normalThemeDistributions(): ThemeAnalysis[] {
        return this.themeDistributions.filter(
            (t: ThemeAnalysis) => t.themeType === "Normal"
        );
    }
}
