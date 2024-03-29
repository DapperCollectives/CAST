import { useMemo } from 'react';
import { Svg } from '@cast/shared-components';
import { StatusPill } from 'components';
import { FilterValues } from 'const';

export default function StyledStatusPill({ status }) {
  const props = useMemo(
    () => ({
      [FilterValues.active]: {
        status: 'Active',
        backgroundColorClass: 'has-background-warning',
      },
      [FilterValues.pending]: {
        status: 'Upcoming',
        backgroundColorClass: 'has-background-orange',
      },
      [FilterValues.closed]: {
        status: (
          <span>
            Complete <Svg name="CheckOutlined" />
          </span>
        ),
        backgroundColorClass: 'has-background-success',
      },
      [FilterValues.cancelled]: {
        status: 'Canceled',
        backgroundColorClass: 'has-background-danger',
      },
    }),
    []
  );
  // any other status do not render
  if (!props[status]) {
    return null;
  }

  return <StatusPill {...props[status]} />;
}
