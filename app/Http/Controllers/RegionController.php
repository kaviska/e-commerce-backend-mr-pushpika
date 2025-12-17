<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\Region;
use Illuminate\Http\Request;

class RegionController extends Controller
{

    public function index()
    {
        $region = Region::all();
        return Response::success($region);
    }
}
