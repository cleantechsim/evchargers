#include <stdio.h>

#include <Python.h>

#include "types.h"

#include "debug.h"

#include "geo_algorithm.h"

static PyObject *merge_aggregations_wrapper(PyObject *self, PyObject *args) {

    PyObject *list;

    float max_diameter_km;

    const char *module_name;
    const char *class_name;

    if (!PyArg_ParseTuple(args, "ssOf", &module_name, &class_name, &list, &max_diameter_km)) {
        return NULL;
    }

    const uint32_t len = PyList_Size(list);

    geo_input_point_t *input_points = malloc(len * sizeof(geo_input_point_t));

    PyObject *result_list;

    PyObject *module_name_object = PyString_FromString(module_name);

    PyObject *module = PyImport_Import(module_name_object);

    Py_DECREF(module_name_object);

    PyObject *module_dict = PyModule_GetDict(module);

    PyObject *cls = PyDict_GetItemString(module_dict, class_name);

    if (input_points != NULL) {

        size_t size = BYTES(input_points, len);

        geo_input_point_t *out_points = malloc(size);

        if (out_points != NULL) {

            for (int i = 0; i < len; ++ i) {
                PyObject *clustered_point = PyList_GetItem(list, i);

                PyObject *count = PyObject_GetAttrString(clustered_point, "count");

                PyObject *geo_point = PyObject_CallMethod(clustered_point, "get_point", NULL);
                PyObject *latitude_object = PyObject_GetAttrString(geo_point, "latitude");
                PyObject *longitude_object = PyObject_GetAttrString(geo_point, "longitude");

                input_points[i].count = PyInt_AsLong(count);
                input_points[i].geo_point.latitude = PyFloat_AsDouble(latitude_object);
                input_points[i].geo_point.longitude = PyFloat_AsDouble(longitude_object);

                Py_DECREF(count);
                Py_DECREF(geo_point);
                Py_DECREF(latitude_object);
                Py_DECREF(longitude_object);
            }

            const uint32_t merged = merge_aggregations_fast(
                0,
                input_points,
                len,
                max_diameter_km,
                out_points);

            result_list = PyList_New(0);

            for (uint32_t i = 0; i < merged; ++ i) {

                const geo_merged_point_t *const points = out_points;

                PyObject *params = Py_BuildValue(
                                    "iff",
                                    points[i].count,
                                    points[i].geo_point.latitude,
                                    points[i].geo_point.longitude);

                PyObject *result_point = PyObject_CallObject(
                                                        cls,
                                                        params);

                /* Py_DECREF(params); */

                if (result_point == NULL) {
                    printf("null result point\n");
                }

                PyList_Append(result_list, result_point);
            }

            free(out_points);
        }

        free(input_points);

    }

    Py_DECREF(cls);

    /* Py_DECREF(module_dict); */

    Py_DECREF(list);

    if (result_list != NULL) {
        return result_list;
    }

    Py_RETURN_NONE;
}

static PyMethodDef geo_clustering_methods [] = {
    { "merge_aggregations_c", (PyCFunction)merge_aggregations_wrapper, METH_VARARGS, NULL },
    { NULL, NULL, 0, NULL }
};

PyMODINIT_FUNC initgeo_clustering_c() {

    Py_InitModule3("geo_clustering_c", geo_clustering_methods, "Test method");
}

