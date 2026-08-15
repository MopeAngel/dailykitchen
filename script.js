/**
 * ============================================================================
 * HEALTHY RECIPE AI - JAVASCRIPT LOGIC ENGINE
 * Dataset: Terinspirasi dari Database Resep Sehat Teruji
 * Fitur: AI Ingredient Matcher, Dietary Filters, Portion Scaler, Cooking Timer,
 *        Saved Favorites (LocalStorage), dan AI Custom Recipe Generator.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------------
    // 1. DATASET RESEP SEHAT
    // ------------------------------------------------------------------------
    const initialRecipes = [
        {
            id: 'rec-1',
            title: 'Salad Dada Ayam Panggang & Quinoa Superfood',
            category: 'Tinggi Protein',
            dietTags: ['high-protein', 'low-calorie', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
            calories: 420,
            protein: 38,
            carbs: 32,
            fat: 14,
            prepTime: 20,
            difficulty: 'Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Salad sehat dengan dada ayam panggang herbal, quinoa tinggi serat, bayam segar, alpukat, dan roasted chickpeas.',
            aiReason: 'Kombinasi dada ayam dan quinoa memberikan profil asam amino lengkap untuk pemulihan otot dan stamina harian.',
            ingredients: [
                { name: 'Ayam', amount: 150, unit: 'gram (Dada Ayam)' },
                { name: 'Bayam', amount: 50, unit: 'gram' },
                { name: 'Alpukat', amount: 0.5, unit: 'buah' },
                { name: 'Bawang Putih', amount: 2, unit: 'siung' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdm' },
                { name: 'Tomat', amount: 1, unit: 'buah' },
                { name: 'Quinoa', amount: 60, unit: 'gram' }
            ],
            steps: [
                'Cuci bersih dada ayam, lumuri dengan bawang putih cincang, garam, lada, dan sedikit minyak zaitun.',
                'Panggang ayam di atas wajan anti-lengket selama 6-8 menit per sisi hingga matang kecokelatan.',
                'Rebus quinoa dengan rasio 1:2 air hingga mekar dan empuk (sekitar 12 menit).',
                'Potong-potong alpukat, tomat segar, dan cuci bayam organik.',
                'Campurkan seluruh bahan dalam bowl, tambahkan irisan ayam panggang di atasnya dan sajikan.'
            ]
        },
        {
            id: 'rec-2',
            title: 'Sup Bening Tahu Bayam & Wortel Organik',
            category: 'Rendah Kalori',
            dietTags: ['low-calorie', 'vegetarian', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
            calories: 180,
            protein: 16,
            carbs: 18,
            fat: 5,
            prepTime: 15,
            difficulty: 'Sangat Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Sup hangat bernutrisi tinggi dengan tahu sutra lembut, bayam hijau segar, wortel, dan kuah bening aromatik.',
            aiReason: 'Sangat rendah kalori namun kaya mikronutrisi, cocok untuk pencernaan sehat dan menu makan malam hemat kalori.',
            ingredients: [
                { name: 'Tahu', amount: 150, unit: 'gram (Tahu Sutra)' },
                { name: 'Bayam', amount: 100, unit: 'gram' },
                { name: 'Wortel', amount: 1, unit: 'batang' },
                { name: 'Bawang Putih', amount: 3, unit: 'siung' },
                { name: 'Bawang Merah', amount: 2, unit: 'siung' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdt' }
            ],
            steps: [
                'Tumis bawang putih dan bawang merah cincang halus dengan 1 sdt minyak zaitun hingga harum.',
                'Tuangkan 600ml air bersih, biarkan hingga mendidih.',
                'Masukkan irisan wortel dan tahu sutra potong dadu, masak selama 4 menit.',
                'Masukkan bayam segar di langkah terakhir, beri sedikit garam laut dan lada, aduk sebentar 1 menit lalu matikan api.'
            ]
        },
        {
            id: 'rec-3',
            title: 'Salmon Panggang Lemon & Brokoli Steamed',
            category: 'Keto / Low Carb',
            dietTags: ['keto', 'high-protein', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
            calories: 480,
            protein: 42,
            carbs: 10,
            fat: 28,
            prepTime: 20,
            difficulty: 'Sedang',
            nutriScore: 'Nutri-Score A',
            description: 'Fillet salmon segar panggang teflon dengan perasan lemon, disajikan bersama brokoli kukus renyah.',
            aiReason: 'Kaya akan lemak sehat Omega-3 dan protein berkualitas tinggi untuk mendukung gaya hidup Keto dan ketahanan jantung.',
            ingredients: [
                { name: 'Salmon', amount: 180, unit: 'gram (Fillet)' },
                { name: 'Brokoli', amount: 150, unit: 'gram' },
                { name: 'Lemon', amount: 1, unit: 'buah' },
                { name: 'Bawang Putih', amount: 2, unit: 'siung' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdm' },
                { name: 'Lada Hitam', amount: 1, unit: 'sdt' }
            ],
            steps: [
                'Keringkan fillet salmon dengan tisu dapur, marinasi dengan perasan lemon, bawang putih halus, lada hitam, dan garam.',
                'Panaskan minyak zaitun di pan anti-lengket, panggang salmon bagian kulit terlebih dahulu selama 4-5 menit.',
                'Balik salmon dan panggang sisi satunya selama 3-4 menit hingga matang sempurna.',
                'Kukus brokoli selama 4-5 menit agar tetap renyah dan hijau segar.',
                'Sajikan salmon bersama brokoli kukus dan garnish irisan lemon.'
            ]
        },
        {
            id: 'rec-4',
            title: 'Nasi Goreng Beras Merah Telur & Tempe Tumis',
            category: 'Seimbang Nutrisi',
            dietTags: ['high-protein', 'vegetarian'],
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
            calories: 390,
            protein: 24,
            carbs: 48,
            fat: 12,
            prepTime: 18,
            difficulty: 'Mudah',
            nutriScore: 'Nutri-Score B',
            description: 'Nasi goreng sehat menggunakan beras merah rendah indeks glikemik, telur ceplok air, tempe potong dadu, dan kecap low-sodium.',
            aiReason: 'Karbohidrat kompleks beras merah memberikan energi tahan lama tanpa lonjakan gula darah mendadak.',
            ingredients: [
                { name: 'Beras Merah', amount: 150, unit: 'gram (Nasi Merah)' },
                { name: 'Telur', amount: 2, unit: 'butir' },
                { name: 'Tempe', amount: 75, unit: 'gram' },
                { name: 'Bawang Putih', amount: 2, unit: 'siung' },
                { name: 'Bawang Merah', amount: 3, unit: 'siung' },
                { name: 'Cabai', amount: 2, unit: 'buah' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdm' }
            ],
            steps: [
                'Potong dadu tempe kecil-kecil, tumis hingga setengah matang dengan sedikit minyak zaitun.',
                'Haluskan bawang putih, bawang merah, dan cabai.',
                'Tumis bumbu halus di wajan hingga wangi, masukkan 1 butir telur acak-acak.',
                'Masukkan nasi merah dingin dan tempe, tambahkan 1 sdm kecap manis rendah natrium.',
                'Buat telur ceplok/poached egg dengan butir telur sisanya sebagai topping.'
            ]
        },
        {
            id: 'rec-5',
            title: 'Tumis Tempe Brokoli & Tahu Saus Wijen',
            category: 'Vegetarian',
            dietTags: ['vegetarian', 'low-calorie', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
            calories: 290,
            protein: 22,
            carbs: 24,
            fat: 13,
            prepTime: 15,
            difficulty: 'Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Kombinasi protein nabati dari tempe dan tahu yang ditumis bersama brokoli renyah dan minyak wijen aromatik.',
            aiReason: 'Sumber isoflavon dan serat nabati yang mendukung kesehatan pencernaan serta mengontrol kolesterol.',
            ingredients: [
                { name: 'Tempe', amount: 100, unit: 'gram' },
                { name: 'Tahu', amount: 100, unit: 'gram' },
                { name: 'Brokoli', amount: 120, unit: 'gram' },
                { name: 'Bawang Putih', amount: 3, unit: 'siung' },
                { name: 'Wijen', amount: 1, unit: 'sdt' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdm' }
            ],
            steps: [
                'Potong tempe dan tahu berbentuk kubus kecil.',
                'Potong brokoli per kuntum, cuci dengan air garam ringan.',
                'Tumis bawang putih cincang hingga harum, masukkan tempe dan tahu.',
                'Tambahkan brokoli dan sedikit air, tutup wajan selama 2 menit.',
                'Beri saus tiram low-sodium dan minyak wijen sebelum diangkat.'
            ]
        },
        {
            id: 'rec-6',
            title: 'Oatmeal Kayu Manis, Apel & Biji Chia',
            category: 'Sarapan Sehat',
            dietTags: ['low-calorie', 'vegetarian', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80',
            calories: 260,
            protein: 10,
            carbs: 45,
            fat: 6,
            prepTime: 10,
            difficulty: 'Sangat Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Oatmeal masak hangat dengan taburan kayu manis, irisan apel segar, dan biji chia kaya antioksidan.',
            aiReason: 'Kandungan beta-glukan pada oatmeal terbukti efektif menjaga kestabilan kadar kolesterol darah.',
            ingredients: [
                { name: 'Oatmeal', amount: 50, unit: 'gram (Rolled Oats)' },
                { name: 'Apel', amount: 1, unit: 'buah' },
                { name: 'Susu', amount: 200, unit: 'ml (Low Fat)' },
                { name: 'Kayu Manis', amount: 0.5, unit: 'sdt' },
                { name: 'Madu', amount: 1, unit: 'sdt' }
            ],
            steps: [
                'Rebus rolled oats bersama susu low-fat di atas api kecil selama 5 menit hingga mengental.',
                'Potong apel merah menjadi dadu kecil.',
                'Tuang oatmeal ke dalam mangkuk, tambahkan bubuk kayu manis dan sedikit madu murni.',
                'Toping dengan dadu apel segar dan sajikan hangat.'
            ]
        },
        {
            id: 'rec-7',
            title: 'Sup Daging Sapi Wortel & Kentang',
            category: 'Tinggi Protein',
            dietTags: ['high-protein', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
            calories: 380,
            protein: 34,
            carbs: 28,
            fat: 12,
            prepTime: 25,
            difficulty: 'Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Sup kaldu daging sapi hangat yang kaya protein dengan potongan wortel dan kentang sebagai sumber karbohidrat sehat.',
            aiReason: 'Kombinasi asam amino dari daging sapi dan kalium tinggi dari kentang ideal untuk pemulihan energi dan hidrasi sel tubuh.',
            ingredients: [
                { name: 'Daging Sapi', amount: 150, unit: 'gram' },
                { name: 'Wortel', amount: 1, unit: 'batang' },
                { name: 'Kentang', amount: 100, unit: 'gram' },
                { name: 'Bawang Putih', amount: 3, unit: 'siung' },
                { name: 'Bawang Merah', amount: 2, unit: 'siung' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdt' }
            ],
            steps: [
                'Potong daging sapi berbentuk dadu kecil, rebus dalam 800ml air selama 15 menit untuk membuat kaldu.',
                'Potong wortel dan kentang sesuai selera, bersihkan.',
                'Tumis bawang merah dan bawang putih cincang dengan 1 sdt minyak zaitun hingga wangi, lalu masukkan ke dalam panci kaldu.',
                'Masukkan kentang dan wortel ke panci, rebus hingga empuk selama 8 menit.',
                'Tambahkan sedikit garam laut, lada, dan irisan seledri. Sajikan hangat.'
            ]
        },
        {
            id: 'rec-8',
            title: 'Salmon Madu Lemon & Brokoli Panggang',
            category: 'Keto / Low Carb',
            dietTags: ['keto', 'high-protein', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
            calories: 460,
            protein: 38,
            carbs: 12,
            fat: 26,
            prepTime: 18,
            difficulty: 'Sedang',
            nutriScore: 'Nutri-Score A',
            description: 'Fillet salmon premium dipanggang dengan saus madu lemon rendah kalori, disajikan bersama kuntum brokoli renyah.',
            aiReason: 'Kaya asam lemak omega-3 yang membantu melancarkan sirkulasi darah serta antioksidan brokoli untuk imunitas.',
            ingredients: [
                { name: 'Salmon', amount: 180, unit: 'gram (Fillet)' },
                { name: 'Lemon', amount: 1, unit: 'buah' },
                { name: 'Madu', amount: 1, unit: 'sdt' },
                { name: 'Brokoli', amount: 120, unit: 'gram' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdm' }
            ],
            steps: [
                'Lumuri salmon dengan perasan lemon segar, garam, dan lada hitam secukupnya.',
                'Campurkan 1 sdt madu murni dengan 1 sdt minyak zaitun sebagai glazir.',
                'Panggang salmon di pan selama 4 menit per sisi, oleskan campuran madu menjelang matang.',
                'Kukus brokoli sebentar selama 4 menit, lalu sajikan bersama salmon panggang madu lemon.'
            ]
        },
        {
            id: 'rec-9',
            title: 'Tumis Udang Jamur & Brokoli Sehat',
            category: 'Rendah Kalori',
            dietTags: ['low-calorie', 'high-protein'],
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
            calories: 240,
            protein: 26,
            carbs: 14,
            fat: 8,
            prepTime: 15,
            difficulty: 'Sangat Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Kombinasi udang segar yang gurih ditumis cepat dengan jamur kancing kenyal dan brokoli kaya serat.',
            aiReason: 'Sangat rendah kalori namun tinggi protein dan mikronutrisi penting untuk pembakaran lemak aktif.',
            ingredients: [
                { name: 'Udang', amount: 120, unit: 'gram' },
                { name: 'Jamur', amount: 80, unit: 'gram (Jamur Kancing)' },
                { name: 'Brokoli', amount: 100, unit: 'gram' },
                { name: 'Bawang Putih', amount: 3, unit: 'siung' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdm' }
            ],
            steps: [
                'Bersihkan udang (buang kulit dan kotoran punggungnya). Iris tipis jamur kancing.',
                'Tumis bawang putih cincang dengan minyak zaitun hingga kekuningan.',
                'Masukkan udang, tumis hingga warnanya berubah kemerahan (sekitar 2 menit).',
                'Masukkan brokoli dan jamur, tambahkan 2 sendok air, tutup wajan selama 2 menit.',
                'Bumbui sedikit dengan lada putih dan kecap rendah sodium sebelum diangkat.'
            ]
        },
        {
            id: 'rec-10',
            title: 'Omelet Telur Keju & Bayam Organik',
            category: 'Keto / Low Carb',
            dietTags: ['keto', 'high-protein', 'vegetarian'],
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
            calories: 310,
            protein: 22,
            carbs: 4,
            fat: 20,
            prepTime: 10,
            difficulty: 'Sangat Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Telur dadar tebal bergaya lipat yang berisi bayam organik cincang dan taburan keju rendah lemak gurih.',
            aiReason: 'Menu sarapan protein tinggi bebas karbohidrat untuk merangsang metabolisme di pagi hari.',
            ingredients: [
                { name: 'Telur', amount: 2, unit: 'butir' },
                { name: 'Bayam', amount: 50, unit: 'gram' },
                { name: 'Keju', amount: 30, unit: 'gram (Low Fat)' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdt' },
                { name: 'Bawang Merah', amount: 2, unit: 'siung' }
            ],
            steps: [
                'Kocok telur bersama sejumput garam laut and lada putih.',
                'Tumis bawang merah dan bayam cincang kasar di pan dengan minyak zaitun selama 1 menit hingga layu.',
                'Tuangkan kocokan telur secara merata menutupi bayam.',
                'Taburkan keju parut di atasnya, lalu lipat omelet menjadi setengah lingkaran saat hampir matang.'
            ]
        },
        {
            id: 'rec-11',
            title: 'Salad Alpukat Tomat & Salad Dressing Lemon',
            category: 'Rendah Kalori',
            dietTags: ['vegetarian', 'low-calorie', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
            calories: 220,
            protein: 4,
            carbs: 16,
            fat: 16,
            prepTime: 10,
            difficulty: 'Sangat Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Potongan alpukat mentega yang lembut dipadukan dengan tomat ceri manis dan dressing minyak zaitun perasan lemon.',
            aiReason: 'Kombinasi lemak tak jenuh tunggal alpukat meningkatkan penyerapan likopen antioksidan dari tomat ceri.',
            ingredients: [
                { name: 'Alpukat', amount: 1, unit: 'buah' },
                { name: 'Tomat', amount: 100, unit: 'gram (Tomat Ceri)' },
                { name: 'Lemon', amount: 0.5, unit: 'buah' },
                { name: 'Minyak Zaitun', amount: 1, unit: 'sdm' },
                { name: 'Madu', amount: 1, unit: 'sdt' }
            ],
            steps: [
                'Kupas alpukat, potong dadu ukuran sedang.',
                'Potong tomat ceri menjadi dua bagian.',
                'Campurkan perasan lemon, minyak zaitun, dan madu murni di mangkuk kecil sebagai saus dressing.',
                'Satukan alpukat dan tomat ceri di salad bowl, tuangkan dressing di atasnya lalu aduk perlahan agar alpukat tidak hancur.'
            ]
        },
        {
            id: 'rec-12',
            title: 'Sup Tahu Jamur Bening & Wortel',
            category: 'Sarapan Sehat',
            dietTags: ['low-calorie', 'vegetarian', 'gluten-free'],
            image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80',
            calories: 160,
            protein: 12,
            carbs: 18,
            fat: 4,
            prepTime: 12,
            difficulty: 'Sangat Mudah',
            nutriScore: 'Nutri-Score A',
            description: 'Sup vegetarian hangat berkuah bening aromatik berisi potongan tahu sutra, jamur shimeji/kancing, dan wortel manis.',
            aiReason: 'Sangat ringan dicerna namun kaya beta-karoten wortel untuk kesehatan penglihatan serta imunitas seluler.',
            ingredients: [
                { name: 'Tahu', amount: 150, unit: 'gram (Tahu Sutra)' },
                { name: 'Jamur', amount: 80, unit: 'gram' },
                { name: 'Wortel', amount: 1, unit: 'batang' },
                { name: 'Bawang Putih', amount: 2, unit: 'siung' },
                { name: 'Bawang Merah', amount: 2, unit: 'siung' }
            ],
            steps: [
                'Tumis bawang merah dan bawang putih cincang dengan sedikit air atau 1/2 sdt minyak zaitun.',
                'Tuang 600ml air, masukkan wortel iris bundar dan biarkan mendidih selama 4 menit.',
                'Masukkan jamur dan tahu sutra potong dadu, rebus kembali selama 3 menit.',
                'Tambahkan kaldu jamur bubuk, garam, lada bubuk, dan taburan daun bawang menjelang matang.'
            ]
        }
    ];

    // Master Ingredients List for Quick Select Chips
    const popularIngredients = [
        { name: 'Ayam', icon: 'fa-drumstick-bite', color: 'text-warning' },
        { name: 'Telur', icon: 'fa-egg', color: 'text-warning' },
        { name: 'Bayam', icon: 'fa-seedling', color: 'text-success' },
        { name: 'Tahu', icon: 'fa-cube', color: 'text-secondary' },
        { name: 'Tempe', icon: 'fa-cubes', color: 'text-warning' },
        { name: 'Tomat', icon: 'fa-apple-whole', color: 'text-danger' },
        { name: 'Brokoli', icon: 'fa-tree', color: 'text-success' },
        { name: 'Bawang Putih', icon: 'fa-disease', color: 'text-secondary' },
        { name: 'Salmon', icon: 'fa-fish', color: 'text-info' },
        { name: 'Alpukat', icon: 'fa-lemon', color: 'text-success' },
        { name: 'Wortel', icon: 'fa-carrot', color: 'text-warning' },
        { name: 'Beras Merah', icon: 'fa-bowl-rice', color: 'text-danger' },
        { name: 'Oatmeal', icon: 'fa-wheat-awn', color: 'text-warning' },
        { name: 'Jamur', icon: 'fa-seedling', color: 'text-secondary' },
        { name: 'Keju', icon: 'fa-cheese', color: 'text-warning' },
        { name: 'Udang', icon: 'fa-fish', color: 'text-danger' },
        { name: 'Kentang', icon: 'fa-circle', color: 'text-warning' },
        { name: 'Lemon', icon: 'fa-lemon', color: 'text-warning' },
        { name: 'Daging Sapi', icon: 'fa-drumstick-bite', color: 'text-danger' },
        { name: 'Susu', icon: 'fa-glass-water', color: 'text-info' },
        { name: 'Biji Chia', icon: 'fa-seedling', color: 'text-success' },
        { name: 'Madu', icon: 'fa-cube', color: 'text-warning' },
        { name: 'Apel', icon: 'fa-apple-whole', color: 'text-danger' },
        { name: 'Bawang Merah', icon: 'fa-circle', color: 'text-danger' },
        { name: 'Cabai', icon: 'fa-pepper-hot', color: 'text-danger' },
        { name: 'Quinoa', icon: 'fa-wheat-awn', color: 'text-warning' }
    ];

    // ------------------------------------------------------------------------
    // 2. STATE MANAGEMENT
    // ------------------------------------------------------------------------
    let recipes = [...initialRecipes];
    let selectedIngredients = new Set();
    let currentDietFilter = 'all';
    let currentSort = 'match';
    
    // Auth and Favorites State
    let currentUser = null;
    let savedRecipes = [];
    
    let currentModalRecipe = null;
    let currentPortion = 1;

    // Timer State
    let timerInterval = null;
    let timerRemainingSeconds = 300; // default 5 minutes
    let isTimerRunning = false;

    // ------------------------------------------------------------------------
    // 3. DOM ELEMENTS
    // ------------------------------------------------------------------------
    const quickChipsContainer = document.getElementById('quick-chips-container');
    const activeChipsContainer = document.getElementById('active-chips-container');
    const selectedCountBadge = document.getElementById('selected-count');
    const ingredientInput = document.getElementById('ingredient-input');
    const btnAddIngredient = document.getElementById('btn-add-ingredient');
    const btnClearAll = document.getElementById('btn-clear-all-ingredients');
    const recipeGrid = document.getElementById('recipe-grid');
    const sortSelect = document.getElementById('sort-select');
    const favoritesListContainer = document.getElementById('favorites-list-container');
    
    // Auth Elements
    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view');
    const userProfilePicContainer = document.getElementById('user-profile-pic-container');
    const userNameDisplay = document.getElementById('user-name');
    const btnLogout = document.getElementById('btn-logout');
    const favoritesMessage = document.getElementById('favorites-message');
    const localLoginForm = document.getElementById('local-login-form');

    // Modal Elements
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalNutriScore = document.getElementById('modal-nutri-score');
    const modalImg = document.getElementById('modal-img');
    const modalPrepTime = document.getElementById('modal-prep-time');
    const modalDifficulty = document.getElementById('modal-difficulty');
    const modalCal = document.getElementById('modal-cal');
    const modalProtein = document.getElementById('modal-protein');
    const modalCarbs = document.getElementById('modal-carbs');
    const modalFat = document.getElementById('modal-fat');
    const modalAiReason = document.getElementById('modal-ai-reason');
    const modalDesc = document.getElementById('modal-desc');
    const modalIngredientsList = document.getElementById('modal-ingredients-list');
    const modalStepsList = document.getElementById('modal-steps-list');
    const modalBtnFavorite = document.getElementById('modal-btn-favorite');

    // Timer Elements
    const timerClock = document.getElementById('timer-clock');
    const btnTimerStart = document.getElementById('btn-timer-start');
    const btnTimerPause = document.getElementById('btn-timer-pause');
    const btnTimerReset = document.getElementById('btn-timer-reset');

    // AI Generator Form
    const aiGeneratorForm = document.getElementById('ai-generator-form');
    const aiCalRange = document.getElementById('ai-cal-range');
    const aiCalDisplay = document.getElementById('ai-cal-display');

    // ------------------------------------------------------------------------
    // 4. INITIALIZATION & EVENT LISTENERS
    // ------------------------------------------------------------------------
    function init() {
        renderPopularChips();
        updateActiveChipsUI();
        
        // Restore session if exists
        const savedSession = sessionStorage.getItem('healthy_recipe_session');
        if (savedSession) {
            currentUser = JSON.parse(savedSession);
            handleLoginState();
        }
        
        // Setup Auth Listeners
        if (btnLogout) {
            btnLogout.addEventListener('click', handleLogout);
        }
        if (localLoginForm) {
            localLoginForm.addEventListener('submit', handleLocalLogin);
        }
        
        renderRecipes();
        setupEventListeners();
        initIntersectionObserver();
    }

    function initIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.fade-in-section').forEach(sec => {
            observer.observe(sec);
        });
    }

    function setupEventListeners() {
        // Add custom ingredient input
        btnAddIngredient.addEventListener('click', handleAddCustomIngredient);
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddCustomIngredient();
        });

        // Clear all ingredients
        btnClearAll.addEventListener('click', () => {
            selectedIngredients.clear();
            updateActiveChipsUI();
            renderPopularChips();
            renderRecipes();
        });

        // Diet filter buttons
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDietFilter = btn.dataset.filter;
                renderRecipes();
            });
        });

        // Sorting select
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderRecipes();
        });

        // Portion Scaler Buttons in Modal
        document.querySelectorAll('.portion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.portion-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPortion = parseInt(btn.dataset.portion, 10);
                if (currentModalRecipe) {
                    updateModalPortionValues(currentModalRecipe, currentPortion);
                }
            });
        });

        // Timer Preset Buttons
        document.querySelectorAll('.btn-preset-timer').forEach(btn => {
            btn.addEventListener('click', () => {
                const sec = parseInt(btn.dataset.seconds, 10);
                resetTimer(sec);
            });
        });

        // Timer Controls
        btnTimerStart.addEventListener('click', startTimer);
        btnTimerPause.addEventListener('click', pauseTimer);
        btnTimerReset.addEventListener('click', () => resetTimer(300));

        // AI Calorie Range Slider
        aiCalRange.addEventListener('input', (e) => {
            aiCalDisplay.textContent = `${e.target.value} kkal`;
        });

        // AI Generator Form Submit
        aiGeneratorForm.addEventListener('submit', handleAIGeneratorSubmit);

        // Modal Favorite Button toggle
        modalBtnFavorite.addEventListener('click', () => {
            if (currentModalRecipe) {
                toggleFavorite(currentModalRecipe.id);
                updateModalFavoriteBtnState(currentModalRecipe.id);
            }
        });

        // AI Chat Form submit listener
        const aiChatForm = document.getElementById('ai-chat-form');
        if (aiChatForm) {
            aiChatForm.addEventListener('submit', handleAIChatSubmit);
        }

        // Chat Input Enter Key
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (aiChatForm) aiChatForm.dispatchEvent(new Event('submit'));
                }
            });
        }

        // Clear Chat Button
        const btnClearChat = document.getElementById('btn-clear-chat');
        if (btnClearChat) {
            btnClearChat.addEventListener('click', () => {
                const chatMessages = document.getElementById('chat-messages-container');
                if (chatMessages) {
                    const firstMsg = chatMessages.firstElementChild;
                    chatMessages.innerHTML = '';
                    if (firstMsg) chatMessages.appendChild(firstMsg);

                    const resultContainer = document.getElementById('ai-generated-result-container');
                    if (resultContainer) resultContainer.classList.add('d-none');

                    // Remove chat-originated AI recipes from the recipe grid
                    const beforeCount = recipes.length;
                    for (let i = recipes.length - 1; i >= 0; i--) {
                        if (recipes[i]._fromChat) recipes.splice(i, 1);
                    }
                    if (recipes.length !== beforeCount) renderRecipes();
                }
            });
        }

        // Scroll to Top Button
        const btnBackToTop = document.getElementById('btn-back-to-top');
        if (btnBackToTop) {
            btnBackToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Quick chat prompt buttons listener
        document.querySelectorAll('.btn-quick-chat').forEach(btn => {
            btn.addEventListener('click', () => {
                const ings = btn.dataset.ingredients;
                if (ings) {
                    // Pre-populate the chat input with ingredients format
                    const chatInput = document.getElementById('chat-input');
                    if (chatInput) chatInput.value = `Ingredients: ${ings}`;
                    processChatIngredients(`Ingredients: ${ings}`);
                }
            });
        });

        // Navbar Scroll Spy for smooth active state
        window.addEventListener('scroll', handleNavScrollSpy);
        
        // Global Event Delegation for Dynamic Elements
        document.addEventListener('click', (e) => {
            const btnFav = e.target.closest('.favorite-card-btn');
            if (btnFav) {
                e.stopPropagation();
                toggleFavorite(btnFav.dataset.id);
                return;
            }
            
            const btnRemove = e.target.closest('.btn-remove-fav');
            if (btnRemove) {
                e.stopPropagation();
                toggleFavorite(btnRemove.dataset.id);
                return;
            }
            
            const btnDetail = e.target.closest('.btn-open-detail');
            if (btnDetail) {
                e.stopPropagation();
                openRecipeModal(btnDetail.dataset.id);
                return;
            }
        });
    }

    // ------------------------------------------------------------------------
    // 4b. AI CHAT ASSISTANT INTERACTION
    // ------------------------------------------------------------------------
    function handleAIChatSubmit(e) {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input');
        let text = chatInput ? chatInput.value.trim() : '';
        if (!text) {
            if (chatInput) {
                chatInput.classList.add('shake-invalid');
                setTimeout(() => chatInput.classList.remove('shake-invalid'), 400);
            }
            return;
        }

        processChatIngredients(text);
        if (chatInput) chatInput.value = '';
    }

    // ── Chat input parser ─────────────────────────────────────────────────────
    /**
     * Parse the user's free-text chat message into three structured fields.
     * Supports multiple formats:
     *   - "Bahan: egg, spinach. Alergi: peanuts. Request: no fried food"
     *   - "I have egg, spinach, cheese. Allergic to peanuts. No deep fried food please"
     *   - Plain text: "egg spinach cheese" (treated as ingredients only)
     *
     * Returns: { ingredients: string[], allergies: string[], specialRequests: string }
     */
    function parseChatInput(text) {
        const t = text.trim();

        // Patterns to locate each field (case-insensitive, works in Indonesian & English)
        const ingPatterns   = /(?:bahan[- :]+|ingredients?[: ]+|i have[: ]+|saya punya[: ]+)/i;
        const allergyPatterns = /(?:alergi[: ]+|allergic to[: ]+|allerg(?:y|ies)[: ]+|pantang[: ]+)/i;
        const requestPatterns = /(?:request[: ]+|permintaan[: ]+|special request[: ]+|preferensi[: ]+|i want[: ]+|please[: ]+)/i;

        // Split text into segments at each keyword boundary
        const segments = t
            .split(/(?=(?:bahan|ingredients?|i have|saya punya|alergi|allergic to|allerg(?:y|ies)|pantang|request|permintaan|special request|preferensi)\b)/i)
            .map(s => s.trim())
            .filter(Boolean);

        let ingredientsRaw = '';
        let allergiesRaw = '';
        let specialRaw = '';

        segments.forEach(seg => {
            if (ingPatterns.test(seg)) {
                ingredientsRaw += ' ' + seg.replace(ingPatterns, '').replace(/\.\s*$/, '').trim();
            } else if (allergyPatterns.test(seg)) {
                allergiesRaw += ' ' + seg.replace(allergyPatterns, '').replace(/\.\s*$/, '').trim();
            } else if (requestPatterns.test(seg)) {
                specialRaw += ' ' + seg.replace(requestPatterns, '').replace(/\.\s*$/, '').trim();
            } else if (!ingredientsRaw && !allergiesRaw && !specialRaw) {
                // No keyword found anywhere → treat entire input as ingredients
                ingredientsRaw = seg;
            }
        });

        // If no keyword-based parsing succeeded, treat entire text as ingredients
        if (!ingredientsRaw && !allergiesRaw && !specialRaw) {
            ingredientsRaw = t;
        }

        // Split ingredients and allergies on commas, semicolons, "and", "dan"
        const splitItems = str => str
            .split(/[,;]| and | dan /i)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        return {
            ingredients:    ingredientsRaw   ? splitItems(ingredientsRaw)   : [],
            allergies:      allergiesRaw     ? splitItems(allergiesRaw)     : [],
            specialRequests: specialRaw.trim(),
        };
    }

    // ── Main chat processing function ─────────────────────────────────────────
    async function processChatIngredients(inputString) {
        const chatMessages = document.getElementById('chat-messages-container');
        if (!chatMessages) return;

        // ── 1. Render user message bubble ───────────────────────────────────────
        const userDiv = document.createElement('div');
        userDiv.className = 'd-flex align-items-start justify-content-end gap-3 mb-3 chat-bubble-animate';
        userDiv.innerHTML = `
            <div class="p-3 rounded-4 bg-orange-accent text-white max-w-75 shadow-sm">
                <p class="mb-0 fw-medium fs-6">${inputString}</p>
            </div>
            <div class="rounded-circle bg-orange-subtle border border-orange-accent p-2 text-orange-accent flex-shrink-0" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-user"></i>
            </div>
        `;
        chatMessages.appendChild(userDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // ── 2. Parse the user's message into three structured fields ─────────────
        const parsed = parseChatInput(inputString);

        // Sync selected ingredient chips with parsed ingredients
        const lowerInput = inputString.toLowerCase();
        parsed.ingredients.forEach(ing => selectedIngredients.add(ing.toLowerCase()));
        popularIngredients.forEach(item => {
            if (lowerInput.includes(item.name.toLowerCase())) {
                selectedIngredients.add(item.name.toLowerCase());
            }
        });
        // Also merge any chips already selected in the UI
        if (selectedIngredients.size > 0 && parsed.ingredients.length === 0) {
            parsed.ingredients = Array.from(selectedIngredients);
        }
        renderPopularChips();
        updateActiveChipsUI();

        // ── 3. Show AI typing indicator with parsed preview ──────────────────────
        const typingDiv = document.createElement('div');
        typingDiv.className = 'd-flex align-items-start gap-3 mb-3';
        typingDiv.innerHTML = `
            <div class="rounded-circle bg-emerald-subtle border border-emerald p-2 text-emerald flex-shrink-0"
                style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="p-3 rounded-4 bg-dark-glass border border-secondary text-white" style="max-width: 85%;">
                <p class="mb-2 fs-7 text-light-muted d-flex align-items-center gap-2">
                    <span class="spinner-grow spinner-grow-sm text-emerald" role="status"></span>
                    <strong>Searching 64,000+ recipes from Kaggle dataset...</strong>
                </p>
                <div class="fs-8 text-light-muted">
                    ${parsed.ingredients.length  ? `<span class="badge bg-emerald-subtle text-emerald me-1 mb-1"><i class="fa-solid fa-carrot me-1"></i>${parsed.ingredients.join(', ')}</span>` : ''}
                    ${parsed.allergies.length     ? `<span class="badge bg-danger-subtle text-danger me-1 mb-1"><i class="fa-solid fa-ban me-1"></i>No: ${parsed.allergies.join(', ')}</span>` : ''}
                    ${parsed.specialRequests      ? `<span class="badge bg-info-subtle text-info me-1 mb-1"><i class="fa-solid fa-sliders me-1"></i>${parsed.specialRequests}</span>` : ''}
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // ── 4. Call the real AI backend ───────────────────────────────────────────
        let aiResult = null;
        let backendError = null;

        try {
            if (typeof fetchAIRecipesFromBackend === 'function') {
                aiResult = await fetchAIRecipesFromBackend({
                    ingredients:    parsed.ingredients,
                    allergies:      parsed.allergies,
                    specialRequests: parsed.specialRequests,
                });
            } else {
                throw new Error('apiService.js not loaded.');
            }
        } catch (err) {
            console.error('[Chat] Backend error:', err);
            backendError = err.message;
        }

        // Remove typing indicator
        typingDiv.remove();

        // ── 5. Handle error state ─────────────────────────────────────────────────
        if (backendError || !aiResult || !aiResult.recipes || aiResult.recipes.length === 0) {
            const errDiv = document.createElement('div');
            errDiv.className = 'd-flex align-items-start gap-3 mb-4 chat-bubble-animate';
            const errMsg = backendError || 'No recipes found matching your criteria. Try different ingredients or fewer restrictions.';
            errDiv.innerHTML = `
                <div class="rounded-circle bg-emerald-subtle border border-emerald p-2 text-emerald flex-shrink-0"
                    style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-robot fs-5"></i>
                </div>
                <div class="p-3 p-md-4 rounded-4 bg-dark-glass border border-danger border-opacity-30 text-white" style="max-width: 85%;">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="fa-solid fa-triangle-exclamation text-warning"></i>
                        <span class="fw-bold text-warning">Could Not Find Recipes</span>
                    </div>
                    <p class="mb-2 fs-7 text-light">${errMsg}</p>
                    <p class="mb-0 fs-8 text-light-muted">
                        <i class="fa-solid fa-circle-info me-1"></i>
                        Make sure <code>python app.py</code> is running, then set your 
                        <code>OPENAI_API_KEY</code> in <code>.env</code>.
                    </p>
                </div>
            `;
            chatMessages.appendChild(errDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return;
        }

        const { recipes: aiRecipes, totalCandidates, aiUsed } = aiResult;

        // ── 6. Add AI recipes to the main recipe grid ─────────────────────────────
        // Mark chat-originated recipes so clear-chat can remove them from grid later
        const chatRecipeIds = [];
        aiRecipes.forEach(rec => {
            rec._fromChat = true; // marker for clearing
            chatRecipeIds.push(rec.id);
            // Remove any existing recipe with the same id to avoid duplicates
            const existingIdx = recipes.findIndex(r => r.id === rec.id);
            if (existingIdx > -1) recipes.splice(existingIdx, 1);
            recipes.unshift(rec);
        });
        renderRecipes();

        // ── 7. Render AI response bubble in chat ──────────────────────────────────
        const topRecipe = aiRecipes[0];
        const aiSourceLabel = aiUsed
            ? '<i class="fa-solid fa-robot me-1"></i> OpenAI + Kaggle 64k Dataset'
            : '<i class="fa-solid fa-database me-1"></i> Kaggle 64k Dataset';
        const aiSourceClass = aiUsed ? 'bg-success text-white' : 'bg-info-subtle text-info';

        const aiDiv = document.createElement('div');
        aiDiv.className = 'd-flex align-items-start gap-3 mb-4 chat-bubble-animate';

        // Build mini recipe card HTML for each recommendation
        function buildMiniRecipeCard(rec, rank) {
            const matchColor = rec.matchPercent >= 80 ? 'text-emerald'
                : rec.matchPercent >= 50 ? 'text-warning' : 'text-danger';
            const missingHtml = rec.missingIngredients && rec.missingIngredients.length > 0
                ? `<div class="mt-2 p-2 rounded-3 bg-dark border border-warning border-opacity-25 fs-8">
                    <i class="fa-solid fa-cart-plus text-warning me-1"></i>
                    <span class="text-warning fw-semibold">Still need:</span>
                    <span class="text-light-muted">${rec.missingIngredients.slice(0, 4).join(', ')}
                    ${rec.missingCount > 4 ? `<em>+${rec.missingCount - 4} more</em>` : ''}</span>
                   </div>`
                : '';
            const aiReasonHtml = rec.aiReason
                ? `<div class="mt-2 p-2 rounded-3 bg-emerald-dark-glass border border-emerald border-opacity-20 fs-8">
                    <i class="fa-solid fa-lightbulb text-emerald me-1"></i>
                    <span class="text-light-muted fst-italic">${rec.aiReason}</span>
                   </div>`
                : '';

            return `
            <div class="chat-recipe-card mb-3 p-3 rounded-4 bg-dark border border-secondary">
                <div class="d-flex align-items-start gap-3">
                    <img src="${rec.image}" alt="${rec.title}"
                        class="rounded-3 object-fit-cover flex-shrink-0"
                        style="width:72px; height:72px;"
                        onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80'">
                    <div class="flex-grow-1 min-width-0">
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <span class="badge bg-dark text-white border border-secondary rounded-pill px-2 py-1 fs-8">
                                #${rank}
                            </span>
                            <span class="fw-bold ${matchColor} fs-8">
                                <i class="fa-solid fa-bullseye me-1"></i>${rec.matchPercent}% Match
                            </span>
                            ${rec.prepTime ? `<span class="text-muted fs-8"><i class="fa-regular fa-clock me-1"></i>${rec.prepTime} min</span>` : ''}
                            ${rec.calories ? `<span class="text-muted fs-8"><i class="fa-solid fa-fire me-1 text-orange-accent"></i>${rec.calories} kcal</span>` : ''}
                        </div>
                        <h6 class="fw-bold text-white mb-1 fs-7" style="line-height:1.3;">${rec.title}</h6>
                        ${rec.category ? `<span class="badge bg-emerald-subtle text-emerald border border-emerald fs-8 mb-1">${rec.category}</span>` : ''}
                        ${missingHtml}
                        ${aiReasonHtml}
                        <div class="mt-2">
                            <button class="btn btn-sm btn-emerald rounded-pill px-3 fs-8 btn-chat-recipe-modal"
                                data-id="${rec.id}">
                                <i class="fa-solid fa-book-open me-1"></i> View Full Recipe
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        aiDiv.innerHTML = `
            <div class="rounded-circle bg-emerald-subtle border border-emerald p-2 text-emerald flex-shrink-0"
                style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-robot fs-5"></i>
            </div>
            <div class="p-3 p-md-4 rounded-4 bg-dark-glass border border-emerald border-opacity-30 text-white shadow-sm"
                style="max-width: 90%; width: 100%;">

                <!-- Header -->
                <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <span class="badge bg-emerald text-dark fw-bold px-3 py-1 rounded-pill">
                        <i class="fa-solid fa-wand-magic-sparkles me-1"></i>
                        ${aiRecipes.length} Recipe${aiRecipes.length > 1 ? 's' : ''} Found
                    </span>
                    <span class="badge ${aiSourceClass} border border-secondary px-3 py-1 rounded-pill fs-8">
                        ${aiSourceLabel}
                    </span>
                </div>

                <!-- Context summary -->
                <div class="mb-3 p-2 rounded-3 bg-dark border border-secondary fs-8">
                    ${parsed.ingredients.length  ? `<div><i class="fa-solid fa-carrot text-warning me-1"></i> <span class="text-muted">Ingredients:</span> ${parsed.ingredients.join(', ')}</div>` : ''}
                    ${parsed.allergies.length     ? `<div><i class="fa-solid fa-ban text-danger me-1"></i> <span class="text-muted">Excluded:</span> ${parsed.allergies.join(', ')}</div>` : ''}
                    ${parsed.specialRequests      ? `<div><i class="fa-solid fa-sliders text-info me-1"></i> <span class="text-muted">Request:</span> ${parsed.specialRequests}</div>` : ''}
                    <div class="text-muted mt-1">
                        <i class="fa-solid fa-database me-1 text-emerald"></i>
                        Filtered from <strong class="text-emerald">${(totalCandidates || 0).toLocaleString()}</strong> Kaggle recipes
                    </div>
                </div>

                <!-- Recipe cards -->
                <div id="chat-recipe-cards-${Date.now()}" class="chat-recipe-list">
                    ${aiRecipes.map((rec, i) => buildMiniRecipeCard(rec, i + 1)).join('')}
                </div>

                <p class="text-light-muted fs-8 mt-3 mb-0">
                    <i class="fa-solid fa-circle-info me-1"></i>
                    Scroll down to see all recommendations in the recipe grid, or click 
                    <strong>View Full Recipe</strong> for details, cooking timer, and to save to your favorites.
                </p>
            </div>
        `;

        chatMessages.appendChild(aiDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Attach click listeners for View Full Recipe buttons inside chat
        aiDiv.querySelectorAll('.btn-chat-recipe-modal').forEach(btn => {
            btn.addEventListener('click', () => openRecipeModal(btn.dataset.id));
        });

        // ── 8. Update the AI result quick-preview panel below chat ────────────────
        const resultContainer = document.getElementById('ai-generated-result-container');
        if (resultContainer && topRecipe) {
            const aiResImg = document.getElementById('ai-res-img');
            const aiResTitle = document.getElementById('ai-res-title');
            const aiResDesc = document.getElementById('ai-res-desc');
            const aiResTime = document.getElementById('ai-res-time');
            const aiResCal = document.getElementById('ai-res-cal');
            const aiResProtein = document.getElementById('ai-res-protein');
            const aiResCarbs = document.getElementById('ai-res-carbs');
            const aiResNutri = document.getElementById('ai-res-nutri');

            if (aiResImg)    aiResImg.src = topRecipe.image;
            if (aiResTitle)  aiResTitle.textContent = topRecipe.title;
            if (aiResDesc)   aiResDesc.textContent = topRecipe.aiReason || topRecipe.description;
            if (aiResTime)   aiResTime.textContent = `${topRecipe.prepTime || '?'} Min`;
            if (aiResCal)    aiResCal.textContent = topRecipe.calories ? `${topRecipe.calories} kcal` : '—';
            if (aiResProtein) aiResProtein.textContent = topRecipe.protein ? `${topRecipe.protein}g` : '—';
            if (aiResCarbs)  aiResCarbs.textContent = topRecipe.carbs ? `${topRecipe.carbs}g` : '—';
            if (aiResNutri)  aiResNutri.textContent = topRecipe.nutriScore || 'Nutri-Score B';

            const btnOpenGenModal = document.getElementById('btn-open-generated-modal');
            if (btnOpenGenModal) {
                const newBtn = btnOpenGenModal.cloneNode(true);
                btnOpenGenModal.parentNode.replaceChild(newBtn, btnOpenGenModal);
                newBtn.addEventListener('click', () => openRecipeModal(topRecipe.id));
            }

            resultContainer.classList.remove('d-none');
            setTimeout(() => resultContainer.classList.add('visible'), 50);
        }
    }

    function handleNavScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 120;

        // Toggle back to top button visibility
        const btnBackToTop = document.getElementById('btn-back-to-top');
        if (btnBackToTop) {
            if (window.scrollY > 300) {
                btnBackToTop.style.opacity = '1';
                btnBackToTop.style.visibility = 'visible';
            } else {
                btnBackToTop.style.opacity = '0';
                btnBackToTop.style.visibility = 'hidden';
            }
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.navbar-nav a[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    document.querySelectorAll('.navbar-nav .nav-link').forEach(l => l.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }

    // ------------------------------------------------------------------------
    // 5. INGREDIENT MATCHER LOGIC & CHIPS UI
    // ------------------------------------------------------------------------
    function renderPopularChips() {
        quickChipsContainer.innerHTML = popularIngredients.map(item => {
            const isSelected = selectedIngredients.has(item.name.toLowerCase());
            return `
                <div class="chip-item ${isSelected ? 'selected' : ''}" data-name="${item.name}">
                    <i class="fa-solid ${item.icon} ${isSelected ? 'text-dark' : item.color}"></i>
                    <span>${item.name}</span>
                </div>
            `;
        }).join('');

        // Attach click listener to each chip
        quickChipsContainer.querySelectorAll('.chip-item').forEach(chip => {
            chip.addEventListener('click', () => {
                const ingName = chip.dataset.name.toLowerCase();
                if (selectedIngredients.has(ingName)) {
                    selectedIngredients.delete(ingName);
                } else {
                    selectedIngredients.add(ingName);
                }
                renderPopularChips();
                updateActiveChipsUI();
                renderRecipes();
            });
        });
    }

    function handleAddCustomIngredient() {
        const value = ingredientInput.value.trim().toLowerCase();
        if (value) {
            selectedIngredients.add(value);
            ingredientInput.value = '';
            renderPopularChips();
            updateActiveChipsUI();
            renderRecipes();
        } else {
            ingredientInput.classList.add('shake-invalid');
            setTimeout(() => ingredientInput.classList.remove('shake-invalid'), 400);
        }
    }

    function updateActiveChipsUI() {
        selectedCountBadge.textContent = `${selectedIngredients.size} Bahan`;
        
        if (selectedIngredients.size === 0) {
            activeChipsContainer.innerHTML = `<span class="text-light-muted fs-7 fst-italic">Belum ada bahan terpilih. Klik bahan di atas untuk mulai mencocokkan resep!</span>`;
            return;
        }

        activeChipsContainer.innerHTML = Array.from(selectedIngredients).map(ing => `
            <div class="active-chip-badge">
                <span class="text-capitalize">${ing}</span>
                <i class="fa-solid fa-xmark btn-remove-chip" data-name="${ing}"></i>
            </div>
        `).join('');

        // Attach remove click listener
        activeChipsContainer.querySelectorAll('.btn-remove-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ingName = e.target.dataset.name;
                selectedIngredients.delete(ingName);
                renderPopularChips();
                updateActiveChipsUI();
                renderRecipes();
            });
        });
    }

    /**
     * Algoritma AI Matcher: menghitung berapa persentase bahan resep yang dimiliki pengguna.
     */
    function calculateRecipeMatch(recipe) {
        if (selectedIngredients.size === 0) return { matchPercent: 0, matchedCount: 0, total: recipe.ingredients.length };

        let matchedCount = 0;
        recipe.ingredients.forEach(ing => {
            const ingNameLower = ing.name.toLowerCase();
            // Check if any selected ingredient is contained in the recipe ingredient name
            for (let selected of selectedIngredients) {
                if (ingNameLower.includes(selected) || selected.includes(ingNameLower)) {
                    matchedCount++;
                    break;
                }
            }
        });

        const matchPercent = Math.round((matchedCount / recipe.ingredients.length) * 100);
        return { matchPercent, matchedCount, total: recipe.ingredients.length };
    }

    // ------------------------------------------------------------------------
    // 6. RECIPE RENDERING & FILTERING
    // ------------------------------------------------------------------------
    function renderRecipes() {
        // 1. Calculate match scores for all recipes
        let processed = recipes.map(rec => {
            // Keep the backend-calculated matchPercent for AI recipes
            if (rec.isFromRealAPI && rec.matchPercent !== undefined) {
                return rec;
            }
            const matchInfo = calculateRecipeMatch(rec);
            return { ...rec, ...matchInfo };
        });

        // 2. Filter by Diet Tag
        if (currentDietFilter !== 'all') {
            processed = processed.filter(r => r.dietTags.includes(currentDietFilter));
        }

        // 3. Sort Recipes
        if (currentSort === 'match') {
            processed.sort((a, b) => b.matchPercent - a.matchPercent);
        } else if (currentSort === 'calories-asc') {
            processed.sort((a, b) => a.calories - b.calories);
        } else if (currentSort === 'protein-desc') {
            processed.sort((a, b) => b.protein - a.protein);
        } else if (currentSort === 'time-asc') {
            processed.sort((a, b) => a.prepTime - b.prepTime);
        }

        // Render Empty State if no recipes match filter
        if (processed.length === 0) {
            recipeGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="p-5 bg-glass rounded-4 border border-secondary">
                        <i class="fa-solid fa-utensils text-muted display-4 mb-3"></i>
                        <h4 class="text-white fw-bold">Tidak Ada Resep yang Cocok</h4>
                        <p class="text-light-muted">Coba ubah kriteria filter diet atau tambahkan bahan makanan lainnya.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Render Recipe Cards HTML
        recipeGrid.innerHTML = processed.map(rec => {
            const isFav = savedRecipes.some(r => r.id === rec.id);
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="recipe-card">
                        <div class="recipe-img-wrapper position-relative">
                            <img src="${rec.image}" alt="${rec.title}" class="recipe-img" loading="lazy">
                            <span class="match-badge ${rec.matchPercent === 0 && selectedIngredients.size === 0 && !rec.isFromRealAPI ? 'd-none' : ''}">
                                <i class="fa-solid fa-bullseye me-1"></i>${rec.matchPercent}% Match
                            </span>
                            <button class="${isFav ? 'btn btn-danger' : 'btn btn-light text-danger'} save-recipe-btn favorite-card-btn" data-id="${rec.id}">
                                ${isFav ? '♥ Saved' : '♡ Save Recipe'}
                            </button>
                        </div>
                        <div class="p-4 d-flex flex-column flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-emerald-subtle text-emerald border border-emerald fs-8">${rec.category}</span>
                                <span class="fs-8 text-light-muted"><i class="fa-regular fa-clock me-1"></i> ${rec.prepTime} Min</span>
                            </div>
                            <h5 class="fw-bold text-white mb-2 line-clamp-2">${rec.title}</h5>
                            <p class="text-light-muted fs-7 mb-3 line-clamp-2">${rec.description}</p>
                            
                            <!-- Nutrients Quick Info -->
                            <div class="row g-2 text-center mb-3 mt-auto">
                                <div class="col-4">
                                    <div class="p-1 rounded-2 bg-dark-glass">
                                        <small class="text-muted fs-8 d-block">Kalori</small>
                                        <strong class="text-emerald fs-7">${rec.calories} kkal</strong>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="p-1 rounded-2 bg-dark-glass">
                                        <small class="text-muted fs-8 d-block">Protein</small>
                                        <strong class="text-warning fs-7">${rec.protein}g</strong>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="p-1 rounded-2 bg-dark-glass">
                                        <small class="text-muted fs-8 d-block">Kesulitan</small>
                                        <strong class="text-info fs-7">${rec.difficulty}</strong>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Action Buttons -->
                            <div class="d-flex flex-column gap-2 mt-2">
                                <button class="btn btn-emerald w-100 rounded-pill btn-open-detail py-2 fs-7" data-id="${rec.id}">
                                    <i class="fa-solid fa-book-open me-1"></i> Lihat Resep & Masak
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ------------------------------------------------------------------------
    // 7. DETAIL MODAL & PORTION SCALER LOGIC
    // ------------------------------------------------------------------------
    function openRecipeModal(recipeId) {
        const rec = recipes.find(r => r.id === recipeId) || savedRecipes.find(r => r.id === recipeId);
        if (!rec) return;

        currentModalRecipe = rec;
        currentPortion = 1; // reset portion to 1x

        // Reset active portion button styling
        document.querySelectorAll('.portion-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.portion === '1');
        });

        modalTitle.textContent = rec.title;
        modalCategory.textContent = rec.category;
        modalNutriScore.textContent = rec.nutriScore;
        modalImg.src = rec.image;
        modalPrepTime.textContent = `${rec.prepTime} Min`;
        modalDifficulty.textContent = rec.difficulty;
        modalDesc.textContent = rec.description;
        modalAiReason.textContent = rec.aiReason;

        updateModalPortionValues(rec, 1);
        updateModalFavoriteBtnState(rec.id);

        // Render Steps List
        modalStepsList.innerHTML = rec.steps.map((step, idx) => `
            <div class="cooking-step-item d-flex gap-3 align-items-start">
                <div class="form-check mt-1">
                    <input class="form-check-input bg-transparent border-secondary shadow-none" type="checkbox" id="step-chk-${idx}">
                </div>
                <div>
                    <strong class="text-emerald d-block fs-7 mb-1">Langkah ${idx + 1}</strong>
                    <label class="form-check-label text-light fs-7" for="step-chk-${idx}">${step}</label>
                </div>
            </div>
        `).join('');

        // Step checkbox toggle completion state
        modalStepsList.querySelectorAll('.form-check-input').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const item = e.target.closest('.cooking-step-item');
                item.classList.toggle('completed', e.target.checked);
            });
        });

        // Show Bootstrap Modal
        const bsModal = new bootstrap.Modal(document.getElementById('recipeDetailModal'));
        bsModal.show();
    }

    function updateModalPortionValues(recipe, portionMultiplier) {
        // Scale Nutrients
        modalCal.textContent = Math.round(recipe.calories * portionMultiplier);
        modalProtein.textContent = Math.round(recipe.protein * portionMultiplier);
        modalCarbs.textContent = Math.round(recipe.carbs * portionMultiplier);
        modalFat.textContent = Math.round(recipe.fat * portionMultiplier);

        // Scale Ingredients
        modalIngredientsList.innerHTML = recipe.ingredients.map((ing, idx) => {
            const scaledAmount = (ing.amount * portionMultiplier).toFixed(ing.amount % 1 === 0 ? 0 : 1);
            const ingNameLower = ing.name.toLowerCase();
            
            // Check if user has this ingredient
            let isOwned = false;
            for (let sel of selectedIngredients) {
                if (ingNameLower.includes(sel) || sel.includes(ingNameLower)) {
                    isOwned = true;
                    break;
                }
            }

            return `
                <li class="list-group-item bg-transparent text-white border-secondary-subtle px-0 py-2 d-flex justify-content-between align-items-center fs-7">
                    <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid ${isOwned ? 'fa-circle-check text-emerald' : 'fa-circle-dot text-muted'}"></i>
                        <span>${ing.name}</span>
                        ${isOwned ? '<span class="badge bg-success-subtle text-success fs-8 ms-1">Ada di Dapur</span>' : ''}
                    </div>
                    <span class="fw-bold text-emerald">${scaledAmount} ${ing.unit}</span>
                </li>
            `;
        }).join('');
    }

    function updateModalFavoriteBtnState(recipeId) {
        const isFav = savedRecipes.some(r => r.id === recipeId);
        if (isFav) {
            modalBtnFavorite.className = 'btn btn-danger rounded-pill px-4';
            modalBtnFavorite.innerHTML = `<i class="fa-solid fa-heart-circle-check me-1"></i> Resep Tersimpan`;
        } else {
            modalBtnFavorite.className = 'btn btn-emerald rounded-pill px-4';
            modalBtnFavorite.innerHTML = `<i class="fa-solid fa-heart me-1"></i> Simpan ke Favorit`;
        }
    }

    // ------------------------------------------------------------------------
    // 8. INTERACTIVE COOKING TIMER
    // ------------------------------------------------------------------------
    function updateTimerClockDisplay() {
        const mins = Math.floor(timerRemainingSeconds / 60);
        const secs = timerRemainingSeconds % 60;
        timerClock.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        btnTimerStart.disabled = true;
        btnTimerPause.disabled = false;

        timerInterval = setInterval(() => {
            if (timerRemainingSeconds > 0) {
                timerRemainingSeconds--;
                updateTimerClockDisplay();
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                btnTimerStart.disabled = false;
                btnTimerPause.disabled = true;
                alert('⏰ Waktu Memasak Selesai! Makanan Anda Siap Disajikan.');
            }
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        btnTimerStart.disabled = false;
        btnTimerPause.disabled = true;
    }

    function resetTimer(seconds) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerRemainingSeconds = seconds;
        updateTimerClockDisplay();
        btnTimerStart.disabled = false;
        btnTimerPause.disabled = true;
    }

    // ------------------------------------------------------------------------
    // 9. AI CUSTOM RECIPE GENERATOR
    // ------------------------------------------------------------------------
    function handleAIGeneratorSubmit(e) {
        e.preventDefault();

        const mealType = document.getElementById('ai-meal-type').value;
        const maxCal = parseInt(document.getElementById('ai-cal-range').value, 10);
        const dietGoal = document.getElementById('ai-diet-goal').value;
        const customIngsRaw = document.getElementById('ai-custom-ingredients').value.trim();

        // Show AI Loader
        aiGeneratorForm.classList.add('d-none');
        document.getElementById('ai-loader').classList.remove('d-none');

        // Simulate AI generation process (1.5s delay)
        setTimeout(() => {
            const generatedIngs = customIngsRaw 
                ? customIngsRaw.split(',').map(s => ({ name: s.trim(), amount: 100, unit: 'gram' }))
                : [
                    { name: 'Dada Ayam', amount: 150, unit: 'gram' },
                    { name: 'Brokoli', amount: 100, unit: 'gram' },
                    { name: 'Bawang Putih', amount: 2, unit: 'siung' }
                  ];

            const newAiRecipe = {
                id: `ai-gen-${Date.now()}`,
                title: `AI Special: ${mealType} ${dietGoal.split(' ')[0]}`,
                category: 'Kreasi AI',
                dietTags: ['high-protein', 'low-calorie'],
                image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
                calories: Math.min(maxCal, 450),
                protein: Math.round(maxCal * 0.08),
                carbs: Math.round(maxCal * 0.1),
                fat: Math.round(maxCal * 0.03),
                prepTime: 15,
                difficulty: 'Sangat Mudah',
                nutriScore: 'Nutri-Score A',
                description: `Resep kustom yang dibuat khusus oleh AI sesuai target ${maxCal} kkal dan preferensi ${dietGoal}.`,
                aiReason: `Merupakan formula gizi optimal yang mengkombinasikan bahan-bahan pilihan Anda untuk rasio energi terbaik.`,
                ingredients: generatedIngs,
                steps: [
                    'Persiapkan dan bersihkan seluruh bahan makanan pilihan Anda.',
                    'Tumis bumbu halus dengan minyak zaitun secukupnya di api sedang.',
                    'Masukkan bahan utama dan masak hingga tingkat kematangan sempurna.',
                    'Sajikan selagi hangat dan nikmati sajian sehat buatan AI!'
                ]
            };

            recipes.unshift(newAiRecipe);

            // Reset Form and Hide Modal
            document.getElementById('ai-loader').classList.add('d-none');
            aiGeneratorForm.classList.remove('d-none');
            aiGeneratorForm.reset();

            const bsModal = bootstrap.Modal.getInstance(document.getElementById('aiGeneratorModal'));
            if (bsModal) bsModal.hide();

            renderRecipes();
            openRecipeModal(newAiRecipe.id);

        }, 1500);
    }

    // ------------------------------------------------------------------------
    // 10. AUTH & SAVED FAVORITES MANAGER (LocalStorage)
    // ------------------------------------------------------------------------
    
    function handleLocalLogin(e) {
        e.preventDefault();
        const usernameInput = document.getElementById('login-username').value.trim();
        const passwordInput = document.getElementById('login-password').value;
        if (!usernameInput || !passwordInput) return;

        const userId = usernameInput.toLowerCase().replace(/\s+/g, '_');
        
        // Load accounts
        const accounts = JSON.parse(localStorage.getItem('healthy_recipe_accounts')) || {};
        
        if (accounts[userId]) {
            // Check password
            if (accounts[userId].password !== passwordInput) {
                alert('Password salah!');
                return;
            }
        } else {
            // Register new user
            accounts[userId] = {
                password: passwordInput,
                name: usernameInput
            };
            localStorage.setItem('healthy_recipe_accounts', JSON.stringify(accounts));
            alert('Akun berhasil didaftarkan dan login!');
        }

        currentUser = {
            id: userId,
            name: usernameInput,
            initial: usernameInput.charAt(0).toUpperCase()
        };
        sessionStorage.setItem('healthy_recipe_session', JSON.stringify(currentUser));

        // Close Modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('localLoginModal'));
        if (modal) modal.hide();

        localLoginForm.reset();
        handleLoginState();
    }

    function handleLoginState() {
        if (!currentUser) return;
        
        // UI updates
        loggedOutView.classList.add('d-none');
        loggedInView.classList.remove('d-none');
        loggedInView.classList.add('d-flex');
        
        if (userProfilePicContainer) {
            userProfilePicContainer.textContent = currentUser.initial;
        }
        userNameDisplay.textContent = currentUser.name;
        userNameDisplay.classList.remove('d-none');
        
        favoritesMessage.textContent = 'Here are your saved recipes.';
        
        // Load user's favorites
        loadUserFavorites();
    }

    function handleLogout() {
        currentUser = null;
        sessionStorage.removeItem('healthy_recipe_session');
        savedRecipes = [];
        
        // UI updates
        loggedInView.classList.remove('d-flex');
        loggedInView.classList.add('d-none');
        loggedOutView.classList.remove('d-none');
        
        favoritesMessage.textContent = 'Login to view your saved recipes.';
        
        renderFavoritesSection();
        renderRecipes(); // update heart icons on recipe cards
    }

    function loadUserFavorites() {
        if (!currentUser) return;
        const allFavs = JSON.parse(localStorage.getItem('healthy_recipe_users_favs')) || {};
        savedRecipes = allFavs[currentUser.id] || [];
        renderFavoritesSection();
        renderRecipes();
    }

    function saveUserFavorites() {
        if (!currentUser) return;
        const allFavs = JSON.parse(localStorage.getItem('healthy_recipe_users_favs')) || {};
        allFavs[currentUser.id] = savedRecipes;
        localStorage.setItem('healthy_recipe_users_favs', JSON.stringify(allFavs));
    }

    function toggleFavorite(recipeId) {
        if (!currentUser) {
            alert('Silakan login terlebih dahulu untuk menyimpan resep!');
            return;
        }

        const index = savedRecipes.findIndex(r => r.id === recipeId);
        if (index > -1) {
            savedRecipes.splice(index, 1);
        } else {
            const recToSave = recipes.find(r => r.id === recipeId) || currentModalRecipe;
            if (recToSave) {
                savedRecipes.push(recToSave);
            }
        }

        saveUserFavorites();
        renderFavoritesSection();
        
        if (currentModalRecipe && currentModalRecipe.id === recipeId) {
            updateModalFavoriteBtnState(recipeId);
        }
        
        // Update the main recipe grid button directly without re-rendering everything
        const cardBtn = document.querySelector(`.favorite-card-btn[data-id="${recipeId}"]`);
        if (cardBtn) {
            const isFav = savedRecipes.some(r => r.id === recipeId);
            if (isFav) {
                cardBtn.className = 'btn btn-danger save-recipe-btn favorite-card-btn';
                cardBtn.textContent = '♥ Saved';
            } else {
                cardBtn.className = 'btn btn-light text-danger save-recipe-btn favorite-card-btn';
                cardBtn.textContent = '♡ Save Recipe';
            }
        }
    }

    function renderFavoritesSection() {
        if (!currentUser) {
            favoritesListContainer.innerHTML = '';
            return;
        }

        if (savedRecipes.length === 0) {
            favoritesListContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fa-regular fa-heart display-4 text-muted mb-3"></i>
                    <h6 class="text-white fw-bold">Belum Ada Resep Favorit</h6>
                    <p class="text-light-muted fs-7">Klik tombol "♡ Save Recipe" pada kartu resep untuk menyimpannya ke sini.</p>
                </div>
            `;
            return;
        }

        favoritesListContainer.innerHTML = savedRecipes.map(rec => `
            <div class="col-md-6 col-lg-4">
                <div class="card bg-dark-glass border-secondary text-white h-100 shadow-sm rounded-4 overflow-hidden">
                    <img src="${rec.image}" class="card-img-top object-fit-cover" alt="${rec.title}" style="height: 200px;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold line-clamp-2 mb-2">${rec.title}</h5>
                        <div class="d-flex justify-content-between mb-3 text-light-muted fs-7">
                            <span><i class="fa-regular fa-clock me-1"></i> ${rec.prepTime} Min</span>
                            <span class="text-emerald fw-semibold">${rec.calories} kkal</span>
                        </div>
                        <div class="mt-auto d-flex gap-2">
                            <button class="btn btn-emerald flex-grow-1 rounded-pill btn-open-detail" data-id="${rec.id}">
                                <i class="fa-solid fa-eye me-1"></i> View Recipe
                            </button>
                            <button class="btn btn-outline-danger rounded-pill px-3 btn-remove-fav" data-id="${rec.id}" title="Remove from Favorites">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Run app
    init();
});
