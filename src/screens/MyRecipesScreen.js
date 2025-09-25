// src/screens/MisRecetasScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { ref, onValue, push, update, remove } from "firebase/database";
import { database } from "../firebase/firebaseConfig";
import { TouchableOpacity } from "react-native";

export default function MisRecetasScreen() {
  const [titulo, setTitulo] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [recetas, setRecetas] = useState([]);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    const recetasRef = ref(database, "misRecetas");

    const unsubscribe = onValue(recetasRef, (snapshot) => {
      const data = snapshot.val() || {};
      const listaRecetas = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setRecetas(listaRecetas);
    });

    return () => unsubscribe();
  }, []);

  // Crear
  const agregarReceta = () => {
    if (titulo.trim() === "") {
      Alert.alert("Error", "Por favor ingresa un título para la receta");
      return;
    }

    const recetasRef = ref(database, "misRecetas");

    push(recetasRef, {
      title: titulo,
      ingredients: ingredientes,
      instructions: instrucciones,
      fechaAgregado: new Date().toISOString(),
    });

    limpiarFormulario();
  };

  // Actualizar
  const actualizarReceta = () => {
    if (!editando) return;

    const recetaRef = ref(database, `misRecetas/${editando}`);

    update(recetaRef, {
      title: titulo,
      ingredients: ingredientes,
      instructions: instrucciones,
    });

    limpiarFormulario();
    setEditando(null);
  };

  // Eliminar
  const eliminarReceta = (id) => {
    const recetaRef = ref(database, `misRecetas/${id}`);
    remove(recetaRef);
  };

  // Preparar edición
  const prepararEdicion = (item) => {
    setEditando(item.id);
    setTitulo(item.title || "");
    setIngredientes(item.ingredients || "");
    setInstrucciones(item.instructions || "");
  };

  // Limpiar inputs
  const limpiarFormulario = () => {
    setTitulo("");
    setIngredientes("");
    setInstrucciones("");
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitulo}>{item.title}</Text>
      {item.ingredients ? <Text style={styles.meta}>🥗 {item.ingredients}</Text> : null}
      {item.instructions ? <Text style={styles.meta}>📖 {item.instructions}</Text> : null}

      <View style={styles.botonesContainer}>
        <TouchableOpacity style={styles.btnEditar} onPress={() => prepararEdicion(item)}>
          <Text style={styles.btnTexto}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarReceta(item.id)}>
          <Text style={styles.btnTexto}>🗑 Eliminar</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📖 Mis Recetas</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Título de la receta"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder="Ingredientes"
          value={ingredientes}
          onChangeText={setIngredientes}
        />
        <TextInput
          style={styles.input}
          placeholder="Instrucciones"
          value={instrucciones}
          onChangeText={setInstrucciones}
          multiline
        />
        {editando ? (
          <Button title="Actualizar" onPress={actualizarReceta} />
        ) : (
          <Button title="Agregar" onPress={agregarReceta} />
        )}
      </View>

      <FlatList
        data={recetas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Aún no tienes recetas guardadas.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f0f5fc",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 40,
    textAlign: "center",
    color: "#2784FF",
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#2784FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#2784FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f7faff",
    fontSize: 16,
  },
  lista: { flex: 1 },
  item: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#555",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#60a5fa",
  },
  itemTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#2784FF",
    letterSpacing: 0.5,
  },
  meta: {
    color: "#38598B",
    marginBottom: 5,
    fontSize: 15,
  },
  botonesContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 12,
    gap: 12,
  },
  btnEditar: {
    backgroundColor: "#60A5FA",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  btnEliminar: {
    backgroundColor: "#FF6675",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 6,
  },
  btnTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#7493C0",
    fontSize: 17,
    backgroundColor: "#eaf2fb",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
});

