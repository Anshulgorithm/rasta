import { createEntity } from './entityFactory';
import { auth } from './auth';

// Same shape as before — every page talks only to this client.
// It's now backed by Supabase instead of the local browser mock.
export const base44 = {
  entities: {
    User: createEntity('User'),
    District: createEntity('District'),
    Trek: createEntity('Trek'),
    Booking: createEntity('Booking'),
  },
  auth,
};
