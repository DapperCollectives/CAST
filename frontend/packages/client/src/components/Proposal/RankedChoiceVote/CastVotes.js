import { useCallback, useRef } from 'react';
import update from 'immutability-helper';
import { DragLayer } from './DragLayer';
import { Draggable } from './Draggable';
import TextOption from './TextOption';

const ITEM_TYPE = 'vote';

const CastVotes = ({ votes, setVotes, readOnly = false, removeVote }) => {
  const ref = useRef(null);
  const moveVote = useCallback(
    (dragIndex, hoverIndex) => {
      setVotes((prevVotes) =>
        update(prevVotes, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevVotes[dragIndex]],
          ],
        })
      );
    },
    [setVotes]
  );
  return (
    <div ref={ref}>
      <DragLayer votes={votes} width={ref?.current?.offsetWidth} />
      {votes.map((vote, i) =>
        readOnly ? (
          <TextOption
            index={i}
            label={vote.label}
            labelType={vote.labelType}
            value={vote.value}
            optionsLength={vote.length}
            readOnly={readOnly}
            isCastVote={true}
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
