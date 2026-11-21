
/* =================================
   VIDA RPG - SISTEMA PRINCIPAL
================================= */

// 1. DATOS DEL PERSONAJE

const defaultPlayer = {
    name: "FernanJC",
    level: 1,
    xp: 0,
    totalXP: 0,
    gold: 100,

    stats: {
        strength: 5,
        intelligence: 5,
        discipline: 5
    },

    completed: [],
    inventory: [],
    activities: [],
    claimedOccurrences: []
};


// 2. GUARDAR Y RECUPERAR PROGRESO

function loadGame() {
    const saved = localStorage.getItem("vidaRPG");

    if (saved) {
        try {
            const data = JSON.parse(saved);

            return {
                ...defaultPlayer,
                ...data,
                stats: {
                    ...defaultPlayer.stats,
                    ...(data.stats || {})
                },
                completed: Array.isArray(data.completed)
                    ? data.completed : [],
                inventory: Array.isArray(data.inventory)
                    ? data.inventory : [],
                activities: Array.isArray(data.activities)
                    ? data.activities : [],
                claimedOccurrences: Array.isArray(data.claimedOccurrences)
                    ? data.claimedOccurrences : []

            };
        } catch (error) {
            console.error("Error al recuperar la partida:", error);
        }
    }

    return { ...defaultPlayer };
}

let player = loadGame();

// Asegurar que las partidas anteriores tengan los nuevos datos.
player.activities = Array.isArray(player.activities)
    ? player.activities
    : [];

player.claimedOccurrences = Array.isArray(player.claimedOccurrences)
    ? player.claimedOccurrences
    : [];


function saveGame() {
    localStorage.setItem("vidaRPG", JSON.stringify(player));
}


// 3. LISTA DE MISIONES

const missions = [
    {
        id: 1,
        title: "Entrenamiento físico",
        description: "Realiza 20 minutos de ejercicio.",
        reward: 30,
        gold: 10,
        stat: "strength",
        icon: "💪"
    },

    {
        id: 2,
        title: "Aprendiz del conocimiento",
        description: "Estudia durante 30 minutos.",
        reward: 40,
        gold: 15,
        stat: "intelligence",
        icon: "📚"
    },

    {
        id: 3,
        title: "Disciplina de acero",
        description: "Completa una tarea pendiente.",
        reward: 25,
        gold: 10,
        stat: "discipline",
        icon: "🔥"
    },

    {
        id: 4,
        title: "Mente activa",
        description: "Aprende algo nuevo durante 20 minutos.",
        reward: 35,
        gold: 12,
        stat: "intelligence",
        icon: "🧠"
    },

    {
        id: 5,
        title: "Guerrero incansable",
        description: "Realiza una actividad física adicional.",
        reward: 50,
        gold: 20,
        stat: "strength",
        icon: "⚔"
    }
];


// 4. LISTA DE LOGROS

const achievements = [
    {
        id: "first",
        title: "Primera aventura",
        description: "Completa tu primera misión.",
        icon: "🏆",
        condition: () => player.completed.length + player.claimedOccurrences.length >= 1
    },

    {
        id: "five",
        title: "Aventurero constante",
        description: "Completa 5 misiones.",
        icon: "⚔️",
        condition: () => player.completed.length + player.claimedOccurrences.length >= 5
    },

    {
        id: "level5",
        title: "Poder creciente",
        description: "Alcanza el nivel 5.",
        icon: "👑",
        condition: () => player.level >= 5
    },

    {
        id: "rich",
        title: "Pequeña fortuna",
        description: "Consigue 200 monedas.",
        icon: "💰",
        condition: () => player.gold >= 200
    }
];


// 5. TIENDA DE OBJETOS

const shopItems = [
    {
        id: "sword",
        title: "Espada de entrenamiento",
        description: "Una espada para comenzar tu aventura.",
        icon: "🗡️",
        price: 50
    },

    {
        id: "book",
        title: "Libro del conocimiento",
        description: "Un objeto para el aprendiz.",
        icon: "📖",
        price: 70
    },

    {
        id: "potion",
        title: "Poción de energía",
        description: "Una recompensa para tu inventario.",
        icon: "🧪",
        price: 35
    },

    {
        id: "shield",
        title: "Escudo del principiante",
        description: "Un escudo para proteger tu aventura.",
        icon: "🛡️",
        price: 90
    }
];


// 6. CAMBIAR ENTRE SECCIONES

const menuButtons = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".page-section");

function showSection(sectionId) {

    sections.forEach(section => {
        section.classList.toggle(
            "active",
            section.id === sectionId
        );
    });

    menuButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.section === sectionId
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

menuButtons.forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.section);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showSection(button.dataset.go);
    });
});


// 7. COMPLETAR MISIONES

function completeMission(id) {

    const mission = missions.find(item => item.id === id);

    if (!mission) return;

    if (player.completed.includes(id)) {
        return;
    }

    player.completed.push(id);

    // Ganar experiencia
    player.xp += mission.reward;
    player.totalXP += mission.reward;

    // Ganar monedas
    player.gold += mission.gold;

    // Mejorar estadística correspondiente
    player.stats[mission.stat] += 1;

    // Revisar si sube de nivel
    checkLevelUp();

    // Guardar progreso
    saveGame();

    // Actualizar pantalla
    renderGame();
}


// 8. SISTEMA DE NIVELES

function checkLevelUp() {

    while (player.xp >= player.level * 100) {

        const requiredXP = player.level * 100;

        player.xp -= requiredXP;
        player.level++;

        // Recompensa por subir de nivel
        player.gold += 25;

        console.log("¡Nuevo nivel alcanzado!");
    }
}


// 9. MOSTRAR MISIONES

function renderMissions() {

    const dashboard = document.getElementById("dashboardMissions");
    const allMissions = document.getElementById("allMissions");

    dashboard.innerHTML = "";
    allMissions.innerHTML = "";

    missions.forEach(mission => {

        const completed = player.completed.includes(mission.id);

        const html = `
            <div class="mission-card">

                <div>
                    <h4>${mission.icon} ${mission.title}</h4>

                    <p>${mission.description}</p>

                    <div class="mission-reward">
                        ⚡ ${mission.reward} XP
                        &nbsp; 🪙 ${mission.gold} monedas
                    </div>
                </div>

                <button
                    class="complete-btn"
                    data-mission="${mission.id}"
                    ${completed ? "disabled" : ""}
                >
                    ${completed ? "✓ Completada" : "Completar"}
                </button>

            </div>
        `;

        allMissions.innerHTML += html;
    });

    // En el dashboard mostramos solo las primeras 3
    missions.slice(0, 3).forEach(mission => {

        const completed = player.completed.includes(mission.id);

        dashboard.innerHTML += `
            <div class="mission-card">

                <div>
                    <h4>${mission.icon} ${mission.title}</h4>
                    <p>${mission.description}</p>

                    <div class="mission-reward">
                        ⚡ ${mission.reward} XP
                    </div>
                </div>

                <button
                    class="complete-btn"
                    data-mission="${mission.id}"
                    ${completed ? "disabled" : ""}
                >
                    ${completed ? "✓ Listo" : "Completar"}
                </button>

            </div>
        `;
    });

    // Activar botones de misiones
    document.querySelectorAll("[data-mission]").forEach(button => {

        button.addEventListener("click", () => {
            completeMission(Number(button.dataset.mission));
        });

    });
}


// 10. MOSTRAR ESTADÍSTICAS

function renderStats() {

    const setText = (id, value) => {
        document.getElementById(id).textContent = value;
    };

    setText("level", `Nivel ${player.level}`);
    setText("heroLevel", String(player.level).padStart(2, "0"));

    setText("xpText", `${player.xp} / ${player.level * 100} XP`);

    setText("totalXP", `${player.totalXP} XP`);
    setText("statsXP", player.totalXP);

    setText("strength", player.stats.strength);
    setText("intelligence", player.stats.intelligence);
    setText("discipline", player.stats.discipline);

    setText("statsStrength", player.stats.strength);
    setText("statsIntelligence", player.stats.intelligence);
    setText("statsDiscipline", player.stats.discipline);

    const percentage = (player.xp / (player.level * 100)) * 100;

    document.getElementById("xpProgress").style.width =
        `${percentage}%`;

    setText(
        "completedMissions",
        player.completed.length + player.claimedOccurrences.length
    );

    setText(
        "unlockedAchievements",
        achievements.filter(item => item.condition()).length
    );

    setText("itemsCount", player.inventory.length);

    setText("gold", player.gold);
    setText("shopGold", player.gold);

    setText(
        "statsSummary",
        `${player.name} ha alcanzado el nivel ${player.level}, `
        + `acumulando ${player.totalXP} puntos de experiencia `
        + `y completando ${player.completed.length} misiones.`
    );
}


// 11. MOSTRAR LOGROS

function renderAchievements() {

    const container = document.getElementById("achievementList");

    container.innerHTML = "";

    achievements.forEach(achievement => {

        const unlocked = achievement.condition();

        container.innerHTML += `
            <div class="achievement-card ${unlocked ? "" : "locked"}">

                <div class="item-icon">
                    ${achievement.icon}
                </div>

                <h3>${achievement.title}</h3>

                <p>${achievement.description}</p>

                <p style="margin-top:12px">
                    ${unlocked ? "✓ Desbloqueado" : "🔒 Bloqueado"}
                </p>

            </div>
        `;
    });
}


// 12. INVENTARIO

function renderInventory() {

    const container = document.getElementById("inventoryList");

    container.innerHTML = "";

    if (player.inventory.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                🎒 Tu inventario está vacío.
                <br><br>
                Visita la tienda para conseguir tus primeros objetos.
            </div>
        `;

        return;
    }

    player.inventory.forEach(item => {

        container.innerHTML += `
            <div class="inventory-card">

                <div class="item-icon">${item.icon}</div>

                <h3>${item.title}</h3>

                <p>${item.description}</p>

            </div>
        `;
    });
}


// 13. TIENDA

function renderShop() {

    const container = document.getElementById("shopList");

    container.innerHTML = "";

    shopItems.forEach(item => {

        const owned = player.inventory.some(
            inventoryItem => inventoryItem.id === item.id
        );

        container.innerHTML += `
            <div class="shop-card">

                <div class="item-icon">${item.icon}</div>

                <h3>${item.title}</h3>

                <p>${item.description}</p>

                <p class="mission-reward">
                    🪙 ${item.price} monedas
                </p>

                <button
                    class="complete-btn"
                    data-buy="${item.id}"
                    ${owned || player.gold < item.price ? "disabled" : ""}
                >
                    ${
                        owned
                        ? "Adquirido"
                        : player.gold < item.price
                            ? "Monedas insuficientes"
                            : "Comprar"
                    }
                </button>

            </div>
        `;
    });

    document.querySelectorAll("[data-buy]").forEach(button => {

        button.addEventListener("click", () => {
            buyItem(button.dataset.buy);
        });

    });
}


// 14. COMPRAR OBJETOS

function buyItem(id) {

    const item = shopItems.find(product => product.id === id);

    if (!item) return;

    const alreadyOwned = player.inventory.some(
        product => product.id === id
    );

    if (alreadyOwned) return;

    if (player.gold < item.price) return;

    player.gold -= item.price;

    player.inventory.push(item);

    saveGame();

    renderGame();
}


// 15. ACTUALIZAR TODA LA INTERFAZ

function renderGame() {

    renderMissions();
    renderStats();
    renderAchievements();
    renderInventory();
    renderShop();

}


// 16. FECHA ACTUAL

function showDate() {

    const date = new Date();

    document.getElementById("currentDate").textContent =
        date.toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}

/* =================================
   VIDA RPG - ORGANIZADOR PERSONAL
================================= */

// 1. CONFIGURACIÓN DEL ORGANIZADOR

let selectedDate = getLocalDate(new Date());

const activityForm = document.getElementById("activityForm");
const activityDateInput = document.getElementById("activityDate");

activityDateInput.value = selectedDate;


// 2. FUNCIONES PARA TRABAJAR CON FECHAS

function getLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// 3. RECOMPENSAS AUTOMÁTICAS

function getActivityReward(difficulty) {
    const rewards = {
        easy: { xp: 20, gold: 5 },
        medium: { xp: 35, gold: 10 },
        hard: { xp: 50, gold: 15 }
    };

    return rewards[difficulty] || rewards.medium;
}


// 4. CREAR UNA ACTIVIDAD

activityForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = document.getElementById("activityTitle").value.trim();
    const date = activityDateInput.value;
    const time = document.getElementById("activityTime").value;
    const duration = document.getElementById("activityDuration").value;
    const difficulty = document.getElementById("activityDifficulty").value;
    const recurrence = document.getElementById("activityRecurrence").value;

    if (!title || !date) {
        alert("Escribe el nombre y la fecha de tu actividad.");
        return;
    }

    const activity = {
        id: crypto.randomUUID(),
        title: title,
        date: date,
        time: time,
        duration: duration,
        difficulty: difficulty,
        recurrence: recurrence
    };

    player.activities.push(activity);

    saveGame();

    activityForm.reset();

    selectedDate = date;
    activityDateInput.value = date;

    renderGame();

    alert("¡Actividad agregada a tu planificación!");
});


// 5. COMPROBAR SI UNA ACTIVIDAD SE REPITE

function activityOccursOn(activity, dateString) {

    if (dateString < activity.date) {
        return false;
    }

    const date = parseLocalDate(dateString);
    const startDate = parseLocalDate(activity.date);

    if (activity.recurrence === "none") {
        return dateString === activity.date;
    }

    if (activity.recurrence === "daily") {
        return true;
    }

    if (activity.recurrence === "weekly") {
        return date.getDay() === startDate.getDay();
    }

    if (activity.recurrence === "weekdays") {
        const day = date.getDay();

        return day >= 1 && day <= 5;
    }

    return false;
}


// 6. OBTENER ACTIVIDADES DE UNA FECHA

function getActivitiesForDate(dateString) {

    return player.activities
        .filter(activity => activityOccursOn(activity, dateString))
        .map(activity => {

            const occurrenceId = `${activity.id}_${dateString}`;

            return {
                ...activity,
                occurrenceId: occurrenceId,
                completed: player.claimedOccurrences.includes(occurrenceId),
                reward: getActivityReward(activity.difficulty)
            };
        })
        .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"));
}


// 7. COMPLETAR ACTIVIDADES Y COBRAR RECOMPENSAS


function completeMission(occurrenceId) {

    // La fecha está al final del identificador de la actividad.
    const occurrenceDate = occurrenceId.slice(-10);

    const activities = getActivitiesForDate(occurrenceDate);

    const activity = activities.find(
        item => item.occurrenceId === occurrenceId
    );

    if (!activity || activity.completed) {
        return;
    }

    player.claimedOccurrences.push(occurrenceId);

    player.xp += activity.reward.xp;
    player.totalXP += activity.reward.xp;
    player.gold += activity.reward.gold;

    player.stats.discipline += 1;

    checkLevelUp();

    saveGame();
    renderGame();
}



// 8. MOSTRAR UNA ACTIVIDAD COMO MISIÓN

function createActivityHTML(activity) {

    const difficultyNames = {
        easy: "Fácil",
        medium: "Media",
        hard: "Difícil"
    };

    const timeText = activity.time
        ? `🕒 ${escapeHTML(activity.time)}`
        : "🕒 Sin horario";

    const durationText = activity.duration
        ? `⏱ ${escapeHTML(activity.duration)} min`
        : "";

    return `
        <div class="mission-card ${activity.completed ? "activity-completed" : ""}">

            <div class="activity-details">

                <h4>🎯 ${escapeHTML(activity.title)}</h4>

                <div class="activity-meta">
                    <span>${timeText}</span>
                    <span>${durationText}</span>
                    <span>⚔ ${difficultyNames[activity.difficulty]}</span>
                </div>

                <div class="activity-reward">
                    ⚡ ${activity.reward.xp} XP
                    &nbsp; 🪙 ${activity.reward.gold} monedas
                </div>

            </div>

            <button
                class="complete-btn"
                data-occurrence="${escapeHTML(activity.occurrenceId)}"
                ${activity.completed ? "disabled" : ""}
            >
                ${activity.completed ? "✓ Completada" : "Completar"}
            </button>

        </div>
    `;
}


// 9. MOSTRAR LAS ACTIVIDADES DEL DÍA

function renderDailyActivities() {

    const container = document.getElementById("dailyActivities");
    const dateText = document.getElementById("selectedDateText");

    const activities = getActivitiesForDate(selectedDate);

    dateText.textContent = parseLocalDate(selectedDate).toLocaleDateString(
        "es-PE",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    );

    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                📅 No tienes actividades programadas para este día.
                <br><br>
                ¡Agrega una actividad para comenzar tu aventura!
            </div>
        `;
        return;
    }

    container.innerHTML = activities
        .map(createActivityHTML)
        .join("");

    container.querySelectorAll("[data-occurrence]").forEach(button => {

        button.addEventListener("click", () => {
            completeMission(button.dataset.occurrence);
        });

    });
}


// 10. CALENDARIO SEMANAL

function renderWeeklyCalendar() {

    const calendar = document.getElementById("weeklyCalendar");

    const selected = parseLocalDate(selectedDate);

    // Encontrar el lunes de la semana seleccionada.
    const monday = addDays(
        selected,
        selected.getDay() === 0 ? -6 : 1 - selected.getDay()
    );

    const dayNames = [
        "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
    ];

    calendar.innerHTML = "";

    for (let i = 0; i < 7; i++) {

        const date = addDays(monday, i);
        const dateString = getLocalDate(date);

        const hasActivities = getActivitiesForDate(dateString).length > 0;
        const isSelected = dateString === selectedDate;
        const isToday = dateString === getLocalDate(new Date());

        calendar.innerHTML += `
            <button
                class="calendar-day
                    ${isSelected ? "selected" : ""}
                    ${isToday ? "today" : ""}"
                data-calendar-date="${dateString}"
            >
                <span>${dayNames[i]}</span>
                <strong>${date.getDate()}</strong>
                ${hasActivities ? '<span class="day-dot"></span>' : ""}
            </button>
        `;
    }

    calendar.querySelectorAll("[data-calendar-date]").forEach(button => {

        button.addEventListener("click", () => {

            selectedDate = button.dataset.calendarDate;

            activityDateInput.value = selectedDate;

            renderPlanner();
        });

    });
}


// 11. MOSTRAR LAS MISIONES DEL ORGANIZADOR

function renderMissions() {

    const dashboard = document.getElementById("dashboardMissions");
    const allMissions = document.getElementById("allMissions");

    const today = getLocalDate(new Date());
    const todayActivities = getActivitiesForDate(today);

    dashboard.innerHTML = todayActivities.length
        ? todayActivities.slice(0, 3).map(createActivityHTML).join("")
        : `<div class="empty-message">No tienes misiones para hoy. Organiza tu día en Mi planificación.</div>`;

    const selectedActivities = getActivitiesForDate(selectedDate);

    allMissions.innerHTML = selectedActivities.length
        ? selectedActivities.map(createActivityHTML).join("")
        : `<div class="empty-message">No hay misiones para esta fecha. Agrega actividades en Mi planificación.</div>`;

    document.querySelectorAll("[data-occurrence]").forEach(button => {

        button.addEventListener("click", () => {
            completeMission(button.dataset.occurrence);
        });

    });
}


// 12. MOSTRAR EL ORGANIZADOR COMPLETO

function renderPlanner() {

    renderWeeklyCalendar();
    renderDailyActivities();
}


// 14. ACTUALIZAR TODA LA INTERFAZ

function renderGame() {

    renderMissions();
    renderStats();
    renderAchievements();
    renderInventory();
    renderShop();
    renderPlanner();

}


// 15. INICIAR EL ORGANIZADOR

renderGame();

console.log("Organizador de VIDA RPG listo.");

// INICIAR VIDA RPG COMPLETAMENTE

showDate();
renderGame();

console.log("VIDA RPG iniciado correctamente.");
console.log("Personaje:", player.name);