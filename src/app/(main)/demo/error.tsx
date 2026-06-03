'use client';

export default function DemoError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className='flex flex-1 items-center justify-center p-6'>
      <div className='text-center space-y-3'>
        <h2 className='text-lg font-semibold'>데모 페이지 오류</h2>
        <p className='text-sm text-muted-foreground'>{error.message}</p>
        <button onClick={reset} className='text-sm underline underline-offset-4 hover:no-underline'>
          다시 시도
        </button>
      </div>
    </div>
  );
}
