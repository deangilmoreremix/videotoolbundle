import { useState, useCallback } from 'react';
import { VideoEffect } from '../types/video';

interface VideoEffectsHook {
  effects: VideoEffect[];
  addEffect: (effect: VideoEffect) => void;
  removeEffect: (effectId: string) => void;
  updateEffect: (effectId: string, updates: Partial<VideoEffect>) => void;
  reorderEffects: (fromIndex: number, toIndex: number) => void;
}

export const useVideoEffects = (): VideoEffectsHook => {
  const [effects, setEffects] = useState<VideoEffect[]>([]);

  const addEffect = useCallback((effect: VideoEffect) => {
    setEffects(prev => [...prev, effect]);
  }, []);

  const removeEffect = useCallback((effectId: string) => {
    setEffects(prev => prev.filter(effect => effect.type !== effectId));
  }, []);

  const updateEffect = useCallback((effectId: string, updates: Partial<VideoEffect>) => {
    setEffects(prev => prev.map(effect => 
      effect.type === effectId ? { ...effect, ...updates } : effect
    ));
  }, []);

  const reorderEffects = useCallback((fromIndex: number, toIndex: number) => {
    setEffects(prev => {
      const newEffects = [...prev];
      const [movedEffect] = newEffects.splice(fromIndex, 1);
      newEffects.splice(toIndex, 0, movedEffect);
      return newEffects;
    });
  }, []);

  return {
    effects,
    addEffect,
    removeEffect,
    updateEffect,
    reorderEffects
  };
};