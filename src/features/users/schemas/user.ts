import * as z from 'zod';

export const userSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+\.[a-z0-9]+$/, 'User ID must be in format <id>.<id> (e.g. daniel.yun)'),
  primary_team: z.string().min(1, '1차팀을 입력해주세요'),
  secondary_team: z.string().min(1, '2차팀을 입력해주세요'),
  role: z.string().min(1, 'Please select a role'),
  status: z.string().min(1, 'Please select a status')
});

export type UserFormValues = z.infer<typeof userSchema>;
