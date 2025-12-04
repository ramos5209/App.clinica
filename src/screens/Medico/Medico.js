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

// Função para agrupar médicos por inicial e filtrar por texto
const groupAndFilterMedicos = (medicos, searchText) => {
  const filteredMedicos = medicos.filter(medico => 
    medico.nome.toLowerCase().includes(searchText.toLowerCase()) || 
    (medico.especialidade && medico.especialidade.toLowerCase().includes(searchText.toLowerCase()))
  );

  const grouped = filteredMedicos.reduce((acc, medico) => {
    const firstLetter = medico.nome[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(medico);
    return acc;
  }, {});

  return Object.keys(grouped).sort().map(letter => ({
    title: letter,
    data: grouped[letter],
  }));
};

const MedicoCard = ({ medico, navigation, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Desativar Médico",
      `Tem certeza que deseja desativar o médico ${medico.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          style: "destructive", 
          onPress: () => onDelete(medico.id) 
        }
      ]
    );
  };

  return (
    <View style={cardStyles.card}>
      <TouchableOpacity onPress={toggleExpand} style={cardStyles.mainInfo}>
        <View>
          <Text style={cardStyles.nome}>{medico.nome}</Text>
          <Text style={cardStyles.especialidade}>{medico.especialidade} | CRM: {medico.crm}</Text>
        </View>
        <Image
          source={IconeSeta}
          style={[cardStyles.arrowIcon, { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }]}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={cardStyles.details}>
          <Text style={cardStyles.detailText}>Email: {medico.email}</Text>
          {/* Telefone não vem no DTO de listagem padrão do Java, mas se vier, pode exibir aqui */}
          <Text style={cardStyles.detailText}>Telefone: {medico.telefone || 'Ver detalhes'}</Text>
          
          <View style={cardStyles.actionButtons}>
            <Button
              title="Editar"
              onPress={() => navigation.navigate('MedicoForm', { medicoId: medico.id })} 
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

const MedicoScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMedicos = async () => {
    setLoading(true);
    try {
      // Chama o Controller Java: GET /medicos
      const response = await api.get('/medicos');
      // Spring Boot retorna Page<>, a lista real está em .content
      setMedicos(response.data.content || []); 
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de médicos.");
    } finally {
      setLoading(false);
    }
  };

  // Recarrega a lista sempre que a tela ganha foco
  useFocusEffect(useCallback(() => {
    loadMedicos();
  }, []));

  const handleDeleteMedico = async (id) => {
    try {
      // Chama o Controller Java: DELETE /medicos/{id}
      await api.delete(`/medicos/${id}`);
      Alert.alert("Sucesso", "Médico desativado com sucesso.");
      loadMedicos(); // Atualiza a lista (o médico inativo não virá mais)
    } catch (error) {
      console.error("Erro ao excluir:", error);
      Alert.alert("Erro", "Não foi possível desativar o médico.");
    }
  };

  const sections = useMemo(() => groupAndFilterMedicos(medicos, searchText), [medicos, searchText]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar Médico ou Especialidade"
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
              <MedicoCard 
                medico={item} 
                navigation={navigation} 
                onDelete={handleDeleteMedico}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20, color: '#888'}}>Nenhum médico encontrado.</Text>}
          />
        </View>
      )}

      <View style={styles.fixedButtonContainer}>
        <Button
          title="Cadastrar Novo Perfil"
          onPress={() => navigation.navigate('MedicoForm')} 
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
  especialidade: { fontSize: 14, color: '#666', marginTop: 2 },
  arrowIcon: { width: 15, height: 15, tintColor: '#666' },
  details: { padding: 15, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#eee' },
  detailText: { fontSize: 14, color: '#444', marginBottom: 5, marginTop: 5 },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
});

export default MedicoScreen;