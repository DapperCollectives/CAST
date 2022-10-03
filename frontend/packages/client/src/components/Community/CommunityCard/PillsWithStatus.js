import { StatusPill } from 'components';

export default function PillsWithStatus({ pActive, pPending } = {}) {
  return (
    <div className="is-flex flex-1 is-flex-direction-column">
      {pActive > 0 && (
        <div className="is-flex is-justify-content-flex-end">
          <StatusPill
            status={<>Active {pActive}</>}
            backgroundColorClass="has-background-warning"
          />
        </div>
      )}
      {pPending > 0 && (
        <div className="is-flex is-justify-content-flex-end pt-2">
          <StatusPill
            status={<>Upcoming {pPending}</>}
            backgroundColorClass="has-background-orange"
          />
        </div>
      )}
    </div>
  );
}
