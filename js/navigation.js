const NavigationLoader = {
    characterList: null,
    async init() {
        await this.loadCharacterList();
        this.updateAllMenus(); 
        this.setupMobileMenu();
        this.setupSearch();
        this.setupMobileSearch();
    },

    async loadCharacterList() {
        if (this.characterList) return this.characterList;
        const characterIds = [
            'alekhchanov',
            'ametist',
            'artoegg',
            'baron_samedi' ,
            'bebra',
            'bucefal',
            'chelovek_stintovich',
            'cuspid777',
            'danyka_nakhren',
            'dennaswag',
            'director_slay',
            'favner',
            'fuga',
            'gernaut',
            'hypovozka',
            'ivangou55',
            'kapusta123',
            'karona_pirus',
            'kizyak',
            'kukuruznik',
            'luka_exe',
            'm01in42',
            'martova',
            'mishaniashalyn',
            'mor_menskiy',
            'nuarpivovar',
            'nyuta_barinova',
            'ohreneniy',
            'olegro',
            'ostergoster',
            'prince_hype',
            'producent',
            'reyhuu',
            'scorpion',
            'sankashtormovoi',
            'sasha_vrach',
            'shadow_star',
            'shaiba',
            'skippy',
            'skitons',
            'skrepka',
            'spnx',
            'sunsrike',
            'super_b0',
            'the4ebypek',
            'topaso',
            'tupitsa',
            'velikotrax',
            'violetoviii'
            ];
        
           const fetchPromises = characterIds.map(id => 
          fetch(`data/characters/${id}.json`)
               .then(res => res.ok ? res.json() : null)
               .catch(() => null)
       );
       const results = await Promise.all(fetchPromises);

       this.characterList = results
           .filter(data => data !== null)
           .map(data => ({
               id: data.id,
               name: data.title,
                city: data.required?.city || 'Неизвестно',
               squad: data.required?.squad || 'Нет'
            }));
    },

    updateAllMenus() {
        
        const targets = ['nav-characters', 'nav-characters-desktop', 'nav-cities', 'nav-cities-desktop', 'nav-squads', 'nav-squads-desktop'];
        
        const charHtml = this.characterList.map(c => `<li><a href="entity.html?id=${c.id}">${c.name}</a></li>`).join('');
        ['nav-characters', 'nav-characters-desktop'].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).innerHTML = charHtml;
        });
        const allCities = [];
        this.characterList.forEach(char => {
            if (Array.isArray(char.city)) {
                allCities.push(...char.city);
            } else {
                allCities.push(char.city);
            }
        });
        
        const uniqueCities = [...new Set(allCities)].sort();
        
        const cityHtml = uniqueCities.map(city => 
            `<li><a href="filter.html?city=${encodeURIComponent(city)}">${city}</a></li>`
        ).join('');
        
        ['nav-cities', 'nav-cities-desktop'].forEach(id => {
            if(document.getElementById(id)) document.getElementById(id).innerHTML = cityHtml;
        });
    },

    setupMobileMenu() {
        const btn = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.onclick = () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            };
        }
        const accordionHeaders = document.querySelectorAll('.sidebar-content h3');
        accordionHeaders.forEach(header => {
                header.style.cursor = 'pointer';
                header.onclick = () => {
                    const content = header.nextElementSibling;
                    if (content && content.tagName === 'NAV') {
                        const isOpened = content.style.display === 'block';
                        content.style.display = isOpened ? 'none' : 'block';
                        header.innerText = isOpened 
                            ? header.innerText.replace('▾', '▸') 
                            : header.innerText.replace('▸', '▾');
                    }
                };
        });
    },

    setupSearch() {
        const input = document.getElementById('wiki-search');
        const res = document.getElementById('search-results');
        if (!input) return;
        input.oninput = (e) => {
            const val = e.target.value.toLowerCase();
            res.innerHTML = '';
            if (val.length < 2) return;
            const matches = this.characterList.filter(c => c.name.toLowerCase().includes(val));
            res.innerHTML = matches.map(c => `<li><a href="entity.html?id=${c.id}">${c.name}</a></li>`).join('');
        };
    },
    setupMobileSearch() {
        const input = document.getElementById('mobile-wiki-search');
        const res = document.getElementById('mobile-search-results');
        
        if (!input) {
            console.log('Мобильный поиск не найден');
            return;
        }
        
        console.log('Мобильный поиск инициализирован');
        
        input.oninput = (e) => {
            const val = e.target.value.toLowerCase().trim();
            console.log('Мобильный поиск ввод:', val);
            
            if (val.length < 2) {
                res.innerHTML = '';
                return;
            }
            
            const matches = this.characterList.filter(c => 
                c.name.toLowerCase().includes(val)
            );
            
            console.log('Найдено:', matches.length);
            
            if (matches.length === 0) {
                res.innerHTML = '<li style="padding: 10px; color: #999;">Ничего не найдено</li>';
            } else {
                res.innerHTML = matches.map(c => 
                    `<li><a href="entity.html?id=${c.id}">${c.name}</a></li>`
                ).join('');
            }
        };
    }
};

document.addEventListener('DOMContentLoaded', () => NavigationLoader.init());