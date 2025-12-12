import { TeamView } from '../views/js/TeamView.js';
import { ComunityDragonModel } from '../models/ComunityDragonModel.js';
import { ChampionStatsModel } from '../models/ChampionStatsModel.js';
import { CompositionStatsModel } from '../models/CompositionStatsModel.js';

export class TeamController {
  constructor(viewManager) {
    this.viewManager = viewManager;
    this.champGrid = document.querySelector('.champ-grid');
    this.cdModel = new ComunityDragonModel();
    this.champStats = new ChampionStatsModel();
    this.compStats = new CompositionStatsModel();
    this.teamView = new TeamView();
    this.champions = null;
    this.champPool = {};
    this.compositions = [];

    this.initAsync();

    this.teamView.onChampPoolUpdated = (poolData) => {
      this.handleChampPoolUpdated(poolData);
    };

    this.teamView.onCompositionSaved = (compData) => {
      this.handleCompositionSave(compData);
    };

    this.teamView.onCompositionEdited = (compData) => {
      this.handleCompositionEdit(compData);
    };
  }

  handleChampPoolUpdated(pool) {
    this.champPool = pool;
    console.log('🔥 Champ-pool aggiornata:', this.champPool);

    // in futuro:
    // this.model.evaluatePlayerPools(this.champPool);
  }

  handleCompositionSave(compData) {
    console.log('📥 Composition salvata nella View:', compData);

    // 👉 Qui chiami il tuo model
    // const analyzed = this.compStats.generateTeamStats(compData);

    // console.log('📊 Risultato del model:', analyzed);

    // 👉 Quando avrai output, potrai riaggiornare la view se serve
    // this.teamView.renderAnalysis(analyzed);
  }

  handleCompositionEdit(compData) {
    console.log('✏️ Composition modificata:', compData);

    // const analyzed = this.compStats.generateTeamStats(compData);

    // console.log('📊 Risultato aggiornato dal model:', analyzed);
  }

  async initAsync() {
    try {
      // awaita il completamento di ChampionStatsModel.init()
      const championsData = await this.champStats.init();

      if (championsData) {
        // converti l'oggetto in array
        this.champions = Object.values(championsData);
        this.update();
        console.log('✅ TeamController: dati caricati e view aggiornata');
      } else {
        console.warn('❌ TeamController: championsData vuoto');
      }
    } catch (err) {
      console.error('❌ TeamController initAsync error:', err);
    }
  }

  update() {
    if (!this.champions || this.champions.length === 0) {
      console.warn('TeamController.update: champions vuoto');
      return;
    }
    // this.teamView.addChamp();
    const champElments = this.teamView.renderChampGrid(this.champions);
    // this.champGrid.querySelectorAll('.champ');
    this.teamView.openChampGrid();
    this.teamView.closeChampGrid();
    this.teamView.addChamp(champElments, this.champions);
    this.teamView.replaceChampion();
  }
}
