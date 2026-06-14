import { Redirect } from 'expo-router'
import { useUserStore } from '../store/userStore'

export default function Index() {
  const { isAuthenticated } = useUserStore()
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/welcome'} />
}
