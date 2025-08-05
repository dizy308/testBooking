const startCalendar = 6
const endCalendar  = 23
createCourtBlockInterval(5,startCalendar,endCalendar);



const selectedSlots = {};

function fetchData(){
    const url = `http://127.0.0.1:8000/apipolls/booking/freeslotinterval?start_date=2025-07-01&end_date=2025-07-31`
    fetch(url)
    .then(response => {
        if (!response.ok) {
            return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
        }
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
            const currentPos = `.hour-bar-block.${current_dow} > .courts-container > #court_num_${current_court}`
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
                const chosenCourt_empty = document.querySelector(`.hour-bar-block.${current_dow} > .courts-container > #court_num_${current_court}`)
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
                            court_id: current_court,
                            dow: current_dow
                        });
                    }

                });
            
            chosenCourt_empty.appendChild(currentHourBlockEmpty);

        })


        }

        return Promise.all([job1(), job2()])
    }))
}

fetchData()





// -------------------------------------------------------------------------------------------- //

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


