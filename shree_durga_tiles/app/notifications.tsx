import { Alert, Platform, ScrollView, Text } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Bell, Receipt } from 'lucide-react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { billsApi, devicesApi, enquiriesApi } from '@/api/endpoints';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors, typography } from '@/theme';

export default function NotificationsScreen() {
  const [registering, setRegistering] = useState(false);
  const enquiries = useQuery({ queryKey: ['enquiries'], queryFn: () => enquiriesApi.list({ page: 1, limit: 20 }) });
  const bills = useQuery({ queryKey: ['bills'], queryFn: () => billsApi.list({ page: 1, limit: 20 }) });
  const newEnquiries = enquiries.data?.data.filter((item) => item.status === 'new') ?? [];
  const dueBills = bills.data?.data.filter((item) => Number(item.balanceDue) > 0 && item.status === 'final') ?? [];
  const registerDevice = async () => {
    setRegistering(true);
    try {
      if (!Device.isDevice) throw new Error('Push notifications require a physical device.');
      const platform = Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : null;
      if (!platform) throw new Error('Push notifications are supported on Android and iOS only.');
      if (platform === 'android') {
        await Notifications.setNotificationChannelAsync('admin-updates', {
          name: 'Admin updates',
          importance: AndroidImportance.DEFAULT,
        });
      }
      let permissions = await Notifications.getPermissionsAsync();
      if (!permissions.granted) permissions = await Notifications.requestPermissionsAsync();
      if (!permissions.granted) throw new Error('Notification permission was not granted.');
      const token = await Notifications.getDevicePushTokenAsync();
      const result = await devicesApi.register(token.data, platform);
      Alert.alert(
        'Device registered',
        result.pushDeliveryConfigured
          ? 'This device is registered for admin notifications.'
          : 'This device is registered. Push delivery is not configured on the server yet.'
      );
    } catch (error) {
      Alert.alert('Could not register device', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  return (
    <Screen>
      <ScreenHeader title="Notifications" subtitle="New enquiries and payment reminders" back />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 9 }}>
        <Button
          label="Enable push notifications"
          icon={Bell}
          loading={registering}
          onPress={() => void registerDevice()}
        />
        {newEnquiries.map((item) => (
          <Card key={item._id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Bell size={20} color={colors.brassDark} />
            <Text onPress={() => router.push(`/enquiry/${item._id}`)} style={[typography.body, { color: colors.ink, flex: 1 }]}>New enquiry: {item.name}, {item.need}</Text>
          </Card>
        ))}
        {dueBills.map((bill) => (
          <Card key={bill._id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Receipt size={20} color={colors.danger} />
            <Text onPress={() => router.push(`/bill/${bill._id}`)} style={[typography.body, { color: colors.ink, flex: 1 }]}>{bill.customerName} has a payment balance due.</Text>
          </Card>
        ))}
        {newEnquiries.length === 0 && dueBills.length === 0 ? <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 30 }}><Bell color={colors.brassDark} /><Text style={[typography.cardTitle, { color: colors.ink }]}>You&apos;re all caught up</Text><Text style={[typography.small, { color: colors.muted }]}>New enquiries and due bills will appear here.</Text></Card> : null}
      </ScrollView>
    </Screen>
  );
}
