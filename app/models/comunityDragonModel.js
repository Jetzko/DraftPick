export class ComunityDragonModel {
  constructor() {
    // ⚙️ URL CONFIGURATION
    //------------------------------------------------------------------------//
    this.CDragon = {
      baseUrl:
        'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions',
    };
    this.NAME_MAP = {
      // Nome CommunityDragon : Nome DataDragon
      'Aurelion Sol': 'AurelionSol',
      "Bel'Veth": 'Belveth',
      "Cho'Gath": 'Chogath',
      "Kai'Sa": 'Kaisa',
      "Kha'Zix": 'Khazix',
      "Kog'Maw": 'KogMaw',
      LeBlanc: 'Leblanc',
      'Lee Sin': 'LeeSin',
      'Master Yi': 'MasterYi',
      'Miss Fortune': 'MissFortune',
      'Nunu & Willump': 'Nunu',
      "Rek'Sai": 'RekSai',
      'Renata Glasc': 'Renata',
      'Tahm Kench': 'TahmKench',
      'Twisted Fate': 'TwistedFate',
      "Vel'Koz": 'Velkoz',
      Wukong: 'MonkeyKing',
      'Jarvan IV': 'JarvanIV',
      'Dr. Mundo': 'DrMundo',
      'Xin Zhao': 'XinZhao',
      "K'Sante": 'KSante',
    };

    // GLOBAL SCOPE TO SAVE ALL CHAMPIONS DATA
    this.championsData = null;
  }

  // 💾 CACHING (browser)
  //------------------------------------------------------------------------//
  saveToCache(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  loadFromCache(key) {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  }
  // 🚀 MAIN FUNCTION
  //-----------------------------------------------------------------------//
  async loadChampionData() {
    const cacheKey = 'communityDragon_champions';
    const cached = this.loadFromCache(cacheKey);
    if (cached) {
      console.log(
        '✅ Dati Community Dragon caricati dalla cache:',
        Object.keys(cached).length,
        'campioni'
      );
      return cached;
    }

    // 1️⃣ Get Champion List
    const resDDragon = await fetch(
      'https://ddragon.leagueoflegends.com/cdn/15.22.1/data/en_US/champion.json'
    );
    const data = await resDDragon.json();
    const championIDs = Object.values(data.data).map((c) => parseInt(c.key));
    console.log(championIDs);

    const details = {};

    // 2️⃣ Download in batch
    const batchSize = 10;
    for (let i = 0; i < championIDs.length; i += batchSize) {
      const batch = championIDs.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (id) => {
          const resp = await fetch(`${CDragon.baseUrl}/${id}.json`);
          if (!resp.ok) throw new Error(`💥 Error fetching champion ID ${id}`);
          return await resp.json();
        })
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const champData = result.value;
          details[champData.name] = champData;
          console.log(`✅ Downloaded ${champData.name}`);
        } else {
          console.warn(`💥 Failed to download champion ID ${batch[index]}`);
        }
      });

      await new Promise((r) => setTimeout(r, 200));
    }

    const normalizeChampionName = function (name) {
      let clean = name.trim();
      // Se esiste nella mappa, restituisci il nome Data Dragon
      if (NAME_MAP[clean]) return NAME_MAP[clean];

      // Pulizia di base
      const cleaned = clean.replace(/[^a-zA-Z]/g, '');

      // Capitalizza come DataDragon
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    };

    const minimalData = {};
    for (const champKey in data.data) {
      const id = data.data[champKey].id;
      minimalData[id] = {
        stats: data.data[champKey].stats,
      };
    }

    console.log(minimalData);

    for (const champ in details) {
      const d = details[champ];

      const normalizedKey = normalizeChampionName(d.name);

      minimalData[normalizedKey] = {
        ...minimalData[normalizedKey],
        name: champ,
        championTagInfo: d.championTagInfo,
        playstyleInfo: d.playstyleInfo,
        tacticalInfo: d.tacticalInfo,
        roles: d.roles,
        passive: {
          name: d.passive.name,
          description: d.passive.description,
        },
        spells: d.spells.map((s) => ({
          name: s.name,
          spellKey: s.spellKey,
          castRange: s.range,
          description: s.dynamicDescription,
        })),
      };
    }
    console.log('✅ All champions downloaded from Community Dragon');
    this.saveToCache(cacheKey, minimalData);

    return this.minimalData;
  }

  // 1️⃣ Download all champions
  async initChampions() {
    if (!this.championsData) {
      this.championsData = await this.loadChampionData();
      console.log(
        '✅ Tutti i campioni caricati:',
        Object.keys(this.championsData).length
      );
    }
    return this.championsData;
  }
}

// // 2️⃣ Function to get one champion's data
// export const getChampionData = function (championName) {
//   if (!championsData) {
//     console.warn('⚠️ I dati dei campioni non sono ancora stati caricati');
//     return null;
//   }
//   const champion = Object.values(championsData).find(
//     (c) => c.name.toLowerCase() === championName.toLowerCase()
//   );
//   return champion || null;
// };
