import { createAtom } from '@xstate/store';
export const createPos = (x = 0, y = 0) => createAtom({ x, y });
