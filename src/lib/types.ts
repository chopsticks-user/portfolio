export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverGradient: string;
  author: string;
  date: string;
  tags: string[];
}

export interface BlogPostFull extends BlogPost {
  content: string;
  published: boolean;
}
