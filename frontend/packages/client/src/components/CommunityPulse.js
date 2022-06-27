import React from 'react';
import WrapperResponsive from './WrapperResponsive';
import Miquela from '../assets/miquela.png';
import PeopleToast from '../assets/people-toast.png';

export default function CommunityPulse() {
  return (
    <div>
      <WrapperResponsive
        classNames="is-flex flex-1 has-text-weight-bold is-uppercase small-text"
        extraStyles={{ marginBottom: '32px', marginTop: '40px' }}
        extraStylesMobile={{ marginBottom: '32px', marginTop: '24px' }}
      >
        Pulse
      </WrapperResponsive>
      <div className="columns flex-1 m-0 pulse">
        <div className="column is-4 cell top-left">
          <p className="is-size-1 has-text-weight-bold">$12.43</p>
          <p className="small-text">Token Price</p>
        </div>
        <div className="column is-4 cell">
          <p className="is-size-1 has-text-weight-bold">$12.43</p>
          <p className="small-text">Member Growth</p>
        </div>
        <div
          className="column is-4 cell top-right p-0"
          style={{
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            backgroundImage: `url(${PeopleToast})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <button className="button ml-4 mb-4 has-background-white has-text-black rounded-lg">
            Gallery
          </button>
        </div>
      </div>
      <div className="columns flex-1 m-0 pulse">
        <div
          className="column is-4 cell bottom-left p-0"
          style={{
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            backgroundImage: `url(${Miquela})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
        <div className="column is-4 cell">
          <button className="button rounded-lg mb-2">Active</button>
          <p className="title-text has-text-centered mb-2">
            S2 Creators in Residence
          </p>
          <p className="small-text">Member Growth</p>
        </div>
        <div className="column is-4 cell bottom-right">
          <p className="is-6">@xyz</p>
          <p className="title-text has-text-centered mb-2">
            So excited to announce our collaboration with @name <br />
            🔥🔥🔥
          </p>
          <p className="small-text">5 min ago</p>
        </div>
      </div>
    </div>
  );
}
