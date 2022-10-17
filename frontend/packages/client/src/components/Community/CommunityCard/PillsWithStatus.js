import { StatusPill } from 'components';

export default function PillsWithStatus({ pActive, pPending } = {}) {
  return (
    <div className="is-flex flex-1 is-flex-direction-column">
      {pActive > 0 && (
        <div className="is-flex is-justify-content-flex-end">
          <StatusPill
            status={
              <span className="has-text-black has-text-weight-bold">
                Active {pActive}
              </span>
            }
            backgroundColorClass="has-background-warning"
          />
        </div>
      )}
      {pPending > 0 && (
        <div className="is-flex is-justify-content-flex-end pt-2">
          <StatusPill
            status={
              <span className="has-text-black has-text-weight-bold">
                Upcoming {pPending}{' '}
              </span>
            }
            backgroundColorClass="has-background-orange"
          />
        </div>
      )}
    </div>
  );
}
