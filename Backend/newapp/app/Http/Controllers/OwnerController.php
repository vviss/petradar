<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use App\Models\Userpost;
use App\Models\Owner;
use Session;
use Crypt;

class OwnerController extends Controller
{
    //
    function index() {
        return view('TEST from OwnerController');
    }
    
    function listUsers() {
        $data = Owner::all();
        echo $data;
    }

    function getUser($uid) {
        $owner = Owner::where('uid', $uid)->first();
        echo $owner;
    }

    // function login(Request $req) {
    //     $res = '';

    //     if(!Owner::where('email', '=', $req->input('email'))->exists()) {
    //         if(!Owner::where('name', '=', $req->input('email'))->exists()) {
    //         $res = 'USER ERROR';
    //       } else {
    //         $owner = Owner::where('name',$req->input('email'))->first();
    //       }
    //     } else {
    //         $owner = Owner::where('email',$req->input('email'))->first();
    //     }

    //     if($res == '') {
    //     if(Crypt::decrypt($owner->password) == $req->input('password')) {
    //         $req->session()->put('user',$owner->name);
    //         $req->session()->flash('status','Owner Logged in Successfully');

    //         // echo $owner->name;
    //         $res = $owner->name;
    //     }
    //     else {
    //         $req->session()->flash('status','Owner Logged in error');
    //         $res = 'PASS ERROR';
    //     }
    //   }
    
    //   echo $res;
    // }

    function register(Request $req) {
        $data = Owner::all();
        $error = '';

        foreach($data as $row) {
            if($req->input('email') == $row->email){
                $error = 'EMAIL TAKEN';
                echo $error;
                return;
            }
        }
        
        $owner = new Owner;
        $owner->name = $req->input('name');
        $owner->email = $req->input('email');
        $owner->user_type = $req->input('userType');
        $owner->password = Crypt::encrypt($req->input('password'));
        $owner->uid = $req->input('uid');
        $owner->save();
        echo 'SUCCESS';
}
}