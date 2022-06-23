import { render, cleanup, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import '@testing-library/jest-dom';

import AppPages from '.';

jest.mock('../components/Transactions', () => () => {
  const Transactions = 'mocked-transaction-component';
  return <Transactions />;
});
jest.mock('./Home', () => () => {
  const Home = 'mocked-home-page';
  return <div>{Home}</div>;
});
jest.mock('./About', () => () => {
  const About = 'mocked-about-page';
  return <div>{About}</div>;
});
jest.mock('./Community', () => () => {
  const Community = 'mocked-community-page';
  return <div>{Community}</div>;
});
jest.mock('./Proposal', () => () => {
  const Community = 'mocked-proposal-detail-page';
  return <div>{Community}</div>;
});
jest.mock('./ProposalCreate', () => () => {
  const Community = 'mocked-create-proposal-page';
  return <div>{Community}</div>;
});

afterAll(() => {
  jest.unmock('../components/Transactions');
  jest.unmock('./Home');
  jest.unmock('./About');
  jest.unmock('./Community');
  jest.unmock('./Proposal');
  jest.unmock('./ProposalCreate');
});

afterEach(cleanup);
const routes = [
  { description: 'home route', url: '/', textAssertion: 'mocked-home-page' },
  {
    description: 'about route',
    url: '/about',
    textAssertion: 'mocked-about-page',
  },
  {
    description: 'community route',
    url: '/community/1',
    textAssertion: 'mocked-community-page',
  },
  {
    description: 'create proposal route',
    url: '/proposal/create',
    textAssertion: 'mocked-create-proposal-page',
  },
  {
    description: 'proposal detail route',
    url: '/proposal/1',
    textAssertion: 'mocked-proposal-detail-page',
  },
];
describe('App Router configuration', () => {
  routes.forEach((testSet) => {
    it(`renders ${testSet.description}`, async () => {
      const history = createMemoryHistory();
      history.push(testSet.url);
      const { getByText } = render(
        <Router history={history}>
          <AppPages />
        </Router>
      );
      await waitFor(() =>
        expect(getByText(testSet.textAssertion)).toBeInTheDocument()
      );
    });
  });
});
