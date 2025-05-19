import { testFirestoreConnection } from './firebase_debug';

// Em um useEffect ou função de componente
useEffect(() => {
  testFirestoreConnection()
    .then(result => {
      console.log("Resultado do teste:", result);
    });
}, []);
