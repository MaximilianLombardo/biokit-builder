# Streaming Response Pattern

Extracted from open-lovable's AI generation implementation.

## Overview

This pattern enables real-time streaming of AI-generated code to the client, providing immediate feedback and better user experience.

## Implementation

### Server Side (API Route)

```typescript
import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Provider initialization
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Streaming endpoint
export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'claude-3-sonnet', context } = await request.json();
    
    // Select provider based on model
    const provider = getProvider(model);
    
    // Build enhanced prompt with context
    const enhancedPrompt = buildPromptWithContext(prompt, context);
    
    // Stream generation
    const result = await streamText({
      model: provider(model),
      prompt: enhancedPrompt,
      temperature: 0.7,
      maxTokens: 8000,
    });
    
    // Return streaming response
    return new Response(result.toTextStreamResponse());
  } catch (error) {
    console.error('Streaming error:', error);
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}
```

### Client Side (React Hook)

```typescript
import { useCallback, useState } from 'react';

export function useStreamingGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, context?: any) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedCode('');

    try {
      const response = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setGeneratedCode(accumulated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generate,
    isGenerating,
    generatedCode,
    error,
  };
}
```

### Enhanced Streaming with Progress

```typescript
interface StreamChunk {
  type: 'progress' | 'content' | 'complete' | 'error';
  data: string;
  metadata?: {
    tokensUsed?: number;
    filesGenerated?: string[];
    progress?: number;
  };
}

export async function* enhancedStream(
  prompt: string,
  onProgress?: (progress: number) => void
): AsyncGenerator<StreamChunk> {
  try {
    // Start generation
    yield {
      type: 'progress',
      data: 'Analyzing requirements...',
      metadata: { progress: 10 }
    };

    // Generate code
    const stream = await generateWithProvider(prompt);
    let accumulated = '';
    let chunkCount = 0;

    for await (const chunk of stream) {
      accumulated += chunk;
      chunkCount++;
      
      yield {
        type: 'content',
        data: chunk,
        metadata: {
          progress: Math.min(90, 10 + (chunkCount * 2))
        }
      };
    }

    // Parse and validate
    yield {
      type: 'progress',
      data: 'Validating generated code...',
      metadata: { progress: 95 }
    };

    const files = parseGeneratedCode(accumulated);

    // Complete
    yield {
      type: 'complete',
      data: accumulated,
      metadata: {
        progress: 100,
        filesGenerated: Object.keys(files),
        tokensUsed: countTokens(accumulated)
      }
    };
  } catch (error) {
    yield {
      type: 'error',
      data: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Best Practices

1. **Chunk Size**: Keep chunks small for smooth UI updates
2. **Error Recovery**: Implement retry logic for network failures
3. **Cancellation**: Support aborting long-running generations
4. **Progress Indication**: Show meaningful progress to users
5. **Memory Management**: Clear accumulated data after processing

## Usage Example

```tsx
function CodeGenerator() {
  const { generate, isGenerating, generatedCode, error } = useStreamingGeneration();
  
  const handleGenerate = async () => {
    await generate('Create a login form with validation', {
      framework: 'nextjs',
      styling: 'tailwind',
      includeTests: true
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Code'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {generatedCode && (
        <pre className="code-preview">
          <code>{generatedCode}</code>
        </pre>
      )}
    </div>
  );
}
```

## Performance Considerations

- Use `TransformStream` for efficient processing
- Implement backpressure handling
- Cache partial results for recovery
- Monitor memory usage during streaming
- Use compression for large payloads

## Error Handling

```typescript
class StreamingError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = false
  ) {
    super(message);
  }
}

async function handleStreamError(error: unknown): Promise<void> {
  if (error instanceof StreamingError && error.recoverable) {
    // Attempt recovery
    await retryWithBackoff();
  } else {
    // Log and notify user
    console.error('Streaming failed:', error);
    notifyUser('Generation failed. Please try again.');
  }
}
```