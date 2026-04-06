const FilterPage = {
    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const city = urlParams.get('city');
        const squad = urlParams.get('squad');
        if (!city && !squad) {
            this.showError('Не указан параметр фильтрации');
            return;
        }
        await NavigationLoader.loadCharacterList();
        const allCharacters = NavigationLoader.characterList;
        let filtered = [];
        let filterType = '';
        let filterValue = '';
        let squadData = null;
        if (city) {
            filterType = 'Город';
            filterValue = city;
             filtered = allCharacters.filter(char => {
            const cities = Array.isArray(char.city) ? char.city : [char.city];
            return cities.includes(city);
        });
            await this.loadCitySquads(city);
        } else if (squad) {
            filterType = 'Сквад';
            filterValue = squad;
            filtered = allCharacters.filter(char => {
                const charSquad = char.squad && char.squad !== 'нет' ? char.squad : 'Без сквада';
                return charSquad === squad;
            });
            squadData = await this.loadSquadData(squad);
            if (squadData) {
                this.renderSquadCard(squadData);
            }
        }
        this.renderResults(filterType, filterValue, filtered);
        this.loadImagesForCharacters(filtered);
        this.setPageColor();
    },
    async loadSquadData(squadName) {
        try {
            const response = await fetch('data/squads/index.json');
            if (!response.ok) throw new Error('Нет данных о сквадах');
            const data = await response.json();
            const squads = data.squads || [];
            const squad = squads.find(s => s.name === squadName || this.slugify(s.name) === this.slugify(squadName));
            if (squad) {
                return squad;
            }
            return {
                name: squadName,
                members: filtered.length,
                leader: null,
                description: `Участники сквада ${squadName}`
            };
        } catch (error) {
            console.error('Ошибка загрузки данных сквада:', error);
            return null;
        }
    },
    renderSquadCard(squad) {
        const container = document.getElementById('squads-section');
        const grid = document.getElementById('squads-grid');
        if (!container || !grid) return;
        container.style.display = 'block';
        grid.innerHTML = `
            <div class="squad-card featured" style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(var(--default), 0.15) 0%, rgba(var(--default), 0.05) 100%); border: 2px solid rgba(var(--default)); padding: 25px;">
                <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 0 0 100px; height: 100px; background: rgba(var(--default), 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 50px;">
                        🏢
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 28px; font-weight: bold; color: rgba(var(--default)); margin-bottom: 5px;">${squad.name}</div>
                        <div style="font-size: 16px; color: #666; margin-bottom: 10px;">${squad.description || `Сквад участников движения 42 братухи`}</div>
                        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                            <div style="font-size: 14px; color: #444;">👥 <strong>${squad.members?.length || '?'}</strong> участников</div>
                            ${squad.leader ? `<div style="font-size: 14px; color: #444;">👑 Лидер: <a href="entity.html?type=character&id=${squad.leader}" style="color: rgba(var(--default)); text-decoration: none;">${this.getCharacterName(squad.leader)}</a></div>` : ''}
                            ${squad.founded ? `<div style="font-size: 14px; color: #444;">📅 Основан: ${squad.founded}</div>` : ''}
                        </div>
                    </div>
                    <div style="flex: 0 0 auto;">
                        <a href="entity.html?type=squad&id=${squad.id}" style="display: inline-block; padding: 10px 20px; background: rgba(var(--default)); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Страница сквада →</a>
                    </div>
                </div>
            </div>
        `;
    },
    async loadCitySquads(city) {
        try {
            const response = await fetch('data/squads/index.json');
            if (!response.ok) throw new Error('Нет данных о сквадах');
        
            const data = await response.json();
            const squads = data.squads || [];   
            
            const citySquads = squads.filter(squad => {
                if (Array.isArray(squad.city)) {
                    return squad.city.includes(city);
                }
                return squad.city === city;
            });
            if (citySquads.length > 0) {
                this.renderCitySquads(citySquads);
                document.getElementById('squads-section').style.display = 'block';
            } else {
                document.getElementById('squads-section').style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка загрузки сквадов:', error);
            document.getElementById('squads-section').style.display = 'none';
        }
    },
    renderCitySquads(squads) {
        const grid = document.getElementById('squads-grid');
        grid.innerHTML = squads.map(squad => `
            <div class="squad-card" onclick="location.href='filter.html?squad=${encodeURIComponent(squad.name)}'">
                <div class="squad-name">${squad.name}</div>
                <div class="squad-members">
                    👥 <span>${squad.members?.length || 0}</span> участников
                </div>
                ${squad.leader ? `
                    <div class="squad-members">
                        👑 Лидер: ${this.getCharacterName(squad.leader)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },
    renderResults(type, value, characters) {
        document.getElementById('filter-title').textContent = `${type}: ${value}`;
        document.getElementById('filter-type').textContent = `${characters.length} участников`;
        document.getElementById('results-count').innerHTML = `Найдено участников: <strong>${characters.length}</strong>`;
        const grid = document.getElementById('characters-grid');
        if (characters.length === 0) {
            grid.innerHTML = '<div class="no-results">Никого не найдено 😢</div>';
            return;
        }
        grid.innerHTML = characters.map(char => {
        // Отображение городов: если массив — показываем через запятую
        let cityDisplay = char.city;
        if (Array.isArray(char.city)) {
            cityDisplay = char.city.join(', ');
        }
        
        return `
            <div class="character-card" onclick="location.href='entity.html?type=character&id=${char.id}'">
                <div class="character-image" id="img-${char.id}">
                    <div style="padding: 20px; text-align: center; color: #666;">Загрузка...</div>
                </div>
                <div class="character-info">
                    <div class="character-name">${char.name}</div>
                    <div class="character-detail">🏙️ ${char.city}</div>
                    <div class="character-detail">👥 ${char.squad || 'Без сквада'}</div>
                </div>
            </div>
        `;}).join('');
    },
    async loadImagesForCharacters(characters) {
        for (const char of characters) {
            try {
                const response = await fetch(`data/characters/${char.id}.json`);
                if (!response.ok) continue;
                const data = await response.json();
                let firstImage = null;
                if (data.images) {
                    const firstStyle = Object.keys(data.images)[0];
                    if (firstStyle && data.images[firstStyle].length > 0) {
                        firstImage = data.images[firstStyle][0];
                    }
                }
                if (!firstImage && data.gallery && data.gallery.length > 0) {
                    firstImage = data.gallery[0];
                }
                if (firstImage) {
                    const imgContainer = document.getElementById(`img-${char.id}`);
                    if (imgContainer) {
                        imgContainer.innerHTML = `<img src="${firstImage}" alt="${char.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    }
                }
            } catch (error) {
                console.error(`Ошибка загрузки изображения для ${char.id}:`, error);
            }
        }
    },
    getCharacterName(id) {
        const char = NavigationLoader.characterList?.find(c => c.id === id);
        return char ? char.name : id;
    },
    slugify(text) {
        const map = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
            ' ': '-', '/': '-', '\\': '-'
        };
        return text.toLowerCase()
            .split('')
            .map(char => map[char] || char)
            .join('')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    },
    setPageColor() {
        const savedColor = localStorage.getItem('characterColor');
        if (savedColor) {
            document.documentElement.style.setProperty('--default', savedColor);
        }
    },
    showError(message) {
        document.body.innerHTML = `
            <div class="err">
                <div class="err_center white">
                    <h1 class="err_heading">Ошибка</h1>
                    <h2>${message}</h2>
                    <a href="index.html">Вернуться на главную</a>
                </div>
            </div>
        `;
    }
};
document.addEventListener('DOMContentLoaded', () => {
    FilterPage.init();
});