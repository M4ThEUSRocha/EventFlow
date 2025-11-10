import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import pb from '../services/pocketbase';

export default function ProfileScreen({ navigation }) {
  const user = pb.authStore.model;

  const handleLogout = async () => {
    await pb.authStore.clear();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {user?.name || user?.email}</Text>
      <Text>Email: {user?.email}</Text>
      <Button title="Sair" onPress={handleLogout} color="#28a745" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafd' },
  title: { fontSize:24, fontWeight:'bold', marginBottom:15 },
});
