export type Article = {
  portalName: string;
  portalLink: string;
  backLink: string;
  articleId: string;
  articleLink: string;
  title: string;
  lead: string;
  content: string;
  author: string;
  time: string;
};

export type ArticleListItem = {
  title: string;
  lead: string;
  link: string;
  portal: string;
  articleId: string;
};
