const HomePage = {
    async init() {
        setTimeout(() => {
            this.renderCharacterGrid();
        }, 100);
    },
    renderCharacterGrid() {
        const grid = document.querySelector('.grid-container');
        if (!grid) return;
        const characters = NavigationLoader.characterList;
        if (!characters) return;
        grid.innerHTML = characters.map(char => `
            <div class="character-card">
                <a href="character.html?name=${char.id}">
                    <h3>${char.name}</h3>
                    <div class="info">🏙️ ${char.city}</div>
                    <div class="info">👥 ${char.squad}</div>
                </a>
            </div>
        `).join('');
    }
};
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.grid-container')) {
        HomePage.init();
    }
});