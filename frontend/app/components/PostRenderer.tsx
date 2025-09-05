"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Post = {
  id: number;
  type: string;
  content: string;
  extra?: any;
  [key: string]: any;
};

export default function PostRenderer({ post }: { post: Post }) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  switch (post.type) {
    case "photo":
      return (
        <div>
          <img
            src={post.extra?.url || post.content}
            alt={post.extra?.alt || "Photo"}
            className="rounded cursor-pointer max-w-full"
            onClick={() => setLightboxOpen(true)}
          />
          {lightboxOpen && (
            <Lightbox
              open={lightboxOpen}
              close={() => setLightboxOpen(false)}
              slides={[{ src: post.extra?.url || post.content }]}
            />
          )}
        </div>
      );
    case "video":
      return (
        <video controls className="rounded max-w-full">
          <source src={post.extra?.url || post.content} />
          Your browser does not support the video tag.
        </video>
      );
    case "audio":
      return (
        <audio controls className="w-full">
          <source src={post?.url || post.content} />
          Your browser does not support the audio element.
        </audio>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 pl-4 italic text-gray-600 dark:text-gray-300">
          {post.content}
          {post.extra?.author && (
            <footer className="mt-2 text-right">— {post.extra.author}</footer>
          )}
        </blockquote>
      );
    case "link":
      return (
        <a
          href={post.extra?.url || post.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {post.extra?.title || post.content}
        </a>
      );
    case "uploader":
      return (
        <a
          href={post.extra?.url || post.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 underline break-all"
        >
          {post.extra?.filename || "Download"}
        </a>
      );
    case "text":
    default:
      return (
        <ReactMarkdown
          className="prose dark:prose-invert"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight as any]}
        >
          {post.content}
        </ReactMarkdown>
      );
  }
}
