
export function useEmaiApi() {
  const sendConfirmAccountEmail = (id, email, username, walletAddress) => $fetch(`/api/email/auth/send-verification`,{
      method: 'POST',
      body: {
        id: id,
        email: email,
        username: username,
        walletAddress: walletAddress
      }
    });

  return {
    sendConfirmAccountEmail
  };
}