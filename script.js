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
    glViewer = $3Dmol.createViewer(container, { backgroundColor: "transparent" });

    // Fetch Imatinib (CID 5291) directly from PubChem
    $3Dmol.download("cid:5291", glViewer, { onAll: function() {
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
        cost.innerText = "$2,666"; 
        cost.className = "text-3xl font-bold text-scrollRed font-mono";
        
        if(glViewer) {
            glViewer.setStyle({}, {stick: {radius: 0.15, colorscheme: 'cyanCarbon'}});
            glViewer.render();
        }
    } else {
        btnAlt.classList.add('border-brandDark', 'bg-white');
        cost.innerText = "$177"; 
        cost.className = "text-3xl font-bold text-green-600 font-mono";
        
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
        title: "Novartis AG vs. Union of India",
        drug: "Imatinib Mesylate (Glivec) - Leukemia",
        claim: "We have developed a beta-crystalline form of our existing drug, imatinib. It has better flow properties and thermodynamic stability. We request a patent.",
        context: "Section 3(d) of the 1970 Patent Act prevents 'evergreening'—patenting minor tweaks to existing drugs without significantly enhanced therapeutic efficacy.",
        rejectAction: "Apply Sec 3(d)",
        resultReject: "Correct. The Supreme Court rejected the patent in 2013 under Section 3(d). The generic market remained open, dropping patient costs from ~$2,666/month down to ~$177/month.",
        resultGrant: "Incorrect in reality. Granting this would have allowed 'evergreening' and locked out affordable Indian generics.",
        citation: "Citation: Novartis AG v. Union of India, Supreme Court of India (2013).",
        opensMarket: true
    },
    {
        title: "Bayer Corp. vs. Natco Pharma",
        drug: "Sorafenib Tosylate (Nexavar) - Kidney Cancer",
        claim: "Our patented drug costs ₹2.8 lakh ($5,000)/month. A generic company wants to make it because Indians cannot afford our price.",
        context: "Section 84 allows 'Compulsory Licensing' (CL) if a patented drug is not available at a reasonably affordable price.",
        rejectAction: "Grant Compulsory License",
        resultReject: "Correct. In 2012, India granted its first CL to Natco. Natco sold the generic for ₹8,800/month (a 97% price drop) while paying Bayer a 6% royalty.",
        resultGrant: "If denied, 99% of Indian patients requiring this life-saving drug would have been entirely priced out.",
        citation: "Citation: Bayer Corp. v. Union of India, Controller of Patents (2012).",
        opensMarket: true
    },
    {
        title: "F. Hoffmann-La Roche Ltd. vs. Cipla",
        drug: "Erlotinib (Tarceva) - Lung Cancer",
        claim: "Cipla is selling Erlocip, a generic version of our patented drug Tarceva. We demand an interim injunction to stop them.",
        context: "Public interest and balance of convenience in granting injunctions for life-saving drugs under the Patents Act.",
        rejectAction: "Deny Injunction",
        resultReject: "Correct. The Delhi High Court denied the injunction in 2009. Roche's drug cost Rs 4,800/pill, while Cipla's generic cost Rs 1,600/pill. The court prioritized public access to life-saving drugs over IP enforcement.",
        resultGrant: "Granting the injunction would have prioritized intellectual property over immediate public health access.",
        citation: "Citation: F. Hoffmann-La Roche Ltd. v. Cipla Ltd., Delhi High Court (2009).",
        opensMarket: true
    },
    {
        title: "Gilead Sciences vs. Generic Manufacturers",
        drug: "Sofosbuvir (Sovaldi) - Hepatitis C",
        claim: "We hold the patent for this breakthrough cure. To address affordability, we will offer 'Voluntary Licenses' to Indian generic firms to sell it cheaply in developing nations.",
        context: "Pricing strategy, Pre-grant opposition, and Voluntary Licensing.",
        rejectAction: "Intervene / Force Market Open",
        resultReject: "Correct. Following patent oppositions, Gilead issued voluntary licenses to 11 Indian manufacturers. The US price was $84,000/course; the generic Indian price dropped to ~$300-$900/course for 101 developing nations.",
        resultGrant: "A strict monopoly without voluntary licensing would have severely restricted global Hep C eradication.",
        citation: "Data Source: Hill A. et al., 'Rapid reductions in prices for generic sofosbuvir...', PMC4946692 (2016).",
        opensMarket: true
    },
    {
        title: "Pfizer vs. Generic Challengers",
        drug: "Sunitinib (Sutent) - Kidney Cancer",
        claim: "We hold the patent, but generic companies claim our molecule lacks an 'inventive step' and is structurally obvious from prior art.",
        context: "Section 2(1)(j) regarding inventive step and post-grant opposition.",
        rejectAction: "Revoke Patent",
        resultReject: "Correct. The Indian Patent Office revoked the patent in 2012 for lacking an inventive step. Pfizer's price was Rs 1.96 lakh/course; Cipla offered generics at a fraction of the cost.",
        resultGrant: "Upholding weak, structurally obvious patents stifles the 'Alternative Synthesis' ecosystem.",
        citation: "Citation: Post-grant opposition by Cipla/Natco against Patent IN209251 (2012).",
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
    document.getElementById('case-citation').innerText = c.citation;
    document.getElementById('btn-reject').innerText = c.rejectAction;
    
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
        compSlider.value = 15; 
        compNote.innerText = "Market open! Adjust competitors.";
        compNote.className = "text-xs text-green-600 mt-1 font-bold";
        statusLabel.innerText = "REJECTED / CL GRANTED";
        statusLabel.className = "text-green-600 font-bold";
    }
    
    if(state.chartsInitialized) updateCharts();
}

// --- 3. CHART.JS LOGIC WITH REAL ECONOMIC FORMULAS ---
let barChart, lineChart;

document.addEventListener("DOMContentLoaded", function() {
    initWebGLViewer();
    renderCase();

    const barCtx = document.getElementById('barChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');

    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Private Profit', 'Social Access'],
            datasets: [{ label: 'Economic Value', backgroundColor: ['#1a1a1a', '#fffb00'], data: [0, 0] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: 3500 } } }
    });

    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: ['Yr1', 'Yr2', 'Yr3', 'Yr4', 'Yr5', 'Yr6', 'Yr7', 'Yr8', 'Yr9', 'Yr10'],
            datasets: [{ label: 'Price Index (%)', borderColor: '#d92525', backgroundColor: 'rgba(217, 37, 37, 0.1)', fill: true, data: [], tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 110 } } }
    });

    state.chartsInitialized = true;
    
    document.getElementById('slider-comp').addEventListener('input', updateCharts);
    document.getElementById('slider-procure').addEventListener('input', updateCharts);
    
    updateCharts();
    drawMapLines();
});

function updateCharts() {
    if(!state.chartsInitialized) return;

    state.competitors = parseInt(document.getElementById('slider-comp').value);
    state.procurement = parseInt(document.getElementById('slider-procure').value);

    // Update UI text
    document.getElementById('val-comp').innerText = state.competitors;
    document.getElementById('val-procure').innerText = state.procurement === 1 ? 'Low' : (state.procurement === 2 ? 'Medium' : 'High');

    // --- ACTUAL ECONOMIC MATH ---
    // 1. Price Decay Formula (FDA Model): P_N = P_0 * N^(-0.75)
    const basePrice = 100; 
    let currentPrice = state.patentActive ? basePrice : basePrice * Math.pow(state.competitors, -0.75);

    // 2. Welfare Economics (Linear Demand Model)
    const maxWillingPrice = 120;
    const marginalCost = 5; 
    
    // Govt procurement acts as a demand multiplier (shifts curve right)
    const demandMultiplier = 1 + (state.procurement * 0.5); 
    
    // Quantity Demanded: Q = (Pmax - P) * Multiplier
    let quantity = (maxWillingPrice - currentPrice) * demandMultiplier;

    // Producer Surplus = (Price - Marginal Cost) * Quantity
    let producerSurplus = (currentPrice - marginalCost) * quantity;
    if (producerSurplus < 0) producerSurplus = 0;

    // Consumer Surplus = 0.5 * (Pmax - Price) * Quantity
    let consumerSurplus = 0.5 * (maxWillingPrice - currentPrice) * quantity;

    // Push calculations to Bar Chart
    barChart.data.datasets[0].data = [Math.round(producerSurplus), Math.round(consumerSurplus)];
    barChart.update();

    // 3. Projecting Price vs Access over 10 Years
    let priceData = [];
    for (let year = 1; year <= 10; year++) {
        if (state.patentActive) {
            priceData.push(basePrice); // Monopoly price stays flat
        } else {
            // Simulate generics entering the market progressively up to the slider's max limit
            let activeCompetitorsInYear = 1 + ((state.competitors - 1) * (year / 10));
            let projectedPrice = basePrice * Math.pow(activeCompetitorsInYear, -0.75);
            priceData.push(projectedPrice.toFixed(2));
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

function drawMapLines() {
    const svg = document.getElementById('map-lines');
    svg.innerHTML = `
        <path d="M 22% 35% Q 45% 20% 68% 45%" fill="none" stroke="#fffb00" stroke-width="2" stroke-dasharray="5,5" class="opacity-70" />
        <path d="M 68% 45% Q 60% 60% 52% 60%" fill="none" stroke="#fffb00" stroke-width="2" stroke-dasharray="5,5" class="opacity-70" />
    `;
}