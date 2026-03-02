// --- STATE MANAGEMENT ---
let state = {
    synthesisRoute: 'patented',
    patentActive: true,
    competitors: 1,
    procurement: 1,
    chartsInitialized: false
};

let glViewer = null;

// --- 1. SYNTHESIS LOGIC & WEBGL MOLECULE (DARAPRIM) ---
function initWebGLViewer() {
    let container = document.getElementById("molecule-container");
    glViewer = $3Dmol.createViewer(container, { backgroundColor: "transparent" });

    // CID 4993 is Pyrimethamine (Daraprim)
    $3Dmol.download("cid:4993", glViewer, { onAll: function() {
        // Default to the expensive/monopoly red visualization
        glViewer.setStyle({}, {stick: {radius: 0.15, colorscheme: 'redCarbon'}});
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
        cost.innerText = "$750.00"; 
        cost.className = "text-5xl font-bold text-scrollRed font-mono transition-colors duration-300";
        if(glViewer) {
            // "Monopoly" visualization
            glViewer.setStyle({}, {stick: {radius: 0.15, colorscheme: 'redCarbon'}});
            glViewer.render();
        }
    } else {
        btnAlt.classList.add('border-brandDark', 'bg-white');
        cost.innerText = "$0.10"; 
        cost.className = "text-5xl font-bold text-green-500 font-mono transition-colors duration-300";
        if(glViewer) {
            // "Generic" visualization
            glViewer.setStyle({}, {
                stick: {radius: 0.1, colorscheme: 'greenCarbon'}, 
                sphere: {scale: 0.3, colorscheme: 'greenCarbon'}
            });
            glViewer.render();
        }
    }
    if(state.chartsInitialized) updateCharts();
}

// --- 2. LEGAL LABYRINTH ---
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

// --- 3, 4, 5. CHART.JS LOGIC ---
let barChart, lineChart, sdChart, qalyChart;

function updateCharts() {
    if(!state.chartsInitialized) return;
    state.competitors = parseInt(document.getElementById('slider-comp').value);
    state.procurement = parseInt(document.getElementById('slider-procure').value);
    document.getElementById('val-comp').innerText = state.competitors;
    document.getElementById('val-procure').innerText = state.procurement === 1 ? 'Low' : (state.procurement === 2 ? 'Medium' : 'High');

    const basePrice = 100; 
    let currentPrice = state.patentActive ? basePrice : basePrice * Math.pow(state.competitors, -0.75);
    const maxWillingPrice = 120;
    const marginalCost = 5; 
    const demandMultiplier = 1 + (state.procurement * 0.5); 
    let quantity = (maxWillingPrice - currentPrice) * demandMultiplier;

    let producerSurplus = Math.max(0, (currentPrice - marginalCost) * quantity);
    let consumerSurplus = Math.max(0, 0.5 * (maxWillingPrice - currentPrice) * quantity);

    barChart.data.datasets[0].data = [Math.round(producerSurplus), Math.round(consumerSurplus)];
    barChart.update();

    let priceData = [];
    for (let year = 1; year <= 10; year++) {
        if (state.patentActive) priceData.push(basePrice); 
        else {
            let activeCompetitorsInYear = 1 + ((state.competitors - 1) * (year / 10));
            priceData.push((basePrice * Math.pow(activeCompetitorsInYear, -0.75)).toFixed(2));
        }
    }
    lineChart.data.datasets[0].data = priceData;
    lineChart.data.datasets[0].borderColor = state.patentActive ? '#d92525' : '#22c55e';
    lineChart.data.datasets[0].backgroundColor = state.patentActive ? 'rgba(217, 37, 37, 0.1)' : 'rgba(34, 197, 94, 0.1)';
    lineChart.update();
}

function updateSDChart() {
    if(!state.chartsInitialized) return;
    const sShift = parseInt(document.getElementById('slider-supply-shift').value);
    const dShift = parseInt(document.getElementById('slider-demand-shift').value);
    const a = 120 + dShift; const b = 0.5; const c = 80 - sShift; const d = 0.5; 
    const eqQ = (a - c) / (b + d); const eqP = a - (b * eqQ);

    sdChart.data.datasets[0].data = [{ x: 0, y: c }, { x: 200, y: c + (d * 200) }];
    sdChart.data.datasets[1].data = [{ x: 0, y: a }, { x: 200, y: a - (b * 200) }];
    sdChart.data.datasets[2].data = [{ x: eqQ, y: eqP }]; 
    sdChart.update();

    document.getElementById('eq-price').innerText = `$${eqP.toFixed(2)}`;
    document.getElementById('eq-quantity').innerText = `${eqQ.toFixed(0)} Units`;
}

function updateQALYChart() {
    if(!state.chartsInitialized) return;
    const costPerPatient = parseInt(document.getElementById('slider-qaly-cost').value);
    const fixedBudget = 10000000; 
    const qalyMultiplier = 5; 

    const patientsTreated = Math.floor(fixedBudget / costPerPatient);
    const totalQALYs = patientsTreated * qalyMultiplier;

    document.getElementById('qaly-patients').innerText = patientsTreated.toLocaleString();
    document.getElementById('qaly-total').innerText = totalQALYs.toLocaleString();

    qalyChart.data.datasets[0].data = [patientsTreated, totalQALYs];
    qalyChart.update();
}

// --- 6. DYNAMIC MAP INTERACTIVITY WITH REAL DATA ---
const historicalExportData = {
    2000: 1.5, 2001: 1.9, 2002: 2.3, 2003: 2.8, 2004: 3.5,
    2005: 4.2, 2006: 5.0, 2007: 6.1, 2008: 7.2, 2009: 8.5,
    2010: 9.8, 2011: 11.2, 2012: 13.0, 2013: 14.6, 2014: 15.2,
    2015: 16.4, 2016: 16.8, 2017: 17.3, 2018: 19.1, 2019: 20.6,
    2020: 24.4, 2021: 24.6, 2022: 25.3, 2023: 27.9, 2024: 28.5
};

const regionalData = {
    'India': { share: "100%", color: "text-brandDark", therapy: "API Synthesis & Formulation", detail: "The 'Pharmacy of the World'. India accounts for 20% of global generic exports by volume, operating over 600 FDA-approved manufacturing sites." },
    'USA': { share: "34%", color: "text-red-600", therapy: "Cardiovascular, CNS, Anti-Diabetic", detail: "The largest single export destination. Indian manufacturers hold over 40% of the generic market share in the US, drastically lowering healthcare costs." },
    'Africa': { share: "19%", color: "text-green-500", therapy: "Antiretrovirals (HIV), Antimalarials, Vaccines", detail: "A lifeline for public health. Indian generics supply over 80% of all Antiretroviral (ARV) drugs used globally to combat HIV/AIDS." },
    'Europe': { share: "16%", color: "text-yellow-600", therapy: "Complex Generics, Injectables, Oncology", detail: "A highly regulated market. India is a critical supplier to the UK's NHS and various EU public health systems during shortages." }
};

function selectRegion(regionKey) {
    const data = regionalData[regionKey];
    const panel = document.getElementById('region-info-panel');
    
    document.getElementById('region-title').innerText = regionKey === 'USA' ? 'North America' : regionKey;
    const shareEl = document.getElementById('region-share');
    shareEl.innerText = data.share;
    shareEl.className = `text-4xl font-mono font-bold ${data.color}`;
    
    document.getElementById('region-detail').innerText = data.detail;
    document.getElementById('region-therapy').innerText = `Primary Focus: ${data.therapy}`;
    
    panel.classList.remove('hidden');
    
    const instruct = document.getElementById('map-instruction');
    if(instruct) instruct.style.display = 'none';
}

function updateMap() {
    const year = parseInt(document.getElementById('slider-map-year').value);
    const showAPI = document.getElementById('toggle-api').checked;
    document.getElementById('map-year-display').innerText = year;

    const svg = document.getElementById('dynamic-map-lines');
    const chinaNode = document.getElementById('node-china');
    
    const exportVolume = historicalExportData[year];
    let contextText = "Pre-2005: Market is heavily restricted by TRIPS transition period.";
    
    if (year >= 2005) contextText = "2005 Patents Act amended. Generic scaling rapidly accelerates for Africa/EU.";
    if (year >= 2012) contextText = "Compulsory Licensing and patent invalidations open major US and Global South markets.";
    if (year >= 2020) contextText = "India solidifies role as 'Pharmacy of the World' during COVID-19 and global supply shortages.";

    document.getElementById('export-volume').innerText = `$${exportVolume.toFixed(1)} Billion`;
    document.getElementById('export-context').innerText = contextText;

    const baseWidth = (exportVolume / 5); 
    let paths = '';
    
    if (year >= 2001) paths += `<path d="M 68% 45% Q 60% 60% 52% 60%" fill="none" stroke="#22c55e" stroke-width="${baseWidth}" class="flow-line opacity-80" />`;
    if (year >= 2003) paths += `<path d="M 68% 45% Q 60% 30% 50% 30%" fill="none" stroke="#eab308" stroke-width="${baseWidth * 0.8}" class="flow-line opacity-80" />`;
    if (year >= 2006) paths += `<path d="M 68% 45% Q 45% 20% 22% 35%" fill="none" stroke="#dc2626" stroke-width="${baseWidth * 1.3}" class="flow-line opacity-80" />`;

    if (showAPI) {
        chinaNode.classList.remove('hidden');
        paths += `<path d="M 75% 40% Q 72% 42% 68% 45%" fill="none" stroke="#991b1b" stroke-width="4" stroke-dasharray="10" class="flow-line-reverse opacity-90" />`;
    } else {
        chinaNode.classList.add('hidden');
    }
    svg.innerHTML = paths;
}

// --- 7. HUMAN METRIC: AFFORDABILITY & LERNER INDEX ---
const affordabilityData = {
    drugs: {
        patented: { price: 5000, mc: 20, name: "Bayer's Nexavar (Sorafenib)" },
        generic: { price: 105, mc: 20, name: "Natco's Sorafenib (Compulsory License)" }
    },
    wages: {
        unskilled: { daily: 3.20, name: "Unskilled Laborer (MGNREGA)" },
        salaried: { daily: 15.00, name: "Average Urban Salaried Worker" }
    }
};

function updateAffordabilityWidget() {
    const marketState = document.getElementById('select-market-state').value;
    const wageProfile = document.getElementById('select-wage-profile').value;
    
    const drug = affordabilityData.drugs[marketState];
    const wage = affordabilityData.wages[wageProfile];
    
    document.getElementById('market-price-display').innerText = `Market Price: $${drug.price.toLocaleString()} / month`;
    document.getElementById('wage-display').innerText = `Daily Wage: $${wage.daily.toFixed(2)} / day`;
    
    const daysRequired = Math.round(drug.price / wage.daily);
    
    animateValue("days-worked-val", 0, daysRequired, 800);
    
    document.getElementById('calc-pat-p').innerText = affordabilityData.drugs.patented.price;
    document.getElementById('calc-pat-p2').innerText = affordabilityData.drugs.patented.price;
    document.getElementById('calc-gen-p').innerText = affordabilityData.drugs.generic.price;
    document.getElementById('calc-gen-p2').innerText = affordabilityData.drugs.generic.price;

    renderLaborGrid(daysRequired);
}

function renderLaborGrid(days) {
    const container = document.getElementById('labor-grid-container');
    container.innerHTML = ''; 
    
    const visualCap = 2500; 
    const renderCount = Math.min(days, visualCap);
    
    const medContainer = document.createElement('div');
    medContainer.className = "flex flex-wrap gap-1 mb-6 pb-4 border-b border-gray-300";
    medContainer.innerHTML = `<div class="w-full text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Supply: 30 Days of Medicine</div>`;
    for(let i=0; i<30; i++) medContainer.innerHTML += `<div class="w-3 h-3 border border-gray-400 rounded-sm"></div>`;
    container.appendChild(medContainer);

    const laborContainer = document.createElement('div');
    laborContainer.className = "flex flex-wrap gap-1";
    laborContainer.innerHTML = `<div class="w-full text-xs font-bold text-scrollRed mb-1 uppercase tracking-wide">Cost: ${days.toLocaleString()} Days of Labor</div>`;
    
    let blockHTML = '';
    for(let i=0; i<renderCount; i++) blockHTML += `<div class="labor-block w-3 h-3 bg-scrollRed rounded-sm shadow-sm"></div>`;
    
    if(days > visualCap) blockHTML += `<div class="w-full text-xs font-bold text-gray-500 mt-2 italic">... + ${(days - visualCap).toLocaleString()} more days not shown.</div>`;
    
    laborContainer.innerHTML += blockHTML;
    container.appendChild(laborContainer);
    
    const blocks = document.querySelectorAll('.labor-block');
    blocks.forEach((block, index) => {
        if(index < 200) {
            block.style.opacity = '0';
            setTimeout(() => { block.style.opacity = '1'; }, index * 2);
        }
    });
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    if (obj.animationId) window.cancelAnimationFrame(obj.animationId);
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            obj.animationId = window.requestAnimationFrame(step);
        }
    };
    obj.animationId = window.requestAnimationFrame(step);
}

// --- 8. ANTITRUST & MARKET CONCENTRATION (HHI) ---
function updateHHIWidget() {
    const numFirms = parseInt(document.getElementById('slider-hhi-firms').value);
    
    let shares = [];
    if (numFirms === 1) {
        shares.push(100);
    } else {
        const originatorShare = Math.max(20, 100 - (numFirms * 8)); 
        shares.push(originatorShare);
        
        const remainingShare = 100 - originatorShare;
        const genericShare = remainingShare / (numFirms - 1);
        for(let i=0; i < numFirms - 1; i++) {
            shares.push(genericShare);
        }
    }
    
    let hhi = 0;
    shares.forEach(s => {
        hhi += Math.pow(s, 2);
    });
    hhi = Math.round(hhi);
    
    const scoreVal = document.getElementById('hhi-score-val');
    const badge = document.getElementById('hhi-status-badge');
    
    scoreVal.innerText = hhi.toLocaleString();
    
    if (hhi > 2500) {
        scoreVal.className = "text-5xl font-mono font-bold mb-2 transition-colors duration-300 text-red-500";
        badge.innerText = "Highly Concentrated";
        badge.className = "text-sm font-bold tracking-widest uppercase py-1 px-3 rounded inline-block mt-2 bg-red-900 text-red-200 border border-red-500";
    } else if (hhi >= 1500) {
        scoreVal.className = "text-5xl font-mono font-bold mb-2 transition-colors duration-300 text-yellow-400";
        badge.innerText = "Moderately Concentrated";
        badge.className = "text-sm font-bold tracking-widest uppercase py-1 px-3 rounded inline-block mt-2 bg-yellow-900 text-yellow-200 border border-yellow-500";
    } else {
        scoreVal.className = "text-5xl font-mono font-bold mb-2 transition-colors duration-300 text-green-400";
        badge.innerText = "Unconcentrated (Competitive)";
        badge.className = "text-sm font-bold tracking-widest uppercase py-1 px-3 rounded inline-block mt-2 bg-green-900 text-green-200 border border-green-500";
    }
    
    renderHHIBlocks(shares);
}

function renderHHIBlocks(shares) {
    const container = document.getElementById('hhi-visual-container');
    container.innerHTML = '';
    
    shares.forEach((share, index) => {
        const block = document.createElement('div');
        block.style.width = `${share}%`;
        block.style.height = '100%';
        block.className = `flex flex-col justify-center items-center border-r border-white transition-all duration-500 overflow-hidden ${index === 0 ? 'bg-brandDark text-white' : 'bg-gray-300 text-brandDark'}`;
        
        if (share > 5) {
            block.innerHTML = `<span class="font-bold text-lg">${Math.round(share)}%</span>
                               <span class="text-[10px] uppercase font-mono tracking-tighter opacity-70">${index === 0 ? 'Originator' : 'Generic'}</span>`;
        }
        
        container.appendChild(block);
    });
}

// --- GLOBAL INITIALIZATION (Merged Single Block) ---
document.addEventListener("DOMContentLoaded", function() {
    initWebGLViewer();
    renderCase();

    const barCtx = document.getElementById('barChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    const sdCtx = document.getElementById('sdChart').getContext('2d');
    const qalyCtx = document.getElementById('qalyChart').getContext('2d');

    barChart = new Chart(barCtx, { type: 'bar', data: { labels: ['Private Profit', 'Social Access'], datasets: [{ label: 'Economic Value', backgroundColor: ['#1a1a1a', '#fffb00'], data: [0, 0] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: 3500 } } } });
    lineChart = new Chart(lineCtx, { type: 'line', data: { labels: ['Yr1', 'Yr2', 'Yr3', 'Yr4', 'Yr5', 'Yr6', 'Yr7', 'Yr8', 'Yr9', 'Yr10'], datasets: [{ label: 'Price Index (%)', borderColor: '#d92525', backgroundColor: 'rgba(217, 37, 37, 0.1)', fill: true, data: [], tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 110 } } } });
    sdChart = new Chart(sdCtx, { type: 'scatter', data: { datasets: [{ label: 'Supply (S)', borderColor: '#1d4ed8', backgroundColor: '#1d4ed8', showLine: true, fill: false, tension: 0, data: [] }, { label: 'Demand (D)', borderColor: '#15803d', backgroundColor: '#15803d', showLine: true, fill: false, tension: 0, data: [] }, { label: 'Equilibrium (E)', backgroundColor: '#d92525', pointRadius: 6, data: [] }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Quantity (Q)' }, min: 0, max: 200 }, y: { title: { display: true, text: 'Price (P)' }, min: 0, max: 150 } } } });
    qalyChart = new Chart(qalyCtx, { type: 'bar', data: { labels: ['Patients Treated', 'Total QALYs Gained'], datasets: [{ label: 'Volume', backgroundColor: ['#fffb00', '#4ade80'], data: [0, 0] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 25000 } } } });

    state.chartsInitialized = true;
    
    // Bind all event listeners
    document.getElementById('slider-comp').addEventListener('input', updateCharts);
    document.getElementById('slider-procure').addEventListener('input', updateCharts);
    document.getElementById('slider-supply-shift').addEventListener('input', updateSDChart);
    document.getElementById('slider-demand-shift').addEventListener('input', updateSDChart);
    document.getElementById('slider-qaly-cost').addEventListener('input', updateQALYChart);
    document.getElementById('slider-map-year').addEventListener('input', updateMap);
    document.getElementById('toggle-api').addEventListener('change', updateMap);
    document.getElementById('select-market-state').addEventListener('change', updateAffordabilityWidget);
    document.getElementById('select-wage-profile').addEventListener('change', updateAffordabilityWidget);
    document.getElementById('slider-hhi-firms').addEventListener('input', updateHHIWidget);
    
    // Initialize all widgets
    updateCharts();
    updateSDChart();
    updateQALYChart();
    updateMap();
    updateAffordabilityWidget();
    updateHHIWidget();
});