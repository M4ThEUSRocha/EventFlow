import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert } from 'react-native';
import pb from '../services/pocketbase';

export default function LocaisScreen() {
  const [locais, setLocais] = useState([]);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [endereco, setEndereco] = useState('');

  const fetchLocais = async () => {
    try {
      const result = await pb.collection('locais').getFullList();
      setLocais(result);
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível carregar locais.');
    }
  };

  useEffect(() => {
    fetchLocais();
  }, []);

  const handleAddLocal = async () => {
    if (!name || !latitude || !longitude) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios!');
      return;
    }
    try {
      await pb.collection('locais').create({
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        endereco,
      });
      setName('');
      setLatitude('');
      setLongitude('');
      setEndereco('');
      fetchLocais();
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível adicionar local.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nome" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Latitude" style={styles.input} value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
      <TextInput placeholder="Longitude" style={styles.input} value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
      <TextInput placeholder="Endereço (opcional)" style={styles.input} value={endereco} onChangeText={setEndereco} />
      <Button title="Adicionar Local" onPress={handleAddLocal} />
      <FlatList
        data={locais}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.name} ({item.latitude}, {item.longitude})</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafd' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 20, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  item: { fontSize: 16, padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});
