import { Svg } from '@cast/shared-components';
import { Title } from '.';

export default function CommunityLinks({
  instagramUrl,
  twitterUrl,
  websiteUrl,
  discordUrl,
  githubUrl,
} = {}) {
  const showTitle = [
    instagramUrl,
    twitterUrl,
    websiteUrl,
    discordUrl,
    githubUrl,
  ].every((val) => !!val);
  return (
    <div className="columns my-0 is-multiline">
      {showTitle && <Title className="column is-12 py-0">Links</Title>}
      {websiteUrl && (
        <a
          className="column pt-0 pb-1 is-12 is-flex is-align-items-center has-text-black"
          target="_blank"
          rel="noreferrer noopenner"
          href={websiteUrl}
        >
          <Svg name="Website" width="20px" height="20px" />{' '}
          <span className="pl-2">Website</span>
        </a>
      )}
      {discordUrl && (
        <a
          className="column py-1 is-12 is-flex is-align-items-center has-text-black"
          target="_blank"
          rel="noreferrer noopenner"
          href={discordUrl}
        >
          <Svg name="Discord" width="20px" height="23.3px" />
          <span className="pl-2">Discord</span>
        </a>
      )}
      {instagramUrl && (
        <a
          className="column py-1 is-12 is-flex is-align-items-center has-text-black"
          target="_blank"
          rel="noreferrer noopenner"
          href={instagramUrl}
        >
          <Svg name="Instagram" />
          <span className="pl-2">Instagram</span>
        </a>
      )}
      {twitterUrl && (
        <a
          className="column py-1 is-12 is-flex is-align-items-center has-text-black"
          target="_blank"
          rel="noreferrer noopenner"
          href={twitterUrl}
        >
          <Svg name="Twitter" width="20px" height="23.3px" />
          <span className="pl-2">Twitter</span>
        </a>
      )}
      {githubUrl && (
        <a
          className="column py-1 is-12 is-flex is-align-items-center has-text-black"
          target="_blank"
          rel="noreferrer noopenner"
          href={githubUrl}
        >
          <Svg name="GitHub" width="20px" height="23.3px" />
          <span className="pl-2">Github</span>
        </a>
      )}
    </div>
  );
}
