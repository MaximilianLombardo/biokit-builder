# Claude Code Instructions for biokit-builder

You are working on biokit-builder, an AI-powered application generation platform that transforms codebases or requirements into production-ready Next.js applications.

## Project Overview

biokit-builder is a monorepo with the following structure:
- `apps/web/` - Main Next.js 15 application
- `packages/@biokit/` - Shared packages (ai-core, design-system, db, templates)
- `scripts/` - Automation and setup scripts
- `config/` - Configuration files and AI prompts

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI Providers**: Anthropic, OpenAI, Google
- **Deployment**: Vercel
- **Package Manager**: npm/pnpm (workspaces)

## Code Style Guidelines

### TypeScript
- Always use TypeScript with strict mode
- Define explicit types for all function parameters and returns
- Use interfaces for object shapes, types for unions/primitives
- Prefer `const` assertions for literal types

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // Implementation
};

// Bad
const getUser = async (id: any) => {
  // Implementation
};
```

### React/Next.js
- Use functional components with hooks
- Implement proper error boundaries
- Use Next.js App Router conventions
- Prefer server components where possible

```tsx
// Good - Server Component by default
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component when needed
'use client';
export default function InteractiveComponent() {
  const [state, setState] = useState();
  // ...
}
```

### File Organization
- Group by feature in `app/` directory
- Shared components in `components/`
- Utilities in `lib/`
- Types in dedicated `.types.ts` files

## Common Patterns

### API Routes
```typescript
// app/api/[route]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  // Define schema
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = RequestSchema.parse(body);
    
    // Process request
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Database Queries
```typescript
// Use Supabase client
import { createClient } from '@/lib/supabase/server';

export async function getProjects(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}
```

### Streaming Responses
```typescript
// For AI generation
import { streamText } from 'ai';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const stream = await streamText({
    model: anthropic('claude-3-sonnet'),
    prompt,
  });
  
  return new Response(stream);
}
```

## Security Best Practices

1. **Always validate input** with Zod schemas
2. **Sanitize user content** before rendering
3. **Use environment variables** for secrets
4. **Implement rate limiting** on API routes
5. **Add CSRF protection** for mutations

## Performance Guidelines

1. **Use dynamic imports** for heavy components
2. **Implement proper caching** strategies
3. **Optimize images** with Next.js Image
4. **Use streaming** for large responses
5. **Implement pagination** for lists

## Testing Approach

```typescript
// Unit test example
describe('generateCode', () => {
  it('should generate valid TypeScript', async () => {
    const result = await generateCode('Create a button component');
    expect(result).toContain('interface ButtonProps');
    expect(result).toContain('export default');
  });
});
```

## Error Handling

```typescript
// Consistent error handling
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

// Usage
throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
```

## AI Integration Patterns

### Context Building
```typescript
// Build context for AI generation
const context = {
  files: selectedFiles,
  requirements: userRequirements,
  patterns: extractedPatterns,
  designSystem: designTokens,
};
```

### Prompt Engineering
```typescript
// Structure prompts consistently
const prompt = `
You are generating code for a Next.js application.

Context:
${JSON.stringify(context, null, 2)}

Requirements:
${requirements}

Generate TypeScript code that:
1. Follows the existing patterns
2. Uses the design system
3. Includes proper types
4. Has error handling

Code:
`;
```

## Common Tasks

### Adding a New Feature
1. Create feature directory in `app/`
2. Add types in `.types.ts`
3. Implement server/client components
4. Add API routes if needed
5. Write tests
6. Update documentation

### Creating a Component
1. Define props interface
2. Implement component with proper types
3. Add to design system if reusable
4. Include Storybook story
5. Write unit tests

### Adding an API Endpoint
1. Create route file in `app/api/`
2. Define request/response schemas
3. Implement with error handling
4. Add rate limiting if needed
5. Document in API.md

## Debugging Tips

1. Use `console.log` with descriptive prefixes
2. Check Network tab for API calls
3. Verify environment variables are set
4. Check Supabase logs for database issues
5. Use React DevTools for component issues

## Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build successful locally
- [ ] No TypeScript errors
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error tracking setup

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)

## Important Files

- `app.config.ts` - Central configuration
- `lib/supabase/client.ts` - Database client
- `lib/ai/providers.ts` - AI provider setup
- `packages/@biokit/design-system` - Design tokens

When in doubt, prioritize:
1. Type safety
2. User experience
3. Performance
4. Code clarity