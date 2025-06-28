import { useState } from "react";

export const useToast = () => {
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};
