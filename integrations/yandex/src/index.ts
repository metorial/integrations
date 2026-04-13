import { Slate } from 'slates';
import { spec } from './spec';
import {
  listInstances,
  getInstance,
  createInstance,
  controlInstance,
  updateInstance
} from './tools/manage-instance';
import { listBuckets, manageBucket, listObjects } from './tools/manage-storage';
import {
  listFunctions,
  getFunction,
  createFunction,
  deleteFunction,
  invokeFunction
} from './tools/manage-functions';
import { translateText, detectLanguage, listLanguages } from './tools/translate-text';
import { listServiceAccounts, manageServiceAccount, manageApiKeys } from './tools/manage-iam';
import { listNetworks, listSubnets, manageNetwork, manageSubnet } from './tools/manage-vpc';
import {
  listDnsZones,
  manageDnsZone,
  listRecordSets,
  upsertDnsRecords
} from './tools/manage-dns';
import { listClouds, listFolders, manageFolder } from './tools/manage-resources';
import { listDisks, manageDisk } from './tools/manage-disks';
import {
  listRegistries,
  manageRegistry,
  listContainerImages
} from './tools/manage-container-registry';
import { readLogs, writeLogs } from './tools/manage-logging';
import { instanceChanges } from './triggers/instance-changes';
import { functionChanges } from './triggers/function-changes';
import { dnsZoneChanges } from './triggers/dns-zone-changes';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listInstances,
    getInstance,
    createInstance,
    controlInstance,
    updateInstance,
    listDisks,
    manageDisk,
    listBuckets,
    manageBucket,
    listObjects,
    listFunctions,
    getFunction,
    createFunction,
    deleteFunction,
    invokeFunction,
    translateText,
    detectLanguage,
    listLanguages,
    listServiceAccounts,
    manageServiceAccount,
    manageApiKeys,
    listNetworks,
    listSubnets,
    manageNetwork,
    manageSubnet,
    listDnsZones,
    manageDnsZone,
    listRecordSets,
    upsertDnsRecords,
    listClouds,
    listFolders,
    manageFolder,
    listRegistries,
    manageRegistry,
    listContainerImages,
    readLogs,
    writeLogs
  ],
  triggers: [inboundWebhook, instanceChanges, functionChanges, dnsZoneChanges]
});
