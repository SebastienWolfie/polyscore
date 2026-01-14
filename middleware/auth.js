export default defineNuxtRouteMiddleware(() => {
  const auth = useAuth()

  if (!auth.value.user) {
    return navigateTo("/")
  }

  if (!auth.value.user.emailVerified) {
    return navigateTo("/verify-required")
  }
})
