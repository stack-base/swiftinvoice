document.addEventListener('DOMContentLoaded', () => {
    let currentInvoiceId = null;
    const STORAGE_KEY = 'swiftInvoices';
    const CONFIG_STORAGE_KEY = 'swiftInvoiceConfig'; 
    const USER_PROFILE_KEY = 'swiftInvoiceUser'; 
    const SETUP_COMPLETE_KEY = 'swiftInvoiceSetupComplete'; 
    const ENCRYPTED_EXPORT_VERSION = '1.0'; 
    const THEME_KEY = 'swiftInvoiceTheme'; 
    
    // Viewer URL base
    const VIEWER_URL_BASE = 'https://stack-base.github.io/swiftinvoice/invoice?view=';

    let currentRegion = 'IN'; 
    let currentLogoOption = 'none';
    let currentSortCriteria = 'date-desc'; 
    
    let globalConfig = {
        defaultSeller: 'Your Company\nAddress Line 1\nAddress Line 2',
        defaultRegion: 'IN',
        defaultLogoOption: 'none',
        defaultLogoSrc: '',
        defaultFees: []
    };
    let pendingDefaultRegion = globalConfig.defaultRegion;
    let pendingDefaultLogoOption = globalConfig.defaultLogoOption;
    let pendingDefaultLogoSrc = globalConfig.defaultLogoSrc;

    // --- UTILS ---
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // --- THEME HANDLING ---
    const themeBtn = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1.25rem;height:1.25rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:1.25rem;height:1.25rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;

    function setTheme(theme) {
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            if (themeBtn) themeBtn.innerHTML = sunIcon;
            localStorage.setItem(THEME_KEY, 'dark');
        } else {
            html.removeAttribute('data-theme');
            if (themeBtn) themeBtn.innerHTML = moonIcon;
            localStorage.setItem(THEME_KEY, 'light');
        }
    }
    
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    // --- Element References --- 
    const setupScreen = document.getElementById('setup-screen');
    const setupFinishBtn = document.getElementById('setup-finish-btn');
    const setupUserName = document.getElementById('setup-user-name');
    const setupUserEmail = document.getElementById('setup-user-email');
    const setupGlobalSettingsContainer = document.getElementById('setup-global-settings');
    const importSettingsInputSetup = document.getElementById('import-settings-input-setup');
    const importInvoicesInputSetup = document.getElementById('import-invoices-input-setup');
    
    const userProfileName = document.getElementById('user-profile-name');
    const userProfileEmail = document.getElementById('user-profile-email');

    const userProfileSettingsSection = document.getElementById('user-profile-settings');
    const editUserName = document.getElementById('edit-user-name');
    const editUserEmail = document.getElementById('edit-user-email');
    const saveUserProfileBtn = document.getElementById('save-user-profile-btn');
    const rerunSetupBtn = document.getElementById('rerun-setup-btn');

    const itemsBody = document.getElementById('items-body');
    const addItemBtn = document.getElementById('add-item-btn');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const printBtn = document.getElementById('print-btn');
    const regionTrigger = document.getElementById('region-select-trigger');
    const regionLabel = document.getElementById('region-select-label');
    const regionOptions = document.getElementById('region-select-options');
    const logoTrigger = document.getElementById('logo-select-trigger');
    const logoLabel = document.getElementById('logo-select-label');
    const logoOptionsContainer = document.getElementById('logo-select-options');
    const logoUpload = document.getElementById('logo-upload');
    const invoiceLogo = document.getElementById('invoice-logo');
    const removeLogoBtn = document.getElementById('remove-logo');
    const regionNote = document.getElementById('region-note');
    const dismissNoteBtn = document.getElementById('dismiss-note-btn');
    const sidebar = document.getElementById('history-sidebar');
    const sidebarOpenBtn = document.getElementById('sidebar-open-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    const newInvoiceBtn = document.getElementById('new-invoice-btn');
    const saveInvoiceBtn = document.getElementById('save-invoice-btn');
    const editInvoiceBtn = document.getElementById('edit-invoice-btn');
    const editModeButtons = document.getElementById('edit-mode-buttons');
    const viewModeButtons = document.getElementById('view-mode-buttons');
    const invoiceContainer = document.getElementById('invoice');

    const invoiceList = document.getElementById('invoice-list');
    const invoiceSearch = document.getElementById('invoice-search');
    
    const sortTrigger = document.getElementById('sort-select-trigger');
    const sortLabel = document.getElementById('sort-select-label');
    const sortOptions = document.getElementById('sort-select-options');

    const taxSlabsContainer = document.getElementById('tax-slabs-container'); 
    const taxSlabsTitle = document.getElementById('tax-slabs-title'); 
    const taxSlabsList = document.getElementById('tax-slabs-list'); 
    
    const exportInvoicesBtn = document.getElementById('export-invoices-btn');
    const importInvoicesInput = document.getElementById('import-invoices-input');
    const exportSettingsBtn = document.getElementById('export-settings-btn');
    const importSettingsInput = document.getElementById('import-settings-input');
    const importExportTimestampDisplay = document.getElementById('import-export-timestamp-display');
    const storageUsageDisplay = document.getElementById('storage-usage-display');
    const resetAllDataBtn = document.getElementById('reset-all-data-btn');

    const btnShowInvoices = document.getElementById('btn-show-invoices');
    const btnShowAppSettings = document.getElementById('btn-show-app-settings');
    const invoiceListSection = document.getElementById('invoice-list-section');
    const appSettingsSection = document.getElementById('app-settings-section');
    const appDataSection = document.getElementById('app-data-section');
    
    const addFeeBtn = document.getElementById('add-fee-btn');
    const totalsBody = document.getElementById('totals-body');

    const globalSettingsSection = document.getElementById('global-settings-section');
    const defaultSellerTextarea = document.getElementById('default-seller');
    const defaultRegionTrigger = document.getElementById('default-region-select-trigger');
    const defaultRegionLabel = document.getElementById('default-region-select-label');
    const defaultRegionOptions = document.getElementById('default-region-select-options');
    const defaultLogoTrigger = document.getElementById('default-logo-select-trigger');
    const defaultLogoLabel = document.getElementById('default-logo-select-label');
    const defaultLogoOptions = document.getElementById('default-logo-select-options');
    const defaultLogoUpload = document.getElementById('default-logo-upload');
    const defaultLogoPreview = document.getElementById('default-logo-preview');
    const removeDefaultLogoBtn = document.getElementById('remove-default-logo-btn');
    const defaultFeesList = document.getElementById('default-fees-list');
    const addDefaultFeeBtn = document.getElementById('add-default-fee-btn');
    const saveGlobalSettingsBtn = document.getElementById('save-global-settings-btn');
    
    const qrCodeContainer = document.getElementById('qr-code');

    const countryData = {
        'AE': { name: 'AED (United Arab Emirates) - VAT', currency: 'AED', taxes: [ { category: 'General Goods/Services', rate: 5.0 }, { category: 'Electronics', rate: 5.0 }, { category: 'Basic Foodstuffs', rate: 0.0 }, { category: 'Healthcare (Specific)', rate: 0.0 }, { category: 'Education (Specific)', rate: 0.0 }, { category: 'Local Transport', rate: 0.0 }, { category: 'Exempt', rate: 0.0 } ], defaultTaxCategory: 'General Goods/Services' },
        'US': { name: 'USD (United States) - Sales Tax', currency: 'USD', taxes: [ { category: 'General Goods (Varies)', rate: 0.0 }, { category: 'Services (Varies)', rate: 0.0 }, { category: 'Prepared Food (Varies)', rate: 0.0 }, { category: 'Groceries (Often 0%)', rate: 0.0 }, { category: 'Clothing (Varies)', rate: 0.0 }, { category: 'Prescription Drugs', rate: 0.0 }, { category: 'Exempt', rate: 0.0 } ], defaultTaxCategory: 'General Goods (Varies)' },
        'GB': { name: 'GBP (United Kingdom) - VAT', currency: 'GBP', taxes: [ { category: 'General Goods (20%)', rate: 20.0 }, { category: 'Restaurant/Hotel (20%)', rate: 20.0 }, { category: 'Home Energy (5%)', rate: 5.0 }, { category: 'Children\'s Car Seats (5%)', rate: 5.0 }, { category: 'Most Groceries (0%)', rate: 0.0 }, { category: 'Books & Newspapers (0%)', rate: 0.0 }, { category: 'Medicines (0%)', rate: 0.0 }, { category: 'Children\'s Clothing (0%)', rate: 0.0 } ], defaultTaxCategory: 'General Goods (20%)' },
        'DE': { name: 'EUR (Germany) - VAT', currency: 'EUR', taxes: [ { category: 'General Goods (19%)', rate: 19.0 }, { category: 'Electronics (19%)', rate: 19.0 }, { category: 'Services (19%)', rate: 19.0 }, { category: 'Foodstuffs (7%)', rate: 7.0 }, { category: 'Books/Newspapers (7%)', rate: 7.0 }, { category: 'Public Transport (7%)', rate: 7.0 }, { category: 'Hotel Stays (7%)', rate: 7.0 } ], defaultTaxCategory: 'General Goods (19%)' },
        'FR': { name: 'EUR (France) - VAT', currency: 'EUR', taxes: [ { category: 'General Goods (20%)', rate: 20.0 }, { category: 'Alcohol/Tobacco (20%)', rate: 20.0 }, { category: 'Restaurant/Transport (10%)', rate: 10.0 }, { category: 'Home Repairs (10%)', rate: 10.0 }, { category: 'Most Foodstuffs (5.5%)', rate: 5.5 }, { category: 'Water/Books (5.5%)', rate: 5.5 }, { category: 'Prescription Meds (2.1%)', rate: 2.1 } ], defaultTaxCategory: 'General Goods (20%)' },
        'IN': { name: 'INR (India) - GST', currency: 'INR', taxes: [ { category: 'Services/Computers (18%)', rate: 18.0 }, { category: 'Luxury Goods/Cars (28%)', rate: 28.0 }, { category: 'Processed Food (12%)', rate: 12.0 }, { category: 'Mobile Phones (12%)', rate: 12.0 }, { category: 'Sugar/Tea (5%)', rate: 5.0 }, { category: 'Basic Spices (5%)', rate: 5.0 }, { category: 'Milk/Fresh Veg (0%)', rate: 0.0 }, { category: 'Health/Education (0%)', rate: 0.0 } ], defaultTaxCategory: 'Services/Computers (18%)' }
    };

    // --- HELPER FUNCTIONS ---
    function promptForPassword(action) {
        let password = prompt(`Enter a password to ${action} your backup file. (Leave blank for no encryption/decryption):`);
        return password;
    }

    function encryptData(data, password) {
        if (!password) {
            return {
                encrypted: false,
                data: data,
                exportTimestamp: new Date().toISOString()
            };
        }
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
        return {
            encrypted: true,
            version: ENCRYPTED_EXPORT_VERSION,
            data: encrypted,
            exportTimestamp: new Date().toISOString()
        };
    }

    function decryptData(parsedData, password) {
        if (!parsedData.encrypted) return parsedData;
        if (!password) throw new Error("This file is encrypted. Please provide a password.");
        try {
            const bytes = CryptoJS.AES.decrypt(parsedData.data, password);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedString) throw new Error("Decryption failed.");
            return JSON.parse(decryptedString);
        } catch (e) {
            console.error("Decryption error:", e);
            throw new Error("Decryption failed. Incorrect password or data format.");
        }
    }
    
    function loadUserProfile() {
        try {
            const userJSON = localStorage.getItem(USER_PROFILE_KEY);
            if (userJSON) {
                const user = JSON.parse(userJSON);
                userProfileName.textContent = user.name || 'User';
                userProfileEmail.textContent = user.email || 'No email';
                return user;
            } else {
                userProfileName.textContent = 'Guest User';
                userProfileEmail.textContent = 'Please complete setup';
                return null;
            }
        } catch (e) {
            return null;
        }
    }

    function saveUserProfile(name, email) {
        try {
            const user = { name, email };
            localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
            return user;
        } catch (e) { return null; }
    }

    function populateUserProfileForm() {
        try {
            const userJSON = localStorage.getItem(USER_PROFILE_KEY);
            if (userJSON) {
                const user = JSON.parse(userJSON);
                // Fill App Settings
                if (editUserName) editUserName.value = user.name || '';
                if (editUserEmail) editUserEmail.value = user.email || '';
                // Fill Setup Screen Inputs
                if (setupUserName) setupUserName.value = user.name || '';
                if (setupUserEmail) setupUserEmail.value = user.email || '';
            }
        } catch (e) {}
    }

    function loadGlobalConfig() {
        try {
            const configJSON = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (configJSON) {
                globalConfig = { ...globalConfig, ...JSON.parse(configJSON) };
            }
        } catch (e) {}
        pendingDefaultRegion = globalConfig.defaultRegion;
        pendingDefaultLogoOption = globalConfig.defaultLogoOption;
        pendingDefaultLogoSrc = globalConfig.defaultLogoSrc;
        populateGlobalSettingsForm();
    }

    function populateGlobalSettingsForm() {
        defaultSellerTextarea.value = globalConfig.defaultSeller;
        defaultRegionOptions.innerHTML = '';
        for (const [code, data] of Object.entries(countryData)) {
            const optionBtn = document.createElement('button');
            optionBtn.dataset.value = code;
            optionBtn.textContent = data.name;
            optionBtn.className = "dropdown-option";
            optionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                pendingDefaultRegion = code;
                defaultRegionLabel.textContent = data.name;
                defaultRegionOptions.classList.add('hidden');
            });
            defaultRegionOptions.appendChild(optionBtn);
        }
        defaultRegionLabel.textContent = countryData[globalConfig.defaultRegion]?.name || 'Select Region';

        defaultLogoLabel.textContent = defaultLogoOptions.querySelector(`[data-value="${globalConfig.defaultLogoOption}"]`)?.textContent || 'No Logo';
        if (globalConfig.defaultLogoOption === 'upload' && globalConfig.defaultLogoSrc) {
            defaultLogoPreview.src = globalConfig.defaultLogoSrc;
            defaultLogoPreview.classList.remove('hidden');
            removeDefaultLogoBtn.classList.remove('hidden');
            defaultLogoUpload.classList.add('hidden');
        } else if (globalConfig.defaultLogoOption === 'upload') {
            defaultLogoUpload.classList.remove('hidden');
            defaultLogoPreview.classList.add('hidden');
            removeDefaultLogoBtn.classList.add('hidden');
        } else {
            defaultLogoUpload.classList.add('hidden');
            defaultLogoPreview.classList.add('hidden');
            removeDefaultLogoBtn.classList.add('hidden');
        }

        defaultFeesList.innerHTML = '';
        globalConfig.defaultFees.forEach(fee => {
            addDefaultFeeRow(fee.name, fee.value);
        });
    }

    function addDefaultFeeRow(name = '', value = '') {
        const row = document.createElement('div');
        row.className = 'default-fee-row';
        row.innerHTML = `
            <input type="text" class="default-fee-name" placeholder="Fee Name" value="${name}">
            <input type="text" class="default-fee-value" placeholder="0.00" value="${value}">
            <button class="delete-btn delete-default-fee-btn" title="Remove Fee">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        defaultFeesList.appendChild(row);
    }

    function saveGlobalConfig(notify = false) { 
        try {
            globalConfig.defaultSeller = defaultSellerTextarea.value;
            globalConfig.defaultRegion = pendingDefaultRegion;
            globalConfig.defaultLogoOption = pendingDefaultLogoOption;
            globalConfig.defaultLogoSrc = pendingDefaultLogoSrc;

            globalConfig.defaultFees = [];
            defaultFeesList.querySelectorAll('.default-fee-row').forEach(row => {
                const name = row.querySelector('.default-fee-name').value.trim();
                const value = row.querySelector('.default-fee-value').value.trim();
                if (name && value) {
                    globalConfig.defaultFees.push({ name, value });
                }
            });

            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(globalConfig));
            
            if (notify) {
                saveGlobalSettingsBtn.disabled = true;
                const originalText = saveGlobalSettingsBtn.textContent;
                saveGlobalSettingsBtn.textContent = 'Saved!';
                setTimeout(() => {
                    saveGlobalSettingsBtn.disabled = false;
                    saveGlobalSettingsBtn.textContent = originalText;
                }, 1500);
            }
            return true;
        } catch (e) {
            alert("Error saving settings. LocalStorage might be full.");
            return false;
        }
    }
    
    function calculateLocalStorageUsage() {
        let totalBytes = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalBytes += (key.length + value.length) * 2;
        }
        const totalKB = totalBytes / 1024;
        return totalKB.toFixed(2);
    }

    function updateStorageUsageDisplay() {
        const usage = calculateLocalStorageUsage();
        storageUsageDisplay.textContent = `${usage} KB (Approx)`; 
    }

    saveGlobalSettingsBtn.addEventListener('click', () => saveGlobalConfig(true)); 
    addDefaultFeeBtn.addEventListener('click', () => { addDefaultFeeRow(); });
    defaultFeesList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-default-fee-btn');
        if (deleteBtn) { deleteBtn.closest('.default-fee-row').remove(); }
    });

    defaultRegionTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = !defaultRegionOptions.classList.contains('hidden');
        closeAllDropdowns();
        if (!wasOpen) { defaultRegionOptions.classList.remove('hidden'); }
    });

    defaultLogoTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = !defaultLogoOptions.classList.contains('hidden');
        closeAllDropdowns();
        if (!wasOpen) { defaultLogoOptions.classList.remove('hidden'); }
    });

    defaultLogoOptions.addEventListener('click', (e) => {
        const optionBtn = e.target.closest('.dropdown-option');
        if (optionBtn) {
            e.stopPropagation();
            pendingDefaultLogoOption = optionBtn.dataset.value;
            defaultLogoLabel.textContent = optionBtn.textContent;
            defaultLogoOptions.classList.add('hidden');
            
            if (pendingDefaultLogoOption === 'upload') {
                defaultLogoUpload.classList.remove('hidden');
                if (!pendingDefaultLogoSrc) {
                    defaultLogoPreview.classList.add('hidden');
                    removeDefaultLogoBtn.classList.add('hidden');
                } else {
                    defaultLogoPreview.src = pendingDefaultLogoSrc;
                    defaultLogoPreview.classList.remove('hidden');
                    removeDefaultLogoBtn.classList.remove('hidden');
                }
            } else {
                defaultLogoUpload.classList.add('hidden');
                defaultLogoPreview.classList.add('hidden');
                removeDefaultLogoBtn.classList.add('hidden');
            }
            
            if (pendingDefaultLogoOption === 'atikle') {
                pendingDefaultLogoSrc = 'https://atikle.github.io/resource/atikle-logo_multicolor.png';
            } else if (pendingDefaultLogoOption === 'none') {
                pendingDefaultLogoSrc = '';
            }
        }
    });

    defaultLogoUpload.addEventListener('change', () => {
        const file = defaultLogoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                pendingDefaultLogoSrc = e.target.result;
                defaultLogoPreview.src = pendingDefaultLogoSrc;
                defaultLogoPreview.classList.remove('hidden');
                removeDefaultLogoBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    removeDefaultLogoBtn.addEventListener('click', () => {
        pendingDefaultLogoOption = 'none';
        pendingDefaultLogoSrc = '';
        defaultLogoLabel.textContent = 'No Logo';
        defaultLogoPreview.src = '';
        defaultLogoPreview.classList.add('hidden');
        removeDefaultLogoBtn.classList.add('hidden');
        defaultLogoUpload.classList.add('hidden');
        defaultLogoUpload.value = null;
    });

    function getInvoicesFromStorage() {
        try {
            const invoicesJSON = localStorage.getItem(STORAGE_KEY);
            return invoicesJSON ? JSON.parse(invoicesJSON) : [];
        } catch (e) { return []; }
    }
    function saveInvoicesToStorage(invoices) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
            updateStorageUsageDisplay();
        } catch (e) { console.error(e); }
    }
    function handleInvoiceListUpdate() {
        const searchTerm = invoiceSearch.value.toLowerCase().trim();
        const allInvoices = getInvoicesFromStorage();
        let filteredInvoices = allInvoices;
        if (searchTerm) {
            filteredInvoices = allInvoices.filter(invoice => {
                const buyerName = (invoice.buyer || '').split('\n')[0].trim().toLowerCase();
                const invoiceNumber = (invoice.invoiceNumber || '').toLowerCase();
                return buyerName.includes(searchTerm) || invoiceNumber.includes(searchTerm);
            });
        }
        
        filteredInvoices.sort((a, b) => {
            const buyerA = (a.buyer || '').split('\n')[0].trim().toLowerCase();
            const buyerB = (b.buyer || '').split('\n')[0].trim().toLowerCase();
            const dateA = a.invoiceDate ? new Date(a.invoiceDate) : 0;
            const dateB = b.invoiceDate ? new Date(b.invoiceDate) : 0;
            
            switch (currentSortCriteria) {
                case 'date-asc': return dateA - dateB;
                case 'number-asc': return (a.invoiceNumber || '').localeCompare(b.invoiceNumber || '', undefined, { numeric: true });
                case 'number-desc': return (b.invoiceNumber || '').localeCompare(a.invoiceNumber || '', undefined, { numeric: true });
                case 'buyer-asc': return buyerA.localeCompare(buyerB);
                case 'date-desc': default: return dateB - dateA;
            }
        });

        renderInvoiceList(filteredInvoices, searchTerm);
        updateStorageUsageDisplay();
    }
    function renderInvoiceList(invoices, searchTerm = '') {
        invoiceList.innerHTML = '';
        if (invoices.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-placeholder';
            let message = 'No saved invoices.';
            if (searchTerm) { message = 'No results for "' + searchTerm + '".'; }
            li.innerHTML = `
                <svg class="list-placeholder-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span>${message}</span>
            `;
            invoiceList.appendChild(li);
            return;
        }
        invoices.forEach(invoice => {
            const li = document.createElement('li');
            const buyerName = (invoice.buyer || 'Unknown Buyer').split('\n')[0].trim();
            li.dataset.id = invoice.id;
            li.innerHTML = `
                <button class="list-item-content list-btn-load ${invoice.id === currentInvoiceId ? 'active' : ''}">
                    <strong>${invoice.invoiceNumber || 'Untitled'}</strong>
                    <span>${buyerName} - ${invoice.invoiceDate || 'No Date'}</span>
                </button>
                <div class="list-item-actions">
                    <button class="btn list-btn list-btn-delete" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            `;
            invoiceList.appendChild(li);
        });
    }
    
    function exportInvoices() {
        try {
            const invoices = getInvoicesFromStorage();
            if (invoices.length === 0) {
                alert("No invoices to export.");
                return;
            }
            const password = promptForPassword('encrypt');
            if (password === null) return; 
            
            const exportData = { invoices: invoices };
            const encryptedExport = encryptData(exportData, password);
            const dataStr = JSON.stringify(encryptedExport, null, 2);
            const dataBlob = new Blob([dataStr], {type: "application/json"});
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().split('T')[0];
            a.download = `swiftinvoice_invoices_${timestamp}${encryptedExport.encrypted ? '_encrypted' : ''}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            importExportTimestampDisplay.textContent = `Invoices exported${encryptedExport.encrypted ? ' (ENCRYPTED)' : ''} at ${new Date().toLocaleString()}.`;
        } catch (e) {
            alert("Error exporting invoices. See console for details.");
        }
    }

    function importInvoices(event) {
        const file = event.target.files[0];
        if (!file) return;

        const existingInvoices = getInvoicesFromStorage();
        if (existingInvoices.length > 0) {
             if (!confirm("Are you sure you want to import this file? This will OVERWRITE all existing saved invoices.")) {
                event.target.value = null;
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let parsedData = JSON.parse(content);
                let invoices = [];
                let timestamp = parsedData.exportTimestamp ? new Date(parsedData.exportTimestamp).toLocaleString() : null;
                let isEncrypted = parsedData.encrypted || false;
                
                if (isEncrypted) {
                    const password = promptForPassword('decrypt');
                    if (password === null) {
                        alert("Import canceled. Password required for encrypted file.");
                        return;
                    }
                    parsedData = decryptData(parsedData, password);
                } else if (parsedData.data && !Array.isArray(parsedData) && !parsedData.invoices) {
                    parsedData = parsedData.data;
                }

                if (Array.isArray(parsedData)) {
                    invoices = parsedData;
                    if (!timestamp) timestamp = 'legacy file (no timestamp)';
                } else if (typeof parsedData === 'object' && parsedData !== null && Array.isArray(parsedData.invoices)) {
                    invoices = parsedData.invoices;
                    if (!timestamp && parsedData.exportTimestamp) {
                        try {
                            timestamp = new Date(parsedData.exportTimestamp).toLocaleString();
                        } catch (e) { timestamp = parsedData.exportTimestamp; }
                    } else if (!timestamp) { timestamp = 'no timestamp in file'; }
                } else {
                     throw new Error("Invalid format.");
                }

                saveInvoicesToStorage(invoices);
                clearInvoiceForm();
                handleInvoiceListUpdate();
                importExportTimestampDisplay.textContent = `Invoices imported${isEncrypted ? ' (Decrypted)' : ''} from file created at: ${timestamp}.`;
                alert(`Successfully imported ${invoices.length} invoice(s).`);
            } catch (err) {
                alert(`Error importing data: ${err.message}`);
            } finally {
                event.target.value = null;
            }
        };
        reader.onerror = () => { alert("Error reading file."); event.target.value = null; };
        reader.readAsText(file);
    }
    
    function exportSettings() {
        try {
            saveGlobalConfig(false); 
            const password = promptForPassword('encrypt');
            if (password === null) return; 
            const exportData = { settings: globalConfig, user: loadUserProfile() };
            const encryptedExport = encryptData(exportData, password);
            const dataStr = JSON.stringify(encryptedExport, null, 2);
            const dataBlob = new Blob([dataStr], {type: "application/json"});
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().split('T')[0];
            a.download = `swiftinvoice_settings_${timestamp}${encryptedExport.encrypted ? '_encrypted' : ''}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            importExportTimestampDisplay.textContent = `Settings exported${encryptedExport.encrypted ? ' (ENCRYPTED)' : ''} at ${new Date().toLocaleString()}.`;
        } catch (e) {
            alert("Error exporting settings. See console for details.");
        }
    }

    function importSettings(event) {
        const file = event.target.files[0];
        if (!file) return;

        const isSetupComplete = localStorage.getItem(SETUP_COMPLETE_KEY) === 'true';
        if (isSetupComplete) {
            if (!confirm("Are you sure you want to import settings? This will OVERWRITE all existing app settings.")) {
                event.target.value = null;
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let parsedData = JSON.parse(content);
                let timestamp = parsedData.exportTimestamp ? new Date(parsedData.exportTimestamp).toLocaleString() : null;
                let isEncrypted = parsedData.encrypted || false;
                
                if (isEncrypted) {
                    const password = promptForPassword('decrypt');
                    if (password === null) {
                        alert("Import canceled. Password required for encrypted file.");
                        return;
                    }
                    parsedData = decryptData(parsedData, password);
                } else if (parsedData.data && !parsedData.settings) {
                    parsedData = parsedData.data;
                }
                
                if (typeof parsedData !== 'object' || parsedData === null || !parsedData.settings) {
                    throw new Error("Invalid format.");
                }

                const settings = parsedData.settings;
                
                if (!timestamp && parsedData.exportTimestamp) {
                    try {
                        timestamp = new Date(parsedData.exportTimestamp).toLocaleString();
                    } catch (e) { timestamp = parsedData.exportTimestamp; }
                } else if (!timestamp) { timestamp = 'no timestamp in file'; }

                if (parsedData.user) {
                     saveUserProfile(parsedData.user.name, parsedData.user.email);
                }

                localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(settings));
                loadGlobalConfig();
                populateUserProfileForm(); 
                loadUserProfile(); 
                clearInvoiceForm(); 
                importExportTimestampDisplay.textContent = `Settings imported${isEncrypted ? ' (Decrypted)' : ''} from file created at: ${timestamp}.`;
                alert(`Successfully imported settings.`);
            } catch (err) {
                alert(`Error importing settings: ${err.message}`);
            } finally {
                event.target.value = null;
            }
        };
        reader.onerror = () => { alert("Error reading file."); event.target.value = null; };
        reader.readAsText(file);
    }
    
    // --- VIEW MODE TOGGLE LOGIC ---
    function toggleViewMode(enable) {
        if (enable) {
            // VIEW Mode
            invoiceContainer.classList.add('invoice-view-mode');
            editModeButtons.style.display = 'none';
            viewModeButtons.style.display = 'flex';
            
            // Fix for inputs in PDF/Print: Ensure DOM 'value' attribute matches current JS value
            const inputs = invoiceContainer.querySelectorAll('input');
            inputs.forEach(input => {
                input.setAttribute('value', input.value);
            });
            updateQRCode();
        } else {
            // EDIT Mode
            invoiceContainer.classList.remove('invoice-view-mode');
            editModeButtons.style.display = 'flex';
            viewModeButtons.style.display = 'none';
        }
    }
    
    // Wire up Edit Button
    editInvoiceBtn.addEventListener('click', () => {
        toggleViewMode(false);
    });

    invoiceList.addEventListener('click', (e) => {
        const targetLi = e.target.closest('li');
        if (!targetLi) return;
        const docId = targetLi.dataset.id;
        if (!docId) return;
        const loadBtn = e.target.closest('.list-btn-load');
        const deleteBtn = e.target.closest('.list-btn-delete');
        if (loadBtn) { loadInvoice(docId); }
        if (deleteBtn) {
            let invoices = getInvoicesFromStorage();
            invoices = invoices.filter(inv => inv.id !== docId);
            saveInvoicesToStorage(invoices);
            handleInvoiceListUpdate();
            if (currentInvoiceId === docId) { clearInvoiceForm(); toggleViewMode(false); }
        }
    });

    function loadInvoice(docId) {
        const invoices = getInvoicesFromStorage();
        const invoiceData = invoices.find(inv => inv.id === docId);
        if (invoiceData) {
            setInvoiceDataToDOM(invoiceData);
            currentInvoiceId = docId;
            updateActiveInvoiceInList();
            closeSidebar();
            // Automatically switch to view mode when loading
            toggleViewMode(true); 
        } else {
            console.error("No such document!");
            clearInvoiceForm();
            toggleViewMode(false);
        }
    }
    
    function getInvoiceDataFromDOM() {
        const items = [];
        itemsBody.querySelectorAll('tr.item').forEach(row => {
            const taxCategoryTrigger = row.querySelector('.table-dropdown-trigger');
            const taxCategory = taxCategoryTrigger ? taxCategoryTrigger.textContent.trim() : 'Unknown';
            const serialInput = row.querySelector('.item-serial');
            const styleInput = row.querySelector('.item-style'); 

            items.push({
                line: row.querySelector('.line').textContent,
                code: row.querySelector('.code').textContent,
                desc: row.querySelector('.desc').innerHTML,
                serial: serialInput ? serialInput.value : '',
                style: styleInput ? styleInput.value : '', 
                taxCategory: taxCategory,
                qty: row.querySelector('.qty').textContent,
                excl: row.querySelector('.excl').textContent,
                rate: row.querySelector('.rate-display').textContent,
                vat: row.querySelector('.vat').textContent,
                incl: row.querySelector('.incl').textContent,
            });
        });
        
        const charges = [];
        if (totalsBody) {
            totalsBody.querySelectorAll('tr.charge-row').forEach(row => {
                charges.push({
                    name: row.querySelector('.label').textContent,
                    value: row.querySelector('.value').textContent
                });
            });
        }

        return {
            invoiceNumber: document.getElementById('invoice-number').textContent,
            invoiceDate: document.getElementById('invoice-date').textContent,
            invoiceTime: document.getElementById('invoice-time').textContent, 
            seller: document.getElementById('seller').innerHTML,
            buyer: document.getElementById('buyer').innerHTML,
            region: currentRegion,
            logoOption: currentLogoOption,
            logoSrc: invoiceLogo.src.startsWith('data:') ? invoiceLogo.src : '',
            items: items,
            subtotal: document.getElementById('subtotal').textContent,
            charges: charges, 
            vatTotal: document.getElementById('vat-total').textContent,
            grandTotal: document.getElementById('grand').textContent,
        };
    }
    
    function setInvoiceDataToDOM(data) {
        document.getElementById('invoice-number').textContent = data.invoiceNumber || '';
        document.getElementById('invoice-date').textContent = data.invoiceDate || '';
        document.getElementById('invoice-time').textContent = data.invoiceTime || ''; 
        document.getElementById('seller').innerHTML = data.seller || '';
        document.getElementById('buyer').innerHTML = data.buyer || '';
        document.getElementById('subtotal').textContent = data.subtotal || '0.00';
        document.getElementById('vat-total').textContent = data.vatTotal || '0.00';
        document.getElementById('grand').textContent = data.grandTotal || '0.00';
        
        currentRegion = data.region || globalConfig.defaultRegion; 
        regionLabel.textContent = countryData[currentRegion] ? countryData[currentRegion].name : 'Select Region';
        updateRegion(false); 

        currentLogoOption = data.logoOption || 'none';
        const logoOptionEl = logoOptionsContainer.querySelector(`[data-value="${currentLogoOption}"]`);
        logoLabel.textContent = logoOptionEl ? logoOptionEl.textContent : 'No Logo';
        
        if (currentLogoOption === 'upload' && data.logoSrc) {
            invoiceLogo.src = data.logoSrc;
            invoiceLogo.crossOrigin = null;
        } else if (currentLogoOption === 'atikle') {
            invoiceLogo.src = 'https://atikle.github.io/resource/atikle-logo_multicolor.png';
            invoiceLogo.crossOrigin = "anonymous";
        }
        handleLogoChange(); 

        itemsBody.innerHTML = '';
        if (totalsBody) {
            totalsBody.querySelectorAll('tr.charge-row').forEach(row => row.remove());
        }
        if (data.charges && data.charges.length > 0) {
            data.charges.forEach(charge => {
                addChargeRow(charge.name, charge.value);
            });
        }
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => addNewRow(item));
        } else {
            addNewRow();
        }
        recalcTotals(); 
        updateTaxSlabDisplay(currentRegion); 
        updateQRCode(); // Ensure QR is updated when loading data
    }

    function getNextInvoiceNumber() {
        const allInvoices = getInvoicesFromStorage();
        const prefix = 'INV-';
        let maxNum = 0;
        if (allInvoices.length > 0) {
            allInvoices.forEach(invoice => {
                if (invoice.invoiceNumber && invoice.invoiceNumber.startsWith(prefix)) {
                    const numPart = invoice.invoiceNumber.substring(prefix.length);
                    const num = parseInt(numPart, 10);
                    if (!isNaN(num) && num > maxNum) { maxNum = num; }
                }
            });
        }
        const nextNum = maxNum + 1;
        return `${prefix}${nextNum.toString().padStart(5, '0')}`; 
    }

    function getFormattedCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    }

    function clearInvoiceForm() {
        const defaultData = {
            invoiceNumber: getNextInvoiceNumber(), 
            invoiceDate: new Date().toISOString().split('T')[0],
            invoiceTime: getFormattedCurrentTime(),
            seller: globalConfig.defaultSeller,
            buyer: 'Customer Name\nAddress Line 1\nAddress Line 2',
            region: globalConfig.defaultRegion,
            logoOption: globalConfig.defaultLogoOption,
            logoSrc: globalConfig.defaultLogoSrc,
            items: [],
            subtotal: '0.00',
            charges: JSON.parse(JSON.stringify(globalConfig.defaultFees)), 
            vatTotal: '0.00',
            grandTotal: '0.00',
        };
        setInvoiceDataToDOM(defaultData);
        currentInvoiceId = null;
        updateActiveInvoiceInList();
    }
    
    function updateActiveInvoiceInList() {
        invoiceList.querySelectorAll('.list-item-content').forEach(btn => {
            const li = btn.closest('li');
            if (li && li.dataset.id === currentInvoiceId) { btn.classList.add('active'); } 
            else { btn.classList.remove('active'); }
        });
    }
    function openSidebar() { sidebar.classList.add('mobile-sidebar-open'); sidebarOverlay.classList.remove('hidden'); }
    function closeSidebar() { sidebar.classList.remove('mobile-sidebar-open'); sidebarOverlay.classList.add('hidden'); }
    sidebarOpenBtn.addEventListener('click', openSidebar);
    sidebarCloseBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    btnShowInvoices.addEventListener('click', () => {
        invoiceListSection.classList.remove('hidden');
        appSettingsSection.classList.add('hidden');
        btnShowInvoices.classList.add('active');
        btnShowAppSettings.classList.remove('active');
    });
    btnShowAppSettings.addEventListener('click', () => {
        invoiceListSection.classList.add('hidden');
        appSettingsSection.classList.remove('hidden');
        userProfileSettingsSection.classList.remove('hidden');
        appDataSection.classList.remove('hidden');
        btnShowInvoices.classList.remove('active');
        btnShowAppSettings.classList.add('active');
        populateUserProfileForm();
        updateStorageUsageDisplay();
    });

    saveUserProfileBtn.addEventListener('click', () => {
        const name = editUserName.value;
        const email = editUserEmail.value;
        if (!name) { alert("Please enter a name."); return; }
        saveUserProfile(name, email);
        const savedConfig = saveGlobalConfig(false); 
        if (savedConfig) {
            localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
            initApp();
        }
    });
    
    resetAllDataBtn.addEventListener('click', () => {
        if (confirm("WARNING: This will permanently delete ALL saved invoices and ALL application settings. Are you sure you want to proceed?")) {
            localStorage.clear();
            localStorage.setItem(THEME_KEY, html.getAttribute('data-theme') || 'light'); 
            alert("Application data reset complete. The application will now reload.");
            window.location.reload();
        }
    });

    rerunSetupBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to re-run the setup? This will reload the app.")) {
            localStorage.removeItem(SETUP_COMPLETE_KEY);
            window.location.reload();
        }
    });

    function populateDropdown() {
        regionOptions.innerHTML = '';
        for (const [code, data] of Object.entries(countryData)) {
            const optionBtn = document.createElement('button');
            optionBtn.dataset.value = code;
            optionBtn.textContent = data.name;
            optionBtn.className = "dropdown-option"; 
            optionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentRegion = code;
                regionLabel.textContent = data.name;
                regionOptions.classList.add('hidden');
                updateRegion();
                updateTaxSlabDisplay(currentRegion); 
            });
            regionOptions.appendChild(optionBtn);
        }
        regionLabel.textContent = countryData[currentRegion]?.name || 'Select Region';
        updateTaxSlabDisplay(currentRegion);
    }
    
    logoOptionsContainer.querySelectorAll('.custom-logo-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            currentLogoOption = option.dataset.value;
            logoLabel.textContent = option.textContent;
            logoOptionsContainer.classList.add('hidden');
            handleLogoChange();
        });
    });
    logoLabel.textContent = 'No Logo';

    function closeAllDropdowns() {
        regionOptions.classList.add('hidden');
        logoOptionsContainer.classList.add('hidden');
        sortOptions.classList.add('hidden');
        defaultRegionOptions.classList.add('hidden'); 
        defaultLogoOptions.classList.add('hidden'); 
        document.querySelectorAll('.table-dropdown-panel').forEach(p => p.classList.add('hidden'));
    }

    regionTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = !regionOptions.classList.contains('hidden');
        closeAllDropdowns();
        if (!wasOpen) { regionOptions.classList.remove('hidden'); }
    });
    logoTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = !logoOptionsContainer.classList.contains('hidden');
        closeAllDropdowns();
        if (!wasOpen) { logoOptionsContainer.classList.remove('hidden'); }
    });
    sortTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = !sortOptions.classList.contains('hidden');
        closeAllDropdowns();
        if (!wasOpen) { sortOptions.classList.remove('hidden'); }
    });
    sortOptions.addEventListener('click', (e) => {
        const optionBtn = e.target.closest('.dropdown-option');
        if (optionBtn) {
            e.stopPropagation();
            currentSortCriteria = optionBtn.dataset.value;
            sortLabel.textContent = optionBtn.textContent;
            sortOptions.classList.add('hidden');
            handleInvoiceListUpdate();
        }
    });

    window.addEventListener('click', () => { closeAllDropdowns(); });
    function parseNum(s){
        if(!s) return 0;
        return parseFloat(String(s).replace(/,/g,'').replace(/%/g,'').trim()) || 0;
    }
    function fmt(n){
        if(isNaN(n)) return '0.00';
        return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    function updateTaxSlabDisplay(regionCode) {
        const region = countryData[regionCode];
        if (!region || !region.taxes || region.taxes.length === 0) {
            taxSlabsContainer.classList.add('hidden');
            return;
        }
        taxSlabsTitle.textContent = `Tax Slabs for ${region.name.split(' (')[0].trim()}`;
        taxSlabsList.innerHTML = ''; 
        region.taxes.forEach(tax => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.padding = '0.25rem 0';
            const categorySpan = document.createElement('span');
            categorySpan.textContent = tax.category;
            categorySpan.style.paddingRight = '0.5rem';
            const rateSpan = document.createElement('span');
            rateSpan.textContent = `${tax.rate.toFixed(2)}%`;
            rateSpan.style.fontWeight = '500';
            li.appendChild(categorySpan);
            li.appendChild(rateSpan);
            taxSlabsList.appendChild(li);
        });
        taxSlabsContainer.classList.remove('hidden');
    }

    function recalcTotals(){
        let subtotal=0, vatTotal=0;
        itemsBody.querySelectorAll('.item').forEach(row=>{
            const qty = parseNum(row.querySelector('.qty').textContent);
            const excl = parseNum(row.querySelector('.excl').textContent);
            const vat = parseNum(row.querySelector('.vat').textContent); 
            subtotal += excl * qty; 
            vatTotal += vat;
        });
        let totalCharges = 0;
        if (totalsBody) {
            totalsBody.querySelectorAll('tr.charge-row').forEach(row => {
                const value = parseNum(row.querySelector('.value').textContent);
                totalCharges += value;
            });
        }
        document.getElementById('subtotal').textContent = fmt(subtotal);
        document.getElementById('vat-total').textContent = fmt(vatTotal);
        document.getElementById('grand').textContent = fmt(subtotal + vatTotal + totalCharges);
        updateQRCode(); // Recalculate QR on total changes
    }
    function recalcAllRows() {
        itemsBody.querySelectorAll('tr.item').forEach(calcRow);
        recalcTotals();
    }
    
    function calcRow(row) {
        const qty = parseNum(row.querySelector('.qty').textContent) || 1;
        let exclCell = row.querySelector('.excl');
        let rateCell = row.querySelector('.rate-display');
        let vatCell = row.querySelector('.vat');
        let inclCell = row.querySelector('.incl');
        
        const activeEl = document.activeElement;
        let rateText = rateCell.textContent.trim();
        let rate = parseNum(rateText);
        const isCustomRateSelected = rateCell.contentEditable === 'true';

        if (activeEl === exclCell || activeEl === row.querySelector('.qty') || (isCustomRateSelected && activeEl === rateCell)) {
            if (activeEl === rateCell) {
                rate = parseNum(rateCell.textContent);
                if (!rateCell.textContent.endsWith('%')) { rateCell.textContent = rate.toFixed(2) + '%'; }
            } else if (isCustomRateSelected) {
                rate = parseNum(rateCell.textContent);
            }
            let excl = parseNum(exclCell.textContent);
            const totalExcl = excl * qty;
            const vatAmount = totalExcl * (rate / 100);
            const roundedVatAmount = parseNum(fmt(vatAmount));
            const totalIncl = totalExcl + roundedVatAmount;
            vatCell.textContent = fmt(roundedVatAmount);
            inclCell.textContent = fmt(totalIncl);
        } 
        else if (activeEl === vatCell && isCustomRateSelected === false) {
            let excl = parseNum(exclCell.textContent);
            const totalExcl = excl * qty;
            const vatAmount = parseNum(vatCell.textContent);
            const totalIncl = totalExcl + vatAmount;
            inclCell.textContent = fmt(totalIncl);
        } 
        else if (activeEl === inclCell) {
            const incl = parseNum(inclCell.textContent);
            const totalIncl = incl;
            if (rate > 0) {
                const totalExcl = totalIncl / (1 + rate / 100);
                const exclPerUnit = totalExcl / qty;
                const roundedExclPerUnit = parseNum(fmt(exclPerUnit));
                const roundedTotalExcl = roundedExclPerUnit * qty;
                const vatAmount = totalIncl - roundedTotalExcl;
                exclCell.textContent = fmt(exclPerUnit);
                vatCell.textContent = fmt(vatAmount);
            } else { 
                const exclPerUnit = totalIncl / qty;
                exclCell.textContent = fmt(exclPerUnit);
                vatCell.textContent = fmt(0);
            }
        } 
        else {
            rate = parseNum(rateCell.textContent);
            let excl = parseNum(exclCell.textContent);
            const totalExcl = excl * qty;
            const vatAmount = totalExcl * (rate / 100);
            const roundedVatAmount = parseNum(fmt(vatAmount));
            const totalIncl = totalExcl + roundedVatAmount;
            vatCell.textContent = fmt(roundedVatAmount);
            inclCell.textContent = fmt(totalIncl);
        }
        recalcTotals();
    }
    
    function getCustomTaxOptions(regionCode, selectedCategoryName) {
        const region = countryData[regionCode];
        if (!region) return { optionsHTML: '', selectedName: 'N/A', selectedRate: 0 };
        let selectedRate = 0;
        let selectedName = '';
        let foundSelected = false;

        if (selectedCategoryName === 'Custom') {
             selectedName = 'Custom';
             selectedRate = 0.00; 
             foundSelected = true;
        } else if (selectedCategoryName) {
            const matchingTax = region.taxes.find(tax => tax.category === selectedCategoryName);
            if (matchingTax) {
                selectedRate = matchingTax.rate;
                selectedName = matchingTax.category;
                foundSelected = true;
            }
        }

        if (!foundSelected) {
            const defaultTax = region.taxes.find(t => t.category === region.defaultTaxCategory) || region.taxes[0];
            if (defaultTax) {
                selectedRate = defaultTax.rate;
                selectedName = defaultTax.category;
            }
        }
        
        const optionsHTML = region.taxes.map(tax => {
            return `<button type="button" class="table-dropdown-option" data-value="${tax.category}" data-rate="${tax.rate}">${tax.category}</button>`;
        }).join('');

        const customOption = `<button type="button" class="table-dropdown-option" data-value="Custom" data-rate="0">Custom Rate...</button>`;
        return { optionsHTML: optionsHTML + customOption, selectedName, selectedRate };
    }
    
    function addChargeRow(name = 'New Fee', value = '0.00') {
        const tr = document.createElement('tr');
        tr.className = 'charge-row';
        tr.innerHTML = `
            <td class="label" contenteditable="true">${name}</td>
            <td class="value" contenteditable="true">${value}</td>
            <td class="hide-on-print hide-on-view" style="width: 40px; text-align: right; padding-right: 0;">
                <button class="delete-btn delete-charge-btn" title="Remove Charge">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </td>
        `;
        const vatRow = document.getElementById('vat-row');
        if (vatRow) { vatRow.parentNode.insertBefore(tr, vatRow); }
        recalcTotals(); 
    }

    // UPDATED: Fixed layout to COLUMN (Stacked) and updated widths
    function addNewRow(itemData = null) {
        const tr = document.createElement('tr');
        tr.className = 'item';
        
        const categoryToSelect = itemData ? itemData.taxCategory : null;
        const taxData = getCustomTaxOptions(currentRegion, categoryToSelect);
        
        const line = itemData ? itemData.line : '';
        const code = itemData ? itemData.code : '';
        const desc = itemData ? itemData.desc : 'New Item';
        const qty = itemData ? itemData.qty : '1';
        const excl = itemData ? itemData.excl : '0.00';
        
        const serial = itemData && itemData.serial ? itemData.serial : '';
        const style = itemData && itemData.style ? itemData.style : ''; 

        let rateStr = '0.00%';
        let isCustomRate = false;

        if (taxData.selectedName === 'Custom') {
            rateStr = itemData && itemData.rate ? itemData.rate : '0.00%';
            isCustomRate = true;
        } else {
            rateStr = taxData.selectedRate.toFixed(2) + '%';
        }

        const vat = itemData ? itemData.vat : '0.00';
        const incl = itemData ? itemData.incl : '0.00';
        
        tr.innerHTML = `
            <td contenteditable="true" class="line" data-label="Line Nr">${line}</td>
            <td contenteditable="true" class="code" data-label="Product Code">${code}</td>
            <td data-label="Description">
                <div contenteditable="true" class="desc">${desc}</div>
                <div class="meta-inputs" style="display:flex; flex-direction:column; gap:4px; margin-top:6px;">
                    <input type="text" class="item-serial" placeholder="Serial No / IMEI" value="${serial}" style="width:100%; font-size:11px; padding:4px; border:1px solid #e5e7eb; border-radius:4px; color:#4b5563; font-family:inherit;">
                    <input type="text" class="item-style" placeholder="Style" value="${style}" style="width:100%; font-size:11px; padding:4px; border:1px solid #e5e7eb; border-radius:4px; color:#4b5563; font-family:inherit;">
                </div>
                <div class="tax-category-wrapper" data-label="Tax Category" data-category-print="${taxData.selectedName}">
                    <button type="button" class="table-dropdown-trigger">${taxData.selectedName}</button>
                    <div class="table-dropdown-panel hidden">${taxData.optionsHTML}</div>
                </div>
            </td>
            <td contenteditable="true" class="qty" data-label="Qty">${qty}</td>
            <td contenteditable="true" class="excl" data-label="Price excl VAT">${excl}</td>
            <td contenteditable="${isCustomRate ? 'true' : 'false'}" class="rate-display" data-label="VAT rate">${rateStr}</td>
            <td contenteditable="${isCustomRate ? 'false' : 'true'}" class="vat" data-label="VAT amount">${vat}</td>
            <td contenteditable="true" class="incl" data-label="Price incl VAT">${incl}</td>
            <td class="hide-on-print hide-on-view" data-label="Action">
                <button class="delete-btn" title="Delete row">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </td>
        `;
        itemsBody.appendChild(tr);
        if (!itemData) { tr.querySelector('.desc').focus(); calcRow(tr); }
        updateLineNumbers();
        recalcTotals();
    }
    addItemBtn.addEventListener('click', () => { addNewRow(); });
    function updateLineNumbers(){ itemsBody.querySelectorAll('.line').forEach((c,i)=> c.textContent = i+1); }
    itemsBody.addEventListener('input', (e)=>{
        const row = e.target.closest('tr.item');
        if(!row) return;
        calcRow(row);
        recalcTotals();
    });
    
    // Listen for text changes to update QR
    document.getElementById('invoice').addEventListener('input', debounce(() => {
        updateQRCode();
    }, 500));
        
    itemsBody.addEventListener('click', (e) => {
        e.stopPropagation();
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const row = deleteBtn.closest('tr.item');
            if (row) { row.remove(); updateLineNumbers(); recalcTotals(); }
            return;
        }
        const triggerBtn = e.target.closest('.table-dropdown-trigger');
        if (triggerBtn) {
            const panel = triggerBtn.nextElementSibling;
            const wasOpen = !panel.classList.contains('hidden');
            closeAllDropdowns();
            if (!wasOpen) { panel.classList.remove('hidden'); }
            return; 
        }
        const optionBtn = e.target.closest('.table-dropdown-option');
        if (optionBtn && !optionBtn.closest('#sort-select-options') && !optionBtn.closest('#default-region-select-options') && !optionBtn.closest('#default-logo-select-options')) {
            const row = optionBtn.closest('tr.item');
            if (!row) return;
            
            const categoryName = optionBtn.dataset.value;
            const newRate = parseFloat(optionBtn.dataset.rate);
            
            const trigger = row.querySelector('.table-dropdown-trigger');
            const rateDisplayCell = row.querySelector('.rate-display');
            const vatCell = row.querySelector('.vat');
            const categoryWrapper = row.querySelector('.tax-category-wrapper');

            trigger.textContent = categoryName;
            categoryWrapper.dataset.categoryPrint = categoryName;
            
            if (categoryName === 'Custom') {
                rateDisplayCell.contentEditable = 'true';
                vatCell.contentEditable = 'false';
                rateDisplayCell.textContent = '0.00%'; 
                rateDisplayCell.focus(); 
            } else {
                rateDisplayCell.contentEditable = 'false';
                vatCell.contentEditable = 'true';
                rateDisplayCell.textContent = newRate.toFixed(2) + '%';
            }
            
            optionBtn.closest('.table-dropdown-panel').classList.add('hidden');
            calcRow(row);
            recalcTotals();
            return; 
        }
    });
    
    function updateRegion(showNote = true) {
        const data = countryData[currentRegion];
        if (!data) return;
        document.querySelector('.currency').textContent = data.currency;
        itemsBody.querySelectorAll('tr.item').forEach(row => {
            const trigger = row.querySelector('.table-dropdown-trigger');
            const panel = row.querySelector('.table-dropdown-panel');
            const rateDisplay = row.querySelector('.rate-display');
            const vatCell = row.querySelector('.vat');
            const categoryWrapper = row.querySelector('.tax-category-wrapper');
            const isRateEditable = rateDisplay.contentEditable === 'true';
            
            if (isRateEditable) {
                const taxData = getCustomTaxOptions(currentRegion, "Custom");
                panel.innerHTML = taxData.optionsHTML;
                trigger.textContent = "Custom";
                categoryWrapper.dataset.categoryPrint = "Custom";
            } else {
                const currentCategoryName = trigger.textContent.trim();
                const taxData = getCustomTaxOptions(currentRegion, currentCategoryName);
                let selectedName = taxData.selectedName;
                let selectedRate = taxData.selectedRate;
                if (!countryData[currentRegion].taxes.find(t => t.category === currentCategoryName) && currentCategoryName !== 'Custom') {
                    selectedName = countryData[currentRegion].defaultTaxCategory;
                    selectedRate = countryData[currentRegion].taxes.find(t => t.category === selectedName).rate;
                }
                panel.innerHTML = taxData.optionsHTML;
                trigger.textContent = selectedName;
                rateDisplay.textContent = selectedRate.toFixed(2) + '%';
                categoryWrapper.dataset.categoryPrint = selectedName;
                rateDisplay.contentEditable = 'false'; 
                vatCell.contentEditable = 'true'; 
            }
        });
        recalcAllRows();
        if (showNote) { regionNote.classList.remove('hidden'); }
    }
    
    function handleLogoChange() {
        const selection = currentLogoOption;
        logoUpload.classList.add('hidden'); 
        invoiceLogo.classList.remove('hidden'); 
        removeLogoBtn.classList.remove('hidden'); 
        if (selection === 'none') {
            invoiceLogo.src = '';
            invoiceLogo.classList.add('hidden');
            removeLogoBtn.classList.add('hidden');
            logoUpload.value = null; 
        } 
        else if (selection === 'atikle') {
            invoiceLogo.src = 'https://atikle.github.io/resource/atikle-logo_multicolor.png';
            invoiceLogo.crossOrigin = "anonymous"; 
            logoUpload.value = null; 
        }
        else if (selection === 'upload') {
            logoUpload.classList.remove('hidden');
            if (invoiceLogo.src.startsWith('data:')) {
            } else {
                invoiceLogo.src = '';
                invoiceLogo.classList.add('hidden');
                removeLogoBtn.classList.add('hidden');
            }
        }
        updateQRCode(); // Update QR if logo changes (though base64 images are excluded)
    }

    // --- QR CODE GENERATION ---
    const updateQRCode = debounce(() => {
        try {
            if (!QRCode) return; // Wait for lib to load
            
            const fullData = getInvoiceDataFromDOM();
            
            // Map data to minified keys to save URL space
            // NOTE: We generally omit the base64 logo image from QR code to keep it scannable
            const minified = {
                n: fullData.invoiceNumber,
                d: fullData.invoiceDate,
                t: fullData.invoiceTime,
                s: fullData.seller,
                b: fullData.buyer,
                r: fullData.region,
                l: (fullData.logoOption !== 'upload') ? fullData.logoSrc : null, // Only include logo if it's a URL
                st: fullData.subtotal,
                vt: fullData.vatTotal,
                gt: fullData.grandTotal,
                i: fullData.items.map(i => ({
                    l: i.line,
                    c: i.code,
                    d: i.desc, // Description can be long, might truncate for QR if needed
                    q: i.qty,
                    e: i.excl,
                    r: i.rate,
                    v: i.vat,
                    t: i.incl,
                    sn: i.serial,
                    st: i.style
                })),
                ch: fullData.charges ? fullData.charges.map(c => ({ n: c.name, v: c.value })) : []
            };

            const jsonString = JSON.stringify(minified);
            const compressed = LZString.compressToEncodedURIComponent(jsonString);
            const fullUrl = VIEWER_URL_BASE + compressed;

            qrCodeContainer.innerHTML = '';
            new QRCode(qrCodeContainer, {
                text: fullUrl,
                width: 256,
                height: 256,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        } catch (e) {
            console.error("QR Gen Error", e);
        }
    }, 500);

    logoUpload.addEventListener('change', () => {
        const file = logoUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                invoiceLogo.src = e.target.result;
                invoiceLogo.crossOrigin = null;
                invoiceLogo.classList.remove('hidden');
                removeLogoBtn.classList.remove('hidden');
                updateQRCode();
            };
            reader.readAsDataURL(file);
        }
    });
    removeLogoBtn.addEventListener('click', () => {
        currentLogoOption = 'none'; 
        logoLabel.textContent = 'No Logo'; 
        handleLogoChange(); 
    });
    dismissNoteBtn.addEventListener('click', () => { regionNote.classList.add('hidden'); });
    
    // UPDATED: New Invoice logic starts in EDIT Mode
    newInvoiceBtn.addEventListener('click', () => { 
        clearInvoiceForm(); 
        toggleViewMode(false);
    });

    // UPDATED: Save & View Logic
    saveInvoiceBtn.addEventListener('click', () => {
        const data = getInvoiceDataFromDOM();
        let invoices = getInvoicesFromStorage();
        saveInvoiceBtn.disabled = true;
        const originalText = saveInvoiceBtn.querySelector('.btn-label').textContent;
        saveInvoiceBtn.querySelector('.btn-label').textContent = 'Saving...';
        try {
            if (currentInvoiceId) {
                const index = invoices.findIndex(inv => inv.id === currentInvoiceId);
                if (index > -1) { invoices[index] = { ...data, id: currentInvoiceId }; } 
                else { data.id = currentInvoiceId; invoices.push(data); }
            } else {
                data.id = 'inv_' + Date.now();
                currentInvoiceId = data.id;
                invoices.push(data);
            }
            saveInvoicesToStorage(invoices);
            handleInvoiceListUpdate();
            
            // Switch to VIEW mode on success
            toggleViewMode(true);
            saveInvoiceBtn.querySelector('.btn-label').textContent = 'Saved!';
        } catch (error) {
            console.error("Error saving invoice: ", error);
            saveInvoiceBtn.querySelector('.btn-label').textContent = 'Error!';
        } finally {
            setTimeout(() => {
                saveInvoiceBtn.disabled = false;
                saveInvoiceBtn.querySelector('.btn-label').textContent = originalText;
            }, 1000);
        }
    });
    invoiceSearch.addEventListener('input', handleInvoiceListUpdate);
    
    exportInvoicesBtn.addEventListener('click', exportInvoices);
    importInvoicesInput.addEventListener('change', importInvoices);
    exportSettingsBtn.addEventListener('click', exportSettings);
    importSettingsInput.addEventListener('change', importSettings);
    importInvoicesInputSetup.addEventListener('change', importInvoices);
    importSettingsInputSetup.addEventListener('change', importSettings);

    printBtn.addEventListener('click', () => {
        itemsBody.querySelectorAll('.tax-category-wrapper').forEach(cell => {
            const trigger = cell.querySelector('.table-dropdown-trigger');
            if (trigger) { cell.dataset.categoryPrint = trigger.textContent.trim(); }
        });
        window.print();
    });
    
    // UPDATED: PDF Generation (Render width 800px + Style logic + Tax removal)
    generatePdfBtn.addEventListener('click', async () => {
        const invoiceEl = document.getElementById('invoice');
        if(document.activeElement) document.activeElement.blur();
        generatePdfBtn.disabled = true;
        const originalBtnHtml = generatePdfBtn.innerHTML;
        generatePdfBtn.innerHTML = `
            <svg class="btn-icon animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" style="opacity: 0.75;"></path>
            </svg>
            <span class="btn-label sm:inline">Generating...</span>
        `;
        const elementsToHide = document.querySelectorAll('.hide-on-print');
        elementsToHide.forEach(el => el.style.display = 'none');
        const appContainer = document.querySelector('.app-container');
        const originalShadow = appContainer.style.boxShadow;
        const originalBorder = invoiceEl.style.border;
        const originalMinHeight = invoiceEl.style.minHeight;
        appContainer.style.boxShadow = 'none';
        invoiceEl.style.border = 'none';
        invoiceEl.style.minHeight = 'auto'; 
        itemsBody.querySelectorAll('.tax-category-wrapper').forEach(cell => {
            const trigger = cell.querySelector('.table-dropdown-trigger');
            if (trigger) { cell.dataset.categoryPrint = trigger.textContent.trim(); }
        });
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = pdf.internal.pageSize.getHeight();
            const margin = 15; 
            const contentWidth = pdfW - (margin * 2);
            const pageContentHeight = pdfH - (margin * 2);
            let currentY = margin; 
            const invoiceNumber = document.getElementById('invoice-number').textContent.trim() || 'Invoice';

            async function renderElement(element, pdf) {
                const clonedEl = element.cloneNode(true);
                clonedEl.style.width = '100%';
                clonedEl.style.boxSizing = 'border-box';
                clonedEl.querySelectorAll('[contenteditable]').forEach(el => {
                    el.style.outline = 'none';
                    clonedEl.style.background = 'transparent';
                });
                clonedEl.querySelectorAll('.table-dropdown-trigger, .table-dropdown-panel, .delete-btn, .hide-on-print, .hide-on-view').forEach(el => {
                    el.parentNode.removeChild(el);
                });
                
                // UPDATED: Convert Serial/Style inputs to text for PDF (Updated logic for Style)
                const originalInputs = element.querySelectorAll('input.item-serial, input.item-style');
                const clonedInputs = clonedEl.querySelectorAll('input.item-serial, input.item-style');
                if (originalInputs.length > 0 && clonedInputs.length > 0) {
                    clonedInputs.forEach((input, index) => {
                        const val = originalInputs[index].value; 
                        const span = document.createElement('div');
                        // Logic updated to check for item-style instead of item-color
                        span.textContent = val ? (input.classList.contains('item-serial') ? `SN: ${val}` : `Style: ${val}`) : '';
                        span.style.fontSize = '10px';
                        span.style.color = '#6b7280';
                        span.style.marginTop = '2px';
                        if (val) { input.parentNode.replaceChild(span, input); } 
                        else { input.remove(); }
                    });
                }

                // REMOVE TAX SLAB FROM PDF
                clonedEl.querySelectorAll('.tax-category-wrapper').forEach(cell => {
                    cell.remove(); 
                });
                
                const renderContainer = document.createElement('div');
                renderContainer.style.position = 'absolute';
                renderContainer.style.left = '-9999px';
                // FIXED: Width 800px to fix zoom issue
                renderContainer.style.width = `800px`; 
                renderContainer.style.background = '#fff';
                renderContainer.style.padding = '0'; 
                renderContainer.style.margin = '0';
                renderContainer.style.fontFamily = "'Inter', Arial, sans-serif";
                renderContainer.style.fontSize = '12px';
                renderContainer.appendChild(clonedEl);
                document.body.appendChild(renderContainer);
                const canvas = await html2canvas(renderContainer, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: renderContainer.scrollWidth,
                    height: renderContainer.scrollHeight 
                });
                document.body.removeChild(renderContainer); 
                const imgData = canvas.toDataURL('image/png');
                const canvasW = canvas.width;
                const canvasH = canvas.height;
                const ratio = canvasH / canvasW;
                const imgW = contentWidth;
                const imgH = imgW * ratio;
                if (currentY + imgH > pageContentHeight) {
                    pdf.addPage();
                    currentY = margin;
                }
                pdf.addImage(imgData, 'PNG', margin, currentY, imgW, imgH, undefined, 'FAST');
                currentY += imgH; 
                if (element.tagName === 'TR') { currentY += 0.5; } 
                else { currentY += 2; }
            }
            const headerBlock = document.createElement('div');
            headerBlock.appendChild(invoiceEl.querySelector('.invoice-header-row').cloneNode(true));
            headerBlock.appendChild(invoiceEl.querySelector('.party-row').cloneNode(true));
            const tableHead = invoiceEl.querySelector('#items thead').cloneNode(true); 
            const itemRows = invoiceEl.querySelectorAll('#items-body .item');
            
            // Adjusted colgroup for PDF to match the new optimized layout
            // We give much more width to the Description column (3rd col)
            const colgroup = document.createElement('colgroup');
            colgroup.innerHTML = `
                <col style="width: 30px;">  <col style="width: 70px;">  <col style="width: 400px;"> <col style="width: 40px;">  <col style="width: 70px;">  <col style="width: 50px;">  <col style="width: 60px;">  <col style="width: 80px;">  `;
            
            const footerBlock = document.createElement('div');
            footerBlock.appendChild(invoiceEl.querySelector('.totals').cloneNode(true));
            footerBlock.appendChild(invoiceEl.querySelector('.invoice-footer').cloneNode(true));
            await renderElement(headerBlock, pdf);
            const tableHeadWrapper = document.createElement('table');
            tableHeadWrapper.id = 'items';
            tableHeadWrapper.style.width = '100%';
            tableHeadWrapper.style.borderCollapse = 'collapse';
            tableHeadWrapper.style.tableLayout = 'fixed'; 
            tableHeadWrapper.appendChild(colgroup.cloneNode(true));
            tableHeadWrapper.appendChild(tableHead);
            await renderElement(tableHeadWrapper, pdf);
            for (const row of itemRows) {
                const tableRowWrapper = document.createElement('table');
                tableRowWrapper.id = 'items';
                tableRowWrapper.style.width = '100%';
                tableRowWrapper.style.borderCollapse = 'collapse';
                tableRowWrapper.style.tableLayout = 'fixed'; 
                tableRowWrapper.appendChild(colgroup.cloneNode(true));
                const tBody = document.createElement('tbody');
                tBody.appendChild(row.cloneNode(true));
                tableRowWrapper.appendChild(tBody);
                await renderElement(tableRowWrapper, pdf);
            }
            await renderElement(footerBlock, pdf);
            pdf.save(`${invoiceNumber}.pdf`);
        } catch (err) {
            console.error('PDF generation error', err);
        } finally {
            elementsToHide.forEach(el => el.style.display = '');
            appContainer.style.boxShadow = originalShadow;
            invoiceEl.style.border = originalBorder;
            invoiceEl.style.minHeight = originalMinHeight;
            generatePdfBtn.disabled = false;
            generatePdfBtn.innerHTML = originalBtnHtml;
        }
    });
    
    setupFinishBtn.addEventListener('click', () => {
        const name = setupUserName.value.trim();
        const email = setupUserEmail.value.trim();
        if (!name) { alert("Please enter your name to get started."); return; }
        saveUserProfile(name, email);
        const savedConfig = saveGlobalConfig(false); 
        if (savedConfig) {
            localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
            initApp();
        }
    });

    function initApp() {
        if (setupGlobalSettingsContainer && globalSettingsSection) {
             setupGlobalSettingsContainer.appendChild(globalSettingsSection);
        }
        const setupComplete = localStorage.getItem(SETUP_COMPLETE_KEY);
        if (setupComplete === 'true') {
            loadUserProfile();
            loadGlobalConfig();
             if (appSettingsSection && globalSettingsSection) {
                 appSettingsSection.prepend(globalSettingsSection);
             }
            populateDropdown(); 
            regionNote.classList.add('hidden');
            handleLogoChange(); 
            clearInvoiceForm(); 
            handleInvoiceListUpdate(); 
            updateStorageUsageDisplay();
            setupScreen.classList.add('hidden'); 
        } else {
            setupScreen.classList.remove('hidden');
            loadGlobalConfig(); 
        }
    }

    initApp();
});