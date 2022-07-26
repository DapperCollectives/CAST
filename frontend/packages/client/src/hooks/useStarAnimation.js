import { useEffect, useRef, useState } from 'react';

import { useWindowDimensions } from 'hooks';

export default function useStarAnimation({ stars }) {
  const [starArray, setStarArray] = useState([]);
  const refsArray = useRef([]);
  const parentRef = useRef();
  const { width, height } = useWindowDimensions();

  const addToArrayOfRefes = (currentRef) => {
    if (!refsArray.current.includes(currentRef)) {
      refsArray.current.push(currentRef);
    }
  };

  const { current: parent } = parentRef;

  useEffect(() => {
    if (parent) {
      const maxWidth = parent.clientWidth;
      const maxHeight = parent.clientHeight;
      refsArray.current = [];
      setStarArray(
        stars.map((position) => ({
          width: position.width,
          height: position.height,
          top: maxHeight * position.topPer,
          left: maxWidth * position.leftPer,
        }))
      );
    }
  }, [parent, width, height, stars]);

  const { current } = refsArray;

  useEffect(() => {
    const timeOuts = current?.map((currentRef, index) => {
      if (stars[index]?.start) {
        return setTimeout(() => {
          if (currentRef) {
            currentRef.className = 'star';
          }
        }, stars[index].start);
      }
      return null;
    });

    return () => {
      timeOuts.forEach((timeOut) => clearTimeout(timeOut));
    };
  }, [current, stars]);

  return { addToArrayOfRefes, starArray, parentRef };
}
