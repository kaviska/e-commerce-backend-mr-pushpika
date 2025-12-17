<?php

namespace App\Http\Controllers;

use App\Helper\Response;
use App\Models\Notice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NoticeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'id' => 'integer|exists:notices,id',
            'status' => 'string|in:active,inactive,all',
            'after' => 'date',
            'before' => 'date',
        ]);

        $query = Notice::query();

        if ($request->has('section')) {
            $notice=Notice::where('section', $request->section);
            return Response::success($notice->get(), "Notices for section {$request->section} fetched successfully");

        }

        if ($request->has('id')) {
            $query->where('id', $request->id);
            return Response::success($query->first(), 'Notice fetched successfully');
        }


        if (!$request->has('all')) {
            $query->where('start_date', '<=', now())->where('end_date', '>=', now());
        }


        if ($request->has('status')) {
            if ($request->status != 'all') {
                $query->where('status', $request->status);
            }
        } else {
            $query->where('status', 'active');
        }

        $notices = $query->get();
        return Response::success($notices, "{$notices->count()} Notices fetched successfully");
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
            'title' => 'required|string|max:255|unique:notices,title',
            'description' => 'required|string|max:512',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'link' => 'string',
            'status' => 'required|string|in:active,inactive',
            'start_date' => 'required|date',
            'section' => 'required',
            'button_text' => 'nullable|string',
            'additional_field_1' => 'nullable|string',
            'additional_field_2' => 'nullable|string',
            'additional_field_3' => 'nullable|string',
            'additional_field_4' => 'nullable|string',
            'end_date' => 'required|date',
        ]);

        // validate image 
        if (!$request->hasFile('image')) {
            return Response::error("Image is required");
        }

        $slug = Str::slug($validated['title']);

        try {
            // save image to storage
            $imageFile = $request->file('image');
            $fileName = $slug . '.' . $imageFile->extension();
            $imageFile = Storage::disk('notices')->putFileAs('/', $imageFile, $fileName);

            // save category in DB
            $notice = new Notice();
            $notice->title = $validated['title'];
            $notice->description = $validated['description'];
            $notice->image = "storage/images/notices/$imageFile";
            $notice->link = $validated['link'];
            $notice->status = $validated['status'];
            $notice->start_date = $validated['start_date'];
            $notice->end_date = $validated['end_date'];
            $notice->section = $validated['section'];
            $notice->button_text = $validated['button_text'] ?? null;
            $notice->additional_field_1 = $validated['additional_field_1'] ?? null;
            $notice->additional_field_2 = $validated['additional_field_2'] ?? null;
            $notice->additional_field_3 = $validated['additional_field_3'] ?? null;
            $notice->additional_field_4 = $validated['additional_field_4'] ?? null;
            $notice->save();
            return Response::success($notice, "Notice created successfully");
        } catch (\Throwable $th) {
            return Response::error($th->getMessage(), "Failed to create notice", 201);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Notice $notice)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Notice $notice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {

        $validated = $request->validate([
            'id' => 'required|integer|exists:notices,id',
            'title' => 'string|max:255',
            'description' => 'string|max:512',
            'image' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'link' => 'string',
            'status' => 'string|max:255',
            'start_date' => 'date',
            'end_date' => 'date',
            'section' => 'string',
            'button_text' => 'nullable|string',
            'additional_field_1' => 'nullable|string',
            'additional_field_2' => 'nullable|string',
            'additional_field_3' => 'nullable|string',
            'additional_field_4' => 'nullable|string',
        ]);

        $notice = Notice::find($validated['id']);

        if ($request->has('title')) {
            $notice->title = $request->title;
        }

        if ($request->has('description')) {
            $notice->description = $request->description;
        }

        if ($request->has('link')) {
            $notice->link = $request->link;
        }

        if ($request->has('status')) {
            $notice->status = $request->status;
        }

        if ($request->has('start_date')) {
            $notice->start_date = $request->start_date;
        }

        if ($request->has('end_date')) {
            $notice->end_date = $request->end_date;
        }

        if ($request->has('section')) {
            $notice->section = $request->section;
        }

        if ($request->has('button_text')) {
            $notice->button_text = $request->button_text;
        }

        if ($request->has('additional_field_1')) {
            $notice->additional_field_1 = $request->additional_field_1;
        }

        if ($request->has('additional_field_2')) {
            $notice->additional_field_2 = $request->additional_field_2;
        }

        if ($request->has('additional_field_3')) {
            $notice->additional_field_3 = $request->additional_field_3;
        }

        if ($request->has('additional_field_4')) {
            $notice->additional_field_4 = $request->additional_field_4;
        }

        if ($request->hasFile('image')) {
            // delete old image
            $oldImage = $notice->image; // ex: storage/images/categories/slug.jpg
            $fileName = basename($oldImage);
            if (Storage::disk('notices')->delete($fileName)) {
                Log::info("Old image deleted successfully");
            }


            // save new image
            $imageFile = $request->file('image');
            $fileName = Str::slug($notice->title) . '.' . $imageFile->extension();
            $imageFile = Storage::disk('notices')->putFileAs('/', $imageFile, $fileName);
            $notice->image = "storage/images/notices/$imageFile";
        }



        $notice->save(); // save changes

        return Response::success($notice, "Notice updated successfully");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        $notice = Notice::find($request->id);
        $notice->delete();
        return Response::success($notice, 'Notice deleted successfully');
    }
}
