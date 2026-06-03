window.NavigationLoader = {
    characterList: null,
    
    async init() {
        console.log('Инициализация навигации...');
        await this.loadCharacterList();
        this.updateAllMenus(); 
        this.setupMobileMenu();
        this.setupSearch();
        this.setupMobileSearch();
    },

    async loadCharacterList() {
        if (this.characterList) return this.characterList;
        try {
            const response = await fetch('get-list.php?type=character');
            if (!response.ok) throw new Error('Ошибка загрузки списка');
            const characters = await response.json();
            
            this.characterList = characters.map(char => ({
                id: char.id,
                name: char.name,
                city: char.city || 'Неизвестно',
                squad: char.squad || 'Нет',
                image: char.image || null
            }));
            
            console.log('Список загружен:', this.characterList);
            return this.characterList;
        } catch (error) {
            console.error('Ошибка:', error);
            this.characterList = [];
            return [];
        }
    },

    updateAllMenus() {
    this.updateCharactersMenu();
    this.updateCitiesMenu();
    this.updateSquadsMenu();
    if (typeof this.setupMobileMenu === 'function') {
        setTimeout(() => {
            const headers = document.querySelectorAll('.sidebar-content h3');
            headers.forEach(header => {
                let nav = header.nextElementSibling;
                while (nav && nav.tagName !== 'NAV') {
                    nav = nav.nextElementSibling;
                }
                if (nav && nav.children.length > 0 && nav.style.display === 'none') {
                    // Если есть элементы, но скрыты - оставляем как есть
                } else if (nav && nav.children.length > 0) {
                    nav.style.display = 'block';
                }
            });
        }, 100);
    }
},
    
    updateCharactersMenu() {
        const desktopMenu = document.getElementById('nav-characters-desktop');
        const mobileMenu = document.getElementById('nav-characters');
    
        if (!this.characterList || this.characterList.length === 0) return;
    
        const html = this.characterList.map(char => 
        `<li><a href="entity.html?type=character&id=${char.id}">${char.name}</a></li>`
        ).join('');
    
        if (desktopMenu) desktopMenu.innerHTML = html;
        if (mobileMenu) mobileMenu.innerHTML = html;
    },
    
    updateCitiesMenu() {
        const desktopMenu = document.getElementById('nav-cities-desktop');
        const mobileMenu = document.getElementById('nav-cities');
        
        if (!this.characterList || this.characterList.length === 0) {
            if (desktopMenu) desktopMenu.innerHTML = '<li>Нет городов</li>';
            if (mobileMenu) mobileMenu.innerHTML = '<li>Нет городов</li>';
            return;
        }
        const allCities = [];
         this.characterList.forEach(char => {
             if (Array.isArray(char.city)) {
                 allCities.push(...char.city);
             } else {
                 allCities.push(char.city);
             }
         });

       const uniqueCities = [...new Set(allCities)].sort();

       const html = uniqueCities.map(city => 
         `<li><a href="filter.html?city=${encodeURIComponent(city)}">${city}</a></li>`
         ).join('');

       if (desktopMenu) desktopMenu.innerHTML = html;
       if (mobileMenu) mobileMenu.innerHTML = html;
    },
    
    updateSquadsMenu() {
        const desktopMenu = document.getElementById('nav-squads-desktop');
        const mobileMenu = document.getElementById('nav-squads');
        
        if (!this.characterList || this.characterList.length === 0) {
            if (desktopMenu) desktopMenu.innerHTML = '<li>Нет сквадов</li>';
            if (mobileMenu) mobileMenu.innerHTML = '<li>Нет сквадов</li>';
            return;
        }
        const uniqueSquads = [...new Set(this.characterList.map(c => c.squad || 'Без сквада'))].sort();
        
        const html = uniqueSquads.map(squad => 
            `<li><a href="filter.html?squad=${encodeURIComponent(squad)}">${squad}</a></li>`
        ).join('');
        
        if (desktopMenu) desktopMenu.innerHTML = html;
        if (mobileMenu) mobileMenu.innerHTML = html;
    },

    setupSearch() {
        const input = document.getElementById('wiki-search');
        const res = document.getElementById('search-results');
        if (!input || !res) return;

        input.oninput = (e) => {
            const val = e.target.value.toLowerCase().trim();
            if (!this.characterList || val.length < 2) {
                res.innerHTML = '';
                return;
            }
            const matches = this.characterList.filter(c => 
                c.name.toLowerCase().includes(val)
            );
            res.innerHTML = matches.map(c => 
                `<li><a href="entity.html?type=character&id=${c.id}">${c.name}</a></li>`
            ).join('');
        };
    },

    setupMobileSearch() {
        const input = document.getElementById('mobile-wiki-search');
        const res = document.getElementById('mobile-search-results');
        if (!input || !res) return;

        input.oninput = (e) => {
            const val = e.target.value.toLowerCase().trim();
            if (!this.characterList || val.length < 2) {
                res.innerHTML = '';
                return;
            }
            const matches = this.characterList.filter(c => 
                c.name.toLowerCase().includes(val)
            );
            res.innerHTML = matches.map(c => 
                `<li><a href="entity.html?type=character&id=${c.id}">${c.name}</a></li>`
            ).join('');
        };
    },

    setupMobileMenu() {
    const btn = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeSidebar');
    
    // Открытие/закрытие сайдбара
    if (btn && sidebar && overlay) {
        btn.onclick = () => {
            sidebar.classList.add('open');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        };
        
        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        };
        
        if (overlay) overlay.onclick = closeSidebar;
        if (closeBtn) closeBtn.onclick = closeSidebar;
    }
    
    const initAccordion = () => {
        const headers = document.querySelectorAll('.sidebar-content h3');
        console.log('Инициализация аккордеона, найдено заголовков:', headers.length);
        
        headers.forEach(header => {
            // Ищем следующий элемент nav
            let nav = header.nextElementSibling;
            while (nav && nav.tagName !== 'NAV') {
                nav = nav.nextElementSibling;
            }
            if (!nav) return;
            
            header.onclick = null;
            
            header.style.cursor = 'pointer';
            
            const sectionName = header.textContent.trim().replace('▾', '').replace('▼', '').trim();
            const savedState = localStorage.getItem(`nav_${sectionName}`);
            
            if (savedState === 'closed') {
                nav.style.display = 'none';
                header.classList.add('collapsed');
            } else {
                nav.style.display = 'block';
                header.classList.remove('collapsed');
            }
            
            header.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = nav.style.display !== 'none';
                
                if (isOpen) {
                    nav.style.display = 'none';
                    header.classList.add('collapsed');
                    localStorage.setItem(`nav_${sectionName}`, 'closed');
                } else {
                    nav.style.display = 'block';
                    header.classList.remove('collapsed');
                    localStorage.setItem(`nav_${sectionName}`, 'open');
                }
                console.log('Клик по:', sectionName, 'теперь открыто:', !isOpen);
            };
        });
    };
    
    initAccordion();
    
    setTimeout(initAccordion, 500);
    
    const observer = new MutationObserver(() => {
        initAccordion();
    });
    
    observer.observe(document.getElementById('sidebar'), { childList: true, subtree: true });
},
    
    getCharacterById(id) {
        return this.characterList?.find(c => c.id === id);
    }
};

document.addEventListener('DOMContentLoaded', () => NavigationLoader.init());