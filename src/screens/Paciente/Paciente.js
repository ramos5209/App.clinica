import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SectionList, 
  TouchableOpacity, 
  Platform,
  LayoutAnimation,
  UIManager,
  Button,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../Services/api'; 

const IconeLupa = require('../../../assets/lupa.png'); 
const IconeSeta = require('../../../assets/seta.png'); 

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Função para agrupar pacientes por inicial e filtrar por texto
const groupAndFilterPacientes = (pacientes, searchText) => {
  const filteredPacientes = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchText.toLowerCase()) || 
    (p.cpf && p.cpf.includes(searchText))
  );

  const grouped = filteredPacientes.reduce((acc, paciente) => {
    const firstLetter = paciente.nome[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(paciente);
    return acc;
  }, {});

  return Object.keys(grouped).sort().map(letter => ({
    title: letter,
    data: grouped[letter],
  }));
};

const PacienteCard = ({ paciente, navigation, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Desativar Paciente",
      `Tem certeza que deseja desativar o paciente ${paciente.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          style: "destructive", 
          onPress: () => onDelete(paciente.id) 
        }
      ]
    );
  };

  return (
    <View style={cardStyles.card}>
      <TouchableOpacity onPress={toggleExpand} style={cardStyles.mainInfo}>
        <View>
          <Text style={cardStyles.nome}>{paciente.nome}</Text>
          <Text style={cardStyles.subinfo}>CPF: {paciente.cpf}</Text>
        </View>
        <Image
          source={IconeSeta}
          style={[cardStyles.arrowIcon, { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }]}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={cardStyles.details}>
          <Text style={cardStyles.detailText}>Email: {paciente.email}</Text>
          {/* O DTO de listagem Java traz apenas: id, nome, email, cpf. */}
          
          <View style={cardStyles.actionButtons}>
            <Button
              title="Editar"
              onPress={() => navigation.navigate('PacienteForm', { pacienteId: paciente.id })} 
            />
            <View style={{width: 10}} />
            <Button
              title="Desativar"
              color="red"
              onPress={confirmDelete} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const PacienteScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPacientes = async () => {
    setLoading(true);
    try {
      // Chama o Controller Java: GET /pacientes
      const response = await api.get('/pacientes');
      // Spring Boot retorna Page<>, a lista real está em .content
      setPacientes(response.data.content || []);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de pacientes.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    loadPacientes();
  }, []));

  const handleDeletePaciente = async (id) => {
    try {
      // Chama o Controller Java: DELETE /pacientes/{id}
      await api.delete(`/pacientes/${id}`);
      Alert.alert("Sucesso", "Paciente desativado com sucesso.");
      loadPacientes(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao excluir:", error);
      Alert.alert("Erro", "Não foi possível desativar o paciente.");
    }
  };

  const sections = useMemo(() => groupAndFilterPacientes(pacientes, searchText), [pacientes, searchText]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar Paciente ou CPF"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Image source={IconeLupa} style={styles.searchIcon} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 20}} />
      ) : (
        <View style={styles.listWrapper}>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PacienteCard 
                paciente={item} 
                navigation={navigation}
                onDelete={handleDeletePaciente}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20, color: '#888'}}>Nenhum paciente encontrado.</Text>}
          />
        </View>
      )}

      <View style={styles.fixedButtonContainer}>
        <Button
          title="Cadastrar Novo Paciente"
          onPress={() => navigation.navigate('PacienteForm')} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    margin: 10, paddingHorizontal: 10, borderRadius: 8, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4,
  },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  searchIcon: { width: 20, height: 20, tintColor: '#888' },
  listWrapper: { flex: 1, paddingHorizontal: 10, marginBottom: 60 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', backgroundColor: '#f5f5f5', paddingVertical: 5, color: '#333' },
  fixedButtonContainer: { position: 'absolute', bottom: 20, left: 20, right: 20 },
});

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', marginBottom: 10, borderRadius: 8, overflow: 'hidden', elevation: 1 },
  mainInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subinfo: { fontSize: 14, color: '#666', marginTop: 2 },
  arrowIcon: { width: 15, height: 15, tintColor: '#666' },
  details: { padding: 15, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#eee' },
  detailText: { fontSize: 14, color: '#444', marginBottom: 5, marginTop: 5 },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
});

export default PacienteScreen;