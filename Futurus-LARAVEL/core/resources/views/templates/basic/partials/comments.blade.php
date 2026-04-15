@forelse($comments as $comment)
    @include('Template::partials.comment_item', ['comment' => $comment])
@empty
    <div class="text-center" id="empty-div">
        @include('Template::partials.empty', [
            'message' => 'No comment found',
        ])
    </div>
@endforelse
