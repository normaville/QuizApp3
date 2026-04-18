import '@expo/metro-runtime';
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, createTheme, Button, ButtonGroup, Text } from '@rneui/themed';

const Stack = createNativeStackNavigator();
const theme = createTheme({});

export const Question = ({ route, navigation }) => {
  const { data, index, userResults = [] } = route.params;
  const current = data[index];
  const isMultiple = current.type === 'multiple-answer';
  const [singleIdx, setSingleIdx] = useState(null);
  const [multiIdxs, setMultiIdxs] = useState([]);

  const handleNext = () => {
    const selected = isMultiple ? multiIdxs : singleIdx;
    const isCorrect = Array.isArray(current.correct)
      ? JSON.stringify([...selected].sort()) === JSON.stringify([...current.correct].sort())
      : selected === current.correct;

    const updated = [...userResults, { ...current, selected, isCorrect }];
    if (index + 1 < data.length) {
      navigation.push('Question', { data, index: index + 1, userResults: updated });
    } else {
      navigation.navigate('Summary', { results: updated });
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.center}>{current.prompt}</Text>
      <ButtonGroup
        testID="choices"
        buttons={current.choices}
        selectMultiple={isMultiple}
        selectedIndex={isMultiple ? undefined : singleIdx}
        selectedIndexes={isMultiple ? multiIdxs : []}
        onPress={(v) => isMultiple ? setMultiIdxs(v) : setSingleIdx(v)}
        vertical
      />
      <Button 
        testID="next-question" 
        title="Next Question" 
        onPress={handleNext} 
        disabled={isMultiple ? multiIdxs.length === 0 : singleIdx === null} 
      />
    </View>
  );
};

export const Summary = ({ route }) => {
  const { results } = route.params;
  const score = results.filter(r => r.isCorrect).length;
  return (
    <ScrollView style={styles.container}>
      <Text testID="total" h3 style={styles.center}>Total Score: {score}</Text>
      {results.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.bold}>{item.prompt}</Text>
          {item.choices.map((c, ci) => {
            const isAns = Array.isArray(item.correct) ? item.correct.includes(ci) : item.correct === ci;
            const isSel = Array.isArray(item.selected) ? item.selected.includes(ci) : item.selected === ci;
            let style = {};
            if (isAns && isSel) style = styles.correct;
            else if (!isAns && isSel) style = styles.wrong;
            return <Text key={ci} style={style}>• {c}</Text>;
          })}
        </View>
      ))}
    </ScrollView>
  );
};

export default function App() {
  const quizData = [
    { 
      prompt: "Which Ancient Cookie founded the Vanilla Kingdom?", 
      type: "multiple-choice", 
      choices: ["Pure Vanilla", "White Lily", "Hollyberry", "Dark Cacao"], 
      correct: 0 
    },
    { 
      prompt: "Select the members of the Ancient Heroes:", 
      type: "multiple-answer", 
      choices: ["Pure Vanilla", "Sea Fairy", "Hollyberry", "Frost Queen"], 
      correct: [0, 2] 
    },
    { 
      prompt: "White Lily and Dark Enchantress are the same person.", 
      type: "true-false", 
      choices: ["True", "False"], 
      correct: 0 
    }
  ];
  

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Question">
          <Stack.Screen name="Question" component={Question} initialParams={{ data: quizData, index: 0 }} />
          <Stack.Screen name="Summary" component={Summary} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { textAlign: 'center', marginBottom: 20 },
  card: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  bold: { fontWeight: 'bold', marginBottom: 5 },
  correct: { fontWeight: 'bold', color: 'green' },
  wrong: { textDecorationLine: 'line-through', color: 'red' }
});
