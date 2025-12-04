// src/screens/Op3Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Consulta = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Detalhes de Cunsulta</Text>
      <Text>Esta interface será implementada futuramente.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, marginBottom: 15 }
});

export default Consulta;