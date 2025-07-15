import { memo, useContext } from 'react';
import Highlighter from 'react-highlight-words';
import { SearchContext } from '../../utils/SearchContext';

const HighlightText = memo(({ text, searchTerm: propSearchTerm }) => {
  const contextSearchTerm = useContext(SearchContext);
  const searchTerm = propSearchTerm || contextSearchTerm;
  
  if (!searchTerm || !text) {
    return text;
  }

  const textString = String(text || '');
  
  if (textString.toLowerCase() === searchTerm.toLowerCase()) {
    return textString;
  }

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return (
    <Highlighter
      highlightStyle={{ 
        backgroundColor: '#fef08a', 
        padding: '1px 2px',
        borderRadius: '2px',
        fontWeight: 'bold'
      }}
      searchWords={[escapedSearchTerm]}
      autoEscape={false}
      textToHighlight={textString}
      caseSensitive={false}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.text === nextProps.text && prevProps.searchTerm === nextProps.searchTerm;
});

HighlightText.displayName = 'HighlightText';

export default HighlightText; 