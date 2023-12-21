import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';

const App = () => {
  const [name, setName] = useState('');
  const [DATA, setDATA] = useState<any[]>([]);

  const handleAddName = () => {
    if (name) {
      setDATA([{ id: Date.now().toString(), name }, ...DATA]);
      setName('');
    }
  };

  const handleDeleteName = (id:any) => {
    const updatedData = DATA.filter(item => item.id !== id);
    setDATA(updatedData);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Digite um nome"
        value={name}
        onChangeText={text => setName(text)}
      />
      <TouchableOpacity onPress={handleAddName} style={{ marginTop: 10, padding: 10, backgroundColor: 'blue', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Adicionar</Text>
      </TouchableOpacity>
      <FlatList
        data={DATA}
        keyExtractor={(item:any) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text>{item.name}</Text>
            <Text>{item.id}</Text>
            <TouchableOpacity onPress={() => handleDeleteName(item.id)} style={{ padding: 5, backgroundColor: 'red', borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default App;
