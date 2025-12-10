import React, { useState, useCallback } from 'react';

// 협업 입력 필드 - 다른 사용자의 커서/입력을 표시
export function CollaborativeInput({
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  fieldName,
  getCursorForField,
  sendCursorPosition,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const cursors = getCursorForField ? getCursorForField(fieldName) : [];

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    if (sendCursorPosition) {
      sendCursorPosition(fieldName);
    }
    if (onFocus) onFocus(e);
  }, [fieldName, sendCursorPosition, onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const handleChange = useCallback((e) => {
    // 타이핑 중에도 커서 위치 전송 (디바운싱 없이 즉시)
    if (sendCursorPosition) {
      sendCursorPosition(fieldName);
    }
    if (onChange) onChange(e);
  }, [fieldName, sendCursorPosition, onChange]);

  // 다른 사용자가 이 필드를 편집 중인지 확인
  const hasRemoteCursor = cursors.length > 0;
  const firstCursor = cursors[0];

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`${className} ${hasRemoteCursor ? 'ring-2' : ''}`}
        style={hasRemoteCursor ? {
          '--tw-ring-color': firstCursor.color,
          boxShadow: `0 0 0 2px ${firstCursor.color}33`
        } : {}}
        {...props}
      />
      {/* 다른 사용자의 커서 표시 */}
      {hasRemoteCursor && (
        <div
          className="absolute -top-6 left-0 px-2 py-0.5 text-xs text-white rounded-t-md whitespace-nowrap z-10"
          style={{ backgroundColor: firstCursor.color }}
        >
          {firstCursor.userName}
          {cursors.length > 1 && ` 외 ${cursors.length - 1}명`}
        </div>
      )}
    </div>
  );
}

// 협업 텍스트영역
export function CollaborativeTextarea({
  value,
  onChange,
  onFocus,
  onBlur,
  fieldName,
  getCursorForField,
  sendCursorPosition,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const cursors = getCursorForField ? getCursorForField(fieldName) : [];

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    if (sendCursorPosition) {
      sendCursorPosition(fieldName);
    }
    if (onFocus) onFocus(e);
  }, [fieldName, sendCursorPosition, onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  }, [onBlur]);

  const handleChange = useCallback((e) => {
    if (sendCursorPosition) {
      sendCursorPosition(fieldName);
    }
    if (onChange) onChange(e);
  }, [fieldName, sendCursorPosition, onChange]);

  const hasRemoteCursor = cursors.length > 0;
  const firstCursor = cursors[0];

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`${className} ${hasRemoteCursor ? 'ring-2' : ''}`}
        style={hasRemoteCursor ? {
          '--tw-ring-color': firstCursor.color,
          boxShadow: `0 0 0 2px ${firstCursor.color}33`
        } : {}}
        {...props}
      />
      {hasRemoteCursor && (
        <div
          className="absolute -top-6 left-0 px-2 py-0.5 text-xs text-white rounded-t-md whitespace-nowrap z-10"
          style={{ backgroundColor: firstCursor.color }}
        >
          {firstCursor.userName}
          {cursors.length > 1 && ` 외 ${cursors.length - 1}명`}
        </div>
      )}
    </div>
  );
}

export default CollaborativeInput;
