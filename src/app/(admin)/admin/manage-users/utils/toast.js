"use client";
import Swal from "sweetalert2";

export function toastSuccess(text) {
  return Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: text, showConfirmButton: false, timer: 1500 });
}

export function toastError(text) {
  return Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: text, showConfirmButton: false, timer: 2000 });
}
