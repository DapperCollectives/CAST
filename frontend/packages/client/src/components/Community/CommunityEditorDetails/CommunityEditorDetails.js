import MembersEditor from './MembersEditor.js';

export default function CommunityEditorDetails({ communityId } = {}) {
  return (
    <>
      <MembersEditor
        description="Admins can edit community settings and moderate proposals.
            We recommend at least two admin for each community, but it is not a requirement.
            Please add one address per line."
        type="admin"
        communityId={communityId}
      />
      <MembersEditor
        title="Authors"
        addrType="Author"
        description="Authors can create and publish proposals, selecting from voting strategies set by an Admin.
            Admins are automatically added as Authors."
        communityId={communityId}
      />
    </>
  );
}
