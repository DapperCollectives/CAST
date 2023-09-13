import { forwardRef, useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Svg } from '@cast/shared-components';
import FadeIn from 'components/FadeIn';
import classnames from 'classnames';

const Dropdown = forwardRef(
  (
    {
      defaultValue,
      options = [],
      onSelectValue = () => {},
      disabled = false,
      label = 'Select option',
      dropdownFull = true,
      isRight = false,
      padding = '',
      margin = '',
      name,
    } = {},
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [innerValue, setInnerValue] = useState();

    // The case is introduced because it should update the component if the value is changed
    // in a controlled way
    useEffect(() => {
      setInnerValue(defaultValue ? { value: defaultValue } : undefined);
    }, [defaultValue]);

    useEffect(() => {
      if (!innerValue?.label && innerValue?.value && options.length) {
        const defaultSelection = options.find(
          (op) => op.value === innerValue?.value
        );
        if (defaultSelection) {
          setInnerValue(defaultSelection);
        }
      }
    }, [options, innerValue]);

    const openCloseDropdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((status) => !status);
    };

    const setValue =
      ({ label, value }) =>
      (e) => {
        e.target.value = value;
        setInnerValue({ label, value });
        onSelectValue(e);
        setIsOpen(false);
      };

    // use for click out on dropdown
    const closeOnBlur = () => {
      setIsOpen(false);
    };

    const classNames = classnames(
      `dropdown is-flex is-flex-grow-1`,
      { 'is-right': isRight },
      { 'is-active': isOpen },
      { [padding]: !!padding },
      { [margin]: !!margin }
    );
    return (
      <div
        className={classNames}
        onBlur={closeOnBlur}
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        data-testid="dropdown-menu"
      >
        <div
          className="dropdown-trigger columns m-0 is-flex-grow-1"
          style={{ maxWidth: '100%' }}
        >
          <button
            className={`button rounded-sm is-outlined border-light column m-0 py-0 px-3 is-full-mobile ${
              disabled ? 'is-disabled' : ''
            }`}
            aria-haspopup="true"
            aria-controls="dropdown-menu"
            onClick={openCloseDropdown}
            data-testid="dropdown-button"
            ref={ref}
            name={name}
          >
            <div className="is-flex is-flex-grow-1 is-align-items-center is-justify-content-space-between has-text-grey small-text">
              <div
                className="is-flex"
                style={{
                  maxWidth: 'calc(100% - 30px)',
                  overflow: 'hidden',
                }}
              >
                {innerValue?.label ?? label}
              </div>
              <Svg name="CaretDown" className="has-text-black" />
            </div>
          </button>
        </div>
        <div
          className={`dropdown-menu column p-0 ${
            dropdownFull ? 'is-full-mobile is-full' : ''
          }`}
          id="dropdown-menu"
          role="menu"
        >
          <div className="dropdown-content">
            {options.map((itemValue, index) => (
              <button
                className={`button is-white dropdown-item has-text-grey${
                  itemValue?.value === innerValue ? ' is-active' : ''
                }`}
                onMouseDown={setValue(itemValue)}
                key={`drop-down-${index}`}
                data-testid={`item-${itemValue?.value}`}
              >
                {itemValue?.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default function DropdownWrapper({
  control,
  name,
  options = [],
  disabled = false,
  label = 'Select option',
  dropdownFull = true,
  isRight = false,
  padding = '',
  margin = '',
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, value, name, ref },
        fieldState: { error },
      }) => {
        return (
          <div>
            <Dropdown
              name={name}
              label={label}
              dropdownFull={dropdownFull}
              onSelectValue={onChange}
              options={options}
              defaultValue={value}
              padding={padding}
              margin={margin}
              disabled={disabled}
              isRight={isRight}
              ref={ref}
            />
            {error && (
              <FadeIn>
                <div className="pl-1 mt-2">
                  <p className="smaller-text has-text-danger">
                    {error?.message}
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        );
      }}
    />
  );
}
