const CURRENT_VERSION = '1.2.0';
const STORAGE_VERSION_KEY = 'app_version';

const lastVersion = localStorage.getItem('siteVersion');
if (lastVersion !== CURRENT_VERSION) {
    if (window.caches) {
        caches.keys().then(keys => {
            keys.forEach(key => caches.delete(key));
        });
    }
    const keep = ['siteVersion'];
    Object.keys(localStorage).forEach(key => {
        if (!keep.includes(key)) {
            localStorage.removeItem(key);
        }
    });
    localStorage.setItem('siteVersion', CURRENT_VERSION);
    window.location.reload(true);
}
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeSidebar');
    if (!menuToggle || !sidebar || !overlay || !closeBtn) return;
    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = ''; 
    }
    menuToggle.addEventListener('click', openSidebar);
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
});
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '201, 30, 30';
}
function setCharacterColor(hexColor) {
    const root = document.documentElement;
    const rgb = hexToRgb(hexColor);
    root.style.setProperty('--default', rgb);
    localStorage.setItem('characterColor', rgb);
}
const modalStyles = `
    .image-modal{
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 5;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    .image-modal.active{
        display: flex;
    }
    .modal-image-container{
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
    }
    .modal-image-container img{
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 30px rgba(0,0,0,0.5);
    }
    .modal-close-btn{
        position: absolute;
        top: -20px;
        right: -20px;
        width: 40px;
        height: 40px;
        background: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform 0.3s;
        z-index: 10000;
    }
    .modal-close-btn:hover{
        transform: scale(1.1);
        background: rgba(var(--default));
        color: white;
    }    
    .modal-nav{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s;
        z-index: 10000;
    }
    .modal-nav:hover{
        background: rgba(var(--default));
        color: white;
    }
    .modal-nav.prev{
        left: -70px;
    }
    .modal-nav.next{
        right: -70px;
    }
    .modal-counter{
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 16px;
        background: rgba(0,0,0,0.5);
        padding: 5px 15px;
        border-radius: 20px;
    }
    @media (max-width: 768px){
        .modal-close-btn {
            top: -30px;
            right: 0;
        }
        .modal-nav{
            width: 40px;
            height: 40px;
            font-size: 18px;
        }        
        .modal-nav.prev{
            left: -20px;
        }        
        .modal-nav.next{
            right: -20px;
        }
    }
`;
const styleSheet = document.createElement("style");
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);
class ImageModal {
    constructor() {
        if (ImageModal.instance) {
            return ImageModal.instance;
        }
        ImageModal.instance = this;
        this.modal = null;
        this.currentIndex = 0;
        this.images = [];
        this.init();
    }
    init() {
        this.createModal();
        this.setupAllImages();
    }
    createModal() {
        const existingModal = document.querySelector('.image-modal');
        if (existingModal) {
            existingModal.remove();
        }
        this.modal = document.createElement('div');
        this.modal.className = 'image-modal';
        this.modal.innerHTML = `
            <div class="modal-image-container">
                <button class="modal-close-btn">&times;</button>
                <button class="modal-nav prev">❮</button>
                <button class="modal-nav next">❯</button>
                <img src="" alt="Увеличенное изображение">
                <div class="modal-counter"></div>
            </div>
        `;
        document.body.appendChild(this.modal);
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        const closeBtn = this.modal.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });
        const prevBtn = this.modal.querySelector('.modal-nav.prev');
        const nextBtn = this.modal.querySelector('.modal-nav.next');
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigate('prev');
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigate('next');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
            if (this.modal.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    this.navigate('prev');
                } else if (e.key === 'ArrowRight') {
                    this.navigate('next');
                }
            }
        });
    }
    isLogoImage(img) {
        if (img.closest('.logo')) return true;
        const alt = img.alt?.toLowerCase() || '';
        if (alt.includes('логотип') || alt.includes('logo')) return true;
        const src = img.src?.toLowerCase() || '';
        if (src.includes('logo') || src.includes('header')) return true;
        if (img.width < 50 || img.height < 50) return true;
        if (img.closest('.main_logo')) return true;
        if (img.closest('header')) {
            if (img.width < 100 && img.height < 100) return true;
        }
        return false;
    }
    setupAllImages() {
        const allImages = document.querySelectorAll('img');
        allImages.forEach((img) => {
            if (this.isLogoImage(img)) {
                img.removeEventListener('click', this.handleImageClick);
                return;
            }
            img.removeEventListener('click', this.handleImageClick);
            this.handleImageClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.images = [];
                document.querySelectorAll('img').forEach(image => {
                    if (this.isLogoImage(image)) return;
                    this.images.push({
                        src: image.src,
                        alt: image.alt || 'Изображение'
                    });
                });
                const allImagesArray = Array.from(document.querySelectorAll('img')).filter(image => {
                    return !this.isLogoImage(image);
                });
                this.currentIndex = allImagesArray.findIndex(image => image.src === img.src);
                if (this.currentIndex !== -1) {
                    this.open(this.currentIndex);
                }
            };
            img.addEventListener('click', this.handleImageClick);
            img.style.cursor = 'pointer';
        });
    }
    refresh() {
        this.setupAllImages();
    }
    open(index) {
        if (this.images.length > 0 && index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.updateModalImage();
            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            const prevBtn = this.modal.querySelector('.modal-nav.prev');
            const nextBtn = this.modal.querySelector('.modal-nav.next');
            const counter = this.modal.querySelector('.modal-counter');
            if (this.images.length > 1) {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
                counter.style.display = 'block';
                counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
            } else {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                counter.style.display = 'none';
            }
        }
    }
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = ''; 
    }
    navigate(direction) {
        if (direction === 'prev') {
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        }
        this.updateModalImage();
    }
    updateModalImage() {
        const modalImg = this.modal.querySelector('img');
        const counter = this.modal.querySelector('.modal-counter');
        if (this.images[this.currentIndex]) {
            modalImg.src = this.images[this.currentIndex].src;
            modalImg.alt = this.images[this.currentIndex].alt;
            if (this.images.length > 1) {
                counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (!window.imageModalInstance) {
        window.imageModalInstance = new ImageModal();
    }
});
window.ImageModal = ImageModal;
function distributeGallery() {
    if (window.innerWidth < 1260) return;
    const galleries = document.querySelectorAll('.flex');
    galleries.forEach(gallery => {
        const items = gallery.querySelectorAll('.gallery_img');
        const count = items.length;
        if (count === 0) return;
        const width = 100 / count;
        items.forEach(item => {
            item.style.width = width + '%';
        });
    });
}
document.addEventListener('DOMContentLoaded', distributeGallery);
window.addEventListener('resize', distributeGallery);
