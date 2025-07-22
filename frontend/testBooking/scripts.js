const startCalendar = 6
const endCalendar  = 23


createCourtBlock(5,startCalendar,endCalendar);

        
// ------------------------------------------ API DATAs ------------------------------------------ //
const selectedSlots = {};

function fetchDataAPI(input_date){
  const url = `http://127.0.0.1:8000/apipolls/booking/freeslot?date=${input_date}`
  fetch(url)
    .then(response => {
        document.querySelectorAll('.duration-container').forEach(container => {container.innerHTML = ''})
        Object.keys(selectedSlots).forEach(key => delete selectedSlots[key])

        if (!response.ok) {
          return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
        }
        return response.json();
    })
    .then(
        returnedData => returnedData.forEach((item, idx)=>{
        const booked_slots = item.booked_slot
        const empty_slots = item.free_slot
        const current_court = item.court_id

        const current_court_name = `Court ${current_court}`

        const job1 = () => {
          booked_slots.forEach((elementBooked, idx) => {
            const chosenCourt = document.querySelector(`div[class="duration-container court_${current_court}"]`)
            const start_time = elementBooked.start_time
            const end_time = elementBooked.end_time
            const customer_name = elementBooked.customer_id
            const booking_id = elementBooked.booking_id
            const indexPosition = start_time

            namedPosition = `duration-sub-block ${start_time}-${end_time}`
            const currentHourBlock = document.createElement('div')

            currentHourBlock.className = namedPosition
            
            calculatePx(currentHourBlock,customer_name,start_time, end_time)
            
            currentHourBlock.addEventListener('click', () => {
              document.querySelector('.calendar').classList.add('disabled');
              popupBoxModify.dataset.currentBookingID = elementBooked.booking_id;
              
              currentBookingData = elementBooked

              popupBoxModify.classList.add('open-popup')
              modifynameInput.value = customer_name;
              modifystartTimeInput.value = convertToTime(start_time);
              modifyendTimeInput.value = convertToTime(end_time);
              
              currentBookingData['court'] = current_court
              currentBookingData['start_time'] = convertToTime(start_time)
              currentBookingData['end_time'] = convertToTime(end_time)

              delete currentBookingData.customer_id

            })

            chosenCourt.appendChild(currentHourBlock)
            
          })}
        const job2 = () => {
          empty_slots.forEach((emptySlot, idx) =>{
            const chosenCourt_empty = document.querySelector(`div[class="duration-container court_${current_court}"]`)
            const start_time_empty = emptySlot[0]
            const end_time_empty = emptySlot[1]
            
            namedPositionEmpty = `duration-sub-block-empty ${start_time_empty}-${end_time_empty}`
            const currentHourBlockEmpty = document.createElement('div')
            currentHourBlockEmpty.className = namedPositionEmpty

            calculatePxEmpty(currentHourBlockEmpty,start_time_empty, end_time_empty)

            currentHourBlockEmpty.addEventListener('click', () => {
              if (!selectedSlots[current_court_name]) {selectedSlots[current_court_name] = []}
              
              // Toggle selected state
              if (currentHourBlockEmpty.classList.contains('selected-slot')) {
                currentHourBlockEmpty.classList.remove('selected-slot');
                
                clickedPosition = selectedSlots[current_court_name].findIndex(slot => slot.start_time === start_time_empty && slot.end_time === end_time_empty)
                selectedSlots[current_court_name].splice(clickedPosition)

              } else {
                currentHourBlockEmpty.classList.add('selected-slot')
                selectedSlots[current_court_name].push({
                          start_time: start_time_empty,
                          end_time: end_time_empty,
                          court_id: current_court});
                }
            });
            
          chosenCourt_empty.appendChild(currentHourBlockEmpty);

        })}
        return Promise.all([job1(), job2()])
    }))
    .catch(error => {
      return Promise.reject(error);
    });
  }
  
  
// ----------------------------------------------------------------------------------------------------------------------------------------- //
let currentBookingData = null;

const popupBoxBooking = document.querySelector('.popup-box-booking');
const popupBoxModify = document.querySelector('.popup-box-modify');
const confirmBooking = document.getElementById('confirm-booking');
const confirmSchedule = document.querySelector('#confirm-schedule')
const cancelSchedule = document.querySelector('#cancel-schedule')
const deleteButton = document.querySelector('.delete-button')
const modifyButton = document.querySelector('.modify-button')
const closePopup = document.querySelector('.close-icon')

const nameInput = document.querySelector("#fname")
const modifynameInput = document.querySelector("#modifyname")
const modifystartTimeInput = document.querySelector("#modifystarttime")
const modifyendTimeInput = document.querySelector("#modifyendtime")
const dateFilter = document.getElementById('date-filter');

dateFilter.addEventListener('change', (e) => {
  fetchDataAPI(e.target.value);
  });

let receivedData = []
confirmBooking.addEventListener('click', () => {
  receivedData = []

  Object.entries(selectedSlots).forEach(([key,value]) => {
    if (value.length === 0){}
    else {
      const newValue = mergeAdjacentTimeSlots(value)
      newValue.forEach(item => {
        dataFrag = {"booking_date": dateFilter.value, 
          "start_time":convertToTime(item.start_time),
          "end_time":convertToTime(item.end_time),
          "court":item.court_id}
          receivedData.push(dataFrag)
        })
      }
    })

    if(receivedData.length === 0){
      alert('Please book a court')
    }
    else{
      popupBoxBooking.classList.add('open-popup');
      document.querySelector('.calendar').classList.add('disabled');
      
    }
  });
  
confirmSchedule.addEventListener('click', ()=> {
    let currentDate = dateFilter.value
    popupBoxBooking.classList.remove('open-popup')
    document.querySelector('.calendar').classList.remove('disabled');
    
    let postData = []
    receivedData.forEach(item => {
      if (nameInput.value === ""){
        Object.assign(item, {'customer_num':"STAFF"})
      }
      else{
        Object.assign(item, {'customer_num':nameInput.value})
      }
      postData.push(item)
    })
    
    const bookingPromises = postData.map(item => sendBookingRequest(item));

    Promise.all(bookingPromises)
    .then(() => {
      fetchDataAPI(currentDate)
    })
    .catch(error => {
      console.error('Booking failed:', error);
      alert('Some bookings failed. Please try again.');
    });
    
  })
  
cancelSchedule.addEventListener('click', () => closeModal(popupBoxBooking));
closePopup.addEventListener('click', () => closeModal(popupBoxModify));


deleteButton.addEventListener('click', () => {
  const bookingId = popupBoxModify.dataset.currentBookingID;
  let currentDate = dateFilter.value

  deleteBookingRequest(bookingId)
  .then(response => {
    if (response.ok) {
      closeModal(popupBoxModify);
      return fetchDataAPI(currentDate);
    } else {
      alert('Failed to delete booking.');
    }
  })
  .catch(error => {
    alert('Error deleting booking: ' + error);
  });

})

modifyButton.addEventListener('click', ()=>{
  let currentDate = dateFilter.value

  if (modifynameInput.value === '' && modifystartTimeInput.value === '' && modifyendTimeInput.value === ''){
    currentBookingData['customer_num'] = 'STAFF'
  }
  else{
    currentBookingData['customer_num'] = modifynameInput.value
    currentBookingData['start_time'] = modifystartTimeInput.value
    currentBookingData['end_time'] = modifyendTimeInput.value
  }
  currentBookingData['booking_date'] = currentDate

  updateBookingRequest(currentBookingData)
  .then(response => {

    closeModal(popupBoxModify);
    return fetchDataAPI(currentDate);
  })
  .catch(error => {
    console.error("Update error:", error);
    alert('Error updating booking: ' + error.message);
  });

})



// ----------------------------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------------------------------------- //
function convertToTime(inputTime){
	const hour = parseInt(inputTime);
	const minute = Math.round((inputTime % 1) * 60 ) ;
  
	return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
	}

function createCourtBlock(courtCount, startHour, endHour){
    const hourBars = document.querySelector('#hourBars');
    for (let i = 0; i <= courtCount; i++){
    const courtBlock = document.createElement('div')
    courtBlock.className = `court-block`

    if (i === 0){
        const courtNum = document.createElement('div')
        courtNum.className = `court-number`
        courtNum.textContent = 'COURT NUMBER'
        courtBlock.append(courtNum)

        for (let hour = startHour; hour < endHour; hour++) {
        const hourBlock = document.createElement('div');
        hourBlock.textContent = `${String(hour).padStart(2,'0')} - ${String(hour + 1).padStart(2,'0')}`
        hourBlock.className = 'time-interval'
        courtBlock.append(hourBlock);
        }
    }
    else{
        courtBlock.id = `court_num_${i}`

        const hourBlockContainer = document.createElement('div')
        const durationContainer = document.createElement('div')
        const courtNum = document.createElement('div')

        hourBlockContainer.className = 'hour-container'
        durationContainer.className = `duration-container court_${i}`
        courtNum.className = `court-number`
        courtNum.textContent = `Court ${i}`

        courtBlock.append(courtNum, hourBlockContainer, durationContainer)

        for (let hour = startHour; hour < endHour; hour++) {
            const idx = hour - startHour  
            const hourBlock = document.createElement('div');
            hourBlock.className = `hour-sub-block ${idx +1}`;
            hourBlockContainer.appendChild(hourBlock)}    
        }

        hourBars.appendChild(courtBlock)}
}


function calculatePx(chosenObject, customerName,startHour, endHour){
    const currentCourt = document.querySelector(".hour-container")
    const pxPerDuration = currentCourt.offsetWidth / (60 * (endCalendar - startCalendar))
    const startWidth = (startHour - startCalendar) * 60 * pxPerDuration + currentCourt.offsetLeft

    const currentDuration = endHour - startHour
    const currentDurationLength = (currentDuration * 60 * pxPerDuration)
    
    Object.assign(chosenObject.style, {
        left: `${startWidth}px`,
        width: `${currentDurationLength}px`,
        backgroundColor: "#00cf77",
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

function isOverlapping(booking1, booking2) {
    const result = Number(booking1.start_time) < Number(booking2.end_time) 
                  && Number(booking2.start_time) < Number(booking1.end_time)
                
    return result;
}


function mergeAdjacentTimeSlots(timeSlots) {
  const sortedTimeSlots = timeSlots.sort((a, b) => a.start_time - b.start_time);
  return sortedTimeSlots.reduce((accumulator, currentValue) => {
  const previousValue = accumulator[accumulator.length - 1];
    
  if (previousValue !== undefined && previousValue.end_time === currentValue.start_time) {
      const mergedSlot = {
        start_time: previousValue.start_time,
        end_time: currentValue.end_time,
        court_id: currentValue.court_id
      };
      accumulator.pop();
      return accumulator.concat(mergedSlot);
    } else {
      // Add the current time slot as is
      return accumulator.concat({
        start_time: currentValue.start_time,
        end_time: currentValue.end_time,
        court_id: currentValue.court_id
      });
    }
  }, []);
}


function sendBookingRequest(data) {
    return fetch('http://127.0.0.1:8000/apipolls/booking/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
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


function deleteBookingRequest(booking_id) {
    return fetch(`http://127.0.0.1:8000/apipolls/booking/update/${booking_id}`, {
        method: 'delete',
        headers: {'Content-Type': 'application/json'},
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    })
    .then(data => {
        return data;
    });
}

function updateBookingRequest(data) {
    return fetch(`http://127.0.0.1:8000/apipolls/booking/update/${data.booking_id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0') {
            return { status: response.status };
        }
        return response.json().catch(() => ({ status: response.status }));
    });
}

function closeModal(modalElement) {
  modalElement.classList.remove('open-popup');
  document.querySelector('.calendar').classList.remove('disabled');
}

// ----------------------------------------------------------------------------------------------------------------------------------------- //
