import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react-native';
import { billsApi } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { calculateBill } from '@/features/bills/calc';
import { billSchema, type BillFormInput, type BillFormValues } from '@/features/bills/schema';
import { formatRupees, formatUnit } from '@/lib/format';
import { colors, typography } from '@/theme';

const blankItem = (): BillFormValues['items'][number] => ({ name: '', size: '', qty: 1, unit: 'sq_ft', rate: 0 });

export default function NewBillScreen() {
  const params = useLocalSearchParams<{ enquiryId?: string; name?: string; phone?: string }>();
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ['shop-settings'], queryFn: billsApi.settings });
  const [items, setItems] = useState<BillFormValues['items']>([blankItem()]);
  const [gst, setGst] = useState(true);
  const [cod, setCod] = useState(true);
  const [advance, setAdvance] = useState('0');
  const [advanceMode, setAdvanceMode] = useState<BillFormValues['advanceMode']>('none');
  const [discount, setDiscount] = useState('0');
  const [delivery, setDelivery] = useState('0');
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<BillFormInput, unknown, BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      customerName: params.name ?? '',
      customerPhone: params.phone ?? '',
      isGstBill: true,
      gstRate: settings.data?.defaultGstRate ?? 18,
      deliveryType: 'pickup',
      deliveryCharge: 0,
      discount: 0,
      advanceAmount: 0,
      advanceMode: 'none',
      isCod: true,
      items: [blankItem()],
    },
  });
  const gstRate = settings.data?.defaultGstRate ?? 18;
  const totals = useMemo(() => calculateBill({
    items: items.map((item) => ({ qty: Number(item.qty), rate: Number(item.rate) })),
    deliveryCharge: Number(delivery) || 0,
    discount: Number(discount) || 0,
    gstRate,
    isGstBill: gst,
    advanceAmount: Number(advance) || 0,
  }), [advance, delivery, discount, gst, gstRate, items]);
  const create = useMutation({
    mutationFn: async (values: BillFormValues) => billsApi.create({
      ...values,
      items: items.map((item) => ({ ...item, amount: Number(item.qty) * Number(item.rate) })),
      isGstBill: gst,
      gstRate,
      isCod: cod,
      advanceAmount: Number(advance) || 0,
      advanceMode: Number(advance) > 0 ? advanceMode : 'none',
      discount: Number(discount) || 0,
      deliveryCharge: Number(delivery) || 0,
      enquiryId: params.enquiryId,
    }),
    onSuccess: async (bill) => {
      await queryClient.invalidateQueries({ queryKey: ['bills'] });
      router.replace(`/bill/${bill._id}`);
    },
    onError: (error) => Alert.alert('Could not create bill', error.message),
  });

  const setBillItems = (updated: BillFormValues['items']) => {
    setItems(updated);
    setValue('items', updated, { shouldValidate: true });
  };
  const updateItem = (index: number, patch: Partial<typeof items[number]>) =>
    setBillItems(items.map((item, position) => position === index ? { ...item, ...patch } : item));
  const addItem = () => setBillItems([...items, blankItem()]);
  const removeItem = (index: number) => setBillItems(items.filter((_, position) => position !== index));

  return (
    <Screen>
      <ScreenHeader title="Create bill" subtitle="A new GST invoice for your customer" back />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}>
          <Card style={{ gap: 10 }}>
            <Text style={[typography.eyebrow, { color: colors.brassDark }]}>CUSTOMER DETAILS</Text>
            <Controller control={control} name="customerName" render={({ field }) => <TextField label="Customer name" placeholder="Enter customer name" value={field.value} onChangeText={field.onChange} error={errors.customerName?.message} />} />
            <Controller control={control} name="customerPhone" render={({ field }) => <TextField label="Mobile number" placeholder="10-digit number" keyboardType="phone-pad" value={field.value ?? ''} onChangeText={field.onChange} />} />
            <Controller control={control} name="customerAddress" render={({ field }) => <TextField label="Billing address" placeholder="Address (optional)" multiline value={field.value ?? ''} onChangeText={field.onChange} />} />
            <Text style={[typography.small, { color: colors.muted }]}>Bill from {settings.data?.shopName ?? 'your shop'} · GSTIN {settings.data?.gstin || 'Not set in shop settings'}</Text>
          </Card>

          <View style={{ gap: 10 }}>
            <Text style={[typography.sectionTitle, { color: colors.ink }]}>Bill items</Text>
            {items.map((item, index) => (
              <Card key={index} style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[typography.label, { color: colors.ink, flex: 1 }]}>ITEM {index + 1}</Text>
                  {items.length > 1 ? <Button label="Remove" variant="outline" compact icon={Trash2} onPress={() => removeItem(index)} /> : null}
                </View>
                <TextField label="Product / material" placeholder="e.g. Makrana White Marble" value={item.name} onChangeText={(name) => updateItem(index, { name })} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}><TextField label="Quantity" keyboardType="decimal-pad" value={String(item.qty)} onChangeText={(value) => updateItem(index, { qty: Number(value) || 0 })} /></View>
                  <View style={{ flex: 1 }}><TextField label="Rate (₹)" keyboardType="decimal-pad" value={String(item.rate || '')} onChangeText={(value) => updateItem(index, { rate: Number(value) || 0 })} /></View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>{(['sq_ft', 'box', 'piece'] as const).map((unit) => <View key={unit} style={{ flex: 1 }}><Chip label={formatUnit(unit)} selected={item.unit === unit} onPress={() => updateItem(index, { unit })} /></View>)}</View>
                <Text style={[typography.label, { color: colors.ink, textAlign: 'right' }]}>{formatRupees(item.qty * item.rate)}</Text>
              </Card>
            ))}
            <Button label="Add another item" variant="outline" icon={Plus} onPress={addItem} />
          </View>

          <Card style={{ gap: 10 }}>
            <Text style={[typography.eyebrow, { color: colors.brassDark }]}>GST & PAYMENT</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}><Chip label="GST bill" selected={gst} onPress={() => setGst(true)} /><Chip label="Non-GST" selected={!gst} onPress={() => setGst(false)} /><Text style={[typography.small, { color: colors.muted, alignSelf: 'center' }]}>{gstRate}%</Text></View>
            <TextField label="Discount (₹)" keyboardType="decimal-pad" value={discount} onChangeText={setDiscount} />
            <TextField label="Delivery charge (₹)" keyboardType="decimal-pad" value={delivery} onChangeText={setDelivery} />
            <TextField label="Advance received (₹)" keyboardType="decimal-pad" value={advance} onChangeText={setAdvance} />
            {Number(advance) > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(['cash', 'upi', 'bank', 'cheque'] as const).map((mode) => (
                  <Chip key={mode} label={mode.toUpperCase()} selected={advanceMode === mode} onPress={() => setAdvanceMode(mode)} />
                ))}
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 8 }}><Chip label="Cash on delivery balance" selected={cod} onPress={() => setCod(true)} /><Chip label="No COD" selected={!cod} onPress={() => setCod(false)} /></View>
            <View style={{ borderTopColor: colors.line, borderTopWidth: 1, paddingTop: 11, gap: 7 }}>
              <SummaryLine label="Subtotal" amount={totals.subtotal} />
              {Number(delivery) > 0 ? <SummaryLine label="Delivery charge" amount={Number(delivery)} /> : null}
              {Number(discount) > 0 ? <SummaryLine label="Discount" amount={-Number(discount)} /> : null}
              {gst ? <SummaryLine label="GST" amount={totals.cgst + totals.sgst + totals.igst} /> : null}
              {totals.roundOff !== 0 ? <SummaryLine label="Round off" amount={totals.roundOff} /> : null}
              <SummaryLine label="Grand total" amount={totals.grandTotal} strong />
              <SummaryLine label="Balance due" amount={totals.balanceDue} strong />
            </View>
          </Card>
          <Button label="Review bill" loading={create.isPending} disabled={!items.some((item) => item.name.trim() && item.qty > 0)} onPress={() => void handleSubmit((values) => create.mutate(values))()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SummaryLine({ label, amount, strong }: { label: string; amount: number; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[strong ? typography.label : typography.small, { flex: 1, color: strong ? colors.ink : colors.muted }]}>{label}</Text>
      <Text style={[strong ? typography.label : typography.small, { color: colors.ink }]}>{formatRupees(amount)}</Text>
    </View>
  );
}
