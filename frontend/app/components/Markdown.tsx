import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
  // @ts-ignore version interop
  remarkPlugins={[remarkGfm, remarkMath] as any}
  // @ts-ignore version interop
  rehypePlugins={[rehypeRaw as any, rehypeHighlight as any, rehypeKatex as any]}
      className="prose dark:prose-invert max-w-none"
    >
      {content}
    </ReactMarkdown>
  )
}