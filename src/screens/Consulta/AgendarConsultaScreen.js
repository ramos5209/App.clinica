import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../../Services/api';

const AgendarConsultaScreen = ({ navigation }) => {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  
  const [selectedPaciente, setSelectedPaciente] = useState('');
  const [selectedMedico, setSelectedMedico] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  
  // No PDF, não tem seleção de especialidade para random, 
  // mas o backend pede. Vou assumir seleção direta de médico ou lógica extra.
  // Aqui farei seleção simples de médico.

  useEffect(() => {
    // Carregar Pacientes e Médicos para os Dropdowns
    async function loadData() {
      try {
        const resPac = await api.get('/pacientes');
        const resMed = await api.get('/medicos');
        setPacientes(resPac.data.content);
        setMedicos(resMed.data.content);
      } catch (e) {
        Alert.alert("Erro", "Falha ao carregar listas.");
      }
    }
    loadData();
  }, []);

  const handleAgendar = async () => {
    if (!selectedPaciente || !data || !hora) {
      Alert.alert("Erro", "Preencha os campos obrigatórios.");
      return;
    }

    // Formatar data ISO 8601: YYYY-MM-DDTHH:MM:SS
    // Assumindo input simples DD/MM/YYYY e HH:MM
    // Para produção, use bibliotecas como 'date-fns' ou um DatePicker nativo
    const [dia, mes, ano] = data.split('/');
    const dataISO = `${ano}-${mes}-${dia}T${hora}:00`;

    const payload = {
      idPaciente: selectedPaciente,
      idMedico: selectedMedico || null, // Se vazio, backend escolhe (precisa enviar especialidade nesse caso)
      data: dataISO,
      // especialidade: 'CARDIOLOGIA' // Caso queira implementar a lógica aleatória
    };

    try {
      await api.post('/consultas', payload);
      Alert.alert("Sucesso", "Consulta agendada!");
      navigation.goBack();
    } catch (error) {
      const msg = error.response?.data || "Erro ao agendar.";
      Alert.alert("Erro", typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendar consulta</Text>
      
      <ScrollView>
        <Text style={styles.label}>Paciente</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPaciente}
            onValueChange={(val) => setSelectedPaciente(val)}>
            <Picker.Item label="Selecione um paciente" value="" />
            {pacientes.map(p => <Picker.Item key={p.id} label={p.nome} value={p.id} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Médico (Opcional)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMedico}
            onValueChange={(val) => setSelectedMedico(val)}>
            <Picker.Item label="Aleatório (Selecione Especialidade no código)" value="" />
            {medicos.map(m => <Picker.Item key={m.id} label={m.nome} value={m.id} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Data (DD/MM/AAAA)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 25/10/2023"
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

        <TouchableOpacity style={styles.btnAgendar} onPress={handleAgendar}>
          <Text style={styles.btnText}>Agendar consulta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.btnCancelar} onPress={() => navigation.goBack()}>
          <Text style={[styles.btnText, {color: '#666'}]}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
  label: { fontSize: 16, color: '#333', marginBottom: 5, marginTop: 15, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9' },
  btnAgendar: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  btnCancelar: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AgendarConsultaScreen;