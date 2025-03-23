import bpy
import os

def get_length_text(text):
    """Returns length of text in blender"""

    # Create text object
    bpy.ops.object.text_add(location=(0, 0, 0))
    text_obj = bpy.context.object
    text_obj.data.body = text
    text_obj.data.font = bpy.data.fonts["Open Sans Regular"]

    text_obj.data.size = 2.0

    # Convert text to mesh and return its length
    bpy.ops.object.convert(target='MESH')
    length = text_obj.dimensions.x
    bpy.ops.object.delete(use_global=False)
    return length


def get_lengths_parts_of_text(text, counts_letters):
    """Returns lengths of text's parts relative to the length of the entire text from the beginning to the specified letters"""

    res = [0]
    full_length = get_length_text(text)

    count_prev_letters = 0
    for i in range(0, len(counts_letters) - 1):
        count_prev_letters += counts_letters[i]
        res.append(get_length_text(text[:count_prev_letters]) / full_length + 0.001)

    res.append(1)

    return res


def intersect_and_delete(obj1, obj2):
    """Intersects objects and delete them"""

    boolean_modifier = obj1.modifiers.new(name="Boolean", type='BOOLEAN')
    boolean_modifier.object = obj2
    boolean_modifier.operation = 'INTERSECT'
    boolean_modifier.use_self = True

    bpy.context.view_layer.objects.active = obj1
    obj1.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj1.select_set(False)

    obj2.select_set(True)
    bpy.ops.object.delete(use_global=False)


def resolve_path(local_path):
    """Converts the local path to an absolute path relative to the script directory"""
    script_dir = os.path.dirname(__file__)
    return os.path.abspath(os.path.join(script_dir, local_path))


def merge_blend_files(input_files):
    """Merges objects from different blend files"""

    # Clear scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Import objects from all files
    for local_path in input_files:
        file_path = resolve_path(local_path)
        with bpy.data.libraries.load(file_path, link=False) as (data_from, data_to):
            data_to.objects = data_from.objects

        # Add imported objects to the scene
        for obj in data_to.objects:
            if obj is not None:
                bpy.context.collection.objects.link(obj)

    # Delete files
    for file_path in input_files:
        try:
            os.remove(file_path)
            print(f"Deleted: {file_path}")
        except OSError as e:
            print(f"Error deleting {file_path}: {e}")