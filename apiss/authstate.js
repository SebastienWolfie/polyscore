import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getUser } from './user';
import PubSub from "../utils/PubSub";


function updateLocalStates(result) {
    const auth = useAuth()
    auth.value.user = result;
    if (!result.emailVerified) {
      auth.value.user = null
      auth.value.unverifiedUser = result
      return navigateTo("/verify-required")
    }
    navigateTo(`/report/${auth.value.user.walletAddress}`)

  }



  function listenToUserStateChanged() {
    const auth = getAuth(app);
    const authPublisher = new PubSub();

    auth.onAuthStateChanged(async (user) => {
      if (user){
        const result = await getUser(user?.uid);
        updateLocalStates(result);
        authPublisher.publish("USER_CHANGED", result);
      }else{
        useAuth().value.user = null;
        authPublisher.publish("USER_CHANGED", null); 
      }
    });

    return authPublisher;
  }

  


  export {
    updateLocalStates,
    listenToUserStateChanged
  }