import React, { memo } from 'react';
import Highlighter from 'react-highlight-words';

const HighlightText = memo(({ text, searchTerm }) => {
  // Don't highlight if no search term, no text, or if the text is being used in an input
  if (!searchTerm || !text || text === searchTerm) {
    return text;
  }

  return (
    <Highlighter
      highlightStyle={{ backgroundColor: 'bg-lime-200', padding: 0 }}
      searchWords={[searchTerm]}
      autoEscape={true}
      textToHighlight={String(text)}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if text or searchTerm changes
  return prevProps.text === nextProps.text && prevProps.searchTerm === nextProps.searchTerm;
});

HighlightText.displayName = 'HighlightText';

export default HighlightText; 