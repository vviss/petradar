@extends('layout')

@section('content')
<h1>Exchange!</h1>
<div class="col-sm-6">
<form method="post" action="/exchange">
@csrf
  <div class="form-group">
    <input type="hidden" name="id" value="{{$data->id}}">
    <label for="owner" class="form-label" >Owner</label>
    <input type="text" name="owner" class="form-control" value="{{$data->owner}}" id="owner"><br/>
    <button type="submit" class="btn btn-primary">Exchange</button>
  </div>
</form>
</div>
@stop