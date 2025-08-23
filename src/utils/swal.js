import Swal from 'sweetalert2';

export function toastSuccess(title='Berhasil', text=''){
  return Swal.fire({ icon:'success', title, text, toast:true, position:'top-end', timer:2000, showConfirmButton:false });
}
export function toastError(title='Gagal', text=''){
  return Swal.fire({ icon:'error', title, text, toast:true, position:'top-end', timer:2500, showConfirmButton:false });
}
export function confirmDelete({title='Hapus?', text='Data ini akan dihapus permanen'}={}){
  return Swal.fire({ title, text, icon:'warning', showCancelButton:true, confirmButtonText:'Ya, hapus', cancelButtonText:'Batal', confirmButtonColor:'#dc2626' });
}
