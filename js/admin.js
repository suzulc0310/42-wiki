const AdminStorage = {
    LIST_KEY: '42wiki_characters_list',
    getList() {
        const list = localStorage.getItem(this.LIST_KEY);
        return list ? JSON.parse(list) : ['bucefal', 'spnx', 'sunsrike', 'tupitsa', 'sankashtormovoi', 'ohreneniy'];
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
        const images = {};
        document.querySelectorAll('.image-style-item').forEach(item => {
            const styleName = item.querySelector('.image-style-name')?.value;
            const urls = item.querySelector('.image-style-urls')?.value
                .split('\n')
                .map(s => s.trim())
                .filter(s => s);
            if (styleName && urls.length > 0) {
                images[styleName] = urls;
            }
        });
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
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    div.style.margin = '10px 0';
    div.style.borderRadius = '5px';
    div.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="image-style-name" placeholder="Название стиля" value="${styleName}" style="flex-grow: 1; padding: 5px;">
            <button type="button" class="remove-image-style" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌ Удалить</button>
        </div>
        <textarea class="image-style-urls" rows="3" placeholder="Ссылки на фото (по одной на строку)" style="width: 100%;">${urls.join('\n')}</textarea>
    `;
    const removeBtn = div.querySelector('.remove-image-style');
    removeBtn.onclick = function(e) {
        e.preventDefault();
        if (confirm('Удалить этот блок стиля?')) {
            div.remove();
        }
    };
    container.appendChild(div);
}
function loadImages(images) {
    const container = document.getElementById('images-container');
    container.innerHTML = '';
    if (!images || Object.keys(images).length === 0) {
        // Если нет изображений, создаем поле для первого стиля
        const styles = document.getElementById('char-styles').value.split('\n').filter(s => s.trim());
        if (styles.length > 0) {
            styles.forEach(style => {
                addImageStyleField(style, []);
            });
        } else {
            addImageStyleField('Дефолт', []);
        }
        return;
    }
    Object.entries(images).forEach(([style, urls]) => {
        addImageStyleField(style, urls);
    });
}
async function loadCharacterFromFile(id) {
    try {
        const response = await fetch(`data/${id}.json`);
        if (!response.ok) throw new Error('Файл не найден');
        const data = await response.json();
        AdminStorage.saveCharacter(id, data);
        loadCharacter(id);
        alert(`Загружен ${id} из файла`);
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        alert('Файл не найден');
    }
}
function renderCharacterList() {
    const list = AdminStorage.getList();
    const container = document.getElementById('character-buttons');
    container.innerHTML = list.map(id => `
        <div style="display: inline-block; margin: 5px;">
            <button class="character-btn" onclick="loadCharacter('${id}')">${id}</button>
            <button onclick="loadCharacterFromFile('${id}')" title="Загрузить из файла">📂</button>
        </div>
    `).join('');
}
function loadCharacter(id) {
    const data = AdminStorage.loadCharacter(id);
    if (!data) {
        createNewCharacter();
        return;
    }
    if (data.images) {
    loadImages(data.images);
    } else {
        const styles = data.styles || ['Дефолт'];
        const imagesObj = {};
        styles.forEach(style => {
            imagesObj[style] = [];
        });
        loadImages(imagesObj);
    }
    document.getElementById('char-id').value = data.id || id;
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
    if (data.socials) {
        const socials = Object.entries(data.socials)
            .map(([key, value]) => `${key}:${value}`)
            .join('\n');
        document.getElementById('char-socials').value = socials;
    }
    loadSections(data.sections || []);
}
function createNewCharacter() {
    document.getElementById('char-id').value = '';
    document.getElementById('char-title').value = '';
    document.getElementById('char-name').value = '';
    document.getElementById('char-birth').value = '';
    document.getElementById('char-city').value = '';
    document.getElementById('char-squad').value = '';
    document.getElementById('char-color').value = '#c91e1e';
    document.getElementById('char-quote').value = '';
    document.getElementById('char-description').value = '';
    document.getElementById('char-styles').value = 'Дефолт';
    document.getElementById('char-gallery').value = '';
    document.getElementById('char-socials').value = '';
    document.getElementById('sections-container').innerHTML = '';
    addSection();
}
function saveCharacter(event) {
    event.preventDefault();
    const id = document.getElementById('char-id').value;
    if (!id) {
        alert('Введите ID персонажа');
        return;
    }
    const styles = document.getElementById('char-styles').value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s);
    const gallery = document.getElementById('char-gallery').value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s);
    const socials = {};
    document.getElementById('char-socials').value
        .split('\n')
        .filter(line => line.includes(':'))
        .forEach(line => {
            const [key, url] = line.split(':');
            socials[key.trim()] = url.trim();
        });
    const sections = [];
    document.querySelectorAll('.section-item').forEach(sectionDiv => {
        const title = sectionDiv.querySelector('.section-title')?.value;
        const type = sectionDiv.querySelector('.section-type')?.value;
        if (!title) return;
        let content = null;
        if (type === 'text') {
            content = sectionDiv.querySelector('.section-content')?.value || '';
        } 
        else if (type === 'subsection') {
            content = [];
            sectionDiv.querySelectorAll('.subsection-item').forEach(sub => {
                const subtitle = sub.querySelector('.subsection-title')?.value;
                const text = sub.querySelector('.subsection-text')?.value;
                if (subtitle && text) {
                    content.push({ subtitle, text });
                }
            });
        } 
        else if (type === 'list') {
            content = [];
            sectionDiv.querySelectorAll('.list-item input').forEach(input => {
                if (input.value) content.push(input.value);
            });
        }
        else if (type === 'text-with-list') {
            const textBefore = sectionDiv.querySelector('.section-text-before')?.value || '';
            const listItems = [];
            sectionDiv.querySelectorAll('.list-item input').forEach(input => {
                if (input.value) listItems.push(input.value);
            });
            content = {
                textBefore: textBefore,
                list: listItems
            };
        }       
        else if (type === 'mixed') {
            content = {};
        }
        if (content && (typeof content === 'string' ? content : content.length > 0)) {
            sections.push({ title, type, content });
        }
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
        styles: styles,
        images: images,
        gallery: gallery,
        socials: socials,
        sections: sections,
        lastUpdated: new Date().toISOString()
    };
    AdminStorage.saveCharacter(id, characterData);
    alert('Сохранено!');
    renderCharacterList();
}
function exportCharacter() {
    const id = document.getElementById('char-id').value;
    AdminStorage.exportToFile(id);
}
function loadSections(sections) {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    if (!sections || sections.length === 0) {
        addSection();
        return;
    }
    sections.forEach((section, index) => {
        addSection(section, index);
    });
}
function addSection(sectionData = null, index = null) {
    const container = document.getElementById('sections-container');
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    sectionDiv.style.border = '1px solid #ccc';
    sectionDiv.style.padding = '15px';
    sectionDiv.style.margin = '10px 0';
    sectionDiv.style.borderRadius = '5px';
    const title = sectionData?.title || '';
    const type = sectionData?.type || 'text';
    const content = sectionData?.content || '';
    let contentHtml = '';
    if (type === 'text') {
        contentHtml = `<textarea class="section-content" rows="4" placeholder="Текст секции" style="width: 100%;">${content}</textarea>`;
    } 
    else if (type === 'subsection') {
        const subs = sectionData?.content || [];
        contentHtml = '<div class="subsections-container">';
        subs.forEach((sub, i) => {
            contentHtml += `
                <div class="subsection-item" style="margin-left: 20px; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                    <input type="text" class="subsection-title" placeholder="Подзаголовок" value="${sub.subtitle || ''}" style="width: 100%; margin-bottom: 5px; padding: 5px;">
                    <textarea class="subsection-text" rows="3" placeholder="Текст подраздела" style="width: 100%; margin-bottom: 5px; padding: 5px;">${sub.text || ''}</textarea>
                    <button type="button" class="remove-subsection-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌ Удалить подраздел</button>
                </div>
            `;
        });
        contentHtml += `
            <button type="button" class="add-subsection-btn" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">➕ Добавить подраздел</button>
        </div>`;
    } 
    else if (type === 'list') {
        const items = Array.isArray(content) ? content : [];
        contentHtml = '<div class="list-items-container">';
        items.forEach((item, i) => {
            contentHtml += `
                <div class="list-item" style="margin: 5px 0; display: flex; gap: 5px;">
                    <input type="text" value="${item}" placeholder="Элемент списка" style="flex-grow: 1; padding: 5px;">
                    <button type="button" class="remove-list-item-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌</button>
                </div>
            `;
        });
        contentHtml += `
            <button type="button" class="add-list-item-btn" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">➕ Добавить элемент</button>
        </div>`;
    }
    else if (type === 'mixed') {
        contentHtml = `<textarea class="section-content" rows="4" placeholder="Смешанный контент (в разработке)" style="width: 100%;" disabled>${typeof content === 'string' ? content : JSON.stringify(content)}</textarea>`;
    }
    sectionDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; gap: 10px;">
            <input type="text" class="section-title" placeholder="Название секции" value="${title}" style="flex-grow: 1; padding: 5px;">
            <select class="section-type" style="padding: 5px;">
                <option value="text" ${type === 'text' ? 'selected' : ''}>Текст</option>
                <option value="subsection" ${type === 'subsection' ? 'selected' : ''}>Подразделы</option>
                <option value="list" ${type === 'list' ? 'selected' : ''}>Список</option>
                <option value="mixed" ${type === 'mixed' ? 'selected' : ''}>Смешанный</option>
            </select>
            <button type="button" class="remove-section-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌ Удалить</button>
        </div>
        <div class="section-content-area">
            ${contentHtml}
        </div>
    `;
    const removeBtn = sectionDiv.querySelector('.remove-section-btn');
    removeBtn.onclick = function(e) {
        e.preventDefault();
        if (confirm('Удалить эту секцию?')) {
            sectionDiv.remove();
        }
    };
    const typeSelect = sectionDiv.querySelector('.section-type');
    typeSelect.onchange = function(e) {
        e.preventDefault();
        changeSectionType(this, sectionDiv);
    };
    const addSubsectionBtn = sectionDiv.querySelector('.add-subsection-btn');
    if (addSubsectionBtn) {
        addSubsectionBtn.onclick = function(e) {
            e.preventDefault();
            addSubsection(this);
        };
    }
    const removeSubsectionBtns = sectionDiv.querySelectorAll('.remove-subsection-btn');
    removeSubsectionBtns.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            if (confirm('Удалить этот подраздел?')) {
                this.closest('.subsection-item').remove();
            }
        };
    });
    const addListItemBtn = sectionDiv.querySelector('.add-list-item-btn');
    if (addListItemBtn) {
        addListItemBtn.onclick = function(e) {
            e.preventDefault();
            addListItem(this);
        };
    }
    const removeListItemBtns = sectionDiv.querySelectorAll('.remove-list-item-btn');
    removeListItemBtns.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            if (confirm('Удалить этот элемент?')) {
                this.closest('.list-item').remove();
            }
        };
    });
    container.appendChild(sectionDiv);
}
function changeSectionType(select, sectionDiv) {
    const type = select.value;
    const contentArea = sectionDiv.querySelector('.section-content-area');
    
    let html = '';
    if (type === 'text') {
        html = '<textarea class="section-content" rows="4" placeholder="Текст секции" style="width: 100%;"></textarea>';
    } 
    else if (type === 'subsection') {
        html = `
            <div class="subsections-container">
                <button type="button" class="add-subsection-btn" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">➕ Добавить подраздел</button>
            </div>
        `;
    } 
    else if (type === 'list') {
        html = `
            <div class="list-items-container">
                <button type="button" class="add-list-item-btn" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">➕ Добавить элемент</button>
            </div>
        `;
    }
    else if (type === 'mixed') {
        html = '<textarea class="section-content" rows="4" placeholder="Смешанный контент (в разработке)" style="width: 100%;" disabled></textarea>';
    }
    else if (type === 'text-with-list') {
    html = `
        <div class="text-with-list-container">
            <textarea class="section-text-before" rows="3" placeholder="Текст перед списком" style="width: 100%; margin-bottom: 10px;"></textarea>
            <div class="list-items-container">
                <button type="button" class="add-list-item-btn" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">➕ Добавить элемент списка</button>
            </div>
        </div>
    `;
    }
    contentArea.innerHTML = html;
    const addSubsectionBtn = sectionDiv.querySelector('.add-subsection-btn');
    if (addSubsectionBtn) {
        addSubsectionBtn.onclick = function(e) {
            e.preventDefault();
            addSubsection(this);
        };
    }
    const addListItemBtn = sectionDiv.querySelector('.add-list-item-btn');
    if (addListItemBtn) {
        addListItemBtn.onclick = function(e) {
            e.preventDefault();
            addListItem(this);
        };
    }
}
function addSubsection(btn) {
    const container = btn.closest('.subsections-container');
    const div = document.createElement('div');
    div.className = 'subsection-item';
    div.style.marginLeft = '20px';
    div.style.marginTop = '10px';
    div.style.padding = '10px';
    div.style.background = '#f5f5f5';
    div.style.borderRadius = '5px';
    div.innerHTML = `
        <input type="text" class="subsection-title" placeholder="Подзаголовок" style="width: 100%; margin-bottom: 5px; padding: 5px;">
        <textarea class="subsection-text" rows="3" placeholder="Текст подраздела" style="width: 100%; margin-bottom: 5px; padding: 5px;"></textarea>
        <button type="button" class="remove-subsection-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌ Удалить подраздел</button>
    `;
    const removeBtn = div.querySelector('.remove-subsection-btn');
    removeBtn.onclick = function(e) {
        e.preventDefault();
        if (confirm('Удалить этот подраздел?')) {
            div.remove();
        }
        else if (type === 'text-with-list') {
            const textBefore = sectionData?.content?.textBefore || '';
            const listItems = sectionData?.content?.list || [];
            contentHtml = `
                <div class="text-with-list-container">
                    <textarea class="section-text-before" rows="3" placeholder="Текст перед списком" style="width: 100%; margin-bottom: 10px;">${textBefore}</textarea>
                    <div class="list-items-container">
                        ${listItems.map(item => `
                            <div class="list-item" style="margin: 5px 0; display: flex; gap: 5px;">
                                <input type="text" value="${item}" placeholder="Элемент списка" style="flex-grow: 1; padding: 5px;">
                                <button type="button" class="remove-list-item-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌</button>
                            </div>
                        `).join('')}
                        <button type="button" class="add-list-item-btn" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">➕ Добавить элемент списка</button>
                    </div>
                </div>
            `;
        }
    };
    container.insertBefore(div, btn);
}
function addListItem(btn) {
    const container = btn.closest('.list-items-container');
    const div = document.createElement('div');
    div.className = 'list-item';
    div.style.margin = '5px 0';
    div.style.display = 'flex';
    div.style.gap = '5px';
    div.innerHTML = `
        <input type="text" placeholder="Элемент списка" style="flex-grow: 1; padding: 5px;">
        <button type="button" class="remove-list-item-btn" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌</button>
    `;
    const removeBtn = div.querySelector('.remove-list-item-btn');
    removeBtn.onclick = function(e) {
        e.preventDefault();
        if (confirm('Удалить этот элемент?')) {
            div.remove();
        }
    };
    container.insertBefore(div, btn);
}
document.addEventListener('DOMContentLoaded', () => {
    renderCharacterList();
    createNewCharacter();
    const form = document.getElementById('character-form');
    if (form) {
        form.addEventListener('submit', saveCharacter);
    }
});
async function uploadImages() {
    const files = document.getElementById('image-upload').files;
    if (!files.length) return;
    const progress = document.getElementById('upload-progress');
    const urls = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progress.innerHTML = `Загрузка ${i+1}/${files.length}...`;
        const optimizedImage = await optimizeImage(file);
        const reader = new FileReader();
        const url = await new Promise(resolve => {
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(optimizedImage);
        });
        urls.push(url);
    }
    const gallery = document.getElementById('char-gallery');
    gallery.value += (gallery.value ? '\n' : '') + urls.join('\n');
    progress.innerHTML = 'Готово!';
}
async function optimizeImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            const maxSize = 1200;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height / width) * maxSize);
                    width = maxSize;
                } else {
                    width = Math.round((width / height) * maxSize);
                    height = maxSize;
                }
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Конвертируем в JPEG с качеством 0.8
            canvas.toBlob(resolve, 'image/jpeg', 0.8);
        };
        img.src = URL.createObjectURL(file);
    });
}
function showJSON() {
    const id = document.getElementById('char-id').value;
    const data = AdminStorage.loadCharacter(id);
    if (data) {
        alert(JSON.stringify(data, null, 2));
    } else {
        alert('Данные не найдены');
    }
}
function clearForm() {
    if (confirm('Очистить форму? Все несохраненные данные будут потеряны.')) {
        createNewCharacter();
    }
}