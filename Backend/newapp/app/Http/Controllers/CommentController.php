<?php

namespace App\Http\Controllers;
use App\Models\Comment;


use Illuminate\Http\Request;

class CommentController extends Controller
{
    //
    function listComments() {
        $data = Comment::all();
        echo $data;
    }

    function addComment(Request $req) {
        $comment = new Comment;
        $comment->uid = $req->input('uid');
        $comment->pid = $req->input('pid');
        $comment->text = $req->input('text');
        $comment->save();
        echo $comment;
    }

    function deleteComment($id) {
        Comment::find($id)->delete();
        return 'deleteComment backend';
    }

    function editComment($id, Request $req) {
        $comment = Comment::find($id);
        $comment->text = $req->input('text');
        $comment->save();
        echo 'editComment backend';
    }
}
