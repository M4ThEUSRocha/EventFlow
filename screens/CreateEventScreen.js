import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import pb from "../services/pocketbase";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateEventScreen({ navigation, route }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [startAt, setStartAt] = useState(new Date());
  const [endAt, setEndAt] = useState(new Date());
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Estados para controlar visibilidade dos pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    requestPermissions();
    fetchCategories();
    fetchLocations();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar suas fotos."
      );
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await pb
        .collection("categories")
        .getFullList({ sort: "name" });
      setCategories(result);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível carregar categorias.");
    }
  };

  const fetchLocations = async () => {
    try {
      const result = await pb
        .collection("locations")
        .getFullList({ sort: "name" });
      setLocations(result);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível carregar locais.");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setThumbnail(result.assets[0]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Atenção", "Preencha o nome do evento.");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Atenção", "Preencha a descrição do evento.");
      return false;
    }
    if (!selectedCategory) {
      Alert.alert("Atenção", "Selecione uma categoria.");
      return false;
    }
    if (!selectedLocation) {
      Alert.alert("Atenção", "Selecione um local.");
      return false;
    }
    if (!price) {
      Alert.alert("Atenção", "Preencha o valor do ingresso.");
      return false;
    }
    return true;
  };

  const formatDateForDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForPocketBase = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day} 00:00:00`;
  };

  const formatTimeForDisplay = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setStartAt(selectedTime);
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setEndAt(selectedTime);
    }
  };

  // NOVO MÉTODO DE ESCOLHA DE CATEGORIA E LOCAL PARA iOS
  const showCategoryActionSheet = () => {
    const options = categories.map(c => c.name);
    options.push("Cancelar");
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex !== options.length - 1) {
          setSelectedCategory(categories[buttonIndex].id);
        }
      }
    );
  };

  const showLocationActionSheet = () => {
    const options = locations.map(l => l.name);
    options.push("Cancelar");
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex !== options.length - 1) {
          setSelectedLocation(locations[buttonIndex].id);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Criar FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category_id", selectedCategory);
      formData.append("date", formatDateForPocketBase(eventDate));
      formData.append("start_at", formatTimeForDisplay(startAt));
      formData.append("end_at", formatTimeForDisplay(endAt));
      formData.append("location_id", selectedLocation);

      // Converter preço corretamente
      const priceValue = parseFloat(price.replace(",", "."));
      formData.append("price", priceValue);

      // Adicionar imagem se foi selecionada
      if (thumbnail) {
        const uriParts = thumbnail.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("thumbnail", {
          uri: thumbnail.uri,
          name: `event_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      console.log("Enviando dados:", {
        name,
        description,
        category_id: selectedCategory,
        date: formatDateForPocketBase(eventDate),
        start_at: formatTimeForDisplay(startAt),
        end_at: formatTimeForDisplay(endAt),
        location_id: selectedLocation,
        price: priceValue,
        has_thumbnail: !!thumbnail,
      });

      const record = await pb.collection("events").create(formData);

      console.log("Evento criado:", record);

      Alert.alert("Sucesso", "Evento criado com sucesso!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
      setName("");
      setDescription("");
      setEventDate(new Date());
      setStartAt(new Date());
      setEndAt(new Date());
      setPrice("");
      setThumbnail(null);
      setSelectedCategory("");
      setSelectedLocation("");
    } catch (err) {
      console.error("Erro completo:", err);
      console.error("Detalhes do erro:", {
        message: err.message,
        status: err.status,
        response: err.response,
        data: err.data,
      });

      let errorMessage = "Não foi possível criar o evento. Tente novamente.";

      if (err.status === 400) {
        errorMessage = "Dados inválidos. Verifique todos os campos.";
        if (err.data) {
          console.log("Campos com erro:", err.data);
        }
      } else if (err.status === 403) {
        errorMessage = "Você não tem permissão para criar eventos.";
      } else if (err.status === 404) {
        errorMessage = "Coleção não encontrada. Verifique o PocketBase.";
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastrar Evento</Text>

      {/* Seletor de Imagem */}
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail.uri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#999" />
            <Text style={styles.imagePlaceholderText}>
              Toque para adicionar uma imagem
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nome */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nome do Evento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Festival de Música"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Descrição */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.textarea}
          multiline
          placeholder="Descreva os detalhes do evento..."
          numberOfLines={5}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Categoria */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Categoria</Text>
        {Platform.OS === "ios" ? (
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={showCategoryActionSheet}
          >
            <Text style={styles.dateTimeText}>
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name
                : "Selecione uma categoria"}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma categoria" value="" />
              {categories.map((item) => (
                <Picker.Item key={item.id} label={item.name} value={item.id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Data do Evento */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Data do Evento</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.dateTimeText}>
            {formatDateForDisplay(eventDate)}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* Horários */}
      <View style={styles.rowContainer}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Início</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.dateTimeText}>
              {formatTimeForDisplay(startAt)}
            </Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startAt}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onStartTimeChange}
            />
          )}
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Término</Text>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.dateTimeText}>
              {formatTimeForDisplay(endAt)}
            </Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endAt}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onEndTimeChange}
            />
          )}
        </View>
      </View>

      {/* Local */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Local</Text>
        {Platform.OS === "ios" ? (
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={showLocationActionSheet}
          >
            <Text style={styles.dateTimeText}>
              {selectedLocation
                ? locations.find(l => l.id === selectedLocation)?.name
                : "Selecione um local"}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#666" />
          </TouchableOpacity>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={setSelectedLocation}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um local" value="" />
              {locations.map((item) => (
                <Picker.Item key={item.id} label={item.name} value={item.id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Preço */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Valor do Ingresso (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="20,00"
          keyboardType="decimal-pad"
          value={price}
          onChangeText={setPrice}
        />
      </View>

      {/* Botão de Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Cadastrar Evento</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9fafd",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1a1a1a",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  textarea: {
    width: "100%",
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  pickerContainer: {
    width: "100%",
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: "100%",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  halfField: {
    width: "48%",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  imagePlaceholderText: {
    marginTop: 12,
    color: "#999",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  dateTimeButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#333",
  },
});
