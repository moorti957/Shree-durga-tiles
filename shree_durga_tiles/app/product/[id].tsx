import { useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi, categoriesApi } from '@/api/endpoints';
import { productSchema, type ProductFormInput, type ProductFormValues } from '@/features/products/schema';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Switch';
import { formatUnit } from '@/lib/format';
import { colors, typography } from '@/theme';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const product = useQuery({ queryKey: ['product', id], queryFn: () => productsApi.get(id) });
  const categories = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const { control, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', categoryId: '', description: '', size: '', finish: '', quality: 'Premium', price: null, priceUnit: 'sq_ft', status: 'draft', images: [] },
  });
  useEffect(() => {
    if (!product.data) return;
    const categoryId = typeof product.data.category === 'string' ? product.data.category : product.data.category?._id ?? product.data.category?.id ?? '';
    reset({
      name: product.data.name,
      categoryId,
      description: product.data.description ?? '',
      size: product.data.size ?? '',
      finish: product.data.finish ?? '',
      quality: product.data.quality ?? 'Premium',
      price: product.data.price,
      priceUnit: product.data.priceUnit,
      status: product.data.status,
      images: product.data.images ?? [],
    });
  }, [product.data, reset]);
  const save = useMutation({
    mutationFn: (values: ProductFormValues) => productsApi.update(id, {
      ...values,
      category: values.categoryId,
      status: values.status,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['product', id] });
      router.back();
    },
    onError: (error) => Alert.alert('Could not update product', error.message),
  });

  if (product.isLoading || !product.data) {
    return <Screen><ScreenHeader title="Edit product" subtitle="Loading product details…" back /></Screen>;
  }

  return (
    <Screen>
      <ScreenHeader title="Edit product" subtitle="Will appear on your website when published" back />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Controller control={control} name="name" render={({ field }) => <TextField label="Product name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />} />
        <View style={{ gap: 8 }}>
          <Text style={[typography.label, { color: colors.ink }]}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(categories.data?.data ?? []).map((category) => <Chip key={category._id} label={category.name} selected={watch('categoryId') === category._id} onPress={() => setValue('categoryId', category._id, { shouldValidate: true })} />)}</View>
          {errors.categoryId?.message ? <Text style={[typography.small, { color: colors.danger }]}>{errors.categoryId.message}</Text> : null}
        </View>
        <Controller control={control} name="size" render={({ field }) => <TextField label="Size" value={field.value ?? ''} onChangeText={field.onChange} />} />
        <View style={{ gap: 8 }}>
          <Text style={[typography.label, { color: colors.ink }]}>Finish</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['Polished', 'Matt', 'Glossy', 'Satin', 'Leather'].map((finish) => <Chip key={finish} label={finish} selected={watch('finish') === finish} onPress={() => setValue('finish', finish)} />)}</View>
        </View>
        <Controller control={control} name="price" render={({ field }) => <TextField label="Price" keyboardType="decimal-pad" value={field.value == null ? '' : String(field.value)} onChangeText={(value) => field.onChange(value ? Number(value) : null)} leftText="₹" />} />
        <View style={{ flexDirection: 'row', gap: 8 }}>{(['sq_ft', 'box', 'piece'] as const).map((unit) => <View key={unit} style={{ flex: 1 }}><Chip label={`per ${formatUnit(unit)}`} selected={watch('priceUnit') === unit} onPress={() => setValue('priceUnit', unit)} /></View>)}</View>
        <Controller control={control} name="description" render={({ field }) => <TextField label="Short description" multiline value={field.value} onChangeText={field.onChange} style={{ textAlignVertical: 'top' }} />} />
        <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}><Text style={[typography.label, { color: colors.ink }]}>Show on website</Text><Text style={[typography.small, { color: colors.muted }]}>Save as a draft when hidden</Text></View>
          <Toggle label="Publish product on website" value={watch('status') === 'published'} onValueChange={(value) => setValue('status', value ? 'published' : 'draft')} />
        </Card>
        <Button label="Save changes" loading={save.isPending} onPress={() => void handleSubmit((values) => save.mutate(values))()} />
        <Button label="Delete product" variant="outline" onPress={() => Alert.alert('Delete product?', 'This product will be removed from the website.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => void productsApi.remove(id).then(async () => { await queryClient.invalidateQueries({ queryKey: ['products'] }); router.replace('/(tabs)/products'); }).catch(() => Alert.alert('Could not delete product', 'Please try again.')) },
        ])} />
      </ScrollView>
    </Screen>
  );
}
