<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\UserpostController;
use App\Http\Controllers\NgopostController;
use App\Http\Controllers\CommentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('welcome');
// });
 Route::group(['middleware'=>'web'],function(){
     Route::get('/listUsers',[OwnerController::class, 'listUsers']);
     Route::post('/register',[OwnerController::class, 'register']);
     Route::post('/login',[OwnerController::class, 'login']);
     Route::get('/listPosts',[UserpostController::class, 'listPosts']);
     Route::post('/addUserpost',[UserpostController::class, 'addUserpost']);
     Route::delete('/deleteUserpost/{id}',[UserpostController::class, 'deleteUserpost']);
     Route::get('/listComments',[CommentController::class, 'listComments']);
     Route::post('/addComment',[CommentController::class, 'addComment']);
     Route::delete('/deleteComment/{id}',[CommentController::class, 'deleteComment']);
     Route::put('/editComment/{id}',[CommentController::class, 'editComment']);
     Route::get('/getUser/{uid}',[OwnerController::class, 'getUser']);
     Route::get('/listNgoPosts',[NgopostController::class, 'listNgoPosts']);
     Route::post('/addNgoPost',[NgopostController::class, 'addNgoPost']);
     Route::delete('/deleteNgoPost/{id}',[NgopostController::class, 'deleteNgoPost']);
    });
