import AVF_COLOR_SCALE from "./avf_color_scale";

export function renderBubbleVoice({
    text,
    infoText,
}: {
    text: string;
    infoText: string;
}): string {
    return `<div style="--theme-color: ${AVF_COLOR_SCALE[4]}" class="bubble-chart-voice-container">
            <div class="bubble-chart-voice-text">${text}</div> 
            <div class="bubble-chart-voice-info">${infoText}</div>
            </div>`;
}

export function renderBubbleRow(voice: any): string {
    return `<tr>
        <td>${voice.text}</td>
        <td>${titleCase(voice.gender)}</td>
        <td>${titleCase(voice.age)}</td>
        <td>${titleCase(voice.district)}</td>
</tr>`;
}

function titleCase(s: string | null): string {
    if (s === null || s.length === 0) {
        return "";
    }

    return s.substring(0, 1).toUpperCase() + s.substring(1);
}

function addInfoTextToVoice(voice: any) {
    let [age, gender, district] = [voice.age, voice.gender, voice.district];

    if (
        voice.age !== null &&
        voice.gender === null &&
        voice.district === null
    ) {
        age += " year old";
    }

    if (
        voice.age === null &&
        voice.gender === null &&
        voice.district !== null
    ) {
        district = "Participant in " + titleCase(voice.district);
    }

    if (
        voice.age === null &&
        voice.gender === null &&
        voice.district === null
    ) {
        gender = "Participant";
    }

    return {
        ...voice,
        infoText: [gender, age, district]
            .filter((x) => x !== null)
            .map(titleCase)
            .join(", "),
    };
}

export function renderSampleMessages(voices: any) {
    // return voices.map(addInfoTextToVoice).map(renderBubbleVoice).join("<p></p>");

    return `
        <table>
            <tr>
                <th>Message</th>
                <th>Gender</th>
                <th>Age</th>
                <th>District</th>
            </tr>
        
            ${voices.map(addInfoTextToVoice).map(renderBubbleRow).join("")}
        </table>
    `;
}
