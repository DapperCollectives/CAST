import Blockies from 'react-blockies';
import { useNotificationServiceContext } from 'contexts/NotificationService';
import { useCommunityDetails } from 'hooks';

export default function CommunitiesList() {
  const { notificationSettings, subscribeCommunity, unsubscribeCommunity } =
    useNotificationServiceContext();
  const { communitySubscription } = notificationSettings;
  const handleUpdateCommunitySubscription = (communityId, subscribed) => {
    if (subscribed) {
      unsubscribeCommunity(communityId);
    } else {
      subscribeCommunity(communityId);
    }
  };
  return (
    <div>
      <h3 className="is-size-6 has-text-weight-medium" style={{ width: '66%' }}>
        Edit which communities you want notifications from:
      </h3>
      <ul className="my-2">
        {communitySubscription.map(({ communityId, subscribed }) => (
          <CommunityListItem
            key={communityId}
            communityId={communityId}
            subscribed={subscribed}
            handleUpdateCommunitySubscription={
              handleUpdateCommunitySubscription
            }
          />
        ))}
      </ul>
    </div>
  );
}

function CommunityListItem({
  communityId,
  subscribed,
  handleUpdateCommunitySubscription,
}) {
  const { data: community, isLoading } = useCommunityDetails(communityId);
  const { name, logo, slug } = community ?? {};
  if (isLoading) return null;

  return (
    <li className="my-1 is-flex is-flex-direction-row has-background-light-grey rounded p-2 ">
      <div className="flex-2 is-flex is-flex-direction-row is-align-items-center">
        {logo ? (
          <div
            className="border-light rounded-full"
            style={{
              height: '40px',
              weight: '40px',
              backgroundImage: `url(${logo})`,
              backgroundSize: 'cover',
            }}
          />
        ) : (
          <Blockies
            seed={slug ?? `seed-${communityId}`}
            size={10}
            scale={4}
            className="blockies"
          />
        )}
        <p className="ml-2 is-size-6 has-text-weight-medium">{name}</p>
      </div>
      <div>
        <input
          id={`subscribe${communityId}Notification`}
          type="checkbox"
          className="switch is-rounded is-medium"
          checked={subscribed}
          onChange={() =>
            handleUpdateCommunitySubscription(communityId, subscribed)
          }
        ></input>
        <label htmlFor={`subscribe${communityId}Notification`}></label>
      </div>
    </li>
  );
}
