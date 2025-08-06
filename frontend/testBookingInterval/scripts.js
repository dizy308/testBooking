const startCalendar = 6
const endCalendar  = 23
createCourtBlockInterval(5,startCalendar,endCalendar);



const selectedSlots = {};

function fetchData(startDateInput, endDateInput){
    const url = `http://127.0.0.1:8000/apipolls/booking/freeslotinterval?start_date=${startDateInput}&end_date=${endDateInput}`
    fetch(url)
    .then(response => {
        if (!response.ok) {
            return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
        }
        document.querySelectorAll('.duration-container').forEach(container => {container.innerHTML = ''})
        Object.keys(selectedSlots).forEach(key => delete selectedSlots[key])
        return response.json();
    })
    .then(data => data.forEach((item,idx) => {
        const booked_slots = item.booked_slots
        const empty_slots = item.free_slots
        const current_court = item.court_id
        const current_dow = item.day_of_week

        const current_court_name = `Court ${current_court}`

        const job1 = () => {
            booked_slots.forEach((elementBooked, idx) => {
            const currentPos = `.hour-bar-block.${current_dow} > .courts-container > #court_num_${current_court} > .duration-container`
            const chosenDOWCourt = document.querySelector(currentPos);

            const start_time = elementBooked.start_time
            const end_time = elementBooked.end_time
            const indexPosition = start_time

            namedPosition = `duration-sub-block ${start_time}-${end_time}`
            const currentHourBlock = document.createElement('div')

            currentHourBlock.className = namedPosition
            
            calculatePx(currentHourBlock, startHour = start_time, endHour = end_time)         
            chosenDOWCourt.appendChild(currentHourBlock)
            
          })}
        
        const job2 = () =>{
            empty_slots.forEach((emptySlot, idx) =>{
                    const chosenCourt_empty = document.querySelector(`.hour-bar-block.${current_dow} > .courts-container > #court_num_${current_court} > .duration-container`)
                    const start_time_empty = emptySlot[0]
                    const end_time_empty = emptySlot[1]
                    
                    namedPositionEmpty = `duration-sub-block-empty ${start_time_empty}-${end_time_empty}`
                    const currentHourBlockEmpty = document.createElement('div')
                    const compositeKey = `${current_dow}-${current_court_name}`;
                    
                    currentHourBlockEmpty.className = namedPositionEmpty
                    calculatePxEmpty(currentHourBlockEmpty,start_time_empty, end_time_empty)

                    currentHourBlockEmpty.addEventListener('click', () => {
                        if (!selectedSlots[compositeKey]) {selectedSlots[compositeKey] = []}
                        
                        // Toggle selected state
                        if (currentHourBlockEmpty.classList.contains('selected-slot')) {
                            currentHourBlockEmpty.classList.remove('selected-slot')
                            
                            clickedPosition = selectedSlots[compositeKey].findIndex(slot => slot.start_time === start_time_empty && slot.end_time === end_time_empty)
                            selectedSlots[compositeKey].splice(clickedPosition)
                        } 
                        else {
                            currentHourBlockEmpty.classList.add('selected-slot')
                            if (dateStart.value <= dateEnd.value){
                                let pushedData = {
                                        start_date: dateStart.value,
                                        end_date: dateEnd.value,
                                        start_time: start_time_empty,
                                        end_time: end_time_empty,
                                        court_id: current_court,
                                        dow: current_dow
                                    }
                                selectedSlots[compositeKey].push(pushedData)
                            }
                            }
                    })
            chosenCourt_empty.appendChild(currentHourBlockEmpty);

        })}
    
        return Promise.all([job1(), job2()])
    }))
}



// -------------------------------------------------------------------------------------------- //
const confirmBooking = document.getElementById('confirm-booking');
const dateStart = document.getElementById('date-filter-start');
const dateEnd = document.getElementById('date-filter-end');

// Function to call your API or update your app
function onDateChange() {
        const startDate = dateStart.value;
        const endDate = dateEnd.value;
        if (startDate && endDate){
            if (new Date(startDate) <= new Date(endDate)){
                fetchData(startDate,endDate)
            }
        }
}

// Add event listeners
dateStart.addEventListener('change', onDateChange);
dateEnd.addEventListener('change', onDateChange);

receivedData = []
confirmBooking.addEventListener('click', () => {
  let receivedData = []

  Object.entries(selectedSlots).forEach(([key,value]) => {
    if (value.length === 0){
        
    }
    else {
      const newValue = mergeAdjacentTimeSlots(value)
      newValue.forEach(item => {
        dataFrag = {
            "booking_start_date": dateStart.value, 
            "booking_end_date": dateEnd.value, 
            "start_time":convertToTime(item.start_time),
            "end_time":convertToTime(item.end_time),
            "dow":item.dow,
            "court":item.court_id}
        
          receivedData.push(dataFrag)
        })
      }
    })

    if(receivedData.length === 0){
      alert('Please book a court')
    }
    else{
        console.log(receivedData)
      
    }
  });




// -------------------------------------------------------------------------------------------- //
function convertToTime(inputTime){
	const hour = parseInt(inputTime);
	const minute = Math.round((inputTime % 1) * 60 ) ;
  
	return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
	}

function createCourtBlockInterval(courtCount, startHour, endHour, dayOfWeek = 7) {
    const hourBars = document.querySelector('#hourBars');
    // Header row (unchanged)
    const header = document.createElement('div');
    const courtNum = document.createElement('div');
    const dowNum = document.createElement('div');

    dowNum.className = `day-of-week`;
    dowNum.textContent = 'DOW';
    header.append(dowNum);
    
    courtNum.className = `court-number`;
    courtNum.textContent = 'COURT NUMBER';
    header.append(courtNum);
    
    header.className = `hour-header`;
    for (let hour = startHour; hour < endHour; hour++) {
        const hourBlock = document.createElement('div');
        hourBlock.textContent = `${String(hour).padStart(2,'0')} - ${String(hour + 1).padStart(2,'0')}`;
        hourBlock.className = 'time-interval';
        header.append(hourBlock);
    }
    hourBars.append(header);

    // ---------------------------------------------------- //
    for (let p = 0; p < dayOfWeek; p++) {
        const dowBlock = document.createElement('div');
        dowBlock.className = `hour-bar-block T${p + 2}`;

        // **Create a single DOW cell that spans all courts**
        const dowNum = document.createElement('div');
        dowNum.className = `dow-number`;
        dowNum.textContent = `T${p + 2}`;

        // **Container for all courts under this DOW**
        const courtsContainer = document.createElement('div');
        courtsContainer.className = 'courts-container';

        for (let i = 1; i <= courtCount; i++) {
            const courtBlock = document.createElement('div');
            courtBlock.className = `court-block`;
            courtBlock.id = `court_num_${i}`;

            // **Court number**
            const courtNum = document.createElement('div');
            courtNum.className = `court-number`;
            courtNum.textContent = `Court ${i}`;

            // **Hour blocks container**
            const hourBlockContainer = document.createElement('div');
            hourBlockContainer.className = 'hour-container';

            // **Duration container (if needed)**
            const durationContainer = document.createElement('div');
            durationContainer.className = `duration-container court_${i}`;

            // **Fill hour blocks**
            for (let hour = startHour; hour < endHour; hour++) {
                const idx = hour - startHour;
                const hourBlock = document.createElement('div');
                hourBlock.className = `hour-sub-block ${idx + 1}`;
                hourBlockContainer.appendChild(hourBlock);
            }

            courtBlock.append(courtNum, hourBlockContainer, durationContainer);
            courtsContainer.appendChild(courtBlock);
        }

        dowBlock.append(dowNum, courtsContainer);
        hourBars.appendChild(dowBlock);
    }
}


function mergeAdjacentTimeSlots(timeSlots) {
    const sortedTimeSlots = timeSlots.sort((a, b) => {
        return a.start_time - b.start_time;
    });
  return sortedTimeSlots.reduce((accumulator, currentValue) => {
  const previousValue = accumulator[accumulator.length - 1];
    
  if (previousValue !== undefined && previousValue.end_time === currentValue.start_time) {
      const mergedSlot = {
        start_time: previousValue.start_time,
        end_time: currentValue.end_time,
        court_id: currentValue.court_id,
        dow: currentValue.dow,
      };
      accumulator.pop();
      return accumulator.concat(mergedSlot);
    } else {
      // Add the current time slot as is
      return accumulator.concat({
        start_time: currentValue.start_time,
        end_time: currentValue.end_time,
        court_id: currentValue.court_id,
        dow: currentValue.dow
      });
    }
  }, []);
}




function calculatePx(chosenObject,startHour, endHour, customerName=""){
    const currentCourt = document.querySelector(".hour-container")
    const pxPerDuration = currentCourt.offsetWidth / (60 * (endCalendar - startCalendar))
    const startWidth = (startHour - startCalendar) * 60 * pxPerDuration + currentCourt.offsetLeft

    const currentDuration = endHour - startHour
    const currentDurationLength = (currentDuration * 60 * pxPerDuration)
    
    Object.assign(chosenObject.style, {
        left: `${startWidth}px`,
        width: `${currentDurationLength}px`,
        backgroundColor: "rgba(255, 95, 31, 0.8)",
    });

    if(currentDuration >= 0.5){
      chosenObject.textContent = customerName
    }
}


function calculatePxEmpty(chosenObject,startHour, endHour){
    const currentCourt = document.querySelector(".hour-container")
    const pxPerDuration = currentCourt.offsetWidth / (60 * (endCalendar - startCalendar))
    const startWidth = (startHour - startCalendar) * 60 * pxPerDuration + currentCourt.offsetLeft

    const currentDuration = endHour - startHour
    const currentDurationLength = (currentDuration * 60 * pxPerDuration)
    
    Object.assign(chosenObject.style, {
        left: `${startWidth}px`,
        width: `${currentDurationLength}px`
    });  
}


