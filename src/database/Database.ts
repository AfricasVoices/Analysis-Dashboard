import {doc, getDoc, Firestore} from "firebase/firestore"
import User, { userConvertor } from "./models/User";

export default class Database {
    constructor(private firestore: Firestore) {}

    /**
     * Gets the user object for the given series and user id.
     *
     * @param seriesId
     * @param userId
     * @return User object, if it exists, otherwise undefined.
     */
    async getUser(seriesId: string, userId: string): Promise<User | undefined> {
        const path = `series/${seriesId}/users/${userId}`
        const ref = doc(this.firestore, path).withConverter(userConvertor)
        return (await getDoc(ref)).data()
    }
}
