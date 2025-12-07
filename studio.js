document.addEventListener('DOMContentLoaded', () => {
    let tempFileContent = null; 
    let decryptedData = null;   
    let currentInvoice = null;
    let activePassword = null;
    let currentFileName = "Unknown";
    let currentFileSize = "0 KB";
    let currentInvoiceIndex = 0;
    let productStats = []; 
    let currentChartData = {}; 
    let activeTab = 'preview'; 
    
    let revenueChartInstance = null;
    let qtyChartInstance = null;
    let hourlyChartInstance = null;
    let weeklyChartInstance = null;
    let compositionChartInstance = null;
    let cumulativeChartInstance = null;
    let distributionChartInstance = null; 
    let loyaltyChartInstance = null;      

    const themeToggleBtn = document.getElementById('header-theme-btn');
    
    function applyTheme(theme) {
        if(theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1.25rem;height:1.25rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1.25rem;height:1.25rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
        }
        if (currentChartData && currentChartData.labels) {
            renderAllCharts();
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('swiftinvoice_theme', next);
    });

    const savedTheme = localStorage.getItem('swiftinvoice_theme');
    if (savedTheme) applyTheme(savedTheme);
    else applyTheme('light');


    const ui = {
        viewLanding: document.getElementById('view-landing'),
        viewApp: document.getElementById('view-app'),
        
        landingStateUpload: document.getElementById('landing-state-upload'),
        landingStateAuth: document.getElementById('landing-state-auth'),
        landingDropZone: document.getElementById('landing-drop-zone'),
        landingFileInput: document.getElementById('landing-file-input'),
        landingPassword: document.getElementById('landing-password'),
        landingUnlockBtn: document.getElementById('landing-unlock-btn'),
        landingBackBtn: document.getElementById('landing-back-btn'),
        landingStatus: document.getElementById('landing-status'),
        authFilenameDisplay: document.getElementById('auth-filename-display'),
        
        appSidebar: document.getElementById('app-sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        closeSidebarBtn: document.getElementById('close-sidebar-btn'),
        
        dispName: document.getElementById('display-filename'),
        dispSize: document.getElementById('display-filesize'),
        activityList: document.getElementById('activity-list'),
        fileStatsCard: document.getElementById('file-stats-card'),
        metaDateRange: document.getElementById('meta-date-range'),
        metaInvRange: document.getElementById('meta-inv-range'),
        
        acPlain: document.getElementById('ac-plain'),
        acEnc: document.getElementById('ac-enc'),
        encSettings: document.getElementById('enc-settings'),
        passLogicContainer: document.getElementById('pass-logic-container'),
        newPassGroup: document.getElementById('new-pass-field-group'),
        newPassInput: document.getElementById('new-password-input'),
        radioOptions: document.querySelectorAll('input[name="pass_pref"]'),
        
        finalSaveBtn: document.getElementById('final-save-btn'),
        resetBtn: document.getElementById('reset-btn'),
        pdfBtn: document.getElementById('download-pdf-btn'),
        
        jsonPre: document.getElementById('json-preview'),
        invContent: document.getElementById('invoice-content'),
        invPlaceholder: document.getElementById('invoice-placeholder'),
        
        invSelect: document.createElement('select'),
        
        mobileInvControls: document.getElementById('mobile-invoice-controls'),
        mobInvTrigger: document.getElementById('mob-inv-trigger'),
        mobInvSelectedText: document.getElementById('mob-inv-selected-text'),
        mobInvListContainer: document.getElementById('mob-inv-list-container'),
        mobInvScrollArea: document.getElementById('mob-inv-scroll-area'),
        mobPrevBtn: document.getElementById('mob-prev-btn'),
        mobNextBtn: document.getElementById('mob-next-btn'),

        tabPreview: document.getElementById('tab-btn-preview'),
        tabAnalytics: document.getElementById('tab-btn-analytics'),
        tabRaw: document.getElementById('tab-btn-raw'),
        viewPreview: document.getElementById('content-preview'),
        viewAnalytics: document.getElementById('content-analytics'),
        viewRaw: document.getElementById('content-raw'),
        
        invListContainer: document.getElementById('invoice-list-container'),
        listCount: document.getElementById('list-count'),
        searchInput: document.getElementById('list-search-input'),
        
        statRevenue: document.getElementById('stat-revenue'),
        statNetRevenue: document.getElementById('stat-net-revenue'),
        statTax: document.getElementById('stat-tax'),
        statItemsSold: document.getElementById('stat-items-sold'),
        statCustomers: document.getElementById('stat-customers'),
        statTopProdRev: document.getElementById('stat-top-prod-rev'),
        statTopProdVol: document.getElementById('stat-top-prod-vol'),
        statAvg: document.getElementById('stat-avg'),
        statRevTrend: document.getElementById('stat-rev-trend'),
        analysisPeriod: document.getElementById('analysis-period'), 
        
        executiveSummary: document.getElementById('executive-summary-text'),
        aiSummaryContainer: document.getElementById('ai-summary-container'), 
        
        insightsContainer: document.getElementById('insights-container'),
        insightList: document.getElementById('insight-list'),
        
        topClientsBody: document.getElementById('top-clients-body'),
        productLeaderboardBody: document.getElementById('product-leaderboard-body'),
        
        btnSortQty: document.getElementById('btn-sort-qty'),
        btnSortRev: document.getElementById('btn-sort-rev'),

        btnRevLine: document.getElementById('btn-rev-line'),
        btnRevBar: document.getElementById('btn-rev-bar'),
        btnQtyLine: document.getElementById('btn-qty-line'),
        btnQtyBar: document.getElementById('btn-qty-bar'),
        btnHourLine: document.getElementById('btn-hour-line'),
        btnHourBar: document.getElementById('btn-hour-bar'),
        btnWeekLine: document.getElementById('btn-week-line'),
        btnWeekBar: document.getElementById('btn-week-bar'),
        btnCumLine: document.getElementById('btn-cum-line'),
        btnCumBar: document.getElementById('btn-cum-bar'),
        
        btnDistLine: document.getElementById('btn-dist-line'),
        btnDistBar: document.getElementById('btn-dist-bar'),
        btnLoyLine: document.getElementById('btn-loy-line'),
        btnLoyBar: document.getElementById('btn-loy-bar'),

        ctxRevenue: document.getElementById('chart-revenue'),
        ctxQty: document.getElementById('chart-qty'),
        ctxHourly: document.getElementById('chart-hourly'),
        ctxWeekly: document.getElementById('chart-weekly'),
        ctxComposition: document.getElementById('chart-composition'),
        ctxCumulative: document.getElementById('chart-cumulative'),
        ctxDistribution: document.getElementById('chart-distribution'), 
        ctxLoyalty: document.getElementById('chart-loyalty'),          

        btnLocalLoad: document.getElementById('local-storage-card'),
        txtLocalStatus: document.getElementById('local-storage-status')
    };

    function cleanHtml(str) {
        if (!str) return "";
        let text = str.replace(/<[^>]*>?/gm, '');
        return text.trim();
    }

    const SWIFT_APP_KEY = 'swiftInvoices';

    function checkLocalData() {
        const localRaw = localStorage.getItem(SWIFT_APP_KEY);
        
        if (localRaw) {
            try {
                const data = JSON.parse(localRaw);
                const count = Array.isArray(data) ? data.length : 0;
                
                if (count > 0) {
                    ui.btnLocalLoad.style.opacity = '1';
                    ui.btnLocalLoad.style.pointerEvents = 'auto';
                    ui.btnLocalLoad.style.borderStyle = 'solid';
                    ui.btnLocalLoad.style.borderColor = 'var(--primary)';
                    ui.btnLocalLoad.classList.add('active'); 
                    
                    ui.txtLocalStatus.textContent = `Found ${count} invoice(s) in this browser`;
                    
                    ui.btnLocalLoad.onclick = () => {
                        currentFileName = "SwiftInvoice Data";
                        currentFileSize = "LocalStorage";
                        const wrappedData = JSON.stringify({ invoices: data, encrypted: false, source: 'local_storage' }); 
                        analyzeLandingFile(wrappedData);
                        addHistoryItem(`Loaded ${count} invoices from SwiftInvoice App storage`, 'active');
                        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                        window.history.replaceState({path:newUrl},'',newUrl);
                    };

                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.get('load') === 'local') {
                        ui.btnLocalLoad.click();
                    }
                }
            } catch (e) {
                console.error("Error parsing local data", e);
                ui.txtLocalStatus.textContent = "Error parsing local data. Try uploading a file.";
            }
        }
    }

    function toggleSidebar(show) {
        if (show) {
            ui.appSidebar.classList.add('sidebar-open');
            ui.sidebarOverlay.classList.add('visible');
            if (window.innerWidth < 1024) {
                document.body.classList.add('mobile-menu-open');
            }
        } else {
            ui.appSidebar.classList.remove('sidebar-open');
            ui.sidebarOverlay.classList.remove('visible');
            document.body.classList.remove('mobile-menu-open');
        }
    }
    ui.mobileMenuBtn.addEventListener('click', () => toggleSidebar(true));
    ui.closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    ui.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

    function toggleLandingState(state) {
        ui.landingStatus.classList.add('hidden');
        if (state === 'auth') {
            ui.landingStateUpload.classList.remove('landing-state-active');
            ui.landingStateUpload.classList.add('landing-state-inactive');
            setTimeout(() => {
                ui.landingStateAuth.classList.remove('landing-state-inactive');
                ui.landingStateAuth.classList.add('landing-state-active');
                ui.landingPassword.focus();
            }, 100);
        } else {
            ui.landingStateAuth.classList.remove('landing-state-active');
            ui.landingStateAuth.classList.add('landing-state-inactive');
            ui.landingPassword.value = ''; 
            setTimeout(() => {
                ui.landingStateUpload.classList.remove('landing-state-inactive');
                ui.landingStateUpload.classList.add('landing-state-active');
            }, 100);
        }
    }

    function switchView(viewName) {
        if (viewName === 'app') {
            ui.viewLanding.classList.add('fade-out');
            setTimeout(() => {
                ui.viewLanding.classList.add('hidden');
                ui.viewApp.classList.remove('hidden');
                setTimeout(() => ui.viewApp.classList.add('active'), 50);
            }, 400);
        } else {
            ui.viewApp.classList.remove('active');
            setTimeout(() => {
                ui.viewApp.classList.add('hidden');
                ui.viewLanding.classList.remove('hidden');
                toggleLandingState('upload');
                setTimeout(() => ui.viewLanding.classList.remove('fade-out'), 50);
            }, 400);
        }
    }

    ui.landingDropZone.addEventListener('click', () => ui.landingFileInput.click());
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        ui.landingDropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        ui.landingDropZone.addEventListener(eventName, () => ui.landingDropZone.classList.add('drag-active'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        ui.landingDropZone.addEventListener(eventName, () => ui.landingDropZone.classList.remove('drag-active'), false);
    });
    ui.landingDropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        handleLandingFile(dt.files[0]);
    });
    ui.landingFileInput.addEventListener('change', (e) => handleLandingFile(e.target.files[0]));

    function handleLandingFile(file) {
        if (!file) return;
        if (file.type && file.type !== "application/json" && !file.name.endsWith('.json')) {
            showLandingStatus('Please upload a valid .json file');
            return;
        }
        currentFileName = file.name;
        currentFileSize = (file.size / 1024).toFixed(1) + " KB";
        const reader = new FileReader();
        reader.onload = (event) => {
            tempFileContent = event.target.result;
            analyzeLandingFile(tempFileContent);
        };
        reader.onerror = () => showLandingStatus('Error reading file.');
        reader.readAsText(file);
    }

    function analyzeLandingFile(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            activePassword = null; 
            ui.landingStatus.classList.add('hidden');
            if (data.encrypted) {
                ui.authFilenameDisplay.textContent = currentFileName;
                toggleLandingState('auth');
            } else {
                decryptedData = data.data || data.invoices || data; 
                loadSuccess();
                addHistoryItem(`Loaded ${currentFileName}`, 'active');
                switchView('app');
            }
        } catch (err) {
            showLandingStatus('Invalid JSON file format.');
            console.error(err);
        }
    }

    ui.landingUnlockBtn.addEventListener('click', () => {
        const pass = ui.landingPassword.value;
        if (!pass) return showLandingStatus('Enter a password.');
        try {
            const raw = JSON.parse(tempFileContent);
            const bytes = CryptoJS.AES.decrypt(raw.data, pass);
            const str = bytes.toString(CryptoJS.enc.Utf8);
            if (!str) throw new Error("Decryption failed");
            decryptedData = JSON.parse(str); 
            activePassword = pass; 
            loadSuccess();
            addHistoryItem(`Unlocked ${currentFileName}`, 'active');
            switchView('app');
        } catch (e) {
            showLandingStatus('Incorrect password or corrupted file.');
            ui.landingPassword.value = '';
            ui.landingPassword.focus();
        }
    });

    ui.landingBackBtn.addEventListener('click', () => {
        tempFileContent = null;
        toggleLandingState('upload');
        checkLocalData(); 
    });

    function showLandingStatus(msg) {
        ui.landingStatus.textContent = msg;
        ui.landingStatus.classList.remove('hidden');
    }

    function loadSuccess() {
        ui.dispName.textContent = currentFileName;
        ui.dispName.title = currentFileName; 
        ui.dispSize.textContent = currentFileSize + " • " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        ui.acPlain.classList.remove('active');
        ui.acEnc.classList.remove('active');
        ui.encSettings.classList.add('hidden');
        ui.jsonPre.textContent = JSON.stringify(decryptedData, null, 2);
        
        ui.invSelect.innerHTML = '';
        ui.invListContainer.innerHTML = '';
        
        let invoices = [];
        if (Array.isArray(decryptedData)) {
             invoices = decryptedData;
        } else if (decryptedData.invoices && Array.isArray(decryptedData.invoices)) {
             invoices = decryptedData.invoices;
        }

        decryptedData.invoicesList = invoices; 
        
        updateFileStats(invoices);
        calculateAnalytics(invoices, true); 

        if (invoices.length > 0) {
            renderInvoiceList(invoices);
            selectInvoice(invoices[0].originalIdx !== undefined ? invoices[0].originalIdx : 0);
            ui.pdfBtn.disabled = false; 
        } else {
            ui.invSelect.innerHTML = '<option>No invoices found</option>';
            ui.mobInvSelectedText.textContent = "No invoices found";
            ui.invListContainer.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No invoices found in file.</div>';
            renderInvoice(null, "No invoice data found in this file.");
            ui.pdfBtn.disabled = true;
        }

        switchTab('analytics');
    }

    function updateFileStats(invoices) {
        if (!invoices || invoices.length === 0) {
            ui.fileStatsCard.classList.add('hidden');
            return;
        }
        ui.fileStatsCard.classList.remove('hidden');

        const sortedInvoices = [...invoices].sort((a, b) => {
            const da = a.invoiceDate ? new Date(a.invoiceDate) : new Date(0);
            const db = b.invoiceDate ? new Date(b.invoiceDate) : new Date(0);
            return da - db;
        });

        const dates = sortedInvoices.map(i => i.invoiceDate).filter(d => d);
        if (dates.length > 0) {
            const first = dates[0];
            const last = dates[dates.length - 1];
            ui.metaDateRange.textContent = (first === last) ? first : `${first} to ${last}`;
        } else {
            ui.metaDateRange.textContent = "N/A";
        }

        const nums = invoices.map(i => i.invoiceNumber).filter(n => n).sort();
        if (nums.length > 0) {
            const first = nums[0];
            const last = nums[nums.length - 1];
            ui.metaInvRange.textContent = (first === last) ? first : `${first} to ${last}`;
        } else {
            ui.metaInvRange.textContent = "N/A";
        }
    }

    const parseCurrency = (str) => {
        if (!str) return 0;
        let tempStr = String(str);
        tempStr = tempStr.replace(/[^\d.,-]/g, '');
        if (tempStr.includes(',') && tempStr.includes('.')) {
            if (tempStr.lastIndexOf('.') > tempStr.lastIndexOf(',')) {
                tempStr = tempStr.replace(/,/g, '');
            } else {
                tempStr = tempStr.replace(/\./g, ''); 
                tempStr = tempStr.replace(/,/, '.');
            }
        } else if (tempStr.includes(',')) {
            tempStr = tempStr.replace(/,/g, '.');
        } else if (tempStr.includes('.')) {
             if (tempStr.indexOf('.') !== tempStr.lastIndexOf('.')) {
                 tempStr = tempStr.substring(0, tempStr.lastIndexOf('.')).replace(/\./g, '') + tempStr.substring(tempStr.lastIndexOf('.'));
             } else if (tempStr.match(/\.\d{3}$/)) {
                 tempStr = tempStr.replace(/\./g, '');
             }
        }
        return parseFloat(tempStr) || 0;
    }
    let numberFormatter = null; 

    const formatMoney = (num, currencyCode = 'USD', locale = 'en-US') => {
        if (!numberFormatter || numberFormatter.resolvedOptions().currency !== currencyCode) {
            let formatLocale = 'en-US'; 
            if (currencyCode === 'EUR') formatLocale = 'de-DE'; 
            else if (currencyCode === 'GBP') formatLocale = 'en-GB';
            else if (currencyCode === 'INR') formatLocale = 'en-IN';

            numberFormatter = new Intl.NumberFormat(formatLocale, {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
        return numberFormatter.format(num);
    }
    
    function calculateGrowth(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    function getTrendHtml(percent) {
        if (percent > 0) return `<span class="trend-up">▲ ${percent.toFixed(1)}%</span> vs prev`;
        if (percent < 0) return `<span class="trend-down">▼ ${Math.abs(percent).toFixed(1)}%</span> vs prev`;
        return `<span class="trend-neutral">No change</span>`;
    }

    function calculateAnalytics(invoices, runLoadingEffect = false) {
        if (!invoices || invoices.length === 0) {
            ui.analysisPeriod.textContent = "Analysis Period: No data found";
            ui.executiveSummary.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); padding: 1rem;">No invoice data loaded. Please upload a file to generate an executive summary.</div>`;
            return;
        }

        invoices.forEach((inv, index) => inv.originalIdx = index);

        invoices.sort((a, b) => {
            const dateA = new Date(a.invoiceDate + ' ' + (a.invoiceTime || '00:00:00'));
            const dateB = new Date(b.invoiceDate + ' ' + (b.invoiceTime || '00:00:00'));
            return dateA - dateB;
        });

        const firstInv = invoices[0];
        const latestInv = invoices[invoices.length - 1];
        let startTime = firstInv.invoiceTime || '00:00:00';
        let endTime = latestInv.invoiceTime || '23:59:59';
        const firstDate = new Date(firstInv.invoiceDate + ' ' + startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
        const latestDate = new Date(latestInv.invoiceDate + ' ' + endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
        ui.analysisPeriod.textContent = `Analysis Period: ${firstDate} to ${latestDate}`;

        const midIndex = Math.floor(invoices.length / 2);
        let totalRevenue = 0, totalTax = 0, totalItems = 0;
        let p1Revenue = 0, p2Revenue = 0;
        let clientMap = {};
        let productMap = {};
        let dailyStats = {}; 
        let hourlyStats = new Array(24).fill(0); 
        let weeklyStats = new Array(7).fill(0); 
        let distributionBuckets = {}; 
        let loyaltyStats = {};        
        let knownClients = new Set();
        let uniqueDays = new Set();

        let weekendRevenue = 0;
        let weekdayRevenue = 0;

        invoices.forEach((inv, index) => {
            const grandTotal = parseCurrency(inv.grandTotal);
            const taxVal = parseCurrency(inv.vatTotal);
            
            totalRevenue += grandTotal;
            totalTax += taxVal;
            
            if (index < midIndex) p1Revenue += grandTotal;
            else p2Revenue += grandTotal;

            const dateKey = inv.invoiceDate || "Unknown";
            uniqueDays.add(dateKey);
            
            if (!dailyStats[dateKey]) dailyStats[dateKey] = { rev: 0, qty: 0 };
            dailyStats[dateKey].rev += grandTotal;

            const clientRaw = inv.buyer || 'Unknown Client';
            const clientName = clientRaw.split('<br>')[0].split('<div>')[0].trim() || 'Client';

            if (!loyaltyStats[dateKey]) loyaltyStats[dateKey] = { new: 0, returning: 0 };
            let isNewClient = false;
            if (knownClients.has(clientName)) {
                loyaltyStats[dateKey].returning += grandTotal;
            } else {
                loyaltyStats[dateKey].new += grandTotal;
                knownClients.add(clientName);
                isNewClient = true;
            }

            if (!clientMap[clientName]) clientMap[clientName] = { count: 0, spend: 0, lastSeen: '', isNew: isNewClient };
            clientMap[clientName].count++;
            clientMap[clientName].spend += grandTotal;
            clientMap[clientName].lastSeen = inv.invoiceDate; 

            let bucket = "";
            if(grandTotal <= 100) bucket = "0 - 100";
            else if(grandTotal <= 500) bucket = "101 - 500";
            else if(grandTotal <= 1000) bucket = "501 - 1k";
            else if(grandTotal <= 5000) bucket = "1k - 5k";
            else bucket = "5k+";
            if(!distributionBuckets[bucket]) distributionBuckets[bucket] = 0;
            distributionBuckets[bucket]++;

            if (inv.invoiceTime) {
                const hourPart = inv.invoiceTime.split(':')[0];
                const hourInt = parseInt(hourPart, 10);
                if (!isNaN(hourInt) && hourInt >= 0 && hourInt <= 23) hourlyStats[hourInt] += grandTotal;
            }
            if (inv.invoiceDate) {
                const d = new Date(inv.invoiceDate);
                if (!isNaN(d)) {
                    const dayIdx = d.getDay();
                    weeklyStats[dayIdx] += grandTotal;
                    if(dayIdx === 0 || dayIdx === 6) weekendRevenue += grandTotal;
                    else weekdayRevenue += grandTotal;
                }
            }

            if (inv.items && Array.isArray(inv.items)) {
                inv.items.forEach(item => {
                    const qty = parseFloat(item.qty || 0);
                    totalItems += qty;
                    dailyStats[dateKey].qty += qty;

                    const rawDesc = item.desc || item.code || "Unknown Item";
                    const cleanName = cleanHtml(rawDesc);
                    const pKey = cleanName;

                    if (!productMap[pKey]) productMap[pKey] = { name: cleanName, qty: 0, rev: 0 };
                    const lineTotal = item.incl ? parseCurrency(item.incl) : (parseCurrency(item.excl) + parseCurrency(item.vat));
                    productMap[pKey].qty += qty;
                    productMap[pKey].rev += lineTotal;
                });
            }
        });

        let currencySymbol = '¤'; 
        let currencyCode = 'Currency'; 
        if (invoices.length > 0 && invoices[0].region) {
            const region = invoices[0].region.toUpperCase();
            if (region === 'US') { currencySymbol = '$'; currencyCode = 'USD'; }
            else if (region === 'GB') { currencySymbol = '£'; currencyCode = 'GBP'; }
            else if (['DE', 'FR', 'IT', 'ES', 'NL', 'AT'].includes(region)) { currencySymbol = '€'; currencyCode = 'EUR'; }
            else if (region === 'IN') { currencySymbol = '₹'; currencyCode = 'INR'; } 
            else if (region === 'AE') { currencySymbol = 'AED'; currencyCode = 'AED'; }
            else if (region === 'AU') { currencySymbol = 'A$'; currencyCode = 'AUD'; }
        }

        ui.statRevenue.textContent = currencySymbol + formatMoney(totalRevenue, currencyCode);
        const revGrowth = calculateGrowth(p2Revenue, p1Revenue);
        ui.statRevTrend.innerHTML = getTrendHtml(revGrowth);
        
        const netRevenue = totalRevenue - totalTax;
        ui.statNetRevenue.textContent = currencySymbol + formatMoney(netRevenue, currencyCode);
        ui.statTax.textContent = currencySymbol + formatMoney(totalTax, currencyCode);
        ui.statItemsSold.textContent = totalItems; 
        ui.statCustomers.textContent = Object.keys(clientMap).length; 

        const avgInvValue = invoices.length > 0 ? (totalRevenue / invoices.length) : 0;
        ui.statAvg.textContent = currencySymbol + formatMoney(avgInvValue, currencyCode);

        productStats = Object.values(productMap);
        const productStatsByRev = [...productStats].sort((a,b) => b.rev - a.rev);
        const topProdRevName = productStatsByRev.length > 0 ? productStatsByRev[0].name : '-';
        ui.statTopProdRev.innerHTML = topProdRevName; 
        
        const productStatsByVol = [...productStats].sort((a,b) => b.qty - a.qty);
        const topProdVolName = productStatsByVol.length > 0 ? productStatsByVol[0].name : '-';
        ui.statTopProdVol.innerHTML = topProdVolName;

        const sortedClients = Object.entries(clientMap).sort(([,a], [,b]) => b.spend - a.spend);
        ui.topClientsBody.innerHTML = sortedClients.slice(0, 5).map(([name, data]) => `
            <tr>
                <td class="truncate" style="max-width: 150px;" title="${name}">${name}</td>
                <td style="text-align:center;">${data.count}</td>
                <td style="text-align:right;">${currencySymbol} ${formatMoney(data.spend / data.count, currencyCode)}</td>
                <td style="text-align:right; font-size: 0.8rem;">${data.lastSeen}</td>
                <td style="text-align:right;">${currencySymbol} ${formatMoney(data.spend, currencyCode)}</td>
            </tr>
        `).join('');
        
        renderProductLeaderboard('qty');
        generateSmartInsights(sortedClients, totalRevenue, weeklyStats, hourlyStats, currencyCode);
        
        let growthPct = 0;
        if (p1Revenue > 0) growthPct = ((p2Revenue - p1Revenue) / p1Revenue) * 100;
        else if (p2Revenue > 0) growthPct = 100;
        
        const trendWord = growthPct >= 0 ? 'positive' : 'downward';
        const effectiveTaxRate = netRevenue > 0 ? (totalTax / netRevenue) * 100 : 0;
        
        const uniqueProductCount = Object.keys(productMap).length;
        const topClientEntry = sortedClients.length > 0 ? sortedClients[0] : null;
        const topClientSpend = topClientEntry ? topClientEntry[1].spend : 0;
        const clientConcentration = totalRevenue > 0 ? ((topClientSpend / totalRevenue) * 100).toFixed(1) : 0;
        
        const newClientRevenue = Object.values(loyaltyStats).reduce((sum, day) => sum + day.new, 0);
        const newClientShare = totalRevenue > 0 ? (newClientRevenue / totalRevenue) * 100 : 0;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const bestDayIndex = weeklyStats.indexOf(Math.max(...weeklyStats));
        const bestDayName = days[bestDayIndex];
        
        const maxHourVal = Math.max(...hourlyStats);
        const bestHourIdx = hourlyStats.indexOf(maxHourVal);
        const bestHourRange = `${bestHourIdx.toString().padStart(2, '0')}:00 - ${(bestHourIdx + 1).toString().padStart(2, '0')}:00`;
        
        const weekendShare = totalRevenue > 0 ? (weekendRevenue / totalRevenue) * 100 : 0;
        const dailyAvgRev = uniqueDays.size > 0 ? totalRevenue / uniqueDays.size : 0;

        const summaryHTML = `
            <div class="ai-card fade-in-up delay-1">
                <div class="ai-card-header">
                    <svg class="ai-card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
                    <span>Financial Velocity</span>
                </div>
                <div class="ai-prose">
                    Turnover reached <span class="ai-em">${currencySymbol}${formatMoney(totalRevenue, currencyCode)}</span>, netting <span class="ai-em">${currencySymbol}${formatMoney(netRevenue, currencyCode)}</span>. 
                    The trajectory is currently <span class="ai-em">${trendWord}</span> (${Math.abs(growthPct).toFixed(1)}%). 
                    Averaging <span class="ai-em">${currencySymbol}${formatMoney(dailyAvgRev, currencyCode)}</span> per active trading day.
                </div>
            </div>

            <div class="ai-card fade-in-up delay-2">
                <div class="ai-card-header">
                    <svg class="ai-card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                    <span>Composition</span>
                </div>
                <div class="ai-prose">
                    Driven by <span class="ai-em">${Object.keys(clientMap).length}</span> clients and <span class="ai-em">${uniqueProductCount}</span> distinct products. 
                    Top client dominance is <span class="ai-em">${clientConcentration}%</span>. 
                    New client acquisition contributed <span class="ai-em">${newClientShare.toFixed(1)}%</span> to the total volume.
                </div>
            </div>

            <div class="ai-card fade-in-up delay-3">
                <div class="ai-card-header">
                    <svg class="ai-card-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Rhythm</span>
                </div>
                <div class="ai-prose">
                    Activity peaks on <span class="ai-em">${bestDayName}s</span>, specifically between <span class="ai-em">${bestHourRange}</span>. 
                    Weekend trading accounts for <span class="ai-em">${weekendShare.toFixed(1)}%</span> of total revenue.
                </div>
            </div>
        `;
        
        if (runLoadingEffect) {
            setTimeout(() => {
                ui.executiveSummary.innerHTML = summaryHTML;
            }, 1800); 
        } else {
             ui.executiveSummary.innerHTML = summaryHTML;
        }

        const sortedDates = Object.keys(dailyStats).sort();
        let runningTotal = 0;
        const cumulativeData = sortedDates.map(d => {
            runningTotal += dailyStats[d].rev;
            return runningTotal;
        });

        const bucketOrder = ["0 - 100", "101 - 500", "501 - 1k", "1k - 5k", "5k+"];
        const sortedBuckets = bucketOrder.map(b => distributionBuckets[b] || 0);

        currentChartData = {
            labels: sortedDates,
            revData: sortedDates.map(d => dailyStats[d].rev),
            cumulativeData: cumulativeData,
            qtyData: sortedDates.map(d => dailyStats[d].qty),
            hourlyData: hourlyStats,
            weeklyData: weeklyStats,
            totalRev: totalRevenue,
            totalTax: totalTax,
            currency: currencySymbol,
            currencyCode: currencyCode,
            loyaltyLabels: Object.keys(loyaltyStats).sort(),
            loyaltyNew: Object.keys(loyaltyStats).sort().map(d => loyaltyStats[d].new),
            loyaltyRet: Object.keys(loyaltyStats).sort().map(d => loyaltyStats[d].returning),
            distLabels: bucketOrder,
            distData: sortedBuckets
        };
        renderAllCharts();
    }

    function generateSmartInsights(sortedClients, totalRevenue, weeklyStats, hourlyStats, currencyCode) {
        const insights = [];
        if (sortedClients.length > 0) {
            const top20Count = Math.ceil(sortedClients.length * 0.2);
            const top20Rev = sortedClients.slice(0, top20Count).reduce((sum, [,d]) => sum + d.spend, 0);
            const concentration = (top20Rev / totalRevenue) * 100;
            if (concentration > 60) {
                insights.push(`<b>Pareto Principle:</b> The top ${top20Count} client(s) generate ${concentration.toFixed(0)}% of total revenue.`);
            }
        }
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const bestDayIndex = weeklyStats.indexOf(Math.max(...weeklyStats));
        if (weeklyStats[bestDayIndex] > 0) {
             insights.push(`<b>Peak Day:</b> ${days[bestDayIndex]} is your strongest performing day.`);
        }
        const weekendRev = weeklyStats[0] + weeklyStats[6];
        const weekdayRev = totalRevenue - weekendRev;
        if (weekendRev > weekdayRev) {
            insights.push(`<b>Weekend Warrior:</b> Weekend sales (${formatMoney(weekendRev, currencyCode)}) outperform weekdays.`);
        }
        const morning = hourlyStats.slice(0, 12).reduce((a,b)=>a+b, 0);
        const afternoon = hourlyStats.slice(12).reduce((a,b)=>a+b, 0);
        if (afternoon > morning * 1.5) {
             insights.push(`<b>Afternoon Rush:</b> Most revenue is generated after 12:00 PM.`);
        }
        ui.insightList.innerHTML = insights.map(t => `<li class="insight-li">${t}</li>`).join('');
        ui.insightsContainer.classList.remove('hidden');
        if(insights.length === 0) ui.insightsContainer.classList.add('hidden');
    }

    function getChartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            grid: isDark ? '#27272a' : '#f3f4f6',
            text: isDark ? '#9ca3af' : '#6b7280',
            primary: '#0d9488',
            accent: isDark ? '#8183f1' : '#6366f1', 
            weekly: '#f59e0b'
        };
    }

    function createGradient(ctx, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, color + '80'); 
        gradient.addColorStop(1, color + '05'); 
        return gradient;
    }

    function renderAllCharts() {
        if(revenueChartInstance) revenueChartInstance.destroy();
        if(qtyChartInstance) qtyChartInstance.destroy();
        if(hourlyChartInstance) hourlyChartInstance.destroy();
        if(weeklyChartInstance) weeklyChartInstance.destroy();
        if(compositionChartInstance) compositionChartInstance.destroy();
        if(cumulativeChartInstance) cumulativeChartInstance.destroy(); 
        if(distributionChartInstance) distributionChartInstance.destroy(); 
        if(loyaltyChartInstance) loyaltyChartInstance.destroy();           
        
        const c = getChartColors();
        const currency = currentChartData.currency;
        const currencyCode = currentChartData.currencyCode;
        
        const ctxRevenue = ui.ctxRevenue.getContext('2d');
        const ctxQty = ui.ctxQty.getContext('2d');
        const ctxHourly = ui.ctxHourly.getContext('2d');
        const ctxWeekly = ui.ctxWeekly.getContext('2d');
        const ctxComposition = ui.ctxComposition.getContext('2d');
        const ctxCumulative = ui.ctxCumulative.getContext('2d');
        const ctxDist = ui.ctxDistribution.getContext('2d');
        const ctxLoyalty = ui.ctxLoyalty.getContext('2d');

        cumulativeChartInstance = createChart(ctxCumulative, 'line', currentChartData.labels, currentChartData.cumulativeData, 'Cumulative Revenue', c.accent, c, true, currency, currencyCode);
        
        revenueChartInstance = createChart(ctxRevenue, 'line', currentChartData.labels, currentChartData.revData, 'Daily Revenue', c.primary, c, true, currency, currencyCode);
        
        qtyChartInstance = createChart(ctxQty, 'bar', currentChartData.labels, currentChartData.qtyData, 'Items Sold', c.accent, c, false, '', '');

        const hourLabels = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0') + ':00');
        hourlyChartInstance = createChart(ctxHourly, 'bar', hourLabels, currentChartData.hourlyData, 'Sales Volume', c.primary, c, true, currency, currencyCode);

        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weeklyChartInstance = createChart(ctxWeekly, 'bar', dayLabels, currentChartData.weeklyData, 'Weekly Revenue', c.weekly, c, true, currency, currencyCode);

        const netRev = currentChartData.totalRev - currentChartData.totalTax;
        compositionChartInstance = new Chart(ctxComposition, {
            type: 'doughnut',
            options: {
                 devicePixelRatio: 2,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true, color: c.text, font: { family: 'Inter' } } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let val = context.raw;
                                return context.label + ': ' + currency + formatMoney(val, currencyCode);
                            }
                        }
                    }
                },
                cutout: '75%'
            },
            data: {
                labels: ['Net Revenue', 'Tax Collected'],
                    datasets: [{
                    data: [netRev, currentChartData.totalTax],
                    backgroundColor: [c.primary, '#f43f5e'],
                    borderWidth: 2,
                    borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#000' : '#fff',
                    hoverOffset: 4
                }]
            }
        });

        distributionChartInstance = new Chart(ctxDist, {
            type: 'bar',
            data: {
                labels: currentChartData.distLabels,
                datasets: [{
                    label: 'Invoice Count',
                    data: currentChartData.distData,
                    backgroundColor: c.primary,
                    borderRadius: 4
                }]
            },
            options: {
                devicePixelRatio: 2,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: c.grid }, ticks: { color: c.text } },
                    x: { grid: { display: false }, ticks: { color: c.text } }
                }
            }
        });

        loyaltyChartInstance = new Chart(ctxLoyalty, {
            type: 'bar',
            data: {
                labels: currentChartData.loyaltyLabels,
                datasets: [
                    {
                        label: 'New Customers',
                        data: currentChartData.loyaltyNew,
                        backgroundColor: '#10b981', 
                        stack: 'Stack 0'
                    },
                    {
                        label: 'Returning Customers',
                        data: currentChartData.loyaltyRet,
                        backgroundColor: c.accent,
                        stack: 'Stack 0'
                    }
                ]
            },
            options: {
                devicePixelRatio: 2,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'top', labels: { color: c.text, usePointStyle: true } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + currency + formatMoney(context.raw, currencyCode);
                            }
                        }
                    }
                },
                scales: {
                    y: { stacked: true, beginAtZero:true, grid: { color: c.grid }, ticks: { color: c.text } },
                    x: { stacked: true, grid: { display: false }, ticks: { color: c.text } }
                }
            }
        });
    }

    function createChart(ctx, type, labels, data, label, color, themeColors, isCurrency = false, currencySymbol = '', currencyCode = 'USD') {
        const isLine = type === 'line';
        const bg = isLine ? createGradient(ctx, color) : color;
        const border = color;

        return new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: border,
                    backgroundColor: bg, 
                    borderWidth: isLine ? 2 : 0,
                    fill: isLine, 
                    tension: 0.4, 
                    pointRadius: isLine ? 0 : 0, 
                    pointHoverRadius: 6,
                    borderRadius: isLine ? 0 : 4, 
                    barPercentage: 0.6
                }]
            },
            options: {
                devicePixelRatio: 2, 
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: themeColors.grid === '#27272a' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                        titleColor: themeColors.text,
                        bodyColor: themeColors.text,
                        borderColor: themeColors.grid,
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) {
                                    if(isCurrency) {
                                        label += currencySymbol + formatMoney(context.parsed.y, currencyCode); 
                                    } else {
                                        label += context.parsed.y;
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: themeColors.grid, borderDash: [4, 4] }, 
                        ticks: { 
                            color: themeColors.text,
                            font: { size: 11 },
                            callback: function(value) {
                                if(isCurrency) {
                                    const formatted = formatMoney(value, currencyCode);
                                    if(value >= 1000) return currencySymbol + formatMoney(value/1000, currencyCode).replace(/[.,]00$/, '') + 'k';
                                    return currencySymbol + formatted;
                                }
                                return value;
                            }
                        },
                        border: { display: false }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { color: themeColors.text, font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                        border: { display: false }
                    }
                }
            }
        });
    }


    function setupToggle(btnLine, btnBar, chartKey, label, color) {
        btnLine.addEventListener('click', () => {
            btnLine.classList.add('active');
            btnBar.classList.remove('active');
            updateSingleChart(chartKey, 'line', label, color);
        });
        btnBar.addEventListener('click', () => {
            btnBar.classList.add('active');
            btnLine.classList.remove('active');
            updateSingleChart(chartKey, 'bar', label, color);
        });
    }

    function updateSingleChart(key, type, label, color) {
        const c = getChartColors();
        const currency = currentChartData.currency;
        const currencyCode = currentChartData.currencyCode;
        const isCurrency = ['revenue', 'hourly', 'weekly', 'cumulative', 'loyalty'].includes(key);

        if (key === 'revenue') {
            if(revenueChartInstance) revenueChartInstance.destroy();
            revenueChartInstance = createChart(ui.ctxRevenue.getContext('2d'), type, currentChartData.labels, currentChartData.revData, label, color, c, isCurrency, currency, currencyCode);
        } else if (key === 'qty') {
            if(qtyChartInstance) qtyChartInstance.destroy();
            qtyChartInstance = createChart(ui.ctxQty.getContext('2d'), type, currentChartData.labels, currentChartData.qtyData, label, color, c, isCurrency, currency, currencyCode);
        } else if (key === 'hourly') {
            if(hourlyChartInstance) hourlyChartInstance.destroy();
            const hourLabels = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0') + ':00');
            hourlyChartInstance = createChart(ui.ctxHourly.getContext('2d'), type, hourLabels, currentChartData.hourlyData, label, color, c, isCurrency, currency, currencyCode);
        } else if (key === 'weekly') {
            if(weeklyChartInstance) weeklyChartInstance.destroy();
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            weeklyChartInstance = createChart(ui.ctxWeekly.getContext('2d'), type, dayLabels, currentChartData.weeklyData, label, color, c, isCurrency, currency, currencyCode);
        } else if (key === 'cumulative') { 
            if(cumulativeChartInstance) cumulativeChartInstance.destroy();
            cumulativeChartInstance = createChart(ui.ctxCumulative.getContext('2d'), type, currentChartData.labels, currentChartData.cumulativeData, label, color, c, isCurrency, currency, currencyCode);
        } else if (key === 'distribution') {
            if(distributionChartInstance) distributionChartInstance.destroy();
            distributionChartInstance = createChart(ui.ctxDistribution.getContext('2d'), type, currentChartData.distLabels, currentChartData.distData, label, color, c, false, '', '');
        } else if (key === 'loyalty') {
            if(loyaltyChartInstance) loyaltyChartInstance.destroy();
            
            const ctx = ui.ctxLoyalty.getContext('2d');
            const isLine = type === 'line';
            
            loyaltyChartInstance = new Chart(ctx, {
                type: type,
                data: {
                    labels: currentChartData.loyaltyLabels,
                    datasets: [
                        {
                            label: 'New Customers',
                            data: currentChartData.loyaltyNew,
                            backgroundColor: isLine ? createGradient(ctx, '#10b981') : '#10b981',
                            borderColor: '#10b981',
                            borderWidth: isLine ? 2 : 0,
                            fill: isLine,
                            tension: 0.4,
                            pointRadius: isLine ? 0 : 0,
                            borderRadius: isLine ? 0 : 4,
                            stack: 'Stack 0'
                        },
                        {
                            label: 'Returning Customers',
                            data: currentChartData.loyaltyRet,
                            backgroundColor: isLine ? createGradient(ctx, c.accent) : c.accent,
                            borderColor: c.accent,
                            borderWidth: isLine ? 2 : 0,
                            fill: isLine,
                            tension: 0.4,
                            pointRadius: isLine ? 0 : 0,
                            borderRadius: isLine ? 0 : 4,
                            stack: 'Stack 0'
                        }
                    ]
                },
                options: {
                    devicePixelRatio: 2,
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: { 
                        legend: { position: 'top', labels: { color: c.text, usePointStyle: true } },
                        tooltip: {
                            backgroundColor: c.grid === '#27272a' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                            titleColor: c.text,
                            bodyColor: c.text,
                            borderColor: c.grid,
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + currency + formatMoney(context.raw, currencyCode);
                                }
                            }
                        }
                    },
                    scales: {
                        y: { stacked: true, beginAtZero:true, grid: { color: c.grid }, ticks: { color: c.text } },
                        x: { stacked: true, grid: { display: false }, ticks: { color: c.text } }
                    }
                }
            });
        }
    }

    const teal = '#0d9488';
    const indigo = '#6366f1';
    const orange = '#f59e0b';

    setupToggle(ui.btnCumLine, ui.btnCumBar, 'cumulative', 'Cumulative Revenue', indigo); 
    setupToggle(ui.btnRevLine, ui.btnRevBar, 'revenue', 'Daily Revenue', teal);
    setupToggle(ui.btnQtyLine, ui.btnQtyBar, 'qty', 'Items Sold', indigo);
    setupToggle(ui.btnHourLine, ui.btnHourBar, 'hourly', 'Sales Volume', teal);
    setupToggle(ui.btnWeekLine, ui.btnWeekBar, 'weekly', 'Weekly Revenue', orange);
    setupToggle(ui.btnDistLine, ui.btnDistBar, 'distribution', 'Invoice Count', teal);
    setupToggle(ui.btnLoyLine, ui.btnLoyBar, 'loyalty', 'Loyalty', indigo);


    function renderProductLeaderboard(sortBy) {
        if (sortBy === 'qty') {
            productStats.sort((a, b) => b.qty - a.qty);
            ui.btnSortQty.classList.add('active');
            ui.btnSortRev.classList.remove('active');
        } else {
            productStats.sort((a, b) => b.rev - a.rev);
            ui.btnSortRev.classList.add('active');
            ui.btnSortQty.classList.remove('active');
        }

        if (productStats.length === 0) {
            ui.productLeaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No data available</td></tr>';
            return;
        }

        const currencySymbol = currentChartData.currency || ''; 
        const currencyCode = currentChartData.currencyCode || 'USD'; 

        ui.productLeaderboardBody.innerHTML = productStats.map(p => `
            <tr>
                <td style="font-weight:500; color:var(--text-secondary);">${p.name}</td>
                <td style="text-align:right;">${p.qty}</td>
                <td style="text-align:right; font-family:'Roboto', sans-serif;">${currencySymbol}${formatMoney(p.rev, currencyCode)}</td>
            </tr>
        `).join('');
    }

    ui.btnSortQty.addEventListener('click', () => renderProductLeaderboard('qty'));
    ui.btnSortRev.addEventListener('click', () => renderProductLeaderboard('rev'));


    function renderInvoiceList(invoices) {
        ui.invSelect.innerHTML = ''; 
        ui.invListContainer.innerHTML = '';
        ui.mobInvScrollArea.innerHTML = ''; 
        
        ui.listCount.textContent = invoices.length;

        if (invoices.length === 0) {
             ui.invListContainer.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--text-muted);">No matches found.</div>';
             ui.mobInvScrollArea.innerHTML = '<div style="padding:0.5rem; text-align:center; color:var(--text-muted); font-size:0.8rem;">No matches</div>';
             return;
        }

        invoices.forEach((inv) => {
            const originalIdx = decryptedData.invoicesList.indexOf(inv);
            
            const invNum = inv.invoiceNumber || 'No Num';
            const buyerName = inv.buyer?.split('<br>')[0].split('<div>')[0].trim() || 'Client'; 
            const currencyCode = currentChartData.currencyCode;
            const currencySymbol = currentChartData.currency;

            const div = document.createElement('div');
            div.className = 'invoice-list-item';
            div.dataset.idx = originalIdx;
            const grandTotal = inv.grandTotal ? currencySymbol + formatMoney(parseCurrency(inv.grandTotal), currencyCode) : '0.00';
            div.innerHTML = `
                <div class="inv-item-top">
                    <div class="inv-number">${invNum}</div>
                    <div class="inv-date">${inv.invoiceDate || ''}</div>
                </div>
                <div class="inv-buyer">${buyerName}</div>
                <div class="inv-total">${grandTotal}</div>
            `;
            div.addEventListener('click', () => {
                selectInvoice(originalIdx);
            });
            ui.invListContainer.appendChild(div);
            
            const mobItem = document.createElement('div');
            mobItem.className = 'mob-list-item';
            mobItem.dataset.idx = originalIdx;
            mobItem.innerHTML = `
                <div class="mob-li-info">
                    <div class="mob-li-num">${invNum}</div>
                    <div class="mob-li-client">${buyerName}</div>
                </div>
                <svg class="mob-li-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1rem; height: 1rem;">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            `;
            mobItem.addEventListener('click', (e) => {
                e.stopPropagation(); 
                selectInvoice(originalIdx);
                closeMobileDropdown();
            });
            ui.mobInvScrollArea.appendChild(mobItem);
        });
    }

    ui.searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if (!decryptedData || !decryptedData.invoicesList) return;
        const filtered = decryptedData.invoicesList.filter(inv => {
            const num = (inv.invoiceNumber || '').toLowerCase();
            const buyer = (inv.buyer || '').toLowerCase();
            const date = (inv.invoiceDate || '').toLowerCase();
            return num.includes(term) || buyer.includes(term) || date.includes(term);
        });
        renderInvoiceList(filtered);
        if (filtered.length > 0) {
             selectInvoice(filtered[0].originalIdx);
        } else {
             renderInvoice(null, "No matches found.");
             ui.mobInvSelectedText.textContent = "No matches";
        }
    });
    
    function selectInvoice(idx) {
        idx = parseInt(idx);
        currentInvoiceIndex = idx;

        const items = ui.invListContainer.querySelectorAll('.invoice-list-item');
        items.forEach(item => {
            if (parseInt(item.dataset.idx) === currentInvoiceIndex) {
                item.classList.add('active');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });

        const mobItems = ui.mobInvScrollArea.querySelectorAll('.mob-list-item');
        mobItems.forEach(item => {
            if (parseInt(item.dataset.idx) === currentInvoiceIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (decryptedData.invoicesList && decryptedData.invoicesList[idx]) {
            const data = decryptedData.invoicesList[idx];
            renderInvoice(data);
            
            const invNum = data.invoiceNumber || 'No Num';
            const buyer = data.buyer?.split('<br>')[0].split('<div>')[0].trim() || 'Client'; 
            ui.mobInvSelectedText.textContent = `${invNum} - ${buyer}`;
        }
    }

    function toggleMobileDropdown() {
        const isOpen = ui.mobInvListContainer.classList.contains('open');
        if (isOpen) {
            closeMobileDropdown();
        } else {
            openMobileDropdown();
        }
    }
    function openMobileDropdown() {
        ui.mobInvListContainer.classList.add('open');
    }
    function closeMobileDropdown() {
        ui.mobInvListContainer.classList.remove('open');
    }
    
    ui.mobInvTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileDropdown();
    });

    document.addEventListener('click', (e) => {
        if (!ui.mobileInvControls.contains(e.target)) {
            closeMobileDropdown();
        }
    });

    ui.mobPrevBtn.addEventListener('click', () => {
        const items = Array.from(ui.invListContainer.querySelectorAll('.invoice-list-item'));
        if (items.length === 0) return;
        
        const currentActive = items.find(i => parseInt(i.dataset.idx) === currentInvoiceIndex);
        let currentIndexInList = currentActive ? items.indexOf(currentActive) : 0;
        
        let newIdxInList = currentIndexInList - 1;
        if (newIdxInList < 0) newIdxInList = items.length - 1; 

        const newOriginalIdx = parseInt(items[newIdxInList].dataset.idx);
        selectInvoice(newOriginalIdx);
    });

    ui.mobNextBtn.addEventListener('click', () => {
        const items = Array.from(ui.invListContainer.querySelectorAll('.invoice-list-item'));
        if (items.length === 0) return;
        
        const currentActive = items.find(i => parseInt(i.dataset.idx) === currentInvoiceIndex);
        let currentIndexInList = currentActive ? items.indexOf(currentActive) : 0;
        
        let newIdxInList = currentIndexInList + 1;
        if (newIdxInList >= items.length) newIdxInList = 0; 

        const newOriginalIdx = parseInt(items[newIdxInList].dataset.idx);
        selectInvoice(newOriginalIdx);
    });

    ui.acPlain.addEventListener('click', () => {
        ui.acPlain.classList.add('active');
        ui.acEnc.classList.remove('active');
        ui.encSettings.classList.add('hidden');
        downloadFile(decryptedData, false, null);
    });

    ui.acEnc.addEventListener('click', () => {
        ui.acEnc.classList.add('active');
        ui.acPlain.classList.remove('active');
        ui.encSettings.classList.remove('hidden');
        if (activePassword) {
            ui.passLogicContainer.classList.remove('hidden');
            document.querySelector('input[value="same"]').checked = true;
            ui.newPassGroup.classList.add('hidden');
        } else {
            ui.passLogicContainer.classList.add('hidden'); 
            ui.newPassGroup.classList.remove('hidden');    
            ui.newPassInput.focus();
        }
    });

    ui.radioOptions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'new') {
                ui.newPassGroup.classList.remove('hidden');
                ui.newPassInput.focus();
            } else {
                ui.newPassGroup.classList.add('hidden');
            }
        });
    });

    ui.finalSaveBtn.addEventListener('click', () => {
        let passToUse = null;
        if (activePassword && document.querySelector('input[value="same"]').checked) {
            passToUse = activePassword;
        } else {
            passToUse = ui.newPassInput.value.trim();
        }
        if (!passToUse) {
            alert("Please enter a password to encrypt the file.");
            return;
        }
        downloadFile(decryptedData, true, passToUse);
    });

    ui.resetBtn.addEventListener('click', () => {
        tempFileContent = null; 
        decryptedData = null;   
        currentInvoice = null;
        activePassword = null;
        currentFileName = "Unknown";
        currentFileSize = "0 KB";
        currentInvoiceIndex = 0;
        productStats = []; 
        currentChartData = {}; 
        numberFormatter = null; 
        
        ui.landingFileInput.value = '';
        ui.landingPassword.value = '';
        
        ui.invListContainer.innerHTML = '';
        ui.mobInvScrollArea.innerHTML = '';
        ui.jsonPre.textContent = "Waiting for file...";
        ui.fileStatsCard.classList.add('hidden');
        ui.activityList.innerHTML = ''; 
        
        ui.acPlain.classList.remove('active');
        ui.acEnc.classList.remove('active');
        ui.encSettings.classList.add('hidden');
        ui.searchInput.value = '';

        if(revenueChartInstance) revenueChartInstance.destroy();
        if(qtyChartInstance) qtyChartInstance.destroy();
        if(hourlyChartInstance) hourlyChartInstance.destroy();
        if(weeklyChartInstance) weeklyChartInstance.destroy();
        if(compositionChartInstance) compositionChartInstance.destroy();
        if(cumulativeChartInstance) cumulativeChartInstance.destroy(); 
        if(distributionChartInstance) distributionChartInstance.destroy(); 
        if(loyaltyChartInstance) loyaltyChartInstance.destroy();           
        
        const loadingHTML = `
             <div class="ai-card ai-loading-card">
                 <div class="shim" style="width: 40%; height: 16px; margin-bottom: 12px;"></div>
                 <div class="shim" style="width: 100%; height: 12px;"></div>
                 <div class="shim" style="width: 90%; height: 12px;"></div>
                 <div class="shim" style="width: 70%; height: 12px;"></div>
             </div>
             <div class="ai-card ai-loading-card">
                 <div class="shim" style="width: 40%; height: 16px; margin-bottom: 12px;"></div>
                 <div class="shim" style="width: 100%; height: 12px;"></div>
                 <div class="shim" style="width: 95%; height: 12px;"></div>
             </div>
             <div class="ai-card ai-loading-card">
                 <div class="shim" style="width: 40%; height: 16px; margin-bottom: 12px;"></div>
                 <div class="shim" style="width: 100%; height: 12px;"></div>
                 <div class="shim" style="width: 80%; height: 12px;"></div>
             </div>
        `;
        ui.executiveSummary.classList.remove('ai-loading-placeholder'); 
        ui.executiveSummary.innerHTML = loadingHTML;

        checkLocalData(); 

        toggleSidebar(false);
        switchView('landing');
    });

    function downloadFile(dataObj, isEncrypted, password) {
        if (!dataObj) return;
        let contentStr, fileName;
        const date = new Date().toISOString().split('T')[0];
        
        const exportData = isEncrypted ? dataObj : { data: dataObj, exportTimestamp: new Date().toISOString() };

        if (isEncrypted) {
            try {
                const encrypted = CryptoJS.AES.encrypt(JSON.stringify(exportData), password).toString();
                const fileObj = { encrypted: true, version: '1.0', data: encrypted, exportDate: date };
                contentStr = JSON.stringify(fileObj, null, 2);
                fileName = `SwiftInvoice-Studio_encrypted_${date}.json`;
            } catch (e) {
                alert("Encryption failed. Check password and try again.");
                console.error("Encryption failed:", e);
                return;
            }
        } else {
            contentStr = JSON.stringify(exportData, null, 2);
            fileName = `SwiftInvoice-Studio_unencrypted_${date}.json`;
        }
        try {
            const blob = new Blob([contentStr], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addHistoryItem(`Exported ${isEncrypted ? 'Encrypted' : 'Raw'} File`);
        } catch (e) {
            alert("File download failed.");
            console.error("Download failed:", e);
        }
    }

    function addHistoryItem(msg, type) {
        const li = document.createElement('li');
        li.className = `log-item ${type || ''}`;
        li.innerHTML = `<span class="log-highlight">${msg}</span><span class="log-time">${new Date().toLocaleTimeString()}</span>`;
        ui.activityList.insertBefore(li, ui.activityList.firstChild);
    }

    function renderInvoice(data, msg) {
        if (!data) {
            ui.invContent.classList.add('hidden');
            ui.invPlaceholder.classList.remove('hidden');
            ui.invPlaceholder.innerHTML = `<p>${msg || 'Select an invoice'}</p>`;
            return;
        }
        
        currentInvoice = data;
        ui.invPlaceholder.classList.add('hidden');
        ui.invContent.classList.remove('hidden');
        
        const currencyCode = currentChartData.currencyCode || data.region ? (data.region === 'US' ? 'USD' : data.region === 'GB' ? 'GBP' : data.region === 'IN' ? 'INR' : data.region === 'AE' ? 'AED' : (['DE', 'FR', 'IT', 'ES', 'NL', 'AT'].includes(data.region) ? 'EUR' : 'Currency')) : 'Currency';
        const currencySymbol = currentChartData.currency;

        const itemsHtml = (data.items || []).map(item => {
            const excl = item.excl ? formatMoney(parseCurrency(item.excl), currencyCode) : '0.00';
            const vat = item.vat ? formatMoney(parseCurrency(item.vat), currencyCode) : '0.00';
            const incl = item.incl ? formatMoney(parseCurrency(item.incl), currencyCode) : '0.00';
            
            const desc = (item.desc || '').replace(/\n/g, '<br>');
            
            const serial = item.serial || '';
            const style = item.style || item.color || ''; 
            
            let metaInfo = '';
            if(serial) metaInfo += `<span style="margin-right:8px;">SN: ${serial}</span>`;
            if(style) metaInfo += `<span>Style: ${style}</span>`;
            
            return `
                <tr>
                    <td style="text-align: center;">${item.line || '-'}</td>
                    <td title="${item.code || ''}">${item.code || ''}</td>
                    <td>
                        <div class="desc">${desc}</div>
                        
                        ${metaInfo ? `<div style="font-size: 11px; color: #4b5563; margin-top: 4px;">${metaInfo}</div>` : ''}
                        
                        <div style="font-size: 11px; color: #9ca3af; margin-top: 2px;">
                            Tax: ${item.taxCategory || 'N/A'}
                        </div>
                    </td>
                    <td style="text-align: center;">${item.qty || 1}</td>
                    <td style="text-align: right;">${currencySymbol} ${excl}</td>
                    <td style="text-align: right;">${item.rate || '0%'}</td>
                    <td style="text-align: right;">${currencySymbol} ${vat}</td>
                    <td style="text-align: right;">${currencySymbol} ${incl}</td>
                </tr>
            `;
        }).join('');

        let chargesHtml = '';
        if (data.charges && Array.isArray(data.charges)) {
            chargesHtml = data.charges.map(charge => `
                <tr>
                    <td class="label">${charge.name}</td>
                    <td class="value">${charge.value}</td>
                </tr>
            `).join('');
        }

        let logoHtml = '';
        if (data.logoOption === 'atikle') {
            logoHtml = '<img src="https://atikle.github.io/resource/atikle-logo_multicolor.png" class="invoice-logo" alt="Logo" crossorigin="anonymous">';
        } else if (data.logoOption === 'upload' && data.logoSrc) {
            logoHtml = `<img src="${data.logoSrc}" class="invoice-logo" alt="Logo">`;
        }
        
        const sellerAddress = document.createElement('div');
        sellerAddress.textContent = (data.seller || '').replace(/<div>/g, '').replace(/<\/div>/g, '');
        const buyerAddress = document.createElement('div');
        buyerAddress.textContent = (data.buyer || '').replace(/<div>/g, '').replace(/<\/div>/g, '');
        
        const subtotal = data.subtotal ? formatMoney(parseCurrency(data.subtotal), currencyCode) : '0.00';
        const vatTotal = data.vatTotal ? formatMoney(parseCurrency(data.vatTotal), currencyCode) : '0.00';
        const grandTotal = data.grandTotal ? formatMoney(parseCurrency(data.grandTotal), currencyCode) : '0.00';


        ui.invContent.innerHTML = `
            <div class="invoice-header-row">
                <div class="header-left">
                    <h1 class="title">Invoice</h1>
                    <table class="meta-table">
                        <tbody>
                            <tr><td class="label">Invoice Nr</td><td>${data.invoiceNumber || ''}</td></tr>
                            <tr><td class="label">Invoice Date</td><td>${data.invoiceDate || ''}</td></tr>
                            <tr><td class="label">Invoice Time</td><td>${data.invoiceTime || ''}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="header-right">
                    ${logoHtml}
                </div>
            </div>

            <div class="party-row">
                <div class="party">
                    <h2>Seller</h2>
                    <div class="address">${sellerAddress.innerHTML.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="party">
                    <h2>Buyer</h2>
                    <div class="address">${buyerAddress.innerHTML.replace(/\n/g, '<br>')}</div>
                </div>
            </div>

            <div class="table-wrap">
                <table id="items">
                    <thead>
                        <tr>
                            <th>Line Nr</th>
                            <th>Product Code</th>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Price excl<br/>VAT</th>
                            <th>VAT<br/>rate</th>
                            <th>VAT<br/>amount</th>
                            <th>Price incl<br/>VAT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>

            <div class="totals">
                <div class="box">
                    <div class="currency">${currencyCode}</div>
                    <table>
                        <tbody>
                            <tr>
                                <td class="label">Subtotal</td>
                                <td class="value">${currencySymbol} ${subtotal}</td>
                            </tr>
                            ${chargesHtml}
                            <tr> 
                                <td class="label">VAT</td>
                                <td class="value">${currencySymbol} ${vatTotal}</td>
                            </tr>
                            <tr>
                                <td class="label">Total</td>
                                <td class="value">${currencySymbol} ${grandTotal}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="invoice-footer">
                <span class="invoice-footer-brand">SwiftInvoice  | <strong>StackBase</strong></span>
            </div>
        `;
    }

    ui.pdfBtn.addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const MARGIN = 10; 
        const A4_WIDTH = 210;
        const A4_HEIGHT = 297;
        const CONTENT_WIDTH = A4_WIDTH - 2 * MARGIN; 
        
        let elementToPrint;
        let filename;
        let scale;

        const invoiceElement = document.getElementById('invoice');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        let originalInvoiceBg = '';
        let originalAnalyticsStyles = [];

        if (activeTab === 'analytics') {
            elementToPrint = document.querySelector('#content-analytics .main-content-container');
            filename = 'SwiftInvoice_Analytics.pdf';
            scale = 1.5; 
            
            elementToPrint.querySelectorAll('.analytics-section').forEach(s => {
                originalAnalyticsStyles.push({ el: s, boxShadow: s.style.boxShadow, borderColor: s.style.borderColor });
                s.style.boxShadow = 'none';
                s.style.borderColor = '#e5e7eb';
            });
            
            elementToPrint.querySelectorAll('.ai-container').forEach(s => { 
                originalAnalyticsStyles.push({ el: s, boxShadow: s.style.boxShadow, background: s.style.background, borderColor: s.style.borderColor, color: s.style.color });
                s.style.boxShadow = 'none';
                s.style.borderColor = '#e5e7eb';
                s.style.background = '#ffffff';
                s.style.color = 'black';
            });
            
            elementToPrint.querySelectorAll('.ai-card').forEach(c => {
                 originalAnalyticsStyles.push({ el: c, background: c.style.background, boxShadow: c.style.boxShadow, border: c.style.border });
                 c.style.background = '#ffffff';
                 c.style.boxShadow = 'none';
                 c.style.border = '1px solid #e5e7eb';
            });

            elementToPrint.querySelectorAll('.ai-title-text').forEach(t => { 
                originalAnalyticsStyles.push({ el: t, color: t.style.color });
                t.style.color = '#111827';
            });

            elementToPrint.querySelectorAll('.ai-badge-pill').forEach(b => { 
                originalAnalyticsStyles.push({ el: b, background: b.style.background, boxShadow: b.style.boxShadow, color: b.style.color, border: b.style.border }); 
                b.style.background = '#f3f4f6';
                b.style.boxShadow = 'none';
                b.style.color = '#374151';
                b.style.border = '1px solid #e5e7eb';
            });
            
            elementToPrint.querySelectorAll('.ai-em').forEach(h => { 
                originalAnalyticsStyles.push({ el: h, background: h.style.background, color: h.style.color });
                h.style.background = '#f3f4f6';
                h.style.color = '#111827';
            });
            
            elementToPrint.querySelectorAll('canvas').forEach(c => {
                originalAnalyticsStyles.push({ el: c, backgroundColor: c.style.backgroundColor });
                c.style.backgroundColor = 'white';
            });
            elementToPrint.querySelectorAll('.data-table th').forEach(th => {
                 originalAnalyticsStyles.push({ el: th, backgroundColor: th.style.backgroundColor });
                 th.style.backgroundColor = '#f9fafb';
            });
            
            elementToPrint.style.backgroundColor = 'white';
        } else {
            elementToPrint = invoiceElement;
            const invNum = currentInvoice?.invoiceNumber || 'INV';
            const invClient = currentInvoice?.buyer?.split('<br>')[0].split('<div>')[0].trim() || 'Client';
            filename = `SwiftInvoice_${invNum}_${invClient.replace(/\s/g, '_')}.pdf`;
            scale = 2;
            
            if (isDark) {
                 originalInvoiceBg = invoiceElement.style.backgroundColor;
                 invoiceElement.style.backgroundColor = '#fff';
            }
        }
        
        try {
            await html2canvas(elementToPrint, { 
                scale: scale, 
                logging: false,
                backgroundColor: '#ffffff' 
            }).then(canvas => {
                const img = canvas.toDataURL('image/png');
                const imgWidth = CONTENT_WIDTH; 
                const pageHeight = A4_HEIGHT; 
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = MARGIN; 

                pdf.addImage(img, 'PNG', MARGIN, position, imgWidth, imgHeight); 
                heightLeft -= (pageHeight - MARGIN); 

                while (heightLeft > 0) {
                    position = position - (pageHeight - MARGIN); 

                    pdf.addPage();
                    pdf.addImage(img, 'PNG', MARGIN, position, imgWidth, imgHeight); 
                    heightLeft -= pageHeight;
                }

                pdf.save(filename);
            });
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('PDF export failed. Check console for details.'); 
        } finally {
            if (activeTab === 'analytics') {
                elementToPrint.style.backgroundColor = '';
                originalAnalyticsStyles.forEach(s => {
                    if (s.el.classList.contains('ai-container')) {
                        s.el.style.boxShadow = s.boxShadow;
                        s.el.style.background = s.background;
                        s.el.style.borderColor = s.borderColor;
                        s.el.style.color = s.color;
                    } else if (s.el.classList.contains('ai-card')) {
                         s.el.style.background = s.background;
                         s.el.style.boxShadow = s.boxShadow;
                         s.el.style.border = s.border;
                    } else if (s.el.classList.contains('ai-title-text')) {
                        s.el.style.color = s.color;
                    } else if (s.el.classList.contains('ai-badge-pill')) {
                        s.el.style.background = s.background;
                        s.el.style.boxShadow = s.boxShadow;
                        s.el.style.color = s.color;
                        s.el.style.border = s.border;
                    } else if (s.el.classList.contains('ai-em')) {
                        s.el.style.background = s.background;
                        s.el.style.color = s.color;
                    } else {
                        s.el.style.boxShadow = s.boxShadow;
                        s.el.style.borderColor = s.borderColor;
                        s.el.style.backgroundColor = s.backgroundColor;
                    }
                });
            } else if (isDark) {
                invoiceElement.style.backgroundColor = originalInvoiceBg;
            }
        }
    });

    const switchTab = (view) => {
        activeTab = view;
        ui.viewPreview.classList.add('hidden');
        ui.viewAnalytics.classList.add('hidden');
        ui.viewRaw.classList.add('hidden');
        ui.tabPreview.classList.remove('active');
        ui.tabAnalytics.classList.remove('active');
        ui.tabRaw.classList.remove('active');

        if(view === 'preview') {
            ui.viewPreview.classList.remove('hidden');
            ui.tabPreview.classList.add('active');
            ui.mobileInvControls.classList.add('active'); 
            ui.pdfBtn.disabled = !currentInvoice;
        } else {
            ui.mobileInvControls.classList.remove('active'); 
            if(view === 'raw') {
                ui.viewRaw.classList.remove('hidden');
                ui.tabRaw.classList.add('active');
                ui.pdfBtn.disabled = true;
            } else if (view === 'analytics') {
                ui.viewAnalytics.classList.remove('hidden');
                ui.tabAnalytics.classList.add('active');
                ui.pdfBtn.disabled = !decryptedData || decryptedData.invoicesList.length === 0;
            }
        }
    };
    ui.tabPreview.onclick = () => switchTab('preview');
    ui.tabAnalytics.onclick = () => switchTab('analytics');
    ui.tabRaw.onclick = () => switchTab('raw');

    checkLocalData(); 
});