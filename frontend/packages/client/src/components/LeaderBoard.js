import React from 'react';
import Blockies from 'react-blockies';
import { WrapperResponsive } from '../components';
import { useLeaderBoard } from '../hooks';

const Row = ({ index, addr, score, classNameIndex }) => {
  const smallRowStyle = { width: '30%' };

  const clnIndex = `${
    classNameIndex ?? 'has-background-white-ter index-cell'
  }  `.trim();

  return (
    <tr className="table-row">
      <td className={clnIndex}>{index}</td>
      <td>{addr}</td>
      <td style={smallRowStyle} className="smaller-text">
        {score}
      </td>
    </tr>
  );
};

export default function LeaderBoard({
  onClickViewMore = () => {},
  communityId,
} = {}) {
  const { data, isLoading } = useLeaderBoard({ communityId });
  const style = {};

  return (
    <div className="is-flex is-flex-direction-column">
      <WrapperResponsive
        classNames="is-flex flex-1 has-text-weight-bold is-uppercase small-text"
        extraStyles={{ marginBottom: '32px', marginTop: '28px' }}
        extraStylesMobile={{ marginBottom: '32px', marginTop: '24px' }}
      >
        LEADERBOARD
      </WrapperResponsive>
      <table className="table is-fullwidth">
        <tbody className="is-scrollable-table" style={style}>
          {!isLoading &&
            data?.leaderBoard.map((datum, index) => {
              const userIndex = index + 1;
              const styleIndex =
                index === 0
                  ? 'rounded-sm-tl has-background-white-ter index-cell'
                  : index === 4
                  ? 'rounded-sm-bl has-background-white-ter index-cell'
                  : 'has-background-white-ter index-cell';

              return (
                <Row
                  key={`row-table-${index}`}
                  classNameIndex={styleIndex}
                  index={
                    <div className="smaller-text has-text-weight-bold">
                      {userIndex}
                    </div>
                  }
                  addr={
                    <div className="is-flex is-align-items-center">
                      <Blockies
                        seed={datum?.addr}
                        size={8}
                        scale={4}
                        className="blockies"
                      />
                      <span className="ml-2">{datum?.addr}</span>
                    </div>
                  }
                  score={
                    <div className="has-text-weight-bold">{datum?.score}</div>
                  }
                />
              );
            })}
        </tbody>
      </table>
      {!isLoading && data?.currentUser && (
        <table className="table is-fullwidth">
          <tbody className="is-scrollable-table" style={style}>
            <Row
              index={
                <div className="smaller-text has-text-weight-bold">
                  {data?.currentUser.index}
                </div>
              }
              classNameIndex="has-background-black-bis has-text-white index-cell rounded-sm-bl rounded-sm-tl"
              addr={
                <div className="is-flex is-align-items-center">
                  <Blockies
                    seed={data?.currentUser.addr}
                    size={8}
                    scale={4}
                    className="blockies"
                  />
                  <span className="ml-2">{data?.currentUser.addr}</span>
                </div>
              }
              score={
                <div className="has-text-weight-bold">
                  {data?.currentUser.score}
                </div>
              }
            />
          </tbody>
        </table>
      )}
      <div className="is-flex is-justify-content-start is-align-items-center">
        <button className="button is-white p-0" onClick={onClickViewMore}>
          View All Members
        </button>
      </div>
    </div>
  );
}
