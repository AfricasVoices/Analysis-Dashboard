import { FirebaseApp } from "firebase/app";
import { getAuth, Auth, User, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";

export default class AuthController {
    auth: Auth;

    constructor(app: FirebaseApp) {
        this.auth = getAuth(app);
    }

    /**
     * Registers an observer that is called whenever the user currently signed-in changes.
     * This only observes signed-in users. If there is no user signed-in, it automatically redirects to a sign-in page.
     */
    onSignedInUserChanged(observer: (user: User) => void): void {
        this.auth.onAuthStateChanged(user => {
            if (user === null) {
                this.signIn();
            } else {
                observer(user);
            }
        });
    }

    private async signIn() {
        await signInWithRedirect(this.auth, new GoogleAuthProvider());
    }
}
