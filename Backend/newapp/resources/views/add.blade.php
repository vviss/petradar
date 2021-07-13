@extends('layout')

@section('content')
<h1>AddPage!</h1>
<div class="col-sm-6">
<form method="post" action="add">
<!-- @csrf -->
  <div class="form-group">
    <label for="name" class="form-label" >Name</label>
    <input type="text" name="name" class="form-control" placeholder="Enter Item Name" id="name"><br/>
    <label for="owner" class="form-label" >Owner</label>
    <input type="text" name="owner" class="form-control" placeholder="Enter Owner Name" id="owner"><br/>
   <button type="submit" class="btn btn-primary">Add</button>
  </div>
</form>
</div>
@stop