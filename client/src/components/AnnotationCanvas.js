import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

const problemTypes = {
  'Inflammed/Red gums': '#A855F7',
  'Malaligned': '#EAB308',
  'Receded gums': '#78716C',
  'Stains': '#EF4444',
  'Attrition': '#22D3EE',
  'Crowns': '#EC4899'
};

const drawingTools = {
  rectangle: 'Rectangle',
  circle: 'Circle',
  arrow: 'Arrow',
  freehand: 'Freehand'
};

const AnnotationCanvas = ({ imageUrl, annotations, onAnnotationsChange }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [currentProblem, setCurrentProblem] = useState('Stains');
  const [currentTool, setCurrentTool] = useState('rectangle');
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  useEffect(() => {
    initializeCanvas();
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
    // eslint-disable-next-line
  }, [imageUrl]);

  useEffect(() => {
    setupDrawingMode();
  }, [currentTool]);

  const initializeCanvas = () => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });
    fabricCanvasRef.current = canvas;

    fabric.Image.fromURL(imageUrl, (img) => {
      const canvasWidth = 800;
      const canvasHeight = 600;
      const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);

      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false
      });

      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      setIsLoading(false);

      // Load existing annotations
      if (annotations && annotations.length > 0) {
        loadAnnotations(annotations);
      }
    }, { crossOrigin: 'anonymous' });

    // Track changes but don't auto-save
    canvas.on('object:modified', () => setHasUnsavedChanges(true));
    canvas.on('object:moving', () => setHasUnsavedChanges(true));
    canvas.on('object:scaling', () => setHasUnsavedChanges(true));
    canvas.on('object:removed', () => setHasUnsavedChanges(true));
    canvas.on('object:added', (e) => {
      if (!isLoading && e.target.problem) {
        setHasUnsavedChanges(true);
      }
    });

    setupDrawingEvents(canvas);
  };

  const setupDrawingEvents = (canvas) => {
    canvas.on('mouse:down', (o) => {
      if (currentTool === 'freehand') return;
      
      const pointer = canvas.getPointer(o.e);
      setIsDrawing(true);
      setStartPoint(pointer);
    });

    canvas.on('mouse:move', (o) => {
      if (!isDrawing || currentTool === 'freehand') return;
      
      const pointer = canvas.getPointer(o.e);
      const activeObject = canvas.getActiveObject();
      
      if (activeObject && activeObject.isDrawing) {
        updateDrawingObject(activeObject, startPoint, pointer);
        canvas.renderAll();
      }
    });

    canvas.on('mouse:up', () => {
      if (currentTool === 'freehand') return;
      
      setIsDrawing(false);
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.isDrawing) {
        activeObject.isDrawing = false;
        activeObject.setCoords();
      }
    });
  };

  const setupDrawingMode = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (currentTool === 'freehand') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = problemTypes[currentProblem];
    } else {
      canvas.isDrawingMode = false;
    }
  };

  const updateDrawingObject = (obj, start, current) => {
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);
    const left = Math.min(start.x, current.x);
    const top = Math.min(start.y, current.y);

    if (obj.type === 'rect') {
      obj.set({ left, top, width, height });
    } else if (obj.type === 'circle') {
      const radius = Math.sqrt(width * width + height * height) / 2;
      obj.set({ 
        left: start.x - radius, 
        top: start.y - radius, 
        radius 
      });
    } else if (obj.type === 'line') {
      obj.set({ x1: start.x, y1: start.y, x2: current.x, y2: current.y });
    }
  };

  const addShape = () => {
    const canvas = fabricCanvasRef.current;
    let shape;

    const commonProps = {
      fill: currentTool === 'arrow' ? problemTypes[currentProblem] : 'transparent',
      stroke: problemTypes[currentProblem],
      strokeWidth: 3,
      problem: currentProblem,
      cornerColor: problemTypes[currentProblem],
      borderColor: problemTypes[currentProblem],
      isDrawing: true
    };

    switch (currentTool) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: 120,
          top: 120,
          width: 100,
          height: 50,
          ...commonProps
        });
        break;

      case 'circle':
        shape = new fabric.Circle({
          left: 120,
          top: 120,
          radius: 30,
          ...commonProps
        });
        break;

      case 'arrow':
        shape = createArrow(120, 120, 220, 120, problemTypes[currentProblem]);
        shape.problem = currentProblem;
        break;

      default:
        return;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
    }
  };

  const createArrow = (x1, y1, x2, y2, color) => {
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: color,
      strokeWidth: 3,
      selectable: false
    });

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    const arrowHead1 = new fabric.Line([
      x2 - arrowLength * Math.cos(angle - arrowAngle),
      y2 - arrowLength * Math.sin(angle - arrowAngle),
      x2,
      y2
    ], {
      stroke: color,
      strokeWidth: 3,
      selectable: false
    });

    const arrowHead2 = new fabric.Line([
      x2 - arrowLength * Math.cos(angle + arrowAngle),
      y2 - arrowLength * Math.sin(angle + arrowAngle),
      x2,
      y2
    ], {
      stroke: color,
      strokeWidth: 3,
      selectable: false
    });

    const arrow = new fabric.Group([line, arrowHead1, arrowHead2], {
      left: x1,
      top: y1,
      selectable: true
    });

    return arrow;
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  const clearAll = () => {
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.problem) {
        canvas.remove(obj);
      }
    });
    setHasUnsavedChanges(true);
  };

  const loadAnnotations = (annotations) => {
    const canvas = fabricCanvasRef.current;
    annotations.forEach(ann => {
      let shape;
      
      const commonProps = {
        left: ann.left,
        top: ann.top,
        fill: ann.type === 'arrow' ? problemTypes[ann.problem] : 'transparent',
        stroke: problemTypes[ann.problem],
        strokeWidth: 3,
        problem: ann.problem,
        cornerColor: problemTypes[ann.problem],
        borderColor: problemTypes[ann.problem]
      };

      switch (ann.type) {
        case 'rectangle':
          shape = new fabric.Rect({
            ...commonProps,
            width: ann.width,
            height: ann.height
          });
          break;
        case 'circle':
          shape = new fabric.Circle({
            ...commonProps,
            radius: ann.radius
          });
          break;
        case 'arrow':
          shape = createArrow(ann.x1, ann.y1, ann.x2, ann.y2, problemTypes[ann.problem]);
          shape.problem = ann.problem;
          break;
        default:
          shape = new fabric.Rect({
            ...commonProps,
            width: ann.width,
            height: ann.height
          });
      }

      if (shape) {
        canvas.add(shape);
      }
    });
    canvas.renderAll();
  };

  const saveAnnotations = () => {
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const currentAnnotations = objects.filter(obj => obj.problem).map(obj => {
      const annotation = {
        left: obj.left,
        top: obj.top,
        problem: obj.problem
      };

      if (obj.type === 'rect') {
        annotation.type = 'rectangle';
        annotation.width = obj.width * obj.scaleX;
        annotation.height = obj.height * obj.scaleY;
      } else if (obj.type === 'circle') {
        annotation.type = 'circle';
        annotation.radius = obj.radius * obj.scaleX;
      } else if (obj.type === 'group') {
        annotation.type = 'arrow';
        const bounds = obj.getBoundingRect();
        annotation.x1 = bounds.left;
        annotation.y1 = bounds.top;
        annotation.x2 = bounds.left + bounds.width;
        annotation.y2 = bounds.top + bounds.height;
      } else {
        annotation.type = 'freehand';
        annotation.path = obj.path;
      }

      return annotation;
    });
    
    const annotatedImageData = canvas.toDataURL('image/png');
    
    onAnnotationsChange(currentAnnotations, annotatedImageData);
    setHasUnsavedChanges(false);
  };

  const viewAnnotation = () => {
    const canvas = fabricCanvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const newWindow = window.open();
    newWindow.document.write(`
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5;">
        <img src="${dataURL}" style="max-width: 95%; max-height: 95%; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px;" />
      </div>
    `);
  };

  return (
    <div className="annotation-container" style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Enhanced UI Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Dental Annotation Tool
        </h3>

        {/* Drawing Tools */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Drawing Tools:
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(drawingTools).map(([tool, name]) => (
              <button
                key={tool}
                onClick={() => setCurrentTool(tool)}
                style={{
                  padding: '8px 16px',
                  background: currentTool === tool ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                  color: currentTool === tool ? '#667eea' : 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Types */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Problem Type:
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {Object.entries(problemTypes).map(([name, color]) => (
              <div
                key={name}
                onClick={() => setCurrentProblem(name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: currentProblem === name ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                  color: currentProblem === name ? '#333' : 'white',
                  fontWeight: currentProblem === name ? '700' : '500',
                  fontSize: '13px',
                  transition: 'all 0.3s ease',
                  border: currentProblem === name ? '2px solid white' : '2px solid transparent',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  background: color,
                  borderRadius: '6px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }} />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={addShape}
            disabled={currentTool === 'freehand'}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: currentTool === 'freehand' ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
              opacity: currentTool === 'freehand' ? 0.5 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            + Add {drawingTools[currentTool]}
          </button>
          
          <button
            onClick={deleteSelected}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #f87171, #ef4444)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Delete Selected
          </button>

          <button
            onClick={clearAll}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #a855f7, #9333ea)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Clear All
          </button>

          <button
            onClick={saveAnnotations}
            disabled={!hasUnsavedChanges}
            style={{
              padding: '10px 20px',
              background: hasUnsavedChanges 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
              boxShadow: hasUnsavedChanges 
                ? '0 4px 16px rgba(16, 185, 129, 0.3)' 
                : '0 4px 16px rgba(107, 114, 128, 0.3)',
              opacity: hasUnsavedChanges ? 1 : 0.6,
              transition: 'all 0.3s ease'
            }}
          >
            💾 Save Annotation
          </button>

          <button
            onClick={viewAnnotation}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            👁️ View Annotation
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div style={{
        border: '3px solid #e5e7eb',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'white',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <canvas ref={canvasRef} style={{ borderRadius: '12px' }} />
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '600',
            color: '#667eea',
            borderRadius: '20px',
            backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid #667eea',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Loading Image...
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AnnotationCanvas;