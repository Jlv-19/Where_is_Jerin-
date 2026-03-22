const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtlqew4y-ItcDKx2kA6Ua1RDh-2PlT6XmY4yCKDeCBuzUlruW27SE_nXEWUF62la36h0tZFa8ln63r/pub?output=csv";

async function loadData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        if (document.getElementById("today")) {
            processDashboard(data);
            showSummary(data);
            updateLastUpdated();
        }

        if (document.getElementById("history")) {
            loadHistory(data);
        }

    } catch (err) {
        console.error(err);
        document.body.innerHTML = "Error loading data";
    }
}

// Normalize date
function normalizeDate(dateStr) {
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
}

// Format date
function formatDate(d) {
    return d.toISOString().split("T")[0];
}

// Dashboard
function processDashboard(data) {
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    renderCard("yesterday", data, formatDate(yesterday));
    renderCard("today", data, formatDate(today));
    renderCard("tomorrow", data, formatDate(tomorrow));
}

function renderCard(id, data, date) {
    const container = document.getElementById(id);

    const filtered = data.filter(d => normalizeDate(d.Date) === date);

    const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'long' });

    container.innerHTML = `<h3>${dayName}</h3>`;

    if (filtered.length === 0) {
        container.innerHTML += `<p>No visits</p>`;
        return;
    }

    filtered.sort((a, b) => a.Shift.localeCompare(b.Shift));

    filtered.forEach(item => {
        const lastVisit = getLastVisitDays(data, item.Society, date);
        const totalVisits = getVisitCount(data, item.Society);

        container.innerHTML += `
            <div class="card ${item.Shift.toLowerCase()}">
                <strong>${item.Society}</strong>
                <span class="badge ${item.Status.toLowerCase()}">${item.Status}</span>
                <div class="stat">Shift: ${item.Shift}</div>
                <div class="stat">Last visit: ${lastVisit}</div>
                <div class="stat">Total visits: ${totalVisits}</div>
            </div>
        `;
    });
}

// History page
function loadHistory(data) {
    const container = document.getElementById("history");

    data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    data.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <strong>${item.Society}</strong>
                <div>${normalizeDate(item.Date)}</div>
                <div>Shift: ${item.Shift}</div>
                <div class="badge ${item.Status.toLowerCase()}">${item.Status}</div>
            </div>
        `;
    });
}

// Helpers
function getVisitCount(data, society) {
    return data.filter(d => d.Society === society).length;
}

function getLastVisitDays(data, society, currentDate) {
    const past = data
        .filter(d => d.Society === society && normalizeDate(d.Date) < currentDate)
        .sort((a, b) => new Date(b.Date) - new Date(a.Date));

    if (past.length === 0) return "First visit";

    const last = new Date(past[0].Date);
    const current = new Date(currentDate);

    const diff = Math.floor((current - last) / (1000 * 60 * 60 * 24));
    return diff + " days ago";
}

function showSummary(data) {
    const total = data.length;
    const societies = new Set(data.map(d => d.Society)).size;

    document.getElementById("summary").innerHTML = `
        <strong>Total Visits:</strong> ${total} <br>
        <strong>Societies:</strong> ${societies}
    `;
}

function updateLastUpdated() {
    const now = new Date();

    const formatted = now.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });

    document.getElementById("time").innerText =
        "Last synced: " + formatted;
}

loadData();
