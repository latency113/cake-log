import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface AlertOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  showConfirmButton?: boolean;
  timer?: number;
}

const customClass = {
  popup: 'swal2-custom-popup',
  confirmButton: 'swal2-custom-confirm-button'
};

// Standard SweetAlert2 for major actions (save/cancel)
export const showAlertSuccess = (options: AlertOptions) => {
  Swal.fire({
    icon: 'success',
    title: options.title || 'สำเร็จ!',
    text: options.text,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    showConfirmButton: options.showConfirmButton,
    timer: options.timer,
    customClass,
  });
};

export const showAlertError = (options: AlertOptions) => {
  Swal.fire({
    icon: 'error',
    title: options.title || 'เกิดข้อผิดพลาด!',
    text: options.text,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    showConfirmButton: options.showConfirmButton,
    timer: options.timer,
    customClass,
  });
};

export const showAlertInfo = (options: AlertOptions) => {
  Swal.fire({
    icon: 'info',
    title: options.title || 'ข้อมูล',
    text: options.text,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    showConfirmButton: options.showConfirmButton,
    timer: options.timer,
    customClass,
  });
};

// Toast notifications for minor feedback (validation errors)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export const showToastSuccess = (options: AlertOptions) => {
  Toast.fire({
    icon: 'success',
    title: options.title || 'สำเร็จ',
    text: options.text,
  });
};

export const showToastError = (options: AlertOptions) => {
  Toast.fire({
    icon: 'error',
    title: options.title || 'ข้อผิดพลาด',
    text: options.text,
  });
};

export const showToastInfo = (options: AlertOptions) => {
  Toast.fire({
    icon: 'info',
    title: options.title || 'ข้อมูล',
    text: options.text,
  });
};

export const showToastWarning = (options: AlertOptions) => {
  Toast.fire({
    icon: 'warning',
    title: options.title || 'คำเตือน',
    text: options.text,
  });
};

export const showConfirmDialog = (options: AlertOptions & { cancelButtonText?: string }) => {
  return Swal.fire({
    title: options.title || 'ยืนยันการดำเนินการ',
    text: options.text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'ยืนยัน',
    cancelButtonText: options.cancelButtonText || 'ยกเลิก',
    customClass,
  }).then((result) => result.isConfirmed);
};