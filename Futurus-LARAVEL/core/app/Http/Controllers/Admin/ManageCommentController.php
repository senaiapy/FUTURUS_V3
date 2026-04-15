<?php

namespace App\Http\Controllers\Admin;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\Comment;

class ManageCommentController extends Controller
{
    public function index()
    {
        $pageTitle = "All Comments";

        $comments = Comment::latest()->with(['user', 'reports', 'reports.user'])
            ->paginate(getPaginate());

        return view('admin.market.comments', compact('pageTitle', 'comments'));
    }

    public function disabled()
    {
        $pageTitle = "All Comments";

        $comments = Comment::inactive()->latest()->with(['user', 'reports', 'reports.user'])
            ->paginate(getPaginate());

        return view('admin.market.comments', compact('pageTitle', 'comments'));
    }

    public function reported()
    {
        $pageTitle = "Reported Comments";

        $comments = Comment::where('is_reported', Status::YES)->with(['user','reports', 'reports.user'])
            ->latest()
            ->paginate(getPaginate());

        return view('admin.market.comments', compact('pageTitle', 'comments'));
    }

    public function status($id)
    {
        return Comment::changeStatus($id);
    }

}
