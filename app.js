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

// ===== ГЕНЕРАТОР SVG-ИКОНОК (СТИЛИЗОВАННЫХ ПОД ИГРУ) =====
function getElementSVG(name) {
    // Базовые настройки для всех иконок
    var base = 'viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"';
    
    var svgs = {
        // Огонь: Языки пламени, красно-оранжевые
        "Огонь": '<svg ' + base + '><path d="M50 10 C30 40 25 55 35 70 C40 80 50 85 50 95 C50 85 60 80 65 70 C75 55 70 40 50 10 Z" fill="#ff5722"/><path d="M50 35 C40 55 40 65 45 75 C48 82 50 85 50 90 C50 85 52 82 55 75 C60 65 60 55 50 35 Z" fill="#ffeb3b"/></svg>',
        
        // Вода: Капля с бликом, сине-голубая
        "Вода": '<svg ' + base + '><path d="M50 10 C50 10 20 50 20 70 C20 85 33 95 50 95 C67 95 80 85 80 70 C80 50 50 10 50 10 Z" fill="#2196f3"/><path d="M40 65 C40 75 45 82 50 85 C55 82 60 75 60 65 C60 60 55 55 50 55 C45 55 40 60 40 65 Z" fill="#bbdefb" opacity="0.6"/></svg>',
        
        // Земля: Скала/гора, коричнево-зелёная
        "Земля": '<svg ' + base + '><path d="M10 90 L40 40 L60 70 L75 45 L90 90 Z" fill="#795548"/><path d="M10 90 L40 40 L50 55 L35 75 Z" fill="#5d4037"/><path d="M40 40 L60 70 L55 75 L45 55 Z" fill="#8d6e63"/></svg>',
        
        // Растение: Лист с прожилками, зелёный
        "Растение": '<svg ' + base + '><path d="M50 90 C50 90 20 80 20 40 C20 20 40 10 50 10 C60 10 80 20 80 40 C80 80 50 90 50 90 Z" fill="#4caf50"/><path d="M50 90 L50 50" stroke="#1b5e20" stroke-width="3" fill="none"/><path d="M50 70 L35 60 M50 60 L65 50 M50 50 L35 40" stroke="#1b5e20" stroke-width="2" fill="none"/></svg>',
        
        // Металл: Шестиугольник/гайка, серый
        "Металл": '<svg ' + base + '><polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#9e9e9e"/><polygon points="50,25 75,40 75,60 50,75 25,60 25,40" fill="#616161"/><circle cx="50" cy="50" r="10" fill="#e0e0e0"/></svg>',
        
        // Энергия: Молния, жёлтая
        "Энергия": '<svg ' + base + '><path d="M60 10 L20 55 L45 55 L35 90 L80 45 L55 45 L60 10 Z" fill="#ffeb3b"/><path d="M60 10 L20 55 L45 55 L35 90 L80 45 L55 45 L60 10 Z" fill="none" stroke="#fbc02d" stroke-width="2"/></svg>',
        
        // Пустота: Тёмный портал/водоворот, фиолетово-чёрный
        "Пустота": '<svg ' + base + '><circle cx="50" cy="50" r="40" fill="#311b92"/><circle cx="50" cy="50" r="30" fill="#1a1a2e"/><path d="M50 20 A30 30 0 0 1 80 50 A25 25 0 0 1 55 75 A20 20 0 0 1 35 55 A15 15 0 0 1 50 40" fill="none" stroke="#7c4dff" stroke-width="4"/></svg>',
        
        // Свет: Солнце с лучами, жёлто-белый
        "Свет": '<svg ' + base + '><circle cx="50" cy="50" r="20" fill="#fff9c4"/><path d="M50 5 L50 25 M50 75 L50 95 M5 50 L25 50 M75 50 L95 50 M18 18 L32 32 M68 68 L82 82 M18 82 L32 68 M68 32 L82 18" stroke="#ffeb3b" stroke-width="5" stroke-linecap="round"/></svg>',
        
        // Тень: Луна/полумесяц, тёмно-фиолетовый
        "Тень": '<svg ' + base + '><path d="M50 10 A40 40 0 1 0 50 90 A30 30 0 1 1 50 10 Z" fill="#4a148c"/><circle cx="65" cy="40" r="5" fill="#9c27b0"/><circle cx="70" cy="60" r="3" fill="#9c27b0"/></svg>',
        
        // Ветер: Закрученные линии, голубой
        "Ветер": '<svg ' + base + '><path d="M20 40 Q50 20 80 40 Q60 60 30 60 Q70 70 80 80" fill="none" stroke="#80deea" stroke-width="6" stroke-linecap="round"/><path d="M15 55 Q45 45 70 55" fill="none" stroke="#4dd0e1" stroke-width="4" stroke-linecap="round"/></svg>',
        
        // Особые стихии (стилизованные)
        "Призма": '<svg ' + base + '><polygon points="50,10 90,90 10,90" fill="none" stroke="url(#rainbow)" stroke-width="8"/><defs><linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff0000"/><stop offset="20%" stop-color="#ff9800"/><stop offset="40%" stop-color="#ffeb3b"/><stop offset="60%" stop-color="#4caf50"/><stop offset="80%" stop-color="#2196f3"/><stop offset="100%" stop-color="#9c27b0"/></linearGradient></defs></svg>',
        
        "Тиран": '<svg ' + base + '><path d="M50 15 C30 15 20 30 20 45 C20 55 25 60 30 65 L30 80 C30 85 35 90 50 90 C65 90 70 85 70 80 L70 65 C75 60 80 55 80 45 C80 30 70 15 50 15 Z" fill="#b71c1c"/><circle cx="35" cy="40" r="5" fill="#ffeb3b"/><circle cx="65" cy="40" r="5" fill="#ffeb3b"/><path d="M40 55 L50 65 L60 55" fill="none" stroke="#ffeb3b" stroke-width="3"/></svg>',
        
        // Заглушка
        "Default": '<svg ' + base + '><circle cx="50" cy="50" r="40" fill="#555"/><text x="50" y="60" text-anchor="middle" fill="#fff" font-size="30">?</text></svg>'
    };
    
    return svgs[name] || svgs["Default"];
}