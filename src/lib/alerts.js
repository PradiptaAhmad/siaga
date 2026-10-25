import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

export function toastSuccess(title) {
  return Toast.fire({ icon: 'success', title })
}

export function toastError(title) {
  return Toast.fire({ icon: 'error', title })
}

export function toastInfo(title) {
  return Toast.fire({ icon: 'info', title })
}

export function showSuccess(title, text) {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Baik, mengerti',
  })
}

export function showError(title, text) {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Tutup',
  })
}

export function confirmAction({
  title,
  text,
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  icon = 'question',
  danger = false,
}) {
  return Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: danger ? '#dc2626' : '#0b2b22',
  }).then((result) => result.isConfirmed)
}

export default Swal
