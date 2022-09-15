import { useEffect, useRef } from 'react';
import { Svg } from '@cast/shared-components';

export default function Slider({ min, max, step, value, onChange } = {}) {
  const inputRef = useRef();
  const increaseValue = (valueParam) => () => {
    if (max === valueParam) {
      return;
    }
    onChange(valueParam + step);
  };
  const decreaseValue = (valueParam) => () => {
    if (min === valueParam) {
      return;
    }
    onChange(valueParam - step);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('input', function () {
        const value = parseInt(((this.value - min) * 100) / (max - min));
        this.style.background = `linear-gradient(to right, #FBD84D 0%, #FBD84D ${value}%, #fbd84d85 ${value}%, #fbd84d85 100%)`;
      });
    }
  }, [inputRef, max, min]);

  return (
    <div className="is-flex flex-1 is-align-items-center">
      <div
        className="is-flex cursor-pointer mx-1"
        onClick={decreaseValue(value)}
      >
        <Svg name="RemoveLightFill" fill="#636363" />
      </div>
      <input
        className="progress"
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      <div
        className="is-flex cursor-pointer mx-1"
        onClick={increaseValue(value)}
      >
        <Svg name="PlusLightFill" fill="#636363" />
      </div>
    </div>
  );
}
