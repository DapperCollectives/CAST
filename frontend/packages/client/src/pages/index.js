import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import Loader from '../components/Loader';

const Header = lazy(() => import('../components/Header'));
const Transactions = lazy(() => import('../components/Transactions'));
const Home = lazy(() => import('./Home'));
const Proposal = lazy(() => import('./Proposal'));
const About = lazy(() => import('./About'));
const Debug = lazy(() => import('./Debug'));
const ProposalCreate = lazy(() => import('./ProposalCreate'));
const Community = lazy(() => import('./Community'));
const CommunityEditor = lazy(() => import('./CommunityEditor'));
const CommunityCreate = lazy(() => import('./CommunityCreate'));

export default function AppPages() {
  return (
    <Suspense fallback={<Loader fullHeight />}>
      <div className="App">
        <Header />
        <div className="Body">
          <Transactions />
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/about" component={About} />
            <Route exact path="/community/create">
              <CommunityCreate />
            </Route>
            <Route path="/community/:communityId/edit" exact={true}>
              <CommunityEditor />
            </Route>
            <Route path="/community/:communityId">
              <Community />
            </Route>
            <Route exact path="/proposal/create">
              <ProposalCreate />
            </Route>
            <Route path="/proposal/:proposalId">
              <Proposal />
            </Route>
            <Route exact path="/debug-contract">
              <Debug />
            </Route>
          </Switch>
        </div>
      </div>
    </Suspense>
  );
}
