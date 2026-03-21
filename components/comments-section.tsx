'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  commentsApi,
  Comment,
  CreateCommentDto,
  VerifyCommentDto,
} from '@/lib/api/comments';
import { useAuth } from '@/contexts/auth-context';
import { MessageSquare, Reply, Send, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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

  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Token-based guest state
  const [isVerifiedGuest, setIsVerifiedGuest] = useState(false);

  // Verification state
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Load saved guest info from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const savedToken = localStorage.getItem('commentToken');
      const savedName = localStorage.getItem('guestName');
      const savedEmail = localStorage.getItem('guestEmail');

      if (savedToken && savedName && savedEmail) {
        setGuestName(savedName);
        setGuestEmail(savedEmail);
        setIsVerifiedGuest(true);
      }
    }
  }, [isAuthenticated]);

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
          (comment) =>
            comment.status === 'VISIBLE' || comment.status === 'APPROVED',
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
    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Please enter your name and email to post a comment');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      // Get stored token for verified guests
      const commentToken = localStorage.getItem('commentToken') || undefined;

      const data: CreateCommentDto = {
        content: commentContent.trim(),
        blogPostId,
        authorName: isAuthenticated ? undefined : guestName.trim(),
        authorEmail: isAuthenticated ? undefined : guestEmail.trim(),
        commentToken: isAuthenticated ? undefined : commentToken,
      };

      const response = await commentsApi.create(data);
      if (response.data) {
        if (response.data.status === 'PENDING_VERIFICATION') {
          toast.info('Verification code sent to your email');
          setPendingCommentId(response.data.id);
          setShowOtpDialog(true);
        } else {
          toast.success('Comment posted successfully');
          setCommentContent('');
          // If we got a new token back, save it
          if (response.data.commentToken) {
            localStorage.setItem('commentToken', response.data.commentToken);
            localStorage.setItem('guestName', guestName.trim());
            localStorage.setItem('guestEmail', guestEmail.trim());
            setIsVerifiedGuest(true);
          }
          loadComments();
        }
      } else {
        toast.error(response.error?.message || 'Failed to post comment');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while posting comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    if (!pendingCommentId) return;

    setVerifying(true);
    try {
      const data: VerifyCommentDto = {
        email: guestEmail.trim(),
        code: otp.trim(),
        commentId: pendingCommentId,
      };

      const response = await commentsApi.verify(data);
      if (response.data) {
        // Save the token for future comments
        if (response.data.commentToken) {
          localStorage.setItem('commentToken', response.data.commentToken);
          localStorage.setItem('guestName', guestName.trim());
          localStorage.setItem('guestEmail', guestEmail.trim());
          setIsVerifiedGuest(true);
        }

        toast.success(
          'Comment verified and posted successfully! You can now comment freely.',
        );
        setShowOtpDialog(false);
        setOtp('');
        setPendingCommentId(null);
        setCommentContent('');
        loadComments();
      } else {
        toast.error(response.error?.message || 'Invalid verification code');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Please enter your name and email to reply');
      return;
    }

    const content = replyContent[parentId]?.trim();
    if (!content) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmitting(true);
    try {
      // Get stored token for verified guests
      const commentToken = localStorage.getItem('commentToken') || undefined;

      const data: CreateCommentDto = {
        content,
        blogPostId,
        parentId,
        authorName: isAuthenticated ? undefined : guestName.trim(),
        authorEmail: isAuthenticated ? undefined : guestEmail.trim(),
        commentToken: isAuthenticated ? undefined : commentToken,
      };

      const response = await commentsApi.create(data);
      if (response.data) {
        if (response.data.status === 'PENDING_VERIFICATION') {
          toast.info('Verification code sent to your email');
          setPendingCommentId(response.data.id);
          setShowOtpDialog(true);
        } else {
          toast.success('Reply posted successfully');
          setReplyContent((prev) => ({ ...prev, [parentId]: '' }));
          setReplyTo(null);
          // If we got a new token back, save it
          if (response.data.commentToken) {
            localStorage.setItem('commentToken', response.data.commentToken);
            localStorage.setItem('guestName', guestName.trim());
            localStorage.setItem('guestEmail', guestEmail.trim());
            setIsVerifiedGuest(true);
          }
          loadComments();
        }
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

  const getAuthorDisplay = (comment: CommentWithUser) => {
    if (comment.user) {
      return comment.user.name || comment.user.email;
    }
    return comment.authorName || 'Anonymous Guest';
  };

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: CommentWithUser;
    depth?: number;
  }) => {
    const isReplying = replyTo === comment.id;
    const replyText = replyContent[comment.id] || '';

    const authorDisplay = getAuthorDisplay(comment);
    const authorEmail = comment.user?.email || comment.authorEmail || '';

    return (
      <div
        className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-border pl-4' : ''}`}>
        <div className='flex gap-3'>
          <Avatar className='h-10 w-10 border border-slate-100 dark:border-slate-800'>
            <AvatarFallback className='bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'>
              {getInitials(authorEmail || authorDisplay)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <div className='rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800/50'>
              <div className='mb-2 flex items-center justify-between'>
                <div>
                  <p className='font-semibold text-slate-900 dark:text-white'>
                    {authorDisplay}
                    {!comment.userId && (
                      <span className='ml-2 text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold'>
                        Verified Guest
                      </span>
                    )}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <p className='text-sm text-slate-700 dark:text-slate-300 leading-relaxed'>
                {comment.content}
              </p>
            </div>

            {depth < 2 && (
              <div className='mt-2'>
                {!isReplying ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setReplyTo(comment.id)}
                    className='text-xs h-7 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors'>
                    <Reply className='mr-1.5 h-3.5 w-3.5' />
                    Reply
                  </Button>
                ) : (
                  <div className='mt-3 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm'>
                    {!isAuthenticated && (
                      <div className='grid grid-cols-2 gap-3 mb-2'>
                        <div className='space-y-1.5'>
                          <Label
                            htmlFor={`reply-name-${comment.id}`}
                            className='text-xs'>
                            Name
                          </Label>
                          <Input
                            id={`reply-name-${comment.id}`}
                            placeholder='Your Name'
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className='h-9 text-sm'
                          />
                        </div>
                        <div className='space-y-1.5'>
                          <Label
                            htmlFor={`reply-email-${comment.id}`}
                            className='text-xs'>
                            Email
                          </Label>
                          <Input
                            id={`reply-email-${comment.id}`}
                            placeholder='Your Email'
                            type='email'
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className='h-9 text-sm'
                          />
                        </div>
                      </div>
                    )}
                    <Textarea
                      placeholder='Write a reply...'
                      value={replyText}
                      onChange={(e) =>
                        setReplyContent((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                      rows={3}
                      className='text-sm border-slate-200 dark:border-slate-800'
                    />
                    <div className='flex gap-2 justify-end'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-9'
                        onClick={() => {
                          setReplyTo(null);
                          setReplyContent((prev) => ({
                            ...prev,
                            [comment.id]: '',
                          }));
                        }}>
                        Cancel
                      </Button>
                      <Button
                        size='sm'
                        className='h-9'
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={
                          submitting ||
                          !replyText.trim() ||
                          (!isAuthenticated && (!guestName || !guestEmail))
                        }>
                        {submitting ? (
                          <>
                            <Loader2 className='mr-2 h-3.5 w-3.5 animate-spin' />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className='mr-2 h-3.5 w-3.5' />
                            Post Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className='mt-4'>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                  />
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
        <div className='space-y-4'>
          {!isAuthenticated && !isVerifiedGuest && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='guestName' className='text-sm font-medium'>
                  Name
                </Label>
                <Input
                  id='guestName'
                  placeholder='Enter your name'
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='guestEmail' className='text-sm font-medium'>
                  Email
                </Label>
                <Input
                  id='guestEmail'
                  placeholder='Enter your email'
                  type='email'
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                />
              </div>
            </div>
          )}
          {!isAuthenticated && isVerifiedGuest && (
            <div className='flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center'>
                  <span className='text-green-600 dark:text-green-300 font-semibold text-sm'>
                    {guestName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className='text-sm font-medium text-green-800 dark:text-green-200'>
                    Commenting as {guestName}
                  </p>
                  <p className='text-xs text-green-600 dark:text-green-400'>
                    {guestEmail}
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                className='text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800'
                onClick={() => {
                  localStorage.removeItem('commentToken');
                  localStorage.removeItem('guestName');
                  localStorage.removeItem('guestEmail');
                  setIsVerifiedGuest(false);
                  setGuestName('');
                  setGuestEmail('');
                }}>
                Switch Account
              </Button>
            </div>
          )}
          <div className='space-y-3'>
            <Textarea
              placeholder='Write a comment...'
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
              className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 resize-none focus:ring-primary'
            />
            <div className='flex justify-end'>
              <Button
                onClick={handleSubmitComment}
                disabled={
                  submitting ||
                  !commentContent.trim() ||
                  (!isAuthenticated && (!guestName || !guestEmail))
                }
                className='px-6'>
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
          {!isAuthenticated && !isVerifiedGuest && (
            <p className='text-xs text-muted-foreground text-center italic'>
              First-time commenters need to verify via email. After that, you
              can comment freely!
            </p>
          )}
        </div>

        {/* OTP Dialog */}
        <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <KeyRound className='h-5 w-5 text-primary' />
                Verify Your Comment
              </DialogTitle>
            </DialogHeader>
            <div className='flex flex-col items-center justify-center space-y-4 py-4'>
              <p className='text-center text-sm text-slate-500 dark:text-slate-400'>
                A 6-digit verification code has been sent to{' '}
                <strong>{guestEmail}</strong>. Please enter it below to publish
                your comment.
              </p>
              <div className='flex justify-center w-full'>
                <Input
                  placeholder='000000'
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className='text-center text-2xl tracking-[0.5em] font-mono h-14 w-full max-w-50'
                  maxLength={6}
                />
              </div>
            </div>
            <DialogFooter className='sm:justify-center'>
              <Button
                type='button'
                className='w-full sm:w-auto px-8'
                onClick={handleVerifyOtp}
                disabled={verifying || otp.length !== 6}>
                {verifying ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Verifying...
                  </>
                ) : (
                  'Verify & Publish'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Comments List */}
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
