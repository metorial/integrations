import { SlateTool } from 'slates';
import { NextDnsClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteProfile = SlateTool.create(spec, {
  name: 'Delete Profile',
  key: 'delete_profile',
  description: `Permanently delete a NextDNS DNS configuration profile. This also clears all logs associated with the profile. **This action cannot be undone.**`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      profileId: z.string().describe('ID of the profile to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean().describe('Whether the profile was successfully deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new NextDnsClient({ token: ctx.auth.token });
    await client.deleteProfile(ctx.input.profileId);

    return {
      output: { deleted: true },
      message: `Deleted profile \`${ctx.input.profileId}\`.`
    };
  })
  .build();
