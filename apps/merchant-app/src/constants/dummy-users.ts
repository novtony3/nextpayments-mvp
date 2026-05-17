/**
 * Dummy users for client-side mock auth.
 * NOT for production — this exists only so the login UI has something to validate against
 * during the UI-only phase of the project.
 */
export type DummyUser = {
  email: string;
  password: string;
  name: string;
};

export const DUMMY_USERS: ReadonlyArray<DummyUser> = [
  { email: 'demo@nextpayments.io', password: 'demo1234', name: 'Demo Merchant' },
  { email: 'admin@nextpayments.io', password: 'admin1234', name: 'Admin Demo' },
];
