import { useMediaQuery, useNotificationService } from 'hooks';

export default function SettingsSection() {
  const notMobile = useMediaQuery();
  return (
    <div
      className={`column is-flex is-flex-direction-column is-two-thirds ${
        notMobile ? 'mt-6 px-6' : 'px-5'
      }`}
    >
      <section className="is-flex is-flex-direction-column">
        <h2 className="is-size-4 has-text-weight-bold">Settings</h2>
        <h3 className="is-size-5 my-2">Connected Wallet</h3>
        <div className="is-flex is-flex-direction-row is-flex-wrap-wrap">
          <input
            className="rounded-lg border-light flex-3 flex-shrink-5"
            style={{ height: 36, maxWidth: 246 }}
          ></input>
          <button
            className={`flex-1 button rounded-lg has-background-black has-text-white ${
              notMobile ? 'ml-2' : 'ml-2 mt-4'
            }`}
            style={{ height: 40, maxWidth: 128 }}
          >
            Disconnect
          </button>
        </div>
      </section>
    </div>
  );
}
