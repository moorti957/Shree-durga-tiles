import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, IndianRupee, Layers, LayoutGrid, Minus, Plus, Search, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { categoriesApi, productsApi } from '@/api/endpoints';
import type { Product } from '@/api/types';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Toggle } from '@/components/ui/Switch';
import { colors, typography } from '@/theme';
import { formatRupees, formatUnit } from '@/lib/format';
import { applyPricePercent } from '@/features/products/priceMath';

function ProductTile({ product, onEdit, onPrice, onPublish }: {
  product: Product;
  onEdit: () => void;
  onPrice: () => void;
  onPublish: (value: boolean) => void;
}) {
  return (
    <Card style={{ padding: 13, gap: 12 }}>
      <Pressable onPress={onEdit} style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 78, height: 78, borderRadius: 15, backgroundColor: colors.stone100, alignItems: 'center', justifyContent: 'center' }}>
          {product.images?.[0] ? <Image source={{ uri: product.images[0] }} contentFit="cover" style={{ width: 78, height: 78, borderRadius: 15 }} /> : <IndianRupee size={24} color={colors.brassDark} strokeWidth={1.4} />}
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[typography.eyebrow, { color: colors.brassDark, fontSize: 10 }]} numberOfLines={1}>
              {typeof product.category === 'string' ? 'PRODUCT' : product.category?.name ?? 'PRODUCT'}
            </Text>
            {product.status === 'draft' ? <Badge label="DRAFT" variant="draft" /> : null}
          </View>
          <Text style={[typography.cardTitle, { color: colors.ink }]} numberOfLines={1}>{product.name}</Text>
          <Text style={[typography.small, { color: colors.muted }]} numberOfLines={1}>{[product.size, product.finish, product.quality].filter(Boolean).join(' · ')}</Text>
        </View>
      </Pressable>
      <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.ink, fontSize: 13 }]}>{formatRupees(product.price)}{product.price !== null ? ` / ${formatUnit(product.priceUnit)}` : ''}</Text>
        </View>
        <Button label="Edit price" variant="outline" compact icon={IndianRupee} onPress={onPrice} />
        <Toggle label={`Show ${product.name} on website`} value={product.status === 'published'} onValueChange={onPublish} />
      </View>
    </Card>
  );
}

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<Product['priceUnit']>('sq_ft');
  const [sort, setSort] = useState<'newest' | 'name-asc' | 'price-asc'>('newest');
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const products = useQuery({
    queryKey: ['products', { search, category }],
    queryFn: () => productsApi.list({ page: 1, limit: 50, q: search || undefined, category: category || undefined }),
  });
  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => productsApi.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelected(null);
    },
    onError: () => Alert.alert('Could not update product', 'Please check your connection and try again.'),
  });
  const allCategories = useMemo(() => categories.data?.data ?? [], [categories.data]);
  const openPrice = (product: Product) => {
    setSelected(product);
    setPrice(product.price === null ? '' : String(product.price));
    setPriceUnit(product.priceUnit);
  };
  const visibleProducts = useMemo(() => {
    const items = [...(products.data?.data ?? [])];
    if (sort === 'name-asc') items.sort((left, right) => left.name.localeCompare(right.name));
    if (sort === 'price-asc') {
      items.sort((left, right) => (left.price ?? Number.POSITIVE_INFINITY) - (right.price ?? Number.POSITIVE_INFINITY));
    }
    return items;
  }, [products.data, sort]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone }}>
      <ScreenHeader
        title="Products"
        right={<Pressable onPress={() => router.push('/categories')} style={{ minHeight: 44, paddingHorizontal: 13, borderRadius: 999, backgroundColor: colors.brassLight, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}><LayoutGrid size={17} color={colors.ink} /><Text style={[typography.small, { color: colors.ink }]}>Categories</Text></Pressable>}
      >
        <View style={{ height: 48, borderRadius: 16, backgroundColor: colors.stone, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 9 }}>
          <Search size={19} color={colors.muted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or size" placeholderTextColor={colors.muted} style={[typography.small, { flex: 1, color: colors.ink }]} />
          {search ? <Pressable onPress={() => setSearch('')} accessibilityLabel="Clear search"><X size={18} color={colors.muted} /></Pressable> : null}
        </View>
      </ScreenHeader>

      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 12 }}
        refreshControl={<RefreshControl refreshing={products.isRefetching} onRefresh={() => void products.refetch()} tintColor={colors.brassDark} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              data={[{ _id: '', name: 'All' }, ...allCategories]}
              keyExtractor={(item) => item._id || 'all'}
              renderItem={({ item }) => <Chip label={item.name} selected={category === item._id} onPress={() => setCategory(item._id)} />}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[typography.small, { color: colors.muted }]}>{products.data?.meta.total ?? 0} products · {products.data?.data.filter((item) => item.status === 'published').length ?? 0} live</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {([
                  ['newest', 'Newest'],
                  ['name-asc', 'Name'],
                  ['price-asc', 'Price'],
                ] as const).map(([value, label]) => (
                  <Chip key={value} label={label} selected={sort === value} onPress={() => setSort(value)} />
                ))}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ProductTile
            product={item}
            onEdit={() => router.push(`/product/${item._id}`)}
            onPrice={() => openPrice(item)}
            onPublish={(published) => updateProduct.mutate({ id: item._id, data: { status: published ? 'published' : 'draft' } })}
          />
        )}
        ListEmptyComponent={
          products.isLoading ? <Text style={[typography.body, { color: colors.muted, textAlign: 'center', paddingTop: 30 }]}>Loading products…</Text> :
            <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 28 }}><Layers color={colors.brassDark} size={26} /><Text style={[typography.cardTitle, { color: colors.ink }]}>No products yet</Text><Text style={[typography.small, { color: colors.muted }]}>Tap + to add your first.</Text><Button label="Add product" onPress={() => router.push('/product/new')} /></Card>
        }
      />

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.dim }}>
          <View style={{ backgroundColor: colors.stone, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22, paddingBottom: 34, gap: 18 }}>
            <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 4, backgroundColor: colors.inputBorder }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 58, height: 58, borderRadius: 14, backgroundColor: colors.stone100, alignItems: 'center', justifyContent: 'center' }}><IndianRupee color={colors.brassDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.eyebrow, { color: colors.brassDark }]}>UPDATE PRICE</Text>
                <Text style={[typography.cardTitle, { color: colors.ink }]}>{selected?.name}</Text>
                <Text style={[typography.small, { color: colors.muted }]}>{selected?.size} · {selected?.finish}</Text>
              </View>
              <Pressable onPress={() => setSelected(null)} accessibilityLabel="Close price editor" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><X color={colors.ink} /></Pressable>
            </View>
            <Text style={[typography.small, { color: colors.muted }]}>Current price {formatRupees(selected?.price)} / {formatUnit(selected?.priceUnit ?? 'sq_ft')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <Pressable onPress={() => setPrice(String(Math.max(0, Number(price || selected?.price || 0) - 1)))} accessibilityLabel="Decrease price by one" style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.inputBorder, alignItems: 'center', justifyContent: 'center' }}><Minus color={colors.ink} /></Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[typography.priceBig, { color: colors.ink, fontSize: 48 }]}>₹</Text>
                <TextInput keyboardType="numeric" value={price} onChangeText={setPrice} style={[typography.priceBig, { minWidth: 120, color: colors.ink, textAlign: 'center', fontSize: 48 }]} />
              </View>
              <Pressable onPress={() => setPrice(String(Number(price || selected?.price || 0) + 1))} accessibilityLabel="Increase price by one" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}><Plus color={colors.brassLight} /></Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
              {[-10, -5, 5, 10].map((value) => <Chip key={value} label={`${value > 0 ? '+' : ''}${value}%`} onPress={() => setPrice(String(applyPricePercent(Number(price || selected?.price || 0), value)))} />)}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['sq_ft', 'box', 'piece'] as const).map((unit) => <View key={unit} style={{ flex: 1 }}><Chip label={`per ${formatUnit(unit)}`} selected={priceUnit === unit} onPress={() => setPriceUnit(unit)} /></View>)}
            </View>
            <Text style={[typography.small, { color: colors.muted }]}>The new price shows on your website right away.</Text>
            <Button label="Update price" icon={Check} loading={updateProduct.isPending} disabled={!price || Number(price) === selected?.price} onPress={() => selected && updateProduct.mutate({ id: selected._id, data: { price: Number(price), priceUnit } })} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
