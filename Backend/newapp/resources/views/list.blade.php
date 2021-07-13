@extends('layout')

@section('content')
<h1>ListPage!</h1>
@if(Session::get('status'))
<div class="alert alert-success alert-dismissible fade show" role="alert">
  {{Session::get('status')}}
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
@endif
<div class="col-sm-6">
<table class="table">
  <thead>
    <tr>
      <th scope="col">ID</th>
      <th scope="col">Name</th>
      <th scope="col">Owner</th>
      <th scope="col">Operations</th>
    </tr>
  </thead>
  <tbody>
    @foreach($data as $row)
    <tr>
      <th scope="row">{{$row->id}}</th>
      <td>{{$row->Uname}}</td>
      <td>{{$row->owner}}</td>
      <td>
        <a href="/delete/{{$row->id}}"><i class="fa fa-trash"></i></a>
        &nbsp;&nbsp;
        <a href="/edit/{{$row->id}}"><i class="fa fa-edit"></i></a>
        &nbsp;&nbsp;
        <a href="/exchange/{{$row->id}}"><i class="fa fa-car"></i></a>
      </td>
    </tr>
    @endforeach
  </tbody>
</table>
</div>
@stop