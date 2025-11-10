import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import pb from '../services/pocketbase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('users').authWithPassword(email, password);
      navigation.replace('Home');
    } catch (err) {
      console.log('Erro ao logar:', err);
      Alert.alert('Erro', 'Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.logo}>EventFlow</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25, backgroundColor: '#f9fafd' },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#4a90e2', marginBottom: 30 },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 20, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  loginButton: { width: '100%', height: 50, backgroundColor: '#4a90e2', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  registerButton: { width: '100%', height: 50, backgroundColor: '#28a745', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
