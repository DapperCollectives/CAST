import classNames from 'classnames';

const NameAndBody = ({ name, body, isMobile }) => {
  const containerClass = classNames(
    'column is-flex is-flex-direction-column is-justyfy-content-flex-start',
    { 'is-12 pt-0': isMobile }
  );
  const nameClass = classNames(
    'is-size-4 is-size-5-mobile is-4 line-clamp-2 has-text-weight-bold',
    { 'mb-2': !isMobile },
    { 'mb-1': isMobile }
  );
  const bodyClass = classNames('has-text-grey line-clamp-2', {
    'small-text': isMobile,
  });

  return (
    <div className={containerClass}>
      <div className={nameClass}>{name}</div>
      <p
        className={bodyClass}
        style={{
          lineHeight: '1.5em',
          maxHeight: '3rem',
        }}
      >
        {body}
      </p>
    </div>
  );
};

export default NameAndBody;
