@extends('layout')

@section('content')
<h1>LoginPage!</h1>
@if(Session::get('status'))
<div class="alert alert-success alert-dismissible fade show" role="alert">
  {{Session::get('status')}}
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
@endif
<div class="col-sm-6">
<form method="post" action="login">
@csrf
  <div class="form-group">
    <label for="email" class="form-label" >Email</label>
    <input type="text" name="email" class="form-control" placeholder="Enter Email" id="email"><br/>
    <label for="password" class="form-label" >Password</label>
    <input type="password" name="password" class="form-control" placeholder="Enter Password" id="password"><br/>
    <button type="submit" class="btn btn-primary">Login</button>
  </div>
</form>
</div>
@stop