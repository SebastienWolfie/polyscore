import Date from '../utils/Date'

export const useAuth = () =>
  useState(() => ({
        user: null,
        unverifiedUser: null,
        walletAddress: '',
        isWalletConnected: false,
        showEmailConfirmationSent: false,
        romUser: null
  }));
  
export const useAirdrops = () =>
  useState(() => ({
        list: []
  }));