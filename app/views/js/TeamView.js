export class TeamView {
  constructor() {
    this.addChampBtns = document.querySelectorAll('.add-champ-btn');
    this.addCompBtn = document.querySelector('.add-comp-btn');
    this.championsGrid = document.querySelector('.champions-section');
    this.champList = document.querySelector('.champ-grid');
    this.tierLists = document.querySelectorAll('.tier-list');
    this._champSlot = null;
    this._activeChamp = null;
    this._replaceTarget = null;
    this._deleteEl = document.querySelector('.champ.delete');
  }

  renderChampGrid(champions) {
    const champElements = [];
    const delLi = document.createElement('li');
    delLi.classList.add('champ', 'delete');
    delLi.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="champ-logo">
             <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            `;
    delLi.dataset.champKey = 'delete';
    this.champList.appendChild(delLi);
    champElements.push(delLi);

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
    // this.tierLists.forEach((list) => {
    //    list.addEventListener('click', (e) => {
    //     const champEl = e.target.closest('.champ');
    //     if (!champEl || !list.contains(champEl)) return;
    //     this._champSlot = e.target.;
    //   });
    // });
  }

  closeChampGrid() {
    document.querySelector('.close-btn').addEventListener('click', () => {
      this._champSlot = null;
      this._activeChamp = null;

      document.querySelector('.champions-section').classList.add('hidden');
    });
  }

  addChamp(champElements, championsData) {
    let activeEl = null;
    if (champElements && Array.isArray(champElements)) {
      champElements.forEach((el) =>
        el.addEventListener('click', () => {
          const clickedKey = el.dataset.champKey;

          // se c'è un altro elemento attivo, lo deseleziono
          if (activeEl && activeEl !== el) {
            activeEl.classList.remove('active');
          }

          // se ho cliccato l'elemento già attivo lo setto off, altrimenti lo setto active
          if (activeEl === el) {
            el.classList.remove('active');
            activeEl = null;
            this._activeChamp = null;
          } else {
            el.classList.add('active');
            activeEl = el;
            console.log(el);
            this._activeChamp = clickedKey;
          }
        })
      );
    }
    document.querySelector('.confirm').addEventListener('click', () => {
      const activeIsDelete =
        this._activeChamp === 'delete' ||
        (this._activeEl && this._activeEl.dataset.champKey === 'delete');
      if (activeIsDelete) {
        if (
          this._replaceTarget &&
          this._replaceTarget.parentNode === this._champSlot
        ) {
          this.removeChampElement(this._replaceTarget);
          // pulizia stato visivo e variabili
          if (this._activeEl) this._activeEl.classList.remove('active');
          this._activeEl = null;
          this._activeChamp = null;
          this._replaceTarget = null;
          document.querySelector('.champions-section').classList.add('hidden');
          return; // non procedere oltre
        } else {
          console.warn(
            'Nessun target selezionato per la rimozione o slot non corrispondente.'
          );
          return;
        }
      }

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
        champElement.innerHTML = `<img src="${champData.icon}" alt="${champData.name} icon" class="champ-logo" />`;

        if (
          this._replaceTarget &&
          this._replaceTarget.parentNode === this._champSlot
        ) {
          this._replaceTarget.replaceWith(champElement);
          this._replaceTarget = null;
        } else {
          this._champSlot.insertBefore(
            champElement,
            this._champSlot.firstChild
          );
        }

        activeEl.classList.remove('active');
        this._activeChamp = null;
        activeEl = null;
        document.querySelector('.champions-section').classList.add('hidden');
      } else {
        console.warn('Nessun campione o slot selezionato');
        document.querySelector('.champions-section').classList.add('hidden');
      }
    });
  }

  removeChampElement(champEl) {
    champEl.remove();
  }

  replaceChampion() {
    if (this.tierLists && this.tierLists.length) {
      this.tierLists.forEach((list) => {
        list.addEventListener('click', (e) => {
          const champEl = e.target.closest('.champ');
          if (!champEl || !list.contains(champEl)) return;
          // salva il slot/lista e l'elemento da sostituire
          this._champSlot = list;
          this._replaceTarget = champEl;
          this.championsGrid.classList.remove('hidden');
        });
      });
    }
  }
}
