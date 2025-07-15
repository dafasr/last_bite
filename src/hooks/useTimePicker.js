import { useState } from 'react';

const useTimePicker = (initialTime = '') => {
  const [displayTime, setDisplayTime] = useState(initialTime);
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleConfirm = (pickedDuration) => {
    let datePart;
    if (displayTime) {
      // Extract date part from existing displayTime
      datePart = displayTime.split('T')[0];
    } else {
      // Use current date if displayTime is not set
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      datePart = `${year}-${month}-${day}`;
    }

    const hours = String(pickedDuration.hours).padStart(2, '0');
    const minutes = String(pickedDuration.minutes).padStart(2, '0');
    const seconds = String(pickedDuration.seconds).padStart(2, '0');
    setDisplayTime(`${datePart}T${hours}:${minutes}:${seconds}`);
    setPickerVisible(false);
  };

  const timeString = displayTime ? displayTime.split('T')[1] : '';
  const initialHours = parseInt(timeString.split(':')[0] || '0', 10);
  const initialMinutes = parseInt(timeString.split(':')[1] || '0', 10);
  const initialSeconds = parseInt(timeString.split(':')[2] || '0', 10);

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
