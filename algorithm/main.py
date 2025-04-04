import subprocess
import bpy
import sys
import os
import math
import argparse
import time

script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.append(script_dir)

from utility import intersect_and_delete, get_lengths_parts_of_text, merge_blend_files


def generate_model(word1, word2, lengths1, lengths2, output_name):
    """Generates a model of the third type"""

    # Start process for every part of the model
    processes = []
    for i in range(len(lengths1) - 1):
        p = subprocess.Popen([
            "blender", "--background", "--python", "generate_part.py", "--", word1, word2, str(lengths1[i]),
            str(lengths1[i + 1]), str(lengths2[i]), str(lengths2[i + 1]), f"{output_name}_part_{i}.blend"
        ])
        processes.append(p)

    # Wait for all processes to complete
    for p in processes:
        p.wait()

    # Union the parts of the model to one file
    merge_blend_files([f"{output_name}_part_{i}.blend" for i in range(len(lengths1) - 1)])
    

def generate_model_with_counts_letters(word1, word2, counts_letters1, counts_letters2, output_name):
    """Generates a model of the second type"""

    lengths1 = get_lengths_parts_of_text(word1, counts_letters1)
    lengths2 = get_lengths_parts_of_text(word2, counts_letters2)
    generate_model(word1, word2, lengths1, lengths2, output_name)


def generate_model_by_letters(word1, word2, output_name):
    """Generates a model of the first type"""

    counts_letters1 = [1] * len(word1)
    counts_letters2 = [1] * len(word2)
    generate_model_with_counts_letters(word1, word2, counts_letters1, counts_letters2, output_name)


def generate_rectangle_platform(objects, height, offset):
    """Generates a rectangular platform under the passed objects with the specified height and width offset"""

    # Find maximal x and y coordinates
    max_x = 0
    max_y = 0
    for obj in objects:
        mesh = obj.data
        for vert in mesh.vertices:
            world_coord = obj.matrix_world @ vert.co  # Convert the coordinates of the vertices into world space
            max_x = max(max_x, world_coord.x)
            max_y = max(max_y, world_coord.y)

    # Create the platform
    bpy.ops.mesh.primitive_cube_add(size=1,
                                    location=(max_x / 2, max_y / 2, -height / 2),
                                    scale=(max_x + 2 * offset, max_y + 2 * offset, height))
    return bpy.context.object


def generate_hexagon_platform(objects, height, offset):
    """Generates a hexagonal platform under the passed objects with the specified height and width offset"""

    # Find maximal x and y coordinates
    max_x = 0
    max_y = 0
    for obj in objects:
        mesh = obj.data
        for vert in mesh.vertices:
            world_coord = obj.matrix_world @ vert.co  # Convert the coordinates of the vertices into world space
            max_x = max(max_x, world_coord.x)
            max_y = max(max_y, world_coord.y)

    coeff = max_y / max_x  # Coefficient of inclination of a straight line passing through the corners of the model

    # Find shifting straight lines up and down
    min_b = 0
    max_b = 0
    for obj in objects:
        mesh = obj.data
        for vert in mesh.vertices:
            world_coord = obj.matrix_world @ vert.co  # Convert the coordinates of the vertices into world space
            min_b = min(min_b, world_coord.y - coeff * world_coord.x)
            max_b = max(max_b, world_coord.y - coeff * world_coord.x)

    width = math.cos(math.atan(coeff)) * (max_b - min_b) + 2 * offset
    length = max(max_x, max_y) * 5

    # Create the diagonal part of the platform
    bpy.ops.mesh.primitive_cube_add(size=1,
                                    location=(0, (max_b + min_b) / 2, -height / 2),
                                    scale=(length, width, height),
                                    rotation=(0, 0, math.atan(coeff)))
    hexagon = bpy.context.object

    # Create the platform
    rectangle = generate_rectangle_platform(objects, height, offset)
    intersect_and_delete(hexagon, rectangle)


def createParser ():
    """Creates the parser of command line arguments"""

    parser = argparse.ArgumentParser()
    parser.add_argument('--words', nargs=2)
    parser.add_argument("--output", required=True)
    parser.add_argument("--expansion", default="obj", choices=["blend", "obj", "stl"])
    parser.add_argument("--type_model", choices=[1, 2, 3], type=int)
    parser.add_argument("--counts_letters", nargs="*")
    parser.add_argument("--lengths", nargs="*")
    parser.add_argument("--type_platform", default=0, choices=[0, 1, 2], type=int)
    parser.add_argument("--offset_platform", default=0.15, type=float)
    parser.add_argument("--height_platform", default=0.1, type=float)

    return parser


if __name__ == "__main__":
    bpy.ops.font.open(filepath="static/ARIAL.TTF")

    # Parse arguments
    parser = createParser()
    namespace = parser.parse_args(sys.argv[5:])

    # Create model
    if namespace.type_model == 1:
        generate_model_by_letters(*namespace.words, namespace.output)
    elif namespace.type_model == 2:
        counts_letters1 = [int(x) for x in namespace.counts_letters[0].split(",")]
        counts_letters2 = [int(x) for x in namespace.counts_letters[1].split(",")]
        generate_model_with_counts_letters(*namespace.words, counts_letters1, counts_letters2, namespace.output)
    else:
        lengths1 = [float(x) for x in namespace.lengths[0].split(",")]
        lengths2 = [float(x) for x in namespace.lengths[1].split(",")]
        generate_model(*namespace.words, lengths1, lengths2, namespace.output)

    # Create platform
    if namespace.type_platform != 0:
        if namespace.type_platform == 1:
            generate_rectangle_platform(list(bpy.context.scene.objects), namespace.height_platform, namespace.offset_platform)
        else:
            generate_hexagon_platform(list(bpy.context.scene.objects), namespace.height_platform, namespace.offset_platform)

    # Save model
    if namespace.expansion == "blend":
        bpy.ops.wm.save_as_mainfile(filepath=f"{namespace.output}.blend")
    elif namespace.expansion == "obj":
        bpy.ops.wm.obj_export(filepath=f"{namespace.output}.obj")
    elif namespace.expansion == "stl":
        bpy.ops.export_mesh.stl(filepath=f"{namespace.output}.stl", use_selection=False)