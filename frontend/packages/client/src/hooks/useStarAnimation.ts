import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'hooks';

export interface StarProps {
  topPer: number;
  leftPer: number;
  width?: string;
  height?: string;
  start?: number;
  top?: number;
  left?: number;
}

export interface StarAnimationProps {
  stars: StarProps[];
}

export interface StarAnimationReturn {
  addToArrayOfRefes: (currentRef: HTMLDivElement) => void;
  starArray: StarProps[];
  parentRef: any;
}

export function useStarAnimation({
  stars,
}: StarAnimationProps): StarAnimationReturn {
  const [starArray, setStarArray] = useState<StarProps[]>([]);
  const refsArray = useRef<HTMLDivElement[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowDimensions();

  const addToArrayOfRefes = (currentRef: HTMLDivElement) => {
    if (!refsArray.current.includes(currentRef)) {
      refsArray.current.push(currentRef);
    }
  };

  const { current: parent } = parentRef;

  useEffect(() => {
    const isMobile = width < 768;
    if (parent) {
      const maxWidth = parent.clientWidth;
      const maxHeight = parent.clientHeight;
      refsArray.current = [];
      setStarArray(
        stars.map((position) => ({
          width: position.width,
          height: position.height,
          topPer: position.topPer,
          leftPer: position.leftPer,
          // if mobile use a smaller area so they fit
          top: maxHeight * position.topPer * (isMobile ? 0.9 : 1),
          left: maxWidth * position.leftPer * (isMobile ? 0.9 : 1),
        }))
      );
    }
  }, [parent, width, height, stars]);

  const { current } = refsArray;

  useEffect(() => {
    const timeOuts: (ReturnType<typeof setTimeout> | null)[] = current?.map(
      (currentRef, index) => {
        if (stars[index]?.start) {
          const timer = setTimeout(() => {
            if (currentRef) {
              currentRef.className = 'star';
            }
          }, stars[index].start);
          return timer;
        }
        return null;
      }
    );

    return () => {
      // @ts-expect-error: Need to resolve overload
      timeOuts.forEach((timeOut) => clearTimeout(timeOut));
    };
  }, [current, stars]);

  return { addToArrayOfRefes, starArray, parentRef };
}
