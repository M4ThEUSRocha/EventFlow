import PocketBase from 'pocketbase';

// URL para emulador Android (10.0.2.2 = localhost do PC)
const pb = new PocketBase('http://192.168.100.9:8090');


export default pb;
