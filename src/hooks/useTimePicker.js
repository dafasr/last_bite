import { useState } from 'react';

const useTimePicker = (initialTime = '') => {
  const [displayTime, setDisplayTime] = useState(initialTime);
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleConfirm = (pickedDuration) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(pickedDuration.hours).padStart(2, '0');
    const minutes = String(pickedDuration.minutes).padStart(2, '0');
    const seconds = String(pickedDuration.seconds).padStart(2, '0');
    setDisplayTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
    setPickerVisible(false);
  };

  const initialHours = parseInt(displayTime.split(':')[0] || '0', 10);
  const initialMinutes = parseInt(displayTime.split(':')[1] || '0', 10);
  const initialSeconds = parseInt(displayTime.split(':')[2] || '0', 10);

  return {
    displayTime,
    setDisplayTime,
    isPickerVisible,
    setPickerVisible,
    handleConfirm,
    initialHours,
    initialMinutes,
    initialSeconds,
  };
};

export default useTimePicker;
