import { Svg } from '@cast/shared-components';

export default function ModalAboutItem({ title = '', subTittle = '' } = {}) {
  return (
    <div
      className="border-light rounded-sm is-flex is-align-ittems-center flex-1"
      style={{ minHeight: '97px' }}
    >
      <div className="columns flex-1 is-mobile p-3-mobile">
        <div className="column pr-0 is-2 is-flex is-align-items-center is-align-content-strech is-justify-content-center">
          <Svg name="Star" width="24" height="24" fill="black" />
        </div>

        <div className="column pl-0 is-flex is-flex-direction-column is-justify-content-center medium-text">
          <h5 className="has-text-weight-bold">{title}</h5>
          <p className="pt-2 has-text-grey">{subTittle}</p>
        </div>
      </div>
    </div>
  );
}
