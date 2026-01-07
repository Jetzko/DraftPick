import { TeamView } from '../views/js/TeamView.js';
import { ComunityDragonModel } from '../models/ComunityDragonModel.js';
import { ChampionStatsModel } from '../models/ChampionStatsModel.js';
import { CompositionStatsModel } from '../models/CompositionStatsModel.js';

export class TeamController {
  constructor(viewManager) {
    this.viewManager = viewManager;
    this.champGrid = document.querySelector('.champ-grid');
    // this.cdModel = new ComunityDragonModel();
    this.champStats = new ChampionStatsModel();
    this.compStats = new CompositionStatsModel();
    this.teamView = new TeamView();
    this.championsData = null;
    this.champions = null;
    this.champPool = {};
    this.compositions = [];

    this.initAsync();

    this.teamView.onCompositionSaved = (compData) => {
      this.handleCompositionSave(compData);
    };

    this.teamView.onCompositionEdited = (compData) => {
      this.handleCompositionEdit(compData);
    };

    this.teamView.onChampPoolUpdated = (compData) => {
      this.handleChampPoolUpdate(compData);
    };
  }

  handleChampPoolUpdate(poolData) {
    this.champPool = poolData;
    this.compStats.setChampPool(poolData);

    const flexPicks = this.compStats.getFlexPicks(poolData);
    this.teamView.renderFlexPicks(flexPicks, this.champions);
  }

  handleCompositionSave(compData) {
    // arricchisci i champion con i dati completi
    const enrichedComp = this.compStats.enrichCompositionChampions(compData);

    // rank (su comp arricchita)
    const rankedComp = this.compStats.calcRankComp(
      this.champions,
      enrichedComp
    );

    const compType = rankedComp.type;

    const rankedWithSynergy = this.compStats.evaluateChampSynergy(
      rankedComp,
      compType
    );

    console.log('champData:' + enrichedComp);

    this.compStats.addOrUpdateComposition(rankedWithSynergy);
    console.log(rankedWithSynergy);

    this.teamView.renderSavedComposition(rankedWithSynergy);
  }
  handleCompositionEdit(compData) {
    // 1) arricchisci con dati champ
    const enrichedComp = this.compStats.enrichCompositionChampions(compData);

    // 2) ricalcola ranks
    const rankedComp = this.compStats.calcRankComp(
      this.champions,
      enrichedComp
    );

    // 3) ricalcola synergy
    const rankedWithSynergy = this.compStats.evaluateChampSynergy(
      rankedComp,
      rankedComp.type
    );

    // 4) salva/update nel model
    this.compStats.addOrUpdateComposition(rankedWithSynergy);

    // 5) aggiorna UI della comp esistente
    this.teamView.updateSavedComposition(rankedWithSynergy);
  }

  async initAsync() {
    try {
      // awaita il completamento di ChampionStatsModel.init()
      this.championsData = await this.champStats.init();

      if (this.championsData) {
        // converti l'oggetto in array
        this.champions = Object.values(this.championsData);
        console.log(
          '🗣️ TeamController: questi sono i dati dei campioni',
          this.champions
        );
        this.compStats.getChampionsData(this.champions);
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
    this.teamView.closeChampGrid();
    this.teamView.addChamp(champElments, this.champions);
    this.teamView.replaceChampion();
  }
}
