import { memo } from 'react';
import Highlighter from 'react-highlight-words';

const HighlightText = memo(({ text, searchTerm }) => {
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
  return prevProps.text === nextProps.text && prevProps.searchTerm === nextProps.searchTerm;
});

HighlightText.displayName = 'HighlightText';

export default HighlightText; 