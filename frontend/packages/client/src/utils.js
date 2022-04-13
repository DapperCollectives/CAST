export const parseDateFromServer = (endTime) => {
  const dateTime = new Date(endTime);
  const diffFromNow = dateTime.getTime() - Date.now();
  const diffDays = Math.ceil(Math.abs(diffFromNow) / (1000 * 60 * 60 * 24));
  return {
    date: dateTime,
    diffFromNow,
    diffDays,
  };
};

// returns date & time in one object
export const parseDateToServer = (date, time) => {
  const day = new Date(date);
  const hours = new Date(time);
  day.setHours(hours.getHours());
  day.setMinutes(hours.getMinutes());
  return day;
};

export const checkResponse = async (response) => {
  if (!response.ok) {
    const { status, statusText, url } = response;
    const { error } = response.json ? await response.json() : {};
    throw new Error(
      JSON.stringify({ status, statusText: error || statusText, url })
    );
  }
  return response.json();
};

export const isNotEmptyArray = (array) =>
  Array.isArray(array) && array.length > 0;
