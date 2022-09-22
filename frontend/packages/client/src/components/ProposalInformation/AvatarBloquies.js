import Blockies from 'react-blockies';

export default function AvatarBloquies({ logo, slug, id }) {
  return (
    <>
      {logo ? (
        <div
          role="img"
          aria-label="community banner"
          className="rounded-full"
          style={{
            width: 20,
            height: 20,
            backgroundImage: `url(${logo})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      ) : slug || id ? (
        <Blockies
          seed={slug ?? `seed-${id}`}
          size={10}
          scale={2}
          className="blockies"
        />
      ) : null}
    </>
  );
}
