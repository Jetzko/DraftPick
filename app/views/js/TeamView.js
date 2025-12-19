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
    this._activeEl = null; // salva riferimento all'elemento attivo
    this._deleteEl = document.querySelector('.champ.delete');
    this.searchInp = document.getElementById('search-champ');
    this._confirmBound = false;
    this._originalButtons = new Map(); // aggiungi questa riga
    this._openChampGridBound = false;
    this._editComp = false;
    this._addCompBtn = document.querySelector('.add-comp-btn');
    this.onCompositionSaved = null;
    this.onCompositionEdited = null;
    this.onChampPoolUpdated = null;

    this._bindSearchInput();
    this._bindOpenChampGrid();
    this._bindCreateComp();
  }

  getChampPoolData() {
    const lanes = document.querySelectorAll('.champ-pool .player');

    const pool = {};

    lanes.forEach((lane) => {
      const laneName = lane.classList[1]; // top, jungle, mid, bot, support
      const tierLists = lane.querySelectorAll('.tier-list');

      pool[laneName] = {
        s: [],
        a: [],
        situational: [],
      };

      tierLists.forEach((list) => {
        const tier = list.classList.contains('s')
          ? 's'
          : list.classList.contains('a')
          ? 'a'
          : 'situational';

        const champs = list.querySelectorAll('.champ[data-champ-key]');
        champs.forEach((c) => pool[laneName][tier].push(c.dataset.champKey));
      });
    });

    return pool;
  }

  renderFlexPicks(flexPicks, champions) {
    const flexList = document.querySelector('.flex.tier-list');
    if (!flexList) return;

    flexList.innerHTML = '';

    flexPicks.forEach((champKey) => {
      const li = document.createElement('li');
      li.classList.add('champ');
      li.dataset.champKey = champKey;

      li.innerHTML = `
      <img src='${champions.find((c) => c.name === champKey).icon}' alt='${
        champions.find((c) => c.name === champKey).name
      }' class='champ-logo'>
    `;

      flexList.appendChild(li);
    });
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
      this.champList.appendChild(li);
      champElements.push(li);
    });

    return champElements;
  }

  _bindClonedButton(clonedBtn) {
    clonedBtn.addEventListener('click', (e) => {
      const tierList = e.target.closest('.tier-list');
      document.querySelector('.champions-section').classList.remove('hidden');
      this._champSlot = tierList;
    });
  }

  _bindOpenChampGrid() {
    if (this._openChampGridBound) return;

    this.addChampBtns.forEach((btn) => {
      if (
        !btn.closest('.team-comps') ||
        (btn.closest('.team-comp') && this._editComp)
      )
        btn.addEventListener('click', (e) => {
          const tierList = e.target.closest('.tier-list');
          if (!this._originalButtons.has(tierList)) {
            this._originalButtons.set(tierList, btn.cloneNode(true));
          }
          document
            .querySelector('.champions-section')
            .classList.remove('hidden');
          this._champSlot = tierList;
        });
    });

    this._openChampGridBound = true;
  }

  openChampGrid() {
    this.championsGrid.classList.remove('hidden');
  }

  closeChampGrid() {
    document.querySelector('.close-btn').addEventListener('click', () => {
      this._champSlot = null;
      this._activeChamp = null;
      document.querySelector('.champions-section').classList.add('hidden');
    });
  }

  addChamp(champElements, championsData) {
    if (champElements && Array.isArray(champElements)) {
      champElements.forEach((el) =>
        el.addEventListener('click', () => {
          const clickedKey = el.dataset.champKey;

          // se c'è un altro elemento attivo, lo deseleziono
          if (this._activeEl && this._activeEl !== el) {
            this._activeEl.classList.remove('active');
          }

          // se ho cliccato l'elemento già attivo lo setto off, altrimenti lo setto active
          if (this._activeEl === el) {
            el.classList.remove('active');
            this._activeEl = null;
            this._activeChamp = null;
          } else {
            el.classList.add('active');
            this._activeEl = el;
            this._activeChamp = clickedKey;
          }
        })
      );
    }

    if (this._confirmBound) return;
    this._confirmBound = true;

    document.querySelector('.confirm').addEventListener('click', () => {
      // controllo se l'elemento selezionato è il delete
      const activeIsDelete =
        this._activeChamp === 'delete' ||
        (this._activeEl && this._activeEl.dataset.champKey === 'delete');

      if (activeIsDelete) {
        // se sto sostituendo un campione
        if (
          this._replaceTarget &&
          this._replaceTarget.parentNode === this._champSlot
        ) {
          // 1. Sto cancellando nel comp-builder?
          const inBuilder = this._replaceTarget.closest('.comp-builder');

          // 2. Sto cancellando in una composition salvata?
          const inSavedComp = this._replaceTarget.closest('.team-comps');

          const isInCompSection = inBuilder || inSavedComp;

          if (isInCompSection) {
            // 🔄 LOGICA DELLO SLOT: NON rimuovere <li>, ripristina il pulsante +
            this._replaceTarget.dataset.champKey = '';
            this._replaceTarget.innerHTML = `
        <button class="add-champ-btn">
            <svg class="add-champ-svg" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    `;

            // 🔄 Riattacco listener al bottone +
            this._replaceTarget
              .querySelector('.add-champ-btn')
              .addEventListener('click', (e) => {
                this._champSlot = this._replaceTarget;
                this.championsGrid.classList.remove('hidden');
              });
          } else {
            // 🧹 ELIMINA LO SLOT
            this.removeChampElement(this._replaceTarget);
          }

          if (
            this._replaceTarget &&
            this._replaceTarget.closest('.champ-pool')
          ) {
            if (this.onChampPoolUpdated) {
              this.onChampPoolUpdated(this.getChampPoolData());
            }
          }

          if (this._activeEl) this._activeEl.classList.remove('active');
          this._activeEl = null;
          this._activeChamp = null;
          this._replaceTarget = null;
          document.querySelector('.champions-section').classList.add('hidden');
          return;
        } else {
          console.warn(
            'Nessun target selezionato per la rimozione o slot non corrispondente.'
          );
          return;
        }
      }

      if (this._activeChamp && this._champSlot) {
        const champData = championsData.find(
          (c) => c.key === this._activeChamp || c.name === this._activeChamp
        );

        if (!champData) {
          console.warn(`Campione ${this._activeChamp} non trovato nei dati`);
          return;
        }

        // Se _champSlot è un <li class="champ"> (comp-builder), sostituiamo il suo contenuto
        if (
          this._champSlot.tagName === 'LI' &&
          this._champSlot.classList.contains('champ')
        ) {
          // settiamo dataset e innerHTML del LI esistente (manteniamo la struttura di <li>)
          this._champSlot.dataset.champKey = this._activeChamp;
          this._champSlot.innerHTML = `<span class="role">${this._champSlot.classList[1]}</span><img src="${champData.icon}" alt="${champData.name} icon" class="champ-logo" />`;
        } else {
          // comportamento legacy: inseriamo un nuovo elemento all'interno della lista target
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
        }

        if (this._champSlot.closest('.champ-pool')) {
          if (this.onChampPoolUpdated) {
            this.onChampPoolUpdated(this.getChampPoolData());
          }
        }

        if (this._activeEl) this._activeEl.classList.remove('active');
        this._activeEl = null;
        this._activeChamp = null;
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
          this._champSlot = list;
          this._replaceTarget = champEl;
          this.championsGrid.classList.remove('hidden');
        });
      });
    }
  }

  filterChampions(searchTerm) {
    const search = (searchTerm || '').toLowerCase().trim();
    const champEls = this.champList.querySelectorAll('.champ:not(.delete)');

    champEls.forEach((li) => {
      const champKey = (li.dataset.champKey || '').toLowerCase();
      if (!search || champKey.indexOf(search) > -1) {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    });
  }

  _bindSearchInput() {
    if (!this.searchInp) return;
    this.searchInp.addEventListener('input', (e) => {
      this.filterChampions(e.target.value);
    });
  }

  _bindCreateComp() {
    if (!this._addCompBtn) return;
    this._addCompBtn.addEventListener('click', (e) => {
      this._createNewComp();
    });
  }

  _bindReplaceOnChampClick(container) {
    container.addEventListener('click', (e) => {
      const champLi = e.target.closest('.champ');

      if (!champLi) return;

      // evita click sul +
      if (e.target.closest('.add-champ-btn')) return;

      // deve avere un campione assegnato
      if (!champLi.dataset.champKey) return;

      this._champSlot = champLi;
      this._replaceTarget = champLi;
      this.championsGrid.classList.remove('hidden');
    });
  }

  _createNewComp() {
    // template della comp-builder nella pagina
    const template = document.querySelector('.comp-builder.hidden');
    if (!template) return;

    // Clone del comp-builder
    const newComp = template.cloneNode(true);
    newComp.classList.remove('hidden');
    newComp.classList.add('active-builder');

    const deleteBtn = newComp.querySelector('.comp-delete');

    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // reset stato interno
        this._champSlot = null;
        this._replaceTarget = null;

        // chiudi il builder senza salvare
        newComp.remove();
      });
    }

    // Inserisco il builder nella lista composizioni

    const gamePlan = newComp.querySelector('.game-plan');
    const details = newComp.querySelector('.details');

    if (gamePlan) gamePlan.style.display = 'none';
    if (details) details.style.display = 'none';

    const compList = document.querySelector('.comps');
    compList.insertBefore(newComp, compList.firstChild);

    // Binding degli add-champ-btn nel nuovo builder
    const champBtns = newComp.querySelectorAll('.add-champ-btn');
    champBtns.forEach((btn) =>
      btn.addEventListener('click', (e) => {
        // vogliamo il singolo <li class="champ"> che contiene il button
        const champLi = btn.closest('.champ');
        if (!champLi) return;
        // SALVIAMO IL LI come target dello slot (non l'UL)
        this._champSlot = champLi;
        this.championsGrid.classList.remove('hidden');
      })
    );

    this._bindReplaceOnChampClick(newComp);

    // Binding del tasto SAVE della nuova comp
    const saveBtn = newComp.querySelector('.save-btn');
    saveBtn.addEventListener('click', () => this._saveComposition(newComp));
  }

  _extractCompData(li) {
    // Nome
    let name = '';
    const inpBuilder = li.querySelector('.comp-name-inp'); // builder
    const inpEdit = li.querySelector('.comp-name-input'); // edit
    const title = li.querySelector('.comp-name'); // saved comp

    if (inpBuilder) {
      name = inpBuilder.value.trim();
    } else if (inpEdit) {
      name = inpEdit.value.trim();
    } else if (title) {
      name = title.textContent.trim();
    } else {
      name = 'Unnamed';
    }

    // Champions
    const champSlots = li.querySelectorAll('.champ[data-champ-key]');
    const champions = Array.from(champSlots).map((slot) => {
      const roleClass = [...slot.classList].find((c) => c !== 'champ');
      return { champKey: slot.dataset.champKey, lane: roleClass ?? null };
    });

    // Tipo composizione
    const typeSelect = li.querySelector(
      '.comp-type-select, .comp-type-select-edit'
    );

    let type = 'charge'; // default
    if (typeSelect) type = typeSelect.value;
    else {
      const gpStrong = li.querySelector('.game-plan strong');
      if (gpStrong) type = gpStrong.textContent.split(' ')[0].toLowerCase();
    }

    return {
      id: li.dataset.compId ?? null,
      name,
      champions,
      type,
    };
  }

  _saveComposition(compEl) {
    const REQUIRED_ROLES = [
      'Top-Lane',
      'Jungle',
      'Mid-Lane',
      'Bot-Lane',
      'Support',
    ];

    let compData = this._extractCompData(compEl);

    // 🔴 VALIDAZIONE NOME COMPOSIZIONE
    if (!compData.name) {
      alert('Please digit a team composition name');
      return;
    }

    // 🔴 VALIDAZIONE TIPO COMPOSIZIONE
    if (!compData.type) {
      alert('Please select a team composition type');
      return;
    }

    // 🔴 VALIDAZIONE RUOLI
    const selectedRoles = compData.champions.map((c) => c.lane).filter(Boolean);

    const missingRoles = REQUIRED_ROLES.filter(
      (role) => !selectedRoles.includes(role)
    );

    if (missingRoles.length > 0) {
      alert(`Missing champions for: ${missingRoles.join(', ')}`);
      return;
    }

    // 🔵 OK → assegna ID
    compData = {
      ...compData,
      id: compData.id ?? crypto.randomUUID(),
    };

    // 🔵 SALVA
    if (this.onCompositionSaved) {
      this.onCompositionSaved(compData);
    }

    this._renderSavedComposition({
      id: compData.id,
      name: compData.name,
      champions: compData.champions.map((c) => ({
        champKey: c.champKey,
        role: c.lane,
      })),
      championsIconMap: Object.fromEntries(
        Array.from(compEl.querySelectorAll('.champ[data-champ-key]')).map(
          (slot) => [
            slot.dataset.champKey,
            slot.querySelector('img')?.src || '',
          ]
        )
      ),
      type: compData.type, // <— aggiunto
    });

    compEl.remove();
  }

  _renderSavedComposition(comp) {
    const compList = document.querySelector('.comps');
    const type = (comp.type || 'charge').toUpperCase();

    const li = document.createElement('li');
    li.classList.add('comp');

    li.dataset.compId = comp.id;

    li.innerHTML = `
    <h4 class="comp-name">${comp.name}</h4>
               <div class="comp-btns">
                <button class="comp-btn comp-edit">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="comp-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button class="comp-btn comp-delete">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="comp-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
               </div>
              <div class="front-part">
              <ul class="tier-list">
              ${comp.champions
                .map(
                  ({ champKey, role }) => `
                    <li class="champ ${role}" data-champ-key="${champKey}">
                      <span class="role">${role}</span>
                      <img src="${comp.championsIconMap[champKey]}" class="champ-logo">
                    </li>
                  `
                )
                .join('')}
              </ul>
              <p class="game-plan">
                <strong>${comp.type.toUpperCase()} COMPOSITION</strong> <br>
               <strong>Identity:</strong> Teamfight oriented <br>
               <strong>Game Plan:</strong> Scale early game, teamfight at objectives as 5 <br>
                <strong>Win Conditions:</strong> Team fighting with ultimates, wombo combo 
              </p>
              </div>
              <div class="details">
                <ul class="statistics">
                    <li class="stat">Damage: 10</li>
                    <li class="stat">Range:  10</li>
                    <li class="stat">Mobility:  10</li>
                    <li class="stat">Durability:  10</li>
                    <li class="stat">Utility:  10</li>
                    <li class="stat">Controls:  10</li>
                  </ul>
                
                <div class="synergies">
                 <p class="champ-comp-syn">
                 <strong>Classes Synergy:</strong> A
                 </p>
                 <p class="bot-syn">
                   <strong>Bot-lane Synergy: </strong> A
                  </p>
                  <p class="jungle-syn">
                   
                   <strong>Gank Top:</strong> A<br><strong>Gank Mid:</strong> B<br><strong>Gank Bot:</strong> S 
                  </p>
                </div>
              </div>
  `;

    compList.insertBefore(li, compList.firstChild);
    this._bindCompositionActions(li);
  }

  _bindCompositionActions(li) {
    const deleteBtn = li.querySelector('.comp-delete');
    const editBtn = li.querySelector('.comp-edit');

    // DELETE
    deleteBtn.addEventListener('click', () => {
      const confirmDelete = confirm(
        `Sei sicuro di voler eliminare la composition "${
          li.querySelector('.comp-name').textContent
        }"?`
      );

      if (!confirmDelete) return;

      li.remove();
    });

    // EDIT (per il futuro)
    editBtn.addEventListener('click', () => {
      this._enterEditMode(li);
    });
  }

  _enterEditMode(li) {
    if (li.classList.contains('editing')) return;
    li.classList.add('editing');

    // ====== 1. TRASFORMA IL TITOLO IN INPUT ======
    const nameEl = li.querySelector('.comp-name');
    const oldName = nameEl.textContent.trim();
    nameEl.innerHTML = `<input type="text" class="comp-name-input" value="${oldName}">`;

    // ====== 2. TRASFORMARE IL TIPO DI COMPOSIZIONE in select ======
    const gamePlanEl = li.querySelector('.game-plan strong');
    const oldType = gamePlanEl.textContent
      .replace(' COMPOSITION', '')
      .toLowerCase();

    const selectHtml = `
    <select class="comp-type-select-edit">
      <option value="charge" ${
        oldType === 'charge' ? 'selected' : ''
      }>Charge</option>
      <option value="catch" ${
        oldType === 'catch' ? 'selected' : ''
      }>Catch</option>
      <option value="protect" ${
        oldType === 'protect' ? 'selected' : ''
      }>Protect</option>
      <option value="siege" ${
        oldType === 'siege' ? 'selected' : ''
      }>Siege</option>
      <option value="split" ${
        oldType === 'split' ? 'selected' : ''
      }>Split</option>
    </select>
  `;

    gamePlanEl.outerHTML = selectHtml;

    // ====== 3. Altri binding (champ slots, bottoni save/cancel) ======
    const btns = li.querySelector('.comp-btns');
    btns.innerHTML = `
    <button class="comp-btn save-btn">…</button>
    <button class="comp-btn comp-delete">…</button>
  `;

    // Binding dei save/cancel
    btns
      .querySelector('.save-btn')
      .addEventListener('click', () => this._saveEdit(li));
    btns
      .querySelector('.comp-delete')
      .addEventListener('click', () => this._cancelEdit(li, oldName));
  }

  _saveEdit(li) {
    const compData = this._extractCompData(li);

    // Aggiorniamo il game-plan
    const gamePlanEl = li.querySelector('.game-plan');
    const type = compData.type.toUpperCase();
    gamePlanEl.innerHTML = `
    <strong>${type} COMPOSITION</strong> <br>
    <strong>Identity:</strong> Teamfight oriented <br>
    <strong>Game Plan:</strong> Scale early game, teamfight at objectives as 5 <br>
    <strong>Win Conditions:</strong> Team fighting with ultimates, wombo combo
  `;

    // Ripristino nome e bottoni
    const nameEl = li.querySelector('.comp-name');
    nameEl.textContent = compData.name;

    const btns = li.querySelector('.comp-btns');
    btns.innerHTML = `
    <button class="comp-btn comp-edit">…</button>
    <button class="comp-btn comp-delete">…</button>
  `;

    this._bindCompositionActions(li);
    li.classList.remove('editing');
  }

  _cancelEdit(li, oldName) {
    li.classList.remove('editing');

    // Ripristino nome
    li.querySelector('.comp-name').textContent = oldName;

    // Ripristino bottoni edit/delete
    const btns = li.querySelector('.comp-btns');
    btns.innerHTML = `
       <button class="comp-btn comp-edit">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="comp-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button class="comp-btn comp-delete">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="comp-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
  `;

    this._bindCompositionActions(li);

    console.log('Modifica annullata');
  }
}
