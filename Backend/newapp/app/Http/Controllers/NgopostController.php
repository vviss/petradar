<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ngopost;


class NgopostController extends Controller
{
    //
    function index() {
        echo 'TEST from NgoPostController';
    }

    function listNgoPosts() {
        $data = Ngopost::all();
        echo $data;
    }
    
    
    function addNgoPost(Request $req) {
        $ngopost = new Ngopost;
        $ngopost->uid = $req->input('uid');
        $ngopost->downloadURL = $req->input('downloadURL');
        $ngopost->petName = $req->input('petName');
        $ngopost->petAge = $req->input('petAge');
        $ngopost->petType = $req->input('petType');
        $ngopost->petGender = $req->input('petGender');
        $ngopost->gwCats = $req->input('gwCats');
        $ngopost->gwDogs = $req->input('gwDogs');
        $ngopost->gwKids = $req->input('gwKids');
        $ngopost->description = $req->input('description');
        $result = $ngopost->save();

        if($result) {
            return 'from backend, success';
        } else {
            return 'from backend, failed';
        }
    }

    
    function deleteNgoPost($id) {
        Ngopost::find($id)->delete();
        return 'deleted NgoPost backend';
    }
    

}

