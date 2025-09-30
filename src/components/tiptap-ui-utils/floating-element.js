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
  floatingOptions,
  zIndex = 50,
  onOpenChange,
  onRectChange,
  getBoundingClientRect,
  updateOnScroll = true,
  closeOnEscape = true,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const rafIdRef = React.useRef(null);
  const lastRectRef = React.useRef(null);
  const lastOpenRef = React.useRef(false);
  const debounceTimerRef = React.useRef(null);

  const rectThreshold = typeof floatingOptions?.rectThreshold === 'number' ? floatingOptions.rectThreshold : 2; // px
  const debounceMs = typeof floatingOptions?.debounce === 'number' ? floatingOptions.debounce : 120; // ms

  const rectsAlmostEqual = (a, b, t) => {
    if (!a || !b) return false;
    return (
      Math.abs(a.top - b.top) <= t &&
      Math.abs(a.left - b.left) <= t &&
      Math.abs(a.width - b.width) <= t &&
      Math.abs(a.height - b.height) <= t
    );
  };

  React.useEffect(() => {
    if (!editor) return;
    const runUpdateNow = () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        const hasSelection = !editor.state.selection.empty;
        const nextOpen = typeof shouldShow === 'boolean' ? shouldShow : hasSelection;
        const r = nextOpen ? (getBoundingClientRect ? getBoundingClientRect(editor) : getSelectionRect()) : null;

        const openValue = nextOpen && !!r;
        const rectChanged = !rectsAlmostEqual(lastRectRef.current, r, rectThreshold);
        const openChanged = lastOpenRef.current !== openValue;

        if (openChanged) {
          setOpen(openValue);
          if (onOpenChange) onOpenChange(openValue);
          lastOpenRef.current = openValue;
        }
        if (openValue && rectChanged) {
          setRect(r);
          if (onRectChange) onRectChange(r);
          lastRectRef.current = r;
        }
      });
    };

    const update = () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(runUpdateNow, debounceMs);
    };
    const handleBlur = () => setOpen(false);
    const handleKey = (e) => {
      if (closeOnEscape && e.key === 'Escape') setOpen(false);
    };

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    editor.on('focus', update);
    editor.on('blur', handleBlur);
    if (updateOnScroll) window.addEventListener('scroll', update, true);
    window.addEventListener('keydown', handleKey);
    update();
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
      editor.off('focus', update);
      editor.off('blur', handleBlur);
      if (updateOnScroll) window.removeEventListener('scroll', update, true);
      window.removeEventListener('keydown', handleKey);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [editor, shouldShow, onOpenChange, onRectChange, getBoundingClientRect, updateOnScroll, closeOnEscape, rectThreshold, debounceMs]);

  if (!open || !rect) return null;

  const placement = floatingOptions?.placement || 'top';
  const offset = Number(floatingOptions?.offset ?? 24);

  let top = rect.top;
  let left = rect.left + rect.width / 2;
  let translate = 'translate(-50%, -100%)';

  if (placement === 'top') {
    top = rect.top - offset;
    translate = 'translate(-50%, -100%)';
  } else if (placement === 'bottom') {
    top = rect.bottom + offset;
    translate = 'translate(-50%, 0)';
  } else if (placement === 'left') {
    left = rect.left - offset;
    top = rect.top + rect.height / 2;
    translate = 'translate(-100%, -50%)';
  } else if (placement === 'right') {
    left = rect.right + offset;
    top = rect.top + rect.height / 2;
    translate = 'translate(0, -50%)';
  }

  const style = {
    position: 'fixed',
    top,
    left,
    transform: translate,
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


