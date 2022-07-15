import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
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
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/community/create" element={<CommunityCreate />} />
            <Route
              path="/community/:communityId/edit"
              element={<CommunityEditor />}
            />
            <Route path="/community/:communityId" element={<Community />} />
            <Route path="/proposal/create" element={<ProposalCreate />} />
            <Route path="/proposal/:proposalId" element={<Proposal />} />
            <Route path="/debug-contract" element={<Debug />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </div>
    </Suspense>
  );
}
