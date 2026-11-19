import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Signature } from 'lucide-react-native';
import { billsApi, productsApi } from '@/api/endpoints';
import type { ShopSettings } from '@/api/types';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { colors, typography } from '@/theme';

const emptySettings: ShopSettings = {
  shopName: 'Shree Durga Tiles',
  tagline: '',
  phone: '',
  email: '',
  address: '',
  gstin: '',
  logo: '',
  ownerSignature: '',
  ownerName: '',
  invoiceTitle: 'TAX INVOICE',
  invoiceTerms: '',
  invoiceFooterNote: '',
  returnPolicy: '',
  defaultInvoiceNotes: '',
  showLogo: true,
  showSignature: true,
  showGstin: true,
};

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ['shop-settings'], queryFn: billsApi.settings });
  const [form, setForm] = useState<ShopSettings>(emptySettings);
  const [uploading, setUploading] = useState<'logo' | 'signature' | null>(null);

  useEffect(() => {
    if (settings.data) setForm({ ...emptySettings, ...settings.data });
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => {
      if (!form.shopName?.trim()) throw new Error('Shop name is required.');
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new Error('Enter a valid email address.');
      return billsApi.updateSettings(form);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['shop-settings'] });
      Alert.alert('Settings saved', 'Your invoice branding has been updated.');
    },
    onError: (error) => Alert.alert('Could not save settings', error instanceof Error ? error.message : 'Please try again.'),
  });

  const pickImage = async (kind: 'logo' | 'signature') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow gallery access to upload this image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: kind === 'logo',
      aspect: kind === 'logo' ? [1, 1] : [3, 1],
      quality: 0.85,
    });
    if (result.canceled) return;
    setUploading(kind);
    try {
      const asset = result.assets[0];
      const uploaded = await productsApi.upload(asset.uri, `${kind}-${Date.now()}.jpg`);
      setForm((current) => kind === 'logo' ? { ...current, logo: uploaded.url } : { ...current, ownerSignature: uploaded.url });
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const set = (key: keyof ShopSettings, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Screen>
      <ScreenHeader title="Owner & Bill Settings" subtitle="Branding and invoice customization" back />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }} keyboardShouldPersistTaps="handled">
        {settings.isLoading ? <Text style={[typography.small, { color: colors.muted }]}>Loading saved settings…</Text> : null}
        {settings.error ? <Text accessibilityRole="alert" style={[typography.small, { color: colors.danger }]}>Could not load settings. Please retry.</Text> : null}

        <Card style={{ gap: 11 }}>
          <Text style={[typography.eyebrow, { color: colors.brassDark }]}>SHOP BRANDING</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Pressable onPress={() => void pickImage('logo')} accessibilityLabel="Upload shop logo" style={{ width: 64, height: 64, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.brassDark, backgroundColor: colors.brassWash, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {form.logo ? <Image source={{ uri: form.logo }} style={{ width: 64, height: 64 }} /> : <Camera size={21} color={colors.brassDark} />}
            </Pressable>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={[typography.label, { color: colors.ink }]}>Shop logo</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button label={uploading === 'logo' ? 'Uploading…' : 'Replace'} compact variant="outline" loading={uploading === 'logo'} onPress={() => void pickImage('logo')} />
                {form.logo ? <Button label="Remove" compact variant="outline" onPress={() => set('logo', '')} /> : null}
              </View>
            </View>
          </View>
          <TextField label="Shop name" value={form.shopName} onChangeText={(value) => set('shopName', value)} />
          <TextField label="Tagline" value={form.tagline ?? ''} onChangeText={(value) => set('tagline', value)} />
          <TextField label="Address" value={form.address ?? ''} multiline onChangeText={(value) => set('address', value)} />
          <TextField label="Contact number" keyboardType="phone-pad" value={form.phone ?? ''} onChangeText={(value) => set('phone', value)} />
          <TextField label="Email" keyboardType="email-address" value={form.email ?? ''} onChangeText={(value) => set('email', value)} />
          <TextField label="GSTIN" autoCapitalize="characters" value={form.gstin ?? ''} onChangeText={(value) => set('gstin', value)} />
        </Card>

        <Card style={{ gap: 11 }}>
          <Text style={[typography.eyebrow, { color: colors.brassDark }]}>OWNER SIGNATURE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 132, height: 56, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {form.ownerSignature ? <Image source={{ uri: form.ownerSignature }} style={{ width: 132, height: 56, resizeMode: 'contain' }} /> : <Signature size={21} color={colors.muted} />}
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Button label={uploading === 'signature' ? 'Uploading…' : 'Upload'} compact variant="outline" loading={uploading === 'signature'} onPress={() => void pickImage('signature')} />
              {form.ownerSignature ? <Button label="Remove" compact variant="outline" onPress={() => set('ownerSignature', '')} /> : null}
            </View>
          </View>
          <TextField label="Owner name" value={form.ownerName ?? ''} onChangeText={(value) => set('ownerName', value)} />
        </Card>

        <Card style={{ gap: 11 }}>
          <Text style={[typography.eyebrow, { color: colors.brassDark }]}>INVOICE SETTINGS</Text>
          <TextField label="Invoice title" value={form.invoiceTitle ?? 'TAX INVOICE'} onChangeText={(value) => set('invoiceTitle', value.toUpperCase() === 'INVOICE' ? 'INVOICE' : 'TAX INVOICE')} />
          <TextField label="Footer message" value={form.invoiceFooterNote ?? ''} multiline onChangeText={(value) => set('invoiceFooterNote', value)} />
          <TextField label="Terms and conditions" value={form.invoiceTerms ?? ''} multiline onChangeText={(value) => set('invoiceTerms', value)} />
          <TextField label="Return / refund policy" value={form.returnPolicy ?? ''} multiline onChangeText={(value) => set('returnPolicy', value)} />
          <TextField label="Default invoice notes" value={form.defaultInvoiceNotes ?? ''} multiline onChangeText={(value) => set('defaultInvoiceNotes', value)} />
          {([
            ['Show shop logo', 'showLogo'],
            ['Show owner signature', 'showSignature'],
            ['Show GST details', 'showGstin'],
          ] as const).map(([label, key]) => (
            <View key={key} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[typography.label, { color: colors.ink }]}>{label}</Text>
              <Switch value={Boolean(form[key])} onValueChange={(value) => set(key, value)} trackColor={{ false: colors.switchOff, true: colors.brass }} thumbColor={colors.card} />
            </View>
          ))}
        </Card>

        <Button label="Save settings" loading={save.isPending || uploading !== null} disabled={uploading !== null} onPress={() => save.mutate()} />
      </ScrollView>
    </Screen>
  );
}
