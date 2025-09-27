import React from 'react';

function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return null;
  return rect;
}

export const FloatingElement = ({
  editor,
  shouldShow,
  zIndex = 50,
  onOpenChange,
  onRectChange,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);

  React.useEffect(() => {
    if (!editor) return;
    const update = () => {
      const hasSelection = !editor.state.selection.empty;
      const nextOpen = typeof shouldShow === 'boolean' ? shouldShow : hasSelection;
      const r = nextOpen ? getSelectionRect() : null;
      setRect(r);
      setOpen(nextOpen && !!r);
      if (onRectChange) onRectChange(r);
      if (onOpenChange) onOpenChange(nextOpen && !!r);
    };
    const handleBlur = () => setOpen(false);

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    editor.on('focus', update);
    editor.on('blur', handleBlur);
    update();
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
      editor.off('focus', update);
      editor.off('blur', handleBlur);
    };
  }, [editor, shouldShow, onOpenChange, onRectChange]);

  if (!open || !rect) return null;

  const style = {
    position: 'fixed',
    top: rect.top - 8,
    left: rect.left + rect.width / 2,
    transform: 'translate(-50%, -100%)',
    zIndex,
    pointerEvents: 'auto',
  };

  return (
    <div style={style} onMouseDown={(e) => e.preventDefault()}>
      {children}
    </div>
  );
};

export default FloatingElement;


