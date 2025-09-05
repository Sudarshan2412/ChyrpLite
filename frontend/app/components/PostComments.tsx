"use client";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

export default function PostComments({ postId }: { postId: number }) {
  return (
    <div className="mt-4">
      <CommentList postId={postId} />
      <CommentForm postId={postId} onPosted={() => {}} />
    </div>
  );
}
