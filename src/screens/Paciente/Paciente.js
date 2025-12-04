// src/screens/Paciente/Paciente.js
import React, { useState, useEffect, useMemo } from 'react';
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
  Image
} from 'react-native';

// Ajuste o IP conforme o seu backend
const API_URL = "http://10.110.12.15:8080/pacientes";

// Importação dos ícones (mesmos usados na tela de Médicos)
const IconeLupa = require('../../../assets/lupa.png'); 
const IconeSeta = require('../../../assets/seta.png'); 

// Habilita LayoutAnimation para Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// =========================================================================
// FUNÇÃO AUXILIAR PARA AGRUPAR E FILTRAR OS DADOS
// =========================================================================
const groupAndFilterPacientes = (pacientes, searchText) => {
  // Filtra por Nome ou CPF (supondo que o objeto paciente tenha campo 'cpf')
  const filteredPacientes = pacientes.filter(paciente => 
    paciente.nome.toLowerCase().includes(searchText.toLowerCase()) || 
    (paciente.cpf && paciente.cpf.includes(searchText))
  );

  const grouped = filteredPacientes.reduce((acc, paciente) => {
    const firstLetter = paciente.nome[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(paciente);
    return acc;
  }, {});

  // Converte para o formato da SectionList
  const sections = Object.keys(grouped)
    .sort() 
    .map(letter => ({
      title: letter,
      data: grouped[letter],
    }));

  return sections;
};

// =========================================================================
// COMPONENTE CARD EXPANSÍVEL (Adaptado para Paciente)
// =========================================================================
const PacienteCard = ({ paciente, navigation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={cardStyles.card}>
      {/* SEÇÃO PRINCIPAL VISÍVEL */}
      <TouchableOpacity onPress={toggleExpand} style={cardStyles.mainInfo}>
        <View>
          <Text style={cardStyles.nome}>{paciente.nome}</Text>
          {/* Exibe CPF se existir, ou outro dado relevante */}
          <Text style={cardStyles.subtitulo}>CPF: {paciente.cpf || 'Não informado'}</Text>
        </View>
        
        <Image
          source={IconeSeta}
          style={[
            cardStyles.arrowIcon,
            { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] },
          ]}
        />
      </TouchableOpacity>

      {/* SEÇÃO EXPANSÍVEL (Detalhes) */}
      {isExpanded && (
        <View style={cardStyles.details}>
          <Text style={cardStyles.detailText}>Email: {paciente.email}</Text>
          <Text style={cardStyles.detailText}>Telefone: {paciente.telefone}</Text>
          <Text style={cardStyles.detailText}>Endereço: {paciente.endereco}</Text>
          {/* Adicione outros campos específicos de paciente aqui, ex: Data Nascimento */}
          
          <View style={cardStyles.actionButtons}>
            <Button
              title="Editar"
              onPress={() => navigation.navigate('EmConstrucao')} 
            />
            <Button
              title="Excluir"
              color="red"
              onPress={() => navigation.navigate('EmConstrucao')} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

// =========================================================================
// TELA PRINCIPAL DE PACIENTES
// =========================================================================
const Paciente = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [pacientes, setPacientes] = useState([]);

  // Busca dados da API ao carregar
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        // Se a API retornar Page<>, usamos data.content, senão usamos data diretamente
        const lista = data.content ? data.content : data;
        setPacientes(lista);
      })  
      .catch(err => console.log("Erro ao buscar pacientes:", err));
  }, []);

  const sections = useMemo(
    () => groupAndFilterPacientes(pacientes, searchText),
    [pacientes, searchText]
  );

  return (
    <View style={styles.container}>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por Nome ou CPF"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Image source={IconeLupa} style={styles.searchIcon} />
      </View>

      <View style={styles.listWrapper}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
          renderItem={({ item }) => (
            <PacienteCard paciente={item} navigation={navigation} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum paciente encontrado.</Text>
          }
        />
      </View>

      <View style={styles.fixedButtonContainer}>
        <Button
          title="Cadastrar Novo Paciente"
          onPress={() => navigation.navigate('EmConstrucao')}
        />
      </View>
    </View>
  );
};

// =========================================================================
// ESTILOS (Reutilizados da tela de Médicos para consistência)
// =========================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 2, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    marginBottom: 60, // Espaço para o botão fixo
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    paddingVertical: 5,
    color: '#333',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  }
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  arrowIcon: {
    width: 15,
    height: 15,
    tintColor: '#666',
  },
  details: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
});

export default Paciente;