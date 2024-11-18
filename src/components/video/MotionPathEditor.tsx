import React, { useState, useRef, useEffect } from 'react';
import { MotionKeyframe } from '../../types/imageToVideo';

interface MotionPathEditorProps {
  keyframes: MotionKeyframe[];
  onChange: (keyframes: MotionKeyframe[]) => void;
  width: number;
  height: number;
}

const MotionPathEditor: React.FC<MotionPathEditorProps> = ({
  keyframes,
  onChange,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedKeyframe, setSelectedKeyframe] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw path
    ctx.beginPath();
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;

    keyframes.forEach((keyframe, index) => {
      const x = keyframe.transform.x || 0;
      const y = keyframe.transform.y || 0;

      if (index === 0) {
        ctx.moveTo(x * width, y * height);
      } else {
        ctx.lineTo(x * width, y * height);
      }
    });

    ctx.stroke();

    // Draw keyframe points
    keyframes.forEach((keyframe, index) => {
      const x = keyframe.transform.x || 0;
      const y = keyframe.transform.y || 0;

      ctx.beginPath();
      ctx.fillStyle = index === selectedKeyframe ? '#FF0000' : '#FFFFFF';
      ctx.arc(x * width, y * height, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }, [keyframes, selectedKeyframe, width, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;

    // Check if clicking on existing keyframe
    const keyframeIndex = keyframes.findIndex(kf => {
      const kfX = kf.transform.x || 0;
      const kfY = kf.transform.y || 0;
      const distance = Math.sqrt(Math.pow(x - kfX, 2) + Math.pow(y - kfY, 2));
      return distance < 0.02; // Click tolerance
    });

    if (keyframeIndex >= 0) {
      setSelectedKeyframe(keyframeIndex);
      setIsDragging(true);
    } else {
      // Add new keyframe
      const newKeyframe: MotionKeyframe = {
        time: keyframes.length * (1 / keyframes.length || 1),
        transform: { x, y, scale: 1, rotation: 0 },
        easing: 'linear'
      };
      onChange([...keyframes, newKeyframe]);
      setSelectedKeyframe(keyframes.length);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || selectedKeyframe === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;

    const updatedKeyframes = keyframes.map((kf, index) => {
      if (index === selectedKeyframe) {
        return {
          ...kf,
          transform: { ...kf.transform, x, y }
        };
      }
      return kf;
    });

    onChange(updatedKeyframes);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-700 rounded-lg cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default MotionPathEditor;