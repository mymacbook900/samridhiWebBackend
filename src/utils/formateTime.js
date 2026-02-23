const formatTime = time =>
  new Date(`1970-01-01T${time}:00`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
  export default formatTime;