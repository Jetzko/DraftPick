// ⚙️ URL CONFIGURATION
//------------------------------------------------------------------------//
const DDragon = {
  versionUrl: 'https://ddragon.leagueoflegends.com/api/versions.json',
  baseUrl: (version, local) =>
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/${local}`,
  local: 'it_IT',
};

// 🔧 LATEST DATA DRAGON VERSION
//------------------------------------------------------------------------//
const fetchLatestVersion = async function () {
  const res = await fetch(DDragon.versionUrl);
  if (!res.ok) throw new Error('💥 Fetching DDragon Version Error 💥');
  const versions = await res.json();
  return versions[0];
};

// 💾 CACHING (browser)
//------------------------------------------------------------------------//
const saveToCache = function (key, data) {
  localStorage.setItem(key, JSON.stringify(data));
};
const loadFromCache = function (key) {
  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : null;
};

// 🚀 MAIN FUNCTION
//-----------------------------------------------------------------------//
const loadChampionData = async function () {
  // 1️⃣ Upload to latest Version
  const version = await fetchLatestVersion();
  const baseUrl = DDragon.baseUrl(version, DDragon.local);

  // 2️⃣ Check if there is data inside cache
  const cacheKey = `championData_${version}_${DDragon.local}`;
  const cached = loadFromCache(cacheKey);
  if (cached) {
    console.log(
      '✅ Dati caricati dalla cache:',
      Object.keys(cached).length,
      'campioni'
    );
    return cached;
  }

  // 3️⃣ Dowload Champions List
  const res = await fetch(`${baseUrl}/champion.json`);
  if (!res.ok) throw new Error('💥 Fetching Champions List Error 💥');

  const data = await res.json();
  const champions = Object.keys(data.data);
  console.log(`✅ Founded ${champions.length} champions`);

  // 4️⃣ Download champion's detalis, 10 champions at time
  const details = {};
  const batchSize = 10;

  for (let i = 0; i < champions.length; i += batchSize) {
    const batch = champions.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (champ) => {
        const resp = await fetch(`${baseUrl}/champion/${champ}.json`);
        if (!resp.ok) throw new Error(`💥 Error on ${champ}`);

        const champData = await resp.json();
        return champData.data[champ];
      })
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        details[batch[index]] = result.value;
        console.log(`✅ Downloaded ${batch[index]}`);
      } else {
        console.warn(`💥 Failed ${batch[index]}`);
      }
    });

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`✅ All champions downloaded`);

  // 5️⃣ Save on Cache
  saveToCache(cacheKey, details);

  return details;
};

// GLOBAL SCOPE TO SAVE ALL CHAMPIONS DATA
export let championsData = null;

// 1️⃣ Download all champions
export const initChampions = async function () {
  if (!championsData) {
    championsData = await loadChampionData(); // async
    console.log(
      '✅ Tutti i campioni caricati:',
      Object.keys(championsData).length
    );
  }
  return championsData;
};

// 2️⃣ Function to get one champion's data
const getChampionData = function (championName) {
  let championNameFixed = championName.toLowerCase();
  championNameFixed =
    String(championNameFixed).charAt(0).toUpperCase() +
    String(championNameFixed).slice(1);
  if (!championsData) {
    console.warn('⚠️ I dati dei campioni non sono ancora stati caricati');
    return null;
  }
  return championsData[championNameFixed] || null;
};

// 3️⃣ Esempio di utilizzo
// Prima devi inizializzare i dati UNA VOLTA
// initChampions().then(() => {
//   console.log(getChampionData('aatrox'));
//   console.log(getChampionData('Yone'));
//   console.log(getChampionData('Zed'));
//   console.log(getChampionData('Maokai'));
// });
