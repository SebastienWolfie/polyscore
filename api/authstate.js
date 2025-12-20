import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getUser } from './user';
import PubSub from "../utils/PubSub";
import { getAll as getAllReferrals } from './referral';


function updateLocalStates(result) {
    useAuth().value.user = result;
  }



  function listenToUserStateChanged() {
    const auth = getAuth(app);
    const authPublisher = new PubSub();

    auth.onAuthStateChanged(async (user) => {
      if (user){
        const result = await getUser(user?.uid);
        const referrals = await getAllReferrals(user?.uid);
        result.referrals = referrals;
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