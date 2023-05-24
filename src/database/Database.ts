import {doc, getDoc, Firestore} from "firebase/firestore"
import SeriesUser, { userConvertor } from "./models/SeriesUser";

export default class Database {
    constructor(private firestore: Firestore) {}

    /**
     * Gets the user object for the given series and user email.
     *
     * @param seriesId
     * @param email
     * @return User object, if it exists, otherwise undefined.
     */
    async getUser(seriesId: string, email: string): Promise<SeriesUser | undefined> {
        const path = `series/${seriesId}/users/${email}`
        const ref = doc(this.firestore, path).withConverter(userConvertor)
        return (await getDoc(ref)).data()
    }
}
