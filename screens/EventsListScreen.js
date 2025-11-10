import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import pb from '../services/pocketbase';

export default function EventsListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    try {
      const result = await pb.collection('events').getFullList({ sort: '-created' });
      setEvents(result);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Buscar evento" value={search} onChangeText={setSearch} />
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EventDetail', { event: item })}>
            {item.thumbnail && <Image source={{ uri: pb.getFileUrl(item, item.thumbnail) }} style={styles.thumbnail} />}
            <Text style={styles.eventName}>{item.name}</Text>
            <Text>{item.date} | {item.category}</Text>
            <Text>{item.address}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateEvent', { refresh: fetchEvents })}>
        <Text style={styles.createText}>+ Criar Evento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafd' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 20, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  card: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  thumbnail: { width: '100%', height: 150, borderRadius: 12, marginBottom: 5 },
  eventName: { fontSize: 18, fontWeight: 'bold' },
  createButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  createText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
