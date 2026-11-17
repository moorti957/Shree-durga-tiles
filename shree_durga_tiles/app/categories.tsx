import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ArrowDown, ArrowUp, Camera, GripVertical, Pencil, Plus } from 'lucide-react-native';
import { categoriesApi } from '@/api/endpoints';
import type { Category } from '@/api/types';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Toggle } from '@/components/ui/Switch';
import { colors, typography } from '@/theme';

export default function CategoriesScreen() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const uploadPhoto = async (uri: string, name: string) => {
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return categoriesApi.upload(compressed.uri, name);
  };
  const write = useMutation({
    mutationFn: async () => {
      let image = photo;
      if (image) image = (await uploadPhoto(image, `category-${Date.now()}.jpg`)).url;
      return categoriesApi.create({ name: name.trim(), slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), image: image ?? undefined, isActive: true, isVisible: true, sortOrder: categories.data?.data.length ?? 0 });
    },
    onSuccess: () => {
      setName('');
      setPhoto(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => Alert.alert('Could not add category', error.message),
  });
  const edit = useMutation({
    mutationFn: async () => {
      if (!editing) return null;
      let image = editPhoto;
      if (image && image.startsWith('file://')) image = (await uploadPhoto(image, `category-${Date.now()}.jpg`)).url;
      return categoriesApi.update(editing._id, { name: editName.trim(), image: image ?? undefined });
    },
    onSuccess: () => {
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => Alert.alert('Could not update category', error.message),
  });
  const toggle = useMutation({
    mutationFn: ({ category, value }: { category: Category; value: boolean }) => categoriesApi.update(category._id, { isVisible: value, isActive: value }),
    onMutate: async ({ category, value }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      const previous = queryClient.getQueryData<typeof categories.data>(['categories']);
      queryClient.setQueryData(['categories'], (old: typeof categories.data) => old ? {
        ...old,
        data: old.data.map((item) => item._id === category._id ? { ...item, isVisible: value } : item),
      } : old);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['categories'], context.previous);
      Alert.alert('Could not change visibility', 'Check your connection and try again.');
    },
  });
  const move = async (index: number, direction: -1 | 1) => {
    const items = [...(categories.data?.data ?? [])];
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    try {
      await categoriesApi.reorder(items.map((item, position) => ({
        id: item._id,
        sortOrder: position,
        displayOrder: position,
      })));
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch {
      Alert.alert('Could not reorder categories', 'Please try again.');
    }
  };
  const choosePhoto = async (forEdit = false) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow gallery access in your device settings to add a category photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      if (forEdit) setEditPhoto(result.assets[0].uri);
      else setPhoto(result.assets[0].uri);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Categories" subtitle="These show on your website menu" back />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 34, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 13 }}>
          <Text style={[typography.eyebrow, { color: colors.brassDark }]}>ADD NEW CATEGORY</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => void choosePhoto()} accessibilityLabel="Choose category photo" style={{ width: 62, height: 62, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.brassDark, borderRadius: 16, backgroundColor: colors.brassWash, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {photo ? <Image source={{ uri: photo }} style={{ width: 62, height: 62 }} /> : <Camera color={colors.brassDark} />}
            </Pressable>
            <View style={{ flex: 1 }}><TextField label="Category name" placeholder="e.g. Marble" value={name} onChangeText={setName} /></View>
          </View>
          <Button label="Add category" variant="dark" loading={write.isPending} disabled={name.trim().length < 2} onPress={() => write.mutate()} />
        </Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.eyebrow, { color: colors.brassDark, flex: 1 }]}>{categories.data?.meta.total ?? 0} CATEGORIES</Text>
          <Text style={[typography.small, { color: colors.muted }]}>Use arrows to reorder</Text>
        </View>
        {(categories.data?.data ?? []).map((category, index) => (
          <Card key={category._id} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <GripVertical size={18} color={colors.muted} />
            <View style={{ width: 50, height: 50, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.stone100, alignItems: 'center', justifyContent: 'center' }}>
              {category.image ? <Image source={{ uri: category.image }} style={{ width: 50, height: 50 }} /> : <Camera size={19} color={colors.brassDark} />}
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[typography.label, { color: colors.ink }]}>{category.name}</Text>
              <Text style={[typography.small, { color: colors.muted }]}>{category.isVisible === false ? 'Hidden from website' : 'Visible on website'}</Text>
            </View>
            <Pressable onPress={() => { setEditing(category); setEditName(category.name); setEditPhoto(category.image ?? null); }} accessibilityLabel={`Edit ${category.name}`} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Pencil size={17} color={colors.brassDark} /></Pressable>
            <View style={{ gap: 0 }}>
              <Pressable onPress={() => void move(index, -1)} accessibilityLabel={`Move ${category.name} up`} style={{ width: 36, height: 28, justifyContent: 'center', alignItems: 'center' }}><ArrowUp size={16} color={colors.muted} /></Pressable>
              <Pressable onPress={() => void move(index, 1)} accessibilityLabel={`Move ${category.name} down`} style={{ width: 36, height: 28, justifyContent: 'center', alignItems: 'center' }}><ArrowDown size={16} color={colors.muted} /></Pressable>
            </View>
            <Toggle label={`Show ${category.name} category on website`} value={category.isVisible !== false && category.isActive !== false} onValueChange={(value) => toggle.mutate({ category, value })} />
          </Card>
        ))}
        {!categories.isLoading && !categories.data?.data.length ? <Card style={{ alignItems: 'center', gap: 8 }}><Plus color={colors.brassDark} /><Text style={[typography.small, { color: colors.muted }]}>No categories yet. Add your first above.</Text></Card> : null}
      </ScrollView>

      <Modal visible={Boolean(editing)} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: colors.dim, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.stone, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, paddingBottom: 36, gap: 16 }}>
            <Text style={[typography.sectionTitle, { color: colors.ink }]}>Edit category</Text>
            <Pressable onPress={() => void choosePhoto(true)} style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: colors.stone100, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {editPhoto ? <Image source={{ uri: editPhoto }} style={{ width: 72, height: 72 }} /> : <Camera color={colors.brassDark} />}
            </Pressable>
            <TextField label="Category name" value={editName} onChangeText={setEditName} />
            <Button label="Save changes" loading={edit.isPending} onPress={() => edit.mutate()} />
            <Button label="Cancel" variant="outline" onPress={() => setEditing(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
