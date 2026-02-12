import { keccak256, encodePacked } from 'viem';

interface LogicGate {
  type: string;
  generate: () => { payload: any; solution: any };
  verify: (payload: any, response: any) => boolean;
}

export const logicGates: Record<string, LogicGate> = {
  spatial: {
    type: 'spatial',
    generate: () => {
      // Mock grid for now
      const grid = [
        [0, 1, 0],
        [0, 0, 0],
        [1, 0, 0]
      ];
      return {
        payload: { grid, instruction: 'Identify the coordinates of the empty center (x,y)' },
        solution: { x: 1, y: 1 },
      };
    },
    verify: (payload, response) => {
      return response.x === 1 && response.y === 1;
    },
  },
  temporal: {
    type: 'temporal',
    generate: () => {
      const sequence = [2, 4, 8, 16];
      return {
        payload: { sequence, instruction: 'Next in sequence?' },
        solution: 32,
      };
    },
    verify: (payload, response) => {
      return response === 32;
    },
  },
  semantic: {
    type: 'semantic',
    generate: () => {
      return {
        payload: { text: "The sky is blue, the grass is ___", instruction: 'Complete the sentence' },
        solution: "green",
      };
    },
    verify: (payload, response) => {
      return response.toLowerCase().trim() === "green";
    },
  }
};

export function selectLogicGate(userId: string): string {
  const hour = Math.floor(Date.now() / (1000 * 60 * 60));
  // Simple fallback for keccak256 if needed, but we have viem
  const types = Object.keys(logicGates);
  const index = hour % types.length; // Simplified for MVP
  return types[index];
}
