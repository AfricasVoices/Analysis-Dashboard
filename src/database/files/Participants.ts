type DatasetName = string;

export class Message {
    constructor() {}
}

export class Participant {
    constructor(
        public participant_uuid: string,
        public datasets: Map<DatasetName, Message[]>
    ) {}
}

export default class Participants {
    constructor(public participants: Participant[]) {}
}
