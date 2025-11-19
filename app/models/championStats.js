import { championsData, initChampions } from './comunityDragonModel.js';

// ---- CONFIGURAZIONE FILTRI RANGE ---- //
const SPELL_MIN_RANGE = 50; // ignora valori <= 50 (quasi mai range reale)
const SPELL_MAX_RANGE = 2000; // ignora valori > 2000 (outlier / dash / script)

// ---- DETERMINA SE LA SPELL È RILEVANTE ---- //
// Include solo spell che fanno danno, CC, scudi o cure
const isRelevantSpell = function (spell) {
  if (!spell) return false;

  const tags = spell.spellTags || [];
  const effects = spell.spellEffects || [];

  // Danno
  const dealDamage = tags.includes('Damage') || effects.some((e) => e?.damage);

  // CC comuni
  const hasCC =
    tags.some((tag) =>
      [
        'Stun',
        'Knockup',
        'Knockback',
        'Slow',
        'Root',
        'Fear',
        'Charm',
        'Taunt',
        'Silence',
      ].includes(tag)
    ) || effects.some((e) => e?.cc);

  // Cure o scudi
  const healOrShield =
    tags.includes('Heal') ||
    tags.includes('Shield') ||
    effects.some((e) => e?.heal || e?.shield);

  return dealDamage || hasCC || healOrShield;
};

// ---- ESTRAE SOLO I RANGE NUMERICI PLAUSIBILI DELLE SPELL ---- //
const extractValidSpellRanges = function (spell) {
  if (!isRelevantSpell(spell)) return [];

  const ranges = [];
  const raw = spell.castRange ?? spell.range ?? null;

  if (Array.isArray(raw)) {
    raw.forEach((value) => {
      if (typeof value !== 'number') return;
      if (value <= SPELL_MIN_RANGE) return;
      if (value > SPELL_MAX_RANGE) return;
      ranges.push(value);
    });
  } else if (typeof raw === 'number') {
    if (raw > SPELL_MIN_RANGE && raw <= SPELL_MAX_RANGE) {
      ranges.push(raw);
    }
  }

  return ranges;
};

// ---- CALCOLO RANGE MEDIO PONDERATO ---- //
const computeChampionRange = function (stats, spells, tagInfo) {
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

  if (hasLongRange(tagInfo)) return 700;

  const attackRange = stats?.attackrange || null;

  // Range spell filtrati
  const spellRanges = spells
    .map(extractValidSpellRanges)
    .flat()
    .filter((n) => typeof n === 'number');

  const spellAvg =
    spellRanges.length > 0
      ? spellRanges.reduce((a, b) => a + b, 0) / spellRanges.length
      : null;

  if (!attackRange && !spellAvg) return null;

  // 70% AA, 30% spells
  const weighted =
    attackRange && spellAvg
      ? attackRange * 0.6 + spellAvg * 0.4
      : attackRange ?? spellAvg;

  return weighted;
};

// ---- MAP RANGE → SCALA 1-3 ---- //
const mapRangeToScale = function (value) {
  if (!value) return 1;

  if (value <= 300) return 1; // melee corto
  if (value <= 600) return 2; // ranged medio
  return 3; // artillery
};

// ---- MAIN ---- //
const startAnalysis = async function () {
  await initChampions(); // dati già pronti

  const championsWithRange = {};

  for (const champKey in championsData) {
    const champ = championsData[champKey];

    const avgRange = computeChampionRange(
      champ.stats,
      champ.spells,
      champ.championTagInfo
    );
    const range = mapRangeToScale(avgRange);

    championsWithRange[champKey] = {
      ...champ,
      playstyleInfo: {
        ...champ.playstyleInfo,
        range: range,
      },
    };
  }

  const allTags = collectAllChampionTags();
  console.log(allTags);
  return championsWithRange;
};

const collectAllChampionTags = function () {
  const tagSet = new Set();

  for (const champKey in championsData) {
    const champ = championsData[champKey];

    const info = champ.championTagInfo;
    if (!info) continue;

    // Aggiunge primary e secondary se presenti
    if (info.championTagPrimary) tagSet.add(info.championTagPrimary);
    if (info.championTagSecondary) tagSet.add(info.championTagSecondary);
  }

  return Array.from(tagSet);
};

const newChampionsData = await startAnalysis();
console.log(newChampionsData);

const classes = {
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
    duelist: [],
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

const mSlayers = [
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

const mSkirmishers = [
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

const mDivers = [
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
  'Olaf',
  'Pantheon',
  'Reksai',
  'Renekton',
  'Rengar',
  'Vi',
  'Warwick',
  'MonkeyKing',
  'XinZhao',
];

const mJaggeernauts = [
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

const mVanguards = [
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

const mWardens = [
  'Braum',
  'Galio',
  'KSante',
  'Poppy',
  'Shen',
  'TahmKench',
  'Taric',
];

const mBattlers = [
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

const mBursts = [
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

const mArtilleries = [
  'Hwei',
  'Jayce',
  'Lux',
  'Mel',
  'Varus',
  'Velkoz',
  'Xerath',
  'Ziggs',
];

const mCatchers = [
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

const mEnchanters = [
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

const mHypers = [
  'Aphelios',
  'Jinx',
  'Kaisa',
  'Kayle',
  'KogMaw',
  'Kindred',
  'Sivir',
  'Smolder',
  'Tristana',
  'Twitch',
  'Vayne',
  'Yunara',
  'Zeri',
];

const mHunters = [
  'Ashe',
  'Jhin',
  'Senna',
  'Teemo',
  'Varus',
  'Xayah',
  'TwistedFate',
];

const mBullies = [
  'Akshan',
  'Caitlyn',
  'Corki',
  'Draven',
  'Graves',
  'Ezreal',
  'Kalista',
  'Lucian',
  'MissFortune',
  'Quinn',
  'Samira',
];

const subclassMap = {
  // ASSASSIN
  slayer: mSlayers,
  skirmisher: mSkirmishers,

  // FIGHTER
  diver: mDivers,
  juggernaut: mJaggeernauts,

  // MAGE
  artillery: mArtilleries,
  battlemage: mBattlers,
  burst: mBursts,

  // MARKSMAN
  duelist: mHunters,
  bully: mBullies,
  hyper: mHypers,

  // SUPPORT
  catcher: mCatchers,
  enchanter: mEnchanters,

  // TANK
  vanguard: mVanguards,
  warden: mWardens,
};
// "Sustained Damage"
// "Self Healing"
// "Mobile"
// "Burst"
// "Stealt
// "Crowd Contro
// "Initiato
// "Dive"
// "AoE"
// "Summon"
// "Hypercarry"
// "Auto-attack"
// "Damage-over-Time"
// "Durable"
// "Duelist"
// "Shapeshift"
// "Long Range"
// "Battlecaster"
// "Ally Protection"

const assignSubclasses = function () {
  for (const champName in newChampionsData) {
    const champ = newChampionsData[champName];

    // Cerca in quale sottoclasse compare il nome del campione
    for (const subclass in subclassMap) {
      const list = subclassMap[subclass];

      if (list.includes(champName)) {
        // Trova la CLASSE che contiene la sottoclasse
        for (const mainClass in classes) {
          if (classes[mainClass].hasOwnProperty(subclass)) {
            classes[mainClass][subclass].push(champ);
          }
        }
      }
    }
  }

  return classes;
};

// championsByRole();
assignSubclasses();
console.log(classes);
