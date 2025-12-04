import React, { useState, useEffect } from 'react';
import PacienteForm from '../../components/PacienteForm';
import { View, ActivityIndicator, Alert } from 'react-native';
import api from '../../Services/api';

const CadastroEdicaoPacienteScreen = ({ route, navigation }) => {
  // Recebe o ID se for edição (vindo da navegação da lista)
  const { pacienteId } = route.params || {};
  const [pacienteParaEditar, setPacienteParaEditar] = useState(null);
  const [loading, setLoading] = useState(!!pacienteId);

  // Busca dados para edição
  useEffect(() => {
    if (pacienteId) {
      api.get(`/pacientes/${pacienteId}`)
        .then(response => {
          setPacienteParaEditar(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar detalhes:", err);
          Alert.alert("Erro", "Falha ao carregar dados do paciente.");
          navigation.goBack();
        });
    }
  }, [pacienteId]);

  const handleSave = async (dadosFormulario) => {
    try {
      if (pacienteId) {
        // --- MODO EDIÇÃO (PUT) ---
        // Conforme DadosAtualizacaoPaciente.java: id, nome, telefone, endereco
        const payload = {
          id: pacienteId,
          nome: dadosFormulario.nome,
          telefone: dadosFormulario.telefone,
          endereco: {
            logradouro: dadosFormulario.logradouro,
            bairro: dadosFormulario.bairro,
            cep: dadosFormulario.cep,
            cidade: dadosFormulario.cidade,
            uf: dadosFormulario.uf,
            numero: dadosFormulario.numero,
            complemento: dadosFormulario.complemento
          }
        };
        await api.put('/pacientes', payload);
        Alert.alert("Sucesso", "Dados do paciente atualizados!");
      } else {
        // --- MODO CADASTRO (POST) ---
        // Conforme DadosCadastroPaciente.java: nome, email, cpf, telefone, endereco
        const payload = {
          nome: dadosFormulario.nome,
          email: dadosFormulario.email,
          cpf: dadosFormulario.cpf,
          telefone: dadosFormulario.telefone,
          endereco: {
            logradouro: dadosFormulario.logradouro,
            bairro: dadosFormulario.bairro,
            cep: dadosFormulario.cep,
            cidade: dadosFormulario.cidade,
            uf: dadosFormulario.uf,
            numero: dadosFormulario.numero,
            complemento: dadosFormulario.complemento
          }
        };
        await api.post('/pacientes', payload);
        Alert.alert("Sucesso", "Paciente cadastrado!");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar:", error.response?.data || error);
      const msg = error.response?.data?.[0]?.mensagem || "Verifique os dados e tente novamente.";
      Alert.alert("Erro", msg);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PacienteForm
        paciente={pacienteParaEditar}
        onSave={handleSave}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

export default CadastroEdicaoPacienteScreen;