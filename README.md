# Installation

## Prerequisites

- [Node.js](https://nodejs.org/en) (>= 18.10.0)

## Setup

- Run `npm install`
- Run `npm run build`

## Launch

- Run `npm start`

# Development

## New portal scraping addition

To support scraping of a completely new news portal, you need to:

1. Add new enum entry to `src/common/enums/Portals`
2. Add new scraper configuration to `src/configs/<portal-name>.config.ts`
3. Add new entry to `src/constants/PORTALS_SCRAPERS`
4. Test that everything works properly
5. Commit and submit a Pull Request

## Configuration types description

```typescript
type ScraperConfig = {
  // Enum value of the news portal
  type: Portals;

  // Given name of the news portal, abbreviaton or similar
  name: string;

  // Home page link of the news portal
  link: string;

  // Favicon link, preferably from the news portal's CDN
  icon: string;

  // Flag that signifies if the news portal has RSS feeds exposed and used
  rss: boolean;

  // "Root" links that the scraper will go to and dig out article links
  roots: string[];

  // CSS Selector for extracting article links from each of the "roots"
  // If null, "links()" method should be provided
  linker?: string;

  // Method to retrieve article links from each of the "roots"
  // If null, "linker" property should be provided
  // If null but rss=true, a "rssLinks" method for extraction is used
  // If null but rss=false, a "nonRssLinks" method for extraction is used
  // If both "linker" and "links" is null ("rss" disregarded), a "jsonLinks" method for extraction is used
  links?: (link: string) => Promise<string[]>;

  // Method to retrieve the article identifier from it's URL
  // If null, uses a default method that extracts an identifier, for example:
  // https://portal.whatever/nice-article-yo-123456
  // Identifier here would be 123456
  id?: (link: string) => string;

  // CSS Selector array of HTML elements to be removed, before any other parsing
  // Here you'd want to remove "img", "iframe", "script", etc.
  remove1: string[];

  // Define how to extract the title of the article
  title: CheerioExtractor;

  // Define how to extract the article lead or subtitle
  lead: CheerioExtractor;

  // Define how to extract the author of the article
  author: CheerioExtractor;

  // Define how to extract publish time of the article
  time: CheerioExtractor;

  // CSS Selector array of HTML elements to be removed, prior to content scraping
  // Here you'd want to remove any additional unneeded content before continuing
  remove2?: string[] | null;

  // Define how to extract the article content
  content: CheerioExtractorSimple;
};

type CheerioExtractor = {
  // CSS Selector of the element to find
  find: string;

  // Which element to take, and which Cheerio extraction method to use
  // If null, "normal" el.text() will be used
  // el.first().text() | el.last().text() | el.text()
  take?: "first" | "last" | "normal";

  // Post-scraping method that can additionally transform extracted value
  // Example extracted value: "Autor: Proper Name"
  // Example value after a transform: "Proper Name"
  transform?: (value: string) => string;
};

// Used for specifically content extraction
// It just has the "find" property
// For "take", the scraper service uses "el.html()"
// For "transform", there is no need as we won't really transform pure HTML stuff
type CheerioExtractorSimple = Omit<CheerioExtractor, "take" | "transform">;
```

## Other relevant helper files and implementations

- `src/common/functions.ts` - common helper functions used in services for various reasons and purposes
- `src/common/validation.ts` - common validation functions used for filtering out premium/sponzored/paid/protected/specific articles
- `src/common/formatting.ts` - common formatting functions used for value transformation and displaying in human-readable forms
