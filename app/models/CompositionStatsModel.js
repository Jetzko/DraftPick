import { TeamController } from '../controllers/TeamController.js';

export class CompositionStatsModel {
  constructor() {
    // this.teamController = new TeamController();

    this.champPool = null;
    this.compositions = [];
    this.champData = null;

    // this.teamController.onChampPoolUpdated = (poolData) => {
    //   this.handleChampPoolUpdated(poolData);
    // };
  }

  // FUNZIONI DA CREARE:
  // 1- Flex Picks
  // 2- Suggest Comps
  // 2- Calculate Comp Stats
  // 3- Suggest Champs
  // 4- Identify Player

  setChampPool(poolData) {
    this.champPool = poolData;
  }

  addComposition(compData) {
    this.compositions.push(compData);
  }

  getChampionsData(champData) {
    this.champData = champData;
  }

  getFlexPicks(champPool) {
    const champRoleMap = {};

    for (const role in champPool) {
      const tiers = champPool[role];

      for (const tier in tiers) {
        tiers[tier].forEach((champKey) => {
          if (!champRoleMap[champKey]) {
            champRoleMap[champKey] = new Set();
          }
          champRoleMap[champKey].add(role);
        });
      }
    }

    // estrai solo i champ presenti in >= 2 ruoli
    return Object.entries(champRoleMap)
      .filter(([_, roles]) => roles.size >= 2)
      .map(([champKey]) => champKey);
  }
}
