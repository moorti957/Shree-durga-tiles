import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/authStore';

export default function IndexRoute() {
  const user = useAuthStore((state) => state.user);
  return <Redirect href={user ? '/(tabs)/home' : '/login'} />;
}
