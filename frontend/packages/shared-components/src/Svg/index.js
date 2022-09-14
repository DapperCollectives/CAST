import { useEffect, useState } from 'react';

const Svg = ({ name, ...props }) => {
  const [svgComponent, setSvgComponent] = useState(null);

  useEffect(() => {
    (async () => {
      import(`./${name}`)
        .then(({ default: Svg }) => setSvgComponent(<Svg {...props} />))
        .catch(console.error);
    })();
  }, [name]);

  return svgComponent;
};

export default Svg;
