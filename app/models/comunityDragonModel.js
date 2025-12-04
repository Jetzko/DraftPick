export class ComunityDragonModel {
  constructor() {
    this.CDragon = {
      baseUrl:
        'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions',
    };

    this.DDragon = {
      versionUrl: 'https://ddragon.leagueoflegends.com/api/versions.json',
      baseUrl: (version, locale) =>
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}`,
      local: 'it_IT',
      imageBase: (version) =>
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion`,
    };

    this.NAME_MAP = {
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

    this.championsData = null;
  }

  // saveToCache(key, data) {
  //   localStorage.setItem(key, JSON.stringify(data));
  // }

  // loadFromCache(key) {
  //   const cached = localStorage.getItem(key);
  //   return cached ? JSON.parse(cached) : null;
  // }

  async fetchLatestVersion() {
    const res = await fetch(this.DDragon.versionUrl);
    if (!res.ok) throw new Error('💥 Fetching DDragon Version Error 💥');
    const versions = await res.json();
    return versions[0];
  }

  // 🔧 Icon URL diretto (Nessun caching!)
  getIconUrl(championId, version) {
    return `${this.DDragon.imageBase(version)}/${championId}.png`;
  }

  async loadChampionData() {
    // const cacheKey = 'communityDragon_champions';
    // const cached = this.loadFromCache(cacheKey);

    let latestVersion = await this.fetchLatestVersion();

    // if (cached) {
    //   console.log('♻️ Dati campioni caricati dalla cache');
    //   return cached;
    // }

    // 1️⃣ scarica champion.json
    const listUrl = `${this.DDragon.baseUrl(
      latestVersion,
      this.DDragon.local
    )}/champion.json`;

    const resDDragon = await fetch(listUrl);
    if (!resDDragon.ok) throw new Error('💥 Errore caricamento champion.json');

    const data = await resDDragon.json();

    const championIDs = Object.values(data.data).map((c) => Number(c.key));
    console.log('🏷️ Champion IDs:', championIDs);

    const details = {};
    const batchSize = 10;

    for (let i = 0; i < championIDs.length; i += batchSize) {
      const batch = championIDs.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (id) => {
          const resp = await fetch(`${this.CDragon.baseUrl}/${id}.json`);
          if (!resp.ok) throw new Error(`💥 Error fetching champion ID ${id}`);
          return await resp.json();
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const champData = result.value;
          details[champData.name] = champData;
          console.log(`🟢 Scaricato: ${champData.name}`);
        }
      });

      await new Promise((r) => setTimeout(r, 150));
    }

    const normalizeChampionName = (name) => {
      let clean = name.trim();
      if (this.NAME_MAP[clean]) return this.NAME_MAP[clean];
      return clean
        .replace(/[^a-zA-Z]/g, '')
        .replace(/^./, (c) => c.toUpperCase());
    };

    const minimalData = {};

    for (const champKey in data.data) {
      const ddragonChamp = data.data[champKey];
      const normalizedKey = ddragonChamp.id;

      minimalData[normalizedKey] = {
        stats: ddragonChamp.stats,
      };
    }

    for (const champ in details) {
      const d = details[champ];
      const normalizedKey = normalizeChampionName(d.name);

      minimalData[normalizedKey] = {
        ...minimalData[normalizedKey],
        name: champ,
        icon: this.getIconUrl(normalizedKey, latestVersion),
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

    console.log('🏁 Tutti i campioni caricati');

    // this.saveToCache(cacheKey, minimalData);

    return minimalData;
  }

  async initChampions() {
    if (!this.championsData) {
      this.championsData = await this.loadChampionData();
      console.log(
        '🔥 Campioni caricati:',
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
