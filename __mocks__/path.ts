// tslint:disable:no-any no-unsafe-any
export const basename = jest.fn((input: string) => input.split('/').pop());
export const dirname = jest.fn((input: string) => input);
export const join = jest.fn((...paths: string[]) =>
  ['var', 'T', 'tmp', ...paths].join('/')
);
export const sep = '/';
