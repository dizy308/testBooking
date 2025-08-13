import * as local_ff from '../common.js'
const startCalendar = 6
const endCalendar  = 23


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

            const start_time = elementBooked.start_time_merged
            const end_time = elementBooked.end_time_merged

            let namedPosition = `duration-sub-block ${start_time}-${end_time}`
            const currentHourBlock = document.createElement('div')

            currentHourBlock.className = namedPosition
            
            local_ff.calculatePx(currentHourBlock, {startHour:start_time, endHour:end_time, startCalendar:startCalendar, endCalendar:endCalendar})  
            chosenDOWCourt.appendChild(currentHourBlock)
            
            currentHourBlock.addEventListener('click', () => {
                const filteredData = booked_slots.filter(slot => slot.start_time_merged === start_time)
                console.log(filteredData)
            })
          })
        }
        
        const job2 = () =>{
            empty_slots.forEach((emptySlot, idx) =>{
                const chosenCourt_empty = document.querySelector(`.hour-bar-block.${current_dow} > .courts-container > #court_num_${current_court} > .duration-container`)
                const start_time_empty = emptySlot[0]
                const end_time_empty = emptySlot[1]
                
                let namedPositionEmpty = `duration-sub-block-empty ${start_time_empty}-${end_time_empty}`
                const currentHourBlockEmpty = document.createElement('div')
                const compositeKey = `${current_dow}-${current_court_name}`;
                
                currentHourBlockEmpty.className = namedPositionEmpty
                local_ff.calculatePx(currentHourBlockEmpty, {startHour: start_time_empty,endHour: end_time_empty,startCalendar: startCalendar,endCalendar: endCalendar}, "empty")

                currentHourBlockEmpty.addEventListener('click', () => {
                    if (!selectedSlots[compositeKey]) {selectedSlots[compositeKey] = []}
                    
                    if (currentHourBlockEmpty.classList.contains('selected-slot')) {
                        currentHourBlockEmpty.classList.remove('selected-slot')
                        
                        let clickedPosition = selectedSlots[compositeKey].findIndex(slot => slot.start_time === start_time_empty && slot.end_time === end_time_empty)
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
const hourBars = document.querySelector('#hourBars');
const dateStart = document.getElementById('date-filter-start');
const dateEnd = document.getElementById('date-filter-end');
const confirmBooking = document.getElementById('confirm-booking');
const inputData = hourBars.querySelector('.input-data');

local_ff.createHeader(hourBars,startCalendar, endCalendar)
createCourtBlockInterval(5,startCalendar,endCalendar);



function onDateChange() {
    const startDate = dateStart.value;
    const endDate = dateEnd.value;
        if (startDate && endDate){
            if (new Date(startDate) <= new Date(endDate)){
                createCourtBlockInterval(5,startCalendar,endCalendar)
                fetchData(startDate,endDate)
            }
        }
}

dateStart.addEventListener('change', onDateChange);
dateEnd.addEventListener('change', onDateChange);

confirmBooking.addEventListener('click', () => {
  let receivedData = []

  Object.entries(selectedSlots).forEach(([key,value]) => {
    if (value.length === 0){
        
    }
    else {
      const newValue = local_ff.mergeAdjacentTimeSlots(value)
      newValue.forEach(item => {
        let dataFrag = {
            "booking_start_date": dateStart.value, 
            "booking_end_date": dateEnd.value, 
            "start_time":local_ff.convertToTime(item.start_time),
            "end_time":local_ff.convertToTime(item.end_time),
            "dow":item.dow,
            "court":item.court_id}
          receivedData.push(dataFrag)
        })
      }
    })

    if (receivedData.length === 0){
      alert('Please book a court')
      fetchData(dateStart.value,dateEnd.value)
    }
    else {
        console.log(receivedData)
        const bookingPromises = sendBookingRequestInterval(receivedData)

        bookingPromises
            .then(() => {
            })
            .catch(error => {
                console.error('Booking failed:', error)
                alert('Some bookings failed. Please try again.')
            })
            .finally(() => {
                fetchData(dateStart.value,dateEnd.value)
            })
    }
  })




// -------------------------------------------------------------------------------------------- //
function createCourtBlockInterval(courtCount, startHour, endHour, dayOfWeek = 7) {
    const existingCalendarSection = document.querySelector('.calendar-section');
    if (existingCalendarSection) {
        existingCalendarSection.remove();
    }


    const calendarSection = document.createElement('div');
    calendarSection.className = `calendar-section`
    // ---------------------------------------------------- //
    let arrDOW = local_ff.calculateDaysBetween(dateStart.value, dateEnd.value)

    arrDOW.forEach(p => {
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
        calendarSection.append(dowBlock)
        hourBars.append(calendarSection);
    }

    ) 
}


function sendBookingRequestInterval(data) {
    return fetch('http://127.0.0.1:8000/apipolls/booking/intervalbooking', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({bookings: data})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        return data;
    });
}


