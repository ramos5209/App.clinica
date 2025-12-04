import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity 
} from 'react-native';

const initialPacienteState = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
};

const PacienteForm = ({ paciente, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialPacienteState);
  const [errors, setErrors] = useState({});
  const isEditing = !!paciente;

  useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome || '',
        cpf: paciente.cpf || '',
        email: paciente.email || '',
        telefone: paciente.telefone || '',
        // Achatando o objeto de endereço
        logradouro: paciente.endereco?.logradouro || '',
        numero: paciente.endereco?.numero || '',
        complemento: paciente.endereco?.complemento || '',
        bairro: paciente.endereco?.bairro || '',
        cidade: paciente.endereco?.cidade || '',
        uf: paciente.endereco?.uf || '',
        cep: paciente.endereco?.cep || '',
      });
    }
  }, [paciente]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};
    // Campos obrigatórios baseados no DadosCadastroPaciente.java do Backend
    const requiredFields = ['nome', 'email', 'telefone', 'cpf', 'logradouro', 'bairro', 'cep', 'cidade', 'uf'];

    requiredFields.forEach(field => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = 'Campo Obrigatório';
        valid = false;
      }
    });
    setErrors(newErrors);
    return valid;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditing ? 'Editar Paciente' : 'Novo Paciente'}</Text>

        <Text style={styles.sectionHeader}>1. Dados Pessoais</Text>
        <ValidatedInput 
          label="Nome Completo" 
          name="nome" 
          value={formData.nome} 
          onChangeText={t => handleChange('nome', t)} 
          error={errors.nome} 
        />
        
        <ValidatedInput 
          label="CPF" 
          name="cpf" 
          value={formData.cpf} 
          onChangeText={t => handleChange('cpf', t)} 
          error={errors.cpf} 
          keyboardType="numeric"
          maxLength={11}
          editable={!isEditing} // Backend não aceita atualização de CPF
          style={[formStyles.input, isEditing && formStyles.disabledInput]}
        />

        <Text style={styles.sectionHeader}>2. Contatos</Text>
        <ValidatedInput 
          label="Email" 
          name="email" 
          value={formData.email} 
          onChangeText={t => handleChange('email', t)} 
          error={errors.email} 
          keyboardType="email-address"
          editable={!isEditing} // Backend não aceita atualização de Email
          style={[formStyles.input, isEditing && formStyles.disabledInput]}
        />
        <ValidatedInput 
          label="Telefone" 
          name="telefone" 
          value={formData.telefone} 
          onChangeText={t => handleChange('telefone', t)} 
          error={errors.telefone} 
          keyboardType="phone-pad" 
        />

        <Text style={styles.sectionHeader}>3. Endereço</Text>
        <ValidatedInput label="CEP" name="cep" value={formData.cep} onChangeText={t => handleChange('cep', t)} error={errors.cep} keyboardType="numeric" maxLength={8} />
        <ValidatedInput label="Logradouro" name="logradouro" value={formData.logradouro} onChangeText={t => handleChange('logradouro', t)} error={errors.logradouro} />
        <ValidatedInput label="Bairro" name="bairro" value={formData.bairro} onChangeText={t => handleChange('bairro', t)} error={errors.bairro} />
        
        <View style={formStyles.row}>
          <ValidatedInput label="Número" name="numero" value={formData.numero} onChangeText={t => handleChange('numero', t)} containerStyle={formStyles.inputHalf} />
          <ValidatedInput label="Compl." name="complemento" value={formData.complemento} onChangeText={t => handleChange('complemento', t)} containerStyle={formStyles.inputHalf} />
        </View>
        
        <View style={formStyles.row}>
          <ValidatedInput label="Cidade" name="cidade" value={formData.cidade} onChangeText={t => handleChange('cidade', t)} error={errors.cidade} containerStyle={formStyles.inputThreeQuarter} />
          <ValidatedInput label="UF" name="uf" value={formData.uf} onChangeText={t => handleChange('uf', t)} error={errors.uf} maxLength={2} containerStyle={formStyles.inputQuarter} />
        </View>

      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[formStyles.button, formStyles.saveButton]} onPress={() => { if(validate()) onSave(formData); }}>
          <Text style={formStyles.buttonText}>{isEditing ? 'Salvar Alterações' : 'Cadastrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[formStyles.button, formStyles.cancelButton]} onPress={onCancel}>
          <Text style={formStyles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ValidatedInput = ({ label, error, containerStyle, style, ...props }) => (
  <View style={[formStyles.inputGroup, containerStyle]}>
    <Text style={formStyles.label}>{label}</Text>
    <TextInput style={[formStyles.input, error && formStyles.inputError, style]} {...props} />
    {error && <Text style={formStyles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#007AFF', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
  buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between' },
});

const formStyles = StyleSheet.create({
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, fontWeight: '500', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#f9f9f9', height: 45 },
  inputError: { borderColor: 'red', backgroundColor: '#ffe8e8' },
  disabledInput: { backgroundColor: '#e0e0e0', color: '#888' },
  errorText: { fontSize: 12, color: 'red', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  inputHalf: { flex: 1 },
  inputQuarter: { flex: 0.3 },
  inputThreeQuarter: { flex: 0.7 },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: '#007AFF' },
  cancelButton: { backgroundColor: '#6c757d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PacienteForm;