
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import pb from "../services/pocketbase";

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDelete = () => {
    Alert.alert(
      "Excluir evento",
      "Tem certeza que deseja excluir este evento?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await pb.collection("events").delete(event.id);
              Alert.alert("Sucesso", "Evento excluído com sucesso!");
              navigation.replace("Home"); // volta pra tela inicial
            } catch (err) {
              console.log(err);
              Alert.alert("Erro", "Não foi possível excluir o evento.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 🔍 Busca a localização, caso não venha expandida
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (event.expand?.location_id) {
          setLocation(event.expand.location_id);
        } else if (event.location_id) {
          const loc = await pb
            .collection("locations")
            .getOne(event.location_id);
          setLocation(loc);
        }
      } catch (err) {
        console.log("Erro ao buscar localização:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [event]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "Data não disponível";
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR");
  };

  const getDayOfWeek = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return days[date.getDay()];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🖼 Imagem principal */}
      {event.thumbnail ? (
        <Image
          source={{ uri: pb.getFileUrl(event, event.thumbnail) }}
          style={styles.headerImage}
        />
      ) : (
        <View style={styles.headerPlaceholder}>
          <Ionicons name="image-outline" size={60} color="#ccc" />
        </View>
      )}

      {/* Conteúdo */}
      <View style={styles.content}>
        {event.expand?.category_id && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {event.expand.category_id.name}
            </Text>
          </View>
        )}

        <Text style={styles.title}>{event.name}</Text>

        {/* 📅 Data e horário */}
        <View style={styles.infoCard}>
          <Ionicons
            name="calendar"
            size={24}
            color="#007AFF"
            style={styles.icon}
          />
          <View>
            <Text style={styles.infoLabel}>Data e Horário</Text>
            <Text style={styles.infoValue}>
              {getDayOfWeek(event.date)}, {formatDate(event.date)}
            </Text>
            <Text style={styles.infoSubValue}>
              {event.start_at} às {event.end_at}
            </Text>
          </View>
        </View>

        {/* 📍 Localização */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#007AFF"
            style={{ marginVertical: 20 }}
          />
        ) : location ? (
          <View style={styles.locationCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="location"
                size={24}
                color="#FF6B6B"
                style={styles.icon}
              />
              <View>
                <Text style={styles.infoLabel}>Local</Text>
                <Text style={styles.infoValue}>{location.name}</Text>
                <Text style={styles.infoSubValue}>{location.address}</Text>
              </View>
            </View>

            {/* 🗺 Mapa */}
            {location.lat && location.long && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: Number(location.lat),
                  longitude: Number(location.long),
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: Number(location.lat),
                    longitude: Number(location.long),
                  }}
                  title={location.name}
                  description={location.address}
                />
              </MapView>
            )}
          </View>
        ) : (
          <Text style={{ color: "#888", marginVertical: 10 }}>
            Localização não disponível.
          </Text>
        )}

        {/* 💸 Preço */}
        <View style={styles.infoCard}>
          <Ionicons
            name="ticket"
            size={24}
            color="#4CAF50"
            style={styles.icon}
          />
          <View>
            <Text style={styles.infoLabel}>Ingresso</Text>
            <Text style={styles.priceValue}>
              R$ {parseFloat(event.price).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* 📝 Descrição */}
        {event.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Sobre o Evento</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {/* Botão */}
        <View style={{ display: "flex", gap: 12 }}>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.buttonText}>Comprar Ingresso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>Excluir evento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafd" },
  headerImage: { width: "100%", height: 300, resizeMode: "cover" },
  headerPlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 20, paddingBottom: 40 },
  categoryBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  categoryText: { color: "#1976D2", fontWeight: "600", fontSize: 13 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 20,
    lineHeight: 32,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1,
  },
  locationCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 1,
  },
  icon: { marginRight: 12 },
  infoLabel: { fontSize: 13, color: "#666" },
  infoValue: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  infoSubValue: { fontSize: 14, color: "#666" },
  priceValue: { fontSize: 22, fontWeight: "bold", color: "#4CAF50" },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  descriptionContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  description: { fontSize: 15, color: "#444", lineHeight: 22 },
  button: {
    backgroundColor: "#007AFF",
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 4,
  },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
