import React, { forwardRef, useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { UploadImageModal } from 'components';
import { customDraftToHTML, customHTMLtoDraft } from 'utils';
import {
  AtomicBlockUtils,
  ContentState,
  DefaultDraftBlockRenderMap,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import { Map } from 'immutable';
import AddImageOption from './ImageOption';

const options = ['blockType', 'inline', 'list', 'link', 'emoji'];
const inline = {
  options: ['bold', 'italic', 'underline'],
};
const list = {
  options: ['unordered'],
};
const link = {
  options: ['link'],
  defaultTargetOption: '_blank',
};

const styleMap = {
  IMAGE_CAPTION: {
    fontFamily: 'DM Sans',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '12px',
  },
};

// using a React component to render custom blocks
const ImageCaptionCustomBlock = (props) => {
  return <div className="image-caption-draft-js">{props.children}</div>;
};
const blockRenderMap = Map({
  'image-caption-block': {
    // element is used during paste or html conversion to auto match your component;
    // it is also retained as part of this.props.children and not stripped out. Example:
    // element: "section",
    wrapper: <ImageCaptionCustomBlock />,
  },
});

// keep support for other draft default block types and add our image-caption type
const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

const CustomEditor = forwardRef(({ onChange, value }, ref) => {
  const [localEditorState, setLocalEditorState] = useState(
    EditorState.createEmpty()
  );
  const [updated, setUpdated] = useState(false);

  // this effect runs on initial component load to create editor from html
  useEffect(() => {
    if (!updated) {
      const defaultValue = value ? value : '';
      const htmlToState = customHTMLtoDraft(defaultValue);
      const newEditorState = EditorState.createWithContent(htmlToState);
      setLocalEditorState(newEditorState);
    }
  }, [value, updated]);

  const onEditorStateChange = (editorState) => {
    !updated && setUpdated(true);
    setLocalEditorState(editorState);
    const pureHtml = customDraftToHTML(editorState.getCurrentContent());
    // when editor es empty but has been changed it will return <p><br></p>
    const textOnly = pureHtml.replace(/<[^>]+>/g, '');
    return onChange('' === textOnly ? '' : pureHtml);
  };

  const [showUploadImagesModal, setShowUploadImagesModal] = useState(false);

  const addImage = () => {
    setShowUploadImagesModal(true);
  };

  // function to update editor state
  // used to insert more than one image at the time
  function updateEditorState(
    editorState,
    { src, height, width, alt },
    caption
  ) {
    const entityKey = editorState
      .getCurrentContent()
      .createEntity('IMAGE', 'MUTABLE', {
        src,
        height,
        width,
        alt,
      })
      .getLastCreatedEntityKey();

    const selection = editorState.getSelection();

    const currentFocusKey = selection.getFocusKey();

    const newESWidthImageAndExtraBlock = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    );
    // user did not add caption text
    if (caption.length === 0) {
      return newESWidthImageAndExtraBlock;
    }
    // using cs: content state
    const contentState = newESWidthImageAndExtraBlock.getCurrentContent();

    const atomicBlockInserted = contentState.getBlockAfter(currentFocusKey);

    // AtomicBlockUtils.insertAtomicBlock inserts an empty block right after the cursor position
    const emptyBlockInserted = contentState.getBlockAfter(
      atomicBlockInserted.getKey()
    );

    const lastBlockAddedKey = emptyBlockInserted.getKey();

    // get existing blocks and
    // filter and remove the last block added
    // bc it's not necessary and caption block goes right after it
    const blockMapArray = contentState
      .getBlocksAsArray()
      .filter((block) => block.getKey() !== lastBlockAddedKey);

    // create new temporal content state to extract block with text
    const tempCSWithCaption = ContentState.createFromText(caption);
    // get the block with the text from temp content
    const [tempBlockArray] = tempCSWithCaption.getBlocksAsArray();

    // update block type so it's a custom type: image-caption
    const csWithUpdatedBlock = Modifier.setBlockType(
      ContentState.createFromBlockArray([tempBlockArray]),
      SelectionState.createEmpty(tempBlockArray.key),
      'image-caption-block'
    );
    // get the block with custom type and with text
    const [updatedBlock] = csWithUpdatedBlock.getBlocksAsArray();

    const newBlockMapArray = blockMapArray.reduce(
      (accumulator, currentValue) => {
        if (currentValue.getKey() === atomicBlockInserted.getKey()) {
          return [
            ...accumulator,
            currentValue,
            updatedBlock,
            emptyBlockInserted,
          ];
        }
        return [...accumulator, currentValue];
      },
      []
    );
    // add block updated and concat empty block at the end
    const newContentState = ContentState.createFromBlockArray(
      newBlockMapArray,
      contentState.getEntityMap()
    );

    // this keeps the history of the action
    const editorStateWithImageAndCaption = EditorState.push(
      newESWidthImageAndExtraBlock,
      newContentState,
      'insert-fragment'
    );

    // move cursor to the end
    const newState = EditorState.moveSelectionToEnd(
      editorStateWithImageAndCaption
    );
    return newState;
  }

  const addImagesToEditor = (images, captionValues) => {
    // captionValue
    let tempEditorState = localEditorState;

    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      const caption = captionValues[index];
      tempEditorState = updateEditorState(
        tempEditorState,
        {
          src: image.imageUrl,
          height: 'auto',
          width: '100%',
          alt: caption,
        },
        caption
      );
    }
    onEditorStateChange(tempEditorState);
    setShowUploadImagesModal(false);
  };

  const onDismissModal = () => {
    setShowUploadImagesModal(false);
  };
  return (
    <>
      {showUploadImagesModal && (
        <UploadImageModal
          onDismiss={onDismissModal}
          onDone={addImagesToEditor}
        />
      )}
      <Editor
        toolbar={{ options, inline, list, link }}
        editorState={localEditorState}
        toolbarClassName="toolbarClassName"
        wrapperClassName="border-light rounded-sm"
        editorClassName="px-4 content"
        onEditorStateChange={onEditorStateChange}
        toolbarCustomButtons={[<AddImageOption addImage={addImage} />]}
        customStyleMap={styleMap}
        blockRenderMap={extendedBlockRenderMap}
        ref={ref}
      />
    </>
  );
});

export default CustomEditor;
