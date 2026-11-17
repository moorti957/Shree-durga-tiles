import { Tabs } from 'expo-router';
import { BottomNav } from '@/components/layout/BottomNav';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => <BottomNav />}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="products" options={{ title: 'Products' }} />
      <Tabs.Screen name="visitors" options={{ title: 'Visitors' }} />
      <Tabs.Screen name="bills" options={{ title: 'Bills' }} />
    </Tabs>
  );
}
