# EventFlow

EventFlow é um aplicativo mobile desenvolvido em **React Native** com **Expo**, que permite criar e visualizar eventos, categorias e locais, integrado com **PocketBase** como backend.

---

## 📋 Tecnologias Utilizadas

- **Node.js** v20 LTS
- **React Native** 0.81.5
- **Expo** ~54.0.0
- **PocketBase** v0.31.0
- Dependências do projeto:

  ```json
  "@expo/vector-icons": "^15.0.3",
  "@react-native-community/datetimepicker": "8.4.4",
  "@react-native-picker/picker": "^2.11.4",
  "@react-navigation/bottom-tabs": "^6.5.7",
  "@react-navigation/native": "^6.1.6",
  "@react-navigation/native-stack": "^6.9.12",
  "expo-image-picker": "~17.0.8",
  "expo-location": "~19.0.7",
  "pocketbase": "^0.13.1",
  "react-native-maps": "1.20.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0"
Ferramentas recomendadas:

Visual Studio Code

Git

Node.js

Expo CLI (instalação via npm install -g expo-cli)

⚙️ Instalação do Projeto
Clone o repositório

bash
Copiar código
git clone https://github.com/M4ThEUSRocha/EventFlow.git
cd EventFlow
Instale as dependências

bash
Copiar código
npm install
Rodando o app

Para web:

bash
Copiar código
npm run web
Para Android (emulador ou dispositivo conectado):

bash
Copiar código
npm run android
Para iOS (MacOS + Xcode):

bash
Copiar código
npm run ios
⚠️ Certifique-se de ter o Expo Go instalado no seu dispositivo para testar no celular.

🗄️ Configuração do Banco de Dados (PocketBase)
O banco de dados do projeto é fornecido em um arquivo .zip contendo todas as coleções e registros.

Baixe o PocketBase aqui.

Extraia e abra o PocketBase Server.

No painel do PocketBase, vá em Settings → Import/Export → Import Collections.

Selecione o arquivo pb_database_export.zip fornecido junto com o projeto.

Todas as tabelas serão criadas automaticamente.

Dessa forma, você terá o mesmo banco de dados utilizado no projeto.

📂 Estrutura do Projeto
bash
Copiar código
EventFlow/
├─ screens/           # Telas do aplicativo
├─ services/          # Conexão com PocketBase e APIs
├─ assets/            # Imagens e ícones
├─ App.js             # Componente raiz
├─ package.json       # Dependências e scripts
└─ README.md          # Este arquivo
🚀 Funcionalidades
Cadastrar e visualizar eventos

Selecionar categorias e locais

Escolher data e hora do evento

Upload de imagem para evento

Integração com banco PocketBase

🛠️ Observações
Certifique-se de usar Node.js 20 LTS e Expo CLI atualizados.

Ao importar o banco pelo .zip, todas as tabelas, categorias e locais serão restaurados.

Para qualquer problema, abra uma issue no GitHub ou entre em contato com o autor do projeto.

📌 Autor
Matheus Nascimento
