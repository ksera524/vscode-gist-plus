interface GistFile {
  content: string;
  filename?: string;
  language?: string;
  raw_url?: string;
  size?: number;
  type?: string;
}

interface Gist {
  createdAt: string;
  description: string;
  fileCount: number;
  files: { [x: string]: GistFile };
  id: string;
  name: string;
  public: boolean;
  updatedAt: string;
  url: string;
}

export type { Gist, GistFile };
