import { useState, useRef } from 'react';

const TagInput = ({ tags = [], onChange, placeholder = 'Type a tag and press Enter...' }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const addTag = (val) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className="tag-input-container"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span key={i} className="tag-removable">
          {tag}
          <button
            type="button"
            className="tag-remove-btn"
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        className="tag-text-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue && addTag(inputValue)}
        placeholder={tags.length === 0 ? placeholder : ''}
      />
    </div>
  );
};

export default TagInput;
