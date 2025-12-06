import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../../Services/api';

const AgendarConsultaScreen = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  
  const [selectedPaciente, setSelectedPaciente] = useState('');
  const [selectedMedico, setSelectedMedico] = useState('');
  const [selectedEspecialidade, setSelectedEspecialidade] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');

  const especialidades = [
    { label: 'Cardiologia', value: 'CARDIOLOGIA' },
    { label: 'Dermatologia', value: 'DERMATOLOGIA' },
    { label: 'Ginecologia', value: 'GINECOLOGIA' },
    { label: 'Ortopedia', value: 'ORTOPEDIA' },
  ];

  // Função auxiliar para alertas compatível com Web e Native
  const showAlert = (titulo, mensagem, onPress = null) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensagem}`);
      if (onPress) onPress();
    } else {
      Alert.alert(titulo, mensagem, onPress ? [{ text: 'OK', onPress }] : [{ text: 'OK' }]);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const resPac = await api.get('/pacientes');
        const resMed = await api.get('/medicos');
        setPacientes(resPac.data.content || []);
        setMedicos(resMed.data.content || []);
      } catch (e) {
        console.error(e);
        showAlert("Erro", "Falha ao carregar listas de médicos e pacientes.");
      }
    }
    loadData();
  }, []);

  const handleAgendar = async () => {
    if (!selectedPaciente || !data || !hora) {
      showAlert("Atenção", "Preencha paciente, data e hora.");
      return;
    }

    // Formata a data para ISO 8601 (YYYY-MM-DDTHH:MM:SS)
    const [dia, mes, ano] = data.split('/');
    const dataISO = `${ano}-${mes}-${dia}T${hora}:00`;

    const payload = {
      idPaciente: selectedPaciente,
      idMedico: selectedMedico || null, 
      especialidade: !selectedMedico ? selectedEspecialidade : null,
      data: dataISO
    };

    try {
      await api.post('/consultas', payload);
      
      showAlert("Sucesso", "Consulta agendada com sucesso!", () => {
        navigation.goBack();
      });

    } catch (error) {
      // Lógica para capturar a mensagem de erro do backend
      let msg = "Erro desconhecido ao agendar.";
      
      if (error.response?.data) {
        // Se for ValidacaoException, vem como string direta
        if (typeof error.response.data === 'string') {
          msg = error.response.data;
        } 
        // Se for erro de validação de campos (@Valid), vem como array de objetos
        else if (Array.isArray(error.response.data)) {
          msg = error.response.data.map(e => `${e.campo}: ${e.mensagem}`).join('\n');
        }
      }
      
      showAlert("Não foi possível agendar", msg);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Agendar Consulta</Text>

        <Text style={styles.label}>Paciente</Text>
        <View style={styles.inputWrap}>
          <Picker
            selectedValue={selectedPaciente}
            onValueChange={(val) => setSelectedPaciente(val)}>
            <Picker.Item label="Selecione um paciente..." value="" />
            {pacientes.map(p => <Picker.Item key={p.id} label={p.nome} value={p.id} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Médico (Opcional)</Text>
        <View style={styles.inputWrap}>
          <Picker
            selectedValue={selectedMedico}
            onValueChange={(val) => setSelectedMedico(val)}>
            <Picker.Item label="Escolha aleatória" value="" />
            {medicos.map(m => <Picker.Item key={m.id} label={m.nome} value={m.id} />)}
          </Picker>
        </View>

        {!selectedMedico && (
          <>
            <Text style={styles.label}>Especialidade (para escolha aleatória)</Text>
            <View style={styles.inputWrap}>
              <Picker
                selectedValue={selectedEspecialidade}
                onValueChange={(val) => setSelectedEspecialidade(val)}>
                <Picker.Item label="Selecione..." value="" />
                {especialidades.map(e => <Picker.Item key={e.value} label={e.label} value={e.value} />)}
              </Picker>
            </View>
          </>
        )}

        <Text style={styles.label}>Data (DD/MM/AAAA)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 25/12/2023"
          value={data}
          onChangeText={setData}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Horário (HH:MM)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 10:00"
          value={hora}
          onChangeText={setHora}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.btnConfirm} onPress={handleAgendar}>
          <Text style={styles.btnText}>Agendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()}>
          <Text style={[styles.btnText, {color: '#666'}]}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#007AFF' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
  inputWrap: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  btnConfirm: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  btnCancel: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AgendarConsultaScreen;   