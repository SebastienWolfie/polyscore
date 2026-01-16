import { getAuth } from "firebase/auth";
import { app } from "../firebase";

async function logout() {
  const auth = getAuth(app);
  await auth.signOut();
  useAuth().value.user == null;
  navigateTo('/')
}

export default logout;