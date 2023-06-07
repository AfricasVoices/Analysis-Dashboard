export class SampleMessage {
    constructor(public code_id: string, public originalText: string) {}
}

export default class SampleMessages {
    private samplesByDataset;

    constructor(public messages: SampleMessage) {}

    get;
}
