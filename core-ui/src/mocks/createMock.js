import { rest } from 'msw';

//creates mock for stage and adds a localhost prefix for development
export const mockGetRequest = (path, body) => {
  return [
    rest.get(path, (req, res, ctx) => {
      return res(ctx.json(body));
    }),
    rest.get(`http://localhost:3001${path}`, (req, res, ctx) => {
      return res(ctx.json(body));
    }),
  ];
};

export const mockPostRequest = (path, body) => {
  return [
    rest.post(path, (req, res, ctx) => {
      return res(ctx.json(body));
    }),
    rest.post(`http://localhost:3001${path}`, (req, res, ctx) => {
      return res(ctx.json(body));
    }),
  ];
};
