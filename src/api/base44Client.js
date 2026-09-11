import { createEntity } from './entityFactory';
import { auth } from './auth';
import { ensureSeeded } from './seed';

ensureSeeded();

// Pre-initialized SDK client. Swap this file for the real base44 SDK
// client to move from local-only demo data to a live backend — every
// other file in the app talks only to this shape, never to storage directly.
export const base44 = {
  entities: {
    User: createEntity('User'),
    District: createEntity('District'),
    Trek: createEntity('Trek'),
    Booking: createEntity('Booking'),
  },
  auth,
};
