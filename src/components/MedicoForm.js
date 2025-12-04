import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Instale: npx expo install @react-native-picker/picker

// Valores EXATOS do seu Enum Java (Especialidade.java)
const especialidades = [
  { label: 'Cardiologia', value: 'CARDIOLOGIA' },
  { label: 'Pediatria', value: 'PEDIATRIA' }, // Seu enum Java não tem pediatria no arquivo enviado, cuidado!
  { label: 'Dermatologia', value: 'DERMATOLOGIA' },
  { label: 'Ginecologia', value: 'GINECOLOGIA' }, // Typo mantido conforme seu Backend
  { label: 'Ortopedia', value: 'ORTOPEDIA' },
];
// Nota: Removi opções que não existem no seu arquivo Especialidade.class enviado (ex: Neurologia) para evitar erro 400.

const initialMedicoState = {
  nome: '',
  especialidade: 'CARDIOLOGIA',
  crm: '',
  email: '',
  telefone: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '', // Faltava bairro no seu form original, mas o DTO exige
  cidade: '',
  uf: '',
  cep: '',
};

const MedicoForm = ({ medico, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialMedicoState);
  const [errors, setErrors] = useState({});
  const isEditing = !!medico;

  // Popula o formulário se estiver editando
  useEffect(() => {
    if (medico) {
      setFormData({
        nome: medico.nome,
        especialidade: medico.especialidade,
        crm: medico.crm,
        email: medico.email,
        telefone: medico.telefone,
        // Achatando o endereço para o formulário
        logradouro: medico.endereco?.logradouro || '',
        numero: medico.endereco?.numero || '',
        complemento: medico.endereco?.complemento || '',
        bairro: medico.endereco?.bairro || '',
        cidade: medico.endereco?.cidade || '',
        uf: medico.endereco?.uf || '',
        cep: medico.endereco?.cep || '',
      });
    }
  }, [medico]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};
    // Campos obrigatórios baseados no DadosCadastroMedico.java
    const requiredFields = ['nome', 'email', 'telefone', 'crm', 'logradouro', 'bairro', 'cep', 'cidade', 'uf'];

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
        <Text style={styles.title}>{isEditing ? 'Editar Perfil' : 'Novo Cadastro'}</Text>

        <Text style={styles.sectionHeader}>1. Profissional</Text>
        <ValidatedInput label="Nome Completo" name="nome" value={formData.nome} onChangeText={t => handleChange('nome', t)} error={errors.nome} />
        
        <View style={formStyles.inputGroup}>
          <Text style={formStyles.label}>Especialidade</Text>
          <View style={formStyles.pickerWrapper}>
            <Picker
              selectedValue={formData.especialidade}
              onValueChange={(val) => handleChange('especialidade', val)}
              enabled={!isEditing} // Seu backend não permite editar especialidade no DTO de atualização
              style={formStyles.picker}
            >
              {especialidades.map(esp => (
                <Picker.Item key={esp.value} label={esp.label} value={esp.value} />
              ))}
            </Picker>
          </View>
        </View>

        <ValidatedInput 
          label="CRM" name="crm" value={formData.crm} 
          onChangeText={t => handleChange('crm', t)} error={errors.crm} 
          editable={!isEditing} // Backend não permite editar CRM
          style={[formStyles.input, isEditing && formStyles.disabledInput]}
        />

        <Text style={styles.sectionHeader}>2. Contatos</Text>
        <ValidatedInput 
          label="Email" name="email" value={formData.email} 
          onChangeText={t => handleChange('email', t)} error={errors.email} keyboardType="email-address"
          editable={!isEditing} // Backend não permite editar Email
          style={[formStyles.input, isEditing && formStyles.disabledInput]}
        />
        <ValidatedInput 
          label="Telefone" name="telefone" value={formData.telefone} 
          onChangeText={t => handleChange('telefone', t)} error={errors.telefone} keyboardType="phone-pad" 
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
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#f9f9f9', justifyContent: 'center', height: 45 },
  picker: { width: '100%' },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: '#007AFF' },
  cancelButton: { backgroundColor: '#6c757d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default MedicoForm;