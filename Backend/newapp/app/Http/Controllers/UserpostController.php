<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Userpost;


class UserpostController extends Controller
{
    //
    function index() {
        return view('TEST from UserpostController');
    }

    function listPosts() {
        $data = Userpost::all();
        echo $data;
    }
    
    
    function addUserpost(Request $req) {
        $userpost = new Userpost;
        $userpost->uid = $req->input('uid');
        $userpost->downloadURL = $req->input('downloadURL');
        $userpost->petName = $req->input('petName');
        $userpost->petAge = $req->input('petAge');
        $userpost->location = $req->input('location');
        $userpost->active = $req->input('active');
        $userpost->caseType = $req->input('caseType');
        $userpost->petType = $req->input('petType');
        $userpost->petGender = $req->input('petGender');
        $userpost->description = $req->input('description');
        $userpost->reward = $req->input('reward');
        $result = $userpost->save();

        if($result) {
            return 'from backend, success';
        } else {
            return 'from backend, failed';
        }
    }

    
    function deleteUserpost($id) {
        Userpost::find($id)->delete();
        return 'deleted post backend';
    }
    

}

