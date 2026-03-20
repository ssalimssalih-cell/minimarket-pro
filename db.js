// Base de données IndexedDB pour MiniMarket - Version complète avec tous les stores

class MiniMarketDB {
    constructor() {
        this.dbName = 'minimarket_db';
        this.dbVersion = 7; // Incrémenté pour ajouter les index manquants
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Erreur d\'initialisation de la base de données');
                reject(request.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ Base de données initialisée avec succès');
                
                // Vérifier si les données existent déjà
                setTimeout(() => {
                    this.checkAndSeedData();
                }, 500);
                
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion;
                
                console.log(`🔄 Mise à jour de la base de données de la version ${oldVersion} vers ${this.dbVersion}`);
                
                // Supprimer les anciens stores si nécessaire (changement de version majeur)
                if (oldVersion < 7) {
                    // On ne supprime pas automatiquement pour préserver les données
                    // Mais on vérifie et met à jour la structure
                }
                
                // ===== STORE CATEGORIES =====
                if (!db.objectStoreNames.contains('categories')) {
                    const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    categoryStore.createIndex('name', 'name', { unique: true });
                    categoryStore.createIndex('created_at', 'created_at', { unique: false });
                    console.log('📁 Store categories créé');
                }

                // ===== STORE PRODUCTS AMÉLIORÉ =====
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
                    productStore.createIndex('name', 'name', { unique: false });
                    productStore.createIndex('category', 'category', { unique: false });
                    productStore.createIndex('categoryId', 'categoryId', { unique: false });
                    productStore.createIndex('boxUnit', 'boxUnit', { unique: false });
                    productStore.createIndex('boxPrice', 'boxPrice', { unique: false });
                    productStore.createIndex('priceUnit', 'priceUnit', { unique: false });
                    productStore.createIndex('priceSell', 'priceSell', { unique: false });
                    productStore.createIndex('profit', 'profit', { unique: false });
                    productStore.createIndex('brand', 'brand', { unique: false });
                    productStore.createIndex('unit', 'unit', { unique: false });
                    productStore.createIndex('supplier', 'supplier', { unique: false });
                    productStore.createIndex('supplierId', 'supplierId', { unique: false });
                    productStore.createIndex('expiration', 'expiration', { unique: false });
                    productStore.createIndex('currentStock', 'currentStock', { unique: false });
                    productStore.createIndex('soldStock', 'soldStock', { unique: false });
                    productStore.createIndex('stock', 'stock', { unique: false });
                    productStore.createIndex('barcode', 'barcode', { unique: true });
                    productStore.createIndex('created_at', 'created_at', { unique: false }); // AJOUTÉ
                    console.log('📁 Store products créé avec tous les champs');
                }

                // ===== STORE SALES AMÉLIORÉ =====
                if (!db.objectStoreNames.contains('sales')) {
                    const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
                    salesStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: true });
                    salesStore.createIndex('date', 'date', { unique: false });
                    salesStore.createIndex('total', 'total', { unique: false });
                    salesStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
                    salesStore.createIndex('customerName', 'customerName', { unique: false }); // CORRIGÉ (au lieu de 'customer')
                    salesStore.createIndex('customerId', 'customerId', { unique: false });
                    salesStore.createIndex('status', 'status', { unique: false });
                    salesStore.createIndex('paymentGiven', 'paymentGiven', { unique: false });
                    salesStore.createIndex('remaining', 'remaining', { unique: false });
                    salesStore.createIndex('created_at', 'created_at', { unique: false }); // AJOUTÉ
                    console.log('📁 Store sales créé');
                }

                // ===== STORE SUPPLIERS =====
                if (!db.objectStoreNames.contains('suppliers')) {
                    const supplierStore = db.createObjectStore('suppliers', { keyPath: 'id', autoIncrement: true });
                    supplierStore.createIndex('contact_name', 'contact_name', { unique: false });
                    supplierStore.createIndex('company', 'company', { unique: false });
                    supplierStore.createIndex('phone', 'phone', { unique: false });
                    supplierStore.createIndex('email', 'email', { unique: false });
                    supplierStore.createIndex('created_at', 'created_at', { unique: false });
                    console.log('📁 Store suppliers créé');
                }

                // ===== STORE CREDITS AMÉLIORÉ =====
                if (!db.objectStoreNames.contains('credits')) {
                    const creditsStore = db.createObjectStore('credits', { keyPath: 'id', autoIncrement: true });
                    creditsStore.createIndex('saleId', 'saleId', { unique: false });
                    creditsStore.createIndex('customerId', 'customerId', { unique: false });
                    creditsStore.createIndex('customerName', 'customerName', { unique: false });
                    creditsStore.createIndex('amount', 'amount', { unique: false });
                    creditsStore.createIndex('remaining', 'remaining', { unique: false });
                    creditsStore.createIndex('paid', 'paid', { unique: false }); // AJOUTÉ
                    creditsStore.createIndex('paidAmount', 'paidAmount', { unique: false }); // AJOUTÉ
                    creditsStore.createIndex('status', 'status', { unique: false });
                    creditsStore.createIndex('dueDate', 'dueDate', { unique: false });
                    creditsStore.createIndex('created_at', 'created_at', { unique: false });
                    creditsStore.createIndex('paymentHistory', 'paymentHistory', { unique: false });
                    console.log('📁 Store credits créé');
                }

                // ===== STORE CHARGES =====
                if (!db.objectStoreNames.contains('charges')) {
                    const chargesStore = db.createObjectStore('charges', { keyPath: 'id', autoIncrement: true });
                    chargesStore.createIndex('label', 'label', { unique: false }); // AJOUTÉ
                    chargesStore.createIndex('category', 'category', { unique: false });
                    chargesStore.createIndex('amount', 'amount', { unique: false }); // AJOUTÉ
                    chargesStore.createIndex('date', 'date', { unique: false });
                    chargesStore.createIndex('paymentMethod', 'paymentMethod', { unique: false }); // AJOUTÉ
                    chargesStore.createIndex('supplier', 'supplier', { unique: false }); // AJOUTÉ
                    chargesStore.createIndex('reference', 'reference', { unique: false }); // AJOUTÉ
                    chargesStore.createIndex('created_at', 'created_at', { unique: false }); // AJOUTÉ
                    console.log('📁 Store charges créé');
                }

                // ===== STORE CUSTOMERS =====
                if (!db.objectStoreNames.contains('customers')) {
                    const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                    customerStore.createIndex('name', 'name', { unique: false });
                    customerStore.createIndex('gender', 'gender', { unique: false });
                    customerStore.createIndex('phone', 'phone', { unique: false });
                    customerStore.createIndex('whatsapp', 'whatsapp', { unique: false });
                    customerStore.createIndex('address', 'address', { unique: false });
                    customerStore.createIndex('revenue', 'revenue', { unique: false });
                    customerStore.createIndex('profit', 'profit', { unique: false });
                    customerStore.createIndex('credit', 'credit', { unique: false });
                    customerStore.createIndex('description', 'description', { unique: false });
                    customerStore.createIndex('created_at', 'created_at', { unique: false });
                    console.log('📁 Store customers créé avec tous les champs');
                }

                console.log('✅ Structure de la base de données créée/mise à jour');
            };
        });
    }

    async checkAndSeedData() {
        try {
            if (!this.db) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            const categories = await this.getAll('categories');
            const suppliers = await this.getAll('suppliers');
            const customers = await this.getAll('customers');
            const products = await this.getAll('products');
            const credits = await this.getAll('credits');
            const sales = await this.getAll('sales');
            const charges = await this.getAll('charges');
            
            if (categories.length === 0 && suppliers.length === 0 && customers.length === 0 && products.length === 0) {
                console.log('🌱 Aucune donnée trouvée, ajout des données initiales...');
                await this.seedInitialData();
            } else {
                console.log('📊 Données existantes trouvées:', 
                    categories.length, 'catégories,', 
                    suppliers.length, 'fournisseurs,',
                    customers.length, 'clients,',
                    products.length, 'produits,',
                    credits.length, 'crédits,',
                    sales.length, 'ventes,',
                    charges.length, 'charges');
            }
        } catch (error) {
            console.error('❌ Erreur lors de la vérification des données:', error);
        }
    }

    async seedInitialData() {
        console.log('🌱 Ajout des données initiales...');
        
        // ===== CATÉGORIES =====
        const categories = [
            { 
                name: 'ALIMENTATION', 
                description: 'Produits alimentaires', 
                icon: 'utensils', 
                nbProducts: 45,
                revenue: 12500,
                profit: 3750,
                created_at: new Date('2024-01-15')
            },
            { 
                name: 'BOISSONS', 
                description: 'Boissons et jus', 
                icon: 'wine-bottle', 
                nbProducts: 38,
                revenue: 8900,
                profit: 1780,
                created_at: new Date('2024-01-16')
            },
            { 
                name: 'HYGIÈNE', 
                description: "Produits d'hygiène", 
                icon: 'soap', 
                nbProducts: 25,
                revenue: 5600,
                profit: 2240,
                created_at: new Date('2024-01-17')
            },
            { 
                name: 'MÉNAGE', 
                description: 'Produits ménagers', 
                icon: 'broom', 
                nbProducts: 30,
                revenue: 4200,
                profit: 1260,
                created_at: new Date('2024-01-18')
            },
            { 
                name: 'SNACKS', 
                description: 'Snacks et confiseries', 
                icon: 'cookie', 
                nbProducts: 52,
                revenue: 7800,
                profit: 2340,
                created_at: new Date('2024-01-19')
            }
        ];

        // ===== FOURNISSEURS =====
        const suppliers = [
            { 
                contact_name: 'AHMED BENANI', 
                company: 'SOCIÉTÉ LAITIÈRE', 
                phone: '0522XXXXXX', 
                whatsapp: '0612345678',
                address: '123 Rue de la Laitière, Casablanca',
                email: 'contact@laiterie.ma',
                revenue: 150000,
                created_at: new Date('2024-01-15')
            },
            { 
                contact_name: 'FATIMA ZAHRA', 
                company: 'BOULANGERIE MODERNE', 
                phone: '0523XXXXXX', 
                whatsapp: '0623456789',
                address: '45 Avenue de la Farine, Rabat',
                email: 'contact@boulangerie.ma',
                revenue: 85000,
                created_at: new Date('2024-01-16')
            },
            { 
                contact_name: 'MOHAMED EL AMRANI', 
                company: 'EAUX MINÉRALES SA', 
                phone: '0524XXXXXX', 
                whatsapp: '0634567890',
                address: '78 Route de l\'Eau, Marrakech',
                email: 'contact@eaux.ma',
                revenue: 210000,
                created_at: new Date('2024-01-17')
            },
            { 
                contact_name: 'KARIM IDRISSI', 
                company: 'HYGIÈNE PLUS', 
                phone: '0525XXXXXX', 
                whatsapp: '0645678901',
                address: '12 Rue du Savon, Tanger',
                email: 'contact@hygiene.ma',
                revenue: 95000,
                created_at: new Date('2024-01-18')
            },
            { 
                contact_name: 'NADIA ALAOUI', 
                company: 'CLEAN PRO', 
                phone: '0526XXXXXX', 
                whatsapp: '0656789012',
                address: '34 Avenue du Propre, Fès',
                email: 'contact@clean.ma',
                revenue: 120000,
                created_at: new Date('2024-01-19')
            }
        ];

        // ===== PRODUITS AMÉLIORÉS =====
        const products = [
            { 
                name: 'LAIT 1L', 
                category: 'ALIMENTATION', 
                categoryId: 1, 
                boxUnit: 12,
                boxPrice: 96.00,
                priceUnit: 8.00,
                priceSell: 8.50,
                profit: 0.50,
                brand: 'Jawda',
                unit: 'LITRE',
                supplier: 'SOCIÉTÉ LAITIÈRE',
                supplierId: 1,
                expiration: '2024-12-31',
                currentStock: 45,
                soldStock: 120,
                stock: 45,
                description: 'Lait pasteurisé 1L',
                barcode: '123456789',
                created_at: new Date('2024-01-15')
            },
            { 
                name: 'PAIN', 
                category: 'ALIMENTATION', 
                categoryId: 1, 
                boxUnit: 10,
                boxPrice: 45.00,
                priceUnit: 4.50,
                priceSell: 5.00,
                profit: 0.50,
                brand: 'Boulangerie Moderne',
                unit: 'PIECE',
                supplier: 'BOULANGERIE MODERNE',
                supplierId: 2,
                expiration: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
                currentStock: 20,
                soldStock: 250,
                stock: 20,
                description: 'Pain frais quotidien',
                barcode: '123456790',
                created_at: new Date('2024-01-16')
            },
            { 
                name: 'EAU 1.5L', 
                category: 'BOISSONS', 
                categoryId: 2, 
                boxUnit: 6,
                boxPrice: 24.00,
                priceUnit: 4.00,
                priceSell: 4.50,
                profit: 0.50,
                brand: 'Sidi Ali',
                unit: 'LITRE',
                supplier: 'EAUX MINÉRALES SA',
                supplierId: 3,
                expiration: '2025-12-31',
                currentStock: 120,
                soldStock: 450,
                stock: 120,
                description: 'Eau minérale naturelle',
                barcode: '123456791',
                created_at: new Date('2024-01-17')
            },
            { 
                name: 'SAVON', 
                category: 'HYGIÈNE', 
                categoryId: 3, 
                boxUnit: 24,
                boxPrice: 240.00,
                priceUnit: 10.00,
                priceSell: 12.00,
                profit: 2.00,
                brand: 'Tide',
                unit: 'PIECE',
                supplier: 'HYGIÈNE PLUS',
                supplierId: 4,
                expiration: '2026-01-01',
                currentStock: 30,
                soldStock: 85,
                stock: 30,
                description: 'Savon de toilette parfumé',
                barcode: '123456792',
                created_at: new Date('2024-01-18')
            },
            { 
                name: 'DÉTERGENT', 
                category: 'MÉNAGE', 
                categoryId: 4, 
                boxUnit: 12,
                boxPrice: 276.00,
                priceUnit: 23.00,
                priceSell: 25.00,
                profit: 2.00,
                brand: 'Omo',
                unit: 'LITRE',
                supplier: 'CLEAN PRO',
                supplierId: 5,
                expiration: '2025-06-30',
                currentStock: 15,
                soldStock: 42,
                stock: 15,
                description: 'Lessive liquide',
                barcode: '123456793',
                created_at: new Date('2024-01-19')
            },
            { 
                name: 'JUS ORANGE 1L', 
                category: 'BOISSONS', 
                categoryId: 2, 
                boxUnit: 6,
                boxPrice: 54.00,
                priceUnit: 9.00,
                priceSell: 15.00,
                profit: 6.00,
                brand: 'Cidou',
                unit: 'LITRE',
                supplier: 'EAUX MINÉRALES SA',
                supplierId: 3,
                expiration: '2024-10-31',
                currentStock: 25,
                soldStock: 68,
                stock: 25,
                description: 'Jus d\'orange pur fruit',
                barcode: '123456794',
                created_at: new Date('2024-01-20')
            },
            { 
                name: 'CHIPS', 
                category: 'SNACKS', 
                categoryId: 5, 
                boxUnit: 20,
                boxPrice: 100.00,
                priceUnit: 5.00,
                priceSell: 6.00,
                profit: 1.00,
                brand: 'Chiply',
                unit: 'SACHET',
                supplier: 'SNACKS PLUS',
                supplierId: 6,
                expiration: '2024-09-30',
                currentStock: 50,
                soldStock: 180,
                stock: 50,
                description: 'Chips de pommes de terre',
                barcode: '123456795',
                created_at: new Date('2024-01-21')
            },
            { 
                name: 'CHOCOLAT', 
                category: 'SNACKS', 
                categoryId: 5, 
                boxUnit: 24,
                boxPrice: 168.00,
                priceUnit: 7.00,
                priceSell: 10.00,
                profit: 3.00,
                brand: 'Milka',
                unit: 'PIECE',
                supplier: 'SNACKS PLUS',
                supplierId: 6,
                expiration: '2024-12-31',
                currentStock: 35,
                soldStock: 92,
                stock: 35,
                description: 'Tablette de chocolat au lait',
                barcode: '123456796',
                created_at: new Date('2024-01-22')
            }
        ];

        // ===== CLIENTS =====
        const customers = [
            { 
                name: 'AHMED BENANI', 
                gender: 'MASCULIN',
                phone: '0612345678', 
                whatsapp: '0612345678',
                address: '123 Rue de la Liberté, Casablanca',
                revenue: 12500,
                profit: 3750,
                credit: 150,
                description: 'Client fidèle depuis 2020',
                created_at: new Date('2024-01-15')
            },
            { 
                name: 'FATIMA ZAHRA', 
                gender: 'FÉMININ',
                phone: '0623456789', 
                whatsapp: '0623456789',
                address: '45 Avenue Hassan II, Rabat',
                revenue: 8900,
                profit: 1780,
                credit: 75,
                description: 'Préfère les paiements en espèces',
                created_at: new Date('2024-01-16')
            },
            { 
                name: 'MOHAMED EL AMRANI', 
                gender: 'MASCULIN',
                phone: '0634567890', 
                whatsapp: '',
                address: '78 Rue de la Médina, Marrakech',
                revenue: 15600,
                profit: 4680,
                credit: 200,
                description: 'Achète en gros',
                created_at: new Date('2024-01-17')
            },
            { 
                name: 'SAID ALAOUI', 
                gender: 'MASCULIN',
                phone: '0645678901', 
                whatsapp: '0645678901',
                address: '12 Rue de la Plage, Tanger',
                revenue: 0,
                profit: 0,
                credit: 0,
                description: 'Nouveau client',
                created_at: new Date('2024-01-18')
            },
            { 
                name: 'NADIA IDRISSI', 
                gender: 'FÉMININ',
                phone: '0656789012', 
                whatsapp: '0656789012',
                address: '34 Avenue des FAR, Fès',
                revenue: 3400,
                profit: 1020,
                credit: 50,
                description: 'Achète des produits bio',
                created_at: new Date('2024-01-19')
            }
        ];

        // ===== CRÉDITS DE TEST =====
        const credits = [
            {
                saleId: 'INV-240115-001',
                customerId: 1,
                customerName: 'AHMED BENANI',
                amount: 150,
                remaining: 150,
                paid: 0,
                status: 'active',
                dueDate: new Date('2024-02-15'),
                description: 'Crédit pour achat de produits alimentaires',
                paymentHistory: [],
                created_at: new Date('2024-01-15')
            },
            {
                saleId: 'INV-240116-002',
                customerId: 2,
                customerName: 'FATIMA ZAHRA',
                amount: 75,
                remaining: 75,
                paid: 0,
                status: 'active',
                dueDate: new Date('2024-02-16'),
                description: 'Crédit pour achat de produits d\'hygiène',
                paymentHistory: [],
                created_at: new Date('2024-01-16')
            },
            {
                saleId: 'INV-240117-003',
                customerId: 3,
                customerName: 'MOHAMED EL AMRANI',
                amount: 200,
                remaining: 200,
                paid: 0,
                status: 'active',
                dueDate: new Date('2024-02-17'),
                description: 'Crédit pour achat en gros',
                paymentHistory: [],
                created_at: new Date('2024-01-17')
            }
        ];

        // ===== CHARGES DE TEST =====
        const charges = [
            {
                label: 'LOYER',
                category: 'LOYER',
                amount: 5000,
                date: new Date('2024-01-01'),
                paymentMethod: 'VIREMENT',
                supplier: 'PROPRIÉTAIRE',
                reference: 'FACT-001',
                description: 'Loyer du mois de janvier',
                created_at: new Date('2024-01-01')
            },
            {
                label: 'ÉLECTRICITÉ',
                category: 'ÉLECTRICITÉ',
                amount: 850,
                date: new Date('2024-01-05'),
                paymentMethod: 'PRÉLÈVEMENT',
                supplier: 'ONEE',
                reference: 'FACT-ELEC-001',
                description: 'Facture d\'électricité janvier',
                created_at: new Date('2024-01-05')
            },
            {
                label: 'EAU',
                category: 'EAU',
                amount: 320,
                date: new Date('2024-01-06'),
                paymentMethod: 'PRÉLÈVEMENT',
                supplier: 'ONEP',
                reference: 'FACT-EAU-001',
                description: 'Facture d\'eau janvier',
                created_at: new Date('2024-01-06')
            },
            {
                label: 'SALAIRE',
                category: 'SALAIRES',
                amount: 8000,
                date: new Date('2024-01-15'),
                paymentMethod: 'VIREMENT',
                supplier: 'PERSONNEL',
                reference: 'SAL-001',
                description: 'Salaire du mois de janvier',
                created_at: new Date('2024-01-15')
            },
            {
                label: 'INTERNET',
                category: 'TÉLÉPHONE/INTERNET',
                amount: 450,
                date: new Date('2024-01-10'),
                paymentMethod: 'CARTE BANCAIRE',
                supplier: 'MAROC TELECOM',
                reference: 'FACT-INT-001',
                description: 'Abonnement internet',
                created_at: new Date('2024-01-10')
            }
        ];

        try {
            // Ajout des catégories
            for (const cat of categories) {
                await this.add('categories', cat);
            }
            console.log('✅ Catégories ajoutées');
            
            // Ajout des fournisseurs
            for (const sup of suppliers) {
                await this.add('suppliers', sup);
            }
            console.log('✅ Fournisseurs ajoutés');
            
            // Ajout des produits améliorés
            for (const prod of products) {
                await this.add('products', prod);
            }
            console.log('✅ Produits ajoutés avec succès');
            
            // Ajout des clients
            for (const cust of customers) {
                await this.add('customers', cust);
            }
            console.log('✅ Clients ajoutés avec succès');

            // Ajout des crédits
            for (const credit of credits) {
                await this.add('credits', credit);
            }
            console.log('✅ Crédits ajoutés avec succès');

            // Ajout des charges
            for (const charge of charges) {
                await this.add('charges', charge);
            }
            console.log('✅ Charges ajoutées avec succès');

            // Ajout de quelques ventes de test
            const sales = [
                { 
                    invoiceNumber: 'INV-240115-001',
                    items: [{ 
                        productId: 1,
                        productName: 'LAIT 1L', 
                        quantity: 2, 
                        price: 8.50,
                        total: 17,
                        profit: 1.00
                    }], 
                    subtotal: 17,
                    discount: 0,
                    total: 17,
                    date: new Date('2024-01-15T10:30:00'),
                    paymentMethod: 'cash',
                    customerName: 'AHMED BENANI',
                    customerId: 1,
                    paymentGiven: 17,
                    remaining: 0,
                    status: 'paid',
                    created_at: new Date('2024-01-15')
                },
                { 
                    invoiceNumber: 'INV-240116-002',
                    items: [{ 
                        productId: 2,
                        productName: 'PAIN', 
                        quantity: 3, 
                        price: 5.00,
                        total: 15,
                        profit: 1.50
                    }], 
                    subtotal: 15,
                    discount: 0,
                    total: 15,
                    date: new Date('2024-01-16T10:25:00'),
                    paymentMethod: 'credit',
                    customerName: 'FATIMA ZAHRA',
                    customerId: 2,
                    paymentGiven: 0,
                    remaining: 15,
                    status: 'credit',
                    created_at: new Date('2024-01-16')
                },
                { 
                    invoiceNumber: 'INV-240117-003',
                    items: [{ 
                        productId: 3,
                        productName: 'EAU 1.5L', 
                        quantity: 4, 
                        price: 4.50,
                        total: 18,
                        profit: 2.00
                    }], 
                    subtotal: 18,
                    discount: 0,
                    total: 18,
                    date: new Date('2024-01-17T10:20:00'),
                    paymentMethod: 'credit',
                    customerName: 'MOHAMED EL AMRANI',
                    customerId: 3,
                    paymentGiven: 0,
                    remaining: 18,
                    status: 'credit',
                    created_at: new Date('2024-01-17')
                }
            ];

            for (const sale of sales) {
                await this.add('sales', sale);
            }
            console.log('✅ Ventes ajoutées');

            console.log('🎉 Données initiales ajoutées avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout des données initiales:', error);
        }
    }

    // ===== OPÉRATIONS CRUD GÉNÉRIQUES =====
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getById(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES CATÉGORIES =====
    async getCategoryByName(name) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['categories'], 'readonly');
            const store = transaction.objectStore('categories');
            const index = store.index('name');
            const request = index.get(name);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getCategoriesWithStats() {
        try {
            const categories = await this.getAll('categories');
            const products = await this.getAll('products');
            
            return categories.map(cat => {
                const catProducts = products.filter(p => p.categoryId === cat.id);
                const nbProducts = catProducts.length;
                const revenue = catProducts.reduce((sum, p) => sum + ((p.priceSell || 0) * (p.soldStock || 0)), 0);
                const profit = catProducts.reduce((sum, p) => sum + ((p.profit || 0) * (p.soldStock || 0)), 0);
                
                return {
                    ...cat,
                    nbProducts: cat.nbProducts || nbProducts,
                    revenue: cat.revenue || revenue,
                    profit: cat.profit || profit,
                    createdAt: cat.created_at ? new Date(cat.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                };
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des stats catégories:', error);
            return [];
        }
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES FOURNISSEURS =====
    async getSupplierByPhone(phone) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['suppliers'], 'readonly');
            const store = transaction.objectStore('suppliers');
            const index = store.index('phone');
            const request = index.get(phone);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getSupplierByEmail(email) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['suppliers'], 'readonly');
            const store = transaction.objectStore('suppliers');
            const index = store.index('email');
            const request = index.get(email);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getSuppliersByCompany(company) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['suppliers'], 'readonly');
            const store = transaction.objectStore('suppliers');
            const index = store.index('company');
            const request = index.getAll(company);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES CLIENTS =====
    async getCustomerByName(name) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['customers'], 'readonly');
            const store = transaction.objectStore('customers');
            const index = store.index('name');
            const request = index.get(name);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getCustomerByPhone(phone) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['customers'], 'readonly');
            const store = transaction.objectStore('customers');
            const index = store.index('phone');
            const request = index.get(phone);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getCustomersByGender(gender) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['customers'], 'readonly');
            const store = transaction.objectStore('customers');
            const index = store.index('gender');
            const request = index.getAll(gender);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getCustomersWithCredit() {
        try {
            const customers = await this.getAll('customers');
            return customers.filter(cust => cust.credit > 0);
        } catch (error) {
            console.error('Erreur lors de la récupération des clients avec crédit:', error);
            return [];
        }
    }

    async searchCustomers(query) {
        try {
            const customers = await this.getAll('customers');
            const searchTerm = query.toLowerCase();
            return customers.filter(cust => 
                cust.name.toLowerCase().includes(searchTerm) ||
                (cust.phone && cust.phone.includes(searchTerm)) ||
                (cust.description && cust.description.toLowerCase().includes(searchTerm))
            );
        } catch (error) {
            console.error('Erreur lors de la recherche de clients:', error);
            return [];
        }
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES PRODUITS =====
    async getProductByName(name) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const index = store.index('name');
            const request = index.get(name);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getProductsByCategory(categoryId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const index = store.index('categoryId');
            const request = index.getAll(categoryId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getProductsBySupplier(supplierId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const index = store.index('supplierId');
            const request = index.getAll(supplierId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getLowStockProducts(threshold = 10) {
        try {
            const products = await this.getAll('products');
            return products.filter(product => (product.currentStock || product.stock || 0) < threshold);
        } catch (error) {
            console.error('Erreur lors de la récupération des produits en stock faible:', error);
            return [];
        }
    }

    async getExpiringProducts(days = 30) {
        try {
            const products = await this.getAll('products');
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + days);
            
            return products.filter(product => {
                if (!product.expiration) return false;
                const expDate = new Date(product.expiration);
                return expDate <= futureDate && expDate >= today;
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des produits proches expiration:', error);
            return [];
        }
    }

    async searchProducts(query) {
        try {
            const products = await this.getAll('products');
            const searchTerm = query.toLowerCase();
            return products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.toLowerCase().includes(searchTerm)) ||
                (product.supplier && product.supplier.toLowerCase().includes(searchTerm)) ||
                (product.barcode && product.barcode.includes(searchTerm))
            );
        } catch (error) {
            console.error('Erreur lors de la recherche de produits:', error);
            return [];
        }
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES VENTES =====
    async getTodaySales() {
        try {
            const today = new Date().toDateString();
            const sales = await this.getAll('sales');
            return sales.filter(sale => new Date(sale.date).toDateString() === today);
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes du jour:', error);
            return [];
        }
    }

    async getTotalSalesToday() {
        try {
            const todaySales = await this.getTodaySales();
            return todaySales.reduce((total, sale) => total + sale.total, 0);
        } catch (error) {
            console.error('Erreur lors du calcul du total des ventes:', error);
            return 0;
        }
    }

    async getSalesByCustomer(customerId) {
        try {
            const sales = await this.getAll('sales');
            return sales.filter(sale => sale.customerId === customerId);
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes par client:', error);
            return [];
        }
    }

    async getSalesByDateRange(startDate, endDate) {
        try {
            const sales = await this.getAll('sales');
            const start = new Date(startDate);
            const end = new Date(endDate);
            return sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= start && saleDate <= end;
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes par période:', error);
            return [];
        }
    }

    async getSalesByStatus(status) {
        try {
            const sales = await this.getAll('sales');
            return sales.filter(sale => sale.status === status);
        } catch (error) {
            console.error('Erreur lors de la récupération des ventes par statut:', error);
            return [];
        }
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES CRÉDITS =====
    async getActiveCredits() {
        try {
            const credits = await this.getAll('credits');
            return credits.filter(credit => credit.status === 'active');
        } catch (error) {
            console.error('Erreur lors de la récupération des crédits actifs:', error);
            return [];
        }
    }

    async getTotalActiveCredits() {
        try {
            const activeCredits = await this.getActiveCredits();
            return activeCredits.reduce((total, credit) => total + (credit.remaining || credit.amount || 0), 0);
        } catch (error) {
            console.error('Erreur lors du calcul du total des crédits:', error);
            return 0;
        }
    }

    async getCreditsByCustomer(customerId) {
        try {
            const credits = await this.getAll('credits');
            return credits.filter(credit => credit.customerId === customerId);
        } catch (error) {
            console.error('Erreur lors de la récupération des crédits par client:', error);
            return [];
        }
    }

    async getOverdueCredits() {
        try {
            const credits = await this.getAll('credits');
            const now = new Date();
            return credits.filter(credit => 
                credit.status === 'active' && 
                credit.dueDate && 
                new Date(credit.dueDate) < now
            );
        } catch (error) {
            console.error('Erreur lors de la récupération des crédits en retard:', error);
            return [];
        }
    }

    async getCreditBySaleId(saleId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Base de données non initialisée'));
                return;
            }
            
            const transaction = this.db.transaction(['credits'], 'readonly');
            const store = transaction.objectStore('credits');
            const index = store.index('saleId');
            const request = index.get(saleId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES CHARGES =====
    async getTodayCharges() {
        try {
            const today = new Date().toDateString();
            const charges = await this.getAll('charges');
            return charges.filter(charge => new Date(charge.date).toDateString() === today);
        } catch (error) {
            console.error('Erreur lors de la récupération des charges du jour:', error);
            return [];
        }
    }

    async getTotalChargesToday() {
        try {
            const todayCharges = await this.getTodayCharges();
            return todayCharges.reduce((total, charge) => total + (charge.amount || 0), 0);
        } catch (error) {
            console.error('Erreur lors du calcul du total des charges:', error);
            return 0;
        }
    }

    async getChargesByCategory(category) {
        try {
            const charges = await this.getAll('charges');
            return charges.filter(charge => charge.category === category);
        } catch (error) {
            console.error('Erreur lors de la récupération des charges par catégorie:', error);
            return [];
        }
    }

    async getChargesByDateRange(startDate, endDate) {
        try {
            const charges = await this.getAll('charges');
            const start = new Date(startDate);
            const end = new Date(endDate);
            return charges.filter(charge => {
                const chargeDate = new Date(charge.date);
                return chargeDate >= start && chargeDate <= end;
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des charges par période:', error);
            return [];
        }
    }

    async getMonthlyCharges() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const charges = await this.getAll('charges');
            return charges.filter(charge => {
                const chargeDate = new Date(charge.date);
                return chargeDate >= startOfMonth;
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des charges du mois:', error);
            return [];
        }
    }

    // ===== REQUÊTES SPÉCIFIQUES POUR LES STATISTIQUES =====
    async getTotalCustomers() {
        try {
            const customers = await this.getAll('customers');
            return customers.length;
        } catch (error) {
            console.error('Erreur lors du comptage des clients:', error);
            return 0;
        }
    }

    async getTotalProducts() {
        try {
            const products = await this.getAll('products');
            return products.length;
        } catch (error) {
            console.error('Erreur lors du comptage des produits:', error);
            return 0;
        }
    }

    async getTotalSuppliers() {
        try {
            const suppliers = await this.getAll('suppliers');
            return suppliers.length;
        } catch (error) {
            console.error('Erreur lors du comptage des fournisseurs:', error);
            return 0;
        }
    }

    async getTotalCharges() {
        try {
            const charges = await this.getAll('charges');
            return charges.length;
        } catch (error) {
            console.error('Erreur lors du comptage des charges:', error);
            return 0;
        }
    }

    async getTotalRevenue() {
        try {
            const sales = await this.getAll('sales');
            return sales.reduce((total, sale) => total + (sale.total || 0), 0);
        } catch (error) {
            console.error('Erreur lors du calcul du revenu total:', error);
            return 0;
        }
    }

    async getTotalProfit() {
        try {
            const sales = await this.getAll('sales');
            return sales.reduce((total, sale) => {
                const saleProfit = sale.items ? sale.items.reduce((sum, item) => sum + (item.profit || 0), 0) : 0;
                return total + saleProfit;
            }, 0);
        } catch (error) {
            console.error('Erreur lors du calcul du profit total:', error);
            return 0;
        }
    }

    async getInventoryValue() {
        try {
            const products = await this.getAll('products');
            return products.reduce((total, product) => total + ((product.priceSell || 0) * (product.currentStock || product.stock || 0)), 0);
        } catch (error) {
            console.error('Erreur lors du calcul de la valeur du stock:', error);
            return 0;
        }
    }

    async getDashboardStats() {
        try {
            const [
                totalCustomers,
                totalProducts,
                totalSuppliers,
                todaySales,
                activeCredits,
                inventoryValue,
                totalRevenue,
                totalProfit,
                totalCharges
            ] = await Promise.all([
                this.getTotalCustomers(),
                this.getTotalProducts(),
                this.getTotalSuppliers(),
                this.getTotalSalesToday(),
                this.getTotalActiveCredits(),
                this.getInventoryValue(),
                this.getTotalRevenue(),
                this.getTotalProfit(),
                this.getTotalCharges()
            ]);

            return {
                totalCustomers,
                totalProducts,
                totalSuppliers,
                todaySales,
                activeCredits,
                inventoryValue,
                totalRevenue,
                totalProfit,
                totalCharges
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des statistiques:', error);
            return {
                totalCustomers: 0,
                totalProducts: 0,
                totalSuppliers: 0,
                todaySales: 0,
                activeCredits: 0,
                inventoryValue: 0,
                totalRevenue: 0,
                totalProfit: 0,
                totalCharges: 0
            };
        }
    }
}

// Initialiser la base de données
const db = new MiniMarketDB();
window.minimarketDB = db;