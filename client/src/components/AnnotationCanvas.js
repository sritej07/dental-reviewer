import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { Square, Circle, ArrowRight, PenTool, Trash2, Save } from 'lucide-react';

const AnnotationCanvas = ({ imageUrl, annotations = [], onAnnotationsChange }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (canvasRef.current && imageUrl) {
      initializeCanvas();
    }

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [imageUrl]);

  const initializeCanvas = () => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    // Load the image
    fabric.Image.fromURL(imageUrl, (img) => {
      const canvasWidth = 800;
      const canvasHeight = 600;
      
      // Calculate scale to fit image within canvas
      const scaleX = canvasWidth / img.width;
      const scaleY = canvasHeight / img.height;
      const scale = Math.min(scaleX, scaleY);
      
      img.scale(scale);
      img.set({
        left: (canvasWidth - img.width * scale) / 2,
        top: (canvasHeight - img.height * scale) / 2,
        selectable: false,
        evented: false
      });

      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
      setIsLoading(false);
    });

    // Load existing annotations
    if (annotations && annotations.length > 0) {
      annotations.forEach(annotation => {
        addAnnotationToCanvas(fabricCanvas, annotation);
      });
    }

    fabricCanvas.on('object:added', () => {
      saveAnnotations(fabricCanvas);
    });

    fabricCanvas.on('object:modified', () => {
      saveAnnotations(fabricCanvas);
    });

    fabricCanvas.on('object:removed', () => {
      saveAnnotations(fabricCanvas);
    });

    setCanvas(fabricCanvas);
  };

  const addAnnotationToCanvas = (fabricCanvas, annotation) => {
    let object;
    
    switch (annotation.type) {
      case 'rectangle':
        object = new fabric.Rect({
          left: annotation.left || 100,
          top: annotation.top || 100,
          width: annotation.width || 100,
          height: annotation.height || 100,
          fill: 'transparent',
          stroke: '#ef4444',
          strokeWidth: 3,
          strokeDashArray: [5, 5]
        });
        break;
      case 'circle':
        object = new fabric.Circle({
          left: annotation.left || 100,
          top: annotation.top || 100,
          radius: annotation.radius || 50,
          fill: 'transparent',
          stroke: '#10b981',
          strokeWidth: 3,
          strokeDashArray: [5, 5]
        });
        break;
      case 'arrow':
        const points = annotation.points || [100, 100, 200, 200];
        object = new fabric.Line(points, {
          stroke: '#f59e0b',
          strokeWidth: 4,
          originX: 'center',
          originY: 'center'
        });
        break;
      default:
        return;
    }

    if (object) {
      object.set('annotationType', annotation.type);
      object.set('annotationNote', annotation.note || '');
      fabricCanvas.add(object);
    }
  };

  const addRectangle = () => {
    if (!canvas) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: '#ef4444',
      strokeWidth: 3,
      strokeDashArray: [5, 5]
    });
    
    rect.set('annotationType', 'rectangle');
    rect.set('annotationNote', '');
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setDrawingMode(null);
  };

  const addCircle = () => {
    if (!canvas) return;
    
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: 'transparent',
      stroke: '#10b981',
      strokeWidth: 3,
      strokeDashArray: [5, 5]
    });
    
    circle.set('annotationType', 'circle');
    circle.set('annotationNote', '');
    canvas.add(circle);
    canvas.setActiveObject(circle);
    setDrawingMode(null);
  };

  const addArrow = () => {
    if (!canvas) return;
    
    const line = new fabric.Line([100, 100, 200, 200], {
      stroke: '#f59e0b',
      strokeWidth: 4,
      originX: 'center',
      originY: 'center'
    });
    
    line.set('annotationType', 'arrow');
    line.set('annotationNote', '');
    canvas.add(line);
    canvas.setActiveObject(line);
    setDrawingMode(null);
  };

  const toggleFreeDrawing = () => {
    if (!canvas) return;
    
    canvas.isDrawingMode = !canvas.isDrawingMode;
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = '#2563eb';
      setDrawingMode('freehand');
    } else {
      setDrawingMode(null);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    
    const objects = canvas.getObjects().filter(obj => obj.annotationType);
    objects.forEach(obj => canvas.remove(obj));
    canvas.isDrawingMode = false;
    setDrawingMode(null);
  };

  const saveAnnotations = (fabricCanvas) => {
    if (!fabricCanvas || !onAnnotationsChange) return;
    
    const objects = fabricCanvas.getObjects().filter(obj => obj.annotationType);
    const annotationsData = objects.map(obj => {
      const data = {
        type: obj.annotationType,
        note: obj.annotationNote || '',
        left: obj.left,
        top: obj.top
      };
      
      if (obj.annotationType === 'rectangle') {
        data.width = obj.width * obj.scaleX;
        data.height = obj.height * obj.scaleY;
      } else if (obj.annotationType === 'circle') {
        data.radius = obj.radius * obj.scaleX;
      } else if (obj.annotationType === 'arrow') {
        data.points = [obj.x1, obj.y1, obj.x2, obj.y2];
      }
      
      return data;
    });
    
    onAnnotationsChange(annotationsData);
  };

  const exportCanvas = () => {
    if (!canvas) return null;
    
    return canvas.toDataURL({
      format: 'png',
      quality: 0.9,
      multiplier: 2
    });
  };

  const handleSave = () => {
    if (!canvas || !onAnnotationsChange) return;
    
    const annotatedImageData = exportCanvas();
    const objects = canvas.getObjects().filter(obj => obj.annotationType);
    const annotationsData = objects.map(obj => ({
      type: obj.annotationType,
      note: obj.annotationNote || '',
      left: obj.left,
      top: obj.top,
      width: obj.width ? obj.width * obj.scaleX : undefined,
      height: obj.height ? obj.height * obj.scaleY : undefined,
      radius: obj.radius ? obj.radius * obj.scaleX : undefined,
      points: obj.x1 !== undefined ? [obj.x1, obj.y1, obj.x2, obj.y2] : undefined
    }));
    
    onAnnotationsChange(annotationsData, annotatedImageData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading image...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={addRectangle}
          className={`btn-secondary ${drawingMode === 'rectangle' ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <Square size={16} />
          Rectangle
        </button>
        
        <button
          onClick={addCircle}
          className={`btn-secondary ${drawingMode === 'circle' ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <Circle size={16} />
          Circle
        </button>
        
        <button
          onClick={addArrow}
          className={`btn-secondary ${drawingMode === 'arrow' ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <ArrowRight size={16} />
          Arrow
        </button>
        
        <button
          onClick={toggleFreeDrawing}
          className={`btn-secondary ${drawingMode === 'freehand' ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <PenTool size={16} />
          Free Draw
        </button>
        
        <button
          onClick={clearCanvas}
          className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 size={16} />
          Clear All
        </button>
        
        <button
          onClick={handleSave}
          className="btn-primary ml-auto"
        >
          <Save size={16} />
          Save Annotations
        </button>
      </div>

      <div className="annotation-canvas-container">
        <canvas
          ref={canvasRef}
          width="800"
          height="600"
        />
      </div>
    </div>
  );
};

export default AnnotationCanvas;