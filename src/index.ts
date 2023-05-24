import getFirebaseApp from "./config/firebase-config";
import AuthController from "./auth/AuthController";

// Initialize Firebase
const firebaseApp = getFirebaseApp();
const authController = new AuthController(firebaseApp);

authController.onSignedInUserChanged((user) => {
    const signedInUserUI = document.getElementById("signed-in-user");
    if (signedInUserUI) {
        signedInUserUI.innerText = `Signed in as ${user.email}`;
    }
});
