import { describeMcpCompatibleToolSchemas } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describeMcpCompatibleToolSchemas(
  'Dynamics 365 Dataverse tool input schemas',
  provider.actions
);

let backwardCompatibleToolIds = [
  'create_record',
  'get_record',
  'update_record',
  'delete_record',
  'list_records',
  'fetch_xml_query',
  'search_records',
  'associate_records',
  'disassociate_records',
  'get_related_records',
  'list_entities',
  'get_entity_attributes',
  'invoke_function',
  'invoke_action',
  'who_am_i'
];

let addedDataverseToolIds = ['download_file_column', 'upload_file_column', 'execute_batch'];

let triggerIds = ['inbound_webhook', 'record_changed'];

describe('Dynamics 365 Dataverse tool contracts', () => {
  it('preserves existing public tool IDs and exposes new generic Dataverse tools', () => {
    let actionKeys = provider.actions.map(action => action.key).sort();

    expect(actionKeys).toEqual(
      [...backwardCompatibleToolIds, ...addedDataverseToolIds, ...triggerIds].sort()
    );
  });

  it('marks file download as attachment-only metadata output', () => {
    let downloadTool = provider.actions.find(action => action.key === 'download_file_column');

    expect(downloadTool?.parameters.tags).toMatchObject({
      readOnly: true,
      destructive: false
    });
    let outputSchemaJson = JSON.stringify(downloadTool?.parameters ?? {});
    expect(outputSchemaJson).not.toContain('contentBase64');
    expect(outputSchemaJson).not.toContain('fileContent');
  });

  it('marks batch as a potentially destructive write-capable tool', () => {
    let batchTool = provider.actions.find(action => action.key === 'execute_batch');

    expect(batchTool?.parameters.tags).toMatchObject({
      readOnly: false,
      destructive: true
    });
  });
});
