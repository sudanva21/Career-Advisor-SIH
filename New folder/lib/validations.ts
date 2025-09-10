import { z } from 'zod'

export const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string())])
})

export const collegeSearchSchema = z.object({
  query: z.string().optional(),
  state: z.string().optional(),
  type: z.string().optional(),
  course: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20)
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>
export type CollegeSearchInput = z.infer<typeof collegeSearchSchema>