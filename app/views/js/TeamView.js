export class TeamView {
  constructor() {
    this.addChampBtns = document.querySelectorAll('.add-champ-btn');
    this.addCompBtn = document.querySelector('.add-comp-btn');
    this.championsGrid = document.querySelector('.champions-section');
    this.champList = document.querySelector('.champ-grid');
    this._champSlot = null;
    this._activeChamp = null;
  }

  renderChampGrid(champions) {
    this.champList.innerHTML = '';
    const champElements = [];

    champions.forEach((c) => {
      const li = document.createElement('li');
      li.classList.add('champ');

      li.dataset.champKey = c.key || c.name;

      li.innerHTML = `<img src="${c.icon}" alt="${c.name} icon" class="champ-logo" />`;
      //   li.addEventListener('click', addToCompFn);
      this.champList.appendChild(li);
      champElements.push(li);
    });
    return champElements;
  }

  openChampGrid() {
    this.addChampBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelector('.champions-section').classList.remove('hidden');
        this._champSlot = e.target.closest('.tier-list');
      });
    });
  }

  closeChampGrid() {
    document.querySelector('.close-btn').addEventListener('click', () => {
      this._champSlot = '';
      document.querySelector('.champions-section').classList.add('hidden');
    });
  }

  addChamp(champElements, championsData) {
    if (champElements && Array.isArray(champElements)) {
      champElements.forEach((el) =>
        el.addEventListener('click', (e) => {
          const champKey = el.dataset.champKey;
          console.log('✅ Clicked champ:', champKey, e.target);
          this._activeChamp = champKey;
        })
      );
    }
    document.querySelector('.confirm').addEventListener('click', () => {
      if (this._activeChamp && this._champSlot) {
        const champData = championsData.find(
          (c) => c.name === this._activeChamp
        );

        if (!champData) {
          console.warn(`Campione ${this._activeChamp} non trovato nei dati`);
          return;
        }

        const champElement = document.createElement('li');
        champElement.classList.add('champ');
        champElement.dataset.champKey = this._activeChamp;
        this._champSlot.insertBefore(champElement, this._champSlot.firstChild);

        champElement.innerHTML = `<img src="${champData.icon}" alt="${champData.name} icon" class="champ-logo" />`;

        console.log(this._champSlot);
        this._activeChamp = null;
        document.querySelector('.champions-section').classList.add('hidden');
      } else {
        console.warn('Nessun campione o slot selezionato');
        this.closeChampGrid();
      }
    });
  }
}
