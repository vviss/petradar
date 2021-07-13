@extends('layout')

@section('content')
<h1>EditPage!</h1>
<div class="col-sm-6">
<form method="post" action="/edit">
@csrf
  <div class="form-group">
    <input type="hidden" name="id" value="{{$data->id}}">
    <label for="name" class="form-label" >Name</label>
    <input type="text" name="name" class="form-control" value="{{$data->Uname}}" id="name"><br/>
    <button type="submit" class="btn btn-primary">Update</button>
  </div>
</form>
</div>
@stop