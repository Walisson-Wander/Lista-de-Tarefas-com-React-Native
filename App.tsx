import React,{useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View , StyleSheet, TextInput, Text, TouchableOpacity, FlatList, Button} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

 const App=()=>{
  const [DADOS,setDados]=useState<any[]>([]);
  const [lembrete,setLembrete]=useState('');
  const[currentLembrete,setCurrentLembrete]=useState<any>(null);
  const[opcoesSub,setOpcoesSub]=useState<any>(null);
  const [lembText,setLembText]=useState('');

  const obterDadosSalvos=async()=>{
    const chave = 'lembretes';
    try{
      const dadosJsonString = await AsyncStorage.getItem(chave);
      if(dadosJsonString){
        const dadosColetados=JSON.parse(dadosJsonString);
        console.log(dadosColetados)
        setDados(dadosColetados);
      }
    }catch(error){
      console.error('Erro ao tentar coletar os dados ')
    }
  }
  useEffect(()=>{
    obterDadosSalvos();
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
    if(lembrete){
      const newDADOS=[{id:Date.now().toString(),lembrete:lembrete},...DADOS];
      setLembrete('');
      salvarDados(newDADOS);
    }
  }
  
  const handleAddSublist=()=>{
    handleAddItem();
    if(currentLembrete&&lembText!=''){
      const updateLembrete=DADOS.map((item)=>
        item.id===currentLembrete.id
        ?{...item,subList:[...item.subList,opcoesSub+lembText]}
        : item
      );
      setDados(updateLembrete);
      console.log(updateLembrete);
      setLembText('');
      setOpcoesSub(null);
      salvarDados(updateLembrete);
    }
  }
  const handleExcluirLembrete=(id:any)=>{
    try{
      const upadteDATA=DADOS.filter(item=>item.id !== id); 
      salvarDados(upadteDATA);   
    }catch(error){
      console.error('Não foi possivel excluir lembrete')
    }
  }

  //Corrigir o bug do item vazio
  const handleAddItem = () => {
    const itemIndex = DADOS.findIndex(item => item.id === currentLembrete.id);
    if (itemIndex !== -1) {
      const newData = [...DADOS];
      if (!newData[itemIndex].subList) {
        newData[itemIndex].subList = [];
      }
    }
  };
  const handleCheckBox = (texto: string) => {
    const itemIndex = DADOS.findIndex(item => item.id === currentLembrete.id);
    const newData = [...DADOS];
    const subItemIndex = newData[itemIndex].subList.findIndex((item: string) => item.slice(3) === texto.slice(3));
  
    if (subItemIndex !== -1) {
      // Atualizar o primeiro dígito do item específico
      newData[itemIndex].subList[subItemIndex] =
        newData[itemIndex].subList[subItemIndex][0] === "0"
          ? "1" + newData[itemIndex].subList[subItemIndex].slice(1)
          : "0" + newData[itemIndex].subList[subItemIndex].slice(1);
    }
    console.log(newData[itemIndex].subList[subItemIndex]);
    setDados(newData);
    salvarDados(newData);
  };
  

  return(
    <View style={style.telaDeFundo}>
      <FlatList
      data={DADOS}
      keyExtractor={(item)=>item.id}
      renderItem={({item})=>(
        <TouchableOpacity
        onPress={()=>{
          if(currentLembrete!=item){
            setOpcoesSub(null);
            setLembText('');
          };
          setCurrentLembrete(item);
        }}>
          {currentLembrete?.id===item.id?(
            <View style={{
              ...style.lembrete,
              minHeight:100
            }}>
              <View style={{flexDirection:'row-reverse'}}>
                <TouchableOpacity onPress={()=>setCurrentLembrete(null)}>
                  <FontAwesome name='close'style={{...style.closeButtons,backgroundColor:'#B3FF78',}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>handleExcluirLembrete(item.id)}>
                  <FontAwesome name='trash'style={{...style.closeButtons,backgroundColor:'#FF8F8F',}}/>
                  
                </TouchableOpacity>
                
              </View>
              <Text style={{fontSize:18,marginVertical:15}}>{item.lembrete}</Text>
              <FlatList
              data={item.subList}
              keyExtractor={(sublist,index)=>index.toString()}
              renderItem={({item})=>(
                <>
                  {item.slice(2,3)==='1'?(
                  <>
                  <Text>{item.slice(3)}</Text>
                  </>
                  ):(
                    <>
                      {item.slice(2,3)==='2'?(
                        <>
                        </>
                      ):(
                        <>
                          {item.slice(2,3)==='3'?(
                            <>
                              <TouchableOpacity onPress={()=>handleCheckBox(item)}>
                                <View style={{flexDirection:'row'}}>
                                  <FontAwesome name={item.slice(0,1)==='0'?"square-o":"check-square-o"} size={20}/>
                                  <Text>{item.slice(3)}</Text>
                                </View>
                              </TouchableOpacity>
                            </>
                          ):(
                            <>
                            
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </> 
              )}
              >
                
              </FlatList>
              {!opcoesSub?(
                <TouchableOpacity
                onPress={()=>setOpcoesSub(true)}
                >
                  <FontAwesome name="plus"style={{...style.ciarLembretebuttonText,marginLeft:0}} />
                </TouchableOpacity>
              ):( 
                <>
                  {opcoesSub==='001'?(
                    <>
                      <TextInput 
                        placeholder="Inserir Texto"
                        onChangeText={text=>setLembText(text)}
                        value={lembText}
                        multiline={true}
                        style={{margin:10}}
                      />
                      <View style={{flexDirection:'row-reverse'}}>
                        <TouchableOpacity
                        onPress={handleAddSublist}
                        >
                          <FontAwesome name="plus"style={{...style.ciarLembretebuttonText,marginLeft:0}} />
                        </TouchableOpacity>
                        <TouchableOpacity
                        onPress={()=>{
                          setOpcoesSub(null); 
                          setLembText('');
                        }}
                        >
                          <FontAwesome name="close"style={{...style.ciarLembretebuttonText,marginLeft:0}} />
                        </TouchableOpacity>
                      </View>                    
                    </>
                  ):(
                    <>
                      {opcoesSub==='002'?(
                        <>
                        </>
                      ):(
                        <>
                          {opcoesSub==='003'?(
                            <>
                              <TextInput 
                                placeholder="Inserir Texto"
                                onChangeText={text=>setLembText(text)}
                                value={lembText}
                                multiline={true}
                                style={{margin:10}}
                              />
                              <View style={{flexDirection:'row-reverse'}}>
                                <TouchableOpacity
                                onPress={handleAddSublist}
                                >
                                  <FontAwesome name="plus"style={{...style.ciarLembretebuttonText,marginLeft:0}} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={()=>{
                                  setOpcoesSub(null); 
                                  setLembText('');
                                }}
                                >
                                  <FontAwesome name="close"style={{...style.ciarLembretebuttonText,marginLeft:0}} />
                                </TouchableOpacity>
                              </View>                    
                            </>
                          ):(
                            <>
                              <View style={{flexDirection:'row'}}>
                                <TouchableOpacity
                                onPress={()=>setOpcoesSub(null)}
                                >
                                  <FontAwesome name="close"style={{...style.ciarLembretebuttonText,marginLeft:0}} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={()=>setOpcoesSub('001')}
                                >
                                  <FontAwesome name="align-left"style={{...style.ciarLembretebuttonText}} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={()=>setOpcoesSub('002')}
                                >
                                  <FontAwesome name="image" style={{...style.ciarLembretebuttonText}}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={()=>setOpcoesSub('003')}
                                >
                                  <FontAwesome name="list-ul" style={{...style.ciarLembretebuttonText}}/>
                                </TouchableOpacity>
                              </View>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </View>
          ):(
            <View style={{
              ...style.lembrete
              }}>
              <Text style={{
                
                fontSize:17
              }}>{item.lembrete}</Text>
            </View>
          )}
          <View>

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
          <FontAwesome name="plus"style={{...style.ciarLembretebuttonText}} />
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
    alignSelf:'center',
    bottom:20,
  },
  lembreteTextInput:{
    elevation:10,
    padding:20,
    borderRadius:20,
    backgroundColor:'#fff',
    width:270,
    minHeight:60,
    marginLeft:10
  },
  CriarLembreteButtonBox:{
    flexDirection:'column-reverse',
    height:'100%',
  },
  ciarLembretebuttonText:{
    elevation:10,
    backgroundColor:'#fff',
    width:60,
    height:60,
    borderRadius:30,
    fontSize:25,
    textAlign:'center',
    textAlignVertical:'center',
    marginHorizontal:10
  },
  lembrete:{
    marginTop: 10,
    width:330,
    backgroundColor:'#fff',
    minHeight:60,
    borderRadius:20,
    padding:15
  },
  closeButtons:{
    width:30,
    height:30,
    marginRight:10,
    borderRadius:15,
    fontSize:24,textAlign:'center',
    textAlignVertical:'center'
  }

});
