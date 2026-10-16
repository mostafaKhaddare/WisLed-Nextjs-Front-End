import * as migration_20260930_144933_initial from './20260930_144933_initial';
import * as migration_20261016_204719_hero_banner_slides from './20261016_204719_hero_banner_slides';

export const migrations = [
  {
    up: migration_20260930_144933_initial.up,
    down: migration_20260930_144933_initial.down,
    name: '20260930_144933_initial',
  },
  {
    up: migration_20261016_204719_hero_banner_slides.up,
    down: migration_20261016_204719_hero_banner_slides.down,
    name: '20261016_204719_hero_banner_slides'
  },
];
