import { useCallback, useRef } from 'react';
import { DragLayer } from './DragLayer';
import { Draggable } from './Draggable';
import TextOption from './TextOption';

const ITEM_TYPE = 'vote';

const CastVotes = ({
  votes,
  setVotes,
  readOnly = false,
  removeVote,
  hasntVoted,
}) => {
  const ref = useRef(null);
  const moveVote = useCallback(
    (dragIndex, hoverIndex) =>
      setVotes((prevVotes) => {
        const votes = [...prevVotes];
        const draggedVote = votes.splice(dragIndex, 1)[0];
        votes.splice(hoverIndex, 0, draggedVote);
        return votes;
      }),
    [setVotes]
  );

  return (
    <div ref={ref}>
      <DragLayer votes={votes} width={ref?.current?.offsetWidth} />
      {votes.map((vote, i) =>
        readOnly ? (
          <TextOption
            key={`${vote.value}-${i}`}
            index={i}
            label={vote.label}
            labelType={vote.labelType}
            value={vote.value}
            optionsLength={vote.length}
            readOnly={readOnly}
            isCastVote={!hasntVoted}
          />
        ) : (
          <Draggable
            key={vote.value}
            index={i}
            id={vote.value}
            moveItem={moveVote}
            itemType={ITEM_TYPE}
            removeItem={removeVote}
          >
            <TextOption
              index={i}
              label={vote.label}
              labelType={vote.labelType}
              value={vote.value}
              optionsLength={vote.length}
              readOnly={readOnly}
              isCastVote={true}
              handleVote={removeVote}
            />
          </Draggable>
        )
      )}
    </div>
  );
};

export default CastVotes;
