import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, ImagePlus, Upload } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, productsApi } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Switch';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Screen } from '@/components/layout/Screen';
import { productSchema, type ProductFormInput, type ProductFormValues } from '@/features/products/schema';
import { colors, typography } from '@/theme';

export default function NewProductScreen() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const [photos, setPhotos] = useState<string[]>([]);
  const [customSizeOpen, setCustomSizeOpen] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', categoryId: '', description: '', size: '', finish: '', quality: 'Premium', price: null, priceUnit: 'sq_ft', status: 'draft', images: [] },
  });
  const status = watch('status');
  const priceUnit = watch('priceUnit');
  const create = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (values.status === 'published' && photos.length === 0) throw new Error('Add at least one product photo to publish.');
      const uploaded = [];
      for (let index = 0; index < photos.length; index += 1) {
        const compressed = await ImageManipulator.manipulateAsync(
          photos[index],
          [{ resize: { width: 1600 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        uploaded.push(await productsApi.upload(compressed.uri, `product-${Date.now()}-${index}.jpg`));
      }
      return productsApi.create({
        ...values,
        slug: values.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: values.description || values.name,
        category: values.categoryId,
        images: uploaded.map((image) => image.url),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      Alert.alert('Product saved', 'Your product has been saved.', [{ text: 'Done', onPress: () => router.replace('/(tabs)/products') }]);
    },
    onError: (error) => Alert.alert('Could not save product', error.message),
  });
  const pickPhotos = async (camera: boolean) => {
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow camera or gallery access in your device settings to add product photos.');
      return;
    }
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 8 - photos.length, quality: 0.85 });
    if (!result.canceled) setPhotos((current) => [...current, ...result.assets.map((asset) => asset.uri)].slice(0, 8));
  };

  return (
    <Screen>
      <ScreenHeader title="New product" subtitle="Will appear on your website when published" back />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 36, gap: 17 }}>
          <Text style={[typography.eyebrow, { color: colors.brassDark }]}>PHOTOS</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Take photo" variant="brass" icon={Camera} compact style={{ flex: 1 }} onPress={() => void pickPhotos(true)} />
            <Button label="From gallery" variant="outline" icon={ImagePlus} compact style={{ flex: 1 }} onPress={() => void pickPhotos(false)} />
          </View>
          {photos.length ? <ScrollView horizontal contentContainerStyle={{ gap: 9 }}>{photos.map((uri, index) => <View key={uri}><Image source={{ uri }} style={{ width: 78, height: 78, borderRadius: 14 }} /><Pressable onPress={() => setPhotos((current) => current.filter((_, position) => position !== index))} style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.card, borderRadius: 12, padding: 4 }}><Text style={{ color: colors.danger }}>×</Text></Pressable>{index === 0 ? <Text style={[typography.badge, { position: 'absolute', bottom: 4, left: 4, color: colors.card, backgroundColor: colors.ink, padding: 3, borderRadius: 4 }]}>COVER</Text> : null}</View>)}</ScrollView> : null}

          <Controller control={control} name="name" render={({ field }) => <TextField label="Product name" placeholder="e.g. Makrana White" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />} />
          <View style={{ gap: 8 }}>
            <Text style={[typography.label, { color: colors.ink }]}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(categories.data?.data ?? []).map((item) => <Chip key={item._id} label={item.name} selected={watch('categoryId') === item._id} onPress={() => setValue('categoryId', item._id, { shouldValidate: true })} />)}
              <Chip label="+ New" dashed onPress={() => router.push('/categories')} />
            </View>
            {errors.categoryId?.message ? <Text style={[typography.small, { color: colors.danger }]}>{errors.categoryId.message}</Text> : null}
          </View>
          <View style={{ gap: 8 }}>
            <Text style={[typography.label, { color: colors.ink }]}>Size <Text style={{ color: colors.muted, fontWeight: '500' }}>· mm</Text></Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['600 x 600', '600 x 1200', '800 x 800', '1200 x 2400'].map((size) => <Chip key={size} label={size} selected={watch('size') === size} onPress={() => setValue('size', size)} />)}
              <Chip label="Custom" dashed onPress={() => { setCustomSize(watch('size') ?? ''); setCustomSizeOpen(true); }} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={[typography.label, { color: colors.ink }]}>Finish</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['Polished', 'Matt', 'Glossy', 'Satin', 'Leather'].map((finish) => <Chip key={finish} label={finish} selected={watch('finish') === finish} onPress={() => setValue('finish', finish)} />)}</View>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={[typography.label, { color: colors.ink }]}>Quality</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>{(['Premium', 'Standard', 'Economy'] as const).map((quality) => <View key={quality} style={{ flex: 1 }}><Chip label={quality} selected={watch('quality') === quality} onPress={() => setValue('quality', quality)} /></View>)}</View>
          </View>
          <Controller control={control} name="price" render={({ field }) => <TextField label="Price" placeholder="Price on request" keyboardType="decimal-pad" value={field.value == null ? '' : String(field.value)} onChangeText={(value) => field.onChange(value ? Number(value) : null)} leftText="₹" />} />
          <View style={{ flexDirection: 'row', gap: 8 }}>{(['sq_ft', 'box', 'piece'] as const).map((unit) => <View key={unit} style={{ flex: 1 }}><Chip label={`per ${unit === 'sq_ft' ? 'sq ft' : unit}`} selected={priceUnit === unit} onPress={() => setValue('priceUnit', unit)} /></View>)}</View>
          <Controller control={control} name="description" render={({ field }) => <TextField label="Short description" placeholder="Best for flooring, wall cladding and mandir" multiline value={field.value} onChangeText={field.onChange} style={{ minHeight: 76, textAlignVertical: 'top' }} error={errors.description?.message} />} />
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.label, { color: colors.ink }]}>Show on website</Text>
              <Text style={[typography.small, { color: colors.muted }]}>Turn off to save as draft only</Text>
            </View>
            <Toggle label="Publish product on website" value={status === 'published'} onValueChange={(value) => setValue('status', value ? 'published' : 'draft')} />
          </Card>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Save draft" variant="outline" style={{ flex: 1 }} loading={create.isPending} onPress={() => void handleSubmit((values) => create.mutate({ ...values, status: 'draft' }))()} />
            <Button label="Publish to website" icon={Upload} style={{ flex: 1 }} loading={create.isPending} onPress={() => void handleSubmit((values) => create.mutate({ ...values, status: 'published' }))()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={customSizeOpen} transparent animationType="fade" onRequestClose={() => setCustomSizeOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 22, backgroundColor: colors.dim }}>
          <Card style={{ gap: 14 }}>
            <Text style={[typography.sectionTitle, { color: colors.ink }]}>Custom size</Text>
            <TextInput
              autoFocus
              accessibilityLabel="Custom product size in millimeters"
              placeholder="e.g. 900 x 1800 mm"
              value={customSize}
              onChangeText={setCustomSize}
              style={[typography.body, { minHeight: 50, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 14, paddingHorizontal: 14, color: colors.ink }]}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => setCustomSizeOpen(false)} />
              <Button
                label="Save size"
                style={{ flex: 1 }}
                disabled={!customSize.trim()}
                onPress={() => {
                  setValue('size', customSize.trim(), { shouldValidate: true });
                  setCustomSizeOpen(false);
                }}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
