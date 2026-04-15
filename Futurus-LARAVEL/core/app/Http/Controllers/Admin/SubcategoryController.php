<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubcategoryController extends Controller {
    public function index() {

        $pageTitle     = "Subcategories";
        $subcategories = SubCategory::orderBy('id', 'desc')->searchable(['name', 'category:name'])->with('category')->paginate(getPaginate());
        $categories    = Category::active()->latest()->get();
        return view('admin.subcategory.index', compact('pageTitle', 'subcategories', 'categories'));
    }

    public function store(Request $request, $id = 0) {
        $request->validate([
            'name'        => [
                'required',
                Rule::unique('sub_categories')->where(fn($query) =>
                    $query->where('category_id', $request->category_id)
                )->ignore($id),
            ],
            'category_id' => 'required|integer|exists:categories,id',
        ]);

        if (!$id) {
            $subcategory  = new SubCategory();
            $notification = 'Subcategory added successfully.';
        } else {
            $subcategory  = SubCategory::findOrFail($id);
            $notification = 'Subcategory updated successfully';
        }

        $subcategory->name        = $request->name;
        $subcategory->category_id = $request->category_id;
        $subcategory->save();

        $notify[] = ['success', $notification];
        return back()->withNotify($notify);
    }

    public function status($id) {
        return SubCategory::changeStatus($id);
    }
}
