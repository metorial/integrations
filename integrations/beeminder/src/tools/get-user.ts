import { SlateTool } from 'slates';
import { BeeminderClient } from '../lib/client';
import { userSchema, mapUser } from '../lib/schemas';
import { spec } from '../spec';
import { z } from 'zod';

export let getUser = SlateTool.create(spec, {
  name: 'Get User',
  key: 'get_user',
  description: `Retrieve the authenticated user's profile information including timezone, account status, and urgency load.`,
  tags: {
    readOnly: true
  }
})
  .input(z.object({}))
  .output(userSchema)
  .handleInvocation(async ctx => {
    let client = new BeeminderClient({
      token: ctx.auth.token,
      username: ctx.auth.username
    });

    let raw = await client.getUser();
    let user = mapUser(raw);

    return {
      output: user,
      message: `Retrieved profile for user **${user.username}** (timezone: ${user.timezone}).`
    };
  })
  .build();
