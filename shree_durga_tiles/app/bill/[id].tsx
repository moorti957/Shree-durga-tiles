import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Printer, Share2 } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { billsApi } from '@/api/endpoints';
import { USE_MOCK_API } from '@/config/env';
import type { Bill, ShopSettings } from '@/api/types';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { formatRupees, formatUnit } from '@/lib/format';
import { colors, radii, typography } from '@/theme';

export default function BillPreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const billId = Array.isArray(id) ? id[0] ?? '' : id ?? '';
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'bank' | 'cheque'>('cash');
  const bill = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => {
      if (!billId) throw new Error('The bill link is missing its ID.');
      return billsApi.get(billId);
    },
    enabled: Boolean(billId),
  });
  const settings = useQuery({ queryKey: ['shop-settings'], queryFn: billsApi.settings });
  const finalize = useMutation({
    mutationFn: () => billsApi.finalize(billId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['bill', billId] }),
    onError: (error) => Alert.alert('Could not finalize bill', error.message),
  });
  const cancel = useMutation({
    mutationFn: () => billsApi.cancel(billId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['bill', billId] }),
    onError: (error) => Alert.alert('Could not cancel bill', error.message),
  });
  const payment = useMutation({
    mutationFn: () => billsApi.addPayment(billId, { amount: Number(paymentAmount), mode: paymentMode }),
    onSuccess: async () => {
      setPaymentOpen(false);
      setPaymentAmount('');
      await queryClient.invalidateQueries({ queryKey: ['bill', billId] });
    },
    onError: (error) => Alert.alert('Could not record payment', error.message),
  });
  const share = async () => {
    if (!bill.data) return;
    setBusy(true);
    try {
      const link = await billsApi.shareLink(billId);
      const file = bill.data.status === 'final' && !USE_MOCK_API
        ? await billsApi.downloadPdf(billId)
        : await Print.printToFileAsync({ html: billHtml(bill.data, settings.data) });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'Share GST bill' });
      } else {
        await Share.share({ message: link.message, url: link.url });
      }
    } catch (error) {
      Alert.alert('Could not share bill', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const print = async () => {
    if (!bill.data) return;
    try {
      if (bill.data.status === 'final' && !USE_MOCK_API) {
        const file = await billsApi.downloadPdf(billId);
        await Print.printAsync({ uri: file.uri });
      } else {
        await Print.printAsync({ html: billHtml(bill.data, settings.data) });
      }
    } catch (error) {
      Alert.alert('Could not print bill', error instanceof Error ? error.message : 'Please try again.');
    }
  };
  const download = async () => {
    if (!bill.data) return;
    try {
      const file = bill.data.status === 'final' && !USE_MOCK_API
        ? await billsApi.downloadPdf(billId)
        : await Print.printToFileAsync({ html: billHtml(bill.data, settings.data) });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf' });
      else if (bill.data.status === 'final' && !USE_MOCK_API) await Print.printAsync({ uri: file.uri });
      else await Print.printAsync({ html: billHtml(bill.data, settings.data) });
    } catch (error) {
      Alert.alert('Could not download PDF', error instanceof Error ? error.message : 'Please try again.');
    }
  };
  if (!billId) {
    return (
      <Screen>
        <ScreenHeader title="Bill preview" back />
        <BillErrorState message="The bill link is missing its ID." onRetry={() => void bill.refetch()} />
      </Screen>
    );
  }
  if (bill.isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Bill preview" back />
        <View accessibilityLabel="Loading bill" style={{ padding: 20, gap: 14 }}>
          <ActivityIndicator color={colors.brassDark} />
          <View style={{ height: 190, borderRadius: radii.card, backgroundColor: colors.card }} />
          <View style={{ height: 110, borderRadius: radii.card, backgroundColor: colors.card }} />
        </View>
      </Screen>
    );
  }
  if (bill.error || !bill.data) {
    const message = getErrorMessage(bill.error);
    return (
      <Screen>
        <ScreenHeader title="Bill preview" back />
        <BillErrorState message={message} onRetry={() => void bill.refetch()} />
      </Screen>
    );
  }
  const data = bill.data;
  const due = Number.isFinite(data.balanceDue) ? data.balanceDue : 0;
  const items = Array.isArray(data.items) ? data.items : [];
  const qrPayload = [data.qrPayload, data.verificationUrl].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );

  return (
    <Screen>
      <ScreenHeader title="Bill preview" subtitle={data.billNo ?? 'Draft bill'} back />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}>
        <Card style={{ padding: 14, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            {settings.data?.showLogo !== false && settings.data?.logo ? (
              <Image source={{ uri: settings.data.logo }} style={{ width: 48, height: 48, borderRadius: 8 }} resizeMode="contain" />
            ) : (
              <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.brassTint, borderWidth: 1, borderColor: colors.brassLight, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[typography.cardTitle, { color: colors.brassDark }]}>SD</Text>
              </View>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.cardTitle, { color: colors.ink, fontSize: 20 }]}>{settings.data?.shopName ?? 'Shree Durga Tiles'}</Text>
              {settings.data?.tagline ? <Text style={[typography.small, { color: colors.brassDark, fontSize: 11 }]}>{settings.data.tagline}</Text> : null}
              {settings.data?.address ? <Text style={[typography.small, { color: colors.muted, lineHeight: 17 }]}>{settings.data.address}</Text> : null}
              {settings.data?.phone ? <Text style={[typography.small, { color: colors.muted }]}>{settings.data.phone}</Text> : null}
              {settings.data?.email ? <Text style={[typography.small, { color: colors.muted }]}>{settings.data.email}</Text> : null}
              {settings.data?.showGstin !== false && settings.data?.gstin ? <Text style={[typography.small, { color: colors.muted }]}>GSTIN: {settings.data.gstin}</Text> : null}
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.eyebrow, { color: colors.brassDark }]}>{settings.data?.invoiceTitle || 'TAX INVOICE'}</Text>
              <Text style={[typography.sectionTitle, { color: colors.ink, fontSize: 24 }]}>{data.billNo ?? 'Draft bill'}</Text>
            </View>
            <Badge label={data.status.toUpperCase()} variant={data.status === 'draft' ? 'draft' : 'paid'} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, backgroundColor: colors.brassWash, borderRadius: 8, padding: 10 }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[typography.eyebrow, { color: colors.brassDark }]}>BILL TO</Text>
              <Text style={[typography.label, { color: colors.ink }]}>{data.customerName}</Text>
              {data.customerPhone ? <Text style={[typography.small, { color: colors.muted }]}>{data.customerPhone}</Text> : null}
              {data.customerAddress ? <Text style={[typography.small, { color: colors.muted }]}>{data.customerAddress}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <Text style={[typography.small, { color: colors.muted }]}>Date</Text>
              <Text style={[typography.label, { color: colors.ink }]}>{billDateLabel(data.billDate)}</Text>
              <Text style={[typography.small, { color: colors.muted }]}>Status: {data.status.toUpperCase()}</Text>
              {(data.payments?.length ?? 0) > 0 ? <Text style={[typography.small, { color: colors.muted }]}>{data.payments?.length} payment(s)</Text> : null}
            </View>
          </View>
          <View style={{ gap: 0, borderWidth: 1, borderColor: colors.line, borderRadius: 8, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', backgroundColor: colors.ink, paddingHorizontal: 10, paddingVertical: 9 }}>
              <Text style={[typography.eyebrow, { color: colors.stone, width: 30 }]}>No.</Text>
              <Text style={[typography.eyebrow, { color: colors.stone, flex: 1 }]}>Item</Text>
              <Text style={[typography.eyebrow, { color: colors.stone, width: 78, textAlign: 'right' }]}>Qty / Amount</Text>
            </View>
            {items.map((item, index) => (
              <View key={`${item.name}-${index}`} style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.line, gap: 8 }}>
                <Text style={[typography.small, { color: colors.muted, width: 30 }]}>{index + 1}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[typography.label, { color: colors.ink }]}>{item.name}</Text>
                  {item.size ? <Text style={[typography.small, { color: colors.muted }]}>{item.size}</Text> : null}
                  <Text style={[typography.small, { color: colors.muted }]}>{item.qty} {formatUnit(item.unit)} × {formatRupees(item.rate)}</Text>
                </View>
                <Text style={[typography.label, { color: colors.ink, width: 78, textAlign: 'right' }]}>{formatRupees(item.amount)}</Text>
              </View>
            ))}
          </View>
          <View style={{ alignSelf: 'stretch', borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, gap: 7 }}>
            <InvoiceLine label="Subtotal" value={Number(data.subtotal)} />
            {Number(data.discount ?? 0) > 0 ? <InvoiceLine label="Item / additional discount" value={-Number(data.discount)} /> : null}
            {Number(data.taxableAmount ?? data.subtotal) !== Number(data.subtotal) ? <InvoiceLine label="Taxable amount" value={Number(data.taxableAmount ?? data.subtotal)} /> : null}
            {Number(data.deliveryCharge ?? 0) > 0 ? <InvoiceLine label="Other charges" value={Number(data.deliveryCharge)} /> : null}
            {data.isGstBill ? <><InvoiceLine label="CGST" value={Number(data.cgst)} /><InvoiceLine label="SGST" value={Number(data.sgst)} /><InvoiceLine label="IGST" value={Number(data.igst)} /></> : null}
            <View style={{ minHeight: 40, borderRadius: 8, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
              <Text style={[typography.label, { color: colors.stone, flex: 1 }]}>Grand total</Text>
              <Text style={[typography.cardTitle, { color: colors.brassLight }]}>{formatRupees(Number(data.grandTotal))}</Text>
            </View>
            <InvoiceLine label="Amount paid" value={Math.max(0, Number(data.grandTotal) - due)} />
            <InvoiceLine label="Balance due" value={due} strong />
          </View>
          {data.amountInWords ? <View style={{ backgroundColor: colors.stone100, borderRadius: 8, padding: 10 }}><Text style={[typography.eyebrow, { color: colors.brassDark }]}>AMOUNT IN WORDS</Text><Text style={[typography.label, { color: colors.ink, marginTop: 4 }]}>{data.amountInWords}</Text></View> : null}
          {data.isCod ? <Text style={[typography.label, { color: colors.danger }]}>COD BALANCE · {formatRupees(due)}</Text> : null}
          {(data.payments?.length ?? 0) > 0 ? (
            <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10 }}>
              <Text style={[typography.eyebrow, { color: colors.brassDark }]}>PAYMENT HISTORY</Text>
              {data.payments?.map((payment, index) => (
                <View key={`${payment.mode}-${payment.paidAt ?? index}`} style={{ flexDirection: 'row' }}>
                  <Text style={[typography.small, { color: colors.muted, flex: 1 }]}>{payment.mode.toUpperCase()}</Text>
                  <Text style={[typography.label, { color: colors.ink }]}>{formatRupees(payment.amount)}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {qrPayload ? (
            <View style={{ alignItems: 'center', gap: 6, paddingTop: 6 }}>
              <QRCode value={qrPayload} size={86} color={colors.ink} backgroundColor={colors.card} />
              <Text style={[typography.small, { color: colors.muted }]}>Scan to verify bill</Text>
            </View>
          ) : null}
          {settings.data?.showSignature !== false ? (
            <View style={{ alignItems: 'flex-end', minHeight: 82, justifyContent: 'flex-end', paddingTop: 8 }}>
              {settings.data?.ownerSignature ? <Image source={{ uri: settings.data.ownerSignature }} style={{ width: 150, height: 48 }} resizeMode="contain" /> : <View style={{ width: 150, height: 48, borderBottomWidth: 1, borderBottomColor: colors.line }} />}
              <Text style={[typography.label, { color: colors.ink, fontSize: 12 }]}>{settings.data?.ownerName || 'Authorized Signatory'}</Text>
              <Text style={[typography.small, { color: colors.muted, fontSize: 11 }]}>Authorized Signatory</Text>
            </View>
          ) : null}
          {settings.data?.defaultInvoiceNotes ? <Text style={[typography.small, { color: colors.muted }]}>{settings.data.defaultInvoiceNotes}</Text> : null}
          {settings.data?.invoiceTerms ? <Text style={[typography.small, { color: colors.muted }]}>{settings.data.invoiceTerms}</Text> : null}
          {settings.data?.returnPolicy ? <Text style={[typography.small, { color: colors.muted }]}>Return / refund: {settings.data.returnPolicy}</Text> : null}
          <Text style={[typography.small, { color: colors.muted, textAlign: 'center' }]}>{settings.data?.invoiceFooterNote || 'Thank you for choosing Shree Durga Tiles'}</Text>
        </Card>
        <Button label="Share PDF on WhatsApp" variant="success" icon={Share2} loading={busy} onPress={() => void share()} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label="Download" variant="outline" compact icon={Download} style={{ flex: 1 }} onPress={() => void download()} />
          <Button label="Print" variant="outline" compact icon={Printer} style={{ flex: 1 }} onPress={() => void print()} />
        </View>
        {data.status === 'draft' ? (
          <Button
            label="Finalize bill"
            loading={finalize.isPending}
            onPress={() => Alert.alert('Finalize bill?', 'A bill number will be assigned and the invoice can no longer be edited.', [
              { text: 'Not now', style: 'cancel' },
              { text: 'Finalize', onPress: () => finalize.mutate() },
            ])}
          />
        ) : null}
        {data.status === 'final' ? (
          <>
            {due > 0 ? <Button label="Record payment" variant="success" onPress={() => { setPaymentAmount(String(due)); setPaymentOpen(true); }} /> : null}
            <Button
              label="Cancel bill"
              variant="outline"
              loading={cancel.isPending}
              onPress={() => Alert.alert('Cancel this bill?', 'The bill will remain in the record but will no longer be valid.', [
                { text: 'Keep bill', style: 'cancel' },
                { text: 'Cancel bill', style: 'destructive', onPress: () => cancel.mutate() },
              ])}
            />
          </>
        ) : null}
      </ScrollView>
      <Modal visible={paymentOpen} transparent animationType="slide" onRequestClose={() => setPaymentOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.dim }}>
          <View style={{ backgroundColor: colors.stone, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, padding: 16, paddingBottom: 24, gap: 12 }}>
            <Text style={[typography.sectionTitle, { color: colors.ink }]}>Record payment</Text>
            <Text style={[typography.small, { color: colors.muted }]}>Balance due: {formatRupees(due)}</Text>
            <TextInput
              accessibilityLabel="Payment amount"
              keyboardType="decimal-pad"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="Amount in rupees"
              style={[typography.body, { minHeight: 46, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radii.control, paddingHorizontal: 12, color: colors.ink }]}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['cash', 'upi', 'bank', 'cheque'] as const).map((mode) => (
                <Chip key={mode} label={mode.toUpperCase()} selected={paymentMode === mode} onPress={() => setPaymentMode(mode)} />
              ))}
            </View>
            <Button
              label="Save payment"
              loading={payment.isPending}
              disabled={!Number.isFinite(Number(paymentAmount)) || Number(paymentAmount) <= 0 || Number(paymentAmount) > due}
              onPress={() => payment.mutate()}
            />
            <Button label="Close" variant="outline" onPress={() => setPaymentOpen(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The bill could not be loaded. Please try again.';
}

function BillErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 14 }}>
      <Text style={[typography.sectionTitle, { color: colors.ink }]}>Bill unavailable</Text>
      <Text accessibilityRole="alert" style={[typography.body, { color: colors.muted }]}>{message}</Text>
      <Button label="Retry" onPress={onRetry} />
    </View>
  );
}

function InvoiceLine({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return <View style={{ flexDirection: 'row' }}><Text style={[strong ? typography.label : typography.small, { color: colors.muted, flex: 1 }]}>{label}</Text><Text style={[strong ? typography.label : typography.small, { color: colors.ink }]}>{formatRupees(value)}</Text></View>;
}

function billHtml(bill: Bill, settings?: ShopSettings) {
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
  const rows = (bill.items ?? []).map((item, index) => `
    <tr><td>${index + 1}</td><td>${escapeHtml(item.name)}</td>
    <td>${escapeHtml(item.size ?? '')}</td><td>${item.qty} ${formatUnit(item.unit)}</td><td>${formatRupees(Number(item.rate))}</td>
    <td>${formatRupees(Number(item.amount))}</td></tr>`).join('');
  const totals = [
    ['Subtotal', Number(bill.subtotal)],
    ...(Number(bill.deliveryCharge ?? 0) > 0 ? [['Delivery', Number(bill.deliveryCharge ?? 0)] as [string, number]] : []),
    ...(Number(bill.discount ?? 0) > 0 ? [['Discount', -Number(bill.discount ?? 0)] as [string, number]] : []),
    ...(bill.isGstBill ? [
      ['CGST', Number(bill.cgst)] as [string, number],
      ['SGST', Number(bill.sgst)] as [string, number],
      ['IGST', Number(bill.igst)] as [string, number],
    ] : []),
    ['Grand total', Number(bill.grandTotal)],
    ['Advance received', Number(bill.advanceAmount)],
    ['Balance due', Number(bill.balanceDue)],
  ].map(([label, amount]) => `<tr><th>${label}</th><td>${formatRupees(amount)}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;color:#202124;padding:28px}header{border-bottom:2px solid #b89455;padding-bottom:14px}
    .brand{display:flex;align-items:center;gap:12px}.brand img{width:54px;height:54px;object-fit:contain}
    h1{margin:0 0 4px;font-size:24px}h2{font-size:18px;margin:18px 0 6px}
    .meta{display:flex;justify-content:space-between;margin:18px 0}table{width:100%;border-collapse:collapse;margin-top:18px}
    th,td{border-bottom:1px solid #ddd;padding:9px;text-align:left}th:last-child,td:last-child{text-align:right}
    thead th{background:#17181b;color:white;text-transform:uppercase;font-size:11px}
    .summary{width:50%;margin-left:auto}.summary th{font-weight:normal}.summary tr:nth-last-child(3) th,
    .summary tr:nth-last-child(3) td{font-weight:bold}.foot{margin-top:24px;text-align:center;color:#666;font-size:12px}
    .signature{text-align:right;margin-top:34px}.signature img{width:150px;height:48px;object-fit:contain}.words{background:#eee9df;padding:10px;margin-top:16px}
    </style></head><body><header><div class="brand">${settings?.showLogo !== false && settings?.logo ? `<img src="${escapeHtml(settings.logo)}">` : ''}<div>
    <h1>${escapeHtml(settings?.shopName || 'Shree Durga Tiles')}</h1>${settings?.tagline ? `<div>${escapeHtml(settings.tagline)}</div>` : ''}
    <div>${escapeHtml(settings?.address ?? '')}</div>${settings?.showGstin !== false && settings?.gstin ? `<div>GSTIN: ${escapeHtml(settings.gstin)}</div>` : ''}
    ${settings?.phone ? `<div>Phone: ${escapeHtml(settings.phone)}</div>` : ''}${settings?.email ? `<div>${escapeHtml(settings.email)}</div>` : ''}</div></div></header>
    <div class="meta"><div><strong>${escapeHtml(settings?.invoiceTitle || 'TAX INVOICE')}</strong><br>${escapeHtml(bill.billNo ?? 'Draft bill')}<br>${billDateLabel(bill.billDate)}</div>
    <div><strong>Bill to</strong><br>${escapeHtml(bill.customerName)}<br>${escapeHtml(bill.customerPhone ?? '')}<br>${escapeHtml(bill.customerAddress ?? '')}</div></div>
    <table><thead><tr><th style="width:38px">S.No.</th><th>Item / Description</th><th>Specification</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <table class="summary">${totals}</table>
    ${bill.amountInWords ? `<div class="words"><strong>Amount in words</strong><br>${escapeHtml(bill.amountInWords)}</div>` : ''}
    ${settings?.showSignature !== false ? `<div class="signature">${settings?.ownerSignature ? `<img src="${escapeHtml(settings.ownerSignature)}">` : ''}<div><strong>${escapeHtml(settings?.ownerName || 'Authorized Signatory')}</strong></div><div>Authorized Signatory</div></div>` : ''}
    ${settings?.defaultInvoiceNotes ? `<p>${escapeHtml(settings.defaultInvoiceNotes)}</p>` : ''}
    ${settings?.invoiceTerms ? `<p>${escapeHtml(settings.invoiceTerms)}</p>` : ''}
    ${settings?.returnPolicy ? `<p>Return / refund: ${escapeHtml(settings.returnPolicy)}</p>` : ''}
    <div class="foot">${escapeHtml(settings?.invoiceFooterNote || 'Thank you for choosing Shree Durga Tiles.')}</div></body></html>`;
}

function billDateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-IN');
}
