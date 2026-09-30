import * as migration_20260930_144933_initial from './20260930_144933_initial';

export const migrations = [
  {
    up: migration_20260930_144933_initial.up,
    down: migration_20260930_144933_initial.down,
    name: '20260930_144933_initial'
  },
];
