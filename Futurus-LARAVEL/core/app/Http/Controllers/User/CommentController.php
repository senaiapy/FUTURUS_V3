<?php

namespace App\Http\Controllers\User;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller {
    public function index(Request $request) {
        $marketId = $request->get('market_id');
        $sortBy   = $request->get('sort_by', 'newest');

        $query = Comment::where('market_id', $marketId)->active()
            ->parentComments()
            ->with(['user', 'replies.user', 'replies', 'replies.authUserLike', 'authUserLike'])
            ->withCount('replies');

        if ($sortBy == 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $comments = $query->paginate(getPaginate(2));

        if ($request->ajax()) {
            $html = view('Template::partials.comments', compact('comments'))->render();

            return response()->json([
                'success'   => true,
                'html'      => $html,
                'has_more'  => $comments->hasMorePages(),
                'next_page' => $comments->currentPage() + 1,
            ]);
        }

    }

    public function getReplies(Request $request) {
        $commentId = $request->input('comment_id');
        $comment   = Comment::active()->find($commentId);

        if (!$comment) {
            $notify = ['Comment not found'];
            return responseError('not_found', $notify);
        }
        $perPage = 3;

        $replies = $comment->replies()
            ->with(['user', 'authUserLike'])
            ->withCount('likes')
            ->latest()
            ->paginate($perPage, ['*'], 'replies_page');

        $html = view('Template::partials.comment_replies', [
            'replies' => $replies->items(),
            'comment' => $comment,
        ])->render();

        return response()->json([
            'success'      => true,
            'html'         => $html,
            'has_more'     => $replies->hasMorePages(),
            'current_page' => $replies->currentPage(),
            'total'        => $replies->total(),
            'per_page'     => $replies->perPage(),
        ]);
    }

    public function store(Request $request) {

        $validator = Validator::make($request->all(), [
            'comment'   => 'required|string|max:1000',
            'market_id' => 'required|integer|exists:markets,id',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        if ($validator->fails()) {
            return responseError('validation_error', $validator->errors());
        }

        $parentId = $request->parent_id;
        if ($parentId) {
            $parentComment = Comment::find($parentId);
            if ($parentComment && $parentComment->parent_id) {
                $parentId = $parentComment->parent_id;
            }
        }

        $parentId = $parentId ?: 0;

        $comment            = new Comment();
        $comment->user_id   = auth()->id();
        $comment->market_id = $request->market_id;
        $comment->parent_id = $parentId;
        $comment->comment   = $request->comment;
        $comment->save();

        if ($comment->parent_id) {
            $comment->incrementRepliesCount();
        }

        $comment->load('user');

        $html = view('Template::partials.comment_item', compact('comment'))->render();

        return response()->json([
            'success' => true,
            'message' => 'Comment posted successfully.',
            'html'    => $html,
            'comment' => $comment,
        ]);
    }

    public function toggleLike(Request $request) {
        $comment = Comment::find($request->comment_id);
        if (!$comment) {
            $notify = ['Comment not found'];
            return responseError('not_found', $notify);
        }

        $isLiked = $comment->toggleLike();

        return response()->json([
            'success'     => true,
            'is_liked'    => $isLiked,
            'likes_count' => $comment->fresh()->likes_count,
        ]);
    }

    public function report(Request $request) {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return responseError('validation_error', $validator->errors());
        }

        $comment = Comment::find($request->comment_id);
        if (!$comment) {
            $notify = ['Comment not found'];
            return responseError('not_found', $notify);
        }
        $user = auth()->user();
        if ($comment->user_id == $user->id) {
            $notify = ['You cannot report own comment'];
            return responseError('validation_error', $notify);
        }

        $existingReport = CommentReport::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->first();

        if ($existingReport) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reported this comment.',
            ]);
        }

        $commentReport             = new CommentReport();
        $commentReport->user_id    = $user->id;
        $commentReport->comment_id = $comment->id;
        $commentReport->reason     = $request->reason;
        $commentReport->save();

        $comment->is_reported = Status::YES;
        $comment->save();

        return response()->json([
            'success' => true,
            'message' => 'Comment reported successfully.',
        ]);
    }

}
