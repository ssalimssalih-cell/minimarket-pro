// Main JavaScript pour MiniMarket - Version complète avec StatisticsManager

class MiniMarketApp {
    constructor() {
        this.db = window.minimarketDB;
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadDashboardData();
        this.hideLoading();
        this.initEventListeners();
        
        setTimeout(() => {
            window.categoryManager = new CategoryManager();
            window.supplierManager = new SupplierManager();
            window.customerManager = new CustomerManager();
            window.productManager = new ProductManager();
            window.posManager = new POSManager();
            window.salesManager = new SalesManager();
            window.creditManager = new CreditManager();
            window.chargeManager = new ChargeManager();
            window.statisticsManager = new StatisticsManager();
        }, 500);
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }

    hideLoading() {
        setTimeout(() => {
            const spinner = document.getElementById('loadingSpinner');
            if (spinner) spinner.style.display = 'none';
        }, 500);
    }

    initEventListeners() {
        document.querySelectorAll('.list-group-item').forEach((item, index) => {
            item.style.setProperty('--item-index', index);
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const menuItem = item.getAttribute('data-menu');
                this.handleMenuClick(menuItem);
            });
        });

        const offcanvasElement = document.getElementById('offcanvasMenu');
        if (offcanvasElement) {
            offcanvasElement.addEventListener('hide.bs.offcanvas', () => {
                console.log('Menu fermé');
            });
        }

        setInterval(() => this.refreshData(), 30000);
    }

    async loadDashboardData() {
        try {
            await this.loadRecentSales();
            await this.loadStockAlerts();
            await this.loadStats();
        } catch (error) {
            this.showNotification('Erreur lors du chargement des données', 'error');
            console.error('Erreur:', error);
        }
    }

    async loadRecentSales() {
        const salesBody = document.getElementById('recentSales');
        if (!salesBody) return;
        
        try {
            const sales = await this.db.getAll('sales');
            const recentSales = sales.slice(-5).reverse();
            
            if (recentSales.length > 0) {
                salesBody.innerHTML = recentSales.map(sale => `
                    <tr>
                        <td>${sale.items && sale.items[0] ? sale.items[0].productName : 'N/A'}</td>
                        <td>${sale.items && sale.items[0] ? sale.items[0].quantity : 0}</td>
                        <td>${sale.total || 0} DH</td>
                        <td>${sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}</td>
                    </tr>
                `).join('');
            } else {
                salesBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Aucune vente récente</td></tr>';
            }
        } catch (error) {
            console.error('Erreur chargement ventes:', error);
        }
    }

    async loadStockAlerts() {
        const alertsDiv = document.getElementById('stockAlerts');
        if (!alertsDiv) return;
        
        try {
            const lowStock = await this.db.getLowStockProducts(10);
            
            if (lowStock.length > 0) {
                alertsDiv.innerHTML = lowStock.map((item, index) => `
                    <div class="alert-stock" style="--alert-index: ${index};">
                        <div>
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>${item.name}</strong>
                            <br>
                            <small>Stock: ${item.currentStock || item.stock || 0} (Seuil: 10)</small>
                        </div>
                        <button class="btn-reorder" onclick="app.reorderProduct('${item.name}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                `).join('');
            } else {
                alertsDiv.innerHTML = '<p class="text-success text-center"><i class="fas fa-check-circle"></i> Aucune alerte stock</p>';
            }
        } catch (error) {
            console.error('Erreur chargement alertes:', error);
        }
    }

    async loadStats() {
        try {
            const todaySales = await this.db.getTotalSalesToday();
            const totalProducts = await this.db.getTotalProducts();
            const activeCredits = await this.db.getTotalActiveCredits();
            const totalCustomers = await this.db.getTotalCustomers();
            
            document.getElementById('todaySales').textContent = todaySales ? `${todaySales} DH` : '0 DH';
            document.getElementById('totalProducts').textContent = totalProducts || '0';
            document.getElementById('activeCredits').textContent = activeCredits ? `${activeCredits} DH` : '0 DH';
            document.getElementById('totalCustomers').textContent = totalCustomers || '0';
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    }

    handleMenuClick(menuItem) {
        const menuTitles = {
            'pos': 'Point de Vente',
            'categories': 'Gestion des Catégories',
            'products': 'Gestion des Produits',
            'suppliers': 'Gestion des Fournisseurs',
            'customers': 'Gestion des Clients',
            'sales': 'Historique des Ventes',
            'credits': 'Gestion des Crédits',
            'charges': 'Gestion des Charges',
            'statistics': 'Statistiques'
        };

        const title = menuTitles[menuItem] || menuItem;
        
        if (menuItem === 'categories') {
            this.showCategoriesModal();
        } else if (menuItem === 'suppliers') {
            this.showSuppliersModal();
        } else if (menuItem === 'customers') {
            this.showCustomersModal();
        } else if (menuItem === 'products') {
            this.showProductsModal();
        } else if (menuItem === 'pos') {
            this.showPOSModal();
        } else if (menuItem === 'sales') {
            this.showSalesModal();
        } else if (menuItem === 'credits') {
            this.showCreditsModal();
        } else if (menuItem === 'charges') {
            this.showChargesModal();
        } else if (menuItem === 'statistics') {
            this.showStatisticsModal();
        } else {
            this.showNotification(`Navigation vers: ${title}`, 'info');
        }
        
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasMenu'));
        if (offcanvas) {
            offcanvas.hide();
        }
    }
    
    showCategoriesModal() {
        const modalElement = document.getElementById('categoriesModal');
        if (!modalElement) return;
        
        const categoriesModal = new bootstrap.Modal(modalElement);
        categoriesModal.show();
        
        if (window.categoryManager) {
            window.categoryManager.loadCategoriesFromDB();
        }
    }

    showSuppliersModal() {
        const modalElement = document.getElementById('suppliersModal');
        if (!modalElement) return;
        
        const suppliersModal = new bootstrap.Modal(modalElement);
        suppliersModal.show();
        
        if (window.supplierManager) {
            window.supplierManager.loadSuppliersFromDB();
        }
    }

    showCustomersModal() {
        const modalElement = document.getElementById('customersModal');
        if (!modalElement) return;
        
        const customersModal = new bootstrap.Modal(modalElement);
        customersModal.show();
        
        if (window.customerManager) {
            window.customerManager.loadCustomersFromDB();
        }
    }

    showProductsModal() {
        const modalElement = document.getElementById('productsModal');
        if (!modalElement) return;
        
        const productsModal = new bootstrap.Modal(modalElement);
        productsModal.show();
        
        if (window.productManager) {
            window.productManager.loadProductsFromDB();
        }
    }

    showPOSModal() {
        const modalElement = document.getElementById('posModal');
        if (!modalElement) return;
        
        const posModal = new bootstrap.Modal(modalElement);
        posModal.show();
        
        if (window.posManager) {
            window.posManager.initPOS();
        }
    }

    showSalesModal() {
        const modalElement = document.getElementById('salesModal');
        if (!modalElement) return;
        
        const salesModal = new bootstrap.Modal(modalElement);
        salesModal.show();
        
        if (window.salesManager) {
            window.salesManager.loadSales();
        }
    }

    showCreditsModal() {
        const modalElement = document.getElementById('creditsModal');
        if (!modalElement) return;
        
        const creditsModal = new bootstrap.Modal(modalElement);
        creditsModal.show();
        
        if (window.creditManager) {
            window.creditManager.loadCredits();
        }
    }

    showChargesModal() {
        const modalElement = document.getElementById('chargesModal');
        if (!modalElement) return;
        
        const chargesModal = new bootstrap.Modal(modalElement);
        chargesModal.show();
        
        if (window.chargeManager) {
            window.chargeManager.loadCharges();
        }
    }

    showStatisticsModal() {
        const modalElement = document.getElementById('statisticsModal');
        if (!modalElement) return;
        
        const statisticsModal = new bootstrap.Modal(modalElement);
        statisticsModal.show();
        
        if (window.statisticsManager) {
            window.statisticsManager.loadStatistics();
        }
    }

    reorderProduct(productName) {
        this.showNotification(`Commande lancée pour: ${productName}`, 'success');
    }

    refreshData() {
        console.log('Rafraîchissement des données...');
        this.loadDashboardData();
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'info': '#3b82f6',
            'warning': '#f59e0b'
        };
        
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        toast.style.borderLeftColor = colors[type] || colors.info;
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${icons[type] || icons.info} me-2" style="color: ${colors[type] || colors.info}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ==================== CATEGORY MANAGER ====================
class CategoryManager {
    constructor() {
        this.db = window.minimarketDB;
        this.categories = [];
        this.initEventListeners();
        this.loadCategoriesFromDB();
    }

    async loadCategoriesFromDB() {
        try {
            this.categories = await this.db.getCategoriesWithStats();
            this.renderCategoriesTable();
            console.log('✅ Catégories chargées depuis IndexedDB:', this.categories.length);
        } catch (error) {
            console.error('❌ Erreur chargement catégories:', error);
            this.categories = [];
        }
    }

    initEventListeners() {
        const addBtn = document.getElementById('addCategoryBtn');
        const cancelBtn = document.getElementById('cancelCategoryBtn');
        const form = document.getElementById('categoryForm');
        const importBtn = document.getElementById('importCategoriesBtn');
        const exportBtn = document.getElementById('exportCategoriesBtn');
        const listBtn = document.getElementById('listCategoriesBtn');
        
        if (addBtn) addBtn.addEventListener('click', () => this.showAddForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAddForm());
        if (form) form.addEventListener('submit', (e) => this.handleAddCategory(e));
        if (importBtn) importBtn.addEventListener('click', () => this.importCategories());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCategories());
        if (listBtn) listBtn.addEventListener('click', () => this.showCategoriesList());
    }

    showAddForm() {
        const formCard = document.getElementById('categoryFormCard');
        const nameInput = document.getElementById('categoryName');
        
        if (formCard) {
            formCard.style.display = 'block';
            if (nameInput) nameInput.focus();
        }
    }

    hideAddForm() {
        const formCard = document.getElementById('categoryFormCard');
        const form = document.getElementById('categoryForm');
        
        if (formCard) formCard.style.display = 'none';
        if (form) form.reset();
        
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.onsubmit = (e) => this.handleAddCategory(e);
        }
    }

    async handleAddCategory(e) {
        e.preventDefault();
        
        const categoryNameInput = document.getElementById('categoryName');
        if (!categoryNameInput) return;
        
        let categoryName = categoryNameInput.value.trim();
        
        if (!categoryName) {
            this.showNotification('Veuillez entrer un nom de catégorie', 'warning');
            return;
        }

        categoryName = categoryName.toUpperCase();

        try {
            const existingCategory = await this.db.getCategoryByName(categoryName);
            if (existingCategory) {
                this.showNotification('Cette catégorie existe déjà', 'warning');
                return;
            }

            const newCategory = {
                name: categoryName,
                description: '',
                icon: 'folder',
                nbProducts: 0,
                revenue: 0,
                profit: 0,
                created_at: new Date()
            };

            await this.db.add('categories', newCategory);
            await this.loadCategoriesFromDB();
            
            this.hideAddForm();
            this.showNotification(`✅ Catégorie "${categoryName}" ajoutée avec succès`, 'success');
        } catch (error) {
            console.error('Erreur ajout catégorie:', error);
            this.showNotification('❌ Erreur lors de l\'ajout de la catégorie', 'error');
        }
    }

    renderCategoriesTable() {
        const tbody = document.getElementById('categoriesTableBody');
        const totalSpan = document.getElementById('totalCategories');
        
        if (!tbody) return;
        
        if (!this.categories || this.categories.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Aucune catégorie trouvée</td></tr>`;
        } else {
            tbody.innerHTML = this.categories.map(cat => `
                <tr>
                    <td class="px-4 py-3">
                        <span class="badge bg-light text-dark">#${cat.id}</span>
                    </td>
                    <td class="px-4 py-3">${cat.name}</td>
                    <td class="px-4 py-3 text-center">
                        <span class="badge bg-light text-dark">${cat.nbProducts || 0}</span>
                    </td>
                    <td class="px-4 py-3 text-end">${(cat.revenue || 0).toLocaleString()} DH</td>
                    <td class="px-4 py-3 text-end text-success">${(cat.profit || 0).toLocaleString()} DH</td>
                    <td class="px-4 py-3">
                        <i class="far fa-calendar-alt me-1"></i>${cat.createdAt || new Date(cat.created_at).toISOString().split('T')[0]}
                    </td>
                    <td class="px-4 py-3 text-center">
                        <button class="btn-action btn-edit me-1" onclick="window.categoryManager.editCategory(${cat.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.categoryManager.deleteCategory(${cat.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        if (totalSpan) {
            totalSpan.textContent = this.categories?.length || 0;
        }
    }

    async editCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (category) {
            const nameInput = document.getElementById('categoryName');
            if (nameInput) {
                nameInput.value = category.name;
            }
            this.showAddForm();
            
            const form = document.getElementById('categoryForm');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    this.updateCategory(id);
                };
            }
        }
    }

    async updateCategory(id) {
        const nameInput = document.getElementById('categoryName');
        if (!nameInput) return;
        
        let newName = nameInput.value.trim();
        if (!newName) {
            this.showNotification('Veuillez entrer un nom de catégorie', 'warning');
            return;
        }

        newName = newName.toUpperCase();

        try {
            const category = this.categories.find(c => c.id === id);
            if (category) {
                category.name = newName;
                await this.db.update('categories', category);
                await this.loadCategoriesFromDB();
                
                this.hideAddForm();
                this.showNotification('✅ Catégorie modifiée avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur modification catégorie:', error);
            this.showNotification('❌ Erreur lors de la modification', 'error');
        }
    }

    async deleteCategory(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            try {
                await this.db.delete('categories', id);
                await this.loadCategoriesFromDB();
                this.showNotification('✅ Catégorie supprimée avec succès', 'success');
            } catch (error) {
                console.error('Erreur suppression catégorie:', error);
                this.showNotification('❌ Erreur lors de la suppression', 'error');
            }
        }
    }

    async importCategories() {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.json')) {
                    this.showNotification('❌ Le fichier doit être au format JSON', 'error');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(jsonData)) {
                            throw new Error('Le fichier doit contenir un tableau de catégories');
                        }
                        
                        let importedCount = 0;
                        let skippedCount = 0;
                        
                        for (const cat of jsonData) {
                            try {
                                if (!cat.name) {
                                    skippedCount++;
                                    continue;
                                }
                                
                                cat.name = cat.name.toUpperCase();
                                const existing = await this.db.getCategoryByName(cat.name);
                                
                                if (!existing) {
                                    const newCategory = {
                                        name: cat.name,
                                        description: cat.description || '',
                                        icon: cat.icon || 'folder',
                                        nbProducts: cat.nbProducts || 0,
                                        revenue: cat.revenue || 0,
                                        profit: cat.profit || 0,
                                        created_at: cat.created_at ? new Date(cat.created_at) : new Date()
                                    };
                                    
                                    await this.db.add('categories', newCategory);
                                    importedCount++;
                                } else {
                                    skippedCount++;
                                }
                            } catch (catError) {
                                console.error('Erreur import catégorie:', catError);
                                skippedCount++;
                            }
                        }
                        
                        await this.loadCategoriesFromDB();
                        this.showNotification(`✅ Import terminé : ${importedCount} importée(s), ${skippedCount} ignorée(s)`, 'success');
                        
                    } catch (error) {
                        this.showNotification('❌ Fichier JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            setTimeout(() => document.body.removeChild(fileInput), 1000);
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'import', 'error');
        }
    }

    async exportCategories() {
        try {
            const categories = await this.db.getCategoriesWithStats();
            
            if (categories.length === 0) {
                this.showNotification('❌ Aucune catégorie à exporter', 'warning');
                return;
            }
            
            const exportData = categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                description: cat.description || '',
                icon: cat.icon || 'folder',
                nbProducts: cat.nbProducts || 0,
                revenue: cat.revenue || 0,
                profit: cat.profit || 0,
                created_at: cat.created_at || new Date().toISOString()
            }));

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `categories_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.showNotification(`✅ Export réussi ! ${categories.length} catégorie(s) exportée(s)`, 'success');
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    showCategoriesList() {
        this.loadCategoriesFromDB();
        this.showNotification('📋 Liste des catégories actualisée', 'info');
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== SUPPLIER MANAGER ====================
class SupplierManager {
    constructor() {
        this.db = window.minimarketDB;
        this.suppliers = [];
        this.editingSupplierId = null;
        this.initEventListeners();
        this.loadSuppliersFromDB();
    }

    async loadSuppliersFromDB() {
        try {
            this.suppliers = await this.db.getAll('suppliers');
            this.renderSuppliersTable();
            console.log('✅ Fournisseurs chargés depuis IndexedDB:', this.suppliers.length);
        } catch (error) {
            console.error('❌ Erreur chargement fournisseurs:', error);
            this.suppliers = [];
        }
    }

    initEventListeners() {
        const addBtn = document.getElementById('addSupplierBtn');
        const cancelBtn = document.getElementById('cancelSupplierBtn');
        const form = document.getElementById('supplierForm');
        const importBtn = document.getElementById('importSuppliersBtn');
        const exportBtn = document.getElementById('exportSuppliersBtn');
        const listBtn = document.getElementById('listSuppliersBtn');
        
        if (addBtn) addBtn.addEventListener('click', () => this.showAddForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAddForm());
        if (form) form.addEventListener('submit', (e) => this.handleSupplierSubmit(e));
        if (importBtn) importBtn.addEventListener('click', () => this.importSuppliers());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSuppliers());
        if (listBtn) listBtn.addEventListener('click', () => this.showSuppliersList());

        const suppliersModal = document.getElementById('suppliersModal');
        if (suppliersModal) {
            suppliersModal.addEventListener('hidden.bs.modal', () => {
                this.editingSupplierId = null;
            });
        }
    }

    async handleSupplierSubmit(e) {
        e.preventDefault();
        
        if (this.editingSupplierId) {
            await this.updateSupplier(this.editingSupplierId);
        } else {
            await this.handleAddSupplier(e);
        }
    }

    showAddForm() {
        const formCard = document.getElementById('supplierFormCard');
        const nameInput = document.getElementById('supplierContactName');
        
        if (formCard) {
            formCard.style.display = 'block';
            if (nameInput) nameInput.focus();
        }
    }

    hideAddForm() {
        const formCard = document.getElementById('supplierFormCard');
        const form = document.getElementById('supplierForm');
        
        if (formCard) formCard.style.display = 'none';
        if (form) form.reset();
        this.editingSupplierId = null;
    }

    async handleAddSupplier(e) {
        e.preventDefault();
        
        const contactName = document.getElementById('supplierContactName')?.value.trim();
        
        if (!contactName) {
            this.showNotification('Veuillez entrer le nom du contact', 'warning');
            return;
        }

        const company = document.getElementById('supplierCompany')?.value.trim() || '';
        const phone = document.getElementById('supplierPhone')?.value.trim() || '';
        const whatsapp = document.getElementById('supplierWhatsapp')?.value.trim() || '';
        const address = document.getElementById('supplierAddress')?.value.trim() || '';
        const email = document.getElementById('supplierEmail')?.value.trim() || '';
        const revenue = document.getElementById('supplierRevenue')?.value || 0;

        try {
            const newSupplier = {
                contact_name: contactName.toUpperCase(),
                company: company.toUpperCase(),
                phone: phone,
                whatsapp: whatsapp,
                address: address,
                email: email,
                revenue: parseFloat(revenue),
                created_at: new Date()
            };

            await this.db.add('suppliers', newSupplier);
            await this.loadSuppliersFromDB();
            
            this.hideAddForm();
            this.showNotification(`✅ Fournisseur "${contactName}" ajouté avec succès`, 'success');
        } catch (error) {
            console.error('Erreur ajout fournisseur:', error);
            this.showNotification('❌ Erreur lors de l\'ajout du fournisseur', 'error');
        }
    }

    renderSuppliersTable() {
        const tbody = document.getElementById('suppliersTableBody');
        const totalSpan = document.getElementById('totalSuppliers');
        
        if (!tbody) return;
        
        if (!this.suppliers || this.suppliers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Aucun fournisseur trouvé</td></tr>`;
        } else {
            tbody.innerHTML = this.suppliers.map(sup => `
                <tr>
                    <td class="px-4 py-3">
                        <span class="badge bg-light text-dark">#${sup.id}</span>
                    </td>
                    <td class="px-4 py-3">${sup.contact_name}</td>
                    <td class="px-4 py-3">${sup.company || '-'}</td>
                    <td class="px-4 py-3">${sup.phone || '-'}</td>
                    <td class="px-4 py-3">
                        ${sup.whatsapp ? 
                            `<a href="https://wa.me/${sup.whatsapp.replace(/\s/g, '')}" target="_blank" class="text-success">
                                <i class="fab fa-whatsapp"></i> ${sup.whatsapp}
                            </a>` : 
                            '<span class="text-muted">-</span>'
                        }
                    </td>
                    <td class="px-4 py-3">${sup.address || '-'}</td>
                    <td class="px-4 py-3 text-end">${sup.revenue?.toLocaleString() || 0} DH</td>
                    <td class="px-4 py-3 text-center">
                        <button class="btn-action btn-edit me-1" onclick="window.supplierManager.editSupplier(${sup.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.supplierManager.deleteSupplier(${sup.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        if (totalSpan) {
            totalSpan.textContent = this.suppliers?.length || 0;
        }
    }

    async editSupplier(id) {
        const supplier = this.suppliers.find(s => s.id === id);
        if (supplier) {
            this.editingSupplierId = id;
            
            document.getElementById('supplierContactName').value = supplier.contact_name;
            document.getElementById('supplierCompany').value = supplier.company || '';
            document.getElementById('supplierPhone').value = supplier.phone || '';
            document.getElementById('supplierWhatsapp').value = supplier.whatsapp || '';
            document.getElementById('supplierAddress').value = supplier.address || '';
            document.getElementById('supplierEmail').value = supplier.email || '';
            document.getElementById('supplierRevenue').value = supplier.revenue || 0;
            
            this.showAddForm();
        }
    }

    async updateSupplier(id) {
        const contactName = document.getElementById('supplierContactName')?.value.trim();
        
        if (!contactName) {
            this.showNotification('Veuillez entrer le nom du contact', 'warning');
            return;
        }

        const company = document.getElementById('supplierCompany')?.value.trim() || '';
        const phone = document.getElementById('supplierPhone')?.value.trim() || '';
        const whatsapp = document.getElementById('supplierWhatsapp')?.value.trim() || '';
        const address = document.getElementById('supplierAddress')?.value.trim() || '';
        const email = document.getElementById('supplierEmail')?.value.trim() || '';
        const revenue = document.getElementById('supplierRevenue')?.value || 0;

        try {
            const supplier = await this.db.getById('suppliers', id);
            
            if (supplier) {
                supplier.contact_name = contactName.toUpperCase();
                supplier.company = company.toUpperCase();
                supplier.phone = phone;
                supplier.whatsapp = whatsapp;
                supplier.address = address;
                supplier.email = email;
                supplier.revenue = parseFloat(revenue);
                
                await this.db.update('suppliers', supplier);
                await this.loadSuppliersFromDB();
                
                this.hideAddForm();
                this.showNotification('✅ Fournisseur modifié avec succès', 'success');
            } else {
                this.showNotification('❌ Fournisseur non trouvé', 'error');
            }
        } catch (error) {
            console.error('Erreur modification fournisseur:', error);
            this.showNotification('❌ Erreur lors de la modification', 'error');
        }
    }

    async deleteSupplier(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            try {
                await this.db.delete('suppliers', id);
                await this.loadSuppliersFromDB();
                this.showNotification('✅ Fournisseur supprimé avec succès', 'success');
            } catch (error) {
                console.error('Erreur suppression fournisseur:', error);
                this.showNotification('❌ Erreur lors de la suppression', 'error');
            }
        }
    }

    async importSuppliers() {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.json')) {
                    this.showNotification('❌ Le fichier doit être au format JSON', 'error');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(jsonData)) {
                            throw new Error('Le fichier doit contenir un tableau de fournisseurs');
                        }
                        
                        let importedCount = 0;
                        let skippedCount = 0;
                        
                        for (const sup of jsonData) {
                            try {
                                if (!sup.contact_name) {
                                    skippedCount++;
                                    continue;
                                }
                                
                                const newSupplier = {
                                    contact_name: sup.contact_name.toUpperCase(),
                                    company: sup.company?.toUpperCase() || '',
                                    phone: sup.phone || '',
                                    whatsapp: sup.whatsapp || '',
                                    address: sup.address || '',
                                    email: sup.email || '',
                                    revenue: sup.revenue || 0,
                                    created_at: sup.created_at ? new Date(sup.created_at) : new Date()
                                };
                                
                                await this.db.add('suppliers', newSupplier);
                                importedCount++;
                            } catch (supError) {
                                console.error('Erreur import fournisseur:', supError);
                                skippedCount++;
                            }
                        }
                        
                        await this.loadSuppliersFromDB();
                        this.showNotification(`✅ Import terminé : ${importedCount} importé(s), ${skippedCount} ignoré(s)`, 'success');
                        
                    } catch (error) {
                        this.showNotification('❌ Fichier JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            setTimeout(() => document.body.removeChild(fileInput), 1000);
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'import', 'error');
        }
    }

    async exportSuppliers() {
        try {
            const suppliers = await this.db.getAll('suppliers');
            
            if (suppliers.length === 0) {
                this.showNotification('❌ Aucun fournisseur à exporter', 'warning');
                return;
            }
            
            const exportData = suppliers.map(sup => ({
                id: sup.id,
                contact_name: sup.contact_name,
                company: sup.company || '',
                phone: sup.phone || '',
                whatsapp: sup.whatsapp || '',
                address: sup.address || '',
                email: sup.email || '',
                revenue: sup.revenue || 0,
                created_at: sup.created_at || new Date().toISOString()
            }));

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `fournisseurs_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.showNotification(`✅ Export réussi ! ${suppliers.length} fournisseur(s) exporté(s)`, 'success');
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    showSuppliersList() {
        this.loadSuppliersFromDB();
        this.showNotification('📋 Liste des fournisseurs actualisée', 'info');
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== CUSTOMER MANAGER ====================
class CustomerManager {
    constructor() {
        this.db = window.minimarketDB;
        this.customers = [];
        this.editingCustomerId = null;
        this.initEventListeners();
        this.loadCustomersFromDB();
    }

    async loadCustomersFromDB() {
        try {
            this.customers = await this.db.getAll('customers');
            this.renderCustomersTable();
            console.log('✅ Clients chargés depuis IndexedDB:', this.customers.length);
        } catch (error) {
            console.error('❌ Erreur chargement clients:', error);
            this.customers = [];
        }
    }

    initEventListeners() {
        const addBtn = document.getElementById('addCustomerBtn');
        const cancelBtn = document.getElementById('cancelCustomerBtn');
        const form = document.getElementById('customerForm');
        const importBtn = document.getElementById('importCustomersBtn');
        const exportBtn = document.getElementById('exportCustomersBtn');
        const listBtn = document.getElementById('listCustomersBtn');
        
        if (addBtn) addBtn.addEventListener('click', () => this.showAddForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAddForm());
        if (form) form.addEventListener('submit', (e) => this.handleCustomerSubmit(e));
        if (importBtn) importBtn.addEventListener('click', () => this.importCustomers());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCustomers());
        if (listBtn) listBtn.addEventListener('click', () => this.showCustomersList());

        const customersModal = document.getElementById('customersModal');
        if (customersModal) {
            customersModal.addEventListener('hidden.bs.modal', () => {
                this.editingCustomerId = null;
            });
        }
    }

    async handleCustomerSubmit(e) {
        e.preventDefault();
        
        if (this.editingCustomerId) {
            await this.updateCustomer(this.editingCustomerId);
        } else {
            await this.handleAddCustomer(e);
        }
    }

    showAddForm() {
        const formCard = document.getElementById('customerFormCard');
        const nameInput = document.getElementById('customerName');
        
        if (formCard) {
            formCard.style.display = 'block';
            if (nameInput) nameInput.focus();
        }
    }

    hideAddForm() {
        const formCard = document.getElementById('customerFormCard');
        const form = document.getElementById('customerForm');
        
        if (formCard) formCard.style.display = 'none';
        if (form) form.reset();
        this.editingCustomerId = null;
    }

    async handleAddCustomer(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customerName')?.value.trim();
        
        if (!customerName) {
            this.showNotification('Veuillez entrer le nom du client', 'warning');
            return;
        }

        const gender = document.getElementById('customerGender')?.value || '';
        const phone = document.getElementById('customerPhone')?.value.trim() || '';
        const whatsapp = document.getElementById('customerWhatsapp')?.value.trim() || '';
        const address = document.getElementById('customerAddress')?.value.trim() || '';
        const revenue = document.getElementById('customerRevenue')?.value || 0;
        const profit = document.getElementById('customerProfit')?.value || 0;
        const credit = document.getElementById('customerCredit')?.value || 0;
        const description = document.getElementById('customerDescription')?.value.trim() || '';

        try {
            const newCustomer = {
                name: customerName.toUpperCase(),
                gender: gender,
                phone: phone,
                whatsapp: whatsapp,
                address: address,
                revenue: parseFloat(revenue),
                profit: parseFloat(profit),
                credit: parseFloat(credit),
                description: description,
                created_at: new Date()
            };

            await this.db.add('customers', newCustomer);
            await this.loadCustomersFromDB();
            
            this.hideAddForm();
            this.showNotification(`✅ Client "${customerName}" ajouté avec succès`, 'success');
        } catch (error) {
            console.error('Erreur ajout client:', error);
            this.showNotification('❌ Erreur lors de l\'ajout du client', 'error');
        }
    }

    renderCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        const totalSpan = document.getElementById('totalCustomers');
        
        if (!tbody) return;
        
        if (!this.customers || this.customers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" class="text-center py-4 text-muted">Aucun client trouvé</td></tr>`;
        } else {
            tbody.innerHTML = this.customers.map(cust => `
                <tr>
                    <td class="px-4 py-3">
                        <span class="badge bg-light text-dark">#${cust.id}</span>
                    </td>
                    <td class="px-4 py-3">${cust.name}</td>
                    <td class="px-4 py-3">
                        ${cust.gender === 'MASCULIN' ? '<i class="fas fa-mars text-primary"></i> M' : 
                          cust.gender === 'FÉMININ' ? '<i class="fas fa-venus text-danger"></i> F' : '-'}
                    </td>
                    <td class="px-4 py-3">${cust.address || '-'}</td>
                    <td class="px-4 py-3">${cust.phone || '-'}</td>
                    <td class="px-4 py-3">
                        ${cust.whatsapp ? 
                            `<a href="https://wa.me/${cust.whatsapp.replace(/\s/g, '')}" target="_blank" class="text-success">
                                <i class="fab fa-whatsapp"></i>
                            </a>` : 
                            '-'
                        }
                    </td>
                    <td class="px-4 py-3 text-end">${cust.revenue?.toLocaleString() || 0} DH</td>
                    <td class="px-4 py-3 text-end text-success">${cust.profit?.toLocaleString() || 0} DH</td>
                    <td class="px-4 py-3 text-end ${cust.credit > 0 ? 'text-warning' : ''}">${cust.credit?.toLocaleString() || 0} DH</td>
                    <td class="px-4 py-3">${cust.description?.substring(0, 30) || '-'}${cust.description?.length > 30 ? '...' : ''}</td>
                    <td class="px-4 py-3">${new Date(cust.created_at).toLocaleDateString()}</td>
                    <td class="px-4 py-3 text-center">
                        <button class="btn-action btn-edit me-1" onclick="window.customerManager.editCustomer(${cust.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.customerManager.deleteCustomer(${cust.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        if (totalSpan) {
            totalSpan.textContent = this.customers?.length || 0;
        }
    }

    async editCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (customer) {
            this.editingCustomerId = id;
            
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerGender').value = customer.gender || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerWhatsapp').value = customer.whatsapp || '';
            document.getElementById('customerAddress').value = customer.address || '';
            document.getElementById('customerRevenue').value = customer.revenue || 0;
            document.getElementById('customerProfit').value = customer.profit || 0;
            document.getElementById('customerCredit').value = customer.credit || 0;
            document.getElementById('customerDescription').value = customer.description || '';
            
            this.showAddForm();
        }
    }

    async updateCustomer(id) {
        const customerName = document.getElementById('customerName')?.value.trim();
        
        if (!customerName) {
            this.showNotification('Veuillez entrer le nom du client', 'warning');
            return;
        }

        const gender = document.getElementById('customerGender')?.value || '';
        const phone = document.getElementById('customerPhone')?.value.trim() || '';
        const whatsapp = document.getElementById('customerWhatsapp')?.value.trim() || '';
        const address = document.getElementById('customerAddress')?.value.trim() || '';
        const revenue = document.getElementById('customerRevenue')?.value || 0;
        const profit = document.getElementById('customerProfit')?.value || 0;
        const credit = document.getElementById('customerCredit')?.value || 0;
        const description = document.getElementById('customerDescription')?.value.trim() || '';

        try {
            const customer = await this.db.getById('customers', id);
            
            if (customer) {
                customer.name = customerName.toUpperCase();
                customer.gender = gender;
                customer.phone = phone;
                customer.whatsapp = whatsapp;
                customer.address = address;
                customer.revenue = parseFloat(revenue);
                customer.profit = parseFloat(profit);
                customer.credit = parseFloat(credit);
                customer.description = description;
                
                await this.db.update('customers', customer);
                await this.loadCustomersFromDB();
                
                this.hideAddForm();
                this.showNotification('✅ Client modifié avec succès', 'success');
            } else {
                this.showNotification('❌ Client non trouvé', 'error');
            }
        } catch (error) {
            console.error('Erreur modification client:', error);
            this.showNotification('❌ Erreur lors de la modification', 'error');
        }
    }

    async deleteCustomer(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            try {
                await this.db.delete('customers', id);
                await this.loadCustomersFromDB();
                this.showNotification('✅ Client supprimé avec succès', 'success');
            } catch (error) {
                console.error('Erreur suppression client:', error);
                this.showNotification('❌ Erreur lors de la suppression', 'error');
            }
        }
    }

    async importCustomers() {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.json')) {
                    this.showNotification('❌ Le fichier doit être au format JSON', 'error');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(jsonData)) {
                            throw new Error('Le fichier doit contenir un tableau de clients');
                        }
                        
                        let importedCount = 0;
                        let skippedCount = 0;
                        
                        for (const cust of jsonData) {
                            try {
                                if (!cust.name) {
                                    skippedCount++;
                                    continue;
                                }
                                
                                const newCustomer = {
                                    name: cust.name.toUpperCase(),
                                    gender: cust.gender || '',
                                    phone: cust.phone || '',
                                    whatsapp: cust.whatsapp || '',
                                    address: cust.address || '',
                                    revenue: cust.revenue || 0,
                                    profit: cust.profit || 0,
                                    credit: cust.credit || 0,
                                    description: cust.description || '',
                                    created_at: cust.created_at ? new Date(cust.created_at) : new Date()
                                };
                                
                                await this.db.add('customers', newCustomer);
                                importedCount++;
                            } catch (custError) {
                                console.error('Erreur import client:', custError);
                                skippedCount++;
                            }
                        }
                        
                        await this.loadCustomersFromDB();
                        this.showNotification(`✅ Import terminé : ${importedCount} importé(s), ${skippedCount} ignoré(s)`, 'success');
                        
                    } catch (error) {
                        this.showNotification('❌ Fichier JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            setTimeout(() => document.body.removeChild(fileInput), 1000);
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'import', 'error');
        }
    }

    async exportCustomers() {
        try {
            const customers = await this.db.getAll('customers');
            
            if (customers.length === 0) {
                this.showNotification('❌ Aucun client à exporter', 'warning');
                return;
            }
            
            const exportData = customers.map(cust => ({
                id: cust.id,
                name: cust.name,
                gender: cust.gender || '',
                phone: cust.phone || '',
                whatsapp: cust.whatsapp || '',
                address: cust.address || '',
                revenue: cust.revenue || 0,
                profit: cust.profit || 0,
                credit: cust.credit || 0,
                description: cust.description || '',
                created_at: cust.created_at || new Date().toISOString()
            }));

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `clients_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.showNotification(`✅ Export réussi ! ${customers.length} client(s) exporté(s)`, 'success');
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    showCustomersList() {
        this.loadCustomersFromDB();
        this.showNotification('📋 Liste des clients actualisée', 'info');
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== PRODUCT MANAGER ====================
class ProductManager {
    constructor() {
        this.db = window.minimarketDB;
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.suppliers = [];
        this.currentSort = { column: 'id', direction: 'asc' };
        this.editingProductId = null;
        this.initEventListeners();
        this.loadProductsFromDB();
    }

    async loadProductsFromDB() {
        try {
            this.products = await this.db.getAll('products');
            this.categories = await this.db.getAll('categories');
            this.suppliers = await this.db.getAll('suppliers');
            this.populateCategorySelect();
            this.populateSupplierSelect();
            
            this.filteredProducts = [...this.products];
            this.sortProducts(this.currentSort.column, true);
            this.renderProductsTable();
            console.log('✅ Produits chargés depuis IndexedDB:', this.products.length);
        } catch (error) {
            console.error('❌ Erreur chargement produits:', error);
            this.products = [];
            this.filteredProducts = [];
        }
    }

    populateCategorySelect() {
        const categorySelect = document.getElementById('productCategory');
        if (!categorySelect) return;
        
        categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        
        if (this.categories && this.categories.length > 0) {
            this.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        }
    }

    populateSupplierSelect() {
        const supplierSelect = document.getElementById('productSupplier');
        if (!supplierSelect) return;
        
        supplierSelect.innerHTML = '<option value="">Sélectionner un fournisseur</option>';
        
        if (this.suppliers && this.suppliers.length > 0) {
            this.suppliers.forEach(sup => {
                const option = document.createElement('option');
                option.value = sup.id;
                option.textContent = sup.company || sup.contact_name;
                supplierSelect.appendChild(option);
            });
        }
    }

    initEventListeners() {
        const addBtn = document.getElementById('addProductBtn');
        const cancelBtn = document.getElementById('cancelProductBtn');
        const form = document.getElementById('productForm');
        const importBtn = document.getElementById('importProductsBtn');
        const exportBtn = document.getElementById('exportProductsBtn');
        const listBtn = document.getElementById('listProductsBtn');
        const applyFilterBtn = document.getElementById('applyProductFilter');
        const searchInput = document.getElementById('productSearch');
        
        const boxUnit = document.getElementById('productBoxUnit');
        const boxPrice = document.getElementById('productBoxPrice');
        const priceSell = document.getElementById('productPriceSell');
        
        if (boxUnit && boxPrice) {
            [boxUnit, boxPrice].forEach(field => {
                field.addEventListener('input', () => this.calculatePriceUnit());
            });
        }
        
        if (priceSell) {
            priceSell.addEventListener('input', () => this.calculateProfit());
        }
        
        if (addBtn) addBtn.addEventListener('click', () => this.showAddForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAddForm());
        if (form) form.addEventListener('submit', (e) => this.handleProductSubmit(e));
        if (importBtn) importBtn.addEventListener('click', () => this.importProducts());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportProducts());
        if (listBtn) listBtn.addEventListener('click', () => this.showProductsList());
        
        if (applyFilterBtn) applyFilterBtn.addEventListener('click', () => this.applySearchFilter());
        if (searchInput) searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.applySearchFilter();
            }
        });

        const sortableHeaders = document.querySelectorAll('#productsTable th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortProducts(column);
            });
        });

        const productsModal = document.getElementById('productsModal');
        if (productsModal) {
            productsModal.addEventListener('shown.bs.modal', () => {
                this.loadProductsFromDB();
            });
            productsModal.addEventListener('hidden.bs.modal', () => {
                this.editingProductId = null;
            });
        }
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        
        if (this.editingProductId) {
            await this.updateProduct(this.editingProductId);
        } else {
            await this.handleAddProduct(e);
        }
    }

    applySearchFilter() {
        const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
        
        if (searchTerm === '') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => {
                return (
                    (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                    (product.category && product.category.toLowerCase().includes(searchTerm)) ||
                    (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
                    (product.supplier && product.supplier.toLowerCase().includes(searchTerm)) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.barcode && product.barcode.toLowerCase().includes(searchTerm))
                );
            });
        }
        
        this.sortProducts(this.currentSort.column, true);
        this.renderProductsTable();
        
        if (this.filteredProducts.length === 0) {
            this.showNotification(`🔍 Aucun produit trouvé pour "${searchTerm}"`, 'info');
        } else {
            this.showNotification(`🔍 ${this.filteredProducts.length} produit(s) trouvé(s)`, 'success');
        }
    }

    sortProducts(column, skipToggle = false) {
        if (!skipToggle && column === this.currentSort.column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        document.querySelectorAll('#productsTable th.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort ms-1';
        });

        const currentHeader = document.querySelector(`#productsTable th.sortable[data-sort="${column}"] i`);
        if (currentHeader) {
            currentHeader.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'} ms-1`;
        }

        this.filteredProducts.sort((a, b) => {
            let valA, valB;

            switch(column) {
                case 'id':
                    valA = a.id || 0;
                    valB = b.id || 0;
                    break;
                case 'name':
                    valA = a.name || '';
                    valB = b.name || '';
                    break;
                case 'category':
                    valA = a.category || '';
                    valB = b.category || '';
                    break;
                case 'boxUnit':
                    valA = a.boxUnit || 0;
                    valB = b.boxUnit || 0;
                    break;
                case 'boxPrice':
                    valA = a.boxPrice || 0;
                    valB = b.boxPrice || 0;
                    break;
                case 'priceUnit':
                    valA = a.priceUnit || 0;
                    valB = b.priceUnit || 0;
                    break;
                case 'priceSell':
                    valA = a.priceSell || 0;
                    valB = b.priceSell || 0;
                    break;
                case 'profit':
                    valA = a.profit || 0;
                    valB = b.profit || 0;
                    break;
                case 'brand':
                    valA = a.brand || '';
                    valB = b.brand || '';
                    break;
                case 'unit':
                    valA = a.unit || '';
                    valB = b.unit || '';
                    break;
                case 'supplier':
                    valA = a.supplier || '';
                    valB = b.supplier || '';
                    break;
                case 'expiration':
                    valA = a.expiration ? new Date(a.expiration) : new Date(0);
                    valB = b.expiration ? new Date(b.expiration) : new Date(0);
                    break;
                case 'stock':
                    valA = a.currentStock || a.stock || 0;
                    valB = b.currentStock || b.stock || 0;
                    break;
                case 'soldStock':
                    valA = a.soldStock || 0;
                    valB = b.soldStock || 0;
                    break;
                case 'created_at':
                    valA = a.created_at ? new Date(a.created_at) : new Date(0);
                    valB = b.created_at ? new Date(b.created_at) : new Date(0);
                    break;
                default:
                    valA = a.id || 0;
                    valB = b.id || 0;
            }

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
                if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            } else {
                if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            }
        });

        this.renderProductsTable();
    }

    calculatePriceUnit() {
        const boxUnit = parseFloat(document.getElementById('productBoxUnit')?.value) || 1;
        const boxPrice = parseFloat(document.getElementById('productBoxPrice')?.value) || 0;
        const priceUnit = document.getElementById('productPriceUnit');
        
        if (priceUnit) {
            const unitPrice = boxPrice / boxUnit;
            priceUnit.value = unitPrice.toFixed(2);
            this.calculateProfit();
        }
    }

    calculateProfit() {
        const priceSell = parseFloat(document.getElementById('productPriceSell')?.value) || 0;
        const priceUnit = parseFloat(document.getElementById('productPriceUnit')?.value) || 0;
        const profit = document.getElementById('productProfit');
        
        if (profit) {
            const profitValue = priceSell - priceUnit;
            profit.value = profitValue.toFixed(2);
        }
    }

    showAddForm() {
        const formCard = document.getElementById('productFormCard');
        const nameInput = document.getElementById('productName');
        
        if (formCard) {
            formCard.style.display = 'block';
            if (nameInput) nameInput.focus();
        }
    }

    hideAddForm() {
        const formCard = document.getElementById('productFormCard');
        const form = document.getElementById('productForm');
        
        if (formCard) formCard.style.display = 'none';
        if (form) form.reset();
        this.editingProductId = null;
        document.getElementById('productPriceUnit').value = '0.00';
        document.getElementById('productProfit').value = '0.00';
    }

    async handleAddProduct(e) {
        e.preventDefault();
        
        const name = document.getElementById('productName')?.value.trim();
        const categoryId = document.getElementById('productCategory')?.value;
        
        if (!name) {
            this.showNotification('Veuillez entrer le nom du produit', 'warning');
            return;
        }
        
        if (!categoryId) {
            this.showNotification('Veuillez sélectionner une catégorie', 'warning');
            return;
        }

        const category = this.categories.find(c => c.id == categoryId);
        
        const boxUnit = parseInt(document.getElementById('productBoxUnit')?.value) || 1;
        const boxPrice = parseFloat(document.getElementById('productBoxPrice')?.value) || 0;
        const priceUnit = parseFloat(document.getElementById('productPriceUnit')?.value) || 0;
        const priceSell = parseFloat(document.getElementById('productPriceSell')?.value) || 0;
        const profit = parseFloat(document.getElementById('productProfit')?.value) || 0;
        const brand = document.getElementById('productBrand')?.value.trim() || '';
        const unit = document.getElementById('productUnit')?.value || 'PIECE';
        const supplierId = document.getElementById('productSupplier')?.value || null;
        const expiration = document.getElementById('productExpiration')?.value || null;
        const currentStock = parseInt(document.getElementById('productCurrentStock')?.value) || 0;
        const soldStock = parseInt(document.getElementById('productSoldStock')?.value) || 0;
        const description = document.getElementById('productDescription')?.value.trim() || '';

        const supplier = supplierId ? this.suppliers.find(s => s.id == supplierId) : null;

        try {
            const newProduct = {
                name: name.toUpperCase(),
                category: category ? category.name : '',
                categoryId: parseInt(categoryId),
                boxUnit: boxUnit,
                boxPrice: boxPrice,
                priceUnit: priceUnit,
                priceSell: priceSell,
                profit: profit,
                brand: brand,
                unit: unit,
                supplier: supplier ? (supplier.company || supplier.contact_name) : '',
                supplierId: supplierId ? parseInt(supplierId) : null,
                expiration: expiration,
                currentStock: currentStock,
                soldStock: soldStock,
                stock: currentStock,
                description: description,
                created_at: new Date()
            };

            await this.db.add('products', newProduct);
            await this.loadProductsFromDB();
            
            this.hideAddForm();
            this.showNotification(`✅ Produit "${name}" ajouté avec succès`, 'success');
        } catch (error) {
            console.error('Erreur ajout produit:', error);
            this.showNotification('❌ Erreur lors de l\'ajout du produit', 'error');
        }
    }

    renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        const totalSpan = document.getElementById('totalProducts');
        
        if (!tbody) return;
        
        if (!this.filteredProducts || this.filteredProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="17" class="text-center py-4 text-muted">Aucun produit trouvé</td></tr>`;
        } else {
            tbody.innerHTML = this.filteredProducts.map(prod => {
                let createdDate = '-';
                if (prod.created_at) {
                    const date = new Date(prod.created_at);
                    createdDate = date.toLocaleDateString('fr-FR');
                }
                
                return `
                <tr>
                    <td class="px-4 py-3">
                        <span class="badge bg-light text-dark">#${prod.id}</span>
                    </td>
                    <td class="px-4 py-3">${prod.name || '-'}</td>
                    <td class="px-4 py-3">${prod.category || '-'}</td>
                    <td class="px-4 py-3 text-center">${prod.boxUnit || 1}</td>
                    <td class="px-4 py-3 text-end">${(prod.boxPrice || 0).toFixed(2)} DH</td>
                    <td class="px-4 py-3 text-end">${(prod.priceUnit || 0).toFixed(2)} DH</td>
                    <td class="px-4 py-3 text-end">${(prod.priceSell || 0).toFixed(2)} DH</td>
                    <td class="px-4 py-3 text-end text-success">${(prod.profit || 0).toFixed(2)} DH</td>
                    <td class="px-4 py-3">${prod.brand || '-'}</td>
                    <td class="px-4 py-3">${prod.unit || 'PIECE'}</td>
                    <td class="px-4 py-3">${prod.supplier || '-'}</td>
                    <td class="px-4 py-3">${prod.expiration ? new Date(prod.expiration).toLocaleDateString() : '-'}</td>
                    <td class="px-4 py-3 text-center">${prod.currentStock || prod.stock || 0}</td>
                    <td class="px-4 py-3 text-center">${prod.soldStock || 0}</td>
                    <td class="px-4 py-3">${prod.description ? prod.description.substring(0, 20) + (prod.description.length > 20 ? '...' : '') : '-'}</td>
                    <td class="px-4 py-3">${createdDate}</td>
                    <td class="px-4 py-3 text-center">
                        <button class="btn-action btn-edit me-1" onclick="window.productManager.editProduct(${prod.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.productManager.deleteProduct(${prod.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `}).join('');
        }

        if (totalSpan) {
            totalSpan.textContent = this.filteredProducts?.length || 0;
        }
    }

    async editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.editingProductId = id;
            
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.categoryId || '';
            document.getElementById('productBoxUnit').value = product.boxUnit || 1;
            document.getElementById('productBoxPrice').value = product.boxPrice || 0;
            document.getElementById('productPriceUnit').value = (product.priceUnit || 0).toFixed(2);
            document.getElementById('productPriceSell').value = product.priceSell || 0;
            document.getElementById('productProfit').value = (product.profit || 0).toFixed(2);
            document.getElementById('productBrand').value = product.brand || '';
            document.getElementById('productUnit').value = product.unit || 'PIECE';
            document.getElementById('productSupplier').value = product.supplierId || '';
            document.getElementById('productExpiration').value = product.expiration || '';
            document.getElementById('productCurrentStock').value = product.currentStock || product.stock || 0;
            document.getElementById('productSoldStock').value = product.soldStock || 0;
            document.getElementById('productDescription').value = product.description || '';
            
            this.showAddForm();
        }
    }

    async updateProduct(id) {
        const name = document.getElementById('productName')?.value.trim();
        const categoryId = document.getElementById('productCategory')?.value;
        
        if (!name) {
            this.showNotification('Veuillez entrer le nom du produit', 'warning');
            return;
        }
        
        if (!categoryId) {
            this.showNotification('Veuillez sélectionner une catégorie', 'warning');
            return;
        }

        const category = this.categories.find(c => c.id == categoryId);
        
        const boxUnit = parseInt(document.getElementById('productBoxUnit')?.value) || 1;
        const boxPrice = parseFloat(document.getElementById('productBoxPrice')?.value) || 0;
        const priceUnit = parseFloat(document.getElementById('productPriceUnit')?.value) || 0;
        const priceSell = parseFloat(document.getElementById('productPriceSell')?.value) || 0;
        const profit = parseFloat(document.getElementById('productProfit')?.value) || 0;
        const brand = document.getElementById('productBrand')?.value.trim() || '';
        const unit = document.getElementById('productUnit')?.value || 'PIECE';
        const supplierId = document.getElementById('productSupplier')?.value || null;
        const expiration = document.getElementById('productExpiration')?.value || null;
        const currentStock = parseInt(document.getElementById('productCurrentStock')?.value) || 0;
        const soldStock = parseInt(document.getElementById('productSoldStock')?.value) || 0;
        const description = document.getElementById('productDescription')?.value.trim() || '';

        const supplier = supplierId ? this.suppliers.find(s => s.id == supplierId) : null;

        try {
            const product = await this.db.getById('products', id);
            
            if (product) {
                product.name = name.toUpperCase();
                product.category = category ? category.name : '';
                product.categoryId = parseInt(categoryId);
                product.boxUnit = boxUnit;
                product.boxPrice = boxPrice;
                product.priceUnit = priceUnit;
                product.priceSell = priceSell;
                product.profit = profit;
                product.brand = brand;
                product.unit = unit;
                product.supplier = supplier ? (supplier.company || supplier.contact_name) : '';
                product.supplierId = supplierId ? parseInt(supplierId) : null;
                product.expiration = expiration;
                product.currentStock = currentStock;
                product.soldStock = soldStock;
                product.stock = currentStock;
                product.description = description;
                
                await this.db.update('products', product);
                await this.loadProductsFromDB();
                
                this.hideAddForm();
                this.showNotification('✅ Produit modifié avec succès', 'success');
            } else {
                this.showNotification('❌ Produit non trouvé', 'error');
            }
        } catch (error) {
            console.error('Erreur modification produit:', error);
            this.showNotification('❌ Erreur lors de la modification', 'error');
        }
    }

    async deleteProduct(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await this.db.delete('products', id);
                await this.loadProductsFromDB();
                this.showNotification('✅ Produit supprimé avec succès', 'success');
            } catch (error) {
                console.error('Erreur suppression produit:', error);
                this.showNotification('❌ Erreur lors de la suppression', 'error');
            }
        }
    }

    async importProducts() {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.json')) {
                    this.showNotification('❌ Le fichier doit être au format JSON', 'error');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(jsonData)) {
                            throw new Error('Le fichier doit contenir un tableau de produits');
                        }
                        
                        let importedCount = 0;
                        let skippedCount = 0;
                        
                        for (const prod of jsonData) {
                            try {
                                if (!prod.name) {
                                    skippedCount++;
                                    continue;
                                }
                                
                                const newProduct = {
                                    name: prod.name.toUpperCase(),
                                    category: prod.category || '',
                                    categoryId: prod.categoryId || null,
                                    boxUnit: prod.boxUnit || 1,
                                    boxPrice: prod.boxPrice || 0,
                                    priceUnit: prod.priceUnit || 0,
                                    priceSell: prod.priceSell || 0,
                                    profit: prod.profit || 0,
                                    brand: prod.brand || '',
                                    unit: prod.unit || 'PIECE',
                                    supplier: prod.supplier || '',
                                    supplierId: prod.supplierId || null,
                                    expiration: prod.expiration || null,
                                    currentStock: prod.currentStock || prod.stock || 0,
                                    soldStock: prod.soldStock || 0,
                                    stock: prod.currentStock || prod.stock || 0,
                                    description: prod.description || '',
                                    created_at: prod.created_at ? new Date(prod.created_at) : new Date()
                                };
                                
                                await this.db.add('products', newProduct);
                                importedCount++;
                            } catch (prodError) {
                                console.error('Erreur import produit:', prodError);
                                skippedCount++;
                            }
                        }
                        
                        await this.loadProductsFromDB();
                        this.showNotification(`✅ Import terminé : ${importedCount} importé(s), ${skippedCount} ignoré(s)`, 'success');
                        
                    } catch (error) {
                        this.showNotification('❌ Fichier JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            setTimeout(() => document.body.removeChild(fileInput), 1000);
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'import', 'error');
        }
    }

    async exportProducts() {
        try {
            const products = await this.db.getAll('products');
            
            if (products.length === 0) {
                this.showNotification('❌ Aucun produit à exporter', 'warning');
                return;
            }
            
            const exportData = products.map(prod => ({
                id: prod.id,
                name: prod.name,
                category: prod.category || '',
                categoryId: prod.categoryId || null,
                boxUnit: prod.boxUnit || 1,
                boxPrice: prod.boxPrice || 0,
                priceUnit: prod.priceUnit || 0,
                priceSell: prod.priceSell || 0,
                profit: prod.profit || 0,
                brand: prod.brand || '',
                unit: prod.unit || 'PIECE',
                supplier: prod.supplier || '',
                supplierId: prod.supplierId || null,
                expiration: prod.expiration || null,
                currentStock: prod.currentStock || prod.stock || 0,
                soldStock: prod.soldStock || 0,
                description: prod.description || '',
                created_at: prod.created_at || new Date().toISOString()
            }));

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `produits_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.showNotification(`✅ Export réussi ! ${products.length} produit(s) exporté(s)`, 'success');
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    showProductsList() {
        this.loadProductsFromDB();
        this.showNotification('📋 Liste des produits actualisée', 'info');
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== POS MANAGER ====================
class POSManager {
    constructor() {
        this.db = window.minimarketDB;
        this.currentStep = 1;
        this.cart = [];
        this.currentSale = {
            customerId: null,
            customerName: 'Client Passager',
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            paymentMethod: 'cash',
            paymentGiven: 0,
            paymentChange: 0
        };
        this.sales = [];
        this.customers = [];
        this.products = [];
        this.currentSort = { column: 'date', direction: 'desc' };
        this.initEventListeners();
    }

    initEventListeners() {
        const nextToCartBtn = document.getElementById('nextToCartBtn');
        const backToCustomerBtn = document.getElementById('backToCustomerBtn');
        const nextToPaymentBtn = document.getElementById('nextToPaymentBtn');
        const backToCartBtn = document.getElementById('backToCartBtn');
        const completeSaleBtn = document.getElementById('completeSaleBtn');
        const newSellBtn = document.getElementById('newSellBtn');
        const listSalesBtn = document.getElementById('listSalesBtn');
        const applySalesFilter = document.getElementById('applySalesFilter');
        
        const addQuickCustomerBtn = document.getElementById('addQuickCustomerBtn');
        const saveQuickCustomerBtn = document.getElementById('saveQuickCustomerBtn');

        const addToCartBtn = document.getElementById('addToCartBtn');
        const cartDiscount = document.getElementById('cartDiscount');
        const paymentGiven = document.getElementById('paymentGiven');
        const paymentCash = document.getElementById('paymentCash');
        const paymentCredit = document.getElementById('paymentCredit');

        const sortableHeaders = document.querySelectorAll('#salesTable th.sortable');

        if (nextToCartBtn) nextToCartBtn.addEventListener('click', () => this.goToStep(2));
        if (backToCustomerBtn) backToCustomerBtn.addEventListener('click', () => this.goToStep(1));
        if (nextToPaymentBtn) nextToPaymentBtn.addEventListener('click', () => this.goToStep(3));
        if (backToCartBtn) backToCartBtn.addEventListener('click', () => this.goToStep(2));
        if (completeSaleBtn) completeSaleBtn.addEventListener('click', () => this.completeSale());
        if (newSellBtn) newSellBtn.addEventListener('click', () => this.resetPOS());
        if (listSalesBtn) listSalesBtn.addEventListener('click', () => this.toggleSalesList());
        if (applySalesFilter) applySalesFilter.addEventListener('click', () => this.loadSales());
        
        if (addQuickCustomerBtn) addQuickCustomerBtn.addEventListener('click', () => this.showQuickAddCustomer());
        if (saveQuickCustomerBtn) saveQuickCustomerBtn.addEventListener('click', () => this.saveQuickCustomer());

        if (addToCartBtn) addToCartBtn.addEventListener('click', () => this.addToCart());
        if (cartDiscount) cartDiscount.addEventListener('input', () => this.updateCartTotals());

        if (paymentGiven) paymentGiven.addEventListener('input', () => this.calculateChange());
        if (paymentCash) paymentCash.addEventListener('change', () => this.togglePaymentFields());
        if (paymentCredit) paymentCredit.addEventListener('change', () => this.togglePaymentFields());

        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortSales(column);
            });
        });
    }

    sortSales(column) {
        if (column === this.currentSort.column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'desc';
        }

        document.querySelectorAll('#salesTable th.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort ms-1';
        });

        const currentHeader = document.querySelector(`#salesTable th.sortable[data-sort="${column}"] i`);
        if (currentHeader) {
            currentHeader.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'} ms-1`;
        }

        this.renderSalesTable();
    }

    showQuickAddCustomer() {
        const modal = new bootstrap.Modal(document.getElementById('quickAddCustomerModal'));
        modal.show();
    }

    async saveQuickCustomer() {
        const name = document.getElementById('quickCustomerName')?.value.trim();
        const phone = document.getElementById('quickCustomerPhone')?.value.trim();
        const whatsapp = document.getElementById('quickCustomerWhatsapp')?.value.trim();

        if (!name) {
            this.showNotification('Veuillez entrer le nom du client', 'warning');
            return;
        }

        try {
            const newCustomer = {
                name: name.toUpperCase(),
                gender: '',
                phone: phone || '',
                whatsapp: whatsapp || '',
                address: '',
                revenue: 0,
                profit: 0,
                credit: 0,
                description: 'Ajouté rapidement depuis le POS',
                created_at: new Date()
            };

            await this.db.add('customers', newCustomer);
            
            await this.loadCustomers();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickAddCustomerModal'));
            if (modal) modal.hide();
            
            document.getElementById('quickCustomerForm').reset();
            
            this.showNotification(`✅ Client "${name}" ajouté avec succès`, 'success');
        } catch (error) {
            console.error('Erreur ajout client rapide:', error);
            this.showNotification('❌ Erreur lors de l\'ajout du client', 'error');
        }
    }

    async initPOS() {
        await this.loadCustomers();
        await this.loadProducts();
        await this.loadSales();
        this.resetPOS();
        this.showStep(1);
    }

    async loadCustomers() {
        try {
            this.customers = await this.db.getAll('customers');
            this.populateCustomerSelect();
        } catch (error) {
            console.error('Erreur chargement clients:', error);
        }
    }

    async loadProducts() {
        try {
            this.products = await this.db.getAll('products');
            this.populateProductSelect();
        } catch (error) {
            console.error('Erreur chargement produits:', error);
        }
    }

    async loadSales() {
        try {
            this.sales = await this.db.getAll('sales');
            if (document.getElementById('salesTableBody')) {
                this.renderSalesTable();
            }
        } catch (error) {
            console.error('Erreur chargement ventes:', error);
        }
    }

    populateCustomerSelect() {
        const select = document.getElementById('saleCustomer');
        if (!select) return;

        select.innerHTML = '<option value="">Client Passager (par défaut)</option>';
        
        if (this.customers && this.customers.length > 0) {
            this.customers.forEach(cust => {
                const option = document.createElement('option');
                option.value = cust.id;
                option.textContent = `${cust.name} ${cust.phone ? '- ' + cust.phone : ''}`;
                select.appendChild(option);
            });
        }
    }

    populateProductSelect() {
        const select = document.getElementById('cartProduct');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner un produit</option>';
        
        if (this.products && this.products.length > 0) {
            this.products.forEach(prod => {
                const option = document.createElement('option');
                option.value = prod.id;
                option.textContent = `${prod.name} - ${prod.priceSell} DH (Stock: ${prod.currentStock || prod.stock || 0})`;
                select.appendChild(option);
            });
        }
    }

    goToStep(step) {
        if (step === 2 && !this.validateCustomer()) return;
        if (step === 3 && !this.validateCart()) return;
        
        this.currentStep = step;
        this.showStep(step);
    }

    showStep(step) {
        document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active'));
        document.getElementById(`step${step}`)?.classList.add('active');

        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        document.getElementById(`step${step}Content`)?.classList.add('active');

        const stepNames = ['Sélection client', 'Panier', 'Paiement'];
        document.getElementById('posStepIndicator').textContent = `Étape ${step}: ${stepNames[step-1]}`;

        if (step === 3) {
            this.updatePaymentSummary();
        }
    }

    validateCustomer() {
        const customerSelect = document.getElementById('saleCustomer');
        if (!customerSelect) return false;

        const customerId = customerSelect.value;
        const customer = this.customers.find(c => c.id == customerId);

        this.currentSale.customerId = customerId || null;
        this.currentSale.customerName = customer ? customer.name : 'Client Passager';

        return true;
    }

    validateCart() {
        if (this.cart.length === 0) {
            this.showNotification('Veuillez ajouter au moins un produit au panier', 'warning');
            return false;
        }
        return true;
    }

    addToCart() {
        const productSelect = document.getElementById('cartProduct');
        const quantityInput = document.getElementById('cartQuantity');

        if (!productSelect || !quantityInput) return;

        const productId = productSelect.value;
        const quantity = parseInt(quantityInput.value) || 1;

        if (!productId) {
            this.showNotification('Veuillez sélectionner un produit', 'warning');
            return;
        }

        const product = this.products.find(p => p.id == productId);
        if (!product) return;

        const stock = product.currentStock || product.stock || 0;
        if (quantity > stock) {
            this.showNotification(`Stock insuffisant. Disponible: ${stock}`, 'warning');
            return;
        }

        const existingItem = this.cart.find(item => item.productId == productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                productId: product.id,
                productName: product.name,
                price: product.priceSell || 0,
                quantity: quantity,
                total: (product.priceSell || 0) * quantity,
                profitPerUnit: product.profit || 0,
                unitPriceCost: product.priceUnit || 0
            });
        }

        this.renderCart();
        this.updateCartTotals();
        this.showNotification(`✅ Produit ajouté au panier`, 'success');
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
        this.updateCartTotals();
    }

    updateCartItemQuantity(index, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(index);
            return;
        }

        const item = this.cart[index];
        const product = this.products.find(p => p.id == item.productId);
        
        if (product) {
            const stock = product.currentStock || product.stock || 0;
            if (newQuantity > stock) {
                this.showNotification(`Stock insuffisant. Disponible: ${stock}`, 'warning');
                return;
            }
        }

        item.quantity = newQuantity;
        item.total = item.price * newQuantity;
        this.renderCart();
        this.updateCartTotals();
    }

    renderCart() {
        const tbody = document.getElementById('cartItems');
        if (!tbody) return;

        if (this.cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3">Panier vide</td></tr>';
            return;
        }

        tbody.innerHTML = this.cart.map((item, index) => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.price.toFixed(2)} DH</td>
                <td>
                    <input type="number" class="form-control form-control-sm" style="width: 80px;" 
                           value="${item.quantity}" min="1" 
                           onchange="window.posManager.updateCartItemQuantity(${index}, parseInt(this.value) || 1)">
                </td>
                <td>${item.total.toFixed(2)} DH</td>
                <td>
                    <button class="btn-action btn-delete" onclick="window.posManager.removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
        const discount = parseFloat(document.getElementById('cartDiscount')?.value) || 0;
        const total = Math.max(0, subtotal - discount);

        this.currentSale.subtotal = subtotal;
        this.currentSale.discount = discount;
        this.currentSale.total = total;

        document.getElementById('cartSubtotal').textContent = `${subtotal.toFixed(2)} DH`;
        document.getElementById('cartTotal').textContent = `${total.toFixed(2)} DH`;
        document.getElementById('paymentTotal').textContent = `${total.toFixed(2)} DH`;

        this.calculateChange();
    }

    togglePaymentFields() {
        const isCash = document.getElementById('paymentCash').checked;
        document.getElementById('cashPaymentFields').style.display = isCash ? 'block' : 'none';
        document.getElementById('creditPaymentFields').style.display = isCash ? 'none' : 'block';
        
        this.currentSale.paymentMethod = isCash ? 'cash' : 'credit';
    }

    calculateChange() {
        const given = parseFloat(document.getElementById('paymentGiven')?.value) || 0;
        const total = this.currentSale.total;
        const change = Math.max(0, given - total);

        this.currentSale.paymentGiven = given;
        this.currentSale.paymentChange = change;

        document.getElementById('paymentChange').value = `${change.toFixed(2)} DH`;
    }

    updatePaymentSummary() {
        document.getElementById('paymentCustomer').textContent = this.currentSale.customerName;
        document.getElementById('paymentTotal').textContent = `${this.currentSale.total.toFixed(2)} DH`;
    }

    async completeSale() {
        const isCash = document.getElementById('paymentCash').checked;
        const given = parseFloat(document.getElementById('paymentGiven')?.value) || 0;
        
        const remaining = Math.max(0, this.currentSale.total - given);
        
        if (isCash && given <= 0 && this.currentSale.total > 0) {
            this.showNotification('Veuillez entrer un montant donné', 'warning');
            return;
        }
        
        if ((!isCash || remaining > 0) && !this.currentSale.customerId) {
            this.showNotification('Veuillez sélectionner un client pour le crédit ou le paiement partiel', 'warning');
            return;
        }
        
        if (isCash && remaining > 0) {
            const confirmPartial = confirm(`Paiement partiel: ${given.toFixed(2)} DH payé, reste ${remaining.toFixed(2)} DH. Voulez-vous créer un crédit pour le reste ?`);
            if (!confirmPartial) return;
        }

        let customer = null;
        if (this.currentSale.customerId) {
            customer = await this.db.getById('customers', parseInt(this.currentSale.customerId));
        }

        const totalProfit = this.cart.reduce((sum, item) => {
            return sum + ((item.profitPerUnit || 0) * item.quantity);
        }, 0);

        const totalCost = this.cart.reduce((sum, item) => {
            return sum + ((item.unitPriceCost || 0) * item.quantity);
        }, 0);

        let paymentMethod = isCash ? 'cash' : 'credit';
        let status = 'paid';
        
        if (isCash && remaining > 0) {
            status = 'partial';
            paymentMethod = 'partial';
        } else if (!isCash) {
            status = 'credit';
        }

        const sale = {
            invoiceNumber: this.generateInvoiceNumber(),
            date: new Date(),
            customerId: this.currentSale.customerId,
            customerName: this.currentSale.customerName,
            items: this.cart.map(item => {
                return {
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price,
                    priceCost: (item.unitPriceCost || 0) * item.quantity,
                    unitPriceCost: item.unitPriceCost || 0,
                    total: item.total,
                    profit: (item.profitPerUnit || 0) * item.quantity,
                    unitProfit: item.profitPerUnit || 0
                };
            }),
            subtotal: this.currentSale.subtotal,
            discount: this.currentSale.discount,
            total: this.currentSale.total,
            totalProfit: totalProfit,
            totalCost: totalCost,
            paymentMethod: paymentMethod,
            paymentGiven: given,
            paymentChange: isCash ? Math.max(0, given - this.currentSale.total) : 0,
            remaining: remaining,
            status: status,
            createdAt: new Date()
        };

        try {
            const saleId = await this.db.add('sales', sale);

            for (const item of this.cart) {
                const product = this.products.find(p => p.id == item.productId);
                if (product) {
                    product.currentStock = (product.currentStock || product.stock || 0) - item.quantity;
                    product.soldStock = (product.soldStock || 0) + item.quantity;
                    await this.db.update('products', product);
                }
            }

            if (customer) {
                customer.revenue = (customer.revenue || 0) + this.currentSale.total;
                customer.profit = (customer.profit || 0) + totalProfit;
                
                if (remaining > 0) {
                    customer.credit = (customer.credit || 0) + remaining;
                }
                
                await this.db.update('customers', customer);
            }

            if (remaining > 0) {
                const creditAmount = remaining;
                
                const credit = {
                    saleId: sale.invoiceNumber,
                    saleId_num: saleId,
                    customerId: this.currentSale.customerId,
                    customerName: this.currentSale.customerName,
                    amount: creditAmount,
                    remaining: creditAmount,
                    discount: this.currentSale.discount,
                    subtotal: this.currentSale.subtotal,
                    paid: given,
                    paidAmount: given,
                    originalTotal: this.currentSale.total,
                    originalCost: totalCost,
                    status: 'active',
                    dueDate: new Date(Date.now() + 30*24*60*60*1000),
                    items: this.cart.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        price: item.price,
                        priceCost: (item.unitPriceCost || 0) * item.quantity,
                        unitPriceCost: item.unitPriceCost || 0,
                        total: item.total,
                        profit: (item.profitPerUnit || 0) * item.quantity,
                        unitProfit: item.profitPerUnit || 0
                    })),
                    paymentHistory: [{
                        date: new Date(),
                        amount: given,
                        type: 'initial',
                        remaining: creditAmount
                    }],
                    created_at: new Date()
                };
                
                await this.db.add('credits', credit);
                
                if (window.creditManager) {
                    window.creditManager.loadCredits();
                }
            }

            let message = `✅ Vente finalisée : ${this.currentSale.total.toFixed(2)} DH`;
            if (remaining > 0) {
                message += `\n💳 Crédit restant : ${remaining.toFixed(2)} DH (Payé: ${given.toFixed(2)} DH)`;
            }
            
            this.showNotification(message, 'success');
            
            await this.loadProducts();
            await this.loadSales();
            await this.loadCustomers();
            
            this.resetPOS();
            this.goToStep(1);

        } catch (error) {
            console.error('Erreur finalisation vente:', error);
            this.showNotification('❌ Erreur lors de la finalisation', 'error');
        }
    }

    calculateItemProfit(item) {
        const product = this.products.find(p => p.id == item.productId);
        if (!product) return 0;
        
        const profitPerUnit = (product.profit || 0);
        return profitPerUnit * item.quantity;
    }

    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `INV-${year}${month}${day}-${random}`;
    }

    resetPOS() {
        this.currentStep = 1;
        this.cart = [];
        this.currentSale = {
            customerId: null,
            customerName: 'Client Passager',
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            paymentMethod: 'cash',
            paymentGiven: 0,
            paymentChange: 0
        };

        const saleCustomer = document.getElementById('saleCustomer');
        if (saleCustomer) saleCustomer.value = '';
        
        const cartDiscount = document.getElementById('cartDiscount');
        if (cartDiscount) cartDiscount.value = '0';
        
        const paymentGiven = document.getElementById('paymentGiven');
        if (paymentGiven) paymentGiven.value = '0';
        
        const paymentCash = document.getElementById('paymentCash');
        if (paymentCash) paymentCash.checked = true;
        
        const paymentChange = document.getElementById('paymentChange');
        if (paymentChange) paymentChange.value = '0.00 DH';
        
        this.togglePaymentFields();
        this.renderCart();
        this.updateCartTotals();
        this.showStep(1);
        
        const salesListView = document.getElementById('salesListView');
        if (salesListView) salesListView.style.display = 'none';
    }

    toggleSalesList() {
        const listView = document.getElementById('salesListView');
        const isVisible = listView.style.display !== 'none';
        
        listView.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.loadSales();
        }
    }

    renderSalesTable() {
        const tbody = document.getElementById('salesTableBody');
        if (!tbody) return;

        const filter = document.getElementById('salesDateFilter')?.value || 'today';
        const searchTerm = document.getElementById('salesSearch')?.value.toLowerCase() || '';

        let filteredSales = this.filterSalesByDate(this.sales, filter);

        if (searchTerm) {
            filteredSales = filteredSales.filter(sale => 
                (sale.invoiceNumber && sale.invoiceNumber.toLowerCase().includes(searchTerm)) ||
                (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm)) ||
                (sale.items && sale.items.some(item => 
                    item.productName && item.productName.toLowerCase().includes(searchTerm)
                ))
            );
        }

        filteredSales.sort((a, b) => {
            let valA, valB;

            switch(this.currentSort.column) {
                case 'invoice':
                    valA = a.invoiceNumber || '';
                    valB = b.invoiceNumber || '';
                    break;
                case 'id':
                    valA = a.id || 0;
                    valB = b.id || 0;
                    break;
                case 'date':
                    valA = new Date(a.date);
                    valB = new Date(b.date);
                    break;
                case 'customerId':
                    valA = a.customerId || 0;
                    valB = b.customerId || 0;
                    break;
                case 'customerName':
                    valA = a.customerName || '';
                    valB = b.customerName || '';
                    break;
                case 'quantity':
                    valA = a.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    valB = b.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    break;
                case 'price':
                    valA = a.items?.[0]?.price || 0;
                    valB = b.items?.[0]?.price || 0;
                    break;
                case 'total':
                    valA = a.items?.[0]?.total || 0;
                    valB = b.items?.[0]?.total || 0;
                    break;
                case 'saleProfit':
                    valA = a.items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;
                    valB = b.items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;
                    break;
                case 'paid':
                    valA = a.paymentGiven || 0;
                    valB = b.paymentGiven || 0;
                    break;
                case 'remaining':
                    valA = a.remaining || 0;
                    valB = b.remaining || 0;
                    break;
                case 'payment':
                    valA = a.paymentMethod || '';
                    valB = b.paymentMethod || '';
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        if (filteredSales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="16" class="text-center py-4">Aucune vente trouvée</td></tr>';
            return;
        }

        tbody.innerHTML = filteredSales.map(sale => {
            return sale.items.map((item, idx) => {
                const priceCost = item.priceCost || (item.unitPriceCost || 0) * item.quantity || 0;
                const profitPerUnit = item.unitProfit || 0;
                const itemTotalProfit = profitPerUnit * item.quantity;
                const saleTotalProfit = sale.items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;

                let paymentMethodText = '';
                if (sale.paymentMethod === 'cash') paymentMethodText = 'Espèces';
                else if (sale.paymentMethod === 'credit') paymentMethodText = 'Crédit';
                else if (sale.paymentMethod === 'partial') paymentMethodText = 'Partiel';
                else paymentMethodText = sale.paymentMethod;

                const showButtons = idx === 0;

                return `
                    <tr>
                        <td>${sale.invoiceNumber || 'N/A'}</td>
                        <td>#${sale.id}</td>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.customerId || '-'}</td>
                        <td>${sale.customerName || 'Client Passager'}</td>
                        <td>${item.productName}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)} DH</td>
                        <td>${priceCost.toFixed(2)} DH</td>
                        <td>${profitPerUnit.toFixed(2)} DH</td>
                        <td>${item.total.toFixed(2)} DH</td>
                        <td>${itemTotalProfit.toFixed(2)} DH</td>
                        <td>${saleTotalProfit.toFixed(2)} DH</td>
                        <td>${sale.paymentGiven ? sale.paymentGiven.toFixed(2) + ' DH' : '-'}</td>
                        <td>${sale.remaining ? sale.remaining.toFixed(2) + ' DH' : '-'}</td>
                        <td>${paymentMethodText}</td>
                        <td>
                            ${showButtons ? `
                                <button class="btn-action btn-pdf me-1" onclick="window.salesManager.generateSalePDF(${sale.id})" title="Télécharger PDF" style="color: #e74c3c;">
                                    <i class="fas fa-file-pdf"></i>
                                </button>
                                <button class="btn-action btn-whatsapp me-1" onclick="window.salesManager.sendSaleWhatsApp(${sale.id})" title="Envoyer sur WhatsApp" style="color: #25D366;">
                                    <i class="fab fa-whatsapp"></i>
                                </button>
                                <button class="btn-action btn-edit me-1" onclick="window.salesManager.viewSale(${sale.id})" title="Voir détails">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-action btn-delete" onclick="window.salesManager.deleteSale(${sale.id})" title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }).join('');
        }).join('');
    }

    filterSalesByDate(sales, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const filters = {
            'today': (date) => date >= today,
            '1day': (date) => date >= new Date(today.getTime() - 1*24*60*60*1000),
            '3days': (date) => date >= new Date(today.getTime() - 3*24*60*60*1000),
            '1week': (date) => date >= new Date(today.getTime() - 7*24*60*60*1000),
            '15days': (date) => date >= new Date(today.getTime() - 15*24*60*60*1000),
            '1month': (date) => date >= new Date(today.getTime() - 30*24*60*60*1000),
            '3months': (date) => date >= new Date(today.getTime() - 90*24*60*60*1000),
            '6months': (date) => date >= new Date(today.getTime() - 180*24*60*60*1000),
            '1year': (date) => date >= new Date(today.getTime() - 365*24*60*60*1000),
            'all': () => true
        };

        const filterFn = filters[filter] || filters['today'];
        
        return sales.filter(sale => filterFn(new Date(sale.date)));
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== SALES MANAGER ====================
class SalesManager {
    constructor() {
        this.db = window.minimarketDB;
        this.sales = [];
        this.filteredSales = [];
        this.currentSort = { column: 'date', direction: 'desc' };
        this.initEventListeners();
    }

    initEventListeners() {
        const importBtn = document.getElementById('importSalesHistoryBtn');
        const exportBtn = document.getElementById('exportSalesHistoryBtn');
        const refreshBtn = document.getElementById('refreshSalesListBtn');
        const applyFilterBtn = document.getElementById('applySalesHistoryFilter');
        const searchInput = document.getElementById('salesHistorySearch');
        const sortableHeaders = document.querySelectorAll('#salesHistoryTable th.sortable');

        if (importBtn) importBtn.addEventListener('click', () => this.importSales());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportSales());
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadSales());
        if (applyFilterBtn) applyFilterBtn.addEventListener('click', () => this.applyFilters());
        if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());

        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortSales(column);
            });
        });
    }

    async loadSales() {
        try {
            this.sales = await this.db.getAll('sales');
            this.applyFilters();
            console.log('✅ Ventes chargées depuis IndexedDB:', this.sales.length);
        } catch (error) {
            console.error('❌ Erreur chargement ventes:', error);
            this.sales = [];
        }
    }

    applyFilters() {
        const filter = document.getElementById('salesHistoryDateFilter')?.value || 'all';
        const searchTerm = document.getElementById('salesHistorySearch')?.value.toLowerCase() || '';

        this.filteredSales = this.filterSalesByDate(this.sales, filter);

        if (searchTerm) {
            this.filteredSales = this.filteredSales.filter(sale => 
                (sale.invoiceNumber && sale.invoiceNumber.toLowerCase().includes(searchTerm)) ||
                (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm)) ||
                (sale.items && sale.items.some(item => 
                    item.productName && item.productName.toLowerCase().includes(searchTerm)
                ))
            );
        }

        this.sortSales(this.currentSort.column, true);

        this.updateStats();

        this.renderSalesTable();
    }

    filterSalesByDate(sales, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const filters = {
            'today': (date) => date >= today,
            'yesterday': (date) => date >= yesterday && date < today,
            '1day': (date) => date >= new Date(today.getTime() - 1*24*60*60*1000),
            '3days': (date) => date >= new Date(today.getTime() - 3*24*60*60*1000),
            '1week': (date) => date >= new Date(today.getTime() - 7*24*60*60*1000),
            '15days': (date) => date >= new Date(today.getTime() - 15*24*60*60*1000),
            '1month': (date) => date >= new Date(today.getTime() - 30*24*60*60*1000),
            '3months': (date) => date >= new Date(today.getTime() - 90*24*60*60*1000),
            '6months': (date) => date >= new Date(today.getTime() - 180*24*60*60*1000),
            '1year': (date) => date >= new Date(today.getTime() - 365*24*60*60*1000),
            'all': () => true
        };

        const filterFn = filters[filter] || filters['all'];
        
        return sales.filter(sale => filterFn(new Date(sale.date)));
    }

    sortSales(column, skipToggle = false) {
        if (!skipToggle && column === this.currentSort.column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'desc';
        }

        document.querySelectorAll('#salesHistoryTable th.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort ms-1';
        });

        const currentHeader = document.querySelector(`#salesHistoryTable th.sortable[data-sort="${column}"] i`);
        if (currentHeader) {
            currentHeader.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'} ms-1`;
        }

        this.filteredSales.sort((a, b) => {
            let valA, valB;

            switch(column) {
                case 'invoice':
                    valA = a.invoiceNumber || '';
                    valB = b.invoiceNumber || '';
                    break;
                case 'id':
                    valA = a.id || 0;
                    valB = b.id || 0;
                    break;
                case 'date':
                    valA = new Date(a.date);
                    valB = new Date(b.date);
                    break;
                case 'customerId':
                    valA = a.customerId || 0;
                    valB = b.customerId || 0;
                    break;
                case 'customerName':
                    valA = a.customerName || '';
                    valB = b.customerName || '';
                    break;
                case 'quantity':
                    valA = a.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    valB = b.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    break;
                case 'price':
                    valA = a.items?.[0]?.price || 0;
                    valB = b.items?.[0]?.price || 0;
                    break;
                case 'total':
                    valA = a.items?.[0]?.total || 0;
                    valB = b.items?.[0]?.total || 0;
                    break;
                case 'saleProfit':
                    valA = a.items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;
                    valB = b.items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;
                    break;
                case 'paid':
                    valA = a.paymentGiven || 0;
                    valB = b.paymentGiven || 0;
                    break;
                case 'remaining':
                    valA = a.remaining || 0;
                    valB = b.remaining || 0;
                    break;
                case 'payment':
                    valA = a.paymentMethod || '';
                    valB = b.paymentMethod || '';
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderSalesTable();
    }

    updateStats() {
        const totalSales = this.filteredSales.length;
        const totalRevenue = this.filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalProfit = this.filteredSales.reduce((sum, sale) => {
            const saleProfit = sale.items ? sale.items.reduce((itemSum, item) => itemSum + (item.profit || 0), 0) : 0;
            return sum + saleProfit;
        }, 0);

        document.getElementById('salesCount').textContent = totalSales;
        document.getElementById('salesRevenue').textContent = `${totalRevenue.toFixed(2)} DH`;
        document.getElementById('salesProfit').textContent = `${totalProfit.toFixed(2)} DH`;
    }

    // ==================== MÉTHODES D'EXPORT EXCEL POUR LES VENTES ====================

    async exportSalesWithExcel() {
        try {
            const sales = await this.db.getAll('sales');
            
            if (sales.length === 0) {
                this.showNotification('❌ Aucune vente à exporter', 'warning');
                return;
            }

            const exportData = [];
            
            sales.forEach(sale => {
                if (sale.items && sale.items.length > 0) {
                    sale.items.forEach(item => {
                        const priceCost = item.priceCost || (item.unitPriceCost || 0) * item.quantity || 0;
                        const profit = item.profit || (item.unitProfit || 0) * item.quantity || 0;
                        const paidAmount = sale.paymentGiven || 0;
                        
                        exportData.push({
                            'N° Facture': sale.invoiceNumber || 'N/A',
                            'ID Vente': sale.id || 'N/A',
                            'Date': new Date(sale.date).toLocaleDateString('fr-FR'),
                            'Heure': new Date(sale.date).toLocaleTimeString('fr-FR'),
                            'Client': sale.customerName || 'Client Passager',
                            'ID Client': sale.customerId || '-',
                            'Produit': item.productName || 'N/A',
                            'Quantité': item.quantity || 0,
                            'Prix Unitaire (DH)': item.price ? Number(item.price).toFixed(2) : '0.00',
                            'Prix Revient (DH)': Number(priceCost).toFixed(2),
                            'Profit Unitaire (DH)': Number(item.unitProfit || 0).toFixed(2),
                            'Total Produit (DH)': item.total ? Number(item.total).toFixed(2) : '0.00',
                            'Profit Produit (DH)': Number(profit).toFixed(2),
                            'Remise (DH)': Number(sale.discount || 0).toFixed(2),
                            'Total Vente (DH)': Number(sale.total || 0).toFixed(2),
                            'Payé (DH)': Number(paidAmount).toFixed(2),
                            'Reste (DH)': Number(sale.remaining || 0).toFixed(2),
                            'Mode Paiement': this.getPaymentMethodText(sale.paymentMethod),
                            'Statut': this.getSaleStatus(sale)
                        });
                    });
                } else {
                    exportData.push({
                        'N° Facture': sale.invoiceNumber || 'N/A',
                        'ID Vente': sale.id || 'N/A',
                        'Date': new Date(sale.date).toLocaleDateString('fr-FR'),
                        'Heure': new Date(sale.date).toLocaleTimeString('fr-FR'),
                        'Client': sale.customerName || 'Client Passager',
                        'ID Client': sale.customerId || '-',
                        'Produit': 'Sans produit',
                        'Quantité': 0,
                        'Prix Unitaire (DH)': '0.00',
                        'Prix Revient (DH)': '0.00',
                        'Profit Unitaire (DH)': '0.00',
                        'Total Produit (DH)': '0.00',
                        'Profit Produit (DH)': '0.00',
                        'Remise (DH)': Number(sale.discount || 0).toFixed(2),
                        'Total Vente (DH)': Number(sale.total || 0).toFixed(2),
                        'Payé (DH)': Number(sale.paymentGiven || 0).toFixed(2),
                        'Reste (DH)': Number(sale.remaining || 0).toFixed(2),
                        'Mode Paiement': this.getPaymentMethodText(sale.paymentMethod),
                        'Statut': this.getSaleStatus(sale)
                    });
                }
            });

            await this.generateExcelFile(exportData, 'ventes');
            this.showNotification(`✅ Export réussi ! ${sales.length} vente(s) exportée(s)`, 'success');
            
        } catch (error) {
            console.error('Erreur export ventes:', error);
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    getPaymentMethodText(method) {
        const methods = {
            'cash': 'Espèces',
            'credit': 'Crédit',
            'partial': 'Partiel'
        };
        return methods[method] || method || 'N/A';
    }

    getSaleStatus(sale) {
        if (sale.status === 'paid') return 'Payé';
        if (sale.remaining && sale.remaining > 0) return 'Partiel';
        if (sale.paymentMethod === 'credit') return 'Crédit';
        return 'Complet';
    }

    async generateExcelFile(data, filename) {
        if (!data || data.length === 0) {
            this.showNotification('❌ Aucune donnée à exporter', 'warning');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        csvRows.push(headers.join(','));
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] !== undefined && row[header] !== null ? row[header] : '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        });

        const csvString = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `${filename}_${date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ==================== AUTRES MÉTHODES ====================

    async generateSalePDF(saleId) {
        try {
            const sale = this.sales.find(s => s.id === saleId);
            if (!sale) {
                this.showNotification('Vente non trouvée', 'error');
                return;
            }

            let customerPhone = '';
            let customerWhatsapp = '';
            if (sale.customerId) {
                const customer = await this.db.getById('customers', sale.customerId);
                if (customer) {
                    customerPhone = customer.phone || '';
                    customerWhatsapp = customer.whatsapp || '';
                }
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 0);
            doc.text('MiniMarket Pro', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Facture de vente', 105, 30, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`N° Facture: ${sale.invoiceNumber || 'N/A'}`, 20, 45);
            doc.text(`Date: ${new Date(sale.date).toLocaleDateString('fr-FR')}`, 20, 52);
            doc.text(`Client: ${sale.customerName || 'Client Passager'}`, 20, 59);
            
            if (customerPhone) {
                doc.text(`Tél: ${customerPhone}`, 20, 66);
            }
            
            const tableColumn = ["Produit", "Quantité", "Prix unit.", "Total"];
            const tableRows = [];
            
            let totalHT = 0;
            
            sale.items.forEach(item => {
                const row = [
                    item.productName,
                    item.quantity.toString(),
                    item.price.toFixed(2) + ' DH',
                    item.total.toFixed(2) + ' DH'
                ];
                tableRows.push(row);
                totalHT += item.total;
            });
            
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 75,
                theme: 'striped',
                headStyles: { fillColor: [46, 204, 113], textColor: [255, 255, 255] },
                styles: { fontSize: 9 }
            });
            
            const finalY = doc.lastAutoTable.finalY + 10;
            
            doc.setFontSize(10);
            doc.text('Récapitulatif', 150, finalY);
            doc.text(`Sous-total: ${sale.subtotal.toFixed(2)} DH`, 150, finalY + 7);
            
            if (sale.discount > 0) {
                doc.text(`Remise: -${sale.discount.toFixed(2)} DH`, 150, finalY + 14);
                doc.text(`Total: ${sale.total.toFixed(2)} DH`, 150, finalY + 21);
            } else {
                doc.text(`Total: ${sale.total.toFixed(2)} DH`, 150, finalY + 14);
            }
            
            doc.text(`Payé: ${sale.paymentGiven?.toFixed(2) || 0} DH`, 150, finalY + 28);
            
            if (sale.remaining > 0) {
                doc.setTextColor(231, 76, 60);
                doc.text(`Reste: ${sale.remaining.toFixed(2)} DH`, 150, finalY + 35);
            }
            
            doc.setTextColor(0, 0, 0);
            let paymentText = 'Paiement: ';
            if (sale.paymentMethod === 'cash') paymentText += 'Espèces';
            else if (sale.paymentMethod === 'credit') paymentText += 'Crédit';
            else if (sale.paymentMethod === 'partial') paymentText += 'Paiement partiel';
            else paymentText += sale.paymentMethod;
            
            doc.text(paymentText, 20, finalY + 10);
            
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Merci de votre confiance !', 105, 280, { align: 'center' });
            doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 105, 285, { align: 'center' });
            
            doc.save(`facture_${sale.invoiceNumber || sale.id}.pdf`);
            
            this.showNotification('✅ PDF généré avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            this.showNotification('❌ Erreur lors de la génération du PDF', 'error');
        }
    }

    async sendSaleWhatsApp(saleId) {
        try {
            const sale = this.sales.find(s => s.id === saleId);
            if (!sale) {
                this.showNotification('Vente non trouvée', 'error');
                return;
            }

            if (!sale.customerId) {
                this.showNotification('Cette vente n\'a pas de client associé', 'warning');
                return;
            }

            const customer = await this.db.getById('customers', sale.customerId);
            if (!customer) {
                this.showNotification('Client non trouvé', 'error');
                return;
            }

            let phoneNumber = customer.whatsapp || customer.phone;
            if (!phoneNumber) {
                this.showNotification('Ce client n\'a pas de numéro de téléphone', 'warning');
                return;
            }

            phoneNumber = phoneNumber.replace(/\s+/g, '').replace(/[-.]/g, '');
            
            let message = `Facture ${sale.invoiceNumber} - ${sale.total} DH`;
            
            const urls = [
                `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
                `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
                `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
            ];
            
            for (const url of urls) {
                try {
                    window.open(url, '_blank');
                    break;
                } catch (e) {
                    console.log('URL échouée:', url);
                }
            }
            
            this.showNotification('✅ WhatsApp ouvert', 'success');
            
        } catch (error) {
            console.error('Erreur WhatsApp:', error);
            this.showNotification('❌ Erreur', 'error');
        }
    }

    renderSalesTable() {
        const tbody = document.getElementById('salesHistoryTableBody');
        if (!tbody) return;

        if (this.filteredSales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="19" class="text-center py-4">Aucune vente trouvée</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredSales.map(sale => {
            return sale.items.map((item, idx) => {
                const priceCost = item.priceCost || (item.unitPriceCost || 0) * item.quantity || 0;
                const profitPerUnit = item.unitProfit || 0;
                const itemTotalProfit = profitPerUnit * item.quantity;
                const saleTotalProfit = sale.items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;

                let paymentMethodText = '';
                if (sale.paymentMethod === 'cash') paymentMethodText = 'Espèces';
                else if (sale.paymentMethod === 'credit') paymentMethodText = 'Crédit';
                else if (sale.paymentMethod === 'partial') paymentMethodText = 'Partiel';
                else paymentMethodText = sale.paymentMethod;

                const remaining = (sale.status === 'paid') ? 0 : (sale.remaining || 0);
                const showButtons = idx === 0;

                return `
                    <tr>
                        <td>${sale.invoiceNumber || 'N/A'}</td>
                        <td>#${sale.id}</td>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.customerId || '-'}</td>
                        <td>${sale.customerName || 'Client Passager'}</td>
                        <td>${item.productName}</td>
                        <td>${item.quantity}</td>
                        <td class="text-end">${item.price.toFixed(2)} DH</td>
                        <td class="text-end">${priceCost.toFixed(2)} DH</td>
                        <td class="text-end">${profitPerUnit.toFixed(2)} DH</td>
                        <td class="text-end">${item.total.toFixed(2)} DH</td>
                        <td class="text-end">${itemTotalProfit.toFixed(2)} DH</td>
                        <td class="text-end">${saleTotalProfit.toFixed(2)} DH</td>
                        <td class="text-end">${(sale.discount || 0).toFixed(2)} DH</td>
                        <td class="text-end">${sale.paymentGiven ? sale.paymentGiven.toFixed(2) + ' DH' : '-'}</td>
                        <td class="text-end ${remaining > 0 ? 'text-warning fw-bold' : ''}">${remaining.toFixed(2)} DH</td>
                        <td>${paymentMethodText}</td>
                        <td class="text-center">
                            ${showButtons ? `
                                <button class="btn-action btn-pdf me-1" onclick="window.salesManager.generateSalePDF(${sale.id})" title="Télécharger PDF" style="color: #e74c3c;">
                                    <i class="fas fa-file-pdf"></i>
                                </button>
                                <button class="btn-action btn-whatsapp me-1" onclick="window.salesManager.sendSaleWhatsApp(${sale.id})" title="Envoyer sur WhatsApp" style="color: #25D366;">
                                    <i class="fab fa-whatsapp"></i>
                                </button>
                                <button class="btn-action btn-edit me-1" onclick="window.salesManager.viewSale(${sale.id})" title="Voir détails">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-action btn-delete" onclick="window.salesManager.deleteSale(${sale.id})" title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            }).join('');
        }).join('');
    }

    viewSale(id) {
        const sale = this.sales.find(s => s.id === id);
        if (!sale) return;

        const details = `
            Facture: ${sale.invoiceNumber}
            Date: ${new Date(sale.date).toLocaleString()}
            Client: ${sale.customerName || 'Client Passager'}
            Total: ${sale.total} DH
            Remise: ${sale.discount || 0} DH
            Payé: ${sale.paymentGiven || 0} DH
            Reste: ${sale.remaining || 0} DH
            Paiement: ${sale.paymentMethod === 'cash' ? 'Espèces' : sale.paymentMethod === 'credit' ? 'Crédit' : 'Partiel'}
        `;
        
        this.showNotification(`Détails de la vente #${id}`, 'info');
        console.log(details);
    }

    async deleteSale(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
            try {
                await this.db.delete('sales', id);
                await this.loadSales();
                this.showNotification('✅ Vente supprimée avec succès', 'success');
            } catch (error) {
                console.error('Erreur suppression vente:', error);
                this.showNotification('❌ Erreur lors de la suppression', 'error');
            }
        }
    }

    async importSales() {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.json')) {
                    this.showNotification('❌ Le fichier doit être au format JSON', 'error');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(jsonData)) {
                            throw new Error('Le fichier doit contenir un tableau de ventes');
                        }
                        
                        let importedCount = 0;
                        let skippedCount = 0;
                        
                        for (const sale of jsonData) {
                            try {
                                if (!sale.invoiceNumber || !sale.date) {
                                    skippedCount++;
                                    continue;
                                }
                                
                                await this.db.add('sales', sale);
                                importedCount++;
                            } catch (saleError) {
                                console.error('Erreur import vente:', saleError);
                                skippedCount++;
                            }
                        }
                        
                        await this.loadSales();
                        this.showNotification(`✅ Import terminé : ${importedCount} importée(s), ${skippedCount} ignorée(s)`, 'success');
                        
                    } catch (error) {
                        this.showNotification('❌ Fichier JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            setTimeout(() => document.body.removeChild(fileInput), 1000);
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'import', 'error');
        }
    }

    async exportSales() {
        try {
            if (this.filteredSales.length === 0) {
                this.showNotification('❌ Aucune vente à exporter', 'warning');
                return;
            }
            
            const exportData = this.filteredSales.map(sale => ({
                id: sale.id,
                invoiceNumber: sale.invoiceNumber,
                date: sale.date,
                customerId: sale.customerId,
                customerName: sale.customerName,
                items: sale.items,
                subtotal: sale.subtotal,
                discount: sale.discount,
                total: sale.total,
                paymentMethod: sale.paymentMethod,
                paymentGiven: sale.paymentGiven,
                paymentChange: sale.paymentChange,
                remaining: sale.remaining,
                status: sale.status
            }));

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            
            const date = new Date().toISOString().split('T')[0];
            link.download = `ventes_${date}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.showNotification(`✅ Export réussi ! ${exportData.length} vente(s) exportée(s)`, 'success');
            
        } catch (error) {
            console.error('Erreur export:', error);
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== CREDIT MANAGER ====================
class CreditManager {
    constructor() {
        this.db = window.minimarketDB;
        this.credits = [];
        this.filteredCredits = [];
        this.sales = [];
        this.customers = [];
        this.products = [];
        this.currentSort = { column: 'created_at', direction: 'desc' };
        this.initEventListeners();
    }

    initEventListeners() {
        const addBtn = document.getElementById('addCreditBtn');
        const importBtn = document.getElementById('importCreditsBtn');
        const exportBtn = document.getElementById('exportCreditsBtn');
        const refreshBtn = document.getElementById('refreshCreditsBtn');
        const applyFilterBtn = document.getElementById('applyCreditFilter');
        const searchInput = document.getElementById('creditSearch');
        const statusFilter = document.getElementById('creditStatusFilter');
        const saveCreditBtn = document.getElementById('saveCreditBtn');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        const addQuickCustomerCreditBtn = document.getElementById('addQuickCustomerCreditBtn');
        const saveQuickCustomerCreditBtn = document.getElementById('saveQuickCustomerCreditBtn');
        const sortableHeaders = document.querySelectorAll('#creditsTable th.sortable');

        if (addBtn) addBtn.addEventListener('click', () => this.showAddCreditModal());
        if (importBtn) importBtn.addEventListener('click', () => this.importCredits());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCredits());
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadCredits());
        if (applyFilterBtn) applyFilterBtn.addEventListener('click', () => this.applyFilters());
        if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());
        if (statusFilter) statusFilter.addEventListener('change', () => this.applyFilters());
        if (saveCreditBtn) saveCreditBtn.addEventListener('click', () => this.saveCredit());
        if (confirmPaymentBtn) confirmPaymentBtn.addEventListener('click', () => this.confirmPayment());
        if (addQuickCustomerCreditBtn) addQuickCustomerCreditBtn.addEventListener('click', () => this.showQuickAddCustomer());
        if (saveQuickCustomerCreditBtn) saveQuickCustomerCreditBtn.addEventListener('click', () => this.saveQuickCustomer());

        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortCredits(column);
            });
        });

        const addCreditModal = document.getElementById('addCreditModal');
        if (addCreditModal) {
            addCreditModal.addEventListener('hidden.bs.modal', () => {
                document.getElementById('addCreditForm').reset();
            });
            addCreditModal.addEventListener('shown.bs.modal', () => {
                this.initCreditFormListeners();
            });
        }

        const paymentModal = document.getElementById('paymentModal');
        if (paymentModal) {
            paymentModal.addEventListener('hidden.bs.modal', () => {
                document.getElementById('paymentForm').reset();
            });
        }
    }

    initCreditFormListeners() {
        const priceSell = document.getElementById('creditPriceSell');
        const priceCost = document.getElementById('creditPriceCost');
        const quantity = document.getElementById('creditQuantity');
        
        if (priceSell && priceCost && quantity) {
            const calculateProductFields = () => {
                const sell = parseFloat(priceSell.value) || 0;
                const cost = parseFloat(priceCost.value) || 0;
                const qty = parseInt(quantity.value) || 1;
                
                const profitUnit = sell - cost;
                document.getElementById('creditProfitUnit').value = profitUnit.toFixed(2);
                
                const totalProduct = sell * qty;
                document.getElementById('creditTotalProduct').value = totalProduct.toFixed(2);
                
                const profitTotal = profitUnit * qty;
                document.getElementById('creditProfitTotal').value = profitTotal.toFixed(2);
                document.getElementById('creditProfitSale').value = profitTotal.toFixed(2);
                
                this.calculateRemaining();
            };
            
            priceSell.addEventListener('input', calculateProductFields.bind(this));
            priceCost.addEventListener('input', calculateProductFields.bind(this));
            quantity.addEventListener('input', calculateProductFields.bind(this));
        }
        
        const amount = document.getElementById('creditAmount');
        const paid = document.getElementById('creditPaid');
        
        const calculateRemaining = () => {
            const total = parseFloat(amount.value) || 0;
            const paidAmount = parseFloat(paid.value) || 0;
            const remaining = Math.max(0, total - paidAmount);
            document.getElementById('creditRemaining').value = remaining.toFixed(2);
        };
        
        if (amount && paid) {
            amount.addEventListener('input', calculateRemaining.bind(this));
            paid.addEventListener('input', calculateRemaining.bind(this));
        }
        
        const productSelect = document.getElementById('creditProduct');
        if (productSelect) {
            productSelect.addEventListener('change', async (e) => {
                const productId = e.target.value;
                if (productId) {
                    try {
                        const product = await this.db.getById('products', parseInt(productId));
                        if (product) {
                            document.getElementById('creditPriceSell').value = product.priceSell || 0;
                            document.getElementById('creditPriceCost').value = (product.priceUnit || 0);
                            document.getElementById('creditQuantity').value = 1;
                            
                            const sellEvent = new Event('input');
                            document.getElementById('creditPriceSell').dispatchEvent(sellEvent);
                            document.getElementById('creditPriceCost').dispatchEvent(sellEvent);
                            document.getElementById('creditQuantity').dispatchEvent(sellEvent);
                        }
                    } catch (error) {
                        console.error('Erreur chargement produit:', error);
                    }
                }
            });
        }
    }

    calculateRemaining() {
        const amount = document.getElementById('creditAmount');
        const paid = document.getElementById('creditPaid');
        if (amount && paid) {
            const total = parseFloat(amount.value) || 0;
            const paidAmount = parseFloat(paid.value) || 0;
            const remaining = Math.max(0, total - paidAmount);
            document.getElementById('creditRemaining').value = remaining.toFixed(2);
        }
    }

    showQuickAddCustomer() {
        const modal = new bootstrap.Modal(document.getElementById('quickAddCustomerCreditModal'));
        modal.show();
    }

    async saveQuickCustomer() {
        const name = document.getElementById('quickCustomerCreditName')?.value.trim();
        const phone = document.getElementById('quickCustomerCreditPhone')?.value.trim();
        const whatsapp = document.getElementById('quickCustomerCreditWhatsapp')?.value.trim();

        if (!name) {
            this.showNotification('Veuillez entrer le nom du client', 'warning');
            return;
        }

        try {
            const newCustomer = {
                name: name.toUpperCase(),
                gender: '',
                phone: phone || '',
                whatsapp: whatsapp || '',
                address: '',
                revenue: 0,
                profit: 0,
                credit: 0,
                description: 'Ajouté rapidement depuis les crédits',
                created_at: new Date()
            };

            await this.db.add('customers', newCustomer);
            await this.loadCustomers();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickAddCustomerCreditModal'));
            if (modal) modal.hide();
            
            document.getElementById('quickCustomerCreditForm').reset();
            this.showNotification(`✅ Client "${name}" ajouté avec succès`, 'success');
        } catch (error) {
            console.error('Erreur ajout client rapide:', error);
            this.showNotification('❌ Erreur lors de l\'ajout du client', 'error');
        }
    }

    sortCredits(column) {
        if (column === this.currentSort.column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'desc';
        }

        document.querySelectorAll('#creditsTable th.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort ms-1';
        });

        const currentHeader = document.querySelector(`#creditsTable th.sortable[data-sort="${column}"] i`);
        if (currentHeader) {
            currentHeader.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'} ms-1`;
        }

        this.sortFilteredCredits();
        this.renderCreditsTable();
    }

    async loadCredits() {
        try {
            this.credits = await this.db.getAll('credits');
            this.sales = await this.db.getAll('sales');
            this.customers = await this.db.getAll('customers');
            this.products = await this.db.getAll('products');
            this.populateCustomerSelect();
            this.populateProductSelect();
            
            this.filteredCredits = [...this.credits];
            
            this.filteredCredits.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                return dateB - dateA;
            });
            
            this.renderCreditsTable();
            this.updateStats();
            console.log('✅ Crédits chargés depuis IndexedDB:', this.credits.length);
        } catch (error) {
            console.error('❌ Erreur chargement crédits:', error);
            this.credits = [];
            this.filteredCredits = [];
        }
    }

    populateCustomerSelect() {
        const select = document.getElementById('creditCustomer');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner un client</option>';
        
        if (this.customers && this.customers.length > 0) {
            this.customers.forEach(cust => {
                const option = document.createElement('option');
                option.value = cust.id;
                option.textContent = `${cust.name} ${cust.phone ? '- ' + cust.phone : ''}`;
                select.appendChild(option);
            });
        }
    }

    async populateProductSelect() {
        const select = document.getElementById('creditProduct');
        if (!select) return;
        
        try {
            const products = await this.db.getAll('products');
            select.innerHTML = '<option value="">Sélectionner un produit (optionnel)</option>';
            
            if (products && products.length > 0) {
                products.forEach(prod => {
                    const option = document.createElement('option');
                    option.value = prod.id;
                    option.textContent = `${prod.name} - ${prod.priceSell} DH`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erreur chargement produits:', error);
        }
    }

    applyFilters() {
        const searchTerm = document.getElementById('creditSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('creditStatusFilter')?.value || 'all';

        this.filteredCredits = this.credits.filter(credit => {
            const matchesSearch = searchTerm === '' || 
                (credit.customerName && credit.customerName.toLowerCase().includes(searchTerm)) ||
                (credit.saleId && credit.saleId.toLowerCase().includes(searchTerm));

            let matchesStatus = true;
            if (statusFilter !== 'all') {
                const now = new Date();
                const dueDate = credit.dueDate ? new Date(credit.dueDate) : null;
                
                if (statusFilter === 'active') {
                    matchesStatus = credit.status === 'active';
                } else if (statusFilter === 'paid') {
                    matchesStatus = credit.status === 'paid';
                } else if (statusFilter === 'overdue') {
                    matchesStatus = credit.status === 'active' && dueDate && dueDate < now;
                }
            }

            return matchesSearch && matchesStatus;
        });

        this.sortFilteredCredits();
        this.updateStats();
        this.renderCreditsTable();
    }

    sortFilteredCredits() {
        this.filteredCredits.sort((a, b) => {
            let valA, valB;

            switch(this.currentSort.column) {
                case 'invoice':
                    valA = a.saleId || '';
                    valB = b.saleId || '';
                    break;
                case 'id':
                    valA = a.id || 0;
                    valB = b.id || 0;
                    break;
                case 'date':
                case 'created_at':
                    valA = a.created_at ? new Date(a.created_at) : new Date(0);
                    valB = b.created_at ? new Date(b.created_at) : new Date(0);
                    break;
                case 'customerId':
                    valA = a.customerId || 0;
                    valB = b.customerId || 0;
                    break;
                case 'customerName':
                    valA = a.customerName || '';
                    valB = b.customerName || '';
                    break;
                case 'product':
                    if (a.items && a.items.length > 0) {
                        valA = a.items[0].productName || '';
                    } else {
                        valA = '';
                    }
                    if (b.items && b.items.length > 0) {
                        valB = b.items[0].productName || '';
                    } else {
                        valB = '';
                    }
                    break;
                case 'quantity':
                    valA = a.items ? a.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
                    valB = b.items ? b.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
                    break;
                case 'priceSell':
                    valA = a.items && a.items[0] ? a.items[0].price || 0 : 0;
                    valB = b.items && b.items[0] ? b.items[0].price || 0 : 0;
                    break;
                case 'priceCost':
                    valA = a.items && a.items[0] ? a.items[0].priceCost || (a.items[0].unitPriceCost || 0) * a.items[0].quantity || 0 : 0;
                    valB = b.items && b.items[0] ? b.items[0].priceCost || (b.items[0].unitPriceCost || 0) * b.items[0].quantity || 0 : 0;
                    break;
                case 'profitUnit':
                    valA = a.items && a.items[0] ? a.items[0].unitProfit || 0 : 0;
                    valB = b.items && b.items[0] ? b.items[0].unitProfit || 0 : 0;
                    break;
                case 'totalProduct':
                    valA = a.items && a.items[0] ? a.items[0].total || 0 : 0;
                    valB = b.items && b.items[0] ? b.items[0].total || 0 : 0;
                    break;
                case 'profitTotal':
                    valA = a.items ? a.items.reduce((sum, item) => sum + (item.profit || 0), 0) : 0;
                    valB = b.items ? b.items.reduce((sum, item) => sum + (item.profit || 0), 0) : 0;
                    break;
                case 'profitSale':
                    valA = a.items ? a.items.reduce((sum, item) => sum + (item.profit || 0), 0) : 0;
                    valB = b.items ? b.items.reduce((sum, item) => sum + (item.profit || 0), 0) : 0;
                    break;
                case 'discount':
                    valA = a.discount || 0;
                    valB = b.discount || 0;
                    break;
                case 'paid':
                    if (a.paymentHistory && a.paymentHistory.length > 0) {
                        valA = a.paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                    } else if (a.paid) {
                        valA = a.paid;
                    } else if (a.paidAmount) {
                        valA = a.paidAmount;
                    } else {
                        valA = 0;
                    }
                    
                    if (b.paymentHistory && b.paymentHistory.length > 0) {
                        valB = b.paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                    } else if (b.paid) {
                        valB = b.paid;
                    } else if (b.paidAmount) {
                        valB = b.paidAmount;
                    } else {
                        valB = 0;
                    }
                    break;
                case 'remaining':
                    valA = (a.status === 'paid') ? 0 : (a.remaining || a.amount || 0);
                    valB = (b.status === 'paid') ? 0 : (b.remaining || b.amount || 0);
                    break;
                case 'dueDate':
                    valA = a.dueDate ? new Date(a.dueDate) : new Date(0);
                    valB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                    break;
                case 'payment':
                    valA = a.paymentMethod || a.status || '';
                    valB = b.paymentMethod || b.status || '';
                    break;
                default:
                    valA = a.created_at ? new Date(a.created_at) : new Date(0);
                    valB = b.created_at ? new Date(b.created_at) : new Date(0);
            }

            valA = valA === undefined ? '' : valA;
            valB = valB === undefined ? '' : valB;

            if (typeof valA === 'string' && typeof valB === 'string') {
                if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            } else {
                if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            }
        });
    }

    updateStats() {
        const totalCredits = this.filteredCredits.length;
        const totalAmount = this.filteredCredits.reduce((sum, credit) => sum + (credit.amount || 0), 0);
        const unpaidCredits = this.filteredCredits.filter(c => c.status === 'active').length;

        document.getElementById('totalCredits').textContent = totalCredits;
        document.getElementById('totalCreditsAmount').textContent = `${totalAmount.toFixed(2)} DH`;
        document.getElementById('unpaidCredits').textContent = unpaidCredits;
    }

    // ==================== MÉTHODES D'EXPORT EXCEL POUR LES CRÉDITS ====================

    async exportCreditsWithExcel() {
        try {
            const credits = await this.db.getAll('credits');
            
            if (credits.length === 0) {
                this.showNotification('❌ Aucun crédit à exporter', 'warning');
                return;
            }

            const exportData = [];
            
            credits.forEach(credit => {
                let paidAmount = 0;
                if (credit.paymentHistory && credit.paymentHistory.length > 0) {
                    paidAmount = credit.paymentHistory.reduce((sum, p) => sum + (p.amount || 0), 0);
                } else if (credit.paid) {
                    paidAmount = credit.paid;
                } else if (credit.paidAmount) {
                    paidAmount = credit.paidAmount;
                }
                
                const remaining = credit.remaining || credit.amount || 0;
                const isOverdue = credit.dueDate && new Date(credit.dueDate) < new Date() && credit.status === 'active';
                
                if (credit.items && credit.items.length > 0) {
                    credit.items.forEach(item => {
                        const priceCost = item.priceCost || (item.unitPriceCost || 0) * item.quantity || 0;
                        const profit = item.profit || (item.unitProfit || 0) * item.quantity || 0;
                        
                        exportData.push({
                            'N° Facture': credit.saleId || 'N/A',
                            'ID Crédit': credit.id || 'N/A',
                            'Date': credit.created_at ? new Date(credit.created_at).toLocaleDateString('fr-FR') : 'N/A',
                            'Client': credit.customerName || 'Client inconnu',
                            'ID Client': credit.customerId || '-',
                            'Produit': item.productName || 'N/A',
                            'Quantité': item.quantity || 0,
                            'Prix Vente (DH)': item.price ? Number(item.price).toFixed(2) : '0.00',
                            'Prix Revient (DH)': Number(priceCost).toFixed(2),
                            'Profit Unitaire (DH)': Number(item.unitProfit || 0).toFixed(2),
                            'Total Produit (DH)': item.total ? Number(item.total).toFixed(2) : '0.00',
                            'Profit Total (DH)': Number(profit).toFixed(2),
                            'Montant Total (DH)': Number(credit.amount || 0).toFixed(2),
                            'Remise (DH)': Number(credit.discount || 0).toFixed(2),
                            'Payé (DH)': Number(paidAmount).toFixed(2),
                            'Reste (DH)': Number(remaining).toFixed(2),
                            'Statut': this.getCreditStatus(credit),
                            'Mode Paiement': this.getCreditPaymentMethod(credit.paymentMethod),
                            'Date Échéance': credit.dueDate ? new Date(credit.dueDate).toLocaleDateString('fr-FR') : '-',
                            'En Retard': isOverdue ? 'Oui' : 'Non',
                            'Description': credit.description || ''
                        });
                    });
                } else {
                    exportData.push({
                        'N° Facture': credit.saleId || 'N/A',
                        'ID Crédit': credit.id || 'N/A',
                        'Date': credit.created_at ? new Date(credit.created_at).toLocaleDateString('fr-FR') : 'N/A',
                        'Client': credit.customerName || 'Client inconnu',
                        'ID Client': credit.customerId || '-',
                        'Produit': 'Crédit manuel',
                        'Quantité': 0,
                        'Prix Vente (DH)': '0.00',
                        'Prix Revient (DH)': '0.00',
                        'Profit Unitaire (DH)': '0.00',
                        'Total Produit (DH)': '0.00',
                        'Profit Total (DH)': '0.00',
                        'Montant Total (DH)': Number(credit.amount || 0).toFixed(2),
                        'Remise (DH)': Number(credit.discount || 0).toFixed(2),
                        'Payé (DH)': Number(paidAmount).toFixed(2),
                        'Reste (DH)': Number(remaining).toFixed(2),
                        'Statut': this.getCreditStatus(credit),
                        'Mode Paiement': this.getCreditPaymentMethod(credit.paymentMethod),
                        'Date Échéance': credit.dueDate ? new Date(credit.dueDate).toLocaleDateString('fr-FR') : '-',
                        'En Retard': isOverdue ? 'Oui' : 'Non',
                        'Description': credit.description || ''
                    });
                }
            });

            await this.generateExcelFile(exportData, 'credits');
            this.showNotification(`✅ Export réussi ! ${credits.length} crédit(s) exporté(s)`, 'success');
            
        } catch (error) {
            console.error('Erreur export crédits:', error);
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    getCreditStatus(credit) {
        if (credit.status === 'paid') return 'Payé';
        if (credit.status === 'active') {
            if (credit.dueDate && new Date(credit.dueDate) < new Date()) {
                return 'En retard';
            }
            return 'Actif';
        }
        return credit.status || 'N/A';
    }

    getCreditPaymentMethod(method) {
        const methods = {
            'cash': 'Espèces',
            'credit': 'Crédit',
            'partial': 'Partiel'
        };
        return methods[method] || method || 'N/A';
    }

    async generateExcelFile(data, filename) {
        if (!data || data.length === 0) {
            this.showNotification('❌ Aucune donnée à exporter', 'warning');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        csvRows.push(headers.join(','));
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] !== undefined && row[header] !== null ? row[header] : '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        });

        const csvString = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `${filename}_${date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ==================== AUTRES MÉTHODES ====================

    async generateCreditPDF(creditId) {
        try {
            const credit = this.credits.find(c => c.id === creditId);
            if (!credit) {
                this.showNotification('Crédit non trouvé', 'error');
                return;
            }

            let customerPhone = '';
            let customerWhatsapp = '';
            if (credit.customerId) {
                const customer = await this.db.getById('customers', credit.customerId);
                if (customer) {
                    customerPhone = customer.phone || '';
                    customerWhatsapp = customer.whatsapp || '';
                }
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 0);
            doc.text('MiniMarket Pro', 105, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Relevé de crédit', 105, 30, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`N° Facture: ${credit.saleId || 'N/A'}`, 20, 45);
            doc.text(`Date: ${credit.created_at ? new Date(credit.created_at).toLocaleDateString('fr-FR') : 'N/A'}`, 20, 52);
            doc.text(`Client: ${credit.customerName || 'Client inconnu'}`, 20, 59);
            
            if (customerPhone) {
                doc.text(`Tél: ${customerPhone}`, 20, 66);
            }
            
            if (credit.items && credit.items.length > 0) {
                const tableColumn = ["Produit", "Quantité", "Prix unit.", "Total"];
                const tableRows = [];
                
                credit.items.forEach(item => {
                    const row = [
                        item.productName,
                        item.quantity.toString(),
                        item.price.toFixed(2) + ' DH',
                        item.total.toFixed(2) + ' DH'
                    ];
                    tableRows.push(row);
                });
                
                doc.autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 75,
                    theme: 'striped',
                    headStyles: { fillColor: [231, 76, 60], textColor: [255, 255, 255] },
                    styles: { fontSize: 9 }
                });
                
                var finalY = doc.lastAutoTable.finalY + 10;
            } else {
                doc.text('Crédit sans produits', 20, 75);
                var finalY = 85;
            }
            
            doc.setFontSize(10);
            doc.text('Détails du crédit', 20, finalY);
            doc.text(`Montant total: ${credit.amount.toFixed(2)} DH`, 20, finalY + 7);
            
            if (credit.discount > 0) {
                doc.text(`Remise: -${credit.discount.toFixed(2)} DH`, 20, finalY + 14);
            }
            
            let paidAmount = 0;
            if (credit.paymentHistory && credit.paymentHistory.length > 0) {
                paidAmount = credit.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
            } else if (credit.paid) {
                paidAmount = credit.paid;
            }
            
            doc.text(`Montant payé: ${paidAmount.toFixed(2)} DH`, 20, finalY + 21);
            
            doc.setFontSize(12);
            doc.setTextColor(231, 76, 60);
            doc.text(`Reste à payer: ${(credit.remaining || credit.amount).toFixed(2)} DH`, 20, finalY + 30);
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            if (credit.dueDate) {
                doc.text(`Date d'échéance: ${new Date(credit.dueDate).toLocaleDateString('fr-FR')}`, 20, finalY + 40);
            }
            
            const statusText = credit.status === 'paid' ? 'Payé' : 
                              (credit.status === 'active' ? 'En cours' : 'En retard');
            doc.text(`Statut: ${statusText}`, 20, finalY + 47);
            
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Merci de votre confiance !', 105, 280, { align: 'center' });
            doc.text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 105, 285, { align: 'center' });
            
            doc.save(`credit_${credit.saleId || credit.id}.pdf`);
            
            this.showNotification('✅ PDF généré avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            this.showNotification('❌ Erreur lors de la génération du PDF', 'error');
        }
    }

    async sendCreditWhatsApp(creditId) {
        try {
            const credit = this.credits.find(c => c.id === creditId);
            if (!credit) {
                this.showNotification('Crédit non trouvé', 'error');
                return;
            }

            if (!credit.customerId) {
                this.showNotification('Ce crédit n\'a pas de client associé', 'warning');
                return;
            }

            const customer = await this.db.getById('customers', credit.customerId);
            if (!customer) {
                this.showNotification('Client non trouvé', 'error');
                return;
            }

            let phoneNumber = customer.whatsapp || customer.phone;
            if (!phoneNumber) {
                this.showNotification('Ce client n\'a pas de numéro de téléphone', 'warning');
                return;
            }

            phoneNumber = phoneNumber.replace(/\s+/g, '').replace(/[-.]/g, '');
            
            if (phoneNumber.startsWith('0')) {
                phoneNumber = '212' + phoneNumber.substring(1);
            }
            phoneNumber = phoneNumber.replace(/^\+/, '');

            let paidAmount = 0;
            if (credit.paymentHistory && credit.paymentHistory.length > 0) {
                paidAmount = credit.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
            } else if (credit.paid) {
                paidAmount = credit.paid;
            } else if (credit.paidAmount) {
                paidAmount = credit.paidAmount;
            }
            
            const remaining = credit.remaining || credit.amount;
            
            const today = new Date();
            const isLate = credit.dueDate && new Date(credit.dueDate) < today && remaining > 0;
            
            let message = `*MiniMarket Pro - Relevé de crédit*\n\n`;
            message += `📅 *Date:* ${credit.created_at ? new Date(credit.created_at).toLocaleDateString('fr-FR') : 'N/A'}\n`;
            message += `🧾 *N° Facture:* ${credit.saleId || 'N/A'}\n`;
            message += `👤 *Client:* ${credit.customerName}\n\n`;
            
            if (credit.items && credit.items.length > 0) {
                message += `📦 *Produits:*\n`;
                credit.items.forEach(item => {
                    message += `• ${item.productName} x${item.quantity} = ${item.total.toFixed(2)} DH\n`;
                });
                message += '\n';
            }
            
            message += `💰 *Détails du crédit:*\n`;
            message += `Montant total: ${credit.amount.toFixed(2)} DH\n`;
            
            if (credit.discount > 0) {
                message += `Remise: -${credit.discount.toFixed(2)} DH\n`;
            }
            
            message += `Montant payé: ${paidAmount.toFixed(2)} DH\n`;
            message += `*Reste à payer: ${remaining.toFixed(2)} DH*\n`;
            
            if (credit.dueDate) {
                const dueDate = new Date(credit.dueDate).toLocaleDateString('fr-FR');
                message += `📆 *Date d'échéance:* ${dueDate}`;
                if (isLate) {
                    message += ` ⚠️ *EN RETARD*`;
                }
                message += '\n';
            }
            
            message += `\n✅ *Merci de régulariser votre situation.*`;
            
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
            
            this.showNotification('✅ WhatsApp ouvert avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur envoi WhatsApp:', error);
            this.showNotification('❌ Erreur lors de l\'ouverture de WhatsApp', 'error');
        }
    }

    renderCreditsTable() {
        const tbody = document.getElementById('creditsTableBody');
        if (!tbody) return;

        if (this.filteredCredits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="20" class="text-center py-4">Aucun crédit trouvé</td></tr>';
            return;
        }

        const now = new Date();

        tbody.innerHTML = this.filteredCredits.map(credit => {
            const dueDate = credit.dueDate ? new Date(credit.dueDate) : null;
            const isOverdue = credit.status === 'active' && dueDate && dueDate < now;
            
            let paidAmount = 0;
            if (credit.paymentHistory && credit.paymentHistory.length > 0) {
                paidAmount = credit.paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            } else if (credit.paid) {
                paidAmount = credit.paid;
            } else if (credit.paidAmount) {
                paidAmount = credit.paidAmount;
            }
            
            const remaining = credit.remaining || credit.amount || 0;

            let statusBadge = '';
            let statusClass = '';
            let paymentMethodText = '';
            
            if (credit.status === 'paid') {
                statusBadge = '<span class="badge bg-success">Payé</span>';
                statusClass = 'paid';
                paymentMethodText = credit.paymentMethod === 'cash' ? 'Espèces' : 'Crédit';
            } else if (isOverdue) {
                statusBadge = '<span class="badge bg-danger">En retard</span>';
                statusClass = 'overdue';
                paymentMethodText = credit.paymentMethod === 'cash' ? 'Espèces' : 'Crédit';
            } else {
                statusBadge = '<span class="badge bg-warning">Actif</span>';
                statusClass = 'active';
                paymentMethodText = credit.paymentMethod === 'cash' ? 'Espèces' : 'Crédit';
            }

            if (credit.paymentMethod === 'cash') paymentMethodText = 'Espèces';
            else if (credit.paymentMethod === 'credit') paymentMethodText = 'Crédit';
            else if (credit.paymentMethod === 'partial') paymentMethodText = 'Partiel';
            else paymentMethodText = credit.paymentMethod || 'Crédit';

            if (credit.items && credit.items.length > 0) {
                return credit.items.map((item, idx) => {
                    const priceCost = item.priceCost || (item.unitPriceCost || 0) * item.quantity || 0;
                    const profitPerUnit = item.unitProfit || 0;
                    const itemTotalProfit = profitPerUnit * item.quantity;
                    const saleTotalProfit = credit.profitSale || credit.profitTotal || 0;
                    const showButtons = idx === 0;
                    
                    return `
                        <tr class="${statusClass}">
                            <td>${credit.saleId || 'N/A'}</td>
                            <td>#${credit.id}</td>
                            <td>${credit.created_at ? new Date(credit.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td>${credit.customerId || '-'}</td>
                            <td>${credit.customerName || 'Client inconnu'}</td>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td class="text-end">${(item.price || 0).toFixed(2)} DH</td>
                            <td class="text-end">${(priceCost || 0).toFixed(2)} DH</td>
                            <td class="text-end">${(profitPerUnit || 0).toFixed(2)} DH</td>
                            <td class="text-end">${(item.total || 0).toFixed(2)} DH</td>
                            <td class="text-end">${(itemTotalProfit || 0).toFixed(2)} DH</td>
                            <td class="text-end">${(saleTotalProfit || 0).toFixed(2)} DH</td>
                            <td class="text-end">${(credit.discount || 0).toFixed(2)} DH</td>
                            <td class="text-end">${(paidAmount || 0).toFixed(2)} DH</td>
                            <td class="text-end ${remaining > 0 ? 'text-warning fw-bold' : ''}">${(remaining || 0).toFixed(2)} DH</td>
                            <td>${dueDate ? dueDate.toLocaleDateString() : '-'}</td>
                            <td>${paymentMethodText}</td>
                            <td class="text-center">
                                ${showButtons ? `
                                    <button class="btn-action btn-pdf me-1" onclick="window.creditManager.generateCreditPDF(${credit.id})" title="Télécharger PDF" style="color: #e74c3c;">
                                        <i class="fas fa-file-pdf"></i>
                                    </button>
                                    <button class="btn-action btn-whatsapp me-1" onclick="window.creditManager.sendCreditWhatsApp(${credit.id})" title="Envoyer sur WhatsApp" style="color: #25D366;">
                                        <i class="fab fa-whatsapp"></i>
                                    </button>
                                    ${credit.status === 'active' ? `
                                        <button class="btn-action btn-edit me-1" onclick="window.creditManager.showPaymentModal(${credit.id})" title="Effectuer un paiement">
                                            <i class="fas fa-money-bill-wave"></i>
                                        </button>
                                    ` : ''}
                                    <button class="btn-action btn-delete" onclick="window.creditManager.deleteCredit(${credit.id})" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                return `
                    <tr class="${statusClass}">
                        <td>${credit.saleId || 'N/A'}</td>
                        <td>#${credit.id}</td>
                        <td>${credit.created_at ? new Date(credit.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>${credit.customerId || '-'}</td>
                        <td>${credit.customerName || 'Client inconnu'}</td>
                        <td colspan="6" class="text-center text-muted">Crédit manuel (sans produits)</td>
                        <td class="text-end">${(credit.profitTotal || 0).toFixed(2)} DH</td>
                        <td class="text-end">${(credit.profitSale || credit.profitTotal || 0).toFixed(2)} DH</td>
                        <td class="text-end">${(credit.discount || 0).toFixed(2)} DH</td>
                        <td class="text-end">${(paidAmount || 0).toFixed(2)} DH</td>
                        <td class="text-end ${remaining > 0 ? 'text-warning fw-bold' : ''}">${(remaining || 0).toFixed(2)} DH</td>
                        <td>${dueDate ? dueDate.toLocaleDateString() : '-'}</td>
                        <td>${paymentMethodText}</td>
                        <td class="text-center">
                            <button class="btn-action btn-pdf me-1" onclick="window.creditManager.generateCreditPDF(${credit.id})" title="Télécharger PDF" style="color: #e74c3c;">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                            <button class="btn-action btn-whatsapp me-1" onclick="window.creditManager.sendCreditWhatsApp(${credit.id})" title="Envoyer sur WhatsApp" style="color: #25D366;">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            ${credit.status === 'active' ? `
                                <button class="btn-action btn-edit me-1" onclick="window.creditManager.showPaymentModal(${credit.id})" title="Effectuer un paiement">
                                    <i class="fas fa-money-bill-wave"></i>
                                </button>
                            ` : ''}
                            <button class="btn-action btn-delete" onclick="window.creditManager.deleteCredit(${credit.id})" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }
        }).join('');
    }

    showAddCreditModal() {
        this.populateCustomerSelect();
        this.populateProductSelect();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('creditDate').value = today;
        
        const dueDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
        document.getElementById('creditDueDate').value = dueDate;
        
        document.getElementById('creditProfitUnit').value = '0.00';
        document.getElementById('creditTotalProduct').value = '0.00';
        document.getElementById('creditProfitTotal').value = '0.00';
        document.getElementById('creditRemaining').value = '0.00';
        
        const modal = new bootstrap.Modal(document.getElementById('addCreditModal'));
        modal.show();
    }

    async saveCredit() {
        const invoice = document.getElementById('creditInvoice')?.value.trim();
        const date = document.getElementById('creditDate')?.value;
        const customerId = document.getElementById('creditCustomer')?.value;
        const customerSelect = document.getElementById('creditCustomer');
        const customerName = customerSelect.selectedOptions[0]?.text.split(' -')[0] || '';
        const productId = document.getElementById('creditProduct')?.value;
        const quantity = parseInt(document.getElementById('creditQuantity')?.value) || 1;
        const priceSell = parseFloat(document.getElementById('creditPriceSell')?.value) || 0;
        const priceCost = parseFloat(document.getElementById('creditPriceCost')?.value) || 0;
        const profitUnit = parseFloat(document.getElementById('creditProfitUnit')?.value) || 0;
        const totalProduct = parseFloat(document.getElementById('creditTotalProduct')?.value) || 0;
        const profitTotal = parseFloat(document.getElementById('creditProfitTotal')?.value) || 0;
        const profitSale = parseFloat(document.getElementById('creditProfitSale')?.value) || profitTotal;
        const amount = parseFloat(document.getElementById('creditAmount')?.value) || 0;
        const discount = parseFloat(document.getElementById('creditDiscount')?.value) || 0;
        const paid = parseFloat(document.getElementById('creditPaid')?.value) || 0;
        const remaining = parseFloat(document.getElementById('creditRemaining')?.value) || amount;
        const dueDate = document.getElementById('creditDueDate')?.value;
        const paymentMethod = document.getElementById('creditPaymentMethod')?.value || 'credit';
        const description = document.getElementById('creditDescription')?.value.trim();

        if (!customerId) {
            this.showNotification('Veuillez sélectionner un client', 'warning');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Veuillez entrer un montant valide', 'warning');
            return;
        }

        const customer = this.customers.find(c => c.id == customerId);

        try {
            const items = [];
            if (productId && priceSell > 0) {
                const product = await this.db.getById('products', parseInt(productId));
                items.push({
                    productId: parseInt(productId),
                    productName: product ? product.name : 'Produit inconnu',
                    quantity: quantity,
                    price: priceSell,
                    priceCost: priceCost * quantity,
                    unitPriceCost: priceCost,
                    total: totalProduct,
                    profit: profitTotal,
                    unitProfit: profitUnit
                });
            }

            const newCredit = {
                saleId: invoice || `CRD-${Date.now()}`,
                date: date || new Date().toISOString().split('T')[0],
                customerId: parseInt(customerId),
                customerName: customer ? customer.name : customerName,
                items: items,
                amount: amount,
                discount: discount,
                subtotal: amount + discount,
                paid: paid,
                remaining: remaining,
                priceSell: priceSell,
                priceCost: priceCost,
                profitUnit: profitUnit,
                totalProduct: totalProduct,
                profitTotal: profitTotal,
                profitSale: profitSale,
                status: remaining === 0 ? 'paid' : 'active',
                dueDate: dueDate || new Date(Date.now() + 30*24*60*60*1000),
                paymentMethod: paymentMethod,
                description: description,
                paymentHistory: paid > 0 ? [{
                    date: new Date(),
                    amount: paid,
                    remaining: remaining
                }] : [],
                created_at: new Date()
            };

            const creditId = await this.db.add('credits', newCredit);
            
            if (customer) {
                customer.credit = (customer.credit || 0) + remaining;
                await this.db.update('customers', customer);
            }
            
            await this.loadCredits();

            const modal = bootstrap.Modal.getInstance(document.getElementById('addCreditModal'));
            if (modal) modal.hide();

            this.showNotification('✅ Crédit ajouté avec succès', 'success');
        } catch (error) {
            console.error('Erreur ajout crédit:', error);
            this.showNotification('❌ Erreur lors de l\'ajout du crédit', 'error');
        }
    }

    showPaymentModal(id) {
        const credit = this.credits.find(c => c.id === id);
        if (!credit) return;

        const remaining = credit.remaining || credit.amount || 0;

        document.getElementById('paymentCustomerName').value = credit.customerName || '';
        document.getElementById('paymentTotalAmount').value = `${credit.amount?.toFixed(2) || 0} DH`;
        document.getElementById('paymentRemainingAmount').value = `${remaining.toFixed(2)} DH`;
        document.getElementById('paymentAmount').value = remaining.toFixed(2);
        document.getElementById('paymentCreditId').value = id;

        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    }

    async confirmPayment() {
        const id = document.getElementById('paymentCreditId')?.value;
        const paymentAmount = parseFloat(document.getElementById('paymentAmount')?.value) || 0;

        if (!id) return;

        const credit = this.credits.find(c => c.id == id);
        if (!credit) return;

        const remaining = credit.remaining || credit.amount || 0;

        if (paymentAmount <= 0) {
            this.showNotification('Veuillez entrer un montant valide', 'warning');
            return;
        }

        if (paymentAmount > remaining) {
            this.showNotification('Le montant payé ne peut pas dépasser le reste', 'warning');
            return;
        }

        try {
            const newRemaining = remaining - paymentAmount;
            
            if (!credit.paymentHistory) credit.paymentHistory = [];
            credit.paymentHistory.push({
                date: new Date(),
                amount: paymentAmount,
                remaining: newRemaining
            });
            
            const totalPaid = (credit.paid || 0) + paymentAmount;
            credit.paid = totalPaid;
            
            if (newRemaining === 0) {
                credit.status = 'paid';
                credit.remaining = 0;
            } else {
                credit.remaining = newRemaining;
            }

            await this.db.update('credits', credit);
            
            if (credit.saleId) {
                const sales = await this.db.getAll('sales');
                const sale = sales.find(s => s.invoiceNumber === credit.saleId);
                if (sale) {
                    sale.paymentGiven = (sale.paymentGiven || 0) + paymentAmount;
                    sale.remaining = newRemaining;
                    
                    if (newRemaining === 0) {
                        if (sale.paymentMethod === 'credit' || sale.paymentMethod === 'partial') {
                            sale.paymentMethod = 'cash';
                        }
                        sale.status = 'paid';
                    } else {
                        sale.status = 'partial';
                    }
                    
                    await this.db.update('sales', sale);
                    
                    if (window.salesManager) {
                        window.salesManager.loadSales();
                    }
                }
            }
            
            if (credit.customerId) {
                const customer = await this.db.getById('customers', credit.customerId);
                if (customer) {
                    customer.credit = Math.max(0, (customer.credit || 0) - paymentAmount);
                    await this.db.update('customers', customer);
                    
                    if (window.customerManager) {
                        window.customerManager.loadCustomersFromDB();
                    }
                }
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
            if (modal) modal.hide();

            await this.loadCredits();
            this.showNotification(`✅ Paiement de ${paymentAmount.toFixed(2)} DH enregistré`, 'success');
        } catch (error) {
            console.error('Erreur paiement:', error);
            this.showNotification('❌ Erreur lors du paiement', 'error');
        }
    }

    async deleteCredit(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce crédit ?')) {
            try {
                const credit = this.credits.find(c => c.id == id);
                
                if (credit && credit.customerId) {
                    const customer = await this.db.getById('customers', credit.customerId);
                    if (customer) {
                        const remaining = credit.remaining || credit.amount || 0;
                        customer.credit = Math.max(0, (customer.credit || 0) - remaining);
                        await this.db.update('customers', customer);
                    }
                }
                
                await this.db.delete('credits', id);
                await this.loadCredits();
                this.showNotification('✅ Crédit supprimé avec succès', 'success');
            } catch (error) {
                console.error('Erreur suppression crédit:', error);
                this.showNotification('❌ Erreur lors de la suppression', 'error');
            }
        }
    }

    async importCredits() {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.json')) {
                    this.showNotification('❌ Le fichier doit être au format JSON', 'error');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(jsonData)) {
                            throw new Error('Le fichier doit contenir un tableau de crédits');
                        }
                        
                        let importedCount = 0;
                        let skippedCount = 0;
                        
                        for (const credit of jsonData) {
                            try {
                                if (!credit.customerName || !credit.amount) {
                                    skippedCount++;
                                    continue;
                                }
                                
                                await this.db.add('credits', credit);
                                importedCount++;
                            } catch (creditError) {
                                console.error('Erreur import crédit:', creditError);
                                skippedCount++;
                            }
                        }
                        
                        await this.loadCredits();
                        this.showNotification(`✅ Import terminé : ${importedCount} importé(s), ${skippedCount} ignoré(s)`, 'success');
                        
                    } catch (error) {
                        this.showNotification('❌ Fichier JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            setTimeout(() => document.body.removeChild(fileInput), 1000);
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'import', 'error');
        }
    }

    async exportCredits() {
        try {
            if (this.filteredCredits.length === 0) {
                this.showNotification('❌ Aucun crédit à exporter', 'warning');
                return;
            }
            
            const exportData = this.filteredCredits.map(credit => ({
                id: credit.id,
                saleId: credit.saleId,
                customerId: credit.customerId,
                customerName: credit.customerName,
                amount: credit.amount,
                discount: credit.discount || 0,
                subtotal: credit.subtotal || credit.amount,
                remaining: credit.remaining,
                paid: credit.paid || 0,
                status: credit.status,
                dueDate: credit.dueDate,
                description: credit.description,
                paymentHistory: credit.paymentHistory,
                created_at: credit.created_at
            }));

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            
            const date = new Date().toISOString().split('T')[0];
            link.download = `credits_${date}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.showNotification(`✅ Export réussi ! ${exportData.length} crédit(s) exporté(s)`, 'success');
            
        } catch (error) {
            console.error('Erreur export:', error);
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== CHARGE MANAGER ====================
class ChargeManager {
    constructor() {
        this.db = window.minimarketDB;
        this.charges = [];
        this.filteredCharges = [];
        this.currentSort = { column: 'date', direction: 'desc' };
        this.initEventListeners();
    }

    initEventListeners() {
        const addBtn = document.getElementById('addChargeBtn');
        const cancelBtn = document.getElementById('cancelChargeBtn');
        const form = document.getElementById('chargeForm');
        const importBtn = document.getElementById('importChargesBtn');
        const exportBtn = document.getElementById('exportChargesBtn');
        const listBtn = document.getElementById('listChargesBtn');
        const applyFilterBtn = document.getElementById('applyChargeFilter');
        const searchInput = document.getElementById('chargeSearch');
        const sortableHeaders = document.querySelectorAll('#chargesTable th.sortable');

        if (addBtn) addBtn.addEventListener('click', () => this.showAddForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAddForm());
        if (form) form.addEventListener('submit', (e) => this.handleAddCharge(e));
        if (importBtn) importBtn.addEventListener('click', () => this.importCharges());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCharges());
        if (listBtn) listBtn.addEventListener('click', () => this.loadCharges());
        if (applyFilterBtn) applyFilterBtn.addEventListener('click', () => this.applyFilters());
        if (searchInput) searchInput.addEventListener('input', () => this.applyFilters());

        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortCharges(column);
            });
        });

        const chargesModal = document.getElementById('chargesModal');
        if (chargesModal) {
            chargesModal.addEventListener('hidden.bs.modal', () => {
                this.hideAddForm();
            });
            chargesModal.addEventListener('shown.bs.modal', () => {
                this.loadCharges();
            });
        }
    }

    showAddForm() {
        const formCard = document.getElementById('chargeFormCard');
        const labelInput = document.getElementById('chargeLabel');
        
        if (formCard) {
            formCard.style.display = 'block';
            if (labelInput) labelInput.focus();
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('chargeDate').value = today;
        }
    }

    hideAddForm() {
        const formCard = document.getElementById('chargeFormCard');
        const form = document.getElementById('chargeForm');
        
        if (formCard) formCard.style.display = 'none';
        if (form) form.reset();
    }

    async loadCharges() {
        try {
            this.charges = await this.db.getAll('charges') || [];
            this.applyFilters();
            this.updateStats();
            console.log('✅ Charges chargées depuis IndexedDB:', this.charges.length);
        } catch (error) {
            console.error('❌ Erreur chargement charges:', error);
            this.charges = [];
            this.filteredCharges = [];
        }
    }

    applyFilters() {
        const filter = document.getElementById('chargeDateFilter')?.value || 'all';
        const searchTerm = document.getElementById('chargeSearch')?.value.toLowerCase() || '';

        this.filteredCharges = this.filterChargesByDate(this.charges, filter);

        if (searchTerm) {
            this.filteredCharges = this.filteredCharges.filter(charge => 
                (charge.label && charge.label.toLowerCase().includes(searchTerm)) ||
                (charge.category && charge.category.toLowerCase().includes(searchTerm)) ||
                (charge.supplier && charge.supplier.toLowerCase().includes(searchTerm)) ||
                (charge.description && charge.description.toLowerCase().includes(searchTerm))
            );
        }

        this.sortCharges(this.currentSort.column, true);
        this.renderChargesTable();
        this.updateStats();
    }

    filterChargesByDate(charges, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const filters = {
            'today': (date) => date >= today,
            'yesterday': (date) => date >= yesterday && date < today,
            '1day': (date) => date >= new Date(today.getTime() - 1*24*60*60*1000),
            '3days': (date) => date >= new Date(today.getTime() - 3*24*60*60*1000),
            '1week': (date) => date >= new Date(today.getTime() - 7*24*60*60*1000),
            '15days': (date) => date >= new Date(today.getTime() - 15*24*60*60*1000),
            '1month': (date) => date >= new Date(today.getTime() - 30*24*60*60*1000),
            '3months': (date) => date >= new Date(today.getTime() - 90*24*60*60*1000),
            '6months': (date) => date >= new Date(today.getTime() - 180*24*60*60*1000),
            '1year': (date) => date >= new Date(today.getTime() - 365*24*60*60*1000),
            'all': () => true
        };

        const filterFn = filters[filter] || filters['all'];
        
        return charges.filter(charge => {
            const chargeDate = charge.date ? new Date(charge.date) : new Date(0);
            return filterFn(chargeDate);
        });
    }

    sortCharges(column, skipToggle = false) {
        if (!skipToggle && column === this.currentSort.column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'desc';
        }

        document.querySelectorAll('#chargesTable th.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort ms-1';
        });

        const currentHeader = document.querySelector(`#chargesTable th.sortable[data-sort="${column}"] i`);
        if (currentHeader) {
            currentHeader.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'} ms-1`;
        }

        this.filteredCharges.sort((a, b) => {
            let valA, valB;

            switch(column) {
                case 'id':
                    valA = a.id || 0;
                    valB = b.id || 0;
                    break;
                case 'label':
                    valA = a.label || '';
                    valB = b.label || '';
                    break;
                case 'category':
                    valA = a.category || '';
                    valB = b.category || '';
                    break;
                case 'amount':
                    valA = a.amount || 0;
                    valB = b.amount || 0;
                    break;
                case 'date':
                    valA = a.date ? new Date(a.date) : new Date(0);
                    valB = b.date ? new Date(b.date) : new Date(0);
                    break;
                case 'paymentMethod':
                    valA = a.paymentMethod || '';
                    valB = b.paymentMethod || '';
                    break;
                default:
                    valA = a.date ? new Date(a.date) : new Date(0);
                    valB = b.date ? new Date(b.date) : new Date(0);
            }

            if (valA < valB) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderChargesTable();
    }

    updateStats() {
        const totalCharges = this.filteredCharges.length;
        const totalAmount = this.filteredCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyCharges = this.charges
            .filter(charge => {
                const chargeDate = charge.date ? new Date(charge.date) : new Date(0);
                return chargeDate >= startOfMonth;
            })
            .reduce((sum, charge) => sum + (charge.amount || 0), 0);

        document.getElementById('totalCharges').textContent = totalCharges;
        document.getElementById('totalChargesAmount').textContent = `${totalAmount.toFixed(2)} DH`;
        document.getElementById('monthlyCharges').textContent = `${monthlyCharges.toFixed(2)} DH`;
        document.getElementById('totalChargesCount').textContent = totalCharges;
    }

    renderChargesTable() {
        const tbody = document.getElementById('chargesTableBody');
        if (!tbody) return;

        if (this.filteredCharges.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4">Aucune charge trouvée</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredCharges.map(charge => `
            <tr>
                <td class="px-4 py-3">
                    <span class="badge bg-light text-dark">#${charge.id}</span>
                </td>
                <td class="px-4 py-3">${charge.label || '-'}</td>
                <td class="px-4 py-3">
                    <span class="badge bg-info text-white">${charge.category || 'AUTRE'}</span>
                </td>
                <td class="px-4 py-3 text-end fw-bold ${charge.amount > 0 ? 'text-danger' : ''}">${(charge.amount || 0).toFixed(2)} DH</td>
                <td class="px-4 py-3">${charge.date ? new Date(charge.date).toLocaleDateString() : '-'}</td>
                <td class="px-4 py-3">${charge.paymentMethod || '-'}</td>
                <td class="px-4 py-3">${charge.supplier || '-'}</td>
                <td class="px-4 py-3">${charge.reference || '-'}</td>
                <td class="px-4 py-3">${charge.description ? charge.description.substring(0, 30) + (charge.description.length > 30 ? '...' : '') : '-'}</td>
                <td class="px-4 py-3 text-center">
                    <button class="btn-action btn-edit me-1" onclick="window.chargeManager.editCharge(${charge.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="window.chargeManager.deleteCharge(${charge.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async handleAddCharge(e) {
        e.preventDefault();
        
        const label = document.getElementById('chargeLabel')?.value.trim();
        const category = document.getElementById('chargeCategory')?.value;
        const amount = parseFloat(document.getElementById('chargeAmount')?.value) || 0;
        const date = document.getElementById('chargeDate')?.value;
        const paymentMethod = document.getElementById('chargePaymentMethod')?.value;
        const supplier = document.getElementById('chargeSupplier')?.value.trim() || '';
        const reference = document.getElementById('chargeReference')?.value.trim() || '';
        const description = document.getElementById('chargeDescription')?.value.trim() || '';

        if (!label) {
            this.showNotification('Veuillez entrer un libellé', 'warning');
            return;
        }

        if (!category) {
            this.showNotification('Veuillez sélectionner une catégorie', 'warning');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Veuillez entrer un montant valide', 'warning');
            return;
        }

        if (!date) {
            this.showNotification('Veuillez sélectionner une date', 'warning');
            return;
        }

        try {
            const newCharge = {
                label: label.toUpperCase(),
                category: category,
                amount: amount,
                date: date,
                paymentMethod: paymentMethod,
                supplier: supplier.toUpperCase(),
                reference: reference,
                description: description,
                created_at: new Date()
            };

            await this.db.add('charges', newCharge);
            await this.loadCharges();
            
            this.hideAddForm();
            this.showNotification(`✅ Charge "${label}" ajoutée avec succès`, 'success');
        } catch (error) {
            console.error('Erreur ajout charge:', error);
            this.showNotification('❌ Erreur lors de l\'ajout de la charge', 'error');
        }
    }

    async editCharge(id) {
        const charge = this.charges.find(c => c.id === id);
        if (charge) {
            document.getElementById('chargeLabel').value = charge.label || '';
            document.getElementById('chargeCategory').value = charge.category || '';
            document.getElementById('chargeAmount').value = charge.amount || 0;
            document.getElementById('chargeDate').value = charge.date ? charge.date.split('T')[0] : '';
            document.getElementById('chargePaymentMethod').value = charge.paymentMethod || 'ESPÈCES';
            document.getElementById('chargeSupplier').value = charge.supplier || '';
            document.getElementById('chargeReference').value = charge.reference || '';
            document.getElementById('chargeDescription').value = charge.description || '';
            
            this.showAddForm();
            
            const form = document.getElementById('chargeForm');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    this.updateCharge(id);
                };
            }
        }
    }

    async updateCharge(id) {
        const label = document.getElementById('chargeLabel')?.value.trim();
        const category = document.getElementById('chargeCategory')?.value;
        const amount = parseFloat(document.getElementById('chargeAmount')?.value) || 0;
        const date = document.getElementById('chargeDate')?.value;
        const paymentMethod = document.getElementById('chargePaymentMethod')?.value;
        const supplier = document.getElementById('chargeSupplier')?.value.trim() || '';
        const reference = document.getElementById('chargeReference')?.value.trim() || '';
        const description = document.getElementById('chargeDescription')?.value.trim() || '';

        if (!label) {
            this.showNotification('Veuillez entrer un libellé', 'warning');
            return;
        }

        if (!category) {
            this.showNotification('Veuillez sélectionner une catégorie', 'warning');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Veuillez entrer un montant valide', 'warning');
            return;
        }

        if (!date) {
            this.showNotification('Veuillez sélectionner une date', 'warning');
            return;
        }

        try {
            const charge = this.charges.find(c => c.id === id);
            if (charge) {
                charge.label = label.toUpperCase();
                charge.category = category;
                charge.amount = amount;
                charge.date = date;
                charge.paymentMethod = paymentMethod;
                charge.supplier = supplier.toUpperCase();
                charge.reference = reference;
                charge.description = description;
                
                await this.db.update('charges', charge);
                await this.loadCharges();
                
                this.hideAddForm();
                this.showNotification('✅ Charge modifiée avec succès', 'success');
            }
        } catch (error) {
            console.error('Erreur modification charge:', error);
            this.showNotification('❌ Erreur lors de la modification', 'error');
        }
    }

    async deleteCharge(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) {
            try {
                await this.db.delete('charges', id);
                await this.loadCharges();
                this.showNotification('✅ Charge supprimée avec succès', 'success');
            } catch (error) {
                console.error('Erreur suppression charge:', error);
                this.showNotification('❌ Erreur lors de la suppression', 'error');
            }
        }
    }

    async importCharges() {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.json')) {
                    this.showNotification('❌ Le fichier doit être au format JSON', 'error');
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        
                        if (!Array.isArray(jsonData)) {
                            throw new Error('Le fichier doit contenir un tableau de charges');
                        }
                        
                        let importedCount = 0;
                        let skippedCount = 0;
                        
                        for (const charge of jsonData) {
                            try {
                                if (!charge.label || !charge.amount) {
                                    skippedCount++;
                                    continue;
                                }
                                
                                await this.db.add('charges', charge);
                                importedCount++;
                            } catch (chargeError) {
                                console.error('Erreur import charge:', chargeError);
                                skippedCount++;
                            }
                        }
                        
                        await this.loadCharges();
                        this.showNotification(`✅ Import terminé : ${importedCount} importée(s), ${skippedCount} ignorée(s)`, 'success');
                        
                    } catch (error) {
                        this.showNotification('❌ Fichier JSON invalide', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            setTimeout(() => document.body.removeChild(fileInput), 1000);
            
        } catch (error) {
            this.showNotification('❌ Erreur lors de l\'import', 'error');
        }
    }

    async exportCharges() {
        try {
            if (this.filteredCharges.length === 0) {
                this.showNotification('❌ Aucune charge à exporter', 'warning');
                return;
            }
            
            const exportData = this.filteredCharges.map(charge => ({
                id: charge.id,
                label: charge.label,
                category: charge.category,
                amount: charge.amount,
                date: charge.date,
                paymentMethod: charge.paymentMethod,
                supplier: charge.supplier,
                reference: charge.reference,
                description: charge.description,
                created_at: charge.created_at
            }));

            const jsonContent = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            
            const date = new Date().toISOString().split('T')[0];
            link.download = `charges_${date}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            this.showNotification(`✅ Export réussi ! ${exportData.length} charge(s) exportée(s)`, 'success');
            
        } catch (error) {
            console.error('Erreur export:', error);
            this.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.app) {
            window.app.showNotification(message, type);
        }
    }
}

// ==================== STATISTICS MANAGER ====================
class StatisticsManager {
    constructor() {
        this.db = window.minimarketDB;
        this.charts = {};
        this.currentPeriod = 'today';
        this.currentScale = 'day';
        this.salesData = [];
        this.creditsData = [];
        this.customersData = [];
        this.productsData = [];
        this.initEventListeners();
    }

    initEventListeners() {
        const applyFilter = document.getElementById('applyStatisticsFilter');
        const periodSelect = document.getElementById('statisticsPeriod');
        const exportBtn = document.getElementById('exportStatisticsBtn');
        const scaleToggles = document.querySelectorAll('#chartScaleToggle .btn');

        if (applyFilter) {
            applyFilter.addEventListener('click', () => {
                this.currentPeriod = periodSelect.value;
                this.loadStatistics();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportStatistics());
        }

        scaleToggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                scaleToggles.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentScale = btn.dataset.scale;
                this.updateChartScale();
            });
        });

        const modal = document.getElementById('statisticsModal');
        if (modal) {
            modal.addEventListener('shown.bs.modal', () => {
                this.loadStatistics();
            });
        }
    }

    async loadStatistics() {
        window.app.showLoading();
        
        try {
            await this.loadData();
            this.updateDateRange();
            this.updateKPIs();
            this.updateCharts();
            this.updateTopCustomers();
            this.updateTopProducts();
            this.updateDetailedStats();
            
            document.getElementById('statLastUpdate').textContent = new Date().toLocaleString();
            
        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
            window.app.showNotification('Erreur lors du chargement des statistiques', 'error');
        }
        
        window.app.hideLoading();
    }

    async loadData() {
        const [sales, credits, customers, products] = await Promise.all([
            this.db.getAll('sales'),
            this.db.getAll('credits'),
            this.db.getAll('customers'),
            this.db.getAll('products')
        ]);

        const dateFilter = this.getDateFilter();
        
        this.salesData = sales.filter(sale => dateFilter(new Date(sale.date)));
        this.creditsData = credits.filter(credit => dateFilter(new Date(credit.created_at)));
        this.customersData = customers;
        this.productsData = products;
    }

    getDateFilter() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const filters = {
            'today': (date) => date >= today,
            '1day': (date) => date >= new Date(today.getTime() - 1*24*60*60*1000),
            '3days': (date) => date >= new Date(today.getTime() - 3*24*60*60*1000),
            '1week': (date) => date >= new Date(today.getTime() - 7*24*60*60*1000),
            '15days': (date) => date >= new Date(today.getTime() - 15*24*60*60*1000),
            '1month': (date) => date >= new Date(today.getTime() - 30*24*60*60*1000),
            '3months': (date) => date >= new Date(today.getTime() - 90*24*60*60*1000),
            '6months': (date) => date >= new Date(today.getTime() - 180*24*60*60*1000),
            '1year': (date) => date >= new Date(today.getTime() - 365*24*60*60*1000),
            'all': () => true
        };

        return filters[this.currentPeriod] || filters['today'];
    }

    updateDateRange() {
        const rangeSpan = document.getElementById('statisticsDateRange');
        const now = new Date();
        const startDate = this.getStartDate();
        
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const startStr = startDate.toLocaleDateString('fr-FR', options);
        const endStr = now.toLocaleDateString('fr-FR', options);
        
        rangeSpan.innerHTML = `<i class="far fa-calendar-alt me-2"></i>${startStr} - ${endStr}`;
    }

    getStartDate() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const offsets = {
            'today': 0,
            '1day': 1,
            '3days': 3,
            '1week': 7,
            '15days': 15,
            '1month': 30,
            '3months': 90,
            '6months': 180,
            '1year': 365,
            'all': 3650
        };

        const days = offsets[this.currentPeriod] || 0;
        return new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    }

    updateKPIs() {
        const totalRevenue = this.salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalProfit = this.salesData.reduce((sum, sale) => {
            const saleProfit = sale.items ? sale.items.reduce((itemSum, item) => itemSum + (item.profit || 0), 0) : 0;
            return sum + saleProfit;
        }, 0);
        
        const totalItems = this.salesData.reduce((sum, sale) => {
            const items = sale.items ? sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) : 0;
            return sum + items;
        }, 0);

        const activeCredits = this.creditsData.filter(c => c.status === 'active');
        const totalActiveCredits = activeCredits.reduce((sum, c) => sum + (c.remaining || c.amount || 0), 0);
        
        const previousPeriodRevenue = this.calculatePreviousPeriodRevenue();
        const revenueTrend = previousPeriodRevenue > 0 ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1) : 0;
        
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;
        
        const days = this.getPeriodDays();
        const avgPerDay = days > 0 ? (totalItems / days).toFixed(1) : 0;

        document.getElementById('statTotalRevenue').textContent = `${totalRevenue.toFixed(2)} DH`;
        document.getElementById('statTotalProfit').textContent = `${totalProfit.toFixed(2)} DH`;
        document.getElementById('statTotalItems').textContent = totalItems;
        document.getElementById('statActiveCredits').textContent = `${totalActiveCredits.toFixed(2)} DH`;

        const trendSpan = document.getElementById('statRevenueTrend');
        trendSpan.innerHTML = revenueTrend >= 0 ? 
            `<i class="fas fa-arrow-up text-success me-1"></i>+${revenueTrend}%` : 
            `<i class="fas fa-arrow-down text-danger me-1"></i>${revenueTrend}%`;

        document.getElementById('statProfitTrend').innerHTML = `<i class="fas fa-chart-line me-1"></i>${margin}% marge`;
        document.getElementById('statItemsAvg').innerHTML = `<i class="fas fa-calculator me-1"></i>Moy: ${avgPerDay}/jour`;
        document.getElementById('statCreditCount').innerHTML = `<i class="fas fa-exclamation-triangle me-1"></i>${activeCredits.length} crédits actifs`;
    }

    calculatePreviousPeriodRevenue() {
        const endDate = this.getStartDate();
        const startDate = new Date(endDate);
        const days = this.getPeriodDays();
        startDate.setDate(startDate.getDate() - days);

        const previousSales = this.salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate < endDate;
        });

        return previousSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    }

    getPeriodDays() {
        const offsets = {
            'today': 1,
            '1day': 1,
            '3days': 3,
            '1week': 7,
            '15days': 15,
            '1month': 30,
            '3months': 90,
            '6months': 180,
            '1year': 365,
            'all': 365
        };
        return offsets[this.currentPeriod] || 1;
    }

    updateCharts() {
        this.updateSalesCreditChart();
        this.updatePaymentMethodChart();
    }

    updateSalesCreditChart() {
        const ctx = document.getElementById('salesCreditChart').getContext('2d');
        
        const groupedData = this.groupDataByPeriod();
        
        if (this.charts.salesCredit) {
            this.charts.salesCredit.destroy();
        }

        this.charts.salesCredit = new Chart(ctx, {
            type: 'line',
            data: {
                labels: groupedData.labels,
                datasets: [
                    {
                        label: 'Ventes (DH)',
                        data: groupedData.sales,
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#000000',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Crédits (DH)',
                        data: groupedData.credits,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#2ecc71',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#2ecc71',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} DH`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return value + ' DH';
                            },
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                elements: {
                    line: {
                        borderJoinStyle: 'round'
                    }
                }
            }
        });
        
        if (this.charts.salesCredit.legend) {
            const legendItems = this.charts.salesCredit.legend.legendItems;
            if (legendItems && legendItems.length >= 2) {
                legendItems[0].fillStyle = '#000000';
                legendItems[0].strokeStyle = '#000000';
                legendItems[1].fillStyle = '#2ecc71';
                legendItems[1].strokeStyle = '#2ecc71';
            }
        }
    }

    groupDataByPeriod() {
        const labels = [];
        const sales = [];
        const credits = [];
        
        const startDate = this.getStartDate();
        const endDate = new Date();
        
        if (this.currentScale === 'day' && this.currentPeriod === 'today') {
            for (let hour = 0; hour < 24; hour++) {
                const hourStart = new Date();
                hourStart.setHours(hour, 0, 0, 0);
                const hourEnd = new Date();
                hourEnd.setHours(hour, 59, 59, 999);
                
                labels.push(`${hour}h`);
                
                const hourSales = this.salesData.filter(sale => {
                    const saleDate = new Date(sale.date);
                    return saleDate >= hourStart && saleDate <= hourEnd;
                });
                
                const hourCredits = this.creditsData.filter(credit => {
                    const creditDate = new Date(credit.created_at);
                    return creditDate >= hourStart && creditDate <= hourEnd && credit.status === 'active';
                });
                
                sales.push(hourSales.reduce((sum, s) => sum + (s.total || 0), 0));
                credits.push(hourCredits.reduce((sum, c) => sum + (c.remaining || c.amount || 0), 0));
            }
        } 
        else if (this.currentScale === 'day' || this.currentPeriod === '1week' || this.currentPeriod === '15days') {
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);
                
                labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
                
                const daySales = this.salesData.filter(sale => {
                    const saleDate = new Date(sale.date);
                    return saleDate >= date && saleDate < nextDate;
                });
                
                const dayCredits = this.creditsData.filter(credit => {
                    const creditDate = new Date(credit.created_at);
                    return creditDate >= date && creditDate < nextDate && credit.status === 'active';
                });
                
                sales.push(daySales.reduce((sum, s) => sum + (s.total || 0), 0));
                credits.push(dayCredits.reduce((sum, c) => sum + (c.remaining || c.amount || 0), 0));
            }
        } 
        else {
            const months = [];
            let currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                const monthKey = currentDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
                months.push(monthKey);
                
                const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
                
                const monthSales = this.salesData.filter(sale => {
                    const saleDate = new Date(sale.date);
                    return saleDate >= monthStart && saleDate <= monthEnd;
                });
                
                const monthCredits = this.creditsData.filter(credit => {
                    const creditDate = new Date(credit.created_at);
                    return creditDate >= monthStart && creditDate <= monthEnd && credit.status === 'active';
                });
                
                sales.push(monthSales.reduce((sum, s) => sum + (s.total || 0), 0));
                credits.push(monthCredits.reduce((sum, c) => sum + (c.remaining || c.amount || 0), 0));
                
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            
            labels.push(...months);
        }
        
        return { labels, sales, credits };
    }

    updatePaymentMethodChart() {
        const ctx = document.getElementById('paymentMethodChart').getContext('2d');
        
        const cashSales = this.salesData.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + (s.total || 0), 0);
        const creditSales = this.salesData.filter(s => s.paymentMethod === 'credit' || s.paymentMethod === 'partial').reduce((sum, s) => sum + (s.total || 0), 0);
        
        if (this.charts.paymentMethod) {
            this.charts.paymentMethod.destroy();
        }

        this.charts.paymentMethod = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Espèces', 'Crédit'],
                datasets: [{
                    data: [cashSales, creditSales],
                    backgroundColor: [
                        '#000000',
                        '#2ecc71'
                    ],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#2ecc71',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${value.toFixed(2)} DH (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        if (this.charts.paymentMethod.legend) {
            const legendItems = this.charts.paymentMethod.legend.legendItems;
            if (legendItems && legendItems.length >= 2) {
                legendItems[0].fillStyle = '#000000';
                legendItems[0].strokeStyle = '#000000';
                legendItems[1].fillStyle = '#2ecc71';
                legendItems[1].strokeStyle = '#2ecc71';
            }
        }
    }

    updateTopCustomers() {
        const tbody = document.getElementById('topCustomersBody');
        
        const customerStats = {};
        
        this.salesData.forEach(sale => {
            if (sale.customerId) {
                if (!customerStats[sale.customerId]) {
                    customerStats[sale.customerId] = {
                        name: sale.customerName || `Client #${sale.customerId}`,
                        revenue: 0,
                        profit: 0,
                        count: 0
                    };
                }
                
                const saleProfit = sale.items ? sale.items.reduce((sum, item) => sum + (item.profit || 0), 0) : 0;
                
                customerStats[sale.customerId].revenue += sale.total || 0;
                customerStats[sale.customerId].profit += saleProfit;
                customerStats[sale.customerId].count++;
            }
        });
        
        const topCustomers = Object.values(customerStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        if (topCustomers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Aucune donnée</td></tr>';
        } else {
            tbody.innerHTML = topCustomers.map(cust => `
                <tr>
                    <td>${cust.name}</td>
                    <td class="text-end">${cust.revenue.toFixed(2)} DH</td>
                    <td class="text-end text-success">${cust.profit.toFixed(2)} DH</td>
                    <td class="text-center">${cust.count}</td>
                </tr>
            `).join('');
        }
    }

    updateTopProducts() {
        const tbody = document.getElementById('topProductsBody');
        
        const productStats = {};
        
        this.salesData.forEach(sale => {
            if (sale.items) {
                sale.items.forEach(item => {
                    const productName = item.productName || `Produit #${item.productId}`;
                    
                    if (!productStats[productName]) {
                        productStats[productName] = {
                            name: productName,
                            quantity: 0,
                            revenue: 0,
                            profit: 0
                        };
                    }
                    
                    productStats[productName].quantity += item.quantity || 0;
                    productStats[productName].revenue += item.total || 0;
                    productStats[productName].profit += item.profit || 0;
                });
            }
        });
        
        const topProducts = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        if (topProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Aucune donnée</td></tr>';
        } else {
            tbody.innerHTML = topProducts.map(prod => `
                <tr>
                    <td>${prod.name}</td>
                    <td class="text-center">${prod.quantity}</td>
                    <td class="text-end">${prod.revenue.toFixed(2)} DH</td>
                    <td class="text-end text-success">${prod.profit.toFixed(2)} DH</td>
                </tr>
            `).join('');
        }
    }

    updateDetailedStats() {
        const salesCount = this.salesData.length;
        const totalRevenue = this.salesData.reduce((sum, s) => sum + (s.total || 0), 0);
        const avgTicket = salesCount > 0 ? totalRevenue / salesCount : 0;
        
        const cashSales = this.salesData.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + (s.total || 0), 0);
        const creditSales = this.salesData.filter(s => s.paymentMethod === 'credit' || s.paymentMethod === 'partial').reduce((sum, s) => sum + (s.total || 0), 0);
        
        const totalDiscount = this.salesData.reduce((sum, s) => sum + (s.discount || 0), 0);
        
        const totalProfit = this.salesData.reduce((sum, s) => {
            const saleProfit = s.items ? s.items.reduce((itemSum, item) => itemSum + (item.profit || 0), 0) : 0;
            return sum + saleProfit;
        }, 0);
        
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;

        document.getElementById('statSalesCount').textContent = salesCount;
        document.getElementById('statAvgTicket').textContent = `${avgTicket.toFixed(2)} DH`;
        document.getElementById('statCashSales').textContent = `${cashSales.toFixed(2)} DH`;
        document.getElementById('statCreditSales').textContent = `${creditSales.toFixed(2)} DH`;
        document.getElementById('statTotalDiscount').textContent = `${totalDiscount.toFixed(2)} DH`;
        document.getElementById('statMargin').textContent = `${margin}%`;

        const unpaidCredits = this.creditsData.filter(c => c.status === 'active').length;
        const totalDue = this.creditsData.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.remaining || c.amount || 0), 0);
        const overdueCredits = this.creditsData.filter(c => c.status === 'active' && c.dueDate && new Date(c.dueDate) < new Date()).length;
        const overdueAmount = this.creditsData.filter(c => c.status === 'active' && c.dueDate && new Date(c.dueDate) < new Date()).reduce((sum, c) => sum + (c.remaining || c.amount || 0), 0);
        
        const totalCreditsAmount = this.creditsData.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalPaid = this.creditsData.reduce((sum, c) => {
            if (c.paymentHistory && c.paymentHistory.length > 0) {
                return sum + c.paymentHistory.reduce((pSum, p) => pSum + (p.amount || 0), 0);
            }
            return sum + (c.paid || 0);
        }, 0);
        const recoveryRate = totalCreditsAmount > 0 ? (totalPaid / totalCreditsAmount * 100).toFixed(1) : 0;

        document.getElementById('statUnpaidCredits').textContent = unpaidCredits;
        document.getElementById('statTotalDue').textContent = `${totalDue.toFixed(2)} DH`;
        document.getElementById('statOverdueCredits').textContent = overdueCredits;
        document.getElementById('statOverdueAmount').textContent = `${overdueAmount.toFixed(2)} DH`;
        document.getElementById('statRecoveryRate').textContent = `${recoveryRate}%`;

        const activeCustomers = new Set(this.salesData.map(s => s.customerId).filter(id => id)).size;
        const allCustomers = this.customersData.length;
        const newCustomers = this.customersData.filter(c => {
            const createdDate = new Date(c.created_at);
            return this.getDateFilter()(createdDate);
        }).length;
        
        const totalCustomerRevenue = this.salesData.reduce((sum, s) => sum + (s.total || 0), 0);
        const totalCustomerProfit = this.salesData.reduce((sum, s) => {
            const saleProfit = s.items ? s.items.reduce((itemSum, item) => itemSum + (item.profit || 0), 0) : 0;
            return sum + saleProfit;
        }, 0);
        
        const avgCustomerRevenue = activeCustomers > 0 ? totalCustomerRevenue / activeCustomers : 0;
        const avgCustomerProfit = activeCustomers > 0 ? totalCustomerProfit / activeCustomers : 0;
        
        const loyaltyRate = allCustomers > 0 ? (activeCustomers / allCustomers * 100).toFixed(1) : 0;

        document.getElementById('statActiveCustomers').textContent = activeCustomers;
        document.getElementById('statNewCustomers').textContent = newCustomers;
        document.getElementById('statAvgCustomerRevenue').textContent = `${avgCustomerRevenue.toFixed(2)} DH`;
        document.getElementById('statAvgCustomerProfit').textContent = `${avgCustomerProfit.toFixed(2)} DH`;
        document.getElementById('statLoyaltyRate').textContent = `${loyaltyRate}%`;
    }

    updateChartScale() {
        this.updateSalesCreditChart();
    }

    async exportStatistics() {
        try {
            const reportData = {
                periode: document.getElementById('statisticsDateRange').textContent,
                generation: new Date().toISOString(),
                kpis: {
                    chiffre_affaires: document.getElementById('statTotalRevenue').textContent,
                    profit: document.getElementById('statTotalProfit').textContent,
                    articles_vendus: document.getElementById('statTotalItems').textContent,
                    credits_actifs: document.getElementById('statActiveCredits').textContent
                },
                ventes: {
                    nombre: document.getElementById('statSalesCount').textContent,
                    ticket_moyen: document.getElementById('statAvgTicket').textContent,
                    ventes_comptant: document.getElementById('statCashSales').textContent,
                    ventes_credit: document.getElementById('statCreditSales').textContent,
                    remises: document.getElementById('statTotalDiscount').textContent,
                    marge: document.getElementById('statMargin').textContent
                },
                credits: {
                    impayes: document.getElementById('statUnpaidCredits').textContent,
                    total_du: document.getElementById('statTotalDue').textContent,
                    en_retard: document.getElementById('statOverdueCredits').textContent,
                    montant_retard: document.getElementById('statOverdueAmount').textContent,
                    recouvrement: document.getElementById('statRecoveryRate').textContent
                },
                clients: {
                    actifs: document.getElementById('statActiveCustomers').textContent,
                    nouveaux: document.getElementById('statNewCustomers').textContent,
                    ca_moyen: document.getElementById('statAvgCustomerRevenue').textContent,
                    profit_moyen: document.getElementById('statAvgCustomerProfit').textContent,
                    fidelite: document.getElementById('statLoyaltyRate').textContent
                }
            };

            const jsonContent = JSON.stringify(reportData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            
            const date = new Date().toISOString().split('T')[0];
            link.download = `statistiques_${date}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            window.app.showNotification('✅ Rapport exporté avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur export statistiques:', error);
            window.app.showNotification('❌ Erreur lors de l\'export', 'error');
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MiniMarketApp();
});
