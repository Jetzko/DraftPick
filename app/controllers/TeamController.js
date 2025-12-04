import { TeamView } from '../views/js/TeamView.js';
import { ComunityDragonModel } from '../models/ComunityDragonModel.js';
import { ChampionStatsModel } from '../models/ChampionStatsModel.js';

export class TeamController {
  constructor(viewManager) {
    this.viewManager = viewManager;
    this.cdModel = new ComunityDragonModel();
    this.champStats = new ChampionStatsModel();
    this.teamView = new TeamView();

    this.champions = null;
    this.initAsync();
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
    const champElments = this.teamView.renderChampGrid(this.champions);
    // this.teamView.addChamp();
    this.teamView.openChampGrid();
    this.teamView.closeChampGrid();
    this.teamView.addChamp(champElments, this.champions);
  }
}
