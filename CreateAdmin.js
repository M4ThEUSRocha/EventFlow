import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function createAdmin() {
  try {
    const admin = await pb.admins.create({
      email: 'admin@meuapp.com',       // seu email
      password: 'SenhaForte123',       // sua senha
      passwordConfirm: 'SenhaForte123',
      name: 'Super Admin'
    });
    console.log('Admin criado com sucesso:', admin);
  } catch (err) {
    console.error('Erro ao criar admin:', err);
  }
}

createAdmin();
