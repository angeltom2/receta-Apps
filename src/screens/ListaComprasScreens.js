import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from "react-native";
import { ref, onValue, push, update, remove } from "firebase/database";
import { database } from "../firebase/firebaseConfig";

export default function ListaComprasScreen() {
  const [nuevoIngrediente, setNuevoIngrediente] = useState("");
  const [ingredientes, setIngredientes] = useState([]);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    const ingredientesRef = ref(database, "ingredientes");

    const unsubscribe = onValue(ingredientesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const listaIngredientes = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setIngredientes(listaIngredientes);
    });

    return () => unsubscribe();
  }, []);

  const agregarIngrediente = () => {
    if (nuevoIngrediente.trim() === "") {
      Alert.alert("Error", "Por favor ingresa un ingrediente");
      return;
    }

    const ingredientesRef = ref(database, "ingredientes");

    push(ingredientesRef, {
      nombre: nuevoIngrediente,
      comprado: false,
      fechaAgregado: new Date().toISOString(),
    });

    setNuevoIngrediente("");
  };

  const actualizarIngrediente = () => {
    if (nuevoIngrediente.trim() === "" || !editando) return;

    const ingredienteRef = ref(database, `ingredientes/${editando}`);

    update(ingredienteRef, { nombre: nuevoIngrediente });

    setNuevoIngrediente("");
    setEditando(null);
  };

  const toggleComprado = (id, compradoActual) => {
    const ingredienteRef = ref(database, `ingredientes/${id}`);
    update(ingredienteRef, { comprado: !compradoActual });
  };

  const eliminarIngrediente = (id) => {
    const ingredienteRef = ref(database, `ingredientes/${id}`);
    remove(ingredienteRef);
  };

  const prepararEdicion = (id, nombre) => {
    setEditando(id);
    setNuevoIngrediente(nombre);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text
        style={[styles.itemTexto, item.comprado && styles.comprado]}
        onPress={() => toggleComprado(item.id, item.comprado)}
      >
        {item.nombre}
      </Text>
      <View style={styles.botonesContainer}>
        <Button title="Editar" onPress={() => prepararEdicion(item.id, item.nombre)} color="#4CAF50" />
        <Button title="Eliminar" onPress={() => eliminarIngrediente(item.id)} color="#F44336" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Compras</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ingresa un ingrediente"
          value={nuevoIngrediente}
          onChangeText={setNuevoIngrediente}
        />
        {editando ? <Button title="Actualizar" onPress={actualizarIngrediente} /> : <Button title="Agregar" onPress={agregarIngrediente} />}
      </View>

      <FlatList data={ingredientes} renderItem={renderItem} keyExtractor={(item) => item.id} style={styles.lista} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20, marginTop: 40, textAlign: "center" },
  inputContainer: { flexDirection: "row", marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 10, marginRight: 10, backgroundColor: "#fff" },
  lista: { flex: 1 },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 4, marginBottom: 10, elevation: 2 },
  itemTexto: { fontSize: 16, marginBottom: 5 },
  comprado: { textDecorationLine: "line-through", color: "#888" },
  botonesContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
});
