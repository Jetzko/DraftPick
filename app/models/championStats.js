import { championsData, initChampions } from './comunityDragonModel.js';

async function startAnalysis() {
  // Inizializza i dati (scarica solo la prima volta)
  await initChampions();

  // Ora championsData contiene tutti i campioni
  console.log('Campioni disponibili:', Object.keys(championsData).length);

  // Puoi accedere direttamente ai dati
  console.log(championsData);
}

startAnalysis();
