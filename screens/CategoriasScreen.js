
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import pb from "../services/pocketbase";

export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState([]); //Lista de categorias vindo do backend
  const [newCategoria, setNewCategoria] = useState(""); //Estado para armazenar valor do input para criar nova categoria
  const [updateCategoria, setUpdateCategoria] = useState(""); //Estado para armazenar valor a ser atualizado
  const [visible, setVisible] = useState(false); //Estado para definir se o modal esta visivel ou nao

  const fetchCategorias = async () => {
    //Pegando as categorias
    try {
      const result = await pb.collection("categories").getFullList();
      setCategorias(result);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [categorias]);

  // Função para atualizar a categoria
  const handleUpdateCategoria = async (id) => {
    if (!updateCategoria) return;
    try {
      await pb.collection("categories").update(id, { name: updateCategoria }); //Passar id para atualizar
      await fetchCategorias();
      Alert.alert("Categoria atualizada com sucesso!");
      setVisible(false);
      setUpdateCategoria("");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao atualizar categoria");
    }
  };

  //Funcao para criar categoria
  const handleAddCategoria = async () => {
    if (!newCategoria.trim()) return;
    try {
      await pb.collection("categories").create({ name: newCategoria });
      setNewCategoria("");
      await fetchCategorias();
      Alert.alert("Sucesso", "Categoria criada com sucesso!");
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Não foi possível adicionar categoria.");
    }
  };

  //Funcao pra deletar categoria (Abre um alert perguntando se quer excluir mesmo a categoria)
  const handleDelete = async (id) => {
    Alert.alert("Confirmar exclusão", `Deseja realmente excluir a categoria?`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Categoria excluída:", id);
            await pb.collection("categories").delete(id);
            await fetchCategorias();
            Alert.alert("Sucesso", "Categoria excluída com sucesso!");
            setVisible(false);
          } catch (err) {
            console.error(err);
            Alert.alert("Erro", "Não foi possível excluir a categoria.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar nova categoria</Text>
      <TextInput
        style={styles.input}
        placeholder="Nova categoria"
        value={newCategoria}
        onChangeText={setNewCategoria}
      />
      <Button title="Adicionar" onPress={handleAddCategoria} />
      <View style={{ paddingVertical: 10 }}>
        <Text style={styles.title}>Categorias criadas</Text>
        {/* Verificando se existe alguma categoria criada (se existir ele lista, caso nao exista ele mostra Nenhuma categoria encontrada) */}
        {categorias.length > 0 ? (
          <FlatList
            data={categorias}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    console.log(item.id);
                    setUpdateCategoria(item.name);
                    setVisible(true);
                  }}
                >
                  <Text style={styles.item}>{item.name}</Text>
                </TouchableOpacity>
                {/* Modal de edicao/exclusao */}
                <Modal
                  visible={visible}
                  animationType="slide"
                  transparent={false}
                  onRequestClose={() => setVisible(false)}
                >
                  <View>
                    <View style={{ padding: 10 }}>
                      <Text style={styles.title}>Editar categoria</Text>
                      <View style={{ gap: 2, marginTop: 20 }}>
                        <Text style={styles.label}>Nome da categoria</Text>
                        <TextInput
                          style={styles.input}
                          value={updateCategoria}
                          onChangeText={setUpdateCategoria}
                        />
                      </View>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          title="Atualizar"
                          onPress={() => handleUpdateCategoria(item.id)}
                        />
                        <Button
                          onPress={() => {
                            setVisible(false);
                          }}
                          title="Cancelar"
                        />
                        <Button
                          title="Excluir"
                          color="red"
                          onPress={() => handleDelete(item.id)}
                        />
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            )}
          />
        ) : (
          <View>
            <Text>Nenhuma categoria encontrada</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafd" },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  item: {
    fontSize: 18,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 2,
  },
});
