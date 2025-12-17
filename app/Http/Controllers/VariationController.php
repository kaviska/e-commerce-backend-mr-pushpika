<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\Variation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as FacadesRequest;

class VariationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $variations = Variation::all();
        return Response::success($variations, 'Variations fetched successfully');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:variations,name',
        ]);
        
        $variation = Variation::create([
            'name' => $validated['name'],
        ]);

        return Response::success($variation, 'Variation created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Variation $variation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Variation $variation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Variation $variation)
    {
        $validated = $request->validate([
            'id' => 'required|exists:variations,id',
            'name' => 'required|string|max:255|unique:variations,name',
        ]);

        $variation = Variation::find($validated['id']);
        $variation->update([
            'name' => $validated['name'],
        ]);

        return Response::success($variation, 'Variation updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|exists:variations,id',
            ]);

            $variation = Variation::find($validated['id']);
            $variation->delete();
            return Response::success($variation, 'Variation deleted successfully');
        } catch (\Illuminate\Database\QueryException $e) {
            // Check if it's a foreign key constraint violation
            if ($e->getCode() === '23000') {
                return Response::error('Cannot delete this variation because it has associated variation options. Please delete all options first.', 'Foreign key constraint violation', 409);
            }
            return Response::error($e->getMessage(), 'Failed to delete variation', 500);
        } catch (\Throwable $th) {
            return Response::error($th->getMessage(), 'Failed to delete variation', 500);
        }
    }
}
