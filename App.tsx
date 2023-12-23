import React,{useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View , StyleSheet, TextInput, Text, TouchableOpacity, FlatList} from "react-native";

 const App=()=>{
  const [DADOS,setDados]=useState<any[]>([]);
  const [lembrete,setLembrete]=useState('');
  const obterDadosSalvos=async()=>{
    const chave = 'lembretes';
    try{
      const dadosJsonString = await AsyncStorage.getItem(chave);
      if(dadosJsonString){
        const dadosColetados=JSON.parse(dadosJsonString);
        setDados(dadosColetados);
      }
    }catch(error){
      console.error('Erro ao tentar coletar os dados ')
    }
  }
  useEffect(()=>{
    obterDadosSalvos();
    console.log('Dados adquiridos',DADOS);
  },[]);

  const salvarDados=async(item:any)=>{
    setDados(item)
    try{
      const chave ='lembretes';
      const dadosJsonString=JSON.stringify(item);
      await AsyncStorage.setItem(chave,dadosJsonString);
    }catch(error){
      console.error('erro ao tentar salvar os dados')
    }
  }

  const handleAddLembrete=()=>{
    console.log('=========ADICIONANDO LEMBRETE========');
    if(lembrete){
      const newDADOS=[{id:Date.now().toString(),lembrete},...DADOS];
      console.log("Lembretes",newDADOS);
      setLembrete('');
      salvarDados(newDADOS);
    }
  }
  const handleExcluirLembrete=(id:any)=>{
    console.log('xxxxxxxxx-EXCLUINDO LEMBRETE-xxxxxxxxxxxxx');
    try{
      const upadteDATA=DADOS.filter(item=>item.id !== id); 
      salvarDados(upadteDATA);   
    }catch(error){
      console.error('Não foi possivel excluir lembrete')
    }
  }
  return(
    <View style={style.telaDeFundo}>
      <FlatList
      data={DADOS}
      keyExtractor={(item)=>item.id}
      renderItem={({item})=>(
        <TouchableOpacity
        onPress={()=>handleExcluirLembrete(item.id)}
        >
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: 10,
            width:330,
            backgroundColor:'#fff',
            minHeight:60,
            borderRadius:20,
            padding:10 
            }}>
            <Text style={{
              fontSize:16
            }}>{item.lembrete}</Text>
          </View>
        </TouchableOpacity>
        
      )}
      />
      <View style={style.inserirLembreteBox}>
        <TextInput
        onChangeText={Text=>setLembrete(Text)}
        placeholder="Inserir Lembrete"
        value={lembrete}
        style={style.lembreteTextInput}
        multiline={true}
        />
        <TouchableOpacity
        onPress={handleAddLembrete}
        style={style.CriarLembreteButtonBox}
        >
          <Text style={style.ciarLembretebuttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default App;

const style = StyleSheet.create({
  telaDeFundo:{
    paddingTop:40,
    paddingBottom:120,
    width:'100%',
    height:'100%',
    backgroundColor:'#cce',
    alignItems:'center',
    justifyContent:'center'
  },
  inserirLembreteBox:{
    position:'absolute',
    flexDirection:'row',
    justifyContent:'space-between',
    bottom:20
  },
  lembreteTextInput:{
    elevation:10,
    padding:20,
    borderRadius:20,
    backgroundColor:'#fff',
    width:270,
    minHeight:60,
  },
  CriarLembreteButtonBox:{
    flexDirection:'column-reverse',
    height:'100%',
    alignItems:'center',
  },
  ciarLembretebuttonText:{
    elevation:10,
    backgroundColor:'#fff',
    width:60,
    height:60,
    margin:10,
    borderRadius:30,
    fontSize:40,
    textAlign:'center'
  }

});
