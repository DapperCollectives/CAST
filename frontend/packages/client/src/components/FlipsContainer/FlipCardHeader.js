import Blockies from 'react-blockies';

export default function FlipCardHeader({ address }) {
  return (
    <div className="is-flex is-align-items-center flex-1 p-4">
      <Blockies seed={address} size={6} scale={4} className="blockies mr-2" />
      <p className="is-size-6">{address}</p>
    </div>
  );
}
