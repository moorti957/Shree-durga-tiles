import { useState } from 'react';
import { FlatList, Linking, Pressable, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock, MapPin, MessageSquare, Phone, Users } from 'lucide-react-native';
import { enquiriesApi, visitorsApi } from '@/api/endpoints';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { colors, typography } from '@/theme';
import { Screen } from '@/components/layout/Screen';

export default function VisitorsScreen() {
  const [mode, setMode] = useState<'visitors' | 'enquiries'>('visitors');
  const visitors = useQuery({ queryKey: ['visitors'], queryFn: () => visitorsApi.list({ page: 1, limit: 30 }), refetchInterval: 20_000 });
  const enquiries = useQuery({ queryKey: ['enquiries'], queryFn: () => enquiriesApi.list({ page: 1, limit: 30 }), refetchInterval: 20_000 });
  const openWhatsApp = (phone: string) => {
    void Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`).catch(() => undefined);
  };
  return (
    <Screen scroll={false}>
      <ScreenHeader title="Visitors" subtitle="Who's on your website right now">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.liveDot }} />
          <Text style={[typography.small, { color: colors.stone }]}>{visitors.data?.data.filter((item) => Date.now() - new Date(item.lastSeenAt).getTime() < 5 * 60_000).length ?? 0} visitors live</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Visitors" selected={mode === 'visitors'} onPress={() => setMode('visitors')} />
          <Chip label={`Enquiries ${enquiries.data?.meta.total ? `· ${enquiries.data.meta.total}` : ''}`} selected={mode === 'enquiries'} onPress={() => setMode('enquiries')} />
        </View>
      </ScreenHeader>
      {mode === 'visitors' ? (
        <FlatList
          data={visitors.data?.data ?? []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20, gap: 9 }}
          refreshControl={<RefreshControl refreshing={visitors.isRefetching} onRefresh={() => void visitors.refetch()} tintColor={colors.brassDark} />}
          renderItem={({ item }) => {
            const live = Date.now() - new Date(item.lastSeenAt).getTime() < 5 * 60_000;
            return (
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.stone100, alignItems: 'center', justifyContent: 'center' }}><Users size={17} color={colors.brassDark} /></View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[typography.label, { color: colors.ink }]}>{item.city ? `Visitor from ${item.city}` : `${item.device} visitor`}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Clock size={12} color={colors.muted} /><Text style={[typography.small, { color: colors.muted }]}>Last seen {new Date(item.lastSeenAt).toLocaleTimeString()}</Text></View>
                  {item.region ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><MapPin size={12} color={colors.muted} /><Text style={[typography.small, { color: colors.muted }]}>{item.region}</Text></View> : null}
                </View>
                <Badge label={live ? 'LIVE' : 'ENQUIRY'} variant={live ? 'live' : 'enquiry'} dot />
              </Card>
            );
          }}
          ListEmptyComponent={<Card style={{ alignItems: 'center', gap: 8, marginTop: 16 }}><Users color={colors.brassDark} /><Text style={[typography.cardTitle, { color: colors.ink }]}>No visitors just yet</Text><Text style={[typography.small, { color: colors.muted, textAlign: 'center' }]}>Website visitor activity will appear here as people browse.</Text></Card>}
        />
      ) : (
        <FlatList
          data={enquiries.data?.data ?? []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20, gap: 9 }}
          refreshControl={<RefreshControl refreshing={enquiries.isRefetching} onRefresh={() => void enquiries.refetch()} tintColor={colors.brassDark} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 11 }}>
              <Pressable onPress={() => router.push(`/enquiry/${item._id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.cardTitle, { color: colors.ink }]}>{item.name}</Text>
                  <Text style={[typography.small, { color: colors.muted }]}>{item.need} · {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Badge label={item.status.toUpperCase()} variant={item.status === 'new' ? 'enquiry' : 'neutral'} />
                <ArrowRight size={17} color={colors.muted} />
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 9 }}>
                <Button label="Call" variant="outline" compact icon={Phone} style={{ flex: 1 }} onPress={() => void Linking.openURL(`tel:${item.phone}`).catch(() => undefined)} />
                <Button label="WhatsApp" variant="success" compact icon={MessageSquare} style={{ flex: 1 }} onPress={() => openWhatsApp(item.phone)} />
                <Button label="Make bill" variant="brass" compact style={{ flex: 1 }} onPress={() => router.push(`/bill/new?enquiryId=${item._id}&name=${encodeURIComponent(item.name)}&phone=${encodeURIComponent(item.phone)}`)} />
              </View>
            </Card>
          )}
          ListEmptyComponent={<Card style={{ alignItems: 'center', gap: 8, marginTop: 16 }}><Text style={[typography.cardTitle, { color: colors.ink }]}>No enquiries yet</Text><Text style={[typography.small, { color: colors.muted }]}>Website enquiries will appear here.</Text></Card>}
        />
      )}
    </Screen>
  );
}
