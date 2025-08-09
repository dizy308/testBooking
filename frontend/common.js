export function convertToTime(inputTime){
	const hour = parseInt(inputTime);
	const minute = Math.round((inputTime % 1) * 60 ) ;
  
	return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
	}


export function mergeAdjacentTimeSlots(timeSlots) {
    const sortedTimeSlots = timeSlots.sort((a, b) => a.start_time - b.start_time);
    return sortedTimeSlots.reduce((accumulator, currentValue) => {
    const previousValue = accumulator[accumulator.length - 1];
    
    if (previousValue !== undefined && previousValue.end_time === currentValue.start_time) {
      const mergedSlot = {
        start_time: previousValue.start_time,
        end_time: currentValue.end_time,
        court_id: currentValue.court_id,
        dow: currentValue.dow
    }
    accumulator.pop();
    return accumulator.concat(mergedSlot)} 
    else {
    return accumulator.concat({
        start_time: currentValue.start_time,
        end_time: currentValue.end_time,
        court_id: currentValue.court_id,
        dow: currentValue.dow
      })
    }}, [])
}


export function calculatePx(chosenObject,startHour, endHour, calculateType=""){
    const currentCourt = document.querySelector(".hour-container")
    const pxPerDuration = currentCourt.offsetWidth / (60 * (endCalendar - startCalendar))
    const startWidth = (startHour - startCalendar) * 60 * pxPerDuration + currentCourt.offsetLeft

    const currentDuration = endHour - startHour
    const currentDurationLength = (currentDuration * 60 * pxPerDuration)

    if (calculateType === 'empty'){
        Object.assign(chosenObject.style, {
            left: `${startWidth}px`,
            width: `${currentDurationLength}px`
        });  
    }
    else{
        Object.assign(chosenObject.style, {
            left: `${startWidth}px`,
            width: `${currentDurationLength}px`,
            backgroundColor: "rgba(255, 95, 31, 0.8)",
        })
    }
}



export function calculateDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) return [];

  const totalDays = Math.floor((end - start) / 86400000) + 1;
  if (totalDays > 7) return [0, 1, 2, 3, 4, 5, 6];

  const days = [];
  const current = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    const day = (current.getDay() + 6) % 7;
    if (!days.includes(day)){
        days.push(day)
    }
    current.setDate(current.getDate() + 1);
  }
  return days.sort();
}