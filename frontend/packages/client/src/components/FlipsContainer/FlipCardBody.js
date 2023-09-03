import { useMemo } from 'react';
import { parseHTML } from 'utils';
import { stripHtml } from 'string-strip-html';

export default function FlipCardBody({ body, name }) {
  const imgProps = useMemo(() => parseHTML(body, 'img'), [body]);
  const {
    src = 'https://dappercollectives.mypinata.cloud/ipfs/Qma6P7W9XV3pJJmH8vXwqnLnHw3svrNwgRFoBYmqvHwmZz',
    alt = 'Dummy img',
  } = imgProps;
  return (
    <>
      <div className="is-flex column p-0 rounded-sm">
        <img
          src={src}
          alt={alt}
          style={{ height: '300px', width: '100%', objectFit: 'fill' }}
        />
      </div>
      <div className="p-4">
        <div className="is-size-4 line-clamp-1 has-text-weight-bold mb-2">
          {name}
        </div>

        <p className="has-text-grey proposal-text-truncated">
          {stripHtml(body || '').result}
        </p>
      </div>
    </>
  );
}
