import * as z from 'zod';

export const profileSchema = z.object({
  firstname: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastname: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  contactno: z.number({ message: 'Contact number is required' }),
  country: z.string().min(1, { message: 'Please select a country' }),
  city: z.string().min(1, { message: 'Please select a city' }),
  jobs: z.array(
    z.object({
      jobcountry: z.string().min(1, { message: 'Please select a country' }),
      jobcity: z.string().min(1, { message: 'Please select a city' }),
      jobtitle: z.string().min(2, { message: 'Job title must be at least 2 characters' }),
      employer: z.string().min(2, { message: 'Employer must be at least 2 characters' }),
      startdate: z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
        message: 'Start date should be in the format YYYY-MM-DD'
      }),
      enddate: z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
        message: 'End date should be in the format YYYY-MM-DD'
      })
    })
  )
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
