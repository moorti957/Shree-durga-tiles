import { useCallback, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, Camera, Grid2X2, IndianRupee, MessageSquareText, Receipt, Users } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { billsApi, dashboardApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { TrishulIcon } from '@/components/brand/TrishulIcon';
import { colors, typography } from '@/theme';
import { formatCompactRupees } from '@/lib/format';
import { OwnerDrawer } from '@/components/layout/OwnerDrawer';

function Stat({ title, value, note, dark }: { title: string; value: string; note: string; dark?: boolean }) {
  return (
    <Card style={{ flex: 1, minHeight: 94, backgroundColor: dark ? colors.ink : colors.card, borderColor: dark ? colors.ink : colors.line, padding: 11, gap: 2 }}>
      <Text style={[typography.small, { color: dark ? colors.mutedOnDark : colors.muted }]}>{title}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[typography.statNumber, { color: dark ? colors.brassLight : colors.ink }]}>{value}</Text>
      <Text numberOfLines={1} style={[typography.small, { color: dark ? colors.mutedOnDark : colors.muted, fontSize: 10 }]}>{note}</Text>
    </Card>
  );
}

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const query = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });
  const settings = useQuery({ queryKey: ['shop-settings'], queryFn: billsApi.settings });
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
        <View style={{ backgroundColor: colors.charcoal, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Pressable
              onPress={() => setDrawerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Open owner profile menu"
              style={{ width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.brassLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
            >
              {settings.data?.logo ? <Image source={{ uri: settings.data.logo }} style={{ width: 36, height: 36 }} resizeMode="cover" /> : <TrishulIcon size={24} />}
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={[typography.devanagari, { color: colors.brassLight, fontSize: 12 }]}>जय माता दी</Text>
              <Text numberOfLines={1} style={[typography.cardTitle, { color: colors.stone, fontSize: 20 }]}>Shree Durga Tiles</Text>
            </View>
            <Pressable onPress={() => router.push('/notifications')} accessibilityLabel="Notifications" style={{ width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(237,234,228,0.3)', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color={colors.stone} strokeWidth={1.8} />
              {data?.newEnquiries ? <View style={{ position: 'absolute', top: -1, right: -1, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, backgroundColor: colors.brassLight, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.ink, fontSize: 9, fontWeight: '800' }}>{data.newEnquiries}</Text></View> : null}
            </Pressable>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/visitors')} style={{ minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(176,141,87,.45)', backgroundColor: 'rgba(176,141,87,.12)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.liveDot }} />
            <Text numberOfLines={1} style={[typography.small, { color: colors.stone, flex: 1 }]}><Text style={{ fontWeight: '800' }}>{data?.liveVisitors ?? 0} people</Text> are on your website now</Text>
            <ArrowRight size={15} color={colors.brassLight} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Stat title="Visitors today" value={String(data?.visitorsToday ?? '—')} note={`${data?.pageViewsToday ?? 0} pages viewed`} />
            <Stat title="New enquiries" value={String(data?.newEnquiries ?? '—')} note="Website requests" />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Stat title="Products live" value={String(data?.publishedProducts ?? data?.products ?? '—')} note={`${data?.draftProducts ?? 0} in draft`} />
            <Stat title="Payment due" value={formatCompactRupees(data?.paymentDue ?? 0)} note="Open bills" dark />
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.card }}>
            {[['Bills', data?.bills], ['Categories', data?.categories], ['Page views', data?.pageViewsToday]].map(([label, value], index) => (
              <View key={String(label)} style={{ flex: 1, borderLeftWidth: index ? 1 : 0, borderLeftColor: colors.line, paddingLeft: index ? 10 : 0 }}>
                <Text style={[typography.label, { color: colors.ink }]}>{value ?? '—'}</Text>
                <Text style={[typography.small, { color: colors.muted, fontSize: 10 }]}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={{ gap: 10 }}>
            <Text style={[typography.eyebrow, { color: colors.brassDark }]}>QUICK ACTIONS</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {actions.map(({ title, Icon, route, bg }) => (
                <Pressable key={title} onPress={() => router.push(route as never)} style={{ flex: 1, minHeight: 62, borderRadius: 10, backgroundColor: bg, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 5 }}>
                  <Icon size={17} color={colors.ink} strokeWidth={1.8} />
                  <Text numberOfLines={1} style={[typography.small, { fontSize: 9, color: colors.ink, textAlign: 'center' }]}>{title}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.sectionTitle, { color: colors.ink, flex: 1 }]}>Recent visitors</Text>
              <Pressable onPress={() => router.push('/(tabs)/visitors')}><Text style={[typography.small, { color: colors.brassDark }]}>See all</Text></Pressable>
            </View>
            {(data?.recentVisitors ?? []).slice(0, 3).map((visitor) => (
              <Card key={visitor._id} style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: colors.stone100, alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color={colors.brassDark} />
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

          <View style={{ gap: 8 }}>
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

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.sectionTitle, { color: colors.ink, flex: 1 }]}>Recent enquiries</Text>
              <Pressable onPress={() => router.push('/(tabs)/visitors')}><Text style={[typography.small, { color: colors.brassDark }]}>See all</Text></Pressable>
            </View>
            {(data?.recentEnquiries ?? []).slice(0, 3).map((enquiry) => (
              <Pressable key={enquiry._id} onPress={() => router.push(`/enquiry/${enquiry._id}`)}>
                <Card style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                  <MessageSquareText size={17} color={colors.brassDark} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={[typography.label, { color: colors.ink }]}>{enquiry.name}</Text>
                    <Text numberOfLines={1} style={[typography.small, { color: colors.muted }]}>{enquiry.need}</Text>
                  </View>
                  <Badge label={enquiry.status.toUpperCase()} variant={enquiry.status === 'new' ? 'enquiry' : 'neutral'} />
                </Card>
              </Pressable>
            ))}
            {!data?.recentEnquiries?.length ? <Text style={[typography.small, { color: colors.muted }]}>Your recent enquiries will appear here.</Text> : null}
          </View>
        </View>
      </ScrollView>
      <OwnerDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </Screen>
  );
}
