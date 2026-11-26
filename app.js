var currentTab = 'catalog';
var currentSigilFilter = 'normal'; 
var ownedDragons = []; 
var ownedSigils = [];  

// ==== СИСТЕМА СОХРАНЕНИЯ ====
function saveData() {
    var dataToSave = {
        dragons: ownedDragons,
        sigils: ownedSigils
    };
    try {
        localStorage.setItem('dml_app_data', JSON.stringify(dataToSave));
    } catch (e) {
        console.log('Ошибка сохранения: ', e);
    }
}

function loadData() {
    try {
        var saved = localStorage.getItem('dml_app_data');
        if (saved) {
            var data = JSON.parse(saved);
            ownedDragons = data.dragons || [];
            ownedSigils = data.sigils || [];
        }
    } catch (e) {
        console.log('Ошибка загрузки: ', e);
    }
}

// Загружаем данные при старте
loadData();

var listContainer = document.getElementById('listContainer');
var searchInput = document.getElementById('searchInput');
var totalCountEl = document.getElementById('totalCount');
var ownedCountEl = document.getElementById('ownedCount');
var sigilFilters = document.getElementById('sigilFilters');

// ==== КНОПКА СБРОСА ====
document.getElementById('resetBtn').onclick = function() {
    if (confirm('Вы уверены, что хотите полностью удалить весь прогресс (драконов и символы)?')) {
        ownedDragons = [];
        ownedSigils = [];
        localStorage.removeItem('dml_app_data');
        render();
    }
};

// ==== ОСНОВНАЯ ЛОГИКА ====
function updateCounters() {
    var totalKinds = (currentTab === 'sigils') ? sigilsDB.length : dragonsDB.length;
    var totalPieces = 0;
    
    if (currentTab === 'sigils') {
        for (var i = 0; i < ownedSigils.length; i++) totalPieces += ownedSigils[i].count;
    } else {
        for (var j = 0; j < ownedDragons.length; j++) totalPieces += ownedDragons[j].count;
    }

    totalCountEl.textContent = totalKinds;
    ownedCountEl.textContent = totalPieces;
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-catalog').classList.remove('active');
    document.getElementById('tab-inventory').classList.remove('active');
    document.getElementById('tab-sigils').classList.remove('active');
    
    if (tab === 'catalog') document.getElementById('tab-catalog').classList.add('active');
    if (tab === 'inventory') document.getElementById('tab-inventory').classList.add('active');
    if (tab === 'sigils') document.getElementById('tab-sigils').classList.add('active');
    
    if (tab === 'sigils') {
        sigilFilters.style.display = 'flex';
        setSigilFilter('normal');
    } else {
        sigilFilters.style.display = 'none';
        searchInput.value = '';
        render();
    }
}

function setSigilFilter(filter) {
    currentSigilFilter = filter;
    document.getElementById('f-normal').classList.remove('active');
    document.getElementById('f-element').classList.remove('active');
    
    if (filter === 'normal') document.getElementById('f-normal').classList.add('active');
    if (filter === 'element') document.getElementById('f-element').classList.add('active');
    
    render();
}

function getOwnedDragon(name) {
    for (var i = 0; i < ownedDragons.length; i++) {
        if (ownedDragons[i].name === name) return ownedDragons[i];
    }
    return null;
}

function getOwnedSigil(name) {
    for (var i = 0; i < ownedSigils.length; i++) {
        if (ownedSigils[i].name === name) return ownedSigils[i];
    }
    return null;
}

function toggleDragon(name) {
    var obj = getOwnedDragon(name);
    if (obj) {
        var index = ownedDragons.indexOf(obj);
        ownedDragons.splice(index, 1);
    } else {
        ownedDragons.push({ name: name, level: "", enchant: "", sigil1: "", sigil2: "", sigil3: "", count: 1 });
    }
    saveData(); // СОХРАНЯЕМ
    render();
}

function changeDragonCount(name, delta) {
    var obj = getOwnedDragon(name);
    if (!obj) {
        if (delta > 0) {
            ownedDragons.push({ name: name, level: "", enchant: "", sigil1: "", sigil2: "", sigil3: "", count: 1 });
        }
    } else {
        obj.count += delta;
        if (obj.count <= 0) {
            var index = ownedDragons.indexOf(obj);
            ownedDragons.splice(index, 1);
        }
    }
    saveData(); // СОХРАНЯЕМ
    render();
}

function changeSigilCount(name, delta) {
    var obj = getOwnedSigil(name);
    if (!obj) {
        if (delta > 0) {
            ownedSigils.push({ name: name, rarity: "common", count: 1 });
        }
    } else {
        obj.count += delta;
        if (obj.count <= 0) {
            var index = ownedSigils.indexOf(obj);
            ownedSigils.splice(index, 1);
        }
    }
    saveData(); // СОХРАНЯЕМ
    render();
}

function changeSigilRarity(name, newRarity) {
    var sigil = getOwnedSigil(name);
    if (sigil) {
        sigil.rarity = newRarity;
        saveData(); // СОХРАНЯЕМ
        render();
    }
}

function createSigilSelect(ownedObj, sigilType, fieldName) {
    var s = document.createElement('select');
    s.innerHTML = '<option value="">-- нет --</option>';
    
    for (var i = 0; i < ownedSigils.length; i++) {
        var sig = ownedSigils[i];
        var dbInfo = null;
        for (var j = 0; j < sigilsDB.length; j++) {
            if (sigilsDB[j].name === sig.name) { dbInfo = sigilsDB[j]; break; }
        }
        
        if (dbInfo && dbInfo.type === sigilType) {
            var opt = document.createElement('option');
            opt.value = sig.name;
            opt.textContent = sig.name;
            if (ownedObj[fieldName] === sig.name) opt.selected = true;
            s.appendChild(opt);
        }
    }
    return s;
}

function createDragonCard(dragon) {
    var ownedObj = getOwnedDragon(dragon.name);
    var isOwned = !!ownedObj;
    var count = isOwned ? ownedObj.count : 0;
    
    var card = document.createElement('div');
    card.className = 'card' + (isOwned ? ' owned' : '');
    
    var top = document.createElement('div');
    top.className = 'card-top';
    
    if (currentTab === 'inventory') {
        var box = document.createElement('div');
        box.className = 'counter-box';
        
        var btnMinus = document.createElement('button');
        btnMinus.className = 'counter-btn';
        btnMinus.textContent = '−';
        btnMinus.onclick = function(e) { e.stopPropagation(); changeDragonCount(dragon.name, -1); };
        
        var val = document.createElement('div');
        val.className = 'counter-val';
        val.textContent = count;
        
        var btnPlus = document.createElement('button');
        btnPlus.className = 'counter-btn';
        btnPlus.textContent = '+';
        btnPlus.onclick = function(e) { e.stopPropagation(); changeDragonCount(dragon.name, 1); };
        
        box.appendChild(btnMinus);
        box.appendChild(val);
        box.appendChild(btnPlus);
        top.appendChild(box);
    } else {
        var btn = document.createElement('button');
        btn.className = 'toggle-btn';
        btn.innerHTML = isOwned ? '✓' : '';
        btn.onclick = function(e) { e.stopPropagation(); toggleDragon(dragon.name); };
        top.appendChild(btn);
    }
    
    var info = document.createElement('div');
    info.className = 'info';
    
    var nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = dragon.name;
    
    var elemDiv = document.createElement('div');
    elemDiv.className = 'elements';
    elemDiv.textContent = dragon.elements;
    
    info.appendChild(nameDiv);
    info.appendChild(elemDiv);
    top.appendChild(info);
    
    var badge = document.createElement('div');
    badge.className = 'badge ' + dragon.rarity;
    if (dragon.rarity === 'legendary') badge.textContent = 'Легенда';
    else if (dragon.rarity === 'epic') badge.textContent = 'Эпик';
    else if (dragon.rarity === 'rare') badge.textContent = 'Редкий';
    else badge.textContent = 'Обычный';
    top.appendChild(badge);
    
    card.appendChild(top);

    if (currentTab === 'inventory' && isOwned) {
        var panel = document.createElement('div');
        panel.className = 'input-panel';
        
        var g1 = document.createElement('div'); g1.className = 'input-group';
        var l1 = document.createElement('label'); l1.textContent = 'Уровень (1-135)';
        var i1 = document.createElement('input'); i1.type = 'number'; i1.min = '1'; i1.max = '135'; i1.value = ownedObj.level;
        i1.oninput = function() { if (this.value > 135) this.value = 135; ownedObj.level = this.value; saveData(); };
        g1.appendChild(l1); g1.appendChild(i1);
        
        var g2 = document.createElement('div'); g2.className = 'input-group';
        var l2 = document.createElement('label'); l2.textContent = 'Зачар. (0-12)';
        var i2 = document.createElement('input'); i2.type = 'number'; i2.min = '0'; i2.max = '12'; i2.value = ownedObj.enchant;
        i2.oninput = function() { if (this.value > 12) this.value = 12; ownedObj.enchant = this.value; saveData(); };
        g2.appendChild(l2); g2.appendChild(i2);
        
        panel.appendChild(g1); panel.appendChild(g2);
        card.appendChild(panel);
        
        var sigilPanel1 = document.createElement('div');
        sigilPanel1.className = 'input-panel';
        sigilPanel1.style.marginTop = '5px';
        
        var sg1 = document.createElement('div'); sg1.className = 'input-group';
        var sl1 = document.createElement('label'); sl1.textContent = 'Символ 1 (обычный)';
        var s1 = createSigilSelect(ownedObj, 'normal', 'sigil1');
        var dot1 = document.createElement('span'); dot1.className = 'rarity-dot';
        if (ownedObj.sigil1) {
            var ts1 = getOwnedSigil(ownedObj.sigil1);
            if (ts1) dot1.classList.add(ts1.rarity);
        }
        s1.onchange = function() {
            ownedObj.sigil1 = this.value;
            if (this.value) {
                var ts = getOwnedSigil(this.value);
                dot1.className = 'rarity-dot ' + (ts ? ts.rarity : '');
            } else { dot1.className = 'rarity-dot'; }
            saveData(); // СОХРАНЯЕМ
        };
        sg1.appendChild(sl1);
        var w1 = document.createElement('div'); w1.style.display = 'flex'; w1.style.alignItems = 'center'; w1.style.gap = '5px';
        w1.appendChild(s1); w1.appendChild(dot1); sg1.appendChild(w1);
        
        var sg2 = document.createElement('div'); sg2.className = 'input-group';
        var sl2 = document.createElement('label'); sl2.textContent = 'Символ 2 (обычный)';
        var s2 = createSigilSelect(ownedObj, 'normal', 'sigil2');
        var dot2 = document.createElement('span'); dot2.className = 'rarity-dot';
        if (ownedObj.sigil2) {
            var ts2 = getOwnedSigil(ownedObj.sigil2);
            if (ts2) dot2.classList.add(ts2.rarity);
        }
        s2.onchange = function() {
            ownedObj.sigil2 = this.value;
            if (this.value) {
                var ts = getOwnedSigil(this.value);
                dot2.className = 'rarity-dot ' + (ts ? ts.rarity : '');
            } else { dot2.className = 'rarity-dot'; }
            saveData(); // СОХРАНЯЕМ
        };
        sg2.appendChild(sl2);
        var w2 = document.createElement('div'); w2.style.display = 'flex'; w2.style.alignItems = 'center'; w2.style.gap = '5px';
        w2.appendChild(s2); w2.appendChild(dot2); sg2.appendChild(w2);
        
        sigilPanel1.appendChild(sg1); sigilPanel1.appendChild(sg2);
        card.appendChild(sigilPanel1);
        
        var sigilPanel2 = document.createElement('div');
        sigilPanel2.className = 'input-panel';
        sigilPanel2.style.marginTop = '5px';
        
        var sg3 = document.createElement('div'); sg3.className = 'input-group';
        var sl3 = document.createElement('label'); sl3.textContent = 'Символ 3 (стихия)';
        var s3 = createSigilSelect(ownedObj, 'element', 'sigil3');
        var dot3 = document.createElement('span'); dot3.className = 'rarity-dot';
        if (ownedObj.sigil3) {
            var ts3 = getOwnedSigil(ownedObj.sigil3);
            if (ts3) dot3.classList.add(ts3.rarity);
        }
        s3.onchange = function() {
            ownedObj.sigil3 = this.value;
            if (this.value) {
                var ts = getOwnedSigil(this.value);
                dot3.className = 'rarity-dot ' + (ts ? ts.rarity : '');
            } else { dot3.className = 'rarity-dot'; }
            saveData(); // СОХРАНЯЕМ
        };
        sg3.appendChild(sl3);
        var w3 = document.createElement('div'); w3.style.display = 'flex'; w3.style.alignItems = 'center'; w3.style.gap = '5px';
        w3.appendChild(s3); w3.appendChild(dot3); sg3.appendChild(w3);
        
        sigilPanel2.appendChild(sg3);
        card.appendChild(sigilPanel2);
    }
    
    return card;
}

function createSigilCard(sigil) {
    var ownedObj = getOwnedSigil(sigil.name);
    var isOwned = !!ownedObj;
    var count = isOwned ? ownedObj.count : 0;
    
    var card = document.createElement('div');
    card.className = 'card' + (isOwned ? ' owned' : '');
    
    var top = document.createElement('div');
    top.className = 'card-top';
    
    var box = document.createElement('div');
    box.className = 'counter-box';
    
    var btnMinus = document.createElement('button');
    btnMinus.className = 'counter-btn';
    btnMinus.textContent = '−';
    btnMinus.onclick = function() { changeSigilCount(sigil.name, -1); };
    
    var val = document.createElement('div');
    val.className = 'counter-val';
    val.textContent = count;
    
    var btnPlus = document.createElement('button');
    btnPlus.className = 'counter-btn';
    btnPlus.textContent = '+';
    btnPlus.onclick = function() { changeSigilCount(sigil.name, 1); };
    
    box.appendChild(btnMinus);
    box.appendChild(val);
    box.appendChild(btnPlus);
    top.appendChild(box);
    
    var info = document.createElement('div');
    info.className = 'info';
    
    var nameRow = document.createElement('div');
    nameRow.className = 'name-row';
    
    var nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.textContent = sigil.name;
    nameRow.appendChild(nameDiv);
    
    if (isOwned) {
        var dot = document.createElement('span');
        dot.className = 'rarity-dot ' + ownedObj.rarity;
        nameRow.appendChild(dot);
    }
    
    var typeBadge = document.createElement('span');
    typeBadge.className = 'sigil-type ' + (sigil.type === 'element' ? 'element' : '');
    typeBadge.textContent = sigil.type === 'element' ? 'Стихия' : 'Обычный';
    nameRow.appendChild(typeBadge);
    
    var descDiv = document.createElement('div');
    descDiv.className = 'sigil-desc';
    descDiv.textContent = sigil.desc;
    
    info.appendChild(nameRow);
    info.appendChild(descDiv);
    top.appendChild(info);
    card.appendChild(top);

    if (isOwned) {
        var panel = document.createElement('div');
        panel.className = 'input-panel';
        panel.style.marginTop = '5px';
        
        var g = document.createElement('div');
        g.className = 'input-group';
        var l = document.createElement('label');
        l.textContent = 'Редкость (уровень) символа:';
        var select = document.createElement('select');
        select.innerHTML = `
            <option value="common">⚪ Обычный</option>
            <option value="uncommon">🟢 Необычный</option>
            <option value="rare">🔵 Редкий</option>
            <option value="epic">🟡 Эпический</option>
            <option value="legendary">🟣 Легендарный</option>
        `;
        select.value = ownedObj.rarity;
        select.onchange = function() {
            changeSigilRarity(sigil.name, this.value);
        };
        g.appendChild(l);
        g.appendChild(select);
        panel.appendChild(g);
        card.appendChild(panel);
    }
    
    return card;
}

function render() {
    var filter = searchInput.value.toLowerCase().trim();
    listContainer.innerHTML = '';
    var count = 0;
    
    if (currentTab === 'sigils') {
        for (var i = 0; i < sigilsDB.length; i++) {
            var sig = sigilsDB[i];
            if (sig.type !== currentSigilFilter) continue;
            if (filter !== '' && sig.name.toLowerCase().indexOf(filter) === -1) continue;
            listContainer.appendChild(createSigilCard(sig));
            count++;
        }
    } else {
        for (var j = 0; j < dragonsDB.length; j++) {
            var dragon = dragonsDB[j];
            var isOwned = !!getOwnedDragon(dragon.name);
            
            if (currentTab === 'inventory' && !isOwned) continue;
            
            if (filter !== '') {
                var matchName = dragon.name.toLowerCase().indexOf(filter) !== -1;
                var matchElem = dragon.elements.toLowerCase().indexOf(filter) !== -1;
                if (!matchName && !matchElem) continue;
            }
            
            listContainer.appendChild(createDragonCard(dragon));
            count++;
        }
    }
    
    if (count === 0) {
        var emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.color = '#aaa';
        emptyMsg.style.padding = '20px';
        emptyMsg.textContent = currentTab === 'inventory' ? 'Пусто. Добавьте драконов в Каталоге.' : 'Ничего не найдено.';
        listContainer.appendChild(emptyMsg);
    }
    
    updateCounters();
}

searchInput.oninput = function() { render(); };

// Старт
render();