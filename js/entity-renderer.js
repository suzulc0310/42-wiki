const EntityRenderer = {
    currentData: null,
    currentStyle: 'Дефолт',
    entityType: 'character',
    async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type') || 'character';
    
    console.log("Пытаемся загрузить ID:", id);

    if (!id || id === 'undefined') {
        this.showError('Персонаж не указан (ID undefined)');
        return;
    }

    if (window.NavigationLoader) {
        await window.NavigationLoader.loadCharacterList();
    }

    this.entityType = type;
    await this.loadEntity(type, id);
    
    this.setupEditButton();
},

setupEditButton() {
    const editBtn = document.getElementById('action-edit');
    if (editBtn && this.currentData && this.currentData.id) {
        // Убираем старый обработчик, если был
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        
        newEditBtn.onclick = (e) => {
            e.preventDefault();
            window.location.href = `admin.php?edit=${this.currentData.id}`;
        };
    }
},
    async loadEntity(type, id) {
        try {
            const url = `get-entity.php?type=${type}&id=${id}`; 
            const response = await fetch(url);
            if (!response.ok) throw new Error('Файл не найден');
            this.currentData = await response.json();
            this.setCharacterColor(this.currentData.required?.color || '#c91e1e');
            if (type === 'character') {
                this.currentStyle = localStorage.getItem('currentStyle') || this.currentData.styles?.[0] || 'Дефолт';
            }
            this.renderAll();
            document.getElementById('page-title').textContent = 
                `${this.currentData.title} — 42 вики`;
        } catch (error) {
            console.error('Ошибка:', error);
            this.showError(`${type} не найден`);
        }
    },
    renderAll() {
        this.renderHeader();
        if (this.entityType === 'character') {
            this.renderStyleButtons();
            this.renderStyleGallery();
            this.renderQuote();
        } else {
            document.getElementById('style-list').style.display = 'none';
            document.getElementById('style-gallery').style.display = 'none';
            document.getElementById('quote-block').style.display = 'none';
        }
        this.renderInfoCard();
        this.renderDescription();
        this.renderSections();
        if (this.entityType === 'character') {
            this.renderGallery();
        } else if (this.entityType === 'squad') {
            this.renderMembers();
        }
        this.renderTableOfContents();
        setTimeout(() => {
            if (window.imageModalInstance) {
                window.imageModalInstance.refresh();
            }
        }, 100);
        if (this.entityType === 'character') {
            this.calculateAge();
        }
        if (window.imageModalInstance) {
        window.imageModalInstance.reinit();
        }
    },
    renderHeader() {
        document.getElementById('entity-name').textContent = this.currentData.title;
        document.getElementById('aside-title').textContent = this.currentData.title;
    },
    renderInfoCard() {
        const container = document.getElementById('info-section');
        const data = this.currentData;
        let html = '';
        
        Object.entries(data.required || {}).forEach(([key, value]) => {
            if (!value) return;
            if (key === 'color' || key === 'quote' || key === 'description') {
                return;
            }
            
            let label = {
                'name': 'Имя',
                'founded': 'Основан',
                'city': 'Город(а)',
                'leader': 'Лидер',
                'membersCount': 'Участников',
                'meetingPlace': 'Место сбора',
                'activity': 'Деятельность',
                'birthDate': 'Дата рождения',
                'squad': 'Сквад'
            }[key] || key;
            
            let displayValue = value;
            if (key === 'city' && Array.isArray(value)) {
                displayValue = value.join(', ');
            }
            
            if (key === 'leader') {
                displayValue = `<a href="entity.html?type=character&id=${value}">${this.getCharacterName(value)}</a>`;
            }
            
            html += `<div class="aside_info"><h3>${label}</h3><p>${displayValue}</p></div>`;
        });
        if (data.info) {
            Object.entries(data.info).forEach(([key, value]) => {
                const label = {
                    heightWeight: 'Рост и вес',
                    image: 'Образ',
                    activity: 'Род деятельности'
                }[key] || key;
                
                html += `<div class="aside_info"><h3>${label}</h3><p>${value}</p></div>`;
            });
        }
        
        if (data.socials && Object.keys(data.socials).length > 0) {
            let socialHtml = '';
            Object.entries(data.socials).forEach(([key, url]) => {
                const icon = this.getSocialIcon(key);
                socialHtml += `<a href="${url}">${icon} ${key}</a><br>`;
            });
            html += `<div class="aside_info"><h3>Соц. сети</h3><p>${socialHtml}</p></div>`;
        }
        
        container.innerHTML = html;
    },
    renderDescription() {
        const desc = document.getElementById('entity-description');
        if (this.currentData.required?.description) {
            desc.textContent = this.currentData.required.description;
        }
    },
    renderQuote() {
        const block = document.getElementById('quote-block');
        const text = document.getElementById('quote-text');
        const author = document.getElementById('quote-author');
        if (this.currentData.required?.quote) {
            text.textContent = this.currentData.required.quote;
            author.textContent = this.currentData.title;
            block.style.display = 'flex';
        } else {
            block.style.display = 'none';
        }
    },
    renderSections() {
        const container = document.getElementById('content-sections');
        if (!this.currentData.sections || this.currentData.sections.length === 0) return;
        let html = '';
        this.currentData.sections.forEach(section => {
            const sectionId = this.slugify(section.title);
            html += `<h2 id="${sectionId}">${section.title}</h2>`;
            switch(section.type) {
                case 'text':
                    html += `<p>${this.processTextWithLinks(section.content)}</p>`;
                    break;
                case 'subsection':
                    section.content.forEach(sub => {
                        const subId = this.slugify(sub.subtitle);
                        html += `<h3 id="${subId}">${sub.subtitle}</h3>`;
                        html += `<p>${this.processTextWithLinks(sub.text)}</p>`;
                    });
                    break;
                case 'list':
                    html += '<ul>';
                    section.content.forEach(item => {
                        html += `<li>${this.processTextWithLinks(item)}</li>`;
                    });
                    html += '</ul>';
                    break;
                case 'text-with-list':
                    if (section.content.textBefore) {
                        html += `<p>${this.processTextWithLinks(section.content.textBefore)}</p>`;
                    }
                    if (section.content.list && section.content.list.length > 0) {
                        html += '<ul>';
                        section.content.list.forEach(item => {
                            html += `<li>${this.processTextWithLinks(item)}</li>`;
                        });
                        html += '</ul>';
                    }
                    break;
                case 'mixed':
                    Object.entries(section.content).forEach(([key, value]) => {
                        html += `<h4>${key}</h4>`;
                        if (Array.isArray(value)) {
                            html += '<ul>';
                            value.forEach(item => html += `<li>${this.processTextWithLinks(item)}</li>`);
                            html += '</ul>';
                        } else {
                            html += `<p>${this.processTextWithLinks(value)}</p>`;
                        }
                    });
                    break;
            }
            html += '<hr>';
        });
        container.innerHTML = html;
    },
    renderMembers() {
        const title = document.getElementById('members-title');
        const container = document.getElementById('members-list');
        if (this.currentData.members && this.currentData.members.length > 0) {
            title.style.display = 'block';
            container.style.display = 'block';
            let html = '<div class="members-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">';
            this.currentData.members.forEach(memberId => {
                html += `
                    <div class="member-card" onclick="location.href='entity.html?type=character&id=${memberId}'" style="border: 1px solid rgba(var(--default), 0.3); border-radius: 8px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.3s;">
                        <div class="member-name" style="font-weight: bold; color: rgba(var(--default));">${this.getCharacterName(memberId)}</div>
                        <div class="member-role" style="font-size: 0.9em; color: #666;">участник</div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    },
    renderGallery() {
        const title = document.getElementById('gallery-title');
        const gallery = document.getElementById('bottom-gallery');
        
        if (this.currentData.gallery && this.currentData.gallery.length > 0) {
            title.style.display = 'block';
            gallery.style.display = 'flex';
            gallery.innerHTML = '';
            
            this.currentData.gallery.forEach((src, index) => {
                const div = document.createElement('div');
                div.className = 'gallery_img';
                const img = document.createElement('img');
                img.src = src + '?t=' + Date.now() + index;
                img.alt = '';
                img.style.cursor = 'pointer';
                img.onerror = () => {
                    img.src = 'https://via.placeholder.com/300x200?text=Image+not+found';
                };
                div.appendChild(img);
                gallery.appendChild(div);
            });
        }
    },

    renderStyleGallery() {
        const container = document.getElementById('style-gallery');
        if (!this.currentData.images) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = '';
        container.style.display = 'block';
        
        Object.entries(this.currentData.images).forEach(([styleName, imageUrls]) => {
            imageUrls.forEach((src, idx) => {
                const img = document.createElement('img');
                img.src = src + '?t=' + Date.now() + idx;
                img.dataset.style = styleName;
                img.alt = `${this.currentData.title} - ${styleName}`;
                img.style.display = styleName === this.currentStyle ? 'block' : 'none';
                img.style.cursor = 'pointer';
                img.onerror = () => {
                    img.src = 'https://via.placeholder.com/300x200?text=Image+not+found';
                };
                container.appendChild(img);
            });
        });
    },
    renderStyleButtons() {
        const container = document.getElementById('style-list');
        if (!this.currentData.styles || this.currentData.styles.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.innerHTML = '';
        container.style.display = 'flex';
        this.currentData.styles.forEach(style => {
            const li = document.createElement('li');
            li.textContent = style;
            li.dataset.style = style;
            if (style === this.currentStyle) {
                li.classList.add('active');
            }
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchStyle(style);
            });
            li.style.cursor = 'pointer';
            container.appendChild(li);
        });
    },
    renderStyleGallery() {
        const container = document.getElementById('style-gallery');
        if (!this.currentData.images) {
            container.style.display = 'none';
            return;
        }
        container.innerHTML = '';
        container.style.display = 'block';
        Object.entries(this.currentData.images).forEach(([styleName, imageUrls]) => {
            imageUrls.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.dataset.style = styleName;
                img.alt = `${this.currentData.title} - ${styleName}`;
                if (styleName === this.currentStyle) {
                    img.style.display = 'block';
                } else {
                    img.style.display = 'none';
                }
                img.style.cursor = 'pointer';
                container.appendChild(img);
            });
        });
    },
    switchStyle(styleName) {
        if (styleName === this.currentStyle) return;
        console.log('Переключение на стиль:', styleName);
        const buttons = document.querySelectorAll('#style-list li');
        buttons.forEach(btn => {
            if (btn.dataset.style === styleName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        this.showImagesForStyle(styleName);
        this.currentStyle = styleName;
        localStorage.setItem('currentStyle', styleName);
        const event = new CustomEvent('styleChanged', { 
            detail: { styleName: styleName } 
        });
        document.dispatchEvent(event);
    },
    showImagesForStyle(styleName) {
        const gallery = document.getElementById('style-gallery');
        if (!gallery) return;
        const images = gallery.querySelectorAll('img');
        if (!images.length) return;
        images.forEach(img => {
            if (img.dataset.style === styleName) {
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });
    },
    renderTableOfContents() {
        const toc = document.getElementById('table-of-contents');
        const tocList = document.getElementById('toc-list');
        const content = document.getElementById('content-sections');
        if (!content) return;
        const headings = content.querySelectorAll('h2, h3');
        if (headings.length === 0) {
            toc.style.display = 'none';
            return;
        }
        toc.style.display = 'table';
        let tocHtml = '';
        let mainCounter = 0;
        let subCounter = 0;
        let lastMainIndex = -1;
        headings.forEach((heading, index) => {
            const tagName = heading.tagName;
            const id = heading.id || this.slugify(heading.textContent);
            heading.id = id;
            if (tagName === 'H2') {
                mainCounter++;
                subCounter = 0;
                lastMainIndex = index;
                tocHtml += `
                    <li class="toclevel-1">
                        <a href="#${id}">
                            <span class="tocnumber">${mainCounter}.</span>
                            <span class="toctext">${heading.textContent}</span>
                        </a>
                    </li>
                `;
            } else if (tagName === 'H3') {
                subCounter++;
                const prevHeading = headings[lastMainIndex];
                const mainNumber = prevHeading && prevHeading.tagName === 'H2' ? mainCounter : '?';
                tocHtml += `
                    <li class="toclevel-2" style="margin-left: 20px;">
                        <a href="#${id}">
                            <span class="tocnumber">${mainNumber}.${subCounter}</span>
                            <span class="toctext">${heading.textContent}</span>
                        </a>
                    </li>
                `;
            }
        });
        tocList.innerHTML = tocHtml;
    },
    getCharacterName(id) {
        const char = NavigationLoader.characterList?.find(c => c.id === id);
        return char ? char.name : id;
    },
    processTextWithLinks(text) {
        if (!text) return text;
        const characters = NavigationLoader.characterList || [];
        let result = text;
        characters.forEach(char => {
            const namePattern = new RegExp(`\\b${char.name}\\b`, 'g');
            result = result.replace(namePattern, 
                `<a href="entity.html?type=character&id=${char.id}" class="entity-link" style="color: rgba(var(--default)); text-decoration: none; font-weight: bold; border-bottom: 1px dashed rgba(var(--default), 0.3); transition: all 0.3s;">${char.name}</a>`);
        });
        return result;
    },
    getSocialIcon(network) {
        const icons = {
            telegram: '<svg width="20px" viewBox="0 0 32 32"><path d="M29.919 6.163l-4.225 19.925c-0.319 1.406-1.15 1.756-2.331 1.094l-6.438-4.744-3.106 2.988c-0.344 0.344-0.631 0.631-1.294 0.631l0.463-6.556 11.931-10.781c0.519-0.462-0.113-0.719-0.806-0.256l-14.75 9.288-6.35-1.988c-1.381-0.431-1.406-1.381 0.288-2.044l24.837-9.569c1.15-0.431 2.156 0.256 1.781 2.013z"/></svg>',
            vk: '<svg width="20" height="20" viewBox="0 0 28 28"><path d="M16.563 15.75c-0.5-0.188-0.5-0.906-0.531-1.406-0.125-1.781 0.5-4.5-0.25-5.656-0.531-0.688-3.094-0.625-4.656-0.531-0.438 0.063-0.969 0.156-1.344 0.344s-0.75 0.5-0.75 0.781c0 0.406 0.938 0.344 1.281 0.875 0.375 0.563 0.375 1.781 0.375 2.781 0 1.156-0.188 2.688-0.656 2.75-0.719 0.031-1.125-0.688-1.5-1.219-0.75-1.031-1.5-2.313-2.063-3.563-0.281-0.656-0.438-1.375-0.844-1.656-0.625-0.438-1.75-0.469-2.844-0.438-1 0.031-2.438-0.094-2.719 0.5-0.219 0.656 0.25 1.281 0.5 1.813 1.281 2.781 2.656 5.219 4.344 7.531 1.563 2.156 3.031 3.875 5.906 4.781 0.813 0.25 4.375 0.969 5.094 0 0.25-0.375 0.188-1.219 0.313-1.844s0.281-1.25 0.875-1.281c0.5-0.031 0.781 0.406 1.094 0.719 0.344 0.344 0.625 0.625 0.875 0.938 0.594 0.594 1.219 1.406 1.969 1.719 1.031 0.438 2.625 0.313 4.125 0.25 1.219-0.031 2.094-0.281 2.188-1 0.063-0.563-0.563-1.375-0.938-1.844-0.938-1.156-1.375-1.5-2.438-2.563-0.469-0.469-1.063-0.969-1.063-1.531-0.031-0.344 0.25-0.656 0.5-1 1.094-1.625 2.188-2.781 3.188-4.469 0.281-0.5 0.938-1.656 0.688-2.219-0.281-0.625-1.844-0.438-2.813-0.438-1.25 0-2.875-0.094-3.188 0.156-0.594 0.406-0.844 1.063-1.125 1.688-0.625 1.438-1.469 2.906-2.344 4-0.313 0.375-0.906 1.156-1.25 1.031z"/></svg>',
            twitch: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M2.547 1L1 4.776v15.433h5.5V23h3.093l2.922-2.791h4.47L23 14.462V1zm18.39 12.478L17.5 16.76H12l-2.922 2.791v-2.79h-4.64V2.97h16.499zM17.5 6.747v5.74h-2.063v-5.74zm-5.5 0v5.74H9.938v-5.74z"/></svg>',
            tiktok: '<svg width="20" height="20" viewBox="0 0 1024 1024"><path fill="currentColor" d="M530.014 112.667c43.666-.667 86.997-.334 130.328-.667c2.667 51 21 102.999 58.33 138.998c37.332 37 89.997 54 141.328 59.666v134.332c-47.998-1.667-96.33-11.667-139.994-32.333c-19-8.667-36.665-19.667-53.998-31c-.333 97.332.334 194.665-.666 291.663c-2.667 46.666-18 93-44.998 131.332c-43.665 64-119.328 105.665-196.992 106.999c-47.664 2.666-95.329-10.334-135.994-34.333c-67.33-39.666-114.662-112.332-121.661-190.331c-.667-16.667-1-33.333-.334-49.666c6-63.333 37.332-123.999 85.997-165.332c55.33-47.999 132.66-70.999 204.99-57.332c.667 49.333-1.332 98.665-1.332 147.998c-33-10.667-71.664-7.667-100.663 12.333c-20.999 13.667-36.998 34.666-45.331 58.333c-7 17-5 35.666-4.667 53.666c8 54.666 60.664 100.665 116.662 95.665c37.332-.333 72.997-22 92.33-53.666c6.332-11 13.332-22.333 13.665-35.333c3.334-59.666 2-118.998 2.334-178.664c.333-134.332-.334-268.33.666-402.328"/></svg>',
            soundcloud: '<svg width="24" height="24" viewBox="0 0 50 50"><path fill="currentColor" d="M40 24h-.2c-.9-4.6-5-8-9.8-8c-3.1 0-5.9 1.4-7.7 3.7c-.2.3-.3.6-.3 1.2l-.4 9.1l.4 5.5c0 .3.3.5.5.5H40c3.3 0 6-2.7 6-6s-2.7-6-6-6m-21.1-4c-.3 0-.5.2-.5.5l-.8 9v1l.8 5c0 .3.3.5.6.5h.2c.3 0 .5-.2.6-.5l.8-5c0-.3.1-.7 0-1l-.8-9c0-.3-.3-.5-.5-.5zm-4 1c-.3 0-.5.2-.5.5l-.8 8v1l.8 5c0 .3.3.5.6.5h.2c.3 0 .5-.2.6-.5l.8-5c0-.3.1-.7 0-1l-.8-8c0-.3-.3-.5-.5-.5zM11 24c-.3 0-.5.2-.6.5l-.8 5v1l.8 5c0 .3.3.5.6.5s.5-.2.6-.5l.8-5v-1l-.8-5c-.1-.3-.3-.5-.6-.5m-4-1c-.3 0-.5.2-.6.5l-.9 6v1l.8 5c.2.3.4.5.7.5c.3 0 .5-.2.6-.5l.8-5c0-.3.1-.7 0-1l-.9-6c0-.3-.2-.5-.5-.5m-3.7 3c-.3 0-.5.2-.6.5l-.6 3c-.1.3-.1.7 0 1l.6 4c.1.3.3.5.6.5s.5-.2.6-.5l.6-4v-1l-.6-3c-.1-.3-.3-.5-.6-.5"/></svg>',
            youtube: '<svg viewBox="0 -6 20 20" width="20px"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>youtube [#168]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-300.000000, -7442.000000)" fill="currentColor"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M251.988432,7291.58588 L251.988432,7285.97425 C253.980638,7286.91168 255.523602,7287.8172 257.348463,7288.79353 C255.843351,7289.62824 253.980638,7290.56468 251.988432,7291.58588 M263.090998,7283.18289 C262.747343,7282.73013 262.161634,7282.37809 261.538073,7282.26141 C259.705243,7281.91336 248.270974,7281.91237 246.439141,7282.26141 C245.939097,7282.35515 245.493839,7282.58153 245.111335,7282.93357 C243.49964,7284.42947 244.004664,7292.45151 244.393145,7293.75096 C244.556505,7294.31342 244.767679,7294.71931 245.033639,7294.98558 C245.376298,7295.33761 245.845463,7295.57995 246.384355,7295.68865 C247.893451,7296.0008 255.668037,7296.17532 261.506198,7295.73552 C262.044094,7295.64178 262.520231,7295.39147 262.895762,7295.02447 C264.385932,7293.53455 264.28433,7285.06174 263.090998,7283.18289" id="youtube-[#168]"> </path> </g> </g> </g> </g></svg>'
        };
        return icons[network] || '🔗';
    },
    setCharacterColor(hexColor) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        const rgb = result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '201, 30, 30';
        document.documentElement.style.setProperty('--default', rgb);
    },
    slugify(text) {
        return text.toLowerCase()
            .replace(/[^а-яa-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    },
    calculateAge() {
        document.querySelectorAll('.aside_info').forEach(i => {
            let h = i.querySelector('h3');
            let p = i.querySelector('p');
            if (h && p && h.textContent.includes('Дата рождения') && !p.textContent.includes('(')) {
                let months = {
                    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
                    'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
                    'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
                };
                let match = p.textContent.match(/(\d{1,2})\s+([а-я]+)\s+(\d{4})/i);
                if (match && months[match[2].toLowerCase()] !== undefined) {
                    let day = parseInt(match[1]);
                    let month = months[match[2].toLowerCase()];
                    let year = parseInt(match[3]);
                    let birthDate = new Date(year, month, day);
                    let today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    if (today.getMonth() < birthDate.getMonth() || 
                        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    p.textContent += ` (${age} лет)`;
                }
            }
        });
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
    EntityRenderer.init();
});