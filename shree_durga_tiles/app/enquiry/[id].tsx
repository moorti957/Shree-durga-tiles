import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Phone, Receipt } from 'lucide-react-native';
import { enquiriesApi } from '@/api/endpoints';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { colors, typography } from '@/theme';

export default function EnquiryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const enquiry = useQuery({ queryKey: ['enquiry', id], queryFn: () => enquiriesApi.get(id) });
  const item = enquiry.data;
  useEffect(() => {
    setNote(item?.adminNote ?? '');
  }, [item?.adminNote]);
  const update = useMutation({
    mutationFn: (data: { status?: 'new' | 'contacted' | 'converted' | 'closed'; adminNote?: string }) => enquiriesApi.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      await queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
    },
    onError: () => Alert.alert('Could not update enquiry', 'Please try again.'),
  });
  if (enquiry.isLoading) {
    return <Screen><ScreenHeader title="Enquiry" back /><Text style={[typography.body, { color: colors.muted, padding: 20 }]}>Loading enquiry…</Text></Screen>;
  }
  if (enquiry.isError || !item) {
    return <Screen><ScreenHeader title="Enquiry" back /><Text style={[typography.body, { color: colors.muted, padding: 20 }]}>Enquiry not found.</Text></Screen>;
  }
  return (
    <Screen>
      <ScreenHeader title="Enquiry" subtitle={`Received ${new Date(item.createdAt).toLocaleDateString()}`} back />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Card style={{ gap: 8 }}>
          <Text style={[typography.cardTitle, { color: colors.ink }]}>{item.name}</Text>
          <Text style={[typography.body, { color: colors.body }]}>{item.need}</Text>
          <Text style={[typography.small, { color: colors.muted }]}>{item.phone}</Text>
          {item.message ? <Text style={[typography.body, { color: colors.body }]}>{item.message}</Text> : null}
        </Card>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <Button label="Call" icon={Phone} variant="outline" style={{ flex: 1 }} onPress={() => void Linking.openURL(`tel:${item.phone}`)} />
          <Button label="WhatsApp" icon={MessageSquare} variant="success" style={{ flex: 1 }} onPress={() => void Linking.openURL(`https://wa.me/${item.phone.replace(/\D/g, '')}`)} />
        </View>
        <Card style={{ gap: 10 }}>
          <Text style={[typography.label, { color: colors.ink }]}>Enquiry status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['new', 'contacted', 'converted', 'closed'] as const).map((status) => <Chip key={status} label={status} selected={item.status === status} onPress={() => update.mutate({ status })} />)}</View>
        </Card>
        <Card style={{ gap: 10 }}>
          <TextField label="Private note" placeholder="Add a note for your team" value={note} onChangeText={setNote} multiline />
          <Button label="Save private note" variant="outline" loading={update.isPending} disabled={!note.trim()} onPress={() => update.mutate({ adminNote: note.trim() })} />
        </Card>
        <Button label="Create bill" icon={Receipt} onPress={() => router.push(`/bill/new?enquiryId=${id}&name=${encodeURIComponent(item.name)}&phone=${encodeURIComponent(item.phone)}`)} />
      </ScrollView>
    </Screen>
  );
}
