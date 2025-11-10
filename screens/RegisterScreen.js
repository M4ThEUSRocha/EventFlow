import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import pb from '../services/pocketbase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      const existingUsers = await pb.collection('users').getFullList();
      if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        Alert.alert('Erro', 'Este email já está em uso.');
        setLoading(false);
        return;
      }

      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password
      });

      Alert.alert('Cadastro realizado!', `Bem-vindo, ${name}!`);
      navigation.goBack();
    } catch (err) {
      console.log('Erro ao registrar:', err);
      Alert.alert('Erro', 'Não foi possível registrar o usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Registrar</Text>
      <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25, backgroundColor: '#f9fafd' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#28a745', marginBottom: 30 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 20, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  registerButton: { width: '100%', height: 50, backgroundColor: '#28a745', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
