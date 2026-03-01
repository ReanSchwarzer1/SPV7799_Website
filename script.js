// --- STATE MANAGEMENT ---
let state = {
    synthesisRoute: 'patented',
    patentActive: true,
    competitors: 1,
    procurement: 1,
    chartsInitialized: false
};

let glViewer = null;

// --- 1. SYNTHESIS LOGIC & WEBGL MOLECULE ---
function initWebGLViewer() {
    let container = document.getElementById("molecule-container");
    
    // Create the 3D viewer
    glViewer = $3Dmol.createViewer(container, { backgroundColor: "transparent" });

    // Fetch Imatinib (CID 5291) directly from PubChem
    $3Dmol.download("cid:5291", glViewer, { onAll: function() {
        // Set initial material/style
        glViewer.setStyle({}, {stick: {radius: 0.15, colorscheme: 'cyanCarbon'}});
        glViewer.zoomTo();
        glViewer.render();
    }});
}

function setSynthesis(route) {
    state.synthesisRoute = route;
    const btnPat = document.getElementById('btn-patented');
    const btnAlt = document.getElementById('btn-alternative');
    const cost = document.getElementById('api-cost');

    btnPat.classList.remove('border-brandDark', 'bg-white');
    btnAlt.classList.remove('border-brandDark', 'bg-white');
    
    if(route === 'patented') {
        btnPat.classList.add('border-brandDark', 'bg-white');
        cost.innerText = "$12,000";
        cost.className = "text-3xl font-bold text-scrollRed font-mono";
        
        // Change 3D Material to look rigid/patented
        if(glViewer) {
            glViewer.setStyle({}, {stick: {radius: 0.15, colorscheme: 'cyanCarbon'}});
            glViewer.render();
        }
    } else {
        btnAlt.classList.add('border-brandDark', 'bg-white');
        cost.innerText = "$450";
        cost.className = "text-3xl font-bold text-green-600 font-mono";
        
        // Change 3D Material to show structural/synthesis change
        if(glViewer) {
            glViewer.setStyle({}, {
                stick: {radius: 0.1, colorscheme: 'greenCarbon'}, 
                sphere: {scale: 0.3, colorscheme: 'greenCarbon'}
            });
            glViewer.render();
        }
    }
    if(state.chartsInitialized) updateCharts();
}

// --- 2. LEGAL LABYRINTH (Real 5 Cases) ---
const legalCases = [
    {
        title: "Novartis vs. Union of India",
        drug: "Imatinib Mesylate (Glivec) - Cancer",
        claim: "We have developed a beta-crystalline form of our existing drug. It absorbs slightly better. We request a 20-year patent renewal.",
        context: "Section 3(d) prevents 'evergreening'—patenting minor tweaks to existing drugs.",
        rejectAction: "Apply Sec 3(d)",
        resultReject: "Correct. The Supreme Court rejected the patent in 2013. The generic market remained open, dropping prices by over 90%.",
        resultGrant: "Incorrect in reality. Granting this would have allowed 'evergreening' and locked out affordable Indian generics.",
        opensMarket: true
    },
    {
        title: "Bayer vs. Natco Pharma",
        drug: "Sorafenib (Nexavar) - Kidney Cancer",
        claim: "Our patented drug costs $5,000/month. A generic company wants to make it for $150/month because Indians cannot afford our price.",
        context: "Section 84 allows 'Compulsory Licensing' (CL) if a patented drug is not reasonably affordable or available.",
        rejectAction: "Grant Compulsory License",
        resultReject: "Correct. In 2012, India granted its first CL to Natco. Bayer kept the patent but Natco could produce it cheaply while paying Bayer royalties.",
        resultGrant: "If denied, 99% of Indian patients requiring this life-saving drug would have been entirely priced out.",
        opensMarket: true
    },
    {
        title: "Roche vs. Cipla",
        drug: "Erlotinib (Tarceva) - Lung Cancer",
        claim: "Cipla is selling a generic version of our drug. We demand an immediate injunction to stop their manufacturing.",
        context: "Public interest in life-saving drugs vs. strict patent infringement.",
        rejectAction: "Deny Injunction",
        resultReject: "Correct. Courts allowed Cipla to continue selling the generic because stopping it would harm patients dependent on the cheaper drug.",
        resultGrant: "Granting the injunction would have prioritized IP over immediate public health access.",
        opensMarket: true
    },
    {
        title: "Gilead Sciences",
        drug: "Sofosbuvir (Sovaldi) - Hepatitis C",
        claim: "We have a breakthrough cure. We want a patent, but to prevent generic challenges, we will offer 'Voluntary Licenses' to Indian firms to sell it cheaply in specific poor countries.",
        context: "Pre-grant opposition by NGOs vs Voluntary Corporate Licensing.",
        rejectAction: "Reject under Sec 3(d)",
        resultReject: "Historically complex. It was rejected initially, but Gilead's voluntary licensing still allowed generics to drive the price from $84,000 down to roughly $300.",
        resultGrant: "A monopoly grant without voluntary licensing would have severely restricted global Hep C eradication.",
        opensMarket: true
    },
    {
        title: "Pfizer vs. generic challengers",
        drug: "Sunitinib (Sutent) - Cancer",
        claim: "We hold the patent, but generic companies claim our molecule lacks 'inventive step' over previous scientific literature.",
        context: "Section 3(a) and Pre-grant opposition—citizens and companies can challenge a patent before it is granted.",
        rejectAction: "Revoke Patent",
        resultReject: "Correct initially. The patent office revoked it in 2012 due to lack of inventive step, allowing generics in. (Though reinstated years later on appeal).",
        resultGrant: "Upholding weak patents stifles the 'Alternative Synthesis' ecosystem.",
        opensMarket: true
    }
];

let currentCaseIndex = 0;

function renderCase() {
    const c = legalCases[currentCaseIndex];
    document.getElementById('case-number').innerText = `00${currentCaseIndex + 1}`;
    document.getElementById('case-title').innerText = c.title;
    document.getElementById('case-drug').innerText = `Drug: ${c.drug}`;
    document.getElementById('case-claim').innerText = `"${c.claim}"`;
    document.getElementById('case-context').innerText = `Context: ${c.context}`;
    document.getElementById('btn-reject').innerText = c.rejectAction;
    
    // Reset UI
    document.getElementById('ruling-outcome').classList.add('hidden');
    state.patentActive = true; 
    if(state.chartsInitialized) updateCharts();
}

function prevCase() { currentCaseIndex = (currentCaseIndex > 0) ? currentCaseIndex - 1 : 4; renderCase(); }
function nextCase() { currentCaseIndex = (currentCaseIndex < 4) ? currentCaseIndex + 1 : 0; renderCase(); }

function makeRuling(isGrant) {
    const c = legalCases[currentCaseIndex];
    const outcomeDiv = document.getElementById('ruling-outcome');
    outcomeDiv.classList.remove('hidden');
    
    const compSlider = document.getElementById('slider-comp');
    const compNote = document.getElementById('comp-note');
    const statusLabel = document.getElementById('val-monopoly-status');

    if(isGrant) {
        state.patentActive = true;
        outcomeDiv.innerHTML = `<span class='text-red-400 font-bold'>Monopoly Granted.</span> ${c.resultGrant}`;
        outcomeDiv.className = "mt-8 w-full p-4 rounded bg-gray-800 text-sm font-serif border-l-4 border-scrollRed text-white";
        
        compSlider.disabled = true;
        compSlider.value = 1;
        compNote.innerText = "Locked by Patent.";
        compNote.className = "text-xs text-red-500 mt-1 font-bold";
        statusLabel.innerText = "ACTIVE";
        statusLabel.className = "text-red-600 font-bold";
    } else {
        state.patentActive = false;
        outcomeDiv.innerHTML = `<span class='text-voxYellow font-bold'>Market Intervened.</span> ${c.resultReject}`;
        outcomeDiv.className = "mt-8 w-full p-4 rounded bg-gray-800 text-sm font-serif border-l-4 border-voxYellow text-white";
        
        compSlider.disabled = false;
        compSlider.value = 15; // Auto-jump to show effect
        compNote.innerText = "Market open! Adjust competitors.";
        compNote.className = "text-xs text-green-600 mt-1 font-bold";
        statusLabel.innerText = "REJECTED / CL GRANTED";
        statusLabel.className = "text-green-600 font-bold";
    }
    
    if(state.chartsInitialized) updateCharts();
}


// --- 3. CHART.JS LOGIC ---
let barChart, lineChart;

document.addEventListener("DOMContentLoaded", function() {
    initWebGLViewer();
    renderCase();

    // Chart Setup
    const barCtx = document.getElementById('barChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Private Profit', 'Social Access'],
            datasets: [{ label: 'Index', backgroundColor: ['#1a1a1a', '#fffb00'], data: [0, 0] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 1000 } } }
    });

    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Yr1', 'Yr2', 'Yr3', 'Yr4', 'Yr5', 'Yr6', 'Yr7', 'Yr8', 'Yr9', 'Yr10'],
            datasets: [{ label: 'Price ($)', borderColor: '#d92525', backgroundColor: 'rgba(217, 37, 37, 0.1)', fill: true, data: [], tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 120 } } }
    });

    state.chartsInitialized = true;
    
    // Sliders
    document.getElementById('slider-comp').addEventListener('input', updateCharts);
    document.getElementById('slider-procure').addEventListener('input', updateCharts);
    
    updateCharts();
    drawMapLines();
});

function updateCharts() {
    if(!state.chartsInitialized) return;

    state.competitors = parseInt(document.getElementById('slider-comp').value);
    state.procurement = parseInt(document.getElementById('slider-procure').value);

    document.getElementById('val-comp').innerText = state.competitors;
    document.getElementById('val-procure').innerText = state.procurement === 1 ? 'Low' : (state.procurement === 2 ? 'Medium' : 'High');

    // Math Logic based on PMC data principles
    let baseProfit = state.patentActive ? 900 : (state.competitors * 12);
    let baseSocial = state.patentActive ? 80 : (state.competitors * 25) + (state.procurement * 120);
    
    if (state.synthesisRoute === 'alternative' && !state.patentActive) {
        baseProfit += 40; 
        baseSocial += 60;
    }

    barChart.data.datasets[0].data = [Math.max(10, Math.min(1000, baseProfit)), Math.max(10, Math.min(1000, baseSocial))];
    barChart.update();

    let priceData = [];
    let currentPrice = 100; // Index 100 represents $10,000 monopoly price
    
    for(let i=0; i<10; i++) {
        if(state.patentActive) {
            priceData.push(100); 
        } else {
            let decayFactor = (state.competitors * 0.04) + (state.procurement * 0.03);
            if (state.synthesisRoute === 'alternative') decayFactor += 0.05; 
            
            currentPrice = currentPrice - (currentPrice * decayFactor);
            // Simulate the drop to $200 (which is 2% of original)
            priceData.push(Math.max(2, currentPrice));
        }
    }
    
    lineChart.data.datasets[0].data = priceData;
    lineChart.data.datasets[0].borderColor = state.patentActive ? '#d92525' : '#22c55e';
    lineChart.data.datasets[0].backgroundColor = state.patentActive ? 'rgba(217, 37, 37, 0.1)' : 'rgba(34, 197, 94, 0.1)';
    lineChart.update();
}

// --- 4. MAP INTERACTIVITY ---
function toggleHotspot(id) {
    document.querySelectorAll('.hotspot-content').forEach(el => {
        el.style.display = 'none';
        el.previousElementSibling.classList.remove('active');
    });
    const target = document.getElementById(id);
    target.style.display = 'block';
    target.previousElementSibling.classList.add('active');
}

// Draw dynamic SVG lines between hotspots
function drawMapLines() {
    const svg = document.getElementById('map-lines');
    svg.innerHTML = `
        <path d="M 22% 35% Q 45% 20% 68% 45%" fill="none" stroke="#fffb00" stroke-width="2" stroke-dasharray="5,5" class="opacity-70" />
        <path d="M 68% 45% Q 60% 60% 52% 60%" fill="none" stroke="#fffb00" stroke-width="2" stroke-dasharray="5,5" class="opacity-70" />
    `;
}