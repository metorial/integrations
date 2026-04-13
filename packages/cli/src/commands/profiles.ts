import { input } from '@inquirer/prompts';
import { createSlatesClientFromProfile, openSlatesCliStore } from '@slates/profiles';
import path from 'path';
import { chooseProfile, syncProfileMetadata } from '../lib/context';

let normalizeEntry = (rootDir: string, entry: string) => {
  let absolute = path.isAbsolute(entry) ? entry : path.resolve(process.cwd(), entry);
  let relative = path.relative(rootDir, absolute);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? relative
    : absolute;
};

export let addProfile = async (opts: {
  name?: string;
  entry?: string;
  exportName?: string;
  useAsDefault?: boolean;
}) => {
  let store = await openSlatesCliStore();

  let name = opts.name ?? (await input({ message: 'Profile name' }));
  let entry =
    opts.entry ??
    (await input({
      message: 'Local slate entry file',
      default: 'packages/slates/example/google-sheets/index.ts'
    }));
  let exportName =
    opts.exportName ??
    (await input({ message: 'Export name (optional)', default: 'provider' }));

  let profile = store.upsertProfile({
    name,
    target: {
      type: 'local',
      entry: normalizeEntry(store.rootDir, entry),
      exportName: exportName.trim() ? exportName.trim() : undefined
    }
  });

  let client = await createSlatesClientFromProfile(profile);
  await syncProfileMetadata({ store, profile, client });

  if (opts.useAsDefault ?? store.listProfiles().length === 1) {
    store.setCurrentProfile(profile.id);
  }

  await store.save();

  return profile;
};

export let listProfiles = async () => {
  let store = await openSlatesCliStore();
  return store.listProfiles();
};

export let getProfile = async (profileId?: string) => {
  let store = await openSlatesCliStore();
  return store.requireProfile(profileId);
};

export let useProfile = async (profileId?: string) => {
  let { store, profile } = await chooseProfile({ profile: profileId });
  store.setCurrentProfile(profile.id);
  await store.save();
  return profile;
};

export let removeProfile = async (profileId?: string) => {
  let { store, profile } = await chooseProfile({ profile: profileId });
  store.removeProfile(profile.id);
  await store.save();
  return profile;
};
