import bpy
import sys
import math
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.append(script_dir)

from utility import get_length_text, intersect_and_delete


def generate_word(word, is_left_word, extrude):
    """Generates word with specified extrude and rotation"""

    # Create word with specified parameters
    bpy.ops.object.text_add(location=(0, 0, 0))
    text_obj = bpy.context.object
    text_obj.data.body = word
    text_obj.data.font = bpy.data.fonts["Open Sans Regular"]
    text_obj.data.size = 2.0
    text_obj.data.extrude = extrude
    text_obj.rotation_euler = (math.radians(90), 0, 0) if is_left_word else (math.radians(90), 0, math.radians(90))
    bpy.ops.object.convert(target='MESH')

    # Find minimal coordinates
    vertices = [v.co for v in text_obj.data.vertices]
    min_coords = (min(v.z for v in vertices),
                  min(v.x for v in vertices),
                  min(v.y for v in vertices))

    # Shift the corner of the word to the origin
    if is_left_word:
        text_obj.location.x -= min(v.x for v in vertices)
        text_obj.location.y -= min(v.z for v in vertices)
    else:
        text_obj.location.y -= min(v.x for v in vertices)
        text_obj.location.x -= min(v.z for v in vertices)

    return text_obj


def generate_part_of_word(word, x1, x2, is_left_word, extrude):
    """Generates a part of a word within the specified limits  with specified extrude and rotation"""

    # Generate full word
    text_obj = generate_word(word, is_left_word, extrude)

    # Calculate required dimensions and create parallelepiped
    dim = text_obj.dimensions
    x1 *= dim.x
    x2 *= dim.x
    if is_left_word:
        bpy.ops.mesh.primitive_cube_add(size=1, location=((x1 + x2) / 2, extrude / 2, dim.y / 2), scale=(x2 - x1, extrude, dim.y))
    else:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(extrude / 2, (x1 + x2) / 2, dim.y / 2), scale=(extrude, x2 - x1, dim.y))
    cube = bpy.context.object

    intersect_and_delete(cube, text_obj)
    return cube


def generate_part_of_model(word1, word2, x1, x2, y1, y2):
    """Generate part of model"""

    part1 = generate_part_of_word(word1, x1, x2, True, get_length_text(word2))
    part2 = generate_part_of_word(word2, y1, y2, False, get_length_text(word1))
    intersect_and_delete(part1, part2)
    return part1


if __name__ == "__main__":
    # Command line arguments
    word1, word2, x1, x2, y1, y2, output_path = sys.argv[-7:]
    x1, x2, y1, y2 = map(float, (x1, x2, y1, y2))

    # Download a font
    bpy.ops.font.open(filepath="static/OpenSans-VariableFont_wdth,wght.ttf")

    # Create model
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    part = generate_part_of_model(word1, word2, x1, x2, y1, y2)

    # Save result
    bpy.ops.wm.save_as_mainfile(filepath=output_path)
