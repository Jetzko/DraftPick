import { ComunityDragonModel } from './ComunityDragonModel.js';

export class ChampionStatsModel {
  constructor() {
    // ---- CONFIGURAZIONE FILTRI RANGE ---- //
    this.SPELL_MIN_RANGE = 50; // ignora valori <= 50 (quasi mai range reale)
    this.SPELL_MAX_RANGE = 3500; // ignora valori > 3500 (outlier / dash / script)
    this.SPELL_BUG_RANGE = 2500; // ignora valori === 2500 )
    this.cdModel = new ComunityDragonModel();
    this.initChampions = this.cdModel.initChampions.bind(this.cdModel);

    this.newChampionsData = null;

    // this.startAnalysis()
    //   .then((result) => {
    //     this.newChampionsData = result;
    //     this.assignSubclasses();
    //   })
    //   .catch((err) => console.error('startAnalysis error', err));

    // this.spellTags = ['<physicalDamage>', '<magicDamage>','<trueDamage>', '<speed>', '<healing>', '<shield>', '<status>'];
    this.classes = {
      assassin: {
        slayer: [],
        skirmisher: [],
      },
      fighter: {
        diver: [],
        juggernaut: [],
      },
      mage: {
        artillery: [],
        battlemage: [],
        burst: [],
      },
      marksman: {
        bully: [],
        scout: [],
        hyper: [],
      },
      support: {
        catcher: [],
        enchanter: [],
      },
      tank: {
        vanguard: [],
        warden: [],
      },
    };
    this.mSlayers = [
      'Akali',
      'Akshan',
      'Diana',
      'Ekko',
      'Evelynn',
      'Fizz',
      'Kassadin',
      'Katarina',
      'Khazix',
      'LeBlanc',
      'Naafiri',
      'Nidalee',
      'Nocturne',
      'Aurora',
      'Pyke',
      'Quinn',
      'Qiyana',
      'Rengar',
      'Shaco',
      'Talon',
      'Yone',
      'Zed',
    ];

    this.mSkirmishers = [
      'Ambessa',
      'Belveth',
      'Fiora',
      'Gangplank',
      'Graves',
      'Gwen',
      'Jax',
      'KSante',
      'Kayn',
      'Kled',
      'Lillia',
      'MasterYi',
      'Nilah',
      'Riven',
      'Sylas',
      'Tryndamere',
      'Viego',
      'Yasuo',
      'Yone',
      'Zaahen',
    ];

    this.mDivers = [
      'Ambessa',
      'Briar',
      'Camille',
      'Diana',
      'Elise',
      'Gangplank',
      'Gnar',
      'Hecarim',
      'Irelia',
      'JarvanIV',
      'LeeSin',
      'Nocturne',
      'Olaf',
      'Pantheon',
      'RekSai',
      'Renekton',
      'Rengar',
      'Vi',
      'Warwick',
      'MonkeyKing',
      'XinZhao',
    ];

    this.mJaggeernauts = [
      'Aatrox',
      'Chogath',
      'Darius',
      'DrMundo',
      'Garen',
      'Illaoi',
      'Mordekaiser',
      'Nasus',
      'Sett',
      'Singed',
      'Shyvana',
      'Skarner',
      'Trundle',
      'Udyr',
      'Urgot',
      'Volibear',
      'Yorick',
    ];

    this.mVanguards = [
      'Alistar',
      'Amumu',
      'Gragas',
      'Leona',
      'Malphite',
      'Maokai',
      'Nautilus',
      'Nunu',
      'Ornn',
      'Rammus',
      'Rell',
      'Sejuani',
      'Sion',
      'Skarner',
      'Zac',
    ];

    this.mWardens = [
      'Braum',
      'Galio',
      'KSante',
      'Poppy',
      'Shen',
      'TahmKench',
      'Taric',
    ];

    this.mBattlers = [
      'Anivia',
      'AurelionSol',
      'Azir',
      'Cassiopeia',
      'Heimerdinger',
      'Karthus',
      'Kayle',
      'Malzahar',
      'Rumble',
      'Ryze',
      'Swain',
      'Taliyah',
      'Viktor',
      'Vladimir',
    ];

    this.mBursts = [
      'Ahri',
      'Annie',
      'Aurora',
      'Brand',
      'Fiddlesticks',
      'Karma',
      'Kennen',
      'Leblanc',
      'Lissandra',
      'Lux',
      'Neeko',
      'Orianna',
      'Seraphine',
      'Sylas',
      'Syndra',
      'TwistedFate',
      'Veigar',
      'Vex',
      'Zoe',
    ];

    this.mArtilleries = [
      'Hwei',
      'Jayce',
      'Lux',
      'Mel',
      'Varus',
      'Velkoz',
      'Xerath',
      'Ziggs',
    ];

    this.mCatchers = [
      'Bard',
      'Blitzcrank',
      'Ivern',
      'Jhin',
      'Morgana',
      'Neeko',
      'Pyke',
      'Rakan',
      'Thresh',
      'Zyra',
    ];

    this.mEnchanters = [
      'Janna',
      'Karma',
      'Lulu',
      'Milio',
      'Nami',
      'Renata',
      'Senna',
      'Seraphine',
      'Sona',
      'Soraka',
      'Taric',
      'Yuumi',
      'Zilean',
    ];

    this.mHypers = [
      'Aphelios',
      'Jinx',
      'Kayle',
      'KogMaw',
      'Kindred',
      'Sivir',
      'Smolder',
      'Twitch',
      'Vayne',
      'Yunara',
      'Zeri',
    ];

    this.mScouts = [
      'Akshan',
      'Ashe',
      'Corki',
      'Ezreal',
      'Jhin',
      'Kaisa',
      'Senna',
      'Teemo',
      'TwistedFate',
      'Varus',
      'Xayah',
    ];

    this.mBullies = [
      'Caitlyn',
      'Draven',
      'Graves',
      'Kalista',
      'Lucian',
      'MissFortune',
      'Quinn',
      'Samira',
      'Tristana',
    ];

    this.subclassMap = {
      // ASSASSIN
      slayer: this.mSlayers,
      skirmisher: this.mSkirmishers,

      // FIGHTER
      diver: this.mDivers,
      juggernaut: this.mJaggeernauts,

      // MAGE
      artillery: this.mArtilleries,
      battlemage: this.mBattlers,
      burst: this.mBursts,

      // MARKSMAN
      scout: this.mScouts,
      bully: this.mBullies,
      hyper: this.mHypers,

      // SUPPORT
      catcher: this.mCatchers,
      enchanter: this.mEnchanters,

      // TANK
      vanguard: this.mVanguards,
      warden: this.mWardens,
    };
  }

  async init() {
    try {
      // avvia l'analisi e attendi il completamento
      const result = await this.startAnalysis();

      // salva il risultato
      this.newChampionsData = result;
      this.assignSubclasses();

      console.log('✅ ChampionStatsModel init completato');
      return this.newChampionsData;
    } catch (err) {
      console.error('❌ ChampionStatsModel init error:', err);
      throw err;
    }
  }

  // ---- DETERMINA SE LA SPELL È RILEVANTE ---- //
  // Include solo spell che fanno danno, CC, scudi o cure
  isRelevantSpell(spell) {
    if (!spell) return false;

    const effects = (spell.description ?? '').toLowerCase();
    const tagMatches = Array.from(effects.matchAll(/<([^>]+)>/g)).map(
      (m) => `<${m[1]}>`
    );

    // normalizza
    const tags = tagMatches.map((t) => t.toLowerCase());

    const damageTags = ['<physicaldamage>', '<magicdamage>', '<truedamage>'];
    const utilityTags = ['<speed>', '<healing>', '<shield>'];

    const dealDamage = tags.some((t) => damageTags.includes(t));
    const hasUtility = tags.some((t) => utilityTags.includes(t));
    const hasCC = tags.includes('<status>');

    return dealDamage || hasCC || hasUtility;
  }

  // ---- ESTRAE SOLO I RANGE NUMERICI PLAUSIBILI DELLE SPELL ---- //
  extractValidSpellRanges(spell) {
    if (!spell) return [];
    if (!this.isRelevantSpell(spell)) return [];

    const raw = spell.castRange ?? spell.range ?? null;
    if (!raw) return [];

    const values = Array.isArray(raw) ? raw.slice() : [raw];

    // filtra solo numeri e scarta i valori-bug / fuori range
    const nums = values
      .filter((v) => typeof v === 'number')
      .map((v) => (v === this.SPELL_BUG_RANGE ? null : v))
      .filter(
        (v) =>
          typeof v === 'number' &&
          v > this.SPELL_MIN_RANGE &&
          v <= this.SPELL_MAX_RANGE
      );

    // ritorna i singoli numeri (possibili multiple entries) o la media se preferisci un singolo valore
    if (nums.length === 0) return [];
    return nums;
  }

  // ---- CALCOLO RANGE MEDIO PONDERATO ---- //
  computeChampionRange(stats, spells, tagInfo) {
    const hasLongRange = (tag) => {
      if (!tag) return false;
      if (typeof tag === 'string')
        return tag === 'Long Range' || tag.includes('Long Range');
      if (Array.isArray(tag))
        return tag.some((v) => typeof v === 'string' && v === 'Long Range');
      if (typeof tag === 'object') {
        const p = tag.championTagPrimary ?? tag.primary ?? null;
        const s = tag.championTagSecondary ?? tag.secondary ?? null;
        return [p, s].some((v) => typeof v === 'string' && v === 'Long Range');
      }
      return false;
    };

    if (hasLongRange(tagInfo)) return 700; // rimane comportamento speciale se necessario

    const attackRange = stats?.attackrange ?? stats?.attackRange ?? null;

    const spellRanges = (spells || [])
      .flatMap((s, i) => {
        const ranges = this.extractValidSpellRanges(s); // array di numeri
        // se è la quarta spell (indice 3) e uno dei suoi range supera 3500, escludila
        if (i === 3 && ranges.some((r) => typeof r === 'number' && r > 3500)) {
          return [];
        }
        return ranges;
      })
      .filter((n) => typeof n === 'number');

    const spellAvg =
      spellRanges.length > 0
        ? spellRanges.reduce((a, b) => a + b, 0) / spellRanges.length
        : null;

    if (attackRange == null && spellAvg == null) return null;

    const weighted =
      attackRange != null && spellAvg != null
        ? attackRange * 0.6 + spellAvg * 0.4
        : attackRange ?? spellAvg;

    return weighted;
  }

  // ---- MAP RANGE → SCALA 1-3 ---- //
  mapRangeToScale(value) {
    if (!value) return 1;

    if (value <= 300) return 1; // melee corto
    if (value <= 650) return 2; // ranged medio
    return 3; // artillery
  }

  // ---- MAIN ---- //
  async startAnalysis() {
    const championsData = await this.initChampions();
    const championsWithRange = {};

    for (const champKey in championsData) {
      const champ = championsData[champKey];
      const avgRange = this.computeChampionRange(
        champ.stats,
        champ.spells,
        champ.championTagInfo
      );
      const range = this.mapRangeToScale(avgRange);

      championsWithRange[champKey] = {
        ...champ,
        playstyleInfo: {
          ...champ.playstyleInfo,
          range: range,
        },
      };
    }

    // const allTags = this.collectAllChampionTags(championsWithRange);
    // console.log(allTags);
    console.log(championsWithRange);
    return championsWithRange;
  }

  // collectAllChampionTags() {
  //   const tagSet = new Set();

  //   for (const champKey in this.championsData) {
  //     const champ = this.championsData[champKey];

  //     const info = champ.championTagInfo;
  //     if (!info) continue;

  //     // Aggiunge primary e secondary se presenti
  //     if (info.championTagPrimary) tagSet.add(info.championTagPrimary);
  //     if (info.championTagSecondary) tagSet.add(info.championTagSecondary);
  //   }

  //   return Array.from(tagSet);
  // }

  assignSubclasses() {
    for (const champName in this.newChampionsData) {
      const champ = this.newChampionsData[champName];

      // Cerca in quale sottoclasse compare il nome del campione
      for (const subclass in this.subclassMap) {
        const list = this.subclassMap[subclass];

        if (list.includes(champName)) {
          // Trova la CLASSE che contiene la sottoclasse
          for (const mainClass in this.classes) {
            if (this.classes[mainClass].hasOwnProperty(subclass)) {
              this.classes[mainClass][subclass].push(champ);
            }
          }
        }
      }
    }
    console.log(this.classes);

    return this.classes;
  }
}
