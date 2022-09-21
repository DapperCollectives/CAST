import { useEffect, useRef } from 'react';
import { Svg } from '@cast/shared-components';

export default function Slider({
  min: minParam,
  max: maxParam,
  step: stepParam,
  value: valueParam,
  onChange,
} = {}) {
  const step = parseFloat(stepParam, 2);
  const value = parseFloat(valueParam, 2);
  const max = parseFloat(maxParam, 2);
  const min = parseFloat(minParam, 2);

  const inputRef = useRef();
  const increaseValue = (valueParam) => () => {
    if (max <= valueParam) {
      return;
    }
    onChange(valueParam + step);
  };
  const decreaseValue = (valueParam) => () => {
    if (min >= valueParam) {
      return;
    }
    onChange(parseFloat(valueParam) - step);
  };

  // handles input changes to change style
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('input', function () {
        const percentageValue = parseInt(
          ((this.value - min) * 100) / (max - min)
        );
        this.style.background = `linear-gradient(to right, #FBD84D 0%, #FBD84D ${percentageValue}%, #fef9e2 ${percentageValue}%, #fef9e2 100%)`;
        this.style.borderRadius = '10px';
        inputRef.current.style.height = '10px';
      });
    }
  }, [inputRef, max, min]);

  // handles buttons clicks to change style
  useEffect(() => {
    if (inputRef.current) {
      const percentageValue = parseInt(((value - min) * 100) / (max - min));
      inputRef.current.style.background = `linear-gradient(to right, #FBD84D 0%, #FBD84D ${percentageValue}%, #fef9e2 ${percentageValue}%, #fef9e2 100%)`;
      inputRef.current.style.borderRadius = '10px';
      inputRef.current.style.height = '10px';
    }
  }, [inputRef, value, max, min]);

  return (
    <div className="is-flex flex-1 is-align-items-center">
      <div
        className="is-flex cursor-pointer mx-1"
        onClick={decreaseValue(value)}
      >
        <Svg name="RemoveLightFill" fill="#636363" />
      </div>
      <div
        className="is-flex flex-1 is-align-items-center"
        style={{ position: 'relative' }}
      >
        <input
          className="slider"
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
      </div>
      <div
        className="is-flex cursor-pointer mx-1"
        onClick={increaseValue(value)}
      >
        <Svg name="PlusLightFill" fill="#636363" />
      </div>
    </div>
  );
}
