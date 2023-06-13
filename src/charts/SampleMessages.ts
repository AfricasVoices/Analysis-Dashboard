export function renderVoice({
    text,
    infoText,
}: {
    text: string;
    infoText: string;
}): string {
    return `<div class="bubble-chart-voice-container"><em>"${text}"</em> - ${infoText}</div>`;
}

function titleCase(s: string): string {
    return s.substring(0, 1).toUpperCase() + s.substring(1);
}

function addInfoText(voice: any) {
    return {
        text: voice.text,
        infoText: [voice.gender, voice.age, voice.district]
            .filter((x) => x !== null)
            .map(titleCase)
            .join(", "),
    };
}

export function renderSampleMessages(voices: any) {
    return voices.map(addInfoText).map(renderVoice).join("<p></p>");
}
