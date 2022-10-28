import { useEffect, useState } from 'react';

export interface SvgProps {
  name: string;
  props: any;
}

const Svg: React.FC<SvgProps> = ({ name, ...props }) => {
  const [svgComponent, setSvgComponent] = useState<any>(null);

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
