import { Link } from 'react-router-dom';
import { useCommunityDetails } from 'hooks';
import AvatarBloquies from './AvatarBloquies';

export default function CommunityName({ communityId, classNames }) {
  const { data: community, isLoading } = useCommunityDetails(communityId);
  const {
    name: communityName,
    logo: communityLogo,
    slug: communitySlug,
  } = community ?? {};

  if (isLoading) {
    return null;
  }

  return (
    <div className={`is-flex ${classNames}`}>
      <AvatarBloquies
        slug={communitySlug}
        id={communityId}
        logo={communityLogo}
      />
      <Link to={`/community/${communityId}`}>
        <p className="small-text pl-2 is-underlined has-text-grey">
          {communityName}
        </p>
      </Link>
    </div>
  );
}
