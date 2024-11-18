import { ReverseSettings, ReverseResult } from '../types/reverse';

export const buildReverseTransformations = (settings: ReverseSettings): string => {
  const transformations: string[] = [];

  // Basic reverse effect
  transformations.push('e_reverse');

  // Speed adjustment if not 1x
  if (settings.speed !== 1) {
    transformations.push(`e_acceleration:${settings.speed * 100}`);
  }

  // Audio settings
  if (!settings.preserveAudio) {
    transformations.push('ac_none');
  }

  // Loop settings
  if (settings.loop) {
    transformations.push('fl_loop');
  }

  // Transition effects
  if (settings.transition.enabled && settings.transition.type !== 'none') {
    transformations.push(
      `e_${settings.transition.type}:${settings.transition.duration * 1000}`
    );
  }

  return transformations.join(',');
};

export const validateReverseSettings = (settings: ReverseSettings): string[] => {
  const errors: string[] = [];

  if (settings.speed < 0.25 || settings.speed > 4) {
    errors.push('Speed must be between 0.25x and 4x');
  }

  if (settings.transition.enabled && settings.transition.duration < 0) {
    errors.push('Transition duration must be positive');
  }

  return errors;
};