interface GistServiceOptions {
  key?: string;
  rejectUnauthorized?: boolean;
  url?: string;
}

type GistModel = import('../types/gist').Gist;

interface GistService {
  configure(options: GistServiceOptions): void;
  createGist(
    files: { [x: string]: { content: string } },
    description?: string,
    isPublic = true
  ): Promise<GistModel>;
  deleteFile(id: string, filename: string): Promise<void>;
  deleteGist(id: string): Promise<void>;
  getGist(id: string): Promise<GistModel>;
  getGists(starred?: boolean): Promise<GistModel[]>;
  updateGist(
    id: string,
    filename: string,
    content: string | null
  ): Promise<GistModel>;
}
