import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SlimeRead extends Connector {


    constructor() {
        super();
        super.id = 'slimeread';
        super.label = 'SlimeRead';
        this.tags = ['manga', 'portuguese'];
        this.baseURL = 'https://slimeread.com';
        this.language = 'pt-br';
    }

    async _getMangaFromURI(uri) {
        let parts = uri.pathname.split('/');
        let id = parts[2];
        let request = new Request(`${this.baseURL}/manga/${id}`);
        let data = await this._requestJSON(request.url);
        let title = data.title;
        return new Manga(this, id, title);
    }

    _getMangaList(callback) {
        this._requestJSON(`${this.baseURL}/mangas`)
            .then(data => {
                let mangaList = data.map(item => ({
                    id: item.id,
                    title: item.title
                }));
                callback(null, mangaList);
            })
            .catch(error => {
                console.error(error, this);
                callback(error, undefined);
            });
    }

    _getChapterList(manga, callback) {
        let url = `${this.baseURL}/ler/${manga.id}`;
        this.fetchDOM(url, 'a[href*="/ler/"]')
            .then(elements => {
                let chapterList = elements.map(el => {
                    return {
                        id: el.href.split('/').pop(),
                        title: el.textContent.trim(),
                        language: this.language
                    };
                });
                callback(null, chapterList);
            })
            .catch(error => {
                console.error(error, manga);
                callback(error, undefined);
            });
    }

    _getPageList(manga, chapter, callback) {
        let url = `${this.baseURL}/ler/${manga.id}/${chapter.id}`;
        this.fetchDOM(url, 'img[class*="tw-zba"]')
            .then(elements => {
                let pageList = elements.map(img => img.src);
                callback(null, pageList);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }
}
