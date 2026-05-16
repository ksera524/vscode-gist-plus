import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import * as https from 'https';

import { GISTS_BASE_URL } from '../constants';

const DEFAULT_OPTIONS = {
  baseUrl: GISTS_BASE_URL
};

interface GistsService {
  configure(options: {
    key?: string;
    rejectUnauthorized?: boolean;
    url?: string;
  }): void;
  create(
    params: RestEndpointMethodTypes['gists']['create']['parameters']
  ): ReturnType<Octokit['gists']['create']>;
  delete(
    params: RestEndpointMethodTypes['gists']['delete']['parameters']
  ): ReturnType<Octokit['gists']['delete']>;
  get(
    params: RestEndpointMethodTypes['gists']['get']['parameters']
  ): ReturnType<Octokit['gists']['get']>;
  list(
    params?: RestEndpointMethodTypes['gists']['list']['parameters']
  ): ReturnType<Octokit['gists']['list']>;
  listStarred(
    params?: RestEndpointMethodTypes['gists']['listStarred']['parameters']
  ): ReturnType<Octokit['gists']['listStarred']>;
  update(
    params: RestEndpointMethodTypes['gists']['update']['parameters']
  ): ReturnType<Octokit['gists']['update']>;
}

const createGistsService = (): GistsService => {
  let options = DEFAULT_OPTIONS;
  let octokit = new Octokit(options);

  return {
    configure: (configOptions: {
      key?: string;
      rejectUnauthorized?: boolean;
      url?: string;
    }): void => {
      const url = configOptions.url || 'https://api.github.com';
      const rejectUnauthorized = configOptions.rejectUnauthorized ?? true;
      const agent = new https.Agent({ rejectUnauthorized });
      const nextOptions = { baseUrl: url, agent };
      options = nextOptions;
      octokit = new Octokit({ auth: configOptions.key, ...options });
    },
    create: (
      params: RestEndpointMethodTypes['gists']['create']['parameters']
    ) => octokit.gists.create(params),
    delete: (
      params: RestEndpointMethodTypes['gists']['delete']['parameters']
    ) => octokit.gists.delete(params),
    get: (params: RestEndpointMethodTypes['gists']['get']['parameters']) =>
      octokit.gists.get(params),
    list: (params?: RestEndpointMethodTypes['gists']['list']['parameters']) =>
      octokit.gists.list(params),
    listStarred: (
      params?: RestEndpointMethodTypes['gists']['listStarred']['parameters']
    ) => octokit.gists.listStarred(params),
    update: (
      params: RestEndpointMethodTypes['gists']['update']['parameters']
    ) => octokit.gists.update(params)
  };
};

export { createGistsService };
export const gists = createGistsService();
