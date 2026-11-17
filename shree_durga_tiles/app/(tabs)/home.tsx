import { useCallback } from 'react';
import { RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, Camera, Grid2X2, IndianRupee, Receipt, Users } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { dashboardApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { TrishulIcon } from '@/components/brand/TrishulIcon';
import { colors, typography } from '@/theme';
import { formatCompactRupees } from '@/lib/format';

function Stat({ title, value, note, dark }: { title: string; value: string; note: string; dark?: boolean }) {
  return (
    <Card style={{ flex: 1, minHeight: 116, backgroundColor: dark ? colors.ink : colors.card, borderColor: dark ? colors.ink : colors.line, padding: 14, gap: 2 }}>
      <Text style={[typography.small, { color: dark ? colors.mutedOnDark : colors.muted }]}>{title}</Text>
      <Text style={[typography.statNumber, { color: dark ? colors.brassLight : colors.ink, fontSize: 34 }]}>{value}</Text>
      <Text style={[typography.small, { color: dark ? colors.mutedOnDark : colors.muted, fontSize: 11 }]}>{note}</Text>
    </Card>
  );
}

export default function HomeScreen() {
  const query = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });
  const { refetch } = query;
  useFocusEffect(useCallback(() => {
    const timer = setInterval(() => void refetch(), 20_000);
    return () => clearInterval(timer);
  }, [refetch]));
  const data = query.data;
  const actions = [
    { title: 'Add product', Icon: Camera, route: '/product/new', bg: colors.brassLight },
    { title: 'Change price', Icon: IndianRupee, route: '/(tabs)/products', bg: colors.card },
    { title: 'New bill', Icon: Receipt, route: '/bill/new', bg: colors.card },
    { title: 'Categories', Icon: Grid2X2, route: '/categories', bg: colors.card },
  ];

  return (
    <Screen scroll={false}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.brassDark} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: colors.charcoal, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.brassLight, alignItems: 'center', justifyContent: 'center' }}>
              <TrishulIcon size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.devanagari, { color: colors.brassLight, fontSize: 12 }]}>जय माता दी</Text>
              <Text style={[typography.cardTitle, { color: colors.stone, fontSize: 23 }]}>Shree Durga Tiles</Text>
            </View>
            <Pressable onPress={() => router.push('/notifications')} accessibilityLabel="Notifications" style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(237,234,228,0.3)', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color={colors.stone} strokeWidth={1.8} />
              {data?.newEnquiries ? <View style={{ position: 'absolute', top: -1, right: -1, width: 17, height: 17, borderRadius: 9, backgroundColor: colors.brassLight, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.ink, fontSize: 10, fontWeight: '800' }}>{data.newEnquiries}</Text></View> : null}
            </Pressable>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/visitors')} style={{ minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(176,141,87,.45)', backgroundColor: 'rgba(176,141,87,.12)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.liveDot }} />
            <Text style={[typography.small, { color: colors.stone, flex: 1 }]}><Text style={{ fontWeight: '800' }}>{data?.liveVisitors ?? 0} people</Text> are on your website now</Text>
            <ArrowRight size={17} color={colors.brassLight} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 18 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Stat title="Visitors today" value={String(data?.visitorsToday ?? '—')} note={`${data?.pageViewsToday ?? 0} pages viewed`} />
            <Stat title="New enquiries" value={String(data?.newEnquiries ?? '—')} note="Website requests" />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Stat title="Products live" value={String(data?.publishedProducts ?? data?.products ?? '—')} note={`${data?.draftProducts ?? 0} in draft`} />
            <Stat title="Payment due" value={formatCompactRupees(data?.paymentDue ?? 0)} note="Open bills" dark />
          </View>

          <View style={{ gap: 10 }}>
            <Text style={[typography.eyebrow, { color: colors.brassDark }]}>QUICK ACTIONS</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              {actions.map(({ title, Icon, route, bg }) => (
                <Pressable key={title} onPress={() => router.push(route as never)} style={{ flex: 1, minHeight: 76, borderRadius: 18, backgroundColor: bg, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 6 }}>
                  <Icon size={19} color={colors.ink} strokeWidth={1.8} />
                  <Text style={[typography.small, { fontSize: 10, color: colors.ink, textAlign: 'center' }]}>{title}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.sectionTitle, { color: colors.ink, flex: 1 }]}>Recent visitors</Text>
              <Pressable onPress={() => router.push('/(tabs)/visitors')}><Text style={[typography.small, { color: colors.brassDark }]}>See all</Text></Pressable>
            </View>
            {(data?.recentVisitors ?? []).slice(0, 3).map((visitor) => (
              <Card key={visitor._id} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.stone100, alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={17} color={colors.brassDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.label, { color: colors.ink }]}>{visitor.city ? `Visitor from ${visitor.city}` : 'Website visitor'}</Text>
                  <Text style={[typography.small, { color: colors.muted }]}>{visitor.device} · {new Date(visitor.lastSeenAt).toLocaleTimeString()}</Text>
                </View>
                <Badge label={visitor.enquiryId ? 'ENQUIRY' : 'LIVE'} variant={visitor.enquiryId ? 'enquiry' : 'live'} dot />
              </Card>
            ))}
            {!data?.recentVisitors?.length ? <Text style={[typography.small, { color: colors.muted }]}>Visitor activity will appear here.</Text> : null}
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.sectionTitle, { color: colors.ink, flex: 1 }]}>Recent bills</Text>
              <Pressable onPress={() => router.push('/(tabs)/bills')}><Text style={[typography.small, { color: colors.brassDark }]}>See all</Text></Pressable>
            </View>
            {(data?.recentBills ?? []).slice(0, 3).map((bill) => (
              <Card key={bill._id} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Receipt size={19} color={colors.brassDark} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.label, { color: colors.ink }]}>{bill.customerName}</Text>
                  <Text style={[typography.small, { color: colors.muted }]}>{bill.billNo ?? bill._id}</Text>
                </View>
                <Text style={[typography.label, { color: colors.ink }]}>₹{Number(bill.grandTotal).toLocaleString('en-IN')}</Text>
              </Card>
            ))}
            {!data?.recentBills?.length ? <Text style={[typography.small, { color: colors.muted }]}>Your recent bills will appear here.</Text> : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
