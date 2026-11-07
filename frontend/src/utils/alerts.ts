import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { toast } from 'sonner';

interface AlertOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  showConfirmButton?: boolean;
  timer?: number;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

const customClass = {
  popup: 'swal2-custom-popup',
  title: 'swal2-custom-title',
  htmlContainer: 'swal2-custom-text',
  confirmButton: 'swal2-custom-confirm-button',
  cancelButton: 'swal2-custom-cancel-button',
};

// Primary theme colors matching website (Blue-600 & Slate-500)
const THEME_CONFIRM_COLOR = '#2563eb';
const THEME_CANCEL_COLOR = '#64748b';

// Standard SweetAlert2 for major actions (save/cancel)
export const showAlertSuccess = (options: AlertOptions) => {
  return Swal.fire({
    icon: 'success',
    title: options.title || 'สำเร็จ!',
    text: options.text,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    confirmButtonColor: options.confirmButtonColor || THEME_CONFIRM_COLOR,
    showConfirmButton: options.showConfirmButton,
    timer: options.timer,
    customClass,
  });
};

export const showAlertError = (options: AlertOptions) => {
  return Swal.fire({
    icon: 'error',
    title: options.title || 'เกิดข้อผิดพลาด!',
    text: options.text,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    confirmButtonColor: options.confirmButtonColor || '#ef4444',
    showConfirmButton: options.showConfirmButton,
    timer: options.timer,
    customClass,
  });
};

export const showAlertInfo = (options: AlertOptions) => {
  return Swal.fire({
    icon: 'info',
    title: options.title || 'ข้อมูล',
    text: options.text,
    confirmButtonText: options.confirmButtonText || 'ตกลง',
    confirmButtonColor: options.confirmButtonColor || THEME_CONFIRM_COLOR,
    showConfirmButton: options.showConfirmButton,
    timer: options.timer,
    customClass,
  });
};

// Modern Toast notifications using Sonner (clean, non-intrusive)
export const showToastSuccess = (options: AlertOptions | string) => {
  if (typeof options === 'string') {
    toast.success(options);
    return;
  }
  const text = options.text || options.title || 'สำเร็จ!';
  if (
    options.title &&
    options.text &&
    options.title !== 'Success' &&
    options.title !== 'สำเร็จ' &&
    options.title !== 'สำเร็จ!'
  ) {
    toast.success(options.title, { description: options.text });
  } else {
    toast.success(text);
  }
};

export const showToastError = (options: AlertOptions | string) => {
  if (typeof options === 'string') {
    toast.error(options);
    return;
  }
  const text = options.text || options.title || 'เกิดข้อผิดพลาด!';
  if (
    options.title &&
    options.text &&
    options.title !== 'Error' &&
    options.title !== 'ข้อผิดพลาด' &&
    options.title !== 'เกิดข้อผิดพลาด!'
  ) {
    toast.error(options.title, { description: options.text });
  } else {
    toast.error(text);
  }
};

export const showToastInfo = (options: AlertOptions | string) => {
  if (typeof options === 'string') {
    toast.info(options);
    return;
  }
  const text = options.text || options.title || 'ข้อมูล';
  if (
    options.title &&
    options.text &&
    options.title !== 'Info' &&
    options.title !== 'ข้อมูล'
  ) {
    toast.info(options.title, { description: options.text });
  } else {
    toast.info(text);
  }
};

export const showToastWarning = (options: AlertOptions | string) => {
  if (typeof options === 'string') {
    toast.warning(options);
    return;
  }
  const text = options.text || options.title || 'คำเตือน';
  if (
    options.title &&
    options.text &&
    options.title !== 'Warning' &&
    options.title !== 'คำเตือน'
  ) {
    toast.warning(options.title, { description: options.text });
  } else {
    toast.warning(text);
  }
};

export const showConfirmDialog = (options: AlertOptions & { cancelButtonText?: string; isDestructive?: boolean }) => {
  return Swal.fire({
    title: options.title || 'ยืนยันการดำเนินการ',
    text: options.text,
    icon: options.isDestructive ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'ยืนยัน',
    cancelButtonText: options.cancelButtonText || 'ยกเลิก',
    confirmButtonColor: options.confirmButtonColor || (options.isDestructive ? '#ef4444' : THEME_CONFIRM_COLOR),
    cancelButtonColor: options.cancelButtonColor || THEME_CANCEL_COLOR,
    customClass,
  }).then((result) => result.isConfirmed);
};

