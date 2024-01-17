import React,{useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, View , StyleSheet, TextInput, Text, TouchableOpacity, FlatList, Image, SafeAreaView} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useCameraPermissions, launchCameraAsync,PermissionStatus } from "expo-image-picker";
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
//import * as Permissions from 'expo-permissions';
 const App=()=>{
  const [DADOS,setDados]=useState<any[]>([]);
  const [tarefaText,setTarefaText]=useState('');
  const[currentTarefa,setCurrentTarefa]=useState<any>(null);
  const[opcoesSub,setOpcoesSub]=useState<any>(null);
  const [lembText,setLembText]=useState('');
  const[image,setImage]=useState<string|null>('');
  const [cameraPermissionInformation, requestPermission]=useCameraPermissions();

  const obterDadosSalvos=async()=>{
    const chave = 'tarefas';
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
  };

  useEffect(()=>{
    obterDadosSalvos();
  },[]);

  const salvarDados=async(item:any)=>{
    setDados(item)
    try{
      const chave ='tarefas';
      const dadosJsonString=JSON.stringify(item);
      await AsyncStorage.setItem(chave,dadosJsonString);
    }catch(error){
      console.error('erro ao tentar salvar os dados')
    }
  };


  const handleAddtarefa=()=>{
    if(tarefaText){
      const newDADOS=[{id:Date.now().toString(),tarefa:tarefaText},...DADOS];
      setTarefaText('');
      salvarDados(newDADOS);
    }
  };

  const handleExcluirtarefa=(id:any)=>{
    try{
      const upadteDATA=DADOS.filter(item=>item.id !== id); 
      salvarDados(upadteDATA);   
    }catch(error){
      console.error('Não foi possivel excluir tarefa')
    }
  };

  const handleAddSublist=()=>{
    AddItem();
    if(currentTarefa&&lembText!=''){

      const updatetarefa=DADOS.map((item)=>
        item.id===currentTarefa.id
        ?{...item,subList:[...item.subList,opcoesSub+lembText]}
        : item
      );
      
      setDados(updatetarefa);
      console.log(updatetarefa);
      setLembText('');
      setOpcoesSub(null);
      salvarDados(updatetarefa);
    };
    if(currentTarefa&&image!=null){

      const updatetarefa=DADOS.map((item)=>
        item.id===currentTarefa.id
        ?{...item,subList:[...item.subList,opcoesSub+image]}
        : item
      );
      
      setDados(updatetarefa);
      console.log(updatetarefa);
      setImage(null);
      setOpcoesSub(null);
      salvarDados(updatetarefa);
    }
    
  };

  //Corrigir o bug do item vazio
  const AddItem = () => {
    const itemIndex = DADOS.findIndex(item => item.id === currentTarefa.id);
    if (itemIndex !== -1) {
      const newData = [...DADOS];
      if (!newData[itemIndex].subList) {
        newData[itemIndex].subList = [];
      }
    }
  };

  const handleCheckBox = (texto: string) => {
    const itemIndex = DADOS.findIndex(item => item.id === currentTarefa.id);
    const newData = [...DADOS];
    const subItemIndex = newData[itemIndex].subList.findIndex((item: string) => item.slice(3) === texto.slice(3));
  
    if (subItemIndex !== -1) {
      // Atualizar o primeiro dígito do item específico
      newData[itemIndex].subList[subItemIndex] =
        newData[itemIndex].subList[subItemIndex][0] === "0"
          ? "1" + newData[itemIndex].subList[subItemIndex].slice(1)
          : "0" + newData[itemIndex].subList[subItemIndex].slice(1);
    }
    setDados(newData);
    salvarDados(newData);
  };
  
  const verificarPermissaoCamera=async()=>{
    const permissionResponse=await requestPermission();
    if(cameraPermissionInformation?.status===PermissionStatus.UNDETERMINED){
      return permissionResponse.granted;
    }
    if(cameraPermissionInformation?.status===PermissionStatus.DENIED){
      Alert.alert(
        'insufficient permission!',
        'vc precisa permitir o uso da camera para proseguir'
      );
      return false;
    }
    return true;
  };
  
  const handlePickImageCamera=async()=>{
    const permissao=await verificarPermissaoCamera()
    if(!permissao){
      return;
    }
    let result=await launchCameraAsync({
      allowsEditing:true,
      aspect:[4,3],
      quality:0.5
    });
    if(!result.canceled&&result.assets[0].uri){
      setImage(result.assets[0].uri)
    }
  }

  const handlePickImageLibrary = async()=>{
    let result=await ImagePicker.launchImageLibraryAsync({
      mediaTypes:ImagePicker.MediaTypeOptions.All,
      allowsEditing:true,
      aspect:[4,3],
      quality:1,
    });
    if(!result.canceled && result.assets[0].uri){
      setImage(result.assets[0].uri);
    }
  };

  return(
    <SafeAreaView>
      <View style={{...style.telaDeFundo,paddingBottom:!opcoesSub?120:0}}>
        <FlatList
        data={DADOS}
        keyExtractor={(item)=>item.id}
        renderItem={({item})=>(
          <TouchableOpacity
          onPress={()=>{
            if(currentTarefa!=item){
              setOpcoesSub(null);
              setImage(null);
              setLembText('');
            };
            setCurrentTarefa(item);
          }}>
            {currentTarefa?.id===item.id?(
              <View style={{
                ...style.tarefa,
                minHeight:100
              }}>
                <View style={{flexDirection:'row-reverse'}}>
                  <TouchableOpacity onPress={()=>setCurrentTarefa(null)}>
                    <FontAwesome name='close'style={{...style.closeButtons,backgroundColor:'#B3FF78',}}/>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>handleExcluirtarefa(item.id)}>
                    <FontAwesome name='trash'style={{...style.closeButtons,backgroundColor:'#FF8F8F',}}/>
                    
                  </TouchableOpacity>
                  
                </View>
                <Text style={{fontSize:18,marginVertical:15}}>{item.tarefa}</Text>
                <FlatList
                data={item.subList}
                keyExtractor={(sublist,index)=>index.toString()}
                renderItem={({item})=>(
                  <>
                    {item.slice(2,3)==='1'?(
                    <>
                    <Text style={{marginBottom:10}}>{item.slice(3)}</Text>
                    </>
                    ):(
                      <>
                        {item.slice(2,3)==='2'?(
                          <>
                          {/*IMAGEM*/}
                            <Image source={{uri:item.slice(3) }}style={{width:300,height:200,borderRadius:20,marginBottom:10}}/>
                          </>
                        ):(
                          <>
                            {item.slice(2,3)==='3'?(
                              <>
                                <TouchableOpacity onPress={()=>handleCheckBox(item)}>
                                  <View style={{flexDirection:'row',marginBottom:10}}>
                                    <FontAwesome 
                                    name={item.slice(0,1)==='0'?
                                      "square-o":"check-square-o"
                                    } 
                                    size={20}
                                    style={{marginLeft:10,marginRight:5}}
                                    />
                                    <Text style={{maxWidth:270}}>{item.slice(3)}</Text>
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
                    <FontAwesome name="plus"style={{...style.ciartarefabuttonText,marginLeft:0}} />
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
                          style={style.subTaskSltyle}
                        />
                        <View style={{flexDirection:'row-reverse'}}>
                          <TouchableOpacity
                          onPress={handleAddSublist}
                          >
                            <FontAwesome name="check"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                          </TouchableOpacity>
                          <TouchableOpacity
                          onPress={()=>{
                            setOpcoesSub(null); 
                            setLembText('');
                            setImage(null);
                          }}
                          >
                            <FontAwesome name="close"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                          </TouchableOpacity>
                        </View>                    
                      </>
                    ):(
                      <>
                        {opcoesSub==='002'?(
                          <>
                            {image?(
                              <>
                              <Image source={{uri:image}}style={{width:300,height:200,borderColor:'#22f',borderWidth:5}}/>
                              <View style={{flexDirection:'row-reverse'}}>
                                <TouchableOpacity
                                onPress={handleAddSublist}
                                >
                                  <FontAwesome name="check"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={()=>{
                                  setOpcoesSub(null); 
                                  setLembText('');
                                  setImage(null);
                                }}
                                >
                                  <FontAwesome name="close"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                                </TouchableOpacity>
                              </View> 
                              </>               
                            ):(
                              <View style={{flexDirection:'row-reverse'}}>
                              <TouchableOpacity
                              onPress={handlePickImageCamera}
                              >
                                <FontAwesome name="camera-retro" style={{...style.ciartarefabuttonText,marginLeft:0}} />
                              </TouchableOpacity>
                              <TouchableOpacity
                              onPress={handlePickImageLibrary}
                              >
                                <FontAwesome name="folder-o" style={{...style.ciartarefabuttonText,marginLeft:0}} />
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                              onPress={()=>{
                                setOpcoesSub(null); 
                                setLembText('');
                              }}
                              >
                                <FontAwesome name="close"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                              </TouchableOpacity>
                            </View>
                            )}
                                    
                          </>
                        ):(
                          <>
                            {opcoesSub==='003'?(
                              <>
                                <TextInput 
                                  placeholder="Inserir Lista"
                                  onChangeText={text=>setLembText(text)}
                                  value={lembText}
                                  multiline={true}
                                  style={style.subTaskSltyle}
                                />
                                <View style={{flexDirection:'row-reverse'}}>
                                  <TouchableOpacity
                                  onPress={handleAddSublist}
                                  >
                                    <FontAwesome name="check"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                  onPress={()=>{
                                    setOpcoesSub(null); 
                                    setLembText('');
                                  }}
                                  >
                                    <FontAwesome name="close"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                                  </TouchableOpacity>
                                </View>                    
                              </>
                            ):(
                              <>
                                <View style={{flexDirection:'row'}}>
                                  <TouchableOpacity
                                  onPress={()=>setOpcoesSub(null)}
                                  >
                                    <FontAwesome name="close"style={{...style.ciartarefabuttonText,marginLeft:0}} />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                  onPress={()=>setOpcoesSub('001')}
                                  >
                                    <FontAwesome name="align-left"style={{...style.ciartarefabuttonText}} />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                  onPress={()=>setOpcoesSub('002')}
                                  >
                                    <FontAwesome name="image" style={{...style.ciartarefabuttonText}}/>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                  onPress={()=>setOpcoesSub('003')}
                                  >
                                    <FontAwesome name="list-ul" style={{...style.ciartarefabuttonText}}/>
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
                ...style.tarefa
                }}>
                <Text style={{
                  
                  fontSize:17
                }}>{item.tarefa}</Text>
              </View>
            )}
            <View>

            </View>
            
          </TouchableOpacity>
          
        )}
        />
        {!opcoesSub&&<View style={{...style.inserirtarefaBox}}>
          <TextInput
          onChangeText={Text=>setTarefaText(Text)}
          placeholder="Inserir tarefa"
          value={tarefaText}
          style={style.tarefaTextInput}
          multiline={true}
          />
          <TouchableOpacity
          onPress={handleAddtarefa}
          style={style.CriartarefaButtonBox}
          >
            <FontAwesome name="plus"style={{...style.ciartarefabuttonText,marginTop:0}} />
          </TouchableOpacity>
        </View>}
      </View>
    </SafeAreaView>
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
  inserirtarefaBox:{
    position:'absolute',
    flexDirection:'row',
    alignSelf:'center',
    bottom:20,
  },
  tarefaTextInput:{
    elevation:10,
    padding:20,
    borderRadius:20,
    backgroundColor:'#fff',
    width:270,
    minHeight:60,
    marginLeft:10
  },
  CriartarefaButtonBox:{
    flexDirection:'column-reverse',
    height:'100%',
  },
  ciartarefabuttonText:{
    elevation:10,
    backgroundColor:'#fff',
    width:60,
    height:60,
    borderRadius:30,
    fontSize:25,
    textAlign:'center',
    textAlignVertical:'center',
    marginHorizontal:10,
    marginTop:10
  },
  tarefa:{
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
  },
  subTaskSltyle:{
    margin:10,
    borderWidth:0.5,
    minHeight:60,
    borderRadius:15,
    padding:10
  }

});
