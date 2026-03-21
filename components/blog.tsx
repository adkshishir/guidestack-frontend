'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { commentsApi, Comment, CreateCommentDto } from '@/lib/api/comments';
import { useAuth } from '@/contexts/auth-context';
import { MessageSquare, Reply, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CommentWithUser extends Comment {
  user?: {
    id: number;
    email: string;
    name?: string;
  };
  replies?: CommentWithUser[];
}

interface CommentsSectionProps {
  blogPostId: number;
}

export function CommentsSection({ blogPostId }: CommentsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});

  useEffect(() => {
    loadComments();
  }, [blogPostId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await commentsApi.getByBlogPost(blogPostId);
      if (response.data) {
        // Filter out deleted comments
        const visibleComments = response.data.filter(
          (comment) => comment.status === 'VISIBLE' || comment.status === 'APPROVED'
        );

        // Organize comments into a tree structure
        const commentsMap = new Map<number, CommentWithUser>();
        const rootComments: CommentWithUser[] = [];

        // First pass: create map of all comments
        visibleComments.forEach((comment) => {
          commentsMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: build tree
        visibleComments.forEach((comment) => {
          const commentWithReplies = commentsMap.get(comment.id)!;
          if (comment.parentId) {
            const parent = commentsMap.get(comment.parentId);
            if (parent) {
              if (!parent.replies) parent.replies = [];
              parent.replies.push(commentWithReplies);
            }
          } else {
            rootComments.push(commentWithReplies);
          }
        });

        setComments(rootComments);
      } else {
        toast.error(response.error?.message || 'Failed to load comments');
      }
    } catch (error) {
      toast.error('An error occurred while loading comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to post a comment');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const data: CreateCommentDto = {
        content: commentContent.trim(),
        blogPostId,
      };

      const response = await commentsApi.create(data);
      if (response.data) {
        toast.success('Comment posted successfully');
        setCommentContent('');
        loadComments();
      } else {
        toast.error(response.error?.message || 'Failed to post comment');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while posting comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to reply');
      return;
    }

    const content = replyContent[parentId]?.trim();
    if (!content) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmitting(true);
    try {
      const data: CreateCommentDto = {
        content,
        blogPostId,
        parentId,
      };

      const response = await commentsApi.create(data);
      if (response.data) {
        toast.success('Reply posted successfully');
        setReplyContent((prev) => ({ ...prev, [parentId]: '' }));
        setReplyTo(null);
        loadComments();
      } else {
        toast.error(response.error?.message || 'Failed to post reply');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while posting reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const isOwnComment = (commentUserId: number) => {
    return user && commentUserId === user.id;
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: CommentWithUser; depth?: number }) => {
    const isReplying = replyTo === comment.id;
    const replyText = replyContent[comment.id] || '';
    const isOwn = isOwnComment(comment.userId || 0);
    const isReply = depth > 0;

    return (
      <div
        className={cn(
          'flex w-full',
          isOwn ? 'justify-end' : 'justify-start',
          isReply && !isOwn && 'ml-8'
        )}
      >
        <div
          className={cn(
            'flex max-w-[85%] gap-3',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          {/* Avatar - shown on both sides but positioned differently */}
          <Avatar className='h-10 w-10 shrink-0'>
            <AvatarFallback>
              {comment.user?.email ? getInitials(comment.user.email) : 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Comment Bubble */}
          <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
            <div
              className={cn(
                'rounded-2xl p-4',
                isOwn
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-muted rounded-bl-sm'
              )}
            >
              {/* User name - show for others, hide for own comments */}
              {!isOwn && (
                <p className='mb-1 text-sm font-semibold opacity-90'>
                  {comment.user?.name || comment.user?.email || 'Anonymous'}
                </p>
              )}
              <p className='text-sm'>{comment.content}</p>
            </div>
            
            {/* Timestamp */}
            <p className={cn(
              'mt-1 text-xs text-muted-foreground',
              isOwn ? 'text-right' : 'text-left'
            )}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              {isOwn && ' • You'}
            </p>

            {/* Reply Button */}
            {isAuthenticated && depth < 2 && (
              <div className='mt-2'>
                {!isReplying ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setReplyTo(comment.id)}
                    className={cn('text-xs h-7', isOwn ? 'text-primary-foreground/70 hover:text-primary-foreground' : '')}
                  >
                    <Reply className='mr-1 h-3 w-3' />
                    Reply
                  </Button>
                ) : (
                  <div className='mt-2 space-y-2 w-full max-w-xs'>
                    <Textarea
                      placeholder='Write a reply...'
                      value={replyText}
                      onChange={(e) =>
                        setReplyContent((prev) => ({ ...prev, [comment.id]: e.target.value }))
                      }
                      rows={2}
                      className='text-sm resize-none'
                    />
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={submitting || !replyText.trim()}
                        className='h-8 text-xs'
                      >
                        {submitting ? (
                          <Loader2 className='h-3 w-3 animate-spin' />
                        ) : (
                          <>
                            <Send className='mr-1 h-3 w-3' />
                            Post
                          </>
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setReplyTo(null);
                          setReplyContent((prev) => ({ ...prev, [comment.id]: '' }));
                        }}
                        className='h-8 text-xs'
                      >
                        Cancel
                      </Button>
                      </div>
                  </div>
                )}
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className='mt-4 space-y-4'>
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className='mt-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm'>
      <CardHeader className='border-b border-slate-100 dark:border-slate-800'>
        <CardTitle className='flex items-center gap-2 text-slate-900 dark:text-white'>
          <MessageSquare className='h-5 w-5 text-primary' />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6 pt-6'>
        {/* Comment Form */}
        {isAuthenticated ? (
          <div className='flex gap-3 items-start'>
            <Avatar className='h-10 w-10 shrink-0'>
              <AvatarFallback>
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-3'>
              <Textarea
                placeholder='Write a comment...'
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={3}
                className='resize-none'
              />
              <div className='flex justify-end'>
                <Button
                  onClick={handleSubmitComment}
                  disabled={submitting || !commentContent.trim()}
                  size='sm'
                >
                  {submitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className='mr-2 h-4 w-4' />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='rounded-lg border border-border bg-muted/50 p-4 text-center'>
            <p className='text-sm text-muted-foreground'>
              Please log in to post a comment
            </p>
            </div>
            
        )}

        {/* Comments List - Chat Style */}
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : comments.length > 0 ? (
          <div className='space-y-6'>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className='py-8 text-center text-muted-foreground'>
            <MessageSquare className='mx-auto mb-2 h-12 w-12 opacity-50' />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </CardContent>
    </Card>

  );
}
