export class CompositionStatsModel {
  constructor() {
    // this.teamController = new TeamController();

    this.champPool = null;
    this.compositions = [];
    this.champData = null;

    this.tierList = {
      charge: {
        s: ['vanguard', 'burst', 'hyper', 'scout'],
        a: ['diver', 'artillery', 'battlemage', 'bully'],
        b: ['assassin', 'skirmisher', 'warden', 'catcher'],
        c: ['juggernaut', 'enchanter'],
        d: [],
      },
      catch: {
        s: ['assassin', 'diver', 'catcher', 'burst', 'bully'],
        a: ['vanguard', 'scout'],
        b: ['skirmisher', 'juggernaut', 'warden', 'artillery', 'battlemage'],
        c: ['hyper'],
        d: ['enchanter'],
      },
      protect: {
        s: ['warden', 'enchanter', 'hyper'],
        a: ['juggernaut', 'battlemage', 'scout'],
        b: ['diver', 'vanguard', 'catcher', 'bully'],
        c: ['skirmisher', 'burst'],
        d: ['assassin', 'artillery'],
      },
      siege: {
        s: ['warden', 'enchanter', 'artillery'],
        a: ['burst', 'battlemage', 'hyper', 'bully'],
        b: ['juggernaut', 'catcher'],
        c: ['assassin', 'vanguard'],
        d: ['skirmisher', 'diver'],
      },
      split: {
        s: ['skirmisher', 'juggernaut', 'bully'],
        a: ['assassin', 'warden', 'enchanter', 'scout'],
        b: ['diver', 'catcher', 'battlemage', 'hyper'],
        c: ['vanguard', 'burst'],
        d: ['artillery'],
      },
    };

    this.botLaneMatrix = {
      hyper: {
        warden: 'S',
        vanguard: 'B',
        catcher: 'A',
        enchanter: 'S',
        mages: 'B',
      },
      bully: {
        warden: 'B',
        vanguard: 'A',
        catcher: 'S',
        enchanter: 'B',
        mages: 'S',
      },
      scout: {
        warden: 'A',
        vanguard: 'A',
        catcher: 'A',
        enchanter: 'B',
        mages: 'S',
      },
    };
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

  _getBotLaneSynergy(compData) {
    const champs = compData?.champions;
    if (!Array.isArray(champs)) return '-';

    const norm = (v) =>
      String(v || '')
        .toLowerCase()
        .trim();

    // ✅ FIX: includi "bot-lane" (nel tuo esempio Ashe)
    const adc = champs.find((c) =>
      ['bot-lane', 'bot', 'adc', 'bottom', 'marksman'].includes(norm(c.lane))
    );

    const sup = champs.find((c) =>
      ['support', 'sup', 'supp'].includes(norm(c.lane))
    );

    if (!adc || !sup) return '-';

    // ---- ADC row (hyper/bully/scout) ----
    const adcClasses = Array.isArray(adc.classes) ? adc.classes.map(norm) : [];
    let adcRow =
      ['hyper', 'bully', 'scout'].find((k) => adcClasses.includes(k)) || null;

    // ✅ fallback: usa championTagInfo se non trovi la row nelle classes
    if (!adcRow) {
      const p = norm(adc?.championTagInfo?.championTagPrimary);
      const s = norm(adc?.championTagInfo?.championTagSecondary);
      const tags = `${p} ${s}`;

      if (tags.includes('sustained')) adcRow = 'hyper';
      else if (tags.includes('burst')) adcRow = 'bully';
      else if (tags.includes('poke')) adcRow = 'scout';
    }

    if (!adcRow) return '-';

    // ---- Support column (warden/vanguard/catcher/enchanter) oppure mages via roles ----
    const supClasses = Array.isArray(sup.classes) ? sup.classes.map(norm) : [];
    const supRoles = Array.isArray(sup.roles) ? sup.roles.map(norm) : [];

    let supCol =
      ['warden', 'vanguard', 'catcher', 'enchanter'].find((k) =>
        supClasses.includes(k)
      ) || null;

    // ✅ "mages" viene da roles (come da tua nota)
    if (!supCol && supRoles.includes('mage')) supCol = 'mages';

    if (!supCol) return '-';

    return this.botLaneMatrix?.[adcRow]?.[supCol] ?? '-';
  }

  enrichCompositionChampions(compData) {
    if (!this.champData) {
      console.warn('No champions data available');
      return compData;
    }

    const enrichedChampions = compData.champions.map(({ champKey, lane }) => {
      const champInfo = this.champData.find((c) => c.name === champKey); // <--- accesso tramite chiave
      if (!champInfo) {
        console.warn(`Champion data not found for ${champKey}`);
        return { champKey, lane };
      }

      return {
        champKey,
        lane,
        ...champInfo,
      };
    });

    return {
      ...compData,
      champions: enrichedChampions,
    };
  }

  evaluateChampSynergy(compData, compType) {
    if (!compData || !compData.champions) return compData;

    const typeKey = String(compType || '')
      .toLowerCase()
      .trim();
    const tierTable = this.tierList[typeKey];

    if (!tierTable) {
      console.warn('evaluateChampSynergy: compType non valido:', compType);
      return {
        ...compData,
        synergies: {
          team_comp: '-',
          bot_lane: '-',
        },
      };
    }

    const tierScore = { s: 16, a: 8, b: 4, c: 2, d: 1 };

    let totalSynergy = 0;
    let countedChamps = 0;

    const championsWithSynergy = compData.champions.map((champ) => {
      const classes = champ.classes;

      if (!Array.isArray(classes) || classes.length === 0) {
        return { ...champ, synergy: 0 };
      }

      const scores = classes
        .map((cls) => {
          // ✅ match diretto: tierList contiene nomi classi in minuscolo
          const classKey =
            typeof cls === 'string'
              ? cls.toLowerCase().trim()
              : cls?.name
              ? String(cls.name).toLowerCase().trim()
              : cls?.key
              ? String(cls.key).toLowerCase().trim()
              : null;

          if (!classKey) return 0;

          for (const tier in tierTable) {
            if (tierTable[tier].includes(classKey)) {
              return tierScore[tier];
            }
          }

          // ✅ se non presente in tabella, trattala come D (non 0)
          return tierScore.d;
        })
        .filter((s) => s > 0);

      if (scores.length === 0) {
        return { ...champ, synergy: 0 };
      }

      const champSynergy = scores.reduce((a, b) => a + b, 0) / scores.length;

      totalSynergy += champSynergy;
      countedChamps++;

      return { ...champ, synergy: champSynergy };
    });

    const avgSynergy = countedChamps > 0 ? totalSynergy / countedChamps : 0;

    const S_TH = (tierScore.s + tierScore.a) / 2; // 12
    const A_TH = (tierScore.a + tierScore.b) / 2; // 6
    const B_TH = (tierScore.b + tierScore.c) / 2; // 3
    const C_TH = (tierScore.c + tierScore.d) / 2; // 1.5

    const synergyRank =
      avgSynergy >= S_TH
        ? 'S'
        : avgSynergy >= A_TH
        ? 'A'
        : avgSynergy >= B_TH
        ? 'B'
        : avgSynergy >= C_TH
        ? 'C'
        : 'D';

    const botLaneRank = this._getBotLaneSynergy(compData);

    return {
      ...compData,
      champions: championsWithSynergy,
      synergies: {
        team_comp: synergyRank,
        bot_lane: botLaneRank,
      },
    };
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

    const getChampByRole = (lane) => {
      const entry = compData.champions.find((c) => c.lane === lane);
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
    const support = getChampByRole('Support');

    compRanks.gank.top = evaluateGank(jungler, top);
    compRanks.gank.mid = evaluateGank(jungler, mid);
    compRanks.gank.bot = evaluateGank(jungler, support);

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

  // TIER LIST
  //   CHARGE               CATCH                     PROTECT          SIEGE             SPLIT
  // S VAN,BUR,HYP,SCO      ASS,DIV,CAT,BUR,BUL       WAR,ENC,HYP      WAR,ENC,ART,      SKI,JUG,BUL
  // A DIV,ART,BAT,BUL      VAN,SCO                   JUG,BAT,SCO      BUR,BAT,HYP,BUL   ASS,WAR,ENC,SCO
  // B ASS,SKI,WAR,CAT      SKI,JUG,WAR,ART,BAT       DIV,VAN,CAT,BUL  JUG,CAT           DIV,CAT,BAT,HYP
  // C JUG,ENC              HYP                       SKI,BUR          ASS,VAN           VAN,BUR
  // D ///                  ENC                       ASS,ART          SKI,DIV           ART
}
