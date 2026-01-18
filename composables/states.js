import Date from '../utils/Date'

export const useAuth = () =>
  useState(() => ({
        user: null,
        unverifiedUser: null,
        walletAddress: '',
        isWalletConnected: false,
        showEmailConfirmationSent: false
  }));
  
export const useAirdrops = () =>
  useState(() => ({
        list: []
  }));