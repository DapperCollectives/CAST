const Error = (props) => (
  <div className="columns m-0 p-0 is-multiline is-mobile">
    <div className="column is-full m-0 p-0 is-flex is-justify-content-center py-5">
      <div
        className="rounded-full is-size-2 has-text-white is-flex is-align-items-center is-justify-content-center"
        style={{ height: 50, width: 50, background: 'red' }}
      >
        X
      </div>
    </div>
    <div className="column is-full p-0 m-0 divider pb-5 is-flex is-flex-direction-column is-align-items-center">
      <p>{props.errorTitle}</p>
      {props?.error && props.error}
    </div>
  </div>
);

export default Error;
