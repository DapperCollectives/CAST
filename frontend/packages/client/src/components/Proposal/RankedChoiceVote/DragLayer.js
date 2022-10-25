import { useDragLayer } from 'react-dnd';
import TextOption from './TextOption';

const getLayerStyles = (width) => ({
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width,
});

function getItemStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  let { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const DragLayer = ({ votes, width }) => {
  const { isDragging, initialOffset, currentOffset, item } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  if (!isDragging) {
    return null;
  }

  const draggedVote = votes?.find((vote) => vote.value === item.id);

  if (!draggedVote) {
    return null;
  }

  return (
    <div style={getLayerStyles(width)}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <TextOption
          label={draggedVote.label}
          index={item.index}
          isDragging={isDragging}
          isCastVote
        />
      </div>
    </div>
  );
};
