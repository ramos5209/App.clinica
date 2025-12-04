import React, { useState, useEffect } from 'react';
import MedicoForm from '../../components/MedicoForm';
import { View, ActivityIndicator, Alert } from 'react-native';
import api from '../../Services/api';

const CadastroEdicaoMedicoScreen = ({ route, navigation }) => {
  // Recebe o ID se for edição
  const { medicoId } = route.params || {};
  const [medicoParaEditar, setMedicoParaEditar] = useState(null);
  const [loading, setLoading] = useState(!!medicoId);

  // Se houver ID, busca os detalhes completos do médico para preencher o formulário
  useEffect(() => {
    if (medicoId) {
      api.get(`/medicos/${medicoId}`)
        .then(response => {
          setMedicoParaEditar(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar detalhes:", err);
          Alert.alert("Erro", "Falha ao carregar dados do médico.");
          navigation.goBack();
        });
    }
  }, [medicoId]);

  const handleSave = async (dadosFormulario) => {
    try {
      if (medicoId) {
        // --- MODO EDIÇÃO (PUT) ---
        // O DTO DadosAtualizacaoMedico do Java aceita: id, nome, telefone, endereco.
        // CRM, Email e Especialidade NÃO são atualizáveis pelo seu back-end atual.
        const payload = {
          id: medicoId,
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
        await api.put('/medicos', payload);
        Alert.alert("Sucesso", "Dados atualizados!");
      } else {
        // --- MODO CADASTRO (POST) ---
        // Estrutura deve bater com DadosCadastroMedico.java
        const payload = {
          nome: dadosFormulario.nome,
          email: dadosFormulario.email,
          telefone: dadosFormulario.telefone,
          crm: dadosFormulario.crm,
          especialidade: dadosFormulario.especialidade, // Deve ser CARDIOLOGIA, ORTOPEDIA, etc.
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
        await api.post('/medicos', payload);
        Alert.alert("Sucesso", "Médico cadastrado!");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar:", error.response?.data || error);
      // Mostra mensagem de erro vinda do TratadorDeErros do Spring se disponível
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
      <MedicoForm
        medico={medicoParaEditar}
        onSave={handleSave}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

export default CadastroEdicaoMedicoScreen;