import Date from '../utils/Date'

export const useAuth = () =>
  useState(() => ({
        user: null,
        walletAddress: '',
        isWalletConnected: false,
        romUser: null
  }));
  
export const useAirdrops = () =>
  useState(() => ({
        list: []
  }));