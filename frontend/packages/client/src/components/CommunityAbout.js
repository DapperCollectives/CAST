import React from 'react';
import Blockies from 'react-blockies';
import { kebabToString } from 'utils';
import { Title } from '.';

const CommunityMemberInfo = ({ name }) => {
  return (
    <div className="is-flex is-align-items-center py-1">
      <div className="is-flex pr-4">
        <Blockies seed={name} size={8} scale={4} className="blockies" />
      </div>
      <div className="subtitle has-text-grey small-text">{name}</div>
    </div>
  );
};

const CommunityAbout = ({
  textAbout = '',
  adminMembers = [],
  authorsMembers = [],
  strategies = [],
  isMobile = false,
} = {}) => {
  return (
    <div>
      <div className="columns is-multiline mt-0">
        <div className="column is-12 pt-0">
          <Title>About</Title>
          <p className="mb-5 has-text-grey">{textAbout}</p>
        </div>
        <div className={`column is-12`}>
          <hr
            style={
              !isMobile
                ? { marginBottom: '16px', marginTop: '16px' }
                : { marginBottom: '0px', marginTop: '0px' }
            }
          />
        </div>
        <div className="column is-12">
          <div className="columns flex-1">
            <div className="column is-6">
              <Title>Strategies</Title>
              {strategies.map((item, index) => (
                <div
                  className="is-flex is-align-items-center py-1"
                  key={`strategy-${index}`}
                >
                  <p
                    className="has-text-grey small-text"
                    style={{ textTransform: 'capitalize' }}
                  >
                    {kebabToString(item.name)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`column is-12`}>
          <hr
            style={
              !isMobile
                ? { marginBottom: '16px', marginTop: '16px' }
                : { marginBottom: '0px', marginTop: '0px' }
            }
          />
        </div>

        <div className="column is-12">
          <div className="columns flex-1">
            <div className="column is-6">
              <Title>Admin</Title>
              {adminMembers.map((item, index) => (
                <CommunityMemberInfo name={item.name} key={`member-${index}`} />
              ))}
            </div>
            <div className="column is-6">
              <Title>Authors</Title>
              {authorsMembers.map((item, index) => (
                <CommunityMemberInfo name={item.name} key={`member-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CommunityAbout;
