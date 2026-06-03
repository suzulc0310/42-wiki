const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');
window.editCharacterId = editId;

console.log('Параметр edit из URL:', editId);

const AdminStorage = {
    LIST_KEY: '42wiki_characters_list',
    
    getList() {
        const list = localStorage.getItem(this.LIST_KEY);
        return list ? JSON.parse(list) : [];
    },
    
    saveList(list) {
        localStorage.setItem(this.LIST_KEY, JSON.stringify(list));
    },
    
    loadCharacter(id) {
        const data = localStorage.getItem(`42wiki_char_${id}`);
        return data ? JSON.parse(data) : null;
    },
    
    saveCharacter(id, data) {
        localStorage.setItem(`42wiki_char_${id}`, JSON.stringify(data));
        const list = this.getList();
        if (!list.includes(id)) {
            list.push(id);
            this.saveList(list);
        }
    },
    
    exportToFile(id) {
        const data = this.loadCharacter(id);
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${id}.json`;
        a.click();
    }
};

function addImageStyleField(styleName = '', urls = []) {
    const container = document.getElementById('images-container');
    const div = document.createElement('div');
    div.className = 'image-style-item';
    div.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="image-style-name" placeholder="Название стиля" value="${styleName}" style="flex-grow: 1; padding: 5px;">
            <button type="button" class="remove-image-style" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">❌ Удалить</button>
        </div>
        <textarea class="image-style-urls" rows="3" placeholder="Ссылки на фото (по одной на строку)" style="width: 100%;">${urls.join('\n')}</textarea>
    `;
    div.querySelector('.remove-image-style').onclick = () => div.remove();
    container.appendChild(div);
}

function loadImages(images) {
    const container = document.getElementById('images-container');
    container.innerHTML = '';
    if (!images || Object.keys(images).length === 0) {
        addImageStyleField('Дефолт', []);
        return;
    }
    Object.entries(images).forEach(([style, urls]) => addImageStyleField(style, urls));
}

function addSection(sectionData = null) {
    const container = document.getElementById('sections-container');
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    
    const title = sectionData?.title || '';
    const type = sectionData?.type || 'text';
    
    sectionDiv.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="section-title" placeholder="Название секции" value="${title}" style="flex-grow: 1; padding: 5px;">
            <select class="section-type" style="padding: 5px;">
                <option value="text" ${type === 'text' ? 'selected' : ''}>Текст</option>
                <option value="subsection" ${type === 'subsection' ? 'selected' : ''}>Подразделы</option>
                <option value="list" ${type === 'list' ? 'selected' : ''}>Список</option>
                <option value="text-with-list" ${type === 'text-with-list' ? 'selected' : ''}>Текст + Список</option>
            </select>
            <button type="button" class="remove-section-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">❌ Удалить</button>
        </div>
        <div class="section-content-area"></div>
    `;
    
    sectionDiv.querySelector('.remove-section-btn').onclick = () => sectionDiv.remove();
    sectionDiv.querySelector('.section-type').onchange = () => changeSectionType(sectionDiv);
    
    container.appendChild(sectionDiv);
    changeSectionType(sectionDiv, sectionData?.content);
}

function changeSectionType(sectionDiv, contentData = null) {
    const type = sectionDiv.querySelector('.section-type').value;
    const contentArea = sectionDiv.querySelector('.section-content-area');
    
    if (type === 'text') {
        contentArea.innerHTML = `<textarea class="section-content" rows="4" placeholder="Текст секции" style="width: 100%;">${contentData || ''}</textarea>`;
    } else if (type === 'subsection') {
        contentArea.innerHTML = `<div class="subsections-container"><button type="button" class="add-subsection-btn btn-add">➕ Добавить подраздел</button></div>`;
        const subs = contentData || [];
        subs.forEach(sub => addSubsection(contentArea.querySelector('.subsections-container'), sub));
        contentArea.querySelector('.add-subsection-btn').onclick = () => addSubsection(contentArea.querySelector('.subsections-container'));
    } else if (type === 'list') {
        contentArea.innerHTML = `<div class="list-items-container"><button type="button" class="add-list-item-btn btn-add">➕ Добавить элемент</button></div>`;
        const items = contentData || [];
        items.forEach(item => addListItem(contentArea.querySelector('.list-items-container'), item));
        contentArea.querySelector('.add-list-item-btn').onclick = () => addListItem(contentArea.querySelector('.list-items-container'));
    } else if (type === 'text-with-list') {
        contentArea.innerHTML = `
            <textarea class="section-text-before" rows="3" placeholder="Текст перед списком" style="width: 100%; margin-bottom: 10px;">${contentData?.textBefore || ''}</textarea>
            <div class="list-items-container"><button type="button" class="add-list-item-btn btn-add">➕ Добавить элемент</button></div>
        `;
        const items = contentData?.list || [];
        items.forEach(item => addListItem(contentArea.querySelector('.list-items-container'), item));
        contentArea.querySelector('.add-list-item-btn').onclick = () => addListItem(contentArea.querySelector('.list-items-container'));
    }
}

function addSubsection(container, data = null) {
    const div = document.createElement('div');
    div.className = 'subsection-item';
    div.style.cssText = 'margin-left: 20px; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;';
    div.innerHTML = `
        <input type="text" class="subsection-title" placeholder="Подзаголовок" value="${data?.subtitle || ''}" style="width: 100%; margin-bottom: 5px; padding: 5px;">
        <textarea class="subsection-text" rows="3" placeholder="Текст подраздела" style="width: 100%; margin-bottom: 5px; padding: 5px;">${data?.text || ''}</textarea>
        <button type="button" class="remove-subsection-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">❌ Удалить</button>
    `;
    div.querySelector('.remove-subsection-btn').onclick = () => div.remove();
    container.insertBefore(div, container.querySelector('.add-subsection-btn'));
}

function addListItem(container, text = '') {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.style.cssText = 'margin: 5px 0; display: flex; gap: 5px;';
    div.innerHTML = `
        <input type="text" placeholder="Элемент списка" value="${text}" style="flex-grow: 1; padding: 5px;">
        <button type="button" class="remove-list-item-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">❌</button>
    `;
    div.querySelector('.remove-list-item-btn').onclick = () => div.remove();
    container.insertBefore(div, container.querySelector('.add-list-item-btn'));
}

function loadSections(sections) {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    if (!sections || sections.length === 0) {
        addSection();
        return;
    }
    sections.forEach(section => {
        addSection(section);
        const lastSection = container.lastChild;
        const type = section.type;
        const content = section.content;
        
        if (type === 'text') {
            lastSection.querySelector('.section-content').value = content;
        } else if (type === 'subsection') {
            // подразделы уже добавлены
        } else if (type === 'list') {
            // элементы уже добавлены
        } else if (type === 'text-with-list') {
            lastSection.querySelector('.section-text-before').value = content.textBefore || '';
        }
    });
}

async function renderCharacterList() {
    try {
        const response = await fetch('../get-list.php?type=character&admin=1');
        const characters = await response.json();
        
        const select = document.getElementById('character-select');
        if (select) {
            select.innerHTML = '<option value="">-- Выберите персонажа --</option>' + 
                characters.map(char => `<option value="${char.id}">${char.name}</option>`).join('');
            
            select.onchange = (e) => {
                if (e.target.value) {
                    loadCharacter(e.target.value);
                }
            };
        }
        
        AdminStorage.saveList(characters.map(c => c.id));
        console.log('✅ Список персонажей загружен из БД:', characters.length);
    } catch (error) {
        console.error('Ошибка загрузки списка из БД:', error);
        const list = AdminStorage.getList();
        const select = document.getElementById('character-select');
        if (select) {
            select.innerHTML = '<option value="">-- Выберите персонажа --</option>' + 
                list.map(id => `<option value="${id}">${id}</option>`).join('');
        }
        console.log('📦 Список загружен из localStorage (резерв)');
    }
}

async function loadCharacter(id) {
    try {
        const response = await fetch(`api/get-character.php?id=${id}`);
        if (response.ok) {
            const data = await response.json();
            
            document.getElementById('char-id').value = data.id;
            document.getElementById('char-title').value = data.title || '';
            document.getElementById('char-name').value = data.required?.name || '';
            document.getElementById('char-birth').value = data.required?.birthDate || '';
            document.getElementById('char-city').value = data.required?.city || '';
            document.getElementById('char-squad').value = data.required?.squad || '';
            document.getElementById('char-color').value = data.required?.color || '#c91e1e';
            document.getElementById('char-quote').value = data.required?.quote || '';
            document.getElementById('char-description').value = data.required?.description || '';
            document.getElementById('char-styles').value = (data.styles || []).join('\n');
            document.getElementById('char-gallery').value = (data.gallery || []).join('\n');
            document.getElementById('char-height-weight').value = data.info?.heightWeight || '';
            document.getElementById('char-image-type').value = data.info?.image || '';
            document.getElementById('char-activity').value = data.info?.activity || '';
            document.getElementById('image_focus').value = data.image_focus || 'center 50%';
            document.getElementById('image_size').value = data.image_size || 'cover';
            
            if (data.socials) {
                const socials = Object.entries(data.socials).map(([k, v]) => `${k}:${v}`).join('\n');
                document.getElementById('char-socials').value = socials;
            }
            
            loadImages(data.images || {});
            loadSections(data.sections || []);
            
            AdminStorage.saveCharacter(id, data);
            console.log('✅ Загружено из БД:', data.title);
            return;
        }
    } catch (error) {
        console.error('Ошибка загрузки из БД:', error);
    }
    
    const data = AdminStorage.loadCharacter(id);
    if (data) {
        document.getElementById('char-id').value = data.id;
        document.getElementById('char-title').value = data.title || '';
        document.getElementById('char-name').value = data.required?.name || '';
        document.getElementById('char-birth').value = data.required?.birthDate || '';
        document.getElementById('char-city').value = data.required?.city || '';
        document.getElementById('char-squad').value = data.required?.squad || '';
        document.getElementById('char-color').value = data.required?.color || '#c91e1e';
        document.getElementById('char-quote').value = data.required?.quote || '';
        document.getElementById('char-description').value = data.required?.description || '';
        document.getElementById('char-styles').value = (data.styles || []).join('\n');
        document.getElementById('char-gallery').value = (data.gallery || []).join('\n');
        document.getElementById('char-height-weight').value = data.info?.heightWeight || '';
        document.getElementById('char-image-type').value = data.info?.image || '';
        document.getElementById('char-activity').value = data.info?.activity || '';
        document.getElementById('image_focus').value = data.image_focus || 'center 50%';
        document.getElementById('image_size').value = data.image_size || 'cover';
        
        if (data.socials) {
            const socials = Object.entries(data.socials).map(([k, v]) => `${k}:${v}`).join('\n');
            document.getElementById('char-socials').value = socials;
        }
        
        loadImages(data.images || {});
        loadSections(data.sections || []);
        console.log('📦 Загружено из localStorage (резерв)');
    } else {
        createNewCharacter();
    }
}

function createNewCharacter() {
    document.querySelectorAll('#character-form input, #character-form textarea, #character-form select').forEach(el => {
        if (el.id && !el.id.includes('image') && !el.id.includes('section')) el.value = '';
    });
    document.getElementById('char-styles').value = 'Дефолт';
    document.getElementById('char-color').value = '#c91e1e';
    document.getElementById('image_focus').value = 'center 50%';
    document.getElementById('image_size').value = 'cover';
    document.getElementById('images-container').innerHTML = '';
    addImageStyleField('Дефолт', []);
    document.getElementById('sections-container').innerHTML = '';
    addSection();
}

async function saveCharacter(event) {
    event.preventDefault();
    
    const submitter = event.submitter;
    const action = submitter ? submitter.value : 'publish';
    const status = action === 'draft' ? 'pending' : 'published';
    
    const id = document.getElementById('char-id').value;
    if (!id) {
        alert('Введите ID персонажа');
        return;
    }
    
    const styles = document.getElementById('char-styles').value.split('\n').filter(s => s.trim());
    const gallery = document.getElementById('char-gallery').value.split('\n').filter(s => s.trim());
    
    const socials = {};
    document.getElementById('char-socials').value.split('\n').forEach(line => {
        const [key, url] = line.split(':');
        if (key && url) socials[key.trim()] = url.trim();
    });
    
    const images = {};
    document.querySelectorAll('.image-style-item').forEach(item => {
        const styleName = item.querySelector('.image-style-name').value;
        const urls = item.querySelector('.image-style-urls').value.split('\n').filter(s => s.trim());
        if (styleName && urls.length) images[styleName] = urls;
    });
    
    const sections = [];
    document.querySelectorAll('.section-item').forEach(sectionDiv => {
        const title = sectionDiv.querySelector('.section-title').value;
        const type = sectionDiv.querySelector('.section-type').value;
        if (!title) return;
        
        let content = null;
        if (type === 'text') {
            content = sectionDiv.querySelector('.section-content').value;
        } else if (type === 'subsection') {
            content = [];
            sectionDiv.querySelectorAll('.subsection-item').forEach(sub => {
                const subtitle = sub.querySelector('.subsection-title').value;
                const text = sub.querySelector('.subsection-text').value;
                if (subtitle && text) content.push({ subtitle, text });
            });
        } else if (type === 'list') {
            content = [];
            sectionDiv.querySelectorAll('.list-item input').forEach(input => {
                if (input.value) content.push(input.value);
            });
        } else if (type === 'text-with-list') {
            const textBefore = sectionDiv.querySelector('.section-text-before').value;
            const list = [];
            sectionDiv.querySelectorAll('.list-item input').forEach(input => {
                if (input.value) list.push(input.value);
            });
            content = { textBefore, list };
        }
        
        if (content) sections.push({ title, type, content });
    });
    
    const characterData = {
        id: id,
        title: document.getElementById('char-title').value,
        required: {
            name: document.getElementById('char-name').value,
            birthDate: document.getElementById('char-birth').value,
            city: document.getElementById('char-city').value,
            squad: document.getElementById('char-squad').value,
            color: document.getElementById('char-color').value,
            quote: document.getElementById('char-quote').value,
            description: document.getElementById('char-description').value
        },
        info: {
            heightWeight: document.getElementById('char-height-weight').value,
            image: document.getElementById('char-image-type').value,
            activity: document.getElementById('char-activity').value
        },
        styles: styles,
        images: images,
        gallery: gallery,
        socials: socials,
        sections: sections,
        image_focus: document.getElementById('image_focus').value,
        image_size: document.getElementById('image_size').value,
        status: status
    };
    
    try {
        const response = await fetch('api/save-character.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(characterData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(status === 'published' ? '✅ Опубликовано!' : '📝 Сохранено как черновик');
            AdminStorage.saveCharacter(id, characterData);
            renderCharacterList();
        } else {
            alert('❌ Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка при сохранении в БД');
    }
}

function exportCharacter() {
    const id = document.getElementById('char-id').value;
    AdminStorage.exportToFile(id);
}

function viewCharacterPage() {
    const id = document.getElementById('char-id').value;
    if (id) {
        window.open(`entity.html?type=character&id=${id}`, '_blank');
    } else {
        alert('Сначала сохраните персонажа');
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'admin-login.php';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    setupCharacterSearch();
    renderCharacterList();
    
    if (window.editCharacterId) {
        setTimeout(() => {
            const select = document.getElementById('character-select');
            if (select) {
                select.value = window.editCharacterId;
                loadCharacter(window.editCharacterId);
            }
        }, 500);
    } else {
        createNewCharacter();
    }
    
    const form = document.getElementById('character-form');
    if (form) {
        form.addEventListener('submit', saveCharacter);
    }
});

function setupCharacterSearch() {
    const searchInput = document.getElementById('character-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const select = document.getElementById('character-select');
        const options = select.querySelectorAll('option');
        
        // Сохраняем оригинальный порядок, если нужно
        options.forEach(opt => {
            if (opt.value === '') return; // пропускаем заглушку
            const text = opt.textContent.toLowerCase();
            if (text.includes(query)) {
                opt.style.display = '';
            } else {
                opt.style.display = 'none';
            }
        });
    });
}
let allCharacters = [];

async function renderCharacterList() {
    try {
        const response = await fetch('../get-list.php?type=character&admin=1');
        allCharacters = await response.json();
        
        // Показываем всех при загрузке
        displayCharacters(allCharacters);
        
        AdminStorage.saveList(allCharacters.map(c => c.id));
        console.log('✅ Список загружен:', allCharacters.length);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function displayCharacters(characters) {
    const container = document.getElementById('character-results');
    if (!container) return;
    
    if (characters.length === 0) {
        container.innerHTML = '<div style="padding: 10px; color: #999;">Ничего не найдено</div>';
        return;
    }
    
    container.innerHTML = characters.map(char => `
        <div class="character-result" data-id="${char.id}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;">
            ${char.name}
        </div>
    `).join('');
    
    // Добавляем обработчики кликов
    document.querySelectorAll('.character-result').forEach(el => {
        el.addEventListener('click', () => {
            loadCharacter(el.dataset.id);
            // Очищаем поиск
            document.getElementById('character-search').value = '';
            displayCharacters(allCharacters);
        });
    });
}

function setupCharacterSearch() {
    const searchInput = document.getElementById('character-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            displayCharacters(allCharacters);
            return;
        }
        
        const filtered = allCharacters.filter(char => 
            char.name.toLowerCase().includes(query)
        );
        displayCharacters(filtered);
    });
}