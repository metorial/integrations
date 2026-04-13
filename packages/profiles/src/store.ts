import { execFileSync } from 'child_process';
import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import {
  SlatesCliStoreData,
  SlatesProfileRecord,
  SlatesProfileTarget,
  SlatesStoredAuth
} from './types';

let STORE_VERSION = 1 as const;
let CLI_DIR_NAME = '.slates-cli';
let STORE_FILE_NAME = 'store.json';
let GITIGNORE_FILE_NAME = '.gitignore';

let createEmptyStore = (): SlatesCliStoreData => ({
  version: STORE_VERSION,
  currentProfileId: null,
  profiles: {}
});

let now = () => new Date().toISOString();

let ensureDir = async (dirPath: string) => {
  await mkdir(dirPath, { recursive: true });
};

let ensureGitIgnore = async (dirPath: string) => {
  let filePath = path.join(dirPath, GITIGNORE_FILE_NAME);
  await writeFile(filePath, '*\n!.gitignore\n', { encoding: 'utf-8' }).catch(async error => {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return;
    throw error;
  });
};

export let resolveSlatesCliRoot = (cwd: string = process.cwd()) => {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8'
    }).trim();
  } catch {
    return cwd;
  }
};

export let resolveSlatesCliDir = (cwd: string = process.cwd()) =>
  path.join(resolveSlatesCliRoot(cwd), CLI_DIR_NAME);

export class SlatesCliStore {
  constructor(
    readonly rootDir: string,
    readonly dirPath: string,
    readonly storePath: string,
    readonly data: SlatesCliStoreData
  ) {}

  static async open(opts: { cwd?: string } = {}) {
    let rootDir = resolveSlatesCliRoot(opts.cwd);
    let dirPath = path.join(rootDir, CLI_DIR_NAME);
    let storePath = path.join(dirPath, STORE_FILE_NAME);

    await ensureDir(dirPath);
    await ensureGitIgnore(dirPath);

    let data = createEmptyStore();

    try {
      let raw = await readFile(storePath, 'utf-8');
      if (raw.trim()) {
        let parsed = JSON.parse(raw) as SlatesCliStoreData;
        data = {
          version: STORE_VERSION,
          currentProfileId: parsed.currentProfileId ?? null,
          profiles: parsed.profiles ?? {}
        };
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }

      await writeFile(storePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    }

    return new SlatesCliStore(rootDir, dirPath, storePath, data);
  }

  async save() {
    await ensureDir(this.dirPath);
    await ensureGitIgnore(this.dirPath);
    await writeFile(this.storePath, JSON.stringify(this.data, null, 2) + '\n', 'utf-8');
  }

  listProfiles() {
    return Object.values(this.data.profiles).sort((a, b) => a.name.localeCompare(b.name));
  }

  getProfile(profileId?: string | null) {
    if (profileId) return this.data.profiles[profileId] ?? null;
    if (this.data.currentProfileId && this.data.profiles[this.data.currentProfileId]) {
      return this.data.profiles[this.data.currentProfileId]!;
    }

    return this.listProfiles()[0] ?? null;
  }

  requireProfile(profileId?: string | null) {
    let profile = this.getProfile(profileId);
    if (!profile) {
      throw new Error('No Slates profile found. Create one with `slates profiles add`.');
    }

    return profile;
  }

  upsertProfile(d: {
    profileId?: string;
    name: string;
    target: SlatesProfileTarget;
    config?: SlatesProfileRecord['config'];
    session?: SlatesProfileRecord['session'];
    metadata?: SlatesProfileRecord['metadata'];
  }) {
    let existing = d.profileId ? this.data.profiles[d.profileId] : undefined;
    let id = existing?.id ?? d.profileId ?? randomUUID();
    let createdAt = existing?.createdAt ?? now();

    let profile: SlatesProfileRecord = {
      id,
      name: d.name,
      target: d.target,
      config: d.config ?? existing?.config ?? null,
      auth: existing?.auth ?? {},
      session: d.session ?? existing?.session ?? null,
      metadata: {
        provider: d.metadata?.provider ?? existing?.metadata?.provider ?? null,
        actions: d.metadata?.actions ?? existing?.metadata?.actions ?? null
      },
      createdAt,
      updatedAt: now()
    };

    this.data.profiles[id] = profile;
    if (!this.data.currentProfileId) {
      this.data.currentProfileId = id;
    }

    return profile;
  }

  setCurrentProfile(profileId: string) {
    if (!this.data.profiles[profileId]) {
      throw new Error(`Unknown profile: ${profileId}`);
    }

    this.data.currentProfileId = profileId;
  }

  removeProfile(profileId: string) {
    delete this.data.profiles[profileId];

    if (this.data.currentProfileId === profileId) {
      this.data.currentProfileId = this.listProfiles()[0]?.id ?? null;
    }
  }

  setProfileConfig(profileId: string, config: SlatesProfileRecord['config']) {
    let profile = this.requireProfile(profileId);
    profile.config = config;
    profile.updatedAt = now();
    return profile;
  }

  setProfileSession(profileId: string, session: SlatesProfileRecord['session']) {
    let profile = this.requireProfile(profileId);
    profile.session = session;
    profile.updatedAt = now();
    return profile;
  }

  setProfileMetadata(profileId: string, metadata: Partial<SlatesProfileRecord['metadata']>) {
    let profile = this.requireProfile(profileId);
    profile.metadata = {
      provider: metadata.provider ?? profile.metadata.provider ?? null,
      actions: metadata.actions ?? profile.metadata.actions ?? null
    };
    profile.updatedAt = now();
    return profile;
  }

  upsertAuth(
    profileId: string,
    auth: Omit<SlatesStoredAuth, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) {
    let profile = this.requireProfile(profileId);
    let existing = profile.auth[auth.authMethodId];

    profile.auth[auth.authMethodId] = {
      ...auth,
      id: auth.id ?? existing?.id ?? randomUUID(),
      createdAt: existing?.createdAt ?? now(),
      updatedAt: now()
    };
    profile.updatedAt = now();

    return profile.auth[auth.authMethodId]!;
  }

  getAuth(profileId: string, authMethodId?: string | null) {
    let profile = this.requireProfile(profileId);
    if (authMethodId) return profile.auth[authMethodId] ?? null;
    return Object.values(profile.auth)[0] ?? null;
  }

  listAuth(profileId: string) {
    let profile = this.requireProfile(profileId);
    return Object.values(profile.auth).sort((a, b) =>
      a.authMethodId.localeCompare(b.authMethodId)
    );
  }
}

export let openSlatesCliStore = async (opts: { cwd?: string } = {}) =>
  SlatesCliStore.open(opts);
