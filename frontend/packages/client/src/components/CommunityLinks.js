import React from "react";
import { Twitter, Discord, Website, Instagram } from "./Svg";

export default function CommunityLinks({
  instagramUrl,
  twitterUrl,
  websiteUrl,
  discordUrl,
} = {}) {
  return (
    <div className="columns my-0 is-multiline">
      <div
        className="column is-12 has-text-weight-bold is-uppercase small-text"
        style={{ marginBottom: "20px" }}
      >
        Links
      </div>
      {websiteUrl && (
        <a
          className="column pt-0 pb-1 is-12 is-flex is-align-items-center has-text-black"
          target="_blank"
          rel="noreferrer noopenner"
          href={websiteUrl}
        >
          <Website width="20px" height="20px" />{" "}
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
          <Discord width="20px" height="23.3px" />
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
          <Instagram />
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
          <Twitter width="20px" height="23.3px" />
          <span className="pl-2">Twitter</span>
        </a>
      )}
    </div>
  );
}
