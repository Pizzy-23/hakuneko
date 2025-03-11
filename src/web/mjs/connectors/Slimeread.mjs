import FlatManga from './templates/FlatManga.mjs';

export default class SlimeRead extends FlatManga {

    constructor() {
        super();
        super.id = 'slimeread';
        super.label = 'SlimeRead';
        this.tags = ['manga', 'manhwa', 'manhua', 'novel', 'portuguese'];
        this.url = 'https://slimeread.com';
        this.paths = ['/mangas', '/manhwas', '/manhuas', '/novels'];

        this.queryMangaTitle = 'h1.comic-title';
        this.queryMangas = 'a[href^="/manga/"]';
        this.queryChapters = 'a[href*="/ler/"]';
        this.queryPages = 'img.tw-zba.tw-hm';
    }

    /**
     * Obtém a lista completa de todos os mangás, manhwas, manhuas e novels.
     */
    async _getMangas() {
        let mangaList = [];

        for (const path of this.paths) {
            console.log(`📂 Buscando categoria: ${path}`);
            const items = await this._getMangasFromCategory(path);
            mangaList = mangaList.concat(items);
        }

        return mangaList.map(m => ({
            id: m.id,
            title: m.title
        }));
    }

    /**
     * Obtém os mangás de uma categoria específica.
     */
    async _getMangasFromCategory(categoryPath) {
        const uri = new URL(categoryPath, this.url);
        console.log(`🌍 Acessando: ${uri.href}`);

        const script = `
            new Promise((resolve) => {
                let interval = setInterval(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                    let items = [...document.querySelectorAll('${this.queryMangas}')];
                    
                    if (items.length > 0) {
                        clearInterval(interval);
                        resolve(items.map(el => ({
                            id: el.pathname.split('/')[2],
                            title: el.textContent.trim()
                        })));
                    }
                }, 1500);
            });
        `;

        let request = new Request(uri.href, this.requestOptions);
        let response = await Engine.Request.fetchUI(request, script);

        return response || [];
    }

    /**
     * Obtém a lista de capítulos de um mangá.
     */
    async _getChapters(manga) {
        const url = `${this.url}/manga/${manga.id}`;
        console.log(`📄 Buscando capítulos de: ${manga.id}`);
        
        let request = new Request(url, this.requestOptions);
        let dom = await this.fetchDOM(request, this.queryChapters);

        return dom.map(el => ({
            id: el.href.split('/').pop(),
            title: el.textContent.trim(),
            language: this.language
        }));
    }

    /**
     * Obtém a lista de páginas de um capítulo.
     */
    async _getPages(manga, chapter) {
        const url = `${this.url}/ler/${manga.id}/${chapter.id}`;
        console.log(`📜 Buscando páginas do capítulo: ${chapter.id}`);

        let request = new Request(url, this.requestOptions);
        let dom = await this.fetchDOM(request, this.queryPages);

        return dom.map(img => img.src);
    }
}
