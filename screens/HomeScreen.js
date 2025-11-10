
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // 👈 aqui importamos os ícones
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import pb from "../services/pocketbase";
import CreateEventScreen from "./CreateEventScreen";
import EventDetailScreen from "./EventDetailScreen";
import CategoriasScreen from "./CategoriasScreen";

const Tab = createBottomTabNavigator();

function EventsListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]); // ← armazenar categorias
  const [search, setSearch] = useState("");

  const fetchEvents = async () => {
    try {
      const result = await pb.collection("events").getFullList({
        sort: "-created",
        expand: "category_id", // ← se o campo category_id for uma relação
      });
      setEvents(result);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await pb.collection("categories").getFullList();
      setCategories(result);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryName = (id) => {
    // Se o expand funcionar, usa direto:
    const eventCategory = categories.find((cat) => cat.id === id);
    return eventCategory ? eventCategory.name : "Sem categoria";
  };

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatarData = (dataIso) => {
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar evento..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          navigation.navigate("CreateEvent", { refresh: fetchEvents })
        }
      >
        <Text style={styles.primaryButtonText}>Criar Evento</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => {
          const categoryName =
            item.expand?.category_id?.name || getCategoryName(item.category_id);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("EventDetail", { event: item })
              }
            >
              {item.thumbnail && (
                <Image
                  source={{ uri: pb.getFileUrl(item, item.thumbnail) }}
                  style={styles.thumbnail}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventInfo}>
                  {formatarData(item.date)} | {categoryName}
                </Text>
                <Text style={styles.eventPrice}>R$ {item.price}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function EventsMapScreen() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [visible, setVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const result = await pb.collection("events").getFullList({
        sort: "-created",
        expand: "location_id,category_id", // 👈 agora também expande a localização
      });

      // Busca localizações ausentes
      const eventsWithLocations = await Promise.all(
        result.map(async (e) => {
          try {
            if (e.expand?.location_id) {
              // Se já veio expandido, usa direto
              return { ...e, location: e.expand.location_id };
            } else if (e.location_id) {
              // Se não veio expandido, busca manualmente
              const loc = await pb
                .collection("locations")
                .getOne(e.location_id);
              return { ...e, location: loc };
            }
            return e; // Caso não tenha localização
          } catch (err) {
            console.log("Erro ao buscar localização de evento:", err);
            return e;
          }
        })
      );

      console.log(
        "Eventos carregados:",
        eventsWithLocations.map((e) => ({
          name: e.name,
          lat: e.location?.lat,
          long: e.location?.long,
        }))
      );

      setEvents(eventsWithLocations);
    } catch (err) {
      console.log("Erro ao carregar eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });

    try {
      const [reverseGeocode] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const formatted = `${reverseGeocode.street || ""}, ${
        reverseGeocode.city || ""
      } - ${reverseGeocode.region || ""}, ${reverseGeocode.country || ""}`;
      setAddress(formatted);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível obter o endereço.");
    }
  };

  const handleSave = async () => {
    try {
      await pb.collection("locations").create({
        name: location,
        lat: selectedLocation.latitude,
        long: selectedLocation.longitude,
        address: address,
      });
      Alert.alert("Local salvo com sucesso!");
      setLocation(null);
      setAddress(null);
      setSelectedLocation(null);
      setVisible(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao salvar local");
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "É necessário permitir o acesso à localização para usar o mapa."
        );
      }
    })();
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // Atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: -8.76,
          longitude: -63.899,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handlePress}
      >
        {/* Marcador do local selecionado manualmente */}
        {selectedLocation && (
          <Marker coordinate={selectedLocation} title="Local selecionado" />
        )}

        {/* Marcadores dos eventos */}
        {events.map(
          (item) =>
            item.location?.lat &&
            item.location?.long && (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: Number(item.location.lat),
                  longitude: Number(item.location.long),
                }}
                title={item.name}
              />
            )
        )}
      </MapView>

      {/* Exibir endereço selecionado */}
      {address && (
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{address}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setVisible(true)}
          >
            <Text style={styles.secondaryButtonText}>Salvar endereço</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal para salvar local */}
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Escreva o nome do local</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do local"
              onChangeText={setLocation}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#6c757d" }]}
                onPress={() => setVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={{ color: "#fff" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProfileScreen({ navigation }) {
  const user = pb.authStore.model;

  const handleLogout = async () => {
    await pb.authStore.clear();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {user?.name || user?.email}</Text>
      <Text style={{ fontSize: 16, color: "#555", marginBottom: 20 }}>
        Email: {user?.email}
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
        <Text style={styles.primaryButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#28a745",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { backgroundColor: "#fff", borderTopWidth: 0.5 },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Eventos":
              iconName = "calendar-outline";
              break;
            case "Mapa":
              iconName = "map-outline";
              break;
            case "Perfil":
              iconName = "person-circle-outline";
              break;
            case "Categorias":
              iconName = "list-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Eventos" component={EventsListScreen} />
      <Tab.Screen name="Mapa" component={EventsMapScreen} />
      <Tab.Screen name="Categorias" component={CategoriasScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
      <Tab.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ tabBarButton: () => null, headerShown: true }}
      />
      <Tab.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ tabBarButton: () => null, headerShown: true }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  eventName: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  eventInfo: { color: "#666", fontSize: 14 },
  eventPrice: { color: "#28a745", marginTop: 4, fontWeight: "bold" },
  thumbnail: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  primaryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  addressBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  addressText: { color: "#333", marginBottom: 5, textAlign: "center" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
});