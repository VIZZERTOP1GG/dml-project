// ===== БАЗА ДРАКОНОВ =====
var dragonsDB = [
    { name: "Ivory Dragon", elements: "Земля, Свет, Вода", rarity: "epic" },
    { name: "Elephant Dragon", elements: "Земля, Огонь, Ветер", rarity: "epic" },
    { name: "Lava Dragon", elements: "Земля, Огонь", rarity: "common" },
    { name: "Fire Dragon", elements: "Огонь", rarity: "common" },
    { name: "Wind Dragon", elements: "Ветер", rarity: "common" },
    { name: "Earth Dragon", elements: "Земля", rarity: "common" },
    { name: "Water Dragon", elements: "Вода", rarity: "common" }
];

// ===== БАЗА СИМВОЛОВ =====
// type: 'normal' (обычный) или 'element' (стихийный)
var sigilsDB = [
    { name: "Берсерк", desc: "Увеличивает урон", type: "normal" },
    { name: "Чистота", desc: "Урон от здоровья", type: "normal" },
    { name: "Чудо", desc: "Усиливает лечение", type: "normal" },
    { name: "Принятие", desc: "Усиливает баффы", type: "normal" },
    { name: "Колдовство", desc: "Усиливает дебаффы", type: "normal" },
    { name: "Черепаха", desc: "Снижает урон по площади", type: "normal" },
    { name: "Ярость", desc: "Урон при низком HP", type: "normal" },
    // Названия обновлены (убрано "(стихия)")
    { name: "Огонь", desc: "Бонус к огненному урону", type: "element" },
    { name: "Вода", desc: "Бонус к водному урону", type: "element" },
    { name: "Земля", desc: "Бонус к земляному урону", type: "element" },
    { name: "Свет", desc: "Бонус к светлому урону", type: "element" }
];