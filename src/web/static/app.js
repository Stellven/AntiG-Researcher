const topicInput = document.getElementById('topicInput');
const searchBtn = document.getElementById('searchBtn');
const btnText = document.querySelector('.btn-text');
const loader = document.querySelector('.loader');
const statusContainer = document.getElementById('statusContainer');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMsg = document.getElementById('errorMsg');
const reportContent = document.getElementById('reportContent');

// State Management
const state = {
    currentTopic: '',
    customPrompt: '',
    subTopics: [],
    researchFindings: {},
    sources: []
};

// DOM Elements
const views = {
    search: document.getElementById('searchContainer'),
    status: document.getElementById('statusContainer'),
    agentGrid: document.getElementById('agentGrid'),
    plan: document.getElementById('planContainer'),
    findings: document.getElementById('findingsContainer'),
    result: document.getElementById('resultContainer'),
    error: document.getElementById('errorContainer')
};

const inputs = {
    topic: document.getElementById('topicInput'),
    customPrompt: document.getElementById('customPromptInput')
};

const buttons = {
    search: document.getElementById('searchBtn'),
    confirmPlan: document.getElementById('confirmPlanBtn'),
    confirmFindings: document.getElementById('confirmFindingsBtn'),
    download: document.getElementById('downloadBtn'),
    newSearch: document.getElementById('newSearchBtn')
};

const lists = {
    subTopics: document.getElementById('subTopicsList'),
    findings: document.getElementById('findingsList')
};

const dynamicText = {
    status: document.getElementById('statusText'),
    report: document.getElementById('reportContent'),
    error: document.getElementById('errorMsg')
};

// Event Listeners
buttons.search.addEventListener('click', startPlanning);
inputs.topic.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startPlanning();
});
buttons.confirmPlan.addEventListener('click', startResearchPhase);
buttons.confirmFindings.addEventListener('click', startSummarization);
buttons.newSearch.addEventListener('click', resetApp);

// --- Phase 1: Planning ---
async function startPlanning() {
    const topic = inputs.topic.value.trim();
    const customPrompt = inputs.customPrompt.value.trim();

    if (!topic) return;

    state.currentTopic = topic;
    state.customPrompt = customPrompt;

    switchView('status');
    setStatus("Analysing topic & generating research plan...");

    try {
        const response = await fetch('/api/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, custom_prompt: customPrompt })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        state.subTopics = data.sub_topics;
        renderPlanReview();
        switchView('plan');
    } catch (err) {
        showError(err.message);
    }
}

function renderPlanReview() {
    lists.subTopics.innerHTML = '';
    state.subTopics.forEach((sub, index) => {
        const div = document.createElement('div');
        div.className = 'sub-topic-item';
        div.innerHTML = `
            <input type="text" class="sub-topic-input" value="${sub}" data-index="${index}">
            <button class="annotate-btn" onclick="toggleInstruction(${index})">📝 Add Instruction</button>
            <div id="instruction-${index}" class="instruction-container hidden">
                <input type="text" class="instruction-input" placeholder="Enter specific instructions (e.g., focus on 2024 data)..." data-index="${index}">
            </div>
        `;
        lists.subTopics.appendChild(div);
    });
}

// Global function for onclick
window.toggleInstruction = function (index) {
    const container = document.getElementById(`instruction-${index}`);
    container.classList.toggle('hidden');
    const input = container.querySelector('input');
    if (!container.classList.contains('hidden')) {
        input.focus();
    }
};

// --- Phase 2: Research ---
// --- Phase 2: Research ---
async function startResearchPhase() {
    // Collect updated sub-topics and instructions
    const items = [];
    const subTopicInputs = document.querySelectorAll('.sub-topic-input');

    subTopicInputs.forEach((input, index) => {
        const topic = input.value.trim();
        if (topic) {
            const instructionInput = document.querySelector(`.instruction-input[data-index="${index}"]`);
            const instruction = instructionInput ? instructionInput.value.trim() : null;

            items.push({
                topic: topic,
                instructions: instruction
            });
        }
    });

    if (items.length === 0) return;

    // Update state to simple string list for local findings map usage if needed, 
    // but better to keep items. For compatibility with simple list expected by UI finding rendering:
    state.subTopics = items.map(i => i.topic);

    switchView('status');
    setStatus(`Deploying ${items.length} Agents...`);

    // Show Agent Grid
    views.agentGrid.innerHTML = '';
    views.agentGrid.classList.remove('hidden');
    items.forEach((item, i) => {
        const agentDiv = document.createElement('div');
        agentDiv.className = 'agent-card';
        // Stagger animation
        agentDiv.style.animationDelay = `${i * 0.1}s`;
        agentDiv.innerHTML = `
            <div class="agent-icon">🕵️</div>
            <div class="agent-name">Agent ${i + 1}</div>
        `;
        views.agentGrid.appendChild(agentDiv);
    });

    try {
        const response = await fetch('/api/research_phase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sub_topics: items })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        state.researchFindings = data.findings;
        state.sources = data.sources;

        // Hide agents when done
        views.agentGrid.classList.add('hidden');

        renderFindingsReview();
        switchView('findings');
    } catch (err) {
        showError(err.message);
    }
}

function renderFindingsReview() {
    lists.findings.innerHTML = '';
    Object.keys(state.researchFindings).forEach(sub => {
        const content = state.researchFindings[sub];
        const div = document.createElement('div');
        div.className = 'finding-item';
        div.innerHTML = `
            <label class="finding-label">${sub}</label>
            <textarea class="finding-textarea" data-sub="${sub}">${content}</textarea>
        `;
        lists.findings.appendChild(div);
    });
}

// --- Phase 3: Summarization ---
async function startSummarization() {
    // Collect updated findings
    const textareas = document.querySelectorAll('.finding-textarea');
    textareas.forEach(textarea => {
        const sub = textarea.getAttribute('data-sub');
        state.researchFindings[sub] = textarea.value;
    });

    switchView('status');
    setStatus("Compiling final report...");

    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: state.currentTopic,
                research_findings: state.researchFindings,
                sources: state.sources,
                custom_prompt: state.customPrompt
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        showResult(data.report);
    } catch (err) {
        showError(err.message);
    }
}

// --- Helpers ---
function switchView(viewName) {
    // Hide all main containers
    Object.values(views).forEach(el => el.classList.add('hidden'));

    // Show requested view
    if (views[viewName]) views[viewName].classList.remove('hidden');
}

function setStatus(text) {
    dynamicText.status.textContent = text;
}

function showResult(markdown) {
    dynamicText.report.innerHTML = marked.parse(markdown);
    switchView('result');
}

function showError(msg) {
    dynamicText.error.textContent = msg;
    switchView('error');
    // Allow going back to search after error
    setTimeout(() => {
        views.search.classList.remove('hidden');
    }, 5000);
}

function resetApp() {
    inputs.topic.value = '';
    inputs.customPrompt.value = '';
    switchView('search');
}
