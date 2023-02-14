import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import HCESession, {NFCContentType, NFCTagType4} from 'react-native-hce';

const App = () => {
  const [hasNfc, setHasNfc] = useState(null);

  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState(NFCContentType.Text);

  const simulationInstance = useRef();
  const [simulationEnabled, setSimulationEnabled] = useState(false);

  const terminateSimulation = useCallback(async () => {
    const instance = simulationInstance.current;
    if (!instance) {
      return;
    }
    await instance.terminate();
    setSimulationEnabled(instance.active);
  }, [setSimulationEnabled, simulationInstance]);

  const startSimulation = useCallback(async () => {
    const tag = new NFCTagType4(contentType, content);

    simulationInstance.current = await new HCESession(tag).start();

    setSimulationEnabled(simulationInstance.current.active);
  }, [setSimulationEnabled, simulationInstance, content, contentType]);

  const selectNFCType = useCallback(
    type => {
      setContentType(type);
      console.log(type);
      terminateSimulation();
    },
    [setContentType, terminateSimulation],
  );

  const selectNFCContent = useCallback(
    text => {
      setContent(text);
      terminateSimulation();
    },
    [setContent, terminateSimulation],
  );

  useEffect(() => {
    async function checkNfc() {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
      }
      setHasNfc(supported);
    }
    checkNfc();
  }, []);

  if (hasNfc === null) {
    return null;
  } else if (!hasNfc) {
    return (
      <View style={styles.wrapper}>
        <Text>Your devices doesn't support nfc</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome to the HCE NFC Tag example.</Text>

      <View style={{flexDirection: 'row'}}>
        <Button
          title="Text content"
          onPress={() => selectNFCType(NFCContentType.Text)}
          disabled={contentType === NFCContentType.Text}
        />

        <Button
          title="URL content"
          onPress={() => selectNFCType(NFCContentType.URL)}
          disabled={contentType === NFCContentType.URL}
        />
      </View>

      <TextInput
        onChangeText={text => selectNFCContent(text)}
        value={content}
        placeholder="Enter the content here."
      />

      <View style={{flexDirection: 'row'}}>
        {!simulationEnabled ? (
          <Button
            title="Start hosting the tag"
            onPress={() => startSimulation()}
          />
        ) : (
          <Button
            title="Stop hosting the tag"
            onPress={() => terminateSimulation()}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
