import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Plus, Receipt } from 'lucide-react-native';
import { billsApi } from '@/api/endpoints';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { colors, typography } from '@/theme';
import { formatRupees } from '@/lib/format';
import { Screen } from '@/components/layout/Screen';

export default function BillsScreen() {
  const bills = useQuery({ queryKey: ['bills'], queryFn: () => billsApi.list({ page: 1, limit: 50 }) });
  return (
    <Screen scroll={false}>
      <ScreenHeader title="Bills" subtitle="GST invoices and payments" right={<Pressable onPress={() => router.push('/bill/new')} style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.brassLight, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 }}><Plus size={17} color={colors.ink} /><Text style={[typography.small, { color: colors.ink }]}>New bill</Text></Pressable>}>
        <View style={{ flexDirection: 'row', gap: 8 }}><Chip label="All bills" selected /><Chip label="Draft" /><Chip label="Due" /><Chip label="Paid" /></View>
      </ScreenHeader>
      <FlatList
        data={bills.data?.data ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 11 }}
        refreshControl={<RefreshControl refreshing={bills.isRefetching} onRefresh={() => void bills.refetch()} tintColor={colors.brassDark} />}
        renderItem={({ item }) => {
          const due = Number(item.balanceDue);
          return (
            <Pressable onPress={() => router.push(`/bill/${item._id}`)}>
              <Card style={{ padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.brassTint, alignItems: 'center', justifyContent: 'center' }}><Receipt size={19} color={colors.brassDark} /></View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[typography.cardTitle, { color: colors.ink }]}>{item.customerName}</Text>
                  <Text style={[typography.small, { color: colors.muted }]}>{item.billNo ?? 'Draft'} · {new Date(item.billDate).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                  <Text style={[typography.label, { color: colors.ink }]}>{formatRupees(Number(item.grandTotal))}</Text>
                  <Badge label={item.status === 'draft' ? 'DRAFT' : due > 0 ? `DUE ${formatRupees(due)}` : 'PAID'} variant={item.status === 'draft' ? 'draft' : due > 0 ? 'due' : 'paid'} />
                </View>
                <ArrowRight size={16} color={colors.muted} />
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          bills.isLoading ? <Text style={[typography.body, { color: colors.muted, textAlign: 'center', paddingTop: 32 }]}>Loading bills…</Text> :
            <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 28, marginTop: 10 }}><Receipt color={colors.brassDark} /><Text style={[typography.cardTitle, { color: colors.ink }]}>No bills yet</Text><Text style={[typography.small, { color: colors.muted }]}>Create your first customer invoice.</Text><Pressable onPress={() => router.push('/bill/new')}><Text style={[typography.label, { color: colors.brassDark }]}>Create bill →</Text></Pressable></Card>
        }
      />
    </Screen>
  );
}
