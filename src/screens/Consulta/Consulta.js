import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import api from '../../Services/api';

const Consulta = ({ navigation }) => {
  const [consultas, setConsultas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [consultaParaCancelar, setConsultaParaCancelar] = useState(null);
  const [motivo, setMotivo] = useState('PACIENTE_DESISTIU');

  const loadConsultas = async () => {
    try {
      const response = await api.get('/consultas'); // Requer implementação do GET no backend
      setConsultas(response.data.content || []);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(useCallback(() => { loadConsultas(); }, []));

  const abrirModalCancelamento = (id) => {
    setConsultaParaCancelar(id);
    setModalVisible(true);
  };

  const confirmarCancelamento = async () => {
    try {
      await api.delete('/consultas', {
        data: { idConsulta: consultaParaCancelar, motivo: motivo }
      });
      Alert.alert("Sucesso", "Consulta cancelada.");
      setModalVisible(false);
      loadConsultas();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível cancelar.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.btnNew} 
        onPress={() => navigation.navigate('AgendarConsulta')}>
        <Text style={styles.btnNewText}>+ Agendar Nova Consulta</Text>
      </TouchableOpacity>

      <FlatList
        data={consultas}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data: {new Date(item.data).toLocaleString()}</Text>
            <Text>Médico ID: {item.idMedico}</Text>
            <Text>Paciente ID: {item.idPaciente}</Text>
            <TouchableOpacity 
              style={styles.btnCancel}
              onPress={() => abrirModalCancelamento(item.id)}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal de Cancelamento estilo PDF */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Deseja cancelar esta consulta?</Text>
            
            <Text style={styles.label}>Motivo do cancelamento</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={motivo}
                onValueChange={(val) => setMotivo(val)}>
                <Picker.Item label="Paciente desistiu" value="PACIENTE_DESISTIU" />
                <Picker.Item label="Médico cancelou" value="MEDICO_CANCELOU" />
                <Picker.Item label="Outros" value="OUTROS" />
              </Picker>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={confirmarCancelamento}>
              <Text style={styles.textStyle}>Confirmar cancelamento</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, {backgroundColor: 'transparent', marginTop: 10}]}
              onPress={() => setModalVisible(false)}>
              <Text style={{color: '#333'}}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  btnNew: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginBottom: 20 },
  btnNewText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  cardTitle: { fontWeight: 'bold', marginBottom: 5 },
  btnCancel: { marginTop: 10, alignSelf: 'flex-end' },
  btnCancelText: { color: 'red' },
  
  // Modal Styles
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '85%', backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalText: { marginBottom: 15, textAlign: "center", fontSize: 18, fontWeight: 'bold' },
  pickerBox: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 20 },
  button: { borderRadius: 8, padding: 15, elevation: 2, width: '100%' },
  buttonClose: { backgroundColor: "#2196F3" },
  textStyle: { color: "white", fontWeight: "bold", textAlign: "center" },
  label: { alignSelf: 'flex-start', marginBottom: 5, color: '#666' }
});

export default Consulta;