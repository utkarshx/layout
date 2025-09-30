import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Select, SelectItem } from './components/ui/select';
import useAppStore from './store/useAppStore';

const isLikelyUrl = (value) => {
  if (!value) return false;
  try {
    // If it parses as URL with protocol, it's fine
    const u = new URL(value);
    return !!u.protocol && !!u.host;
  } catch (_) {
    // Fallback: if missing protocol, try adding https:// and re-parse
    try {
      const u2 = new URL(`https://${value}`);
      return !!u2.protocol && !!u2.host;
    } catch {
      return false;
    }
  }
};

const normalizeUrl = (value) => {
  if (!value) return '';
  try {
    // Already a proper absolute URL
    // eslint-disable-next-line no-new
    new URL(value);
    return value;
  } catch {
    return `https://${value}`;
  }
};

const BrowserPanel = () => {
  const [address, setAddress] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  const iframeRef = useRef(null);
  const { addTask, environments } = useAppStore();

  // Capture overlay state
  const [captureMode, setCaptureMode] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formEnvironmentId, setFormEnvironmentId] = useState(null);
  const [lastClick, setLastClick] = useState(null);
  const [anchorPoint, setAnchorPoint] = useState(null);
  const [hoverRect, setHoverRect] = useState(null);

  const handleGo = () => {
    if (!address) return;
    if (!isLikelyUrl(address)) return;
    const next = normalizeUrl(address.trim());
    setCurrentUrl(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGo();
    }
  };

  useEffect(() => {
    // Optionally, sync address bar when URL changes externally (not applicable here)
  }, [currentUrl]);

  // Initialize default environment selection
  useEffect(() => {
    if (!formEnvironmentId && environments?.length > 0) {
      setFormEnvironmentId(environments[0].id);
    }
  }, [environments, formEnvironmentId]);

  // Handle messages from iframe content (if the page posts to parent)
  useEffect(() => {
    const onMessage = (event) => {
      const { data } = event || {};
      if (!data || typeof data !== 'object') return;
      if (data.type === 'open_task_form') {
        if (data.payload?.title) setFormTitle(String(data.payload.title));
        if (data.payload?.details) setFormDetails(String(data.payload.details));
        // Open near top-left if no prior click
        setAnchorPoint({ x: 40, y: 40 });
        setPopoverOpen(true);
      } else if (data.type === 'create_task') {
        const title = String(data.payload?.title || 'New Task');
        const newTask = {
          id: `task_${Date.now()}`,
          name: title,
          status: 'pending',
          priority: data.payload?.priority || 'medium',
          environmentId: data.payload?.environmentId || formEnvironmentId || environments?.[0]?.id || null,
          sourceUrl: currentUrl,
        };
        addTask(newTask);
      } else if (data.type === 'hover_rect') {
        // Expect rect in iframe client coords
        const r = data.rect;
        if (r && typeof r.x === 'number') {
          setHoverRect({ x: r.x, y: r.y, width: r.width, height: r.height });
        }
      } else if (data.type === 'hover_clear') {
        setHoverRect(null);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [addTask, environments, formEnvironmentId, currentUrl]);

  const getLocalPoint = (e) => {
    const container = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - container.left, y: e.clientY - container.top };
  };

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const p = getLocalPoint(e);
    setLastClick({ x: p.x, y: p.y, url: currentUrl });
    setAnchorPoint({ x: p.x, y: p.y });
    setPopoverOpen(true);
  };

  const handleOverlayMouseMove = (e) => {
    if (!captureMode) return;
    const p = getLocalPoint(e);
    try {
      const frameWin = iframeRef.current?.contentWindow;
      if (frameWin) {
        frameWin.postMessage({ type: 'hover_probe', point: p, dpr: window.devicePixelRatio || 1 }, '*');
      }
    } catch {}
  };

  const handleOverlayMouseLeave = () => {
    setHoverRect(null);
    try {
      const frameWin = iframeRef.current?.contentWindow;
      if (frameWin) frameWin.postMessage({ type: 'hover_end' }, '*');
    } catch {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    const newTask = {
      id: `task_${Date.now()}`,
      name: formTitle.trim(),
      status: 'pending',
      priority: formPriority,
      environmentId: formEnvironmentId || environments?.[0]?.id || null,
      sourceUrl: currentUrl,
      click: lastClick,
      details: formDetails,
    };
    addTask(newTask);
    setPopoverOpen(false);
    setFormTitle('');
    setFormDetails('');
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="p-2 border-b border-gray-700 flex items-center gap-2">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter website URL (e.g. https://example.com or example.com)"
          className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400"
        />
        <Button size="sm" variant="outline" onClick={handleGo} className="shrink-0">
          Go
        </Button>
        <Button
          size="sm"
          variant={captureMode ? 'active' : 'outline'}
          onClick={() => setCaptureMode((v) => !v)}
          className="shrink-0"
          title={captureMode ? 'Disable capture mode' : 'Enable capture mode'}
        >
          {captureMode ? 'Capturing…' : 'Capture'}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-black relative">
        <iframe
          ref={iframeRef}
          title="browser"
          src={currentUrl}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-modals allow-presentation allow-top-navigation-by-user-activation"
        />
        {captureMode && (
          <div
            onClick={handleOverlayClick}
            className="absolute inset-0 z-10 cursor-crosshair"
            style={{ background: 'transparent' }}
            onMouseMove={handleOverlayMouseMove}
            onMouseLeave={handleOverlayMouseLeave}
          >
            <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-gray-900/80 border border-gray-700 text-gray-200">
              Click anywhere to create a task
            </div>
            {hoverRect && (
              <div
                className="absolute pointer-events-none border-2 border-blue-400/80 bg-blue-400/10"
                style={{ left: hoverRect.x, top: hoverRect.y, width: hoverRect.width, height: hoverRect.height }}
              />
            )}
          </div>
        )}
        {/* Invisible anchor and popover-based task form */}
        <div
          style={{ position: 'absolute', left: (anchorPoint?.x || -9999), top: (anchorPoint?.y || -9999), width: 1, height: 1 }}
        >
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button aria-hidden="true" style={{ width: 1, height: 1, opacity: 0 }} />
            </PopoverTrigger>
            <PopoverContent className="w-96 bg-gray-900 border-gray-700 text-white p-3">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-400">Title</label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Task title"
                    className="mt-1 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">Details</label>
                  <textarea
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="Describe the change you want"
                    className="mt-1 w-full h-24 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Priority</label>
                    <Select value={formPriority} onValueChange={setFormPriority}>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Environment</label>
                    <Select value={formEnvironmentId || ''} onValueChange={setFormEnvironmentId}>
                      {environments?.map((env) => (
                        <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">Source</label>
                  <div className="mt-1 text-xs text-gray-300 break-all">{currentUrl}</div>
                </div>

                {lastClick && (
                  <div className="text-xs text-gray-400">Click at x:{Math.round(lastClick.x)} y:{Math.round(lastClick.y)}</div>
                )}

                <div className="flex items-center gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setPopoverOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="active">Create Task</Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default BrowserPanel;


