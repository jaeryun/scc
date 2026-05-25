import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  language?: string;
  fileName?: string;
}

export async function CodeBlock({ code, language = 'tsx', fileName }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'github-dark-default',
    transformers: []
  });

  return (
    <div className='not-prose group relative overflow-hidden rounded-lg border bg-[#0d1117]'>
      <div className='flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5'>
        <span className='size-3 rounded-full bg-[#ff5f57]' />
        <span className='size-3 rounded-full bg-[#febc2e]' />
        <span className='size-3 rounded-full bg-[#28c840]' />
        {fileName && <span className='ml-2 text-xs text-white/40 font-mono'>{fileName}</span>}
      </div>
      <div
        className='overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!font-mono [&_code]:text-[13px]'
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
