import Connector from "../engine/Connector.mjs";
import Manga from "../engine/Manga.mjs";

export default class SlimeRead extends Connector {
  constructor() {
    super();
    super.id = "slimeread";
    super.label = "SlimeRead";
    this.tags = ["manga", "portuguese"];
    this.url = "https://slimeread.com";

    // Definir os caminhos de categorias
    this.categories = ["mangas", "manhwas", "manhuas", "novels"];
  }

  async _getMangas() {
    let mangaList = [];
    for (const category of this.categories) {
      const mangas = await this._getMangasFromCategory(category);
      mangaList.push(...mangas);
    }
    return mangaList;
  }

  async _getMangasFromCategory(category) {
    let mangas = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const uri = new URL(`/${category}?page=${page}`, this.url);
      console.log("Fetching from:", uri.href);

      const request = new Request(uri.href, this.requestOptions);
      const dom = await this.fetchDOM(request, "div.comic-card > a");

      if (dom.length === 0) {
        hasNextPage = false;
        break;
      }

      dom.forEach((element) => {
        mangas.push({
          id: element.pathname.split("/")[2],
          title: element.text.trim(),
        });
      });

      page++;
      await this.wait(250);
    }
    return mangas;
  }

  async _getChapters(manga) {
    const uri = new URL(`/manga/${manga.id}`, this.url);
    console.log("Fetching chapters from:", uri.href);

    const request = new Request(uri.href, this.requestOptions);
    const dom = await this.fetchDOM(request, "a[href*='/ler/']");

    return dom.map((element) => ({
      id: element.href.split("/").pop(),
      title: element.text.trim(),
      language: this.language,
    }));
  }

  async _getPages(chapter) {
    const uri = new URL(`/ler/${chapter.manga.id}/${chapter.id}`, this.url);
    console.log("Fetching pages from:", uri.href);

    const request = new Request(uri.href, this.requestOptions);
    const dom = await this.fetchDOM(request, "img[class*='tw-zba']");

    return dom.map((img) => img.src);
  }
}
