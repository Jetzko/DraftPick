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
    console.log('CompModel: this is the champ pool: ', this.champPool);
  }

  addOrUpdateComposition(compData) {
    const index = this.compositions.findIndex((c) => c.id === compData.id);

    if (index !== -1) {
      this.compositions[index] = compData; // ✏️ UPDATE
    } else {
      this.compositions.push(compData); // ➕ CREATE
    }
    console.log('CompModel: these are the compositions:', this.compositions);
  }

  getChampionsData(champData) {
    this.champData = champData;
    console.log('CompModel: these are all champions data', champData);
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

  calcRankComp(champData, compData) {
    let compRanks = {
      stats: {
        damage: 0,
        mobility: 0,
        range: 0,
        durability: 0,
        utility: 0,
        controls: 0,
      },
      gank: {
        top: 'B',
        mid: 'B',
        bot: 'B',
      },
      synergies: {
        team_comp: 'B',
        bot_lane: 'B',
      },
    };

    //Calcolo Stat generali

    compData.champions.forEach(({ champKey }) => {
      const champ = champData.find((c) => c.name === champKey);

      if (!champ || !champ.playstyleInfo) return;

      const ps = champ.playstyleInfo;

      compRanks.stats.damage += ps.damage ?? 5;
      compRanks.stats.mobility += ps.mobility ?? 5;
      compRanks.stats.range += ps.range ?? 5;
      compRanks.stats.durability += ps.durability ?? 5;
      compRanks.stats.utility += ps.utility ?? 5;
      compRanks.stats.controls += ps.crowdControl ?? 5;
    });

    //Calcolo Gank potencial

    const getChampByRole = (role) => {
      const entry = compData.champions.find((c) => c.role === role);
      if (!entry) return null;

      return champData.find((c) => c.name === entry.champKey);
    };

    const evaluateGank = (jungler, laner) => {
      if (!jungler || !laner) return 'C';

      const jPS = jungler.playstyleInfo;
      const lPS = laner.playstyleInfo;

      if (!jPS || !lPS) return 'C';

      const totalDamage = (jPS.damage ?? 1) + (lPS.damage ?? 1);

      const totalCC = (jPS.crowdControl ?? 1) + (lPS.crowdControl ?? 1);

      if (totalDamage >= 5 && totalCC >= 5) return 'S';
      if (totalDamage >= 4 && totalCC >= 4) return 'A';
      if (totalDamage >= 3 && totalCC >= 3) return 'B';

      return 'C';
    };

    const jungler = getChampByRole('Jungle');
    const top = getChampByRole('Top-Lane');
    const mid = getChampByRole('Mid-Lane');

    compRanks.gank.top = evaluateGank(jungler, top);
    compRanks.gank.mid = evaluateGank(jungler, mid);

    //Calcolo Sinergie campioni/composizione

    // 3️⃣ ritorna struttura completa (per futuri step)

    compData = {
      ...compData,
      compRanks,
    };
    console.log(compData);

    return compData;
  }

  _normalizeStat(value, min = 5, max = 15) {
    const normalized = Math.round(((value - min) / (max - min)) * 100);

    let rank;
    if (value >= 13) rank = 'S';
    else if (value >= 10) rank = 'A';
    else if (value >= 7) rank = 'B';
    else rank = 'C';

    return {
      value, // valore grezzo (5–15)
      normalized, // 0–100
      rank, // S/A/B/C
    };
  }
}
