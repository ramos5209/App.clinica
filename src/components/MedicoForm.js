import React, {useState, useEffect} from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform, Picker} from 'react-native';

const especialidades = ['Selecionar..','Cardiologia', 'Pediatria', 'Dermatologia', 'Neurologia', 'Oftalmologia', 'Clinica Geral'];

const initialMedicoState = {
    nome:'', especialidade:especialidades[0],crm:'',email:'', telefone:'', logradouro:'', numero:'', complemento:'', cidade:'', UF:'', cep:''};
const MedicoForm = ({medico, onSave, onCancel, navigation})=>{
    // 1. Inicializa o estado com base no prop 'medico' se null sera inicializado com initialMedicoState
    const [formData, setFormData] = useState(medico || initialMedicoState);

    // 2. Sera usado para rastrear erros de validação
    const [errors, setErrors] = useState({});

    //3. Define o titulo do botão em função do modo, cadastro ou alteração
    const isEditing =! !medico;
    const buttonTitle = isEditing ? 'Concluir Edição' : 'Concluir Cadastro';

    // Campos obrigatórios
    const requireFields = ['nome', 'especialidade', 'crm', 'telefone','logradouro', 'numero', 'UF', 'cep'];

    useEffect(()=> {setFormData(medico||initialMedicoState)}, [medico])

    //Função generica para atualizar o estado do formulario
    const handleChange= (name, value)=>{
        setFormData(prev => ({...prev, [name]:value}));
        if(errors[name] ){
            setErrors(prev =>{
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Função de validação
    const validade = ()=>{
        let valid = true;
        const newErrors ={};

        requireFields.forEach(field => {
            // Verificação de campo vazio ou apenas espaço em branco
            if(!formData[field] || String(formData[field]).trim() === ''){
                newErrors[field] = 'Campo Obrigatorio';
                valid = false;
            }
        });

        setErrors(newErrors);
        return valid;
    };

    // Função de submissão do formulario
    const handleSubmit = ()=>{
        // Supondo que a função lida com a lógica de API/Estado
        onSave(formData);
        Alert.alert(
            isEditing ? 'Sucesso':'Cadastro Concluido',
            isEditing ? 'Dados do medico atualizado.': 'Novo medico cadastrado!'
        )
    }

}    
