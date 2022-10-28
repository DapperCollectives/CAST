CREATE TABLE proposal_notifications (
  proposal_id INT not null references proposals(id),
  job_id UUID not null
);
