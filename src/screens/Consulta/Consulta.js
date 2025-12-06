import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  Alert, Modal, Platform 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import api from '../../Services/api';

const Consulta = ({ navigation }) => {
  const [consultas, setConsultas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);
  const [motivo, setMotivo] = useState('PACIENTE_DESISTIU');

  const loadConsultas = async () => {
    try {
      const response = await api.get('/consultas');
      setConsultas(response.data.content || []);
    } catch (error) {
      console.log("Erro ao carregar consultas", error);
    }
  };

  useFocusEffect(useCallback(() => { loadConsultas(); }, []));

  const abrirModal = (consulta) => {
    setConsultaSelecionada(consulta);
    setModalVisible(true);
  };

  // Função auxiliar para exibir feedback compatível com Web e Mobile
  const showFeedback = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const confirmarCancelamento = async () => {
    // Validação extra para Web se não estiver usando o Modal (opcional, pois o Modal já protege)
    if (Platform.OS === 'web' && !modalVisible) {
       const confirmed = window.confirm("Tem certeza que deseja cancelar?");
       if (!confirmed) return;
    }

    try {
      await api.delete('/consultas', {
        data: { idConsulta: consultaSelecionada.id, motivo: motivo }
      });
      
      showFeedback("Sucesso", "Consulta cancelada.");
      
      setModalVisible(false);
      loadConsultas(); // Recarrega a lista: O item cancelado NÃO virá mais do backend
    } catch (error) {
      const msg = error.response?.data || "Erro ao cancelar.";
      showFeedback("Erro", typeof msg === 'string' ? msg : "Falha na requisição");
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
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma consulta agendada.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>
                {new Date(item.data).toLocaleString('pt-BR')}
            </Text>
            <View style={styles.cardBody}>
              <Text>Médico ID: {item.idMedico}</Text>
              <Text>Paciente ID: {item.idPaciente}</Text>
            </View>
            {/* O botão abre o Modal, que funciona igual na Web e Mobile */}
            <TouchableOpacity 
              style={styles.btnCancel}
              onPress={() => abrirModal(item)}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal de Cancelamento (Estilo PDF) - Funciona na Web */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Deseja cancelar esta consulta?</Text>
            
            {consultaSelecionada && (
              <View style={styles.modalInfo}>
                <Text style={styles.modalDate}>
                  {new Date(consultaSelecionada.data).toLocaleString('pt-BR')}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Selecione o motivo:</Text>
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={motivo}
                onValueChange={(val) => setMotivo(val)}
                style={{ height: 50, width: '100%' }} // Ajuste para Web
                >
                <Picker.Item label="Paciente desistiu" value="PACIENTE_DESISTIU" />
                <Picker.Item label="Médico cancelou" value="MEDICO_CANCELOU" />
                <Picker.Item label="Outros" value="OUTROS" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.modalBtnConfirm}
              onPress={confirmarCancelamento}>
              <Text style={styles.textStyle}>Confirmar cancelamento</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalBtnBack}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.backText}>Voltar</Text>
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
  btnNewText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  cardHeader: { fontWeight: 'bold', fontSize: 16, marginBottom: 5, color: '#333' },
  cardBody: { marginBottom: 10 },
  btnCancel: { alignSelf: 'flex-start', backgroundColor: '#ffecec', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
  btnCancelText: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  
  // Modal Styles
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { 
    width: Platform.OS === 'web' ? '400px' : '90%', // Largura fixa na Web para não esticar
    backgroundColor: "white", 
    borderRadius: 20, 
    padding: 25, 
    alignItems: "center", 
    shadowColor: "#000", 
    elevation: 5 
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: "center" },
  modalInfo: { marginBottom: 15, alignItems: 'center' },
  modalDate: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  label: { alignSelf: 'flex-start', marginBottom: 5, color: '#666' },
  pickerBox: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
  modalBtnConfirm: { backgroundColor: "#0B3B60", borderRadius: 8, padding: 15, width: '100%', alignItems: 'center' },
  textStyle: { color: "white", fontWeight: "bold" },
  modalBtnBack: { marginTop: 15 },
  backText: { color: '#333', fontWeight: 'bold' }
});

export default Consulta;